const { store } = require('../../config/store/index.js')
const {logger }  = require('./logger.js')
const path = require("path")
const { check_image } = require("./fetch.js")
const {  downloadSource, decompress_file, checkExists } = require("./IO.js")
const { spawnLog } = require("./logger.js")

export  class Workflow {
	constructor(name, dependencies, services, basepath){
        this.name= name
		this.services = services
		this.basepath = basepath
		this.interval = {
            checking: false,
            interval: this.create_interval()
        }
		this.dependencies  =dependencies.map((d)=>{
			let status = {
				downloading: false,
				decompressing: false,
				exists: false,
				error: null
			};
			d.status = status
			return d
		})
		
	} 
	pullImage(image){
		const $this = this  
        return new Promise(function(resolve,reject){ 
            store.docker.pull(image).then((stream, error)=>{
                $this.buildlog = spawnLog(stream, $this.logger)
                resolve()
            }).catch((err)=>{
                logger.error("%s %s %o","Error in pulling docker image for: ", image , err)
                reject(err)
            }) 
        })
    }
	buildImage(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){ 
			let conf = {
				context: $this.basepath,
				src: [dependency.build.file],
				AttachStdout: true,
				AttachStderr: true,
				Tty:false
			}
			store.docker.buildImage(conf,
			{
				t: dependency.target
			}).then((stream, error)=>{
                $this.buildlog = spawnLog(stream,logger)
                resolve()
            }).catch((err)=>{ 
                logger.error("%s %s %o","Error in building docker image for: ", dependency.target , err)
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
        }, 4000)
        
        
        return interval

    }
	async build(dependencies, overwrite){
		const $this = this;
        let promises = []
        let objs = []
        dependencies.forEach((dependency, i)=>{            
            $this.dependencies[dependency].status.downloading = true
            let dependency_obj = $this.dependencies[dependency]
            objs.push(dependency_obj)
            if (!overwrite){
                if (dependency_obj.overwrite){
                    overwrite = true
                }
            }
            if (dependency_obj.type == 'docker' && !dependency_obj.build ){
                promises.push($this.pullImage(dependency_obj.target))
            }   else if (dependency_obj.type == 'docker' && dependency_obj.build ){
				promises.push($this.buildImage(dependency_obj))
			}
            else{
                if (!overwrite){                    
                    promises.push(
                        checkExists(dependency_obj.source.target).then((exists)=>{
                            if (!exists){ 
                                downloadSource(dependency_obj.source.url, dependency_obj.source.target )
                            } else{
                                logger.info(`Skipping dependency install: ${dependency_obj.source.target} due to it existing`)
                                promises.push(new Promise((resolve, reject)=>{ resolve(`Skipping: ${dependency_obj} due to it existing`) }))
                            }

                        })
                    )
                } else {
                    // promises.push(downloadSource(dependency_obj.source, dependency_obj.target ))
                    promises.push(downloadSource(dependency_obj.source.url, dependency_obj.source.target ))
                }
            }
        })
        let settled_data = await Promise.allSettled(promises)
        promises = []
        settled_data.forEach((settled,i)=>{
            let obj = objs[i]
            $this.dependencies[i].status.downloading = false
            if (obj.decompress){
                $this.dependencies[i].status.decompressing= true 
                promises.push(decompress_file(obj.decompress.source, path.dirname(obj.target)))
            }
            else {
                promises.push('')
            }
        })
        settled_data = await Promise.allSettled(promises)
        settled_data.forEach((settled, i)=>{
            let obj = objs[i] 
            if (settled.status == 'fulfilled'){
                $this.dependencies[i].status.decompressing= false
            } else {
                $this.dependencies[i].status.error =  settled.value
            }
        })
        return `Building workflow service for ${$this.name} ${dependencies}`
		
	} 
	async dependencyCheck(){ 
		const $this = this; 
        let dependencies = this.dependencies 
		return new Promise(function(resolve,reject){
			let promises = []
			dependencies.forEach((dependency)=>{ 
				if (dependency.type == "docker"){
					promises.push(check_image(dependency.target))
				}
                else {
                    promises.push(checkExists(dependency.target))
                }
			})
			Promise.allSettled(promises).then((response, err)=>{
				response.forEach((dependency, index)=>{
					if (dependency.status == 'fulfilled'){
						$this.dependencies[index].status.exists = dependency.value
						$this.dependencies[index].version = dependency.value.version
					} else {
						$this.dependencies[index].status.exists = false
						$this.dependencies[index].version = null
					}
				})
				resolve()
			}).catch((err)=>{
				logger.error(`${err} Error in checking target dependencies`)
				reject(`${err} ${$this.name} Error in checking target dependencies`)
			})
			
		})
	}   
	
}