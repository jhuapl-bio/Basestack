import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
import { mapVariables } from '../controllers/mapper.js';
const path = require("path")   
const { store }  = require("../../config/store/index.js")
const lodash = require("lodash")  
       
export  class Configuration {    
    constructor(config){            
        this.variables = {}  
        // this.config = config   
        for(let[key, value] of Object.entries(config)){
            this[key] = value
        }
    }   
    defineMapping(){ 
        let newTarget = this.findObjectByLabel(this, "(\%\{.+?\})") 
        newTarget  = this.findObjectByTarget(this, "(\&\{.+?\})")
    }     
 

    mapFunctions(target, functions_list){   
        let functions = { 
            "directory": path.dirname,
            "notExists": null,
            "exists": null,
            "length": null,
            "basename": path.basename,
            "trim": path.parse
        }
        const $this  = this
        let regexp =  /\^\(.+?\)/g;
        let inner_variables = target.match(/(?<=\<\<).*?(?=\>\>)/gs); 
        if (inner_variables && Array.isArray(inner_variables)){      
            inner_variables.forEach((vari)=>{
                let function_identified = vari.match(/.*?(?=\()/gs); 
                let matched_string = vari.match(/(?<=\().*?(?=\))/gs); 
                function_identified  = lodash.filter(function_identified, Boolean);
                matched_string = matched_string.join("")
                function_identified.forEach((f,i)=>{
                    let funcs = f.split(",") 
                    funcs.forEach((d)=>{ 
                        if (functions[d]){
                            let result;
                            if (d == 'notExists'){
                                result  = ( matched_string ? false : true )
                            }
                            else if (d == 'length'){ 
                                result = matched_string.length
                            } else {
                                result = functions[d](matched_string)
                                if (d == 'trim'){
                                    matched_string = result.name
                                } else {
                                    matched_string = result
                                }

                            }
                        }
                    })
                })
                target = target.replace(`<<${vari}>>`, matched_string)
            })
        } 
        return target
        
        
    }
    setVariables(){ 
        let defaultVariables = this.variables
        for (let [key, custom_variable] of Object.entries(this.variables)){
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
                            if (val.source){
                                custom_variable.source = val.source
                            }
                            if (val.target){
                                custom_variable.target = val.target
                            }
                        } else {   
                            if (val.source){
                                custom_variable.source = val
                            }
                            if (val.target){
                                custom_variable.target = val
                            }
                        }
                        custom_variable.bind = val.bind
                        // custom_variable = { 
                        //     ...true_value,
                        //     ...custom_variable   
                        //     }
                    } 
                }   
            }
            // (custom_variable.source ? selected_option.source = custom_variable.source : '' ) ;
            // (custom_variable.target ? selected_option.target = custom_variable.target : '' ) ;
            // this.variables[key] = { 
            //     ...selected_option,   
            //     ...custom_variable      
            // }  
        }
    }
    mapTargetFunctions(found, fullstring){
        let returned_final = []
        let functions = { 
            "directory": path.dirname,
            "length": null,
            "basename": path.basename,
            "trim": path.parse
        }
        const $this  = this
        let regexp =  /\^\(.+?\)/g;
        let target = found
        let inner_variables = fullstring.match(/(?<=\<\<).*?(?=\>\>)/gs); 
        if (inner_variables && Array.isArray(inner_variables)){      
            inner_variables.forEach((vari)=>{
                let function_identified = vari.match(/.*?(?=\()/gs); 
                function_identified  = lodash.filter(function_identified, Boolean);
                function_identified.forEach((f,i)=>{
                    let funcs = f.split(",") 
                    funcs.forEach((d)=>{ 
                        if (d in functions){
                            let result;
                            if (d == 'length'){ 
                                found = found.length
                            } else { 
                                result = functions[d](found)
                                if (d == 'trim'){
                                    found = result.name
                                } else {
                                    found = result
                                }

                            }
                        }
                    })
                })
                // target = target.replace(`<<${vari}>>`, matched_string)
            })
        } 
        return found

    }
    findObjectByTarget(obj, pattern) {
        const $this  = this
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
                if (typeof obj[key] === 'object') {
                    $this.findObjectByTarget(obj[key], pattern, $this) 
                     
                    // return null
                } else if (typeof obj[key] == 'string'){
                    // findObjectByLabel(obj[key], pattern, $this.config) 
                        var replace = `${pattern}`   
                        var re = new RegExp(replace,"g");
                        let fo = obj[key].match(re)    
                        if (fo ){ 
                            let original = cloneDeep(obj[key])
                            let saved_original = cloneDeep(obj[key])
                            Object.defineProperty(obj, key, {
                                enumerable: true,   
                                set: function(value){
                                    original = value
                                },
                                get: function(){ 
                                    let fullstring = cloneDeep(original)  
                                    let finals = []
                                    fo.forEach((match,i)=>{  
                                        let id; 
                                        let found; 
                                        try{  
                                             
                                            id = match.replace(/[\&\{\}]/g, "")
                                            found =  nestedProperty.get($this, id)
                                            // fullstring  = fullstring.replaceAll(match, found)  
                                            let returned_final = $this.mapTargetFunctions(found, fullstring)
                                            fullstring = returned_final                                  
                                             
                                        } catch(err)  {
                                            console.error("error in matching", match, id, found)
                                            store.logger.error(err)
                                        }
                                    })
                                    // fullstring= $this.mapTargetFunctions(fullstring, obj.formatting)
                                    if (fullstring == 'undefined'){
                                        return null
                                    } else { 
                                        return fullstring
                                    }
                                }
                            })
                        }
                } else {
                    return 
                }
            }) 
        } 
    }
    findObjectByLink(obj, pattern) {
        const $this  = this
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
                if (typeof obj[key] === 'object') {
                    $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
                    // return null
                } else if (typeof obj[key] == 'string'){
                    
                    // findObjectByLabel(obj[key], pattern, $this.config) 
                        var replace = `${pattern}`   
                        var re = new RegExp(replace,"g");
                        let fo = obj[key].match(re)   
                        if (fo && Array.isArray(fo)){ 
                            
                            let original = cloneDeep(obj[key])
                            let saved_original = cloneDeep(obj[key])
                            Object.defineProperty(obj, key, {
                                enumerable: true,   
                                set: function(value){
                                    original = value
                                },
                                get: function(){ 
                                    let fullstring = cloneDeep(original)  
                                    fo.forEach((match,i)=>{  
                                        let id; 
                                        let found; 
                                        try{  
                                             
                                            id = match.replace(/[\%\{\}]/g, "")
                                            found =  nestedProperty.get($this, id)
                                            if (typeof found == 'string' || !found){
                                                fullstring  = fullstring.replaceAll(match, found)                                            
                                            } else {
                                                fullstring = found
                                            }
                                            
                                            
                                        } catch(err)  {
                                            console.error("error in matching", match, id, found)
                                            store.logger.error(err)
                                        }
                                    })
                                    if (typeof fullstring == 'string'){
                                        fullstring= $this.mapFunctions(fullstring, obj.formatting)
                                    }
                                    if (fullstring == 'undefined'){
                                        return null
                                    } else { 
                                        return fullstring
                                    }
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
                                let found =  nestedProperty.get($this, id)
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
    findObjectByLabel(obj, pattern) {
        const $this  = this
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
                if (typeof obj[key] === 'object') {
                    $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
                    // return null
                } else if (typeof obj[key] == 'string'){
                    
                    // findObjectByLabel(obj[key], pattern, $this.config) 
                        var replace = `${pattern}`   
                        var re = new RegExp(replace,"g");
                        let fo = obj[key].match(re)   
                        if (fo && Array.isArray(fo)){ 
                            
                            let original = cloneDeep(obj[key])
                            let saved_original = cloneDeep(obj[key])
                            Object.defineProperty(obj, key, {
                                enumerable: true,   
                                set: function(value){
                                    original = value
                                },
                                get: function(){ 
                                    let fullstring = cloneDeep(original)  
                                    fo.forEach((match,i)=>{  
                                        let id; 
                                        let found; 
                                        try{  
                                            id = match.replace(/[\%\{\}]/g, "")
                                            found =  nestedProperty.get($this, id)
                                            // console.log("yes",found.variables, id, key, )
                                            if (typeof found == 'string' || !found){
                                                fullstring  = fullstring.replaceAll(match, found)                                            
                                            } else {
                                                fullstring = found
                                            }
                                            
                                        } catch(err)  {
                                            console.error("error in matching", match, id, found)
                                            store.logger.error(err)
                                        }
                                    })
                                    if (typeof fullstring == 'string'){
                                        fullstring= $this.mapFunctions(fullstring, obj.formatting)
                                    }
                                    
                                    if (fullstring == 'undefined'){
                                        return null
                                    } else { 
                                        return fullstring
                                    }
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
                                let found =  nestedProperty.get($this, id)
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