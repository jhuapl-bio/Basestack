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
  //  const { store }  = require("../../config/store/index.js")
  // Create a custom format for the log generation
   const myFormat = printf(({ level, message, label, timestamp }) => {
     try{
       if (message.constructor === Object || message.constructor === Array    ) {
         message = JSON.stringify(message, null, 4)      // Send the logs to a string in JSON styling 
       }
       
     } catch(err){
       console.log(err)
     }
     return `${timestamp} [${level}]: ${message}`; // Export the time, level (like verbose, info, err), and main msg
   });
   
   export function logger(errorFile, logFile){ 
    let logger = createLogger({ // Make the logger objct info, and set up custom formatting 
      level: 'info',
      format: combine(
        label({ label: 'server log' }),
        timestamp(),
        format.json(),
        format.splat(),
        format.prettyPrint(),
        myFormat // <---- custom format function for stdout/stderr
      ),
      exitOnError: false,
      prettyPrint: true, 
      defaultMeta: { service: 'user-service' },
      transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log` 
        // - Write all logs error (and below) to `error.log`.
        // - Write max size in MB as 2 MB
        //
        new transports.File({ filename: errorFile, maxsize: 2000000,  maxFiles: 1, level: 'error', tailable:true, options: { flags: 'a' } }),
        new transports.File({ filename: logFile, maxsize: 2000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
      ]})
         
      //
      // If we're not in production then log to the `console` with the format:
      // `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
      // 
      if (process.env.NODE_ENV !== 'production') {
        logger.add(new transports.Console());
      }
      return logger
  
   }
   
   export function dockerlogger(dockerLogFile){
     // CURRENTLY NOT IN USE
     return createLogger({ // All docker containers can be piped so that stdout/stderr goes to another file
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
        // - Max size is 1MB
        //
        new transports.File({ filename: dockerLogFile, maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
      ]
    });
   }
   export const createLoggingObject = function( name, folderPath ){
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
         // - Max size is 1MB
         //
         new transports.File({ filename: path.join(folderPath, `${name}.log`), maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
       ]
     })
     return loggingObject
   }
   
   const formatBuffer = function(data){
      // Remove an unncessary chars for parsing purposes 
       return data.toString().replace(/\u?([\0\1])(\w{1})?/g, '' )
   }
   
   // Make a log from a process directly spawned on the system 
   export const spawnLog =  function( stream, loggingObject ){ 
     let logCapture = {
       info: ["Initiating logging object...."]
     }
     stream.on("data", data => {
       let msg = `stdout: ${data}`
       msg = formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.info(msg)
       }
     });
   
   
     stream.on('error', (error) => {
       let msg = `error: ${error.message}`
       msg = formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.error(msg) 
       }
     });
   
     stream.on("close", code => {
       let msg = `child process exited with code ${code}`
       msg = formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.info(msg)
       }
     });
     return logCapture
   }
   
   
   
   
   
   export var error_alert = function(err){
     let text = err;
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
           console.log(`Could not stringify json error message ${err}`)
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
         console.log(`Could not stringify error message ${err}`)
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
    
   
   

   
   
   