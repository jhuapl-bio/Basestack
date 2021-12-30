import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep");

const { mapVariables, validateFramework } = require("../controllers/validate.js")
const { store }  = require("../../config/store/index.js")


export  class Configuration { 
    constructor(config, variables){
        this.config = config
        this.variables = variables
    }
    findObjectByLabel(obj, pattern, fullObj) {
        const $this  = this
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
                if (typeof obj[key] === 'object') {
                    $this.findObjectByLabel(obj[key], pattern, fullObj) 
                    // return null
                } else if (typeof obj[key] === 'string'){  
                    var replace = `${pattern}` 
                    var re = new RegExp(replace,"g");
                    let fullstring = cloneDeep(obj[key])
                    let fo = obj[key].match(re)   
                    if (fo && Array.isArray(fo)){  
                        fo.forEach((match)=>{ 
                            try{
                                let id = match.replace(/[\%\{\}]/g, "")
                                Object.defineProperty(obj, key, {
                                    get: function(){
                                        let found =  nestedProperty.get(fullObj, id)
                                        fullstring  = fullstring.replaceAll(match, found)
                                        return  fullstring
                                    } 
                                })
                            } catch(err)  {
                                store.logger.error(err)
                            }
                        }) 
                    } 
                    return obj[key]
                }
                else{
                    return null
                }
            })
        } else {
            return null
        }
    }
    mapConfigurations(){
        let configuration_string = this.config; let variables = this.variables
        for (let [key, value] of Object.entries(variables)){
            var replace = `\\$\\{${key}\\}`
            var re = new RegExp(replace,"g");
            configuration_string = configuration_string.replace(re, value.target    )
        } 
        configuration_string = JSON.parse(configuration_string)
        let founds = this.findObjectByLabel(configuration_string, "(\%\{.+\})", configuration_string)
        this.config = configuration_string
        return configuration_string
    
    }
}