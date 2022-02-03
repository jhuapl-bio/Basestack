import e from 'express';
import { resolve } from 'path';
const cloneDeep = require("lodash.clonedeep");

/*
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - # 
   - # All Rights Reserved. 
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var Docker = require('dockerode');   
const path = require("path")    
var  { store }  = require("../../config/store/index.js")
const { readFile, checkExists, removeFile, downloadSource, decompress_file  } = require("../controllers/IO.js")
const { remove_images, pullImage, loadImage } = require("../controllers/post-installation.js")
const { list_module_statuses }  = require("../controllers/watcher.js")
const { check_container, getExternalSource, check_image, fetch_external_dockers } = require("../controllers/fetch.js")
const { Service }  = require("./service.js") 
const { spawnLog, createLoggingObject } = require("../controllers/logger.js")

var logger = store.logger
// var docker = new Docker();   
const fs = require("file-system")    
let dockerObj;   
  
export class Procedure { 
	constructor(procedure){
		this.name = procedure.name  
        this.type = 'procedure'
        this.config = procedure  
        this.dependencies  = cloneDeep(procedure.dependencies).map((d)=>{ 
            d.streamObj = null
            // this.fetchVersion(d) 
            let status = { 
                downloading: false, 
                decompressing: false, 
                exists: false, 
                error: null, 
                stream: null,
                fully_installed: false,
                partial_install: false
            }
            d.status= status
            return d
        })
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
            running: false,
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

	}
    async init(){
        // await this.defineDependencies()
        this.dependencyCheck()
        await this.initServices()
        return 
    }
    async defineDependencies(){
        const $this = this;
        this.dependencies = [] 
        // if (this.config.dependencies){
        //     this.config.dependencies.forEach((dependency)=>{
                
        //     })
        // }
    }
    async initServices(){
        this.services_config.forEach((service)=>{
            let service_obj = new Service(service)
            service_obj.setOptions()
            this.services.push(service_obj)
        })
        return
    }



    async create_interval (){
        const $this = this
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
        }, 3500)


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
    async dependencyCheck(){ 
		const $this = this; 
        let dependencies = this.dependencies 
		return new Promise(function(resolve,reject){
			let promises = []
			dependencies.forEach((dependency, index)=>{ 
				if (dependency.type == "docker"){
					promises.push(check_image(dependency.target))
                    
				} else if (dependency.type == "docker-local"){
					promises.push(check_image(dependency.target))
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
				response.forEach((dependency, index)=>{
					if (dependency.status == 'fulfilled'){
						dependencies[index].status.exists = dependency.value
                        
						dependencies[index].status.version = dependency.value.version
					} else {
						dependencies[index].status.exists = false
						dependencies[index].status.version = null
					}
                    v.push(dependency.value)
				})
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
				reject(`${err} ${$this.name} Error in checking target dependencies`)
			})
			
		}) 
	} 
    async define(){
		const $this = this
        let service = this.services
        try{
            await this.define_services()
            // await $this.dependencyCheck()
            // let complete = $this.service.dependencies.every((dependency)=>{
            //     return dependency.status
            // })
            // $this.service.status = {
            //     running: false,
            //     errors: null,
            //     stream: []
            // }
            // await $this.setOptions()
            // $this.updateConfig()
            // if ($this.service.force_init){
            //     await $this.stop()
            // }

            // let state = await $this.statusCheck()
            // if (state.running){
            //     let err, stream = await state.container.logs({follow: true, stdout:true, stderr:true})
            //     $this.log = spawnLog(stream, $this.logger)
            //     $this.service.status.stream = $this.log
            // }
            // if ($this.service.init){
            //     if ($this.service.variables){
            //         await $this.check_then_start($this.service.variables)
            //     } else {
            //         await $this.check_then_start()
            //     }
            // }
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
            let promises = []
                let running = false
                let error = null
                $this.services.forEach((service, key)=>{
                    let step = null;
                    if (service.status.error){
                        error = `Service: ${key}, Error: ${service.status.error}\n`
                    }
                    if(service.status.exists.running){
                        $this.service_steps[key] = true
                        running = true
                    } else {
                        $this.service_steps[key] = false
                    }
                } )
                $this.status.running = running
                $this.status.error = error
                resolve()
            $this.dependencyCheck().then((dependencies)=>{
                resolve()
            }).catch((err)=>{
                store.logger.error("%o error in dependency check for procedure %s", err, $this.name)
            })
        }) 
	}

	// async statusCheck(){
	// 	const $this = this;
	// 	return new Promise(function(resolve,reject){ 
    //         (async ()=>{
    //             let status = await check_container($this.service.name)
    //             $this.service.status.running = status.running
    //             $this.service.status.exists = status.exists
    //             resolve(status)
    //         })().catch((err)=>{
    //             resolve(false)
    //         })
    //     })
	// }


    // async checkProgress(variables){
    //     const $this = this
    //     return new Promise(function(resolve,reject){
    //         let items = cloneDeep($this.service.progress)
    //         let progresses = []
    //         items.forEach((item)=>{
    //             let variable = $this.replaceVariables(item.source, variables)
    //             progresses.push(variable)
    //         })
    //         list_module_statuses(progresses).then((returned_data)=>{
    //             returned_data.map((d,i)=>{
    //                 items[i].status = d
    //             })
    //             resolve(items)
    //         }).catch((err)=>{
    //             reject(err)
    //         })
    //     })

    // }
    async stop(){
        const $this = this
        let promises = []
        for (let [key, service] of Object.entries(this.services)){
            if (service.status){
                promises.push(service.stop())
            }
        }
        let response = await Promise.allSettled(promises)
        return
    }
    async start(variables){
        const $this = this
        let services;
        if (!variables || variables.length != $this.config.services.length ){
            variables  = [];
            this.config.services.map((d)=>{
                variables[d] = { }
            })
        }
        $this.status.error = null
        $this.status.running = true
        // return new Promise(function(resolve,reject){
            let promises = [];
            for (let i = 0; i < $this.services.length; i++){
                let service = $this.services[i]
                if (service.config.orchestrator){
                    logger.info("Skipping service %s since it is orchestrated. Ensure that the orchestrator is function/running for proper procedure completion", i)
                } else{
                    try{
                        await service.check_then_start({ variables: variables[i]}, true)
                    } catch(err){
                        logger.error("%o Error in procedure: %s, key: %s", err, $this.name, i)
                        $this.status.error = err
                    }
                }
                // promises.push(service_obj.check_then_start(service.variables, true))
            }
            // const serial = funcs =>
            //     promises.reduce((promise, func) =>
            //         promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
            return
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
            pullImage(dependency.target, dependency).then((stream, error)=>{
                dependency.status.building = true
                dependency.status.downloading = true
                dependency.status.error = null
                dependency.status.stream = spawnLog(stream, $this.logger)
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
                cloneDeep(dependency.service)
            )
            if (dependency.workingdir){
                service.config.workingdir = dependency.workingdir
            }
            if (dependency.bind){ 
                if (!service.config.binds){
                    service.config.binds = []
                }
                service.config.binds.push(dependency.bind)
            }
            if (dependency.command){
                if (Array.isArray(dependency.command)){
                    service.config.command = dependency.command
                }else {
                    service.config.command = [dependency.command]
                }
            }
            
            
            service.setOptions()
            service.check_then_start({}, null).catch((err)=>{
                store.logger.error(err)
                dependency.status.building = false
                dependency.status.downloading= false
                dependency.status.error = err
            }).then((stream)=>{
                dependency.streamObj = stream
                dependency.streamObj.on("close", (response)=>{
                    dependency.status.building = false
                    dependency.status.downloading= false
                    dependency.status.error = null
                })
            })
            resolve()
           
        })
    } 
    downloadSource(dependency, overwrite){   
		const $this = this  
        return new Promise(function(resolve,reject){ 
            checkExists(dependency.source.target).then((exists)=>{
                if (!exists || exists && overwrite){  
                    if (dependency.streamObj){
                        dependency.streamObj.close() 
                        dependency.streamObj.end()
                    }
                    downloadSource(dependency.source.url, dependency.source.target, dependency.source ).then((stream, error)=>{
                        dependency.status.stream = spawnLog(stream, $this.logger)
                        dependency.streamObj = stream
                        if (error){
                            console.error(error)
                        }
                        $this.buildlog = spawnLog(stream, $this.logger)
                        stream.on("close", ()=>{ 
                            store.logger.info("Completed download of %o", dependency.source)
                            
                            dependency.status.building = false
                            dependency.status.downloading= false
                            resolve()
                        }).on("error", ()=>{
                            store.logger.error("Error in stream")
                        })
                    }).catch((err)=>{
                        store.logger.error("%o %o","Error in downloading source: ", dependency.source , err)
                        dependency.status.building = false
                        dependency.status.downloading= false
                        reject(err)
                    }) 
                } else{
                    store.logger.info(`Skipping dependency install: ${dependency.source.target} due to it existing`) 
                    resolve()
                }
            }) 
               
        })
    }
	buildImage(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){ 
            if (dependency.streamObj){
                dependency.streamObj.destroy() 
            }

			let conf = {  
				context: path.dirname(dependency.build.path),
				src: [dependency.build.file], 
				AttachStdout: true, 
				AttachStderr: true,
				Tty:false
			}
			store.docker.buildImage(conf,
			{
				t: dependency.target
			}).then((stream, error)=>{
                dependency.status.downloading = true
                dependency.status.building = true
                if (error){
                    dependency.status.error = error
                }
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
            }).catch((err)=>{ 
                store.logger.error("%s %s %o","Error in building docker image for: ", dependency.target , err)
                dependency.status.downloading = false
                dependency.status.building = false
                dependency.status.error = err
                reject(err)
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
                            dependency.streamObj.remove({force:true})
                        } else{
                            // promises.push(dependency.streamObj.end())
                            dependency.streamObj.close()

                            dependency.streamObj.end()
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
                if (!overwrite){
                    if (dependency_obj.overwrite){  
                        overwrite = true
                    }
                }   
                if (dependency_obj.type == 'docker' && !dependency_obj.build && !dependency_obj.local ){
                    promises.push($this.pullImage(dependency_obj))
                }   else if (dependency_obj.type == 'docker-local' && dependency_obj.build ){
                    promises.push($this.buildImage(dependency_obj))
                }   else if (dependency_obj.type == 'docker' && dependency_obj.local  ){
                    promises.push($this.loadImage(dependency_obj))
                } else if (dependency_obj.type == 'orchestration'  ){
                    console.log("orchestrated download") 
                    promises.push($this.orchestrateDownload(dependency_obj).catch((err)=>{
                        store.logger.error("Error in downloading source url: %o", err);
                        dependency_obj.status.downloading = false

                    }))
                } else {
                    promises.push($this.downloadSource(dependency_obj, overwrite).then((response)=>{
                        dependency_obj.status.downloading = false  
                        store.logger.info(`______Item download: ${dependency_obj.source.target}`)
                        checkExists(dependency_obj.source.target).then((exists)=>{
                            if (dependency_obj.decompress){ 
                                store.logger.info("Decompressing required, doing so now for final target... %s", dependency_obj.target)
                                checkExists(dependency_obj.target).then((exists)=>{
                                    if (!exists || exists && overwrite || exists && dependency_obj.decompress.overwrite){
                                        dependency_obj.status.building = true
                                        decompress_file(dependency_obj.decompress.source, path.dirname(dependency_obj.target)).then(()=>{
                                            dependency_obj.status.building = false
                                        }).catch((err) =>{
                                            store.logger.error("Error in decompressing file: %o", dependency_obj.source)
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

                    }) ) 
                } 
                Promise.allSettled(promises).then((res)=>{
                    store.logger.info("Finished building module")
                }).catch((err)=>{
                    store.logger.error("error in building process: %o", err)
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
        console.log(selectedDep)
        selectedDep.map((dependency_obj, i)=>{            
            // dependency_obj.status.downloading = true
            objs.push(dependency_obj) 
            if (dependency_obj.type == 'docker' || dependency_obj.type == 'docker-image'  ){
                console.log("remove image")
                promises.push(remove_images(dependency_obj.target)) 
            }
            else{
                promises.push(removeFile(dependency_obj.target, dependency_obj.type, false) )
            }
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
    updateVariables(variables){
        try{
            // let services_objs = this.services
            let configVariables = cloneDeep(this.config.services)
            
            let parsed_variables = cloneDeep(this.config.services)
            .map((d)=>{
                if (d && d.variables){
                    return d.variables
                } else { 
                    return {}
                }
            })
            variables.forEach((variable, i)=>{
                for (let [key, value] of Object.entries(variable)){
                    if (value.source && value.source !== '' && parsed_variables[i][key]){
                        parsed_variables[i][key].source = value.source
                    }
                    if ((value.option || value.option == 0) && parsed_variables[i][key]){
                        parsed_variables[i][key].option = value.option
                    }  
                }
                    
            })
            let linking = this.config.linking
            if (linking){
                linking.forEach((link)=>{ 
                    let serviceInput = variables[link.input.service] //is the service getting info FROM the previous ones
                    let serviceOutput = variables[link.output.service] //is the service going INTO the next one
                     
                    let serviceConfigInput = configVariables[link.input.service] //is the service getting info FROM the previous ones
                    let serviceConfigOutput = configVariables[link.output.service] //is the service going INTO the next one
                    if (! serviceInput ||
                        serviceInput[link.input.variable].source == '' ||
                        !serviceInput[link.input.variable].source){
                    
                     
                        let targetAttr = serviceConfigOutput[link.output.target][link.output.variable]
                        
                        let inner_variables = targetAttr.path.match(/(\${.+?\}){1}/g)
                        serviceInput = serviceConfigInput[link.input.target]
                        
                        if (inner_variables && Array.isArray(inner_variables)){
                            inner_variables.forEach((vari)=>{
                                let id = vari.replace(/[\$\{\}]/g, "")
                                let val = serviceOutput[id].source
                                serviceInput[link.input.variable].source = targetAttr.path.replaceAll(vari, val)
                        
                            })
                        }
                        parsed_variables[link.input.service] =  serviceInput 
                    }
                })
            }
            // console.log(parsed_variables)
            return  parsed_variables
        } catch (err){
            logger.error(err)
            throw err
        }

    }
    // updateVariables(data){
    //     const $this = this
    //     try{
    //         let variables = [];
    //         if (!data || !this.service.variables || !Array.isArray(this.service.variables)){
    //             return
    //         }
    //         // let returned_option =
    //         variables = cloneDeep(this.service.variables )
    //         const keys = this.service.variables.map((d)=>{return d.name})
    //         data.forEach((value, key)=>{
    //             const index = keys.indexOf(value.name)
    //             if(index > -1){
    //                 let option = ( value.option ? value.option : 0)
    //                 if (value.source){
    //                     value.value = value.source
    //                 }
    //                 variables[index].option = option
    //                 if (variables[index].options){
    //                     if (!value.value){
    //                         if (value.options){
    //                             variables[index].options[option].source = value.options[option].source
    //                         }
    //                     } else {
    //                         variables[index].source = value.value
    //                         if (value.option){
    //                             variables[index].options[option].source = value.value
    //                         }
    //                     }

    //                 } else {
    //                     variables[index].source = ( value.value ? value.value : value )
    //                 }
    //             }


    //         })
    //         return variables
    //     } catch(err){
    //         logger.error("%o error in updating variables", err)
    //         throw err
    //     }
    // }








}
