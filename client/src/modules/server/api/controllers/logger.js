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
const { meta } = require("../store/index.js")
const myFormat = printf(({ level, message, label, timestamp }) => {
  try{
    if (message.constructor === Object || message.constructor === Array) {
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
    format.splat(),
    myFormat
  ),
  defaultMeta: { service: 'user-service' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `combined.log` 
    // - Write all logs error (and below) to `error.log`.
    //
    new transports.File({ filename: meta.errorLogFile, maxsize: 2000000,  maxFiles: 1, level: 'error', tailable:true, options: { flags: 'a' } }),
    new transports.File({ filename: meta.logFile, maxsize: 2000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
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
    new transports.File({ filename: meta.dockerLogFile, maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
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
    new transports.File({ filename: meta.dockerLogFile, maxsize: 1000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
  ]
});


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
        logger.info(`Could not stringify json error message ${err}`)
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