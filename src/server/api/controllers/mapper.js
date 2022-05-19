import nestedProperty from "nested-property"
const path  = require("path")
const { store }  = require("../../config/store/index.js")



export function mapCacheVariables(variables, service, token){ // cache the variables for later retrieval if necessary
    let tokenVals = store.server.cache.get(token)  // based on the unique token of the user, get the cached vars
    let cachedVariables = nestedProperty.get(tokenVals, `services.${service}.variables`)
    if (cachedVariables){
        for(let [key, value ] of Object.entries(cachedVariables)){
            if (value.option){ // If the variable has a multichoice element input, adjust it here
                variables[key].option = value.option
            }
            if (value.source){ // If the regular source value is present, adjust it here
                variables[key].source = value.source
                
            } 
        }
    }
    return variables
}
