/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */

const {logger, dockerlogger} = require("./logger.js")
const { store }  = require("../store/global.js")

export async function check_container_exists(container_name){
	return new Promise(function(resolve,reject){
		(async ()=>{
			var container = await store.docker.getContainer(container_name);
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

export const followStreamContainer = async function(stream, obj, container){
	
	stream.on("data", (data)=>{
		try{
			// stream.emit("error", new Error("bazinga"))
			obj.stream.push(formatBuffer(data))
		} catch(err){
			logger.error("error in getting data %s", err)
			dockerlogger.error("error in getting data %s", err)
			obj.errors = formatBuffer(err)
			throw err
		} finally{
			// logger.info("%s", formatBuffer(data))
			dockerlogger.info("%s", data)
			obj.stream = obj.stream.splice(-150)
		}
	})
	stream.on("error", (err)=>{
		try{
			logger.error("error found")
			logger.error("%s error in stream!", err)
			obj.stream.push(formatBuffer(err))
			dockerlogger.error("%s", formatBuffer(err))
			obj.errors = formatBuffer(err)
		} catch(error){
			logger.error("%s", err)
			dockerlogger.error("%s", err)
		}
	})
	stream.on("end", (data)=>{
		obj.running = false
		try {
    		obj.exists = true
    	} catch (err){
    		obj.running = false
    		logger.error("%s", err)
    		dockerlogger.error("%s", err)
    		obj.errors = formatBuffer(err)
    	}finally {
    		obj.running = false
    		if (obj.errors){
    			obj.stream.push(obj.errors)
    		}
    		else {
	    		obj.stream.push("Process complete")
    		}
	    	stream.destroy();
    	}
	})
}
export const followStreamBuild = async function(stream, obj){
	return new Promise(function(resolve,reject){
		if (stream){
			store.docker.modem.followProgress(stream, onFinished, onProgress)
		}
		obj.stream.push('Starting...', obj.name)
		async function onFinished(err, output) {
	    	try {
	    		obj.exists = true
	    	} catch (err){
	    		logger.error("%s", err)
	    		dockerlogger.error("%s", err)
				console.log(store.dockerStreamObjs[obj.name])
				store.dockerStreamObjs[obj.name] = null
	    		obj.running = false
	    	}finally {
	    		if (obj.errors){
	    			obj.stream.push(obj.errors)
					store.dockerStreamObjs[obj.name]
	    		} 
	    		else {
		    		obj.stream.push("Process complete")
	    		}
	    		obj.running = false
		    	stream.destroy();
				console.log(store.dockerStreamObjs[obj.name])
		    	store.dockerStreamObjs[obj.name] = null
	    	}
		}
	    function onProgress(event) {
	    	try{
	    		if (event.stream != undefined){	
					obj.stream.push((event.stream)); 
					dockerlogger.info("%s", event.stream)
				} else if (event.status != undefined){
					obj.stream.push((`${event.status} ${(event.progress ? event.progress : '')}`)); 					
					dockerlogger.info(`${event.status} ${(event.progress ? event.progress : '')}`)
				}
			} catch(err){
				logger.error(err)
				dockerlogger.error(err)
				obj.stream.push((event));  
			} finally{
				obj.stream = obj.stream.splice(-150)
			}
			if (event.error){
				obj.errors = event.error
				stream.destroy()
				console.log(store.dockerStreamObjs[obj.name])
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
			// container.modem.demuxStream(stream, process.stdout, process.stderr);
			logger.info("attaching stream to module "+container_name)
			obj.errors = false
			followStreamContainer(stream, obj, container)
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
					obj.errors = null
					obj.stream.push(formatBuffer(logs));
					(async ()=>{
	 					let stream = await attachStream(container, container_name, obj)
	 					obj.running = true
						resolve(stream)
					})().catch((errStream)=>{
						logger.error("%s stream error init", errStream)
						obj.running = false
						reject(errStream)
					})
				}
			})
		} catch(errOuter){
			logger.error("%s stream error init Outer", errOuter)
			obj.running = false
			reject(errOuter)
		}
	})
}

