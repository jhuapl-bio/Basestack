"use strict";
import nestedProperty from "nested-property"

const {promisify} = require("util");
// const config = require('./config')

var  { store }  = require("../../config/store/index.js")
 
export function cacheParams( token, target){
    if (!token){
        token = 'development' 
    } 
    let value = target.value
    let attr = target.src
    let obj = store.server.cache.get(token) 
    for(let [key, val] of Object.entries(value)){
        if (val && val.source){
            nestedProperty.set(obj, `${attr}.${key}.source`,  val.source)
        }
        if (val && val.option){
            nestedProperty.set(obj, `${attr}.${key}.option`, val.option)
        } 
        
    }
    store.server.cache.set(token, obj)
  
    return obj 
}

export function createCache(){
    const NodeCache = require( "node-cache" );
    const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
    return myCache 
} 

// module.exports = redisClient;