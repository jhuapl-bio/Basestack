import { bytesToSize } from "../controllers/configurations.js";

const cloneDeep = require("lodash.clonedeep");

/*
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - # 
   - # All Rights Reserved. 
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const path = require("path")    
var  { store }  = require("../../config/store/index.js")
const { readFile, checkExists,  removeFile, downloadSource, decompress_file, itemType  } = require("../controllers/IO.js")
const { remove_images, removeVolume, checkVolumeExists, pullImage, loadImage, createVolumes, removeDep } = require("../controllers/post-installation.js")
const {  check_image, fetch_external_dockers } = require("../controllers/fetch.js")
const { Service }  = require("./service.js") 
const { spawnLog } = require("../controllers/logger.js")
 
var logger = store.logger
// var docker = new Docker();   
const fs = require("file-system")     
let dockerObj;      
   
export class Procedure { 
	constructor(procedure){
		this.name = procedure.name    
        this.type = 'procedure' 
        this.config = procedure  
        this.deployment = procedure.deployment ? procedure.deployment : "native"
        this.baseConfig = procedure
        this.lastJob = null
        const $this = this
        Object.defineProperty(this, "spaceUsedTotal", {
            enumerable: true,   
            get: function(){
                let sum = 0
                var sizes = {
                    "Bytes": 1,
                    "TB": 1024**4,
                    "GB": 1024**3,
                    "MB": 1024**2,
                    "KB": 1024
                }
                
                this.dependencies.forEach((f)=>{
                    let size = f.status && f.status.size ? f.status.size : "0 Bytes"
                    let denom = size.split(" ")
                    if (denom.length >1){
                        let denom_char = denom[1]
                        size = sizes[denom_char]*parseInt(denom[0])
                    } 
                    sum += size 
                })
                return bytesToSize(sum)
            }
        })

        
          
        this.i =0
        this.dependencies  = cloneDeep(procedure.dependencies).map((d)=>{ 
            d.streamObj = null
            
            if (d.type == 'docker' || d.type == 'docker-local'){
                if (d.version){
                    d.fulltarget = `${d.target}:${d.version}`
                } else {
                    d.fulltarget = d.target
                }
            }
            let status = { 
                downloading: false, 
                decompressing: false, 
                dependComplete: true,
                exists: false, 
                error: null, 
                stream: null,
                fully_installed: false,
                partial_install: false
            }
            d.status= status
            return d
        })
        this.buildStream = [],
        
        this.services_config = cloneDeep(procedure.services)
        this.service_steps = {}  
		this.container = null; 
		this.cmd = null; 
		this.options = {};  
        this.services = []; 
		this.streamObj = null;
        this.orchestrator = null; 
        this.status = {
            error: null,  
            stream: null, 
            buildStream: [],
            running: false,
            building: false,
            fully_installed: false, 
            partial_install: false
        } 

        this.interval = {
            checking: false, 
            interval: this.create_interval() 
        } 
        this.services_config.forEach((service)=>{
            this.service_steps[service] = false
        }) 
        
        this.checkDependenciesVersion()
        
        

	}  
    async init(){ 
        this.dependencyCheck()
        await this.initServices()
        return  
    }
    async defineDependencies(){
        const $this = this; 
        this.dependencies = [] 
       
    }
    async initServices(token){
        this.services_config.forEach((service, i)=>{
            let service_obj = new Service(service)
            service_obj.setOptions()
            
            this.services.push(service_obj)
        })
        return
    }



    async create_interval (){ 
        const $this = this
        let i = 0
        let interval = setInterval(()=>{
            if (!$this.interval.checking){
                $this.interval.checking = true
                $this.statusCheck().then((state)=>{
                    $this.interval.checking = false
                }).catch((err)=>{
                    logger.error("%s err in status check interval for %s",err, $this.name)
                    $this.interval.checking = false
                })
            }
        }, 1500)


        return interval

    }
    async define_services(){
        let promises = []
        this.services = {};
        const $this = this
        this.services_config.forEach((service)=>{
            if (service in store.services){
                $this.services[service] = store.services[service] 
            }
        })
        console.log("Define services")

        let services = {}
        for( let [key, service] of Object.entries(this.services)){
            services[key] = {
                variables: service.config.variables
            } 

        }
        if ($this.config.init){
            $this.start(services)
        }
  
        return
    }
    async checkDependenciesVersion(){
        const $this = this;
        return new Promise(function(resolve,reject){
            let dependencies = $this.dependencies
            dependencies.forEach((dependency)=>{
                if (dependency.type == 'docker'){
                    fetch_external_dockers(dependency.target).then((response)=>{
                        if ( response){  
                            dependency.status.latest = response.latest_digest
                        } else {
                            dependency.status.latest  = null
                        } 
                    }).catch((err)=>{
                        store.logger.error(err)
                    })
                }
            })
           
        })
    }
    async dependencyCheck(){ 
		const $this = this; 
        let dependencies = this.dependencies 
		return new Promise(function(resolve,reject){ 
			let promises = [] 
            let building=false   
			dependencies.forEach((dependency, index)=>{ 
				if (dependency.type == "docker"){
                    let target = dependency.fulltarget
					promises.push(check_image(target))
                     
				} else if (dependency.type == "docker-local"){ 
                    let target = dependency.fulltarget
					promises.push(check_image(target))
				} else if (dependency.type == 'volume'){
                    promises.push(checkVolumeExists(dependency.target))
                }
                else { 
                    promises.push(checkExists(dependency.target)) 
                }
                if (dependency.streamObj && dependency.streamObj.status){
                    dependency.status.progress = cloneDeep(dependency.streamObj.status)
                }
			}) 
			Promise.allSettled(promises).then((response, err)=>{
                let v = []    
                let uninstalled = []  
                let logs = [] 
                
				response.forEach((dependency, index)=>{
					if (dependency.status == 'fulfilled'){
                        if (dependency.value.version){
                            
                            dependencies[index].status.version = dependency.value.version
                            dependencies[index].status.exists = true
                        } else {
                            dependencies[index].status.exists = ( dependency.value && typeof dependency.value == 'object'  ? true : dependency.value )
                        }
                        if (dependency.value.size){
                            dependencies[index].status.size = dependency.value.size
                        }
						
					} else { 
						dependencies[index].status.exists = false
						dependencies[index].status.version = null
                        dependencies[index].status.size = 0
					}
                    
                    if (dependencies[index].status && dependencies[index].status.stream && Array.isArray(dependencies[index].status.stream.info)){
                            
                        logs.push(...dependencies[index].status.stream.info)
                    } 
                    
                    if (dependencies[index].status.building){
                        building = true
                    }
                    if (dependencies[index].depends){
                        let dependComplete = response.filter((f,i)=>{
                            if (dependencies[index].depends.indexOf(i) > -1){
                                return true
                            } else {
                                return false
                            }
                        }).every((f)=>{
                            return f.value
                        })
                        dependencies[index].status.dependComplete = dependComplete
                    }
                    v.push(dependency.value)
				})
                $this.status.buildStream = logs
                $this.status.building = building
                let fully_installed = v.every((dependency)=>{
                    return dependency
                })
                let exists_any = $this.dependencies.some((dependency)=>{
                    
                    if (dependency && dependency.status){
                        return dependency.status.exists
                    } else {
                        return false
                    } 
                })
                
                let exists_all = $this.dependencies.every((dependency)=>{
                    if (dependency && dependency.status){
                        return dependency.status.exists
                    } else {
                        return false
                    }
                })
               
                $this.status.fully_installed = exists_all
                $this.status.partial_install = exists_any
                // $this.status.fully_installed = fully_installed
				resolve()
			}).catch((err)=>{
				store.logger.error(`${err} Error in checking target dependencies`)
                reject(err)
				// reject(`${err} ${$this.name} Error in checking target dependencies`)
			})
			
		}) 
	} 
    async define(){
		const $this = this
        let service = this.services
        try{
            await this.define_services()
          
            return
        } catch (err){
            logger.error(`%o error inerror in initializing service ${this.name}`, err)
            throw err 
        }
        //Check if all dependencies are installed, if not return false

	}
    async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
            $this.dependencyCheck().then((dependencies)=>{
                $this.services.forEach((service)=>{
                    if (service.env){
                        if (typeof service.Config == 'object' ){
                            $this.lastJob = {  ...service.Config    } 
                        }
                    }
                    
                })
                resolve()
            }).catch((err)=>{
                store.logger.error("%o error in dependency check for procedure %s", err, $this.name)
            })
        }) 
	}

   
    async loadImage(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){  
            if (dependency.streamObj){
                dependency.streamObj.destroy()
            }

            loadImage(dependency.source.target).then((stream, error)=>{ 
                dependency.status.downloading = true 
                dependency.status.building = true
                dependency.status.error = null 
                dependency.status.stream = spawnLog(stream, $this.logger)
                   
                dependency.streamObj = stream     
                $this.buildlog = spawnLog(stream, $this.logger) 
                stream.on("close", (err, data)=>{
                    dependency.status.downloading = false
                    dependency.status.building = false
                }) 
                resolve()   
            }).catch((err)=>{
                store.logger.error("%s %o %o","Error in pulling docker image for: ", dependency , err)
                dependency.status.downloading = false
                dependency.status.building = false
                dependency.status.error = err
                reject(err)
            }) 
        }) 
    }
	async pullImage(dependency){
		const $this = this   
        return new Promise(function(resolve,reject){ 
            if (dependency.streamObj){ 
                try{ 
                    
                    store.logger.info("Closing since it already exists as a stream obj %o", dependency.target)
                    dependency.streamObj.destroy()
                    // dependency.streamObj.close()
                    // dependency.streamObj.end()  
                    dependency.status.downloading = false
                    dependency.status.building = false
                } catch(err){ 
                    store.logger.error("error in destorying streamobj %o", err)
                }
            }
            let target = dependency.target
            if (dependency.version){
                target = `${dependency.target}:${dependency.version}`
            }
            pullImage(target, dependency).then((stream, error)=>{
                dependency.status.building = true
                dependency.status.downloading = true
                dependency.status.error = null
                $this.log  = spawnLog(stream, $this.logger)
                dependency.status.stream = $this.log
                dependency.streamObj = stream 
                $this.buildlog = spawnLog(stream, $this.logger)
                stream.on("close", (err, data)=>{
                    console.log("closed....")
                    dependency.status.downloading = false
                    dependency.status.building = false
                })
                stream.on("end", (err, data)=>{
                    console.log("ended...")
                    dependency.status.downloading = false
                    dependency.status.building = false
                })
                resolve()   
            }).catch((err)=>{  
                store.logger.error("%s %s %o","Error in pulling docker image for: ", dependency.target , err)
                dependency.status.downloading = false
                dependency.status.building = false 
                dependency.status.error = err  
                reject(err)  
            })   
        })
    }     
    async orchestrateDownload(dependency){   
		const $this = this       
        return new Promise(function(resolve,reject){  
             
            if (dependency.streamObj){
                store.logger.info("Closing since it already exists as a stream obj for orchestration %o", dependency.target)
                try{
                    dependency.status.downloading = false
                    dependency.status.building = false
                    dependency.streamObj.destroy()
                } catch(err){    
                    store.logger.error(err) 
                }        
            }    
            let service = new Service(    
                cloneDeep(dependency.service), 
                null,     
                true 
            ) 
            if (dependency.workingdir){
                service.config.workingdir = dependency.workingdir
            } 
            if (dependency.bind){  
                if (!service.config.bind){
                    service.config.bind = []
                }
                service.config.bind.push(dependency.bind)
            }  
            if (dependency.command){
                if (Array.isArray(dependency.command)){
                    service.config.command = dependency.command
                }else { 
                    service.config.command = [dependency.command] 
                }
            }
            dependency.status.building = true
            dependency.status.downloading = true
            dependency.status.error = null
              
            service.setOptions().then((f)=>{
                service.check_then_start({}, null).catch((err)=>{
                    store.logger.error(err) 
                    dependency.status.building = false
                    dependency.status.downloading= false
                    dependency.status.error = err 
                }).then((stream)=>{ 
                    if (service && service.stream){
                        dependency.streamObj = service.stream
                        let log = spawnLog(service.stream, $this.logger)
                        dependency.status.stream =  log
                        try{
                            dependency.streamObj.on("end", (response)=>{
                                dependency.status.building = false
                                dependency.status.downloading= false
                                dependency.status.error = null
                            })
                        } catch(err){
                            store.logger.error(err)
                        }
                    }
                    
                }).catch((err)=>{
                    store.logger.error(err)
                    dependency.status.building = false
                    dependency.status.downloading= false
                    dependency.status.error = err 
                })   
            }).catch((err)=>{  
                store.logger.error(err) 
                dependency.status.building = false
                dependency.status.downloading= false
                dependency.status.error = err 
            })
            resolve()             
        })
    } 
    downloadSource(dependency, overwrite){   
		const $this = this  
        return new Promise(function(resolve,reject){ 
            checkExists(dependency.source.target).then((exists)=>{
                if (!exists.exists || exists && overwrite){  
                    if (dependency.streamObj){
                        dependency.streamObj.close() 
                        dependency.streamObj.end()
                    } 
                    downloadSource(dependency.source.url, dependency.source.target, dependency.source ).then((stream, error)=>{
                        // dependency.status.stream = spawnLog(stream, $this.logger)
                        dependency.streamObj = stream 
                        if (error){      
                            store.logger.error(`ERROR ${error}`)
                            reject(error) 
                        }       
                         
                        // $this.buildlog = spawnLog(stream, $this.logger)
                        stream.on("close", ()=>{ 
                            // store.logger.info("Completed download of %o", dependency.source)
                             
                            dependency.status.building = false
                            dependency.status.error = null 
                            dependency.status.downloading= false
                            resolve()
                        }).on("error", (err)=>{
                            store.logger.error(`Error in stream ${err}`)
                            dependency.status.error = err 
                            reject(err)
                        })
                    }).catch((err)=>{
                        store.logger.error("%o %o","Error in downloading source: ", dependency.source , err)
                        dependency.status.building = false
                        dependency.status.error = err 
                        dependency.status.downloading= false
                        reject(err)
                    }) 
                } else{
                    store.logger.info(`Skipping dependency install: ${dependency.source.target} due to it existing`) 
                    dependency.status.building = false
                    dependency.status.downloading= false
                    resolve()
                }  
            }) 
               
        })
    }
	async buildImage(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){ 
            if (dependency.streamObj){ 
                dependency.streamObj.destroy()   
            } 
            fs.stat(dependency.build.path, (err, stat)=>{
                console.log(err, stat)
                if (err){
                    store.logger.error("Could not build from Dockerfile %s %o", dependency.build.path, err)
                    reject(err)
                } else {
                    let conf = {  
                        context: path.dirname(dependency.build.path),
                        src: [dependency.build.file], 
                        AttachStdout: true, 
                        AttachStderr: true, 
                        Tty:false
                    }
                    try{
                        store.docker.buildImage(conf,
                        {
                            t: dependency.target
                        }, (err, stream)=>{
                            if (err){  
                                store.logger.error("%s %s %o","Error in building docker image for: ", dependency.target , err)
                                dependency.status.downloading = false
                                dependency.status.building = false
                                dependency.status.error = err
                                reject(err)
                            }
                            dependency.status.downloading = true
                            dependency.status.building = true
                            
                            dependency.status.stream  = spawnLog(stream, $this.logger)
                            dependency.streamObj = stream
                            stream.on("close", (err, data)=>{
                                dependency.status.downloading = false  
                                dependency.status.building = false
                                if (err){
                                    dependency.status.error = err
                                }
                            }) 
        
                            $this.buildlog = spawnLog(stream,store.logger)   
                            resolve()  
                        
                        }) 
                    } catch(err){        
                        store.logger.info("Error in build image")
                        store.logger.error(err)
                        reject(err)    
                    }
                }
                
            })
			
        })
    }   
	
 
    async cancel_build(dependencyIdx){  
        const $this = this; 
        return new Promise(function(resolve,reject){ 
            try{
                let promises = []
                let selectedDep = []
                if (!dependencyIdx){
                    selectedDep = $this.dependencies
                } else {
                    selectedDep  = [ $this.dependencies[dependencyIdx] ]
                }
                selectedDep.map((dependency)=>{
                    let status = dependency.status; 
                    if (dependency.streamObj){
                        // promises.push(dependency.streamObj.close())
                        if(dependency.type == 'docker'){
                            // promises.push(dependency.streamObj.destroy())
                            dependency.streamObj.destroy()
                            // promises.push(dependency.streamObj.destroy())
                        } else if(dependency.type == 'orchestration'){
                            dependency.streamObj.end() 
                            dependency.status.downloading = false
                            dependency.status.building = false
                            dependency.streamObj.destroy() 
                            // dependency.streamObj.remove({force:true})
                        } else{
                            // promises.push(dependency.streamObj.end())
                            dependency.streamObj.close()

                            dependency.streamObj.end()
                            dependency.streamObj.destroy()
                        }
                    } else { 
                        // promises.push(new Promise((resolve, reject)=>{ resolve(`Skipping removal due to it not running`) }))
                        store.logger.info("Skipping removal due to it not running")
                    }
                    // Promise.allSettled(promises).then((resp)=>{
                    //     resolve(resp)
                    // })
                    resolve()
                })
            } catch(err){
                store.logger.error("%s error in cancelling build",  err)
                reject(err)
            }
        });
    }
	async build( overwrite, params){
		const $this = this;
        let promises = []
        let objs = [] 
        let dependencies = this.dependencies
        this.status.building = true
        if (params || params == 0){
            dependencies = [dependencies[params]]
        }
        try{
            dependencies.forEach((dependency_obj, i)=>{ 
                dependency_obj.status.downloading = true
                dependency_obj.status.building = true
                objs.push(dependency_obj) 
                let overwrite_idx = false
                if (!overwrite){
                    if (dependency_obj.overwrite){  
                        overwrite_idx = true
                    }
                }   else {
                    overwrite_idx = true
                } 
                if (Array.isArray(overwrite) && overwrite[i]){ 
                    overwrite_idx = overwrite[i]
                }
                if (dependency_obj.type == 'docker' && !dependency_obj.build && !dependency_obj.local ){
                    
                    promises.push($this.pullImage(dependency_obj))
                }   else if (dependency_obj.type == 'docker-local' && dependency_obj.build ){
                    promises.push($this.buildImage(dependency_obj))
                }   else if (dependency_obj.type == 'volume'){
                    promises.push(createVolumes([dependency_obj.target]).then((f)=>{
                        dependency_obj.status.building = false
                    }).catch((err)=>{
                        dependency_obj.status.building = false
                        dependency_obj.status.error = err
                    }))
                }   else if (dependency_obj.type == 'docker' && dependency_obj.local  ){
                    promises.push($this.loadImage(dependency_obj))
                } else if (dependency_obj.type == 'orchestration'  ){
                    promises.push($this.orchestrateDownload(dependency_obj).catch((err)=>{
                        store.logger.error("Error in downloading source url: %o", err);
                        dependency_obj.status.downloading = false

                    }))
                } else {
                    promises.push($this.downloadSource(dependency_obj, overwrite_idx).then((response)=>{
                        dependency_obj.status.downloading = false  
                        store.logger.info(`______Item download: ${dependency_obj.source.target}`)
                        checkExists(dependency_obj.source.target).then((exists)=>{
                            if (dependency_obj.decompress){ 
                                store.logger.info("Decompressing required, doing so now for final target... %s", dependency_obj.target)
                                checkExists(dependency_obj.target).then((exists)=>{
                                    if (!exists.exists || exists && overwrite_idx || exists && dependency_obj.decompress.overwrite_idx){
                                        dependency_obj.status.building = true
                                        
                                        decompress_file(dependency_obj.decompress.source, path.dirname(dependency_obj.target)).then(()=>{
                                            dependency_obj.status.building = false
                                        }).catch((err) =>{
                                            store.logger.error("Error in decompressing file: %o %o", dependency_obj.source, err)
                                            dependency_obj.status.building = false
                                        } )                                       
                                    } else {
                                        store.logger.info(`Skipping dependency decompression: ${dependency_obj.target} due to it existing`)
                                         dependency_obj.status.building = false
                                        
                                    }
                                })
                            } 
                        })
                    }).catch((err)=>{ 
                        store.logger.error("Error in downloading source url: %o", err);
                        dependency_obj.status.downloading = false
                        dependency_obj.status.error = err
                    }) ) 
                } 
                Promise.allSettled(promises).then((res)=>{
                    store.logger.info("Finished building module")
                }).catch((err)=>{
                    store.logger.error("error in building process: %o", err)
                    dependency_obj.status.building = false
                })
            })
            
        } catch(err){
            this.status.errors = err
            console.error("EDD")
            throw err 
        } finally {
            // $this.dependencies.forEach((dependency, index)=>{
            //     $this.dependencies[index].status.building = false
            // })
        }
        return `Building dependencies for module:  ${$this.name} ${dependencies}`
	} 
    async remove ( dependencyIdx ){
		const $this = this; 
        let promises = [] 
        let objs = [] 
        let selectedDep = []
        if (!dependencyIdx && dependencyIdx != 0){
            selectedDep = $this.dependencies
        } else {
            selectedDep  = [ $this.dependencies[dependencyIdx] ]
        }
        selectedDep.map((dependency_obj, i)=>{            
            // dependency_obj.status.downloading = true
            objs.push(dependency_obj) 
            promises.push(removeDep(dependency_obj))
            
        })
        let settled_data = await Promise.allSettled(promises)
        let messages = []
        let error = false
        settled_data.forEach((settled, i)=>{
            let obj = objs[i] 
            if (settled.status == 'fulfilled'){
                messages.push(
                    `Removed dependency ${settled.value}`
                )
            } else {
                messages.push(
                    `Error in removal of dependency: ${settled.reason}`
                )
                error = true
            }
        })
        if (error){
            throw(messages)
        } else{
            return messages
        }
	} 
    // updateVariables(variables){
    //     try{
    //         // let services_objs = this.services
    //         let configVariables = cloneDeep(this.config.services)
            
    //         let parsed_variables = cloneDeep(this.config.services)
    //         .map((d)=>{
    //             if (d && d.variables){
    //                 return d.variables
    //             } else { 
    //                 return {}
    //             }
    //         }) 
    //         variables.forEach((variable, i)=>{
    //             for (let [key, value] of Object.entries(variable)){
    //                 if (value.source && value.source !== '' && parsed_variables[i][key]){
    //                     parsed_variables[i][key].source = value.source
    //                 }
    //                 if ((value.option || value.option == 0) && parsed_variables[i][key]){
    //                     parsed_variables[i][key].option = value.option
    //                 }  
    //             }
                    
    //         })
    //         let linking = this.config.linking
            
    //         return  parsed_variables
    //     } catch (err){
    //         logger.error(err)
    //         throw err
    //     }

    // }
    





}