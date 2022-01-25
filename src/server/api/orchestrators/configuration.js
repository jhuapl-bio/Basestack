import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
import { mapVariables } from '../controllers/mapper.js';
 
const { store }  = require("../../config/store/index.js")
   
    
export  class Configuration { 
    constructor(config, options){       
        this.config = config 
        this.options = options  
    }  
    defineMapping(){
        let newTarget = this.findObjectByLabel(this.config, "(\%\{.+?\})")
    }     
    setVariables(custom_variables){ 
        let defaultVariables = this.config.variables
        for (let [key, custom_variable] of Object.entries(custom_variables)){
            let selected_option  = defaultVariables[key]
            let name = key;
            if (custom_variable){ 
                if (selected_option.options){ 
                    if (! custom_variable.option){
                        custom_variable.option = 0
                    }   
                    let true_value = selected_option.options[custom_variable.option]
                    if (custom_variable.option || custom_variable.option == 0 ){
                        let val = selected_option.options[custom_variable.option]
                        if (typeof val === 'object'){
                            let g = mapVariables(val.target, val.variables)
                            let source = mapVariables(val.source, val.variables)   
                            true_value.source = source  
                            true_value.target = g  
                        } else {   
                            let g = mapVariables(val, val.variables)
                            true_value = {
                                source: g, 
                                target: g
                            }   
                        }
                        custom_variable = { 
                            ...true_value,
                            ...custom_variable   
                            }
                    } 
                }   
            }
            (custom_variable.source ? selected_option.source = custom_variable.source : '' ) ;
            (custom_variable.target ? selected_option.target = custom_variable.target : '' ) ;
            this.config.variables[key] = { 
                ...selected_option,   
                ...custom_variable      
            }  
        }
    }
    findObjectByLabel(obj, pattern) {
        const $this  = this
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
                if (typeof obj[key] === 'object') {
                    $this.findObjectByLabel(obj[key], pattern, $this.config) 
                    
                    // return null
                } else if (typeof obj[key] == 'string'){
                    // findObjectByLabel(obj[key], pattern, $this.config) 
                        var replace = `${pattern}`   
                        var re = new RegExp(replace,"g");
                        let fo = obj[key].match(re)  
                        let fullstring = obj[key]
                        if (fo && Array.isArray(fo)){  
                            fo.forEach((match)=>{  
                                try{
                                    let id = match.replace(/[\%\{\}]/g, "")
                                    Object.defineProperty(obj, key, {
                                        get: function(){ 
                                            let found =  nestedProperty.get($this.config, id)
                                            fullstring  = fullstring.replaceAll(match, found)
                                            if (fullstring == 'undefined'){
                                                return null
                                            } else { 
                                                return fullstring
                                            }
                                        }
                                    })
                                    
                                        
                                    
                                } catch(err)  {
                                    store.logger.error(err)
                                }
                            })
                    } 
                } else {
                    return 
                }
            }) 
        } else if (typeof obj == 'string') { 
            var replace = `${pattern}`   
            var re = new RegExp(replace,"g");
            let fo = obj.match(re)  
            let fullstring = obj
            if (fo && Array.isArray(fo)){  
                fo.forEach((match)=>{  
                    try{
                        let id = match.replace(/[\%\{\}]/g, "")
                        Object.defineProperty(obj, )
                        obj = { 
                            get: function(){
                                let found =  nestedProperty.get($this.config, id)
                                fullstring  = fullstring.replaceAll(match, found)
                                if (fullstring == 'undefined'){
                                    return null
                                } else {
                                    return fullstring
                                }
                            }
                        }
                    } catch(err)  {
                        store.logger.error(err)
                    }
                })
                return obj.get()
            }  else {
                return obj
            }
        } else {
            return obj
        }
    }
    
}