import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
const path = require("path")   
const lodash = require("lodash")    
const { module_status } = require("./watcher.js")
const {readFile, checkExists, readCsv} = require("./IO.js") 

// Configuration 
// A configuration class is a conversion of a static YAML configuration for a procedure selected from the UI
// Instantiates getters/setters for anything defined as ${} in teh YAML file, updating accordingly in the UI as values change
// A procedure is always remade on re-selection from the UI
// All values are stored in the Vuex store for retrieval on later revisit. 


export  class Configuration {     // Make the main procedure class for configurations retrieved from the backend 
    constructor(config){             
        // Set all keys and values at root level in the procedure class from the base config
        for(let[key, value] of Object.entries(config)){
            this[key] = value
        }
        this.variables = config.variables
        this.watches = []
        this.watcher = null
        this.log = []
        // const obj = {
        //     get latest() { // iterate through the logs
        //       if (this.log.length === 0) {
        //         return undefined;
        //       }
        //       return this.log[this.log.length - 1];
        //     }
          
        // };
        // this.obj = obj
        this.config = config
       
        this.setDefaultVariables()
    }   
    destroy_interval(){
        if (this.watcher){
            try{
                clearInterval(this.watcher)
            } catch(err){
                console.error(err)

            }
        }
    }
    setDefaultVariables(){
        for (let [key, custom_variable] of Object.entries(this.config.variables)){ // loop through variables
            if (!custom_variable.option && custom_variable.options){ // If no option selected for multi option variable, set to first index
                custom_variable.option = 0
            } 
            if (custom_variable.option >=0 && !custom_variable.source){
                if (typeof custom_variable.options[custom_variable.option] == 'object'){ // if the variable has multiple choices of elements, set to the options source as source for variable
                    custom_variable.source = custom_variable.options[custom_variable.option].source
                } else {   
                    custom_variable.source = custom_variable.options[custom_variable.option] /// if param is not an option, set base source
                }
            }        
        } 
    }
    create_intervalWatcher(){ // set status checker at interval of 2000 milliseconds
        const $this = this;  
        $this.destroy_interval() // If creating, destroy any existing one to ensure no parallel processes doing same thing
        $this.getProgress().then((f)=>{ // Figure out the status of the output files
            $this.watches = f 
        })    
        this.watcher = setInterval(()=>{ 
            $this.getProgress().then((f)=>{ // Figure out the status of the output files
                $this.watches = f
            }).catch((err)=>{ 
                console.error(err,"Error in watcher")
            })
        },2000)
    }
    mergeInputs(params, path){
        if (!path){
            path = "" 
        }
        const $this = this;
        for (let [key, custom_variable] of Object.entries(params)){ // move thru all elements of the object 
            if (custom_variable && !custom_variable.element != 'confguration-file'){ // deprecated config file, 
                if ( custom_variable && typeof custom_variable == 'object' ){
                    this.mergeInputs(custom_variable, `${path}${(path !== '' ? "." : "")}${key}`) // convert the store stored value for a variable to the new source
                } else {
                    if (custom_variable){ 
                        
                        nestedProperty.set($this, `${path}.${key}`, custom_variable)
                    }
                }
            }
            
        }
        
    } 
    async getProgress(){ // Find out how many outputs are done
        const $this = this; 
        return new Promise(function(resolve,reject){
            try{
                let variables = (  $this.variables )
                let promises = [] 
                let watches = []
                if (variables ){ 
                    let filtered_outputs = Object.values(variables).filter((value, key)=>{
                        return value.output // Only select the variables that are meant as outputs based on the .output attribute
                    })
                    filtered_outputs.forEach((filtered,key)=>{ // Check the status of the module
                        promises.push(module_status(filtered, key, ))
                    })
                    Promise.allSettled(promises).then((response)=>{
                        response.forEach((resp, index)=>{
                            if (resp.status == 'fulfilled'){
                                //Assign the output variable to the new array
                                watches[index] = resp.value.status
                                watches[index] = {
                                    ...filtered_outputs[index],
                                    ...resp.value.status
                                }
                            } else {
                                console.error("Error in getting status for watched location: %o", resp.reason )
                                watches[index] = 
                                { 
                                    ...filtered_outputs[index]    
                                } 
                            }
                        }) 
                        resolve(watches)

                    })
                } 
            } catch (err){ 
                console.error("%o error in get progress %s", err, $this.name)
                reject(err)
            } 
        }) 
    }
    //
    // Define the getting and setting based on parsing the ${} of the yaml files
    //
        
    async updates(params){ // If a variable change causes other variables to change, do so here
        let variable = params.variable
        let value = params.src
        let target = variable
        
        return new Promise ((resolve, reject)=>{
            let data = {}
            data[target] = value 
            let variables = this.variables
            let promises = []
            if (variables){ // if there are variables for this configuration available
                for (let [key, vari] of Object.entries(variables)){
                    try{
                        // IF an option is not set for a multi-option render variable, set to first one 
                        if (vari.options && vari.option >=0 ){
                            vari = vari.optionValue
                        }
                        // if a variable should be changed based on the current one changing, do so here
                        if (vari && vari.update_on && vari.update_on.depends && vari.update_on.depends.indexOf(variable) > -1){
                            let update_on = vari.update_on
                            let action  = update_on.action // define what to do based on the variable change
                            if (action == 'exists'){ // check if the element exists based on teh .source of it 
                                let returnedVari = {
                                    key: key, 
                                    value: null 
                                }
                                promises.push( 
                                    
                                    checkExists(update_on.source, true).then((f)=>{ // run the IO.js check exists function for existence on filesystem 
                                        if(f.exists && f.location){ 
                                            vari.source = path.join(update_on.source)// If it exists, update the source of the variable IF location needed from yaml file
                                        } else {
                                            vari.source = f.exists // Otherwise, just return true as a boolean element
                                        }
                                        returnedVari.value = vari
                                        return returnedVari
                                    }).catch((err)=>{
                                        console.error(err, "does not exists!", update_on.source)
                                        return returnedVari 
                                    }) 
                                )  
                            }
                            if (action == 'read'){ // If you need to read a file (like csv or tsv)
                                let returnedVari = {
                                    key: key, 
                                    value: null
                                }
                                let header = update_on.header
                                let make_header = (vari.header && !update_on.header ? vari.header : null)
                                let func = 
                                    ( header ? 
                                        readCsv(update_on.source, update_on.sep, header) : 
                                        ( make_header ? 
                                            readCsv(update_on.source, update_on.sep, make_header) : 
                                            readFile(update_on.source, true)  
                                    ) )
                                promises.push(
                                    func.then((f)=>{ // Ingest the raw data of the file
                                        vari.sep = ( vari.sep == "tab" ? "\t" : vari.sep )
                                        
                                        f  = f.filter(function (el) {
                                            return el != null && el !== '';
                                        }); 
                                        
                                        if (header || make_header) {
                                            vari.source = f 

                                        } else {
                                            vari.source = f.map((d,i)=>{
                                                if (update_on.skip_header && i ==0){
                                                    console.log("skipping header", vari.header)
                                                } else {
                                                    return d.split((vari.sep ? vari.sep : "\t"))
                                                }
                                            }) // Otherwise, assume the splitting type if tabular
                                            
                                        }
                                        vari.source = vari.source.filter((f)=>{
                                            if (typeof f == 'object'){
                                                for (let [key, value] of Object.entries(f)){
                                                    if (f[key] && !path.isAbsolute(value) && vari.define_columns && vari.define_columns[key]){
                                                        let seen = false
                                                        if (typeof vari.define_columns[key] == 'object' && vari.define_columns[key].element){
                                                            if (!Array.isArray(vari.define_columns[key].element)){
                                                                vari.define_columns[key].element = [vari.define_columns[key].element]
                                                            }
                                                            vari.define_columns[key].element.forEach((element)=>{
                                                                if (['file', 'dir', 'directory'].indexOf(element) > -1){
                                                                    console.log("not absolute", value, update_on.source, element)
                                                                    seen = true 
                                                                    
                                                                } 
                                                            })  
                                                        }
                                                        if (seen){ 
                                                            let abs = path.join(path.dirname(update_on.source), value)
                                                            f[key] = abs  
                                                        } 
                                                    } 
                                                }
                                            }
                                            return f
                                        })
                                        returnedVari.value = vari
                                        // return the key of the variable, and the value of it (source)
                                        return returnedVari 
                                    }).catch((err)=>{
                                        console.error(err)
                                        return returnedVari
                                    })
                                )
                            }
                        }
                    } catch(err){
                        console.error(err)
                    }
                }
 
            } 
            let changed_variables = []
            const $this = this
            Promise.allSettled(promises).then((respo)=>{
                respo.forEach((res)=>{
                    if (res.status == 'fulfilled'){ // If the processes completed successfully 
                        changed_variables.push(res.value) // add the success variable to changed variables list 
                        try{
                            
                            // if (res.value.value ){ // If a source value is available
                            if (res.value.value.source){ 
                                $this.variables[res.value.key].source = res.value.value.source
                            } else {
                                $this.variables[res.value.key].source = null
                            }
                                
                            if ($this.variables[res.value.key].optionValue){ // If there is a multi choice option for variable, set source 
                                $this.variables[res.value.key].optionValue = res.value.value
                            }
                            
                        } catch(err){
                            console.error(err)
                        }
                    }
                })
                // return all variables that changed in teh list for procedure
                resolve(changed_variables)
            }).catch((err)=>{
                console.error(err)
                resolve(changed_variables)
            })
        })
         
    }

    mapFunctions(targets, functions_list){    
        let functions = { 
            "directory": path.dirname, // return dirname of source
            "notExists": null, // Check if the path doesnt exist
            "exists": null, // Cehck if path exists
            "join": null, //  Join the array to a string
            "firstIndex": null, // Get the first element of an array 
            "length": null, // Get the length of the source 
            "basename": path.basename, // Get the basename of the path
            "trim": path.parse // get the name without the ext of the path
        }
        let transform_string = false
        if (!Array.isArray(targets))
        {
            targets = [ targets ]
            transform_string = true
        } // if the target is not an array, set to array for easier coding reasons as an array is needed below
        let t = targets.map((target,y)=>{ // map all targets based on function
            if (typeof target != 'string'){ 
                target = target.toString()
            }
            // Match all values that are surrounded by << >> which indicates a function /
            // Captures the function name before the << pattern 
            let inner_variables = target.match(/(?<=\<\<).*?(?=\>\>)/gs); 
            
            if (inner_variables && Array.isArray(inner_variables)){     // If any are in the config line  
                inner_variables.forEach((vari)=>{ // Loop through all matches
                    let function_identified = vari.match(/.*?(?=\()/gs); // Match the function (before the << ) 
                    let matched_string = vari.match(/(?<=\().*?(?=\))/gs);  // Match the values between << >>
                    function_identified  = lodash.filter(function_identified, Boolean); // Conver the array to a string if is an arr
                    function_identified.forEach((f,i)=>{  // for all functions
                        let funcs = f.split(",") 
                        
                        funcs.forEach((d)=>{ 
                            if (d in functions){ 
                                let result;
                                if (d == 'notExists'){ // If the value doesnt exist
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result  = ( matched_string ? false : true )
                                }
                                else if (d == 'firstIndex'){  // If you need to grab the first element of an array
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result = matched_string.target                                
                                }
                                else if (d == 'join'){ // If you need to join the array of src vals
                                    if (matched_string && Array.isArray(matched_string)){
                                        result = matched_string.join(" ")
                                    }
                                }
                                else if (d == 'length'){  // get the length of target
                                    result = matched_string.length
                                } else {
                                    if (Array.isArray(matched_string)){
                                        result = matched_string.join("")
                                    }
                                    if (d == 'trim'){ // get the name of the path without ext
                                        result = path.join(result.dir, result.name)
                                    } else {
                                        result=matched_string
                                    }

                                }
                            }
                        })
                    })
                    // If there is <<>>, remove that and everything between it with the newly parsed string
                    target = target.replace(`<<${vari}>>`, matched_string)
                })
            } 
            
            return target
        })
        // If the target is a string, just get the first element since it is a 1length array always
        return ( transform_string ? t[0] : t )
        
        
        
    }
    setVariables(){ 
        let defaultVariables = this.variables // Save all default variables just in case
        for (let [key, custom_variable] of Object.entries(this.variables)){ // Loop thorugh vars object
            let selected_option  = defaultVariables[key]
            let name = key;
            
            if (custom_variable){   // IF the variable is not predefined by the base yaml (user added it themselves)
                if (selected_option.options){  // Check if it is a multi option choice for the variable to render 
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
                        // If you need to bind a variable to a location, do so here
                        custom_variable.bind = val.bind
                    
                    } 
                }   
            }
           
        }
    }
    findObjectByLabel(obj, pattern) {
        const $this  = this
        
        if (obj && typeof obj == 'object'){ // If the object type is an object, there are values beneath, part of it, keep going
            Object.keys(obj).forEach(function (key) {
               
                if (typeof obj[key] === 'object') { // If the object type is an object, there are values beneath, part of it, keep going
                    $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
                    // return null
                } else if (typeof obj[key] == 'string'){ // If the object type is not an object, we are at the terminus of a branching pattern
                    
                    var replace = `${pattern}`   
                    var re = new RegExp(replace,"g");
                    let fo = obj[key].match(re)
                    
                    
                    if (fo && Array.isArray(fo)){  // If there are one or more matches
                        let original = cloneDeep(obj[key])
                        Object.defineProperty(obj, key, {
                            enumerable: true,    
                            set: function(value){ 
                                original = value 
                            }, 
                            get: function(){  // set getter that will update on all value changes if needed
                                let fullstring = cloneDeep(original)  
                                let final = $this.mapVariable(fullstring,obj)
                                

                                if (final == 'undefined'){
                                    return null
                                } else { 
                                    return final
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
    defineMapping(){ 
        let test = {
            first: "one",
            second: ["%{first}", '%{first} %{first}']
            
        }
        this.findObjectByLabel(this, "(\%\{.+?\})", cloneDeep(this)) 
    
 
        
    }  
    splice(value,index){
        return value.splice(index, 1)
    }
    mapVariable(fullstring,key){
        let $this  = this
        let split = fullstring.match(/(\%\{.*?\})|((?<=\}).*?(?=\%\{))|^.*?(?=\%\{)|(.+$)/g)
        let mapping = []
        if (split){
            split = split.filter((f)=>{
                return f && f!==''
            })
            let find = {}
            split.forEach((id,i)=>{
            let pattern = "(\%\{.+?\})"
            var replace = `${pattern}`   

            var re = new RegExp(replace,"g");
            let fo = id.match(re) 
            if (fo){ 
                let d = fo[0].replace(/[\%\{\}\]]/g, "") 
                d = d.replace(/(\[)/g, ".")  
                let found = nestedProperty.get($this, d)
                if (Array.isArray(found)){
                    d=found
    
                } else {
                    d = found
                }
                mapping.push(d)
            } else {
                mapping.push(id)
            }
                             
            })
        } else {
            mapping.push(fullstring)
        }
        let final = mapping
        let length_called = false
        let maxlen = Math.max(...final.map((f)=>{
            if ("<<length(" == f){
                length_called = true
            }
            return (Array.isArray(f) ? f.length : 1)
        }))
        if (maxlen == 1){
            final = final.join("")
        } else {
            let truefinal = []
            for (let i = 0; i < maxlen; i++){
                let f = final.map((k)=>{
                    if (!Array.isArray(k) || k.length < i+1){
                        return k
                    } else {
                        return k[i]
                    }
                })
                truefinal.push(f.join(""))
            }
            final = truefinal
        }
        let mapping2 = []
        
        if (!Array.isArray(final)){
            final = [ final ] 
        }
        
        let functions = { 
            "directory": path.dirname, // return dirname of source
            "notExists": null, // Check if the path doesnt exist
            "exists": null, // Cehck if path exists
            "join": null, //  Join the array to a string
            "firstIndex": null, // Get the first element of an array 
            "length": null, // Get the length of the source 
            "basename": path.basename, // Get the basename of the path
            "trim": path.parse // get the name without the ext of the path
        } 
        let returnable =[] 
        let combined_maps = {}
        let stop_force = false
        final.forEach((entry)=>{
            let split = entry.match(/(\<\<.*?\>\>)|(?<=\>\>).*?(?=\<\<)|(^.*?(?=\<\<)|((?<=\>\>).*?$))/g)
            if (split){
                split = split.filter((f)=>{
                    return f && f!==''
                })
                let idxReturnable = []
                split.forEach((id)=>{
                    let function_identified = id.match(/(?<=\<\<).*?(?=\()/gs); // Match the function (before the << ) 
                    let matched_string = id.match(/(?<=\().*?(?=\))/gs);  // Match the values between << >>
                    function_identified  = lodash.filter(function_identified, Boolean)[0];
                    if (function_identified){
                        let single_functions = function_identified.split(",")
                        matched_string = matched_string[0]
                        let result = matched_string
                        single_functions.forEach((d)=>{
                            if (d == 'notExists'){ // If the value doesnt exist
                                result  = ( result ? false : true )
                            }
                            else if (d == 'firstIndex'){  // If you need to grab the first element of an array
                                
                                result = result[0]                              
                            }
                            else if (d == 'join'){ // If you need to join the array of src vals
                                if (result && Array.isArray(result)){
                                    result = result.join(" ")
                                }
                            }
                            else if (d == 'length'){  // get the length of target
                                result = result.length
                            } else if ( d == 'basename'){
                                
                                if (Array.isArray(result)){
                                    result = result.map((f)=>{
                                        return path.basename(f)
                                    })
                                } else {
                                    result = path.basename(result)
                                }
                                
                            } else if ( d == 'directory'){
                                if (Array.isArray(result)){
                                    result = result.map((f)=>{
                                        return path.dirname(f)
                                    })
                                } else {
                                    result = path.dirname(result)
                                }
                                
                            } else if ( d == 'parse'){
                                if (Array.isArray(result)){
                                    result = result.map((f)=>{
                                        let result = path.parse(f)
                                        return path.join(result.dir, result.name)
                                    })
                                } else {
                                    let result = path.parse(result)
                                    result = path.join(result.dir, result.name)
                                }
                            } 
                            else {
                                if (Array.isArray(result)){
                                    result = result.join("")
                                }
                                
                                result = functions[d](result)
                                if (d == 'trim'){ // get the name of the path without ext
                                    result = path.join(result.dir, result.name)
                                } 
                            }
                        })
                            idxReturnable.push(result)
                        } else {
                            idxReturnable.push(id)
                        }
                        
                })
                
                returnable.push(idxReturnable)  
                 
            }  else {
                returnable.push([entry])
            }
        })  
        

        
        returnable = returnable.map((f)=>{
            return f.join("")
        })
        
        if (returnable.length == 1){
            returnable = returnable[0]
        }
        return returnable
        
        

    }
    
    
}