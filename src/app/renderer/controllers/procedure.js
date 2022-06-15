import nestedProperty from "nested-property"
const path = require("path")
const lodash = require("lodash")  
const cloneDeep = require("lodash.clonedeep"); 

// Procedure 
// A procedure class is a conversion of a static YAML configuration for a procedure selected from the UI
// Instantiates getters/setters for anything defined as ${} in teh YAML file, updating accordingly in the UI as values change
// A procedure is always remade on re-selection from the UI
// All values are stored in the Vuex store for retrieval on later revisit. 


export  class Procedure {  // Make the main procedure class for configurations retrieved from the backend 
    constructor(config){    
        const $this = this    
        config = cloneDeep(config) 
        // Set all keys and values at root level in the procedure class from the base config
        Object.keys(config).forEach((key)=>{
            $this[key] = config[key]
        })
        // Define the getting and setting based on parsing the ${} of the yaml files
        this.defineMapping()
    }   
    defineStatus(){
        console.log("definestatus")
    }
    //
    // Define the getting and setting based on parsing the ${} of the yaml files
    //
    defineMapping(){ 
        this.findObjectByLabel(this, "(\%\{.+?\})") 
        console.log("Define")
        // newTarget  = this.findObjectByTarget(this, "(\&\{.+?\})")
    }     
 
    // recursive function, sets defined functions based on the yaml configurations 
    mapTargetFunctions(target, functions_list){   
        let functions = { 
            "directory": path.dirname, // get directory name function
            "notExists": null, // No defined function for this explicitly made, gathered in if else
            "exists": null, // No defined function for this explicitly made, gathered in if else
            "length": null, // No defined function for this explicitly made, gathered in if else
            "basename": path.basename, // Get basename of file or path
            "trim": path.parse // get the non-ext version of a path
        }

        // Match all values that are surrounded by << >> which indicates a function /
        // captures the function name before the << pattern 
        let inner_variables = target.match(/(?<=\<\<).*?(?=\>\>)/gs); 
        if (inner_variables && Array.isArray(inner_variables)){      // If any are in the config line
            inner_variables.forEach((vari)=>{ // Loop through all matches
                let function_identified = vari.match(/.*?(?=\()/gs); // Match the function (before the << )
                let matched_string = vari.match(/(?<=\().*?(?=\))/gs); // Match the values between << >>
                function_identified  = lodash.filter(function_identified, Boolean); // if function is in the functions list 
                matched_string = matched_string.join("") // Conver the array to a string if is an arr
                function_identified.forEach((f,i)=>{ // for all functions
                    let funcs = f.split(",")  // split the functions individually to arr
                    funcs.forEach((d)=>{ // for all functions
                        if (functions[d]){
                            let result;
                            if (d == 'notExists'){ // If the value doesnt exist
                                result  = ( matched_string ? false : true )
                            }
                            else if (d == 'length'){ // get the length of target
                                result = matched_string.length
                            } else { // Get the function result based on functions var above
                                result = functions[d](matched_string)
                                if (d == 'trim'){ // Remove file ext
                                    matched_string = result.name
                                } else { // return base val of function
                                    matched_string = result
                                }

                            }
                        }
                    })
                })
                // If there is <<>>, remove that and everything between it with the newly parsed string
                // target = target.replace(`<<${vari}>>`, matched_string)
            })
        } 
        return target
        
        
    }
    // Sets all variables for a given procedure, based on the YAML configurations
    setVariables(){  
        let defaultVariables = this.variables // Save all default variables just in case
        for (let [key, custom_variable] of Object.entries(this.variables)){ // Loop thorugh vars object
            let selected_option  = defaultVariables[key]
            let name = key;
            if (custom_variable){  // IF the variable is not predefined by the base yaml (user added it themselves)
                if (selected_option.options){ //Check if it is a multi option choice for the variable to render 
                    if (! custom_variable.option){ // If the selected option isn't already there, set it to the first in the list 
                        custom_variable.option = 0
                    }    
                    // if options for variable
                    if (custom_variable.option || custom_variable.option == 0 ){
                        let val = selected_option.options[custom_variable.option]
                        if (typeof val === 'object'){ // If the config is a list of element types
                            if (val.source){ // source value, outside of docker container
                                custom_variable.source = val.source
                            }
                            if (val.target){ // value in the docker container
                                custom_variable.target = val.target
                            }
                        } else {   
                            if (val.source){ // source value, outside of docker container
                                custom_variable.source = val
                            }
                            if (val.target){ // source value inside the docker container 
                                custom_variable.target = val
                            }
                        }
                        custom_variable.bind = val.bind
                    } 
                }   
            }
        }
    }
    // mapTargetFunctions(found, fullstring){
    //     let functions = { 
    //         "directory": path.dirname,
    //         "length": null,
    //         "basename": path.basename,
    //         "trim": path.parse
    //     }
    //     let inner_variables = fullstring.match(/(?<=\<\<).*?(?=\>\>)/gs); 
    //     if (inner_variables && Array.isArray(inner_variables)){      
    //         inner_variables.forEach((vari)=>{
    //             let function_identified = vari.match(/.*?(?=\()/gs); 
    //             function_identified  = lodash.filter(function_identified, Boolean);
    //             function_identified.forEach((f,i)=>{
    //                 let funcs = f.split(",") 
    //                 funcs.forEach((d)=>{ 
    //                     if (d in functions){
    //                         let result;
    //                         if (d == 'length'){ 
    //                             found = found.length
    //                         } else { 
    //                             result = functions[d](found)
    //                             if (d == 'trim'){
    //                                 found = result.name
    //                             } else {
    //                                 found = result
    //                             }

    //                         }
    //                     }
    //                 })
    //             })
    //             // target = target.replace(`<<${vari}>>`, matched_string)
    //         })
    //     } 
    //     return found

    // }
    // findObjectByTarget(obj, pattern) {
    //     const $this  = this
    //     if (obj && typeof obj == 'object'){
    //         Object.keys(obj).forEach(function (key) {
    //             if (typeof obj[key] === 'object') {
    //                 $this.findObjectByTarget(obj[key], pattern, $this) 
                     
    //                 // return null
    //             } else if (typeof obj[key] == 'string'){
    //                 // findObjectByLabel(obj[key], pattern, $this.config) 
    //                     var replace = `${pattern}`   
    //                     var re = new RegExp(replace,"g");
    //                     let fo = obj[key].match(re)    
    //                     if (fo ){ 
    //                         let original = cloneDeep(obj[key])
    //                         let saved_original = cloneDeep(obj[key])
    //                         Object.defineProperty(obj, key, {
    //                             enumerable: true,   
    //                             set: function(value){
    //                                 original = value
    //                             },
    //                             get: function(){ 
    //                                 let fullstring = cloneDeep(original)  
    //                                 let finals = []
    //                                 fo.forEach((match,i)=>{  
    //                                     let id; 
    //                                     let found; 
    //                                     try{  
                                             
    //                                         id = match.replace(/[\&\{\}]/g, "")
    //                                         found =  nestedProperty.get($this, id)
    //                                         // fullstring  = fullstring.replaceAll(match, found)  
    //                                         let returned_final = $this.mapTargetFunctions(found, fullstring)
    //                                         fullstring = returned_final                                  
                                             
    //                                     } catch(err)  {
    //                                         console.error("error in matching", match, id, found)
    //                                         console.error(err)
    //                                     }
    //                                 })
    //                                 // fullstring= $this.mapTargetFunctions(fullstring, obj.formatting)
    //                                 if (fullstring == 'undefined'){
    //                                     return null
    //                                 } else { 
    //                                     return fullstring
    //                                 }
    //                             }
    //                         })
    //                     }
    //             } else {
    //                 return 
    //             }
    //         }) 
    //     } 
    // }
    // findObjectByLink(obj, pattern) {
    //     const $this  = this
    //     if (obj && typeof obj == 'object'){
    //         Object.keys(obj).forEach(function (key) {
    //             if (typeof obj[key] === 'object') {
    //                 $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
    //                 // return null
    //             } else if (typeof obj[key] == 'string'){
                    
    //                 // findObjectByLabel(obj[key], pattern, $this.config) 
    //                     var replace = `${pattern}`   
    //                     var re = new RegExp(replace,"g");
    //                     let fo = obj[key].match(re)   
    //                     if (fo && Array.isArray(fo)){ 
                            
    //                         let original = cloneDeep(obj[key])
    //                         let saved_original = cloneDeep(obj[key])
    //                         Object.defineProperty(obj, key, {
    //                             enumerable: true,   
    //                             set: function(value){
    //                                 original = value
    //                             },
    //                             get: function(){ 
    //                                 let fullstring = cloneDeep(original)  
    //                                 fo.forEach((match,i)=>{  
    //                                     let id; 
    //                                     let found; 
    //                                     try{  
                                             
    //                                         id = match.replace(/[\%\{\}]/g, "")
    //                                         found =  nestedProperty.get($this, id)
    //                                         if (typeof found == 'string' || !found){
    //                                             fullstring  = fullstring.replaceAll(match, found)                                            
    //                                         } else {
    //                                             fullstring = found
    //                                         }
                                            
                                            
    //                                     } catch(err)  {
    //                                         console.error("error in matching", match, id, found)
    //                                         console.error(err)
    //                                     }
    //                                 })
    //                                 if (typeof fullstring == 'string'){
    //                                     fullstring= $this.mapFunctions(fullstring, obj.formatting)
    //                                 }
    //                                 if (fullstring == 'undefined'){
    //                                     return null
    //                                 } else { 
    //                                     return fullstring
    //                                 }
    //                             }
    //                         })
    //                     }
    //             } else {
    //                 return 
    //             }
    //         }) 
    //     } else if (typeof obj == 'string') { 
    //         var replace = `${pattern}`   
    //         var re = new RegExp(replace,"g");
    //         let fo = obj.match(re)  
    //         let fullstring = obj
    //         if (fo && Array.isArray(fo)){  
    //             fo.forEach((match)=>{  
    //                 try{
    //                     let id = match.replace(/[\%\{\}]/g, "")
    //                     Object.defineProperty(obj, )
    //                     obj = { 
    //                         get: function(){
    //                             let found =  nestedProperty.get($this, id)
    //                             fullstring  = fullstring.replaceAll(match, found)
    //                             if (fullstring == 'undefined'){
    //                                 return null
    //                             } else {
    //                                 return fullstring
    //                             }
    //                         }
    //                     }
    //                 } catch(err)  {
    //                     console.error(err)
    //                 }
    //             })
    //             return obj.get()
    //         }  else {
    //             return obj
    //         }
    //     } else {
    //         return obj
    //     }
    // }
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
                        // console.log(fo,"<<<<",re, obj[key]) 
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
                                            console.error(err)
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
                        console.error(err)
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