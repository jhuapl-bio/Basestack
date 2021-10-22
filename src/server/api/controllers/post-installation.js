/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
import Docker from 'dockerode';
import  path  from "path"
const fs  = require("fs")
const zlib = require('zlib')
const tar = require('tar-stream')
const fs_promise = require("fs").promises
const { store }  = require("../../config/store/index.js")
var  logger  = store.logger
// var { followStreamBuild } = require("./dockerLogs.js")
const {copyFile, readFile, copyFolder, writeFolder, ammendJSON, writeFile,  } = require("./IO.js")
let docker = store.docker

// export var install_images_offline = function(obj){
// 	return new Promise(function(resolve,reject){
// 		const image_name = obj.name
// 		load_image(obj).then((error, response)=>{
// 			if (error){
// 				reject(error)
// 			}
// 			resolve('Loaded images offline')
// 		}).catch((err)=>{
// 			logger.error(`${err} function: install_images_offline()`)
// 			reject(err)
// 		})
// 	})
// }
// var install_images_onlinePromise = function(obj){
// 	return new Promise(function(resolve,reject){
// 		load_image(obj).then((error, response)=>{
// 			if (error){
// 				reject(error)
// 			}
// 			store.dockerStreamObjs[obj.name] = null
// 			resolve('Loaded images online')
// 		}).catch((err)=>{
// 			logger.error("%s function: install_images_onlinePromise()", err)
// 			reject(err)
// 		})
// 	})	
// }


// export var install_images_online = function(img){
// 	return new Promise(function(resolve,reject){
// 		const image = store.meta.images[img.name]
// 		image.config = img.config
// 		if (store.dockerStreamObjs[img.name]){
// 			reject("Docker image already loading, canceling")
// 		} else {
// 			install_images_onlinePromise(image).then((response,error)=>{
// 				if(error){
// 					logger.error(`${error} function: install_images_online()`)
// 					reject(error)
// 				}
// 				resolve("Now loading docker image: "+img.name)
// 			}).catch((err)=>{
// 				logger.error(`${err} function: install_images_online()`)
// 				reject(err)
// 			})			
// 		}


// 	})
// }


// export var prune_images = async function(){
// 	try{
// 		let responseContainers = await store.docker.pruneContainers()
// 		let responseawait = await store.docker.pruneimages( { 'filters' : { 'dangling' : { 'true' : true } } } )
// 		return responseawait
// 	}
// 	catch(err){
// 		logger.error(`${err} function: prune_images()`)
// 		throw err
// 	}
// }

// export var load_image  = function(obj){
// 	return new Promise(function(resolve,reject){
// 		try{
// 			(async ()=>{
// 				let stream;
// 				if (!store.meta.images[obj.name]){
// 					reject("Image name not supported, make sure the image file is one of the supported names: " + Object.keys(store.config.images).join(", "))
// 				}
// 				store.status.images[obj.name].errors = null
// 				store.status.images[obj.name].complete = false
// 				// store.status.images[obj.name].installation.type = obj.type
// 				if(obj.config.type =="offline"){
// 					store.status.images[obj.name].stream =  ['Installing Offline Version for: '+obj.name, "Logging disabled for offline installation"]
// 					store.status.images[obj.name].name= obj.name
// 					store.status.images[obj.name].changed = false
// 					store.status.images[obj.name].running = true
// 					store.status.images[obj.name].complete = false
// 					store.docker.loadImage(
// 						obj.path,
// 						{quiet: false},
// 	  					(err, stream)=>{
// 	  						if (err){
// 	  							console.log(err)
// 	  							reject(err)
// 	  						}   
// 	  						if (stream){
// 	  							followStreamBuild(stream, store.status.images[obj.name])
// 	  						} 
// 	  					}
// 					)
// 					resolve()  
// 				} else if (store.meta.images[obj.name].config.private) { // the repo is private and needs to be installed from a locally contained dockerfile
// 					const buildargs = {
// 						"USER_ID": store.system.uid.toString(),
// 						"GROUP_ID": store.system.gid.toString(),
// 						"ENVIRONMENT": store.system.OS
// 					}
// 					let resource_extras = [];
// 					let  srcFiles = [...obj.config.installation.srcFiles].filter((d)=>{
// 						return ! Object.is(d)
// 					})
// 					// const metaFile = path.join(store.system.writePath, 'system.json')
// 					let resource_list = {};
// 					let buildDir = obj.config.path
// 					if (obj.config.dependencies){
// 						let response = await copyFolder(
// 							obj.config.installation.location,
// 							store.meta.images[obj.name].config.installation.resourcesPath, 
// 						)
						
// 						// let meta = await readFile(metaFile)
// 						// let resources = JSON.parse(meta).images[obj.name].resources
// 						buildDir = store.meta.images[obj.name].config.installation.resourcesPath
// 						obj.config.dependencies.forEach((resource)=>{
// 							if (resource.type =='file'){
// 								resource_extras.push(
// 									copyFile(resource.srcFormat.filepath, 
// 										path.join(store.meta.images[obj.name].config.installation.resourcesPath, 
// 										resource.srcFormat.filename)
// 									)
// 								)
// 								buildargs[resource.key] = resource.srcFormat.filename
// 								if (srcFiles.indexOf(resource.srcFormat.filename) <= -1){
// 									srcFiles.push(resource.srcFormat.filename)
// 								}
// 							}
// 							resource_list[resource.key] = resource.srcFormat
// 						})
// 						// resource_extras.push(
// 						// 	ammendJSON({
// 						// 		value: resource_list,
// 						// 		file: metaFile,
// 						// 		attribute: "images."+obj.name+".resources"
// 						// 	}).catch((err)=>{
// 						// 		logger.error(err)
// 						// 		throw err
// 						// 	})
// 						// )
// 					}
// 					console.log(buildDir, srcFiles, buildargs)
// 					Promise.all(resource_extras).then((response)=>{
						
// 						store.docker.buildImage({
// 								context: buildDir,
// 								src: srcFiles,
// 								AttachStdout: true,
// 								AttachStderr: true,
// 								Tty:false
// 							},
// 							{
// 								t: obj.name,
// 								buildargs: buildargs
// 						})
// 						.then((stream, error)=>{
// 							store.dockerStreamObjs[obj.name]  = stream
							
// 							store.status.images[obj.name].stream = []
// 							store.status.images[obj.name].changed=false
// 							store.status.images[obj.name].running = true 
// 							store.status.images[obj.name].complete = false
// 							followStreamBuild(stream, store.status.images[obj.name])
// 							resolve()
// 						}).catch((errStream)=>{
// 							logger.error("Err in building image %s", obj.config.srcFiles)
// 							reject(errStream)
// 						});
// 					}).catch((err)=>{
// 						logger.error("error in building image %s", obj.config.srcFiles)
// 						throw err
// 					})
// 				} else { //The repo is public and docker pullable
// 					console.log("pulling online repo down")
// 					// var auth  = { key: "10644ba4-7c89-41b0-ae0d-d888ea3906d4" }
// 					store.docker.pull(obj.config.installation.location)
// 					.then((stream, error)=>{
// 						console.log("then")
// 						store.dockerStreamObjs[obj.name]  = stream
// 						store.status.images[obj.name].stream = []
// 						store.status.images[obj.name].changed=false
// 						store.status.images[obj.name].running = true 
// 						store.status.images[obj.name].complete = false
//   						followStreamBuild(stream, store.status.images[obj.name])
// 						resolve()
// 					}).catch((errStream)=>{
// 						logger.error("Err in building image %s", obj.config)
// 						reject(errStream)
// 					});
// 				}				
// 			})().catch((errLog)=>{
// 			 	logger.error("err in loggin build image %s", errLog)
// 				reject(errLog)
// 			})
// 		} catch(err){
// 			reject(err)
// 		}
// 	});
// }


// export var cancel_load_images = function(imageName){
// 	return new Promise(function(resolve,reject){
// 		try{
// 			if (store.dockerStreamObjs[imageName]){
// 				try{
// 					store.dockerStreamObjs[imageName].destroy()
// 					store.status.images[imageName].stream.push("Canceled Image Build Process")
// 				} catch (err3){
// 					store.dockerStreamObjs[imageName] =null
// 				}
// 				store.dockerStreamObjs[imageName] =null
// 				store.status.images[imageName].changed=false
// 				store.status.images[imageName].running = false
// 				store.status.images[imageName].complete = false
// 				logger.info(`Cancel for image building complete for: ${imageName}`)
// 				resolve()
// 			} else {
// 				reject("No build process  to cancel for: " + imageName)
// 			}
// 		} catch(err){
// 			logger.error("%s",  err)
// 			reject(err)
// 		}
// 	});
// }
// export var remove_images = function(imageName){
// 	return new Promise(function(resolve,reject){
// 		(async ()=>{
// 			let promises = [];

// 			imageName = imageName +":latest"
// 			let containers = await store.docker.listContainers({ 'filters' : { 'ancestor' : [ imageName ] }} )
// 			for (let i = 0; i < containers.length; i++){
// 				// store.docker.getContainer(containers[i].Id).remove({force:true})
// 				promises.push(store.docker.getContainer(containers[i].Id).remove({force:true}))
// 			}
			
// 			Promise.all(promises).then(()=>{
// 				store.docker.getImage(imageName).remove({
// 				   force: true
// 				  }, (err,response)=>{
// 					if(err){
// 						logger.error("%s Error in removing docker image: "+imageName, err)
// 						reject(err)
// 					} else {
// 						resolve(response)
// 					}
// 				});
// 				console.log(store.dockerStreamObjs[imageName])	
// 			}).catch((err)=>{
// 				logger.error(err)
// 				reject(err)
// 			})
			
// 		})().catch((err)=>{
// 			logger.error(err)
// 			reject(err)
// 		})
// 	});
// }