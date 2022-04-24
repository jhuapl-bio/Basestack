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

export async function createNetworks(names){ 
	return new Promise(function(resolve,reject){
		try {  
			logger.info(`${names}, creating network`)  
			// let networks = await store.docker.listNetworks() 
			// logger.info(`${JSON.stringify(networks, null, 4)}, networks`) 
			let promises = []
			names.forEach((name)=>{
				promises.push(store.docker.createNetwork({Name: name, CheckDuplicate: true }))
			})  
			Promise.allSettled(promises).then((response)=>{    
				resolve(response)
			}).catch((err)=>{
				// throw err
				logger.error("%o %s", err, `error in creating network(s)`)
				reject(err)
			})
		} catch(err){  
			logger.error("%o %s", err, `error in creating network(s)`) 
			reject(err)
		}  
	})
}
export async function createVolumes(names){
	return new Promise(function(resolve,reject){
		try { 
			logger.info(`${names}, creating volumes`)
			// let networks = await store.docker.listVolumes()
			// logger.info(`${JSON.stringify(networks, null, 4)}, networks`)
			let promises = []
			names.forEach((name)=>{ 
				promises.push(store.docker.createVolume({Name: name, CheckDuplicate: true }))
			})
			Promise.allSettled(promises).then((response)=>{
				resolve(response)
			}).catch((err)=>{ 
				// throw err
				logger.error("Error in creating volume, %o", err)
				reject(err)
			}) 
		} catch(err){
			logger.error(`${err}, error in creating volume(s)`)
			reject(err)
		}
	}) 
}
export async function checkVolumeExists(name){
		// try { 
		let volume = await store.docker.getVolume(name)
		let inspected = await volume.inspect()
		// console.log("next")
		return volume
		// } catch(err){
		// 	// logger.error(`${err}, error in getting volume(s) ${name}`)
		// 	throw err
		// }
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
	console.log(name,"<<<< name pull")
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
		