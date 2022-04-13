import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
const path = require("path")   
const lodash = require("lodash")  
const { readFile, checkExists } = require("./IO.js") 
export  class Status {    
    constructor(outputs){            
        console.log(outputs,"<<<<")
    }   
    defineStatus(){ 
        console.log("definestatus")
    }     
    
    
}