"use strict";
import nestedProperty from "nested-property"

var  { store }  = require("../../config/store/index.js") 
   
export function cacheParams( token, params){        
    if (!token){        
        token = 'development'          
    }     
    let tokenVals = store.server.cache.get(token)      
    nestedProperty.set(tokenVals, `catalog.${params.catalog}.${params.module}.${params.procedure}.${params.service}.${params.variable}.${(params.target)}`, params.value)
	store.server.cache.set(params.token, tokenVals)
    return       
} 
    
export function createCache(){
    const NodeCache = require( "node-cache" );
    const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
    return myCache  
} 

// module.exports = redisClient; 