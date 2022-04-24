import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
const path = require("path")   
const lodash = require("lodash")  
const { module_status } = require("./watcher.js")
const {readFile, checkExists} = require("./IO.js") 
export  class Configuration {    
    constructor(config){            
        for(let[key, value] of Object.entries(config)){
            this[key] = value
        }
        this.watches = []
        this.watcher = null
        
        const obj = {
            log: Object.keys(this.variables),
            get latest() {
              if (this.log.length === 0) {
                return undefined;
              }
              return this.log[this.log.length - 1];
            }
          };
        this.obj = obj
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
        for (let [key, custom_variable] of Object.entries(this.variables)){
            if (!custom_variable.option && custom_variable.options){
                custom_variable.option = 0
            }
            if (custom_variable.option >=0 && !custom_variable.source){
                if (typeof custom_variable.options[custom_variable.option] == 'object'){
                    custom_variable.source = custom_variable.options[custom_variable.option].source
                } else {
                    custom_variable.source = custom_variable.options[custom_variable.option]
                }
            }
        }
    }
    create_intervalWatcher(){
        const $this = this;
        $this.destroy_interval()
        $this.getProgress().then((f)=>{
            $this.watches = f
        })
        this.watcher = setInterval(()=>{
            $this.getProgress().then((f)=>{
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
        for (let [key, custom_variable] of Object.entries(params)){
            if (!custom_variable.element != 'confguration-file'){
                if ( custom_variable && typeof custom_variable == 'object' ){
                    this.mergeInputs(custom_variable, `${path}${(path !== '' ? "." : "")}${key}`)
                } else {
                    if (custom_variable){ 
                        nestedProperty.set($this, `${path}.${key}`, custom_variable)
                    }
                }
            }
            
        }
    }
    async getProgress(){
        const $this = this; 
        return new Promise(function(resolve,reject){
            try{
                let variables = (  $this.variables )
                let promises = [] 
                let watches = []
                if (variables ){ 
                    let filtered_outputs = Object.values(variables).filter((value, key)=>{
                        return value.output
                    })
                    filtered_outputs.forEach((filtered,key)=>{
                        promises.push(module_status(filtered, key, ))
                    })
                    Promise.allSettled(promises).then((response)=>{
                        response.forEach((resp, index)=>{
                            if (resp.status == 'fulfilled'){
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
    defineMapping(){ 
        let newTarget = this.findObjectByLabel(this, "(\%\{.+?\})") 
        newTarget  = this.findObjectByTarget(this, "(\&\{.+?\})")
    }     
    async updates(params){
        let variable = params.variable
        let value = params.src
        let target = variable
        
        return new Promise ((resolve, reject)=>{
            let data = {}
            data[target] = value 
            let obj = this.variables[variable]
            let variables = this.variables
            let promises = []
            if (variables){
                for (let [key, vari] of Object.entries(variables)){
                    try{
                        if (vari.options && vari.option >=0 ){
                            vari = vari.optionValue
                        }
                        if (vari.update_on && vari.update_on.depends && vari.update_on.depends.indexOf(variable) > -1){
                            let update_on = vari.update_on
                            let action  = update_on.action
                            if (action == 'exists'){
                                let returnedVari = {
                                    key: key, 
                                    value: null
                                }
                                promises.push(
                                    
                                    checkExists(update_on.source, true).then((f)=>{
                                        if(f.exists && f.location){ 
                                            vari.source = path.join(update_on.source)
                                        } else {
                                            vari.source = f.exists
                                        }
                                        
                                        // vari.source = f.exists
                                        returnedVari.value = vari
                                        return returnedVari
                                    }).catch((err)=>{
                                        console.error(err, "does not exists!", update_on.source)
                                        return returnedVari 
                                    })
                                )  
                            }
                            if (action == 'read'){
                                let returnedVari = {
                                    key: key, 
                                    value: null
                                }
                                promises.push(
                                    readFile(update_on.source, true).then((f)=>{
                                        let header = vari.header
                                        f  = f.filter(function (el) {
                                            return el != null && el !== '';
                                        });
                                        if (header){
                                            vari.source = f.map((d)=>{
                                                let p  = d.split("\t")
                                                let returned = {

                                                }
                                                header.map((head,i)=>{
                                                    returned[head] = p[i]
                                                })
                                                return returned
                                            })

                                        } else {
                                            vari.source = f.map((d)=>{
                                                return d.split("\t")
                                            })
                                        }
                                        returnedVari.value = vari
                                        
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
                    if (res.status == 'fulfilled'){
                        changed_variables.push(res.value)
                        try{
                            if (res.value.value){
                                $this.variables[res.value.key].source = res.value.value.source
                                if ($this.variables[res.value.key].optionValue){
                                    $this.variables[res.value.key].optionValue = res.value.value
                                }
                            } else {
                                $this.variables[res.value.key].source  = res.value
                            }
                        } catch(err){
                            console.error(err)
                        }
                    }
                })
                resolve(changed_variables)
            }).catch((err)=>{
                console.error(err)
                resolve(changed_variables)
            })
        })
       
    }

    mapFunctions(targets, functions_list){   
        let functions = { 
            "directory": path.dirname,
            "notExists": null,
            "exists": null,
            "join": null,
            "firstIndex": null,
            "length": null,
            "basename": path.basename,
            "trim": path.parse
        }
        
        
        const $this  = this  
        let regexp =  /\^\(.+?\)/g;
        let transform_string = false
        if (!Array.isArray(targets))
        {
            targets = [ targets ]
            transform_string = true
        }
        let t = targets.map((target,y)=>{
            if (typeof target != 'string'){ 
                target = target.toString()
            }
            let inner_variables = target.match(/(?<=\<\<).*?(?=\>\>)/gs); 
            
            if (inner_variables && Array.isArray(inner_variables)){      
                inner_variables.forEach((vari)=>{
                    let function_identified = vari.match(/.*?(?=\()/gs); 
                    let matched_string = vari.match(/(?<=\().*?(?=\))/gs); 
                    function_identified  = lodash.filter(function_identified, Boolean);
                    function_identified.forEach((f,i)=>{ 
                        let funcs = f.split(",") 
                        funcs.forEach((d)=>{ 
                            if (d in functions){ 
                                let result;
                                if (d == 'notExists'){
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result  = ( matched_string ? false : true )
                                }
                                else if (d == 'firstIndex'){ 
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result = matched_string.target                                
                                }
                                else if (d == 'join'){
                                    if (matched_string && Array.isArray(matched_string)){
                                        target = matched_string.join(" ")
                                    }
                                }
                                else if (d == 'length'){ 
                                    result = matched_string.length
                                } else {
                                    if (Array.isArray(matched_string)){
                                        matched_string = matched_string.join("")
                                    }
                                    result = functions[d](matched_string)
                                    if (d == 'trim'){
                                        matched_string = path.join(result.dir, result.name)
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
        })
        return ( transform_string ? t[0] : t )
        
        
        
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
            "firstIndex": null,
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
                            } 
                            else if (d == 'firstIndex'){ 
                                result = found[0]
                                
                            }
                            else { 
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
                } else if (typeof obj[key] == 'string' ){
                    // findObjectByLabel(obj[key], pattern, $this) 
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
                                            // if (original == '%{variables.outdir.source}/multiqc/%{variables.artic_minion_caller.source}/multiqc_report.html'){
                                            //     console.log("orginal", id, match)
                                            // }
                                            // fullstring  = fullstring.replaceAll(match, found)  
                                            let returned_final = $this.mapTargetFunctions(found, fullstring)
                                            fullstring = returned_final                                  
                                        } catch(err)  {
                                            console.error("error in matching", match, id, found, "original:", original)
                                            console.error(err)
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
   
    findObjectByLabel(obj, pattern) {
        const $this  = this
        
        if (obj && typeof obj == 'object'){
            Object.keys(obj).forEach(function (key) {
               
                if (typeof obj[key] === 'object') {
                    $this.findObjectByLabel(obj[key], pattern, $this) 
                    
                     
                    // return null
                } else if (typeof obj[key] == 'string'){
                    
                    // findObjectByLabel(obj[key], pattern, $this) 
                        
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
                                            if (fullstring){
                                                if (typeof found == 'string' && match ){
                                                    fullstring  = fullstring.replaceAll(match, found)        
                                                } else if (Array.isArray(found) && match) {
                                                    let newval = []
                                                    
                                                    fullstring = found.map((f,i)=>{
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
                                    
                                    
                                    // if (fo.indexOf('%{variables.files.source}') >-1){
                                    //     console.log(fo, original,fullstring)
                                    // }
                                    // if (typeof fullstring == 'string'){
                                    if (fullstring){
                                        fullstring= $this.mapFunctions(fullstring, obj.formatting)
                                    }
                                    // }
                                    
                                    
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