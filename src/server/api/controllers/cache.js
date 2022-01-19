"use strict";

const {promisify} = require("util");
// const config = require('./config')



export function createCache(redis_port, redis_host){
    const NodeCache = require( "node-cache" );
    const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
    return myCache 
} 

// module.exports = redisClient;