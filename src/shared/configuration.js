import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
const path = require("path")   
const lodash = require("lodash")    
const { module_status } = require("./watcher.js")
const {readFile, checkExists} = require("./IO.js") 

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
        this.watches = []
        this.watcher = null
        
        const obj = {
            log: Object.keys(this.variables),
            get latest() { // iterate through the logs
              if (this.log.length === 0) {
                return undefined;
              }
              return this.log[this.log.length - 1];
            }
          };
        this.obj = obj
        
        if (config.shared && config.shared.variables){ // Shared variables are shared across one or more procedures to reduce coding needs/bloat
            for (let [key, value] of Object.entries(config.variables)){
                if (value.shared){
                    config.variables[key]= config.shared.variables[key] // Set the variable for a give procedure if it is required
                }
            }
        }   
        if (config.shared && config.shared.services){// Shared services are shared across one or more procedures to reduce coding needs/bloat
            config.services.forEach((service,i)=>{ // Set the service for a give procedure if it is required
                if (service.shared && config.shared.services[service.target]){
                    config.services[i] = config.shared.services[service.target]
                    
                }
            }) 
        }
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
        for (let [key, custom_variable] of Object.entries(this.variables)){ // loop through variables
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
    defineMapping(){ 
        let newTarget = this.findObjectByLabel(this, "(\%\{.+?\})") 
        

        // for (let [key, value] of Object.entries(mapping)){
        //     let match
        // }
        
        
        // let newTarget = this.findObjectByReference(this, "(\&\{.+?\})") 
        // newTarget  = this.findObjectByTarget(this, "(\&\{.+?\})")
    }      
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
                                promises.push(
                                    readFile(update_on.source, true).then((f)=>{ // Ingest the raw data of the file
                                        let header = vari.header // IF header defined, set first row as so
                                        f  = f.filter(function (el) {
                                            return el != null && el !== '';
                                        });
                                        if (header){
                                            vari.source = f.map((d)=>{ // split the header as tabular format (only supported one right now)
                                                let p  = d.split("\t")
                                                let returned = { }
                                                header.map((head,i)=>{
                                                    returned[head] = p[i]
                                                }) // Define the keys for the header
                                                return returned
                                            })
                                        } else {
                                            vari.source = f.map((d)=>{
                                                return d.split("\t")
                                            }) // Otherwise, assume the splitting type if tabular
                                        }
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
                            if (res.value.value){ // If a source value is available
                                $this.variables[res.value.key].source = res.value.value.source
                                if ($this.variables[res.value.key].optionValue){ // If there is a multi choice option for variable, set source 
                                    $this.variables[res.value.key].optionValue = res.value.value
                                }
                            } else {
                                //Otherwise, set default source format 
                                $this.variables[res.value.key].source  = res.value
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
                                        target = matched_string.join(" ")
                                    }
                                }
                                else if (d == 'length'){  // get the length of target
                                    result = matched_string.length
                                    
                                } else {
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result = functions[d](matched_string)
                                    if (d == 'trim'){ // get the name of the path without ext
                                        matched_string = path.join(result.dir, result.name)
                                    } else {
                                        matched_string = result
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
                                
                                let mapping = {}
                                fo.forEach((match,i)=>{   // for all times you find ${}
                                    // matches.forEach((match)=>{
                                    let id = match.replace(/[\%\{\}]/g, "") 
                                    let val = nestedProperty.get($this, id)
                                    mapping[match] = val
                                    // })
                                    
                                })
                                let replace = "(?<=\<\<).*?(?=\>\>)"
                                let re = new RegExp(replace,"gs");
                                let matches = fullstring.match(re)
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
                                if (matches && matches.length >=1){
                                    let mapping2 = {}
                                    matches.forEach((vari)=>{
                                        let function_identified = vari.match(/.*?(?=\()/gs); // Match the function (before the << ) 
                                        let matched_string = vari.match(/(?<=\().*?(?=\))/gs)[0];  // Match the values between << >>
                                        function_identified  = lodash.filter(function_identified, Boolean); // Conver the array to a string if is an arr
                                        let sstring = matched_string
                                        if (mapping[matched_string]){
                                            sstring = mapping[matched_string]
                                        }
                                        function_identified.forEach((d)=>{
                                            if (d == 'notExists'){ // If the value doesnt exist
                                                if (Array.isArray(sstring)){
                                                    sstring = sstring.join("")
                                                }
                                                sstring  = ( sstring ? false : true )
                                            }
                                            else if (d == 'firstIndex'){  // If you need to grab the first element of an array
                                                if (Array.isArray(sstring)){
                                                    sstring = sstring.join("")
                                                }
                                                sstring = sstring.target                                
                                            }
                                            else if (d == 'join'){ // If you need to join the array of src vals
                                                if (sstring && Array.isArray(sstring)){
                                                    sstring = sstring.join(" ")
                                                }
                                            }
                                            else if (d == 'length'){  // get the length of target
                                                sstring = sstring.length
                                                
                                            } else {
                                                if (Array.isArray(sstring)){
                                                    sstring = sstring.join("")
                                                }
                                                let result = functions[d](sstring)
                                                if (d == 'trim'){ // get the name of the path without ext
                                                    sstring = path.join(result.dir, result.name)
                                                } 
            
                                            }
                                        })
                                        mapping2[`<<${vari}>>`] = sstring
                                        fullstring = fullstring.replace(`<<${vari}>>`,sstring)
                                    })    
                                    
                                }
                                for (let [key, value] of Object.entries(mapping))
                                {
                                    fullstring = fullstring.replace(key, value)
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
    
    findObjectByLabelOld(obj, pattern) {
        const $this  = this
        
        if (obj && typeof obj == 'object'){ // If the object type is an object, there are values beneath, part of it, keep going
            Object.keys(obj).forEach(function (key) {
               
                if (typeof obj[key] === 'object') { // If the object type is an object, there are values beneath, part of it, keep going
                    $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
                    // return null
                } else if (typeof obj[key] == 'string'){ // If the object type is not an object, we are at the terminus of a branching pattern
                    
                    var replace = `${pattern}`   
                    var re = new RegExp(replace,"g");
                    
                    let fo = obj[key].match(re) // match all values between ${}   
                    
                    if (fo && Array.isArray(fo)){  // If there are one or more matches
                        let original = cloneDeep(obj[key])
                        Object.defineProperty(obj, key, {
                            enumerable: true,   
                            set: function(value){
                                original = value
                            }, 
                            get: function(){  // set getter that will update on all value changes if needed
                                let fullstring = cloneDeep(original)  
                                
                                fo.forEach((match,i)=>{   // for all times you find ${}
                                    let id; 
                                    let found; 
                                    try{  
                                        id = match.replace(/[\%\{\}]/g, "") /// remove any functions INSIDE the ${}
                                        found =  nestedProperty.get($this, id) // use nested propery to finding branching pattern of top level
                                        if (fullstring){
                                            if (typeof found == 'string' && match ){ // If it is a string, just simply replace value in ${} with nested prop find
                                                fullstring  = fullstring.replaceAll(match, found)        
                                            } else if (Array.isArray(found) && match) { // Else if arr, go thru all possible finds, and match approprately iteratively
                                                let newval = []
                                                // fullstring  = fullstring.replaceAll(match, found)  
                                                fullstring = found.map((f,i)=>{ // go through each propery match of ${}
                                                    let u = cloneDeep(original).replaceAll(match, f)   
                                                    return u 
                                                })
                                                
                                            } else {
                                                fullstring = found 
                                            }  
                                        }
                                        
                                                
                                    } catch(err)  { 
                                        console.error("error in matching", match, id, found, "origina:", original)
                                        console.log(err)
                                    }
                                    
                                })
                                
                           
                                if (fullstring){
                                    fullstring= $this.mapFunctions(fullstring, obj.formatting) // next match all %<<>> which are functions
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
    findObjectByReference(obj, pattern) {
        const $this  = this
        
        if (obj && typeof obj == 'object'){ // If the object type is an object, there are values beneath, part of it, keep going
            Object.keys(obj).forEach(function (key) {
               
                if (typeof obj[key] === 'object') { // If the object type is an object, there are values beneath, part of it, keep going
                    $this.findObjectByReference(obj[key], pattern, $this) 
                } else if (typeof obj[key] == 'string'){ // If the object type is not an object, we are at the terminus of a branching pattern
                    var replace = `${pattern}`   
                    var re = new RegExp(replace,"g");
                    
                    let fo = obj[key].match(re) // match all values between ${}   
                    if (fo && Array.isArray(fo)){  // If there are one or more matches
                        let original = cloneDeep(obj[key])
                        Object.defineProperty(obj, key, {
                            enumerable: true,   
                            set: function(value){
                                original = value
                            }, 
                            get: function(){  // set getter that will update on all value changes if needed
                                let fullstring = cloneDeep(original)  
                                
                                fo.forEach((match,i)=>{   // for all times you find ${}
                                    let id; 
                                    let found; 
                                    try{  
                                        id = match.replace(/[\&\{\}]/g, "") /// remove any functions INSIDE the ${}
                                        found =  nestedProperty.get($this, id) // use nested propery to finding branching pattern of top level
                                        if (fullstring){
                                            if (typeof found == 'string' && match ){ // If it is a string, just simply replace value in ${} with nested prop find
                                                fullstring  = fullstring.replaceAll(match, found)        
                                            } else if (Array.isArray(found) && match) { // Else if arr, go thru all possible finds, and match approprately iteratively
                                                let newval = [] 
                                                // fullstring  = fullstring.replaceAll(match, found)  
                                                fullstring = found.map((f,i)=>{ // go through each propery match of ${}
                                                    let u = cloneDeep(original).replaceAll(match, f)   
                                                    return u 
                                                })
                                            } else {
                                                fullstring = found 
                                            }  
                                        }
                                        
                                                
                                    } catch(err)  { 
                                        console.error("error in matching", match, id, found, "origina:", original)
                                        console.log(err)
                                    }
                                    
                                })
                                
                           
                                if (fullstring){
                                    // console.log(fullstring)
                                    // fullstring= $this.mapFunctions(fullstring, obj.formatting) // next match all %<<>> which are functions
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