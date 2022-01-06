import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep");

const { mapVariables, validateFramework } = require("../controllers/validate.js")
const { store }  = require("../../config/store/index.js")


export  class Configuration { 
    constructor(config, variables){
        this.config = config
        this.variables = variables
    }
    
}