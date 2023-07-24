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
    const path = require("path")
   const {store }  = require("./store")
  // Create a custom format for the log generation

export class Logger {
  errorFile: string;
  logFile: string;
  logger: any
  logs: string[] | Object[]
  errorLogs: string[]
  constructor(errorFile: string, logFile: string) {
    this.errorFile = errorFile
    this.logFile = logFile
    this.logs = ["Initiating Logs"]
    this.errorLogs = []
    this.logger = this.loggerBase(errorFile, logFile)
  }  
  info(message:string) {
    // get the 400 latest indices and then add the new message to the front of the array
    // this.logs.slice(-400).unshift(message)
    
    this.logs.push(message)
    this.logs = this.logs.slice(-400)
    this.logger.info(message)
    store.mainWindow.send('getLog', [message])
  }
  error(message: string ) {
    this.logs.slice(-400).unshift(message)
    this.errorLogs.slice(-200).unshift(message)
    this.logger.error(message)
    store.mainWindow.send('getLog', [message])
  }
    myFormat = printf(({ level, message, label, timestamp }) => {
      try{
        if (message.constructor === Object || message.constructor === Array    ) {
          message = JSON.stringify(message, null, 4)      // Send the logs to a string in JSON styling 
        }
        
      } catch(err){
        console.log(err)
      }
      console.log("messagE", message)
      return `${timestamp} [${level}]: ${message}`; // Export the time, level (like verbose, info, err), and main msg
    });
   
    loggerBase(errorFile: any, logFile: any){ 
      let logger = createLogger({ // Make the logger objct info, and set up custom formatting 
        format: combine(
          label({ label: 'server log' }),
          timestamp(),
          format.json(),
          format.splat(), 
          format.prettyPrint(),
          this.myFormat // <---- custom format function for stdout/stderr
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
   
    dockerlogger(dockerLogFile){
     // CURRENTLY NOT IN USE
     return createLogger({ // All docker containers can be piped so that stdout/stderr goes to another file
      level: 'info',
      format: combine(
        label({ label: 'server log' }),
        timestamp(),
        format.splat(),
        this.myFormat
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
  createLoggingObject ( name, folderPath ){
     let loggingObject = createLogger({
       level: 'info',
       format: combine(
         label({ label: 'server log' }),
         timestamp(),
         format.splat(),
         this.myFormat
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
   
  formatBuffer (data){
      // Remove an unncessary chars for parsing purposes 
       return data.toString().replace(/\u?([\0\1])(\w{1})?/g, '' )
   }
   
   // Make a log from a process directly spawned on the system 
   spawnLog ( stream, loggingObject ){ 
     let logCapture = {
       info: ["Initiating logging object...."]
     }
     stream.on("data", data => {
       let msg = `stdout: ${data}`
       msg = this.formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.info(msg)
       }
     });
   
   
     stream.on('error', (error) => {
       let msg = `error: ${error.message}`
       msg = this.formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.error(msg) 
       }
     });
   
     stream.on("close", code => {
       let msg = `child process exited with code ${code}`
       msg = this.formatBuffer(msg)
       logCapture.info.push(msg)
       if (loggingObject){
         loggingObject.info(msg)
       }
     });
     return logCapture
   }
   
   
   
   
   
    error_alert = function(err){
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
    
   
}
// module.exports = {
//   spawnLog,
//   logger
// }
   
   