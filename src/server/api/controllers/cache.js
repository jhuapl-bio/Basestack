"use strict";
import nestedProperty from "nested-property"

const {promisify} = require("util");
// const config = require('./config')
  
var  { store }  = require("../../config/store/index.js")
  
export function cacheParams( token, params){
    if (!token){
        token = 'development' 
    } 
    let tokenVals = store.server.cache.get(token)  
    // let value = target.value 
    // let attr = target.src
    // let obj = store.server.cache.get(token) 
    // for(let [key, val] of Object.entries(value)){
    //     if (val && val.source || val.source == 0 ){
    //         nestedProperty.set(obj, `${attr}.${key}.source`,  val.source)
    //     }
    //     if (val  &&  val.option || val.option == 0){
    //         nestedProperty.set(obj, `${attr}.${key}.option`, val.option)
    //     } 
         
    // }
    // store.server.cache.set(token, obj)
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