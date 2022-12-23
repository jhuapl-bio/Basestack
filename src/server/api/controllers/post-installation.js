/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const { store }  = require("../../config/store/index.js")      
var  logger  = store.logger 
const {removeFile,  } = require("./IO.js")

export async function createNetworks(names){  // Create any networks for orchestrated containers
	return new Promise(function(resolve,reject){
		try {  
			store.logger.info(`${names}, creating network`)  
			let promises = []
			names.forEach((name)=>{ // For each network, use the Dockerode api to create them, avoiding duplicated if possible
				promises.push(store.docker.createNetwork({Name: name, CheckDuplicate: true }))
			})  
			Promise.allSettled(promises).then((response)=>{    
				resolve(response)
			}).catch((err)=>{
				store.logger.error("%o %s", err, `error in creating network(s)`)
				reject(err)
			})
		} catch(err){  
			store.logger.error("%o %s", err, `error in creating network(s)`) 
			reject(err)
		}  
	})
}
export async function removeDep(dependency_obj){ // remove a depe, be it a volume, image, or path
	return new Promise(function(resolve,reject){
		try {
			// If the dep. is a docker image (local or pullable), remove that image
			if (dependency_obj.type == 'docker' || dependency_obj.type == 'docker-local'  ){
				let target = dependency_obj.target
				if (dependency_obj.version){
					target = `${target}:${dependency_obj.version}`
				}
				// Remove the images via dockerode api
                remove_images(target).then((response)=>{
					resolve()
				}).catch((err)=>{
					store.logger.error("Error in removing image dependency %o", err)
				})
            } else if (dependency_obj.type == 'volume'){ // If it is a docker volume, prune it from system using dockerode api
                removeVolume(dependency_obj.target).then((response)=>{
					resolve()
				}).catch((err)=>{
					store.logger.error("Error in removing volume dependency %o", err)
					reject(err)
				})
            }
            else{
				// else do basic file services to remove the path from the system
                removeFile(dependency_obj.target, dependency_obj.type, false).then((response)=>{
					if (dependency_obj.decompress){
						// If the path happens to also come with a tarball (like .tar.gz) downloaded before decompression, remove that too
						removeFile(dependency_obj.decompress.source, 'file', false)
							.then((response)=>{
								resolve()
							}).catch((err)=>{
								store.logger.error("Error in removing decompressed dependency %o", err)
								reject(err)
							})
					} else {
						resolve()
					}
				}).catch((err)=>{
					store.logger.error("Error in removing file dependency %o", err)
					reject(err)
				})
                
            }
			resolve()
		} catch (err){
			store.logger.error("%s dep removal error", err)
			reject()
		}
	})
}
export async function createVolumes(names){ // Create a docker volume
	return new Promise(function(resolve,reject){
		try { 
			store.logger.info(`${names}, creating volumes`)
			let promises = []
			names.forEach((name)=>{ 
				promises.push(store.docker.createVolume({Name: name, CheckDuplicate: true }))
			})
			Promise.allSettled(promises).then((response)=>{
				resolve(response)
			}).catch((err)=>{ 
				store.logger.error("Error in creating volume, %o", err)
				reject(err)
			}) 
		} catch(err){
			store.logger.error(`${err}, error in creating volume(s)`)
			reject(err)
		}
	}) 
}
export async function checkVolumeExists(name){
		// try { 
		let volume = await store.docker.getVolume(name)
		let inspected = await volume.inspect()
		// console.log(inspected,"<<<<")
		return ( inspected ? true : false)
}

export async function removeVolume(name){
	return new Promise(function(resolve,reject){
		try { 
			logger.info(`${name}, removing  volumes`);
			( async ()=>{
				let volume = await store.docker.getVolume(name)
				if (volume){
					volume.remove().then((f)=>{
						store.logger.info(f)
						resolve(f)
					}).catch((Err)=>{
						store.logger.error("Error in removing volume %o", Err)
						reject(Err)
					})
				} else {
					reject()
				}
			})().catch((Err)=>{
				reject(Err)
			});
		} catch(err){
			logger.error(`${err}, error in removing volume(s)`)
			reject(err)
		}
	})
}




export var prune_images = async function(){ 
	try{
		let responseContainers = await store.docker.pruneContainers()
		let responseawait = await store.docker.pruneImages( { 'filters' : { 'dangling' : { 'true' : true } } } )
		return responseawait 
	}
	catch(err){ 
		logger.error(`${err} function: prune_images()`)  
		throw err
	}  
}
export var remove_images = function(imageName){
	return new Promise(function(resolve,reject){
		(async ()=>{ 
			let promises = [];
      logger.info("removing containers with imageName: %s", imageName)
			let containers = await store.docker.listContainers({ 'filters' : { 'ancestor' : [ imageName ] }} )
			for (let i = 0; i < containers.length; i++){
				promises.push(store.docker.getContainer(containers[i].Id).remove({force:true}))
			} 
			
			Promise.all(promises).then(()=>{
        logger.info("removing image(s) with imageName: %s", imageName)
				store.docker.getImage(imageName).remove({
				   force: true
				  }, (err,response)=>{
					if(err){
						logger.error("%s Error in removing docker image: %o", imageName, err)
						reject(err)
					} else {
            logger.info("%s, Success in removing image", imageName)
						resolve(JSON.stringify(response, null, 4))
					}
				});
			}).catch((err)=>{
				logger.error(err)
				reject(err)
			})
			
		})().catch((err)=>{
			logger.error(err)
			reject(err)
		})
	});
}

export var install_images_offline = function(obj){
	return new Promise(function(resolve,reject){
		loadImage(obj).then((error, response)=>{
			if (error){
				reject(error)
			}
			resolve(`loaded ${obj} as offline image`)
		}).catch((err)=>{
			logger.error(`${err} function: install_images_offline()`)
			reject(err)
		})
	})
}
 
export var loadImage = function(obj){
  return new Promise(function(resolve,reject){
    store.docker.loadImage(
      obj,
      {quiet: false},
        (err, stream)=>{
			if (err){
				reject(err)
			}   
			resolve(stream) 
        }
    )
   
  })
}


export var pullImage  = function(name){
	return new Promise(function(resolve,reject){
    store.docker.pull(name)
      .then((stream, error)=>{
        if(error){
          reject(error)
        }
        resolve(stream)
      }).catch((errStream)=>{
        store.logger.error("Err in pulling image %s", name)
        reject(errStream)
      });
    })
}
		