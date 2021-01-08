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
    new transports.File({ filename: meta.errorLogFile, maxsize: 10000000,  maxFiles: 1, level: 'error', tailable:true, options: { flags: 'a' } }),
    new transports.File({ filename: meta.logFile, maxsize: 10000000, maxFiles: 1,  tailable: true, options: { flags: 'a' } })
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
    text = err.json.message
  } 
  else {
    text = err.message
  }
  return text
}
 
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
// 
if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console({
    format: format.simple()
  }));
}