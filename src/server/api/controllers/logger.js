/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
import path  from "path"
var  { store }  = require("../../config/store/index.js")
const myFormat = printf(({ level, message, label, timestamp }) => {
  try{
    if (message.constructor === Object || message.constructor === Array    ) {
      message = JSON.stringify(message, null, 4)      
    }
    
  } catch(err){
    logger.error(err)
  }
  return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
  level: 'info',
  format: combine(
    label({ label: 'server log' }),
    timestamp(),
    format.json(),
    format.splat(),
    format.prettyPrint(),
    myFormat 
  ),
  exitOnError: false,
  prettyPrint: true, 
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: store.system.logs.error, maxsize: 2000000,  maxFiles: 1, level: 'error', tailable:true, options: { flags: 'a' } }),
    new transports.File({ filename: store.system.logs.info, maxsize: 2000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
  ]
});

export const dockerlogger = createLogger({
  level: 'info',
  format: combine( 
    label({ label: 'server log' }),
    timestamp(),
    format.splat(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: store.system.logs.docker, maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
  ]
});
export const createLoggingObject = function( name ){
  let loggingObject = createLogger({
    level: 'info',
    format: combine(
      label({ label: 'server log' }),
      timestamp(),
      format.splat(),
      myFormat
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
      //
      // - Write to all logs with level `info` and below to `combined.log` 
      // - Write all logs error (and below) to `error.log`.
      //
      new transports.File({ filename: path.join(store.system.logs.path, `${name}.log`), maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
    ]
  })
  return loggingObject
}

const formatBuffer = function(data){
	return data.toString().replace(/\u?([\0\1])(\w{1})?/g, '' )
}


export const spawnLog =  function( stream, loggingObject ){
  let logCapture = {
    info: ["Initiating logging object...."]
  }
  stream.on("data", data => {
    let msg = `stdout: ${data}`
    msg = formatBuffer(msg)
    logger.info(msg);
    logCapture.info.push(msg)
    if (loggingObject){
      loggingObject.info(msg)
    }
  });

  // stream.on("data", data => {
  //   let msg = `stderr: ${data}`
  //   msg = formatBuffer(msg)
  //   logger.error(msg);
  //   logCapture.info.push(msg)
  //   if (loggingObject){
  //     loggingObject.error(msg)
  //   }
  // });

  stream.on('error', (error) => {
    let msg = `error: ${error.message}`
    msg = formatBuffer(msg)
    logger.error(msg);
    logCapture.info.push(msg)
    if (loggingObject){
      loggingObject.error(msg) 
    }
  });

  stream.on("close", code => {
    let msg = `child process exited with code ${code}`
    msg = formatBuffer(msg)
    logCapture.info.push(msg)
    logger.info(msg);
    if (loggingObject){
      loggingObject.info(msg)
    } 
  });
  return logCapture
}
 




export var error_alert = function(err){
  let text = err;
  if (!err){
    return "Error"
  }
  if (typeof(err) == 'string'){
    text = err
  }
  else if (err.errno == 'ENOENT'){
    text = "Could not connect to docker"
  } else if(err.json){
    if (err.json.message){  
      text = err.json.message
    } else {
      try{
        if (Buffer.isBuffer(err.json)){
          err.json = err.json.toString()
        }
        text = JSON.stringify(err.json, null, 4)
      } catch(error){
        logger.info(`Could not stringify json error message ${error}`)
        text = err.json
      }
    } 
  } 
  else if (err.message){
    text = err.message    
  }
  else {
    try{
      text = JSON.stringify(err, null, 4)
    } catch(error){
      logger.info(`Could not stringify error message ${err}`)
      text = err
    }
  }
  let return_response = text;
  try{
    return_response = decodeURIComponent(JSON.parse(text))
    // return_response = return_response.slice(0,500)
  } catch(err){
    return_response = text
  }
  return return_response
}
 



//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console());
}



// export async function init_container_logs(container_name){
// 	return new Promise(function(resolve,reject){
// 		try{
// 			(async ()=>{
// 				const response = await check_container_exists(container_name);
// 				if (!response.exists){
// 					let obj = store.modules[container_name]
// 					initDockerLogs(response.container, container_name, obj).then(()=>{
// 			  			resolve()
// 		  			}).catch((errLog)=>{
// 		  				logger.error("%s %s","Error in initiating docker logs, container: ",  errLog)
// 		  				reject(errLog)
// 		  			})
// 		  		} else {
// 		  			resolve()
// 		  		}
//   			})().catch((error)=>{
//   				logger.error("%s error initiating dockerlogs", error)
//   				reject(error)
//   			})
// 		} catch(err){
// 			console.error(err)
// 			reject(err)
// 		}
// 	})
// }

// export const followStreamContainer = async function(stream, obj, container){
	
// 	stream.on("data", (data)=>{
// 		try{
// 			// stream.emit("error", new Error("bazinga"))
// 			obj.stream.push(formatBuffer(data))
// 		} catch(err){
// 			logger.error("error in getting data %s", err)
// 			dockerlogger.error("error in getting data %s", err)
// 			obj.errors = formatBuffer(err)
// 			throw err
// 		} finally{
// 			// logger.info("%s", formatBuffer(data))
// 			dockerlogger.info("%s", data)
// 			obj.stream = obj.stream.splice(-150)
// 		}
// 	})
// 	stream.on("error", (err)=>{
// 		try{
// 			logger.error("error found")
// 			logger.error("%s error in stream!", err)
// 			obj.stream.push(formatBuffer(err))
// 			dockerlogger.error("%s", formatBuffer(err))
// 			obj.errors = formatBuffer(err)
// 		} catch(error){
// 			logger.error("%s", err)
// 			dockerlogger.error("%s", err)
// 		}
// 	})
// 	stream.on("end", (data)=>{
// 		obj.running = false
// 		try {
//     		obj.exists = true
//     	} catch (err){
//     		obj.running = false
//     		logger.error("%s", err)
//     		dockerlogger.error("%s", err)
//     		obj.errors = formatBuffer(err)
//     	}finally {
//     		obj.running = false
//     		if (obj.errors){
//     			obj.stream.push(obj.errors)
//     		}
//     		else {
// 	    		obj.stream.push("Process complete")
//     		}
// 	    	stream.destroy();
//     	}
// 	})
// }
// export const followStreamBuild = async function(stream, obj){
// 	return new Promise(function(resolve,reject){
// 		if (stream){
// 			store.docker.modem.followProgress(stream, onFinished, onProgress)
// 		}
// 		obj.stream.push('Starting...', obj.name)
// 		async function onFinished(err, output) {
// 	    	try {
// 	    		obj.exists = true
// 	    	} catch (err){
// 	    		logger.error("%s", err)
// 	    		dockerlogger.error("%s", err)
//   				store.dockerStreamObjs[obj.name] = null
// 	    		obj.running = false
// 	    	}finally {
// 	    		if (obj.errors){
// 	    			obj.stream.push(obj.errors)
// 					store.dockerStreamObjs[obj.name]
// 	    		} 
// 	    		else {
// 		    		obj.stream.push("Process complete")
// 	    		}
// 	    		obj.running = false
// 		    	stream.destroy();
// 		    	store.dockerStreamObjs[obj.name] = null
// 	    	}
// 		}
// 	    function onProgress(event) {
// 	    	try{
// 	    		if (event.stream != undefined){	
// 					obj.stream.push((event.stream)); 
// 					dockerlogger.info("%s", event.stream)
// 				} else if (event.status != undefined){
// 					obj.stream.push((`${event.status} ${(event.progress ? event.progress : '')}`)); 					
// 					dockerlogger.info(`${event.status} ${(event.progress ? event.progress : '')}`)
// 				}
// 			} catch(err){
// 				logger.error(err)
// 				dockerlogger.error(err)
// 				obj.stream.push((event));  
// 			} finally{
// 				obj.stream = obj.stream.splice(-150)
// 			}
// 			if (event.error){
// 				obj.errors = event.error
// 				stream.destroy()
// 				store.dockerStreamObjs[obj.name] = null
// 			}
// 	    }
// 	})


// }


// //Docker logging for the frontend. Only operates on currently running docker containers
// export const attachStream = async function(container,container_name, obj){
// 	return new Promise(function(resolve,reject){
// 		container.attach({stream: true, stdout: true, stderr: true}, function (err, stream) {
// 			if(err){
// 				logger.error("%s Error attaching stream", err)
// 				reject(err)
// 			}
// 			// container.modem.demuxStream(stream, process.stdout, process.stderr);
// 			logger.info("attaching stream to module "+container_name)
// 			obj.errors = false
// 			followStreamContainer(stream, obj, container)
// 			resolve(stream)
// 		});
// 	})
// }

// export const initDockerLogs = function(container, container_name, obj){
// 	return new Promise(function(resolve,reject){
// 		try {
// 			container.logs({stdout:true, stderr:true}, function(err, logs){
// 				if (err){
// 					reject(err)
// 				} else {
// 					obj.errors = null
// 					obj.stream.push(formatBuffer(logs));
// 					(async ()=>{
// 	 					let stream = await attachStream(container, container_name, obj)
// 	 					obj.running = true
// 						resolve(stream)
// 					})().catch((errStream)=>{
// 						logger.error("%s stream error init", errStream)
// 						obj.running = false
// 						reject(errStream)
// 					})
// 				}
// 			})
// 		} catch(errOuter){
// 			logger.error("%s stream error init Outer", errOuter)
// 			obj.running = false
// 			reject(errOuter)
// 		}
// 	})
// }
