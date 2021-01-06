/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
import Docker from 'dockerode';
import docker  from "./docker.js"
import path  from "path"
const {logger} = require("./logger.js")
const { store }  = require("../store/global.js")

export async function check_container_exists(container_name){
	return new Promise(function(resolve,reject){
		(async ()=>{
			var container = await docker.getContainer(container_name);
			await container.inspect((err,info)=>{
				if (err){
					resolve({container: null, exists: false})
				} else {
					resolve({container: container, exists: true})
				}
			})
		})().catch((error)=>{
			logger.error("%s error checking if docker exists", error)
			resolve({container: null, exists: false})
		})

	})
}

export async function init_container_logs(container_name){
	return new Promise(function(resolve,reject){
		try{
			(async ()=>{
				const response = await check_container_exists(container_name);
				if (!response.exists){
					let obj = store.modules[container_name]
					initDockerLogs(response.container, container_name, obj).then(()=>{
			  			resolve()
		  			}).catch((errLog)=>{
		  				logger.error("%s %s","Error in initiating docker logs, container: ",  errLog)
		  				reject(errLog)
		  			})
		  		} else {
		  			resolve()
		  		}
  			})().catch((error)=>{
  				logger.error("%s error initiating dockerlogs", error)
  				reject(error)
  			})
		} catch(err){
			console.error(err)
			reject(err)
		}
	})
}
function formatBuffer(data){
	return data.toString().replace(/\u?([\0\1])(\w{1})?/g, '')
}

export const followStreamContainer = async function(stream, obj){
	stream.on("data", (data)=>{
		try{
			obj.status.stream.push(formatBuffer(data))
		} catch(err){
			logger.error("error in getting data %s", err)
			throw err
		} finally{
			obj.status.stream = obj.status.stream.splice(-150)
		}
	})
	stream.on("error", (err)=>{
		try{
			obj.status.stream.push(formatBuffer(err))
			obj.status.errors = formatBuffer(err)
		} catch(err){
			logger.error("%s", err)
		}
	})
	stream.on("end", (data)=>{
		obj.status.running = false
		try {
    		obj.status.exists = true
    	} catch (err){
    		obj.status.running = false
    		logger.error("%s", err)
    		obj.status.errors = formatBuffer(err)
    	}finally {
    		obj.status.running = false
    		if (obj.status.errors){
    			obj.status.stream.push(obj.status.errors)
    		}
    		else {
	    		obj.status.stream.push("Process complete")
    		}
	    	stream.destroy();
    	}
	})
}
export const followStreamBuild = async function(stream, obj){
	return new Promise(function(resolve,reject){
		if (stream){
			docker.modem.followProgress(stream, onFinished, onProgress)
		}
		obj.status.stream.push('Starting...')
		async function onFinished(err, output) {
	    	try {
	    		obj.exists = true
	    	} catch (err){
	    		logger.error("%s", err)
	    		obj.status.running = false
	    	}finally {
	    		if (obj.status.errors){
	    			obj.status.stream.push(obj.status.errors)
	    		} 
	    		else {
		    		obj.status.stream.push("Process complete")
	    		}
	    		obj.status.running = false
		    	stream.destroy();
		    	store.dockerStreamObjs[obj.name] = null
	    	}
		}
	    function onProgress(event) {
	    	try{
	    		if (event.stream != undefined){	
	    			// logger.info(`stream. ${event.stream}`)
					obj.status.stream.push((event.stream)); 
				} else if (event.status != undefined){
					// logger.info(JSON.stringify(event))
					obj.status.stream.push((`${event.status} ${(event.progress ? event.progress : '')}`)); 					
				}
			} catch(err){
				logger.error(err)
				obj.status.stream.push((event));  
			} finally{
				obj.status.stream = obj.status.stream.splice(-150)
			}
			if (event.error){
				obj.status.errors = event.error
				stream.destroy()
				store.dockerStreamObjs[obj.name] = null
			}
	    }
	})


}


//Docker logging for the frontend. Only operates on currently running docker containers
export const attachStream = async function(container,container_name, obj){
	return new Promise(function(resolve,reject){
		container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
			if(err){
				logger.error("%s Error attaching stream", err)
				reject(err)
			}
			logger.info("attaching stream to module "+container_name)
			followStreamContainer(stream, obj)
			resolve(stream)
		});
	})
}

export const initDockerLogs = function(container, container_name, obj){
	return new Promise(function(resolve,reject){
		try {
			container.logs({stdout:true, stderr:true}, function(err, logs){
				if (err){
					reject(err)
				} else {
					obj.status.stream.push(formatBuffer(logs));
					(async ()=>{
	 					let stream = await attachStream(container, container_name, obj)
	 					obj.status.running = true
						resolve(stream)
					})().catch((errStream)=>{
						logger.error("%s stream error init", errStream)
						obj.status.running = false
						reject(errStream)
					})
				}
			})
		} catch(errOuter){
			logger.error("%s stream error init Outer", errOuter)
			obj.status.running = false
			reject(errOuter)
		}
	})
}

