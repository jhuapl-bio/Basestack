const { Service } = require('./service.js');
const { store } = require('../../config/store/index.js')
const path = require("path")
const cloneDeep = require("lodash.clonedeep");
const { check_image, fetch_external_dockers } = require("../controllers/fetch.js")
const {  downloadSource, removeFile, decompress_file, checkExists } = require("../controllers/IO.js")
const { spawnLog } = require("../controllers/logger.js")
const { pullImage, loadImage, remove_images } = require("../controllers/post-installation.js")
export  class Module { 
	constructor(name, module){    
        this.name= name
		this.interval = { 
            checking: false,
            interval: this.create_interval() 
        }, 
        this.config = module
        this.status =  {
            fully_installed: false,
            latest: null,
            building: true,
            version:null
        }
		this.dependencies  = module.dependencies.map((d)=>{ 
            d.streamObj = null

			let status = { 
				downloading: false, 
				decompressing: false, 
				exists: false, 
				error: null, 
                stream: null,
			};
			d.status = status
			return d
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
                reject(err)
            }) 
        })
    }
	async pullImage(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){ 
            if (dependency.streamObj){
                store.logger.info("Closing since it already exists as a stream obj %o", dependency.target)
                dependency.streamObj.close()
                dependency.streamObj.end() 
                dependency.streamObj.destroy()
            }
            pullImage(dependency.target, dependency).then((stream, error)=>{
                dependency.status.stream = spawnLog(stream, $this.logger)
                dependency.streamObj = stream 
                $this.buildlog = spawnLog(stream, $this.logger)
                stream.on("close", (err, data)=>{
                    console.log("closed....")
                    dependency.status.downloading = false
                    dependency.status.building = false
                })
                resolve()  
            }).catch((err)=>{ 
                store.logger.error("%s %s %o","Error in pulling docker image for: ", dependency.target , err)
                reject(err)
            }) 
        })
    } 
    async orchestrateDownload(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){ 
            if (dependency.streamObj){
                store.logger.info("Closing since it already exists as a stream obj %o", dependency.target)
                try{
                    dependency.streamObj.close()
                    dependency.streamObj.end() 
                    dependency.streamObj.destroy()
                } catch(err){
                    store.logger.error(err)
                }
            }
            let service = new Service( 
                $this.name,
                cloneDeep(store.config.services.orchestrated_download)
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
                dependency.status.stream  = spawnLog(stream, $this.logger)
                dependency.streamObj = stream
                stream.on("close", (err, data)=>{
                    dependency.status.downloading = false
                    dependency.status.building = false
                })

                $this.buildlog = spawnLog(stream,store.logger)   
                resolve() 
            }).catch((err)=>{ 
                store.logger.error("%s %s %o","Error in building docker image for: ", dependency.target , err)
                reject(err)
            }) 
        })
    } 
	async create_interval (){
        const $this = this
		let checking = false
        let interval = setInterval(()=>{
            if (!checking){
                $this.interval.checking = true
				checking = true 
                $this.dependencyCheck().then(()=>{
                    $this.interval.checking = false
                    
					checking = false  
                }).catch((err)=>{
					// logger.error(err)
					checking = false
				})
            }
        }, 5000)
        
        
        return interval

    } 
 
    async cancel_build(){ 
        const $this = this; 
        return new Promise(function(resolve,reject){ 
            try{
                let promises = []
                $this.dependencies.map((dependency)=>{
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
    async remove( ){
		const $this = this; 
        let promises = []
        let objs = [] 
        let dependencies = this.dependencies
        dependencies.forEach((dependency_obj, i)=>{            
            // dependency_obj.status.downloading = true
            objs.push(dependency_obj) 
            if (dependency_obj.type == 'docker' || dependency_obj.type == 'docker-image'  ){
                promises.push(remove_images(dependency_obj.target)) 
            }
            else{
                promises.push(removeFile(dependency_obj.target, dependency_obj.type, false) )
            }
        })
        let settled_data = await Promise.allSettled(promises)
        let messages = []
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
            }
        })
        return messages
	} 
	async dependencyCheck(){ 
		const $this = this; 
        let dependencies = this.dependencies 
		return new Promise(function(resolve,reject){
			let promises = []
			dependencies.forEach((dependency, index)=>{ 
				if (dependency.type == "docker"){
					promises.push(check_image(dependency.target))
                    fetch_external_dockers(dependency.target).then((response)=>{
                        if ( response){
                            $this.dependencies[index].status.latest = response.latest_digest
                        } else {
                            $this.dependencies[index].status.latest  = null
                        }
                    }).catch((err)=>{
                        store.logger.error(err)
                    })
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
                $this.status.fully_installed = fully_installed
				resolve()
			}).catch((err)=>{
				store.logger.error(`${err} Error in checking target dependencies`)
				reject(`${err} ${$this.name} Error in checking target dependencies`)
			})
			
		}) 
	}   
	
}