/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
import Docker from 'dockerode';
import  docker  from "./docker.js"
import  path  from "path"
const fs  = require("fs")
const zlib = require('zlib')
const tar = require('tar-stream')
const fs_promise = require("fs").promises
const { store }  = require("../store/global")
var { logger } = require("./logger");
var { followStreamBuild } = require("./dockerLogs.js")
const {copyFile, readFile, copyFolder, writeFolder, ammendJSON, writeFile } = require("./IO.js")

export var install_images_offline = function(obj){
	return new Promise(function(resolve,reject){
		const image_name = obj.name
		load_image(obj).then((error, response)=>{
			if (error){
				reject(error)
			}
			resolve('Loaded images offline')
		}).catch((err)=>{
			logger.error(`${err} function: install_images_offline()`)
			reject(err)
		})
	})
}
var install_images_onlinePromise = function(obj){
	return new Promise(function(resolve,reject){
		load_image(obj).then((error, response)=>{
			if (error){
				reject(error)
			}
			resolve('Loaded images online')
		}).catch((err)=>{
			logger.error("%s function: install_images_onlinePromise()", err)
			reject(err)
		})
	})	
}


export var install_images_online = function(img){
	return new Promise(function(resolve,reject){
		const image = store.config.images[img.image]
		image.config = img.config
		if (store.dockerStreamObjs[img.image]){
			reject("Docker image already loading, canceling")
		} else {
			install_images_onlinePromise({
				config: img.config,
				name: img.image,
				fullname: img.name
			}).then((response,error)=>{
				if(error){
					logger.error(`${error} function: install_images_online()`)
					reject(error)
				}
				resolve("Now loading docker image: "+img.name)
			}).catch((err)=>{
				logger.error(`${err} function: install_images_online()`)
				reject(err)
			})			
		}


	})
}


export var prune_images = async function(){
	try{
		let responseContainers = await docker.pruneContainers()
		let responseawait = await docker.pruneImages( { 'filters' : { 'dangling' : { 'true' : true } } } )
		return responseawait
	}
	catch(err){
		logger.error(`${err} function: prune_images()`)
		throw err
	}
}

export var load_image  = function(obj){
	return new Promise(function(resolve,reject){
		try{
			(async ()=>{
				let stream;
				if (!store.config.images[obj.name]){
					reject("Image name not supported, make sure the image file is one of the supported names: " + Object.keys(store.config.images).join(", "))
				}
				store.config.images[obj.name].status.errors = null
				store.config.images[obj.name].status.complete = false
				store.config.images[obj.name].status.type = obj.type
				if(obj.config.type =="offline"){
					store.config.images[obj.name].status.stream =  ['Installing Offline Version for: '+obj.name, "Logging disabled for offline installation"]
					store.config.images[obj.name].status.name= obj.name
					store.config.images[obj.name].status.changed = false
					store.config.images[obj.name].status.running = true
					store.config.images[obj.name].status.complete = false
	  				
					docker.loadImage(
						obj.path,
						{quiet: false},
	  					(err, stream)=>{
	  						if (err){
	  							console.log(err)
	  							reject(err)
	  						}  
	  						if (stream){
	  							followStreamBuild(stream, store.config.images[obj.name])
	  						}
	  					}
					)
					resolve()  
				} else if (store.config.images[obj.name].private) { // the repo is private and needs to be installed from a locally contained dockerfile
					const buildargs = {
						"USER_ID": store.meta.uid.toString(),
						"GROUP_ID": store.meta.gid.toString(),
						"ENVIRONMENT": store.meta.OS
					}
					let resource_extras = [];
					let  srcFiles = [...obj.config.srcFiles]
					const metaFile = path.join(store.meta.writePath, 'meta.json')
					let resource_list = {};
					let buildDir = obj.config.path
					if (obj.config.resources){
						let response = await copyFolder(store.config.images[obj.name].installation.path, store.config.images[obj.name].installation.resourcesPath)
						let meta = await readFile(metaFile)
						let resources = JSON.parse(meta).images[obj.name].resources
						buildDir = store.config.images[obj.name].installation.resourcesPath
						for (const [key, resource] of Object.entries(obj.config.resources)){
							if (resource.type=='file'){
								resource_extras.push(copyFile(resource.srcFormat.filepath, path.join(store.config.images[obj.name].installation.resourcesPath, resource.srcFormat.filename)))
								buildargs[resource.key] = resource.srcFormat.filename
								if (srcFiles.indexOf(resource.srcFormat.filename) <= -1){
									srcFiles.push(resource.srcFormat.filename)
								}
							}
							resource.src = null
							resource_list[key] = resource.srcFormat
								
						}
						resource_extras.push(
							ammendJSON({
								value: resource_list,
								file: metaFile,
								attribute: "images."+obj.name+".resources"
							}).catch((err)=>{
								logger.error(err)
								throw err
							})
						)
					}
					Promise.all(resource_extras).then((response)=>{
						docker.buildImage({
								context: buildDir,
		  						src: srcFiles,
		  						AttachStdout: true,
	 							AttachStderr: true,
	 							Tty:false
		  					},
		  					{
		  						t: obj.name,
								buildargs: buildargs
						})
						.then((stream, error)=>{
							store.dockerStreamObjs[obj.name]  = stream
							
							store.config.images[obj.name].status.stream = []
							store.config.images[obj.name].status.changed=false
							store.config.images[obj.name].status.running = true 
							store.config.images[obj.name].status.complete = false
	  						followStreamBuild(stream, store.config.images[obj.name])
							resolve()
						}).catch((errStream)=>{
							logger.error("Err in building image %s", obj.config.srcFiles)
							reject(errStream)
						});
					}).catch((err)=>{
						logger.error("error in building image %s", obj.srcFiles)
					})
				} else { //The repo is public and docker pullable
					// var auth  = { key: "10644ba4-7c89-41b0-ae0d-d888ea3906d4" }
					console.log(obj)
					docker.pull(obj.fullname)
					.then((stream, error)=>{
						store.dockerStreamObjs[obj.name]  = stream
						store.config.images[obj.name].status.stream = []
						store.config.images[obj.name].status.changed=false
						store.config.images[obj.name].status.running = true 
						store.config.images[obj.name].status.complete = false
  						followStreamBuild(stream, store.config.images[obj.name])
						resolve()
					}).catch((errStream)=>{
						logger.error("Err in building image %s", obj.config.srcFiles)
						reject(errStream)
					});
				}				
			})().catch((errLog)=>{
			 	logger.error("err in loggin build image %s", errLog)
				reject(errLog)
			})
		} catch(err){
			reject(err)
		}
	});
}


export var cancel_load_images = function(imageName){
	return new Promise(function(resolve,reject){
		try{
			if (store.dockerStreamObjs[imageName]){
				try{
					store.dockerStreamObjs[imageName].destroy()
					store.config.images[imageName].status.stream.push("Canceled Image Build Process")
				} catch (err3){
					store.dockerStreamObjs[imageName] =null
				}
				store.dockerStreamObjs[imageName] =null
				store.config.images[imageName].status.changed=false
				store.config.images[imageName].status.running = false
				store.config.images[imageName].status.complete = false
				logger.info(`Cancel for image building complete for: ${imageName}`)
				resolve()
			} else {
				reject("No build process  to cancel for: " + imageName)
			}
		} catch(err){
			logger.error("%s",  err)
			reject(err)
		}
	});
}
export var remove_images = function(imageName){
	return new Promise(function(resolve,reject){
		(async ()=>{
			let promises = [];
			imageName = imageName +":latest"
			let containers = await docker.listContainers({ 'filters' : { 'ancestor' : [ imageName ] }} )
			for (let i = 0; i < containers.length; i++){
				// docker.getContainer(containers[i].Id).remove({force:true})
				promises.push(docker.getContainer(containers[i].Id).remove({force:true}))
			}
			Promise.all(promises).then(()=>{
				docker.getImage(imageName).remove({
				   force: true
				  }, (err,response)=>{
					if(err){
						logger.error("%s Error in removing docker image: "+imageName, err)
						reject(err)
					} else {
						resolve(response)
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
