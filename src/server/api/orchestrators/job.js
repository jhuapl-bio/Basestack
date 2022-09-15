import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
import { mapVariables } from '../controllers/mapper.js';
const { Configuration }  = require("../../../shared/configuration.js")
const { Service }  = require("./service.js")
const { module_status }  = require("../../../shared/watcher.js")
const { readFile, removeFile, removeFolder, checkExists } = require("../controllers/IO.js")
const { store }  = require("../../config/store/index.js")
const path = require("path")
var logger = store.logger
 
export  class Job {  
    constructor(procedure, config){         
        this.config = null  
        this.options = null   
        this.configurations = null 
        this.services = []
        this.variables = {}
        this.runningConfig = {}
        this.baseConfig = cloneDeep(config)
        this.mergedConfig = cloneDeep(this.baseConfig)
        this.containers = []
        this.env = {}
        this.status = { 
            exists: false, 
            services_used: [],
            fully_installed: true,
            procedure: procedure.status,
            dependencies: procedure.dependencies.map((f)=>{
                return f.status
            }),
            error: null, 
            running: false,
            success: false,
            stream: null,
            complete: false,
            watches: [],
            services: []
        }
        this.promises = []
        this.service_steps = []
        this.interval = {
            checking: false, 
            interval: null
        }
        
    }   
    cleanup(){
        clearInterval(this.interval.interval) 
        return
    }
    create_interval (){
        const $this = this
        this.interval.interval = setInterval(()=>{
            if (!$this.interval.checking){
                $this.interval.checking = true
                $this.statusCheck().then((state)=>{
                    
                    $this.interval.checking = false
                }).catch((err)=>{
                    logger.error("%s err in status check interval for %s",err, $this.name)
                    $this.interval.checking = false
                })
            }
        }, 1500)
        return 
    }    
    defineConfiguration (config) {
        let configuration = new Configuration(cloneDeep(config)) 
        configuration.defineMapping(); 
        return  configuration
    } 
    // reformatPath(selected_path){
    //     if (selected_path){
    //         selected_path = selected_path.replaceAll(/\\/g, "/")
    //     }
    //     return selected_path
    // }
    setValueVariable(value, obj, key){ 
        const $this = this;
        try{      
            if (obj && obj.options){ 
                if (obj.options ){  
                    if (!obj.option){  
                        obj.option = 0 
                    }   
                }
            }
              
            
            if (value.source == 0 || value.source || ( typeof value == 'object' && 'source' in value)){
                if (typeof value.source == 'string' || typeof value.source == 'number' || ! value.source){
                    obj.source = value.source
                } else if (typeof value.source == 'object') {
                    for (let [key, v] of Object.entries(value.source)){
                        obj.source[key] = v
                    }
                } else {
                    obj.source = value.source
                }
                if (!obj.source && obj.fallback){
                    obj.source = obj.fallback
                } 
            } 
            if (!obj.target && obj.source){
                obj.target = cloneDeep(obj.source)
            }
            let getter = Object.getOwnPropertyDescriptor(obj, 'source');
            if (getter && getter.get){
                obj = value.source
                
            } else if ( ( value.option || value.option == 0 ) || obj.options ) {   
                
                if (!value.option && value.option != 0){
                    obj.option = 0
                } else { 
                    obj.option = value.option
                }
                
                if (typeof obj.options[obj.option] == "object"){
                    if (!value.source){
                        obj.source = obj.options[obj.option].source
                    }
                    $this.runningConfig.variables[key] = { ...obj.options[obj.option]}
                }
                
                $this.runningConfig.variables[key].option = obj.option
                if (obj.source){
                    $this.runningConfig.variables[key].source = obj.source
                }
               
            }  else {
                $this.runningConfig.variables[key].source = obj.source
            }  
            
            if (!$this.runningConfig.variables[key].target){
                $this.runningConfig.variables[key].target = cloneDeep($this.runningConfig.variables[key].source)
            }
            if ($this.runningConfig.variables[key].bind){
                if ($this.runningConfig.variables[key].define_columns){
                    let columns = []
                    for (let [key2, val] of Object.entries(this.runningConfig.variables[key].define_columns)){
                        if (val && typeof(val)  == 'object'){
                            if (!Array.isArray(val.element)){
                                val.element = [val.element]
                            }
                            let true_filesystem_variable = val.element.some((el)=>{
                                return ['file', 'directory','dir'].indexOf(el) > -1
                            })
                            if (true_filesystem_variable){
                                columns.push(key2)
                            }
                        }
                    }

                    if (Array.isArray($this.runningConfig.variables[key].target)){
                        $this.runningConfig.variables[key].target.forEach((f,i)=>{
                            columns.forEach((col)=>{
                                $this.runningConfig.variables[key].target[i][col] = $this.setTarget(f[col])                                
                            })
                        })
                    }
                } else {
                    $this.runningConfig.variables[key].target = $this.setTarget($this.runningConfig.variables[key].target)
                    
                }
                $this.runningConfig.variables[key].source = $this.setSource($this.runningConfig.variables[key].source)
                console.log($this.runningConfig.variables[key].target)
            }
            
            

        } catch (Err){
            store.logger.error(Err) 
        }         
    }  
    async setVariable(value, variable, target){
        
        return new Promise ((resolve, reject)=>{ 
            let data = {} 
            data[target] = value  
            let obj = this.runningConfig.variables[variable]
            this.setValueVariable(data, obj, variable)
            let variables = this.runningConfig.variables
            let promises = [] 
            if (variables){ 
                for (let [key, vari] of Object.entries(variables)){
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
                                    store.logger.error(err)
                                    return vari
                                })
                            )
                        }
                        if (action == 'read'){
                            promises.push(
                                readFile(update_on.source, true).then((f)=>{
                                    let header = vari.header
                                    let returnedVari = {
                                        key: key, 
                                        value: null
                                    }
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
                                    store.logger.error(err) 
                                    return vari
                                })
                            )  
                        }    
                    }  
                } 
 
            }
            let changed_variables = []  
            
            Promise.allSettled(promises).then((respo)=>{
                respo.forEach((res)=>{
                    if (res.status == 'fulfilled'){
                        changed_variables.push(res.value)
                    }
                })  
                resolve(changed_variables)  
            }).catch((err)=>{   
                store.logger.error(err)
                resolve(changed_variables)
            }) 
        })
       
    }
    async removeOutputs(dependency){
		const $this = this  
        return new Promise(function(resolve,reject){  
            let promises = []
            if (dependency >= 0 || dependency){
                let watch = $this.status.watches[dependency]
                if (typeof watch.source == 'string'){
                    promises.push(removeFile(watch.source))
                } else {
                    watch.source.forEach((w)=>{
                        promises.push(removeFile(w))
                    })
                }
            } else {
                if ($this.runningConfig.removal_override){
                    let type = $this.runningConfig.removal_override
                    if (!type){
                        type == 'file'
                    }
                    if ($this.runningConfig.removal_override.source){
                        if(type == 'file') {
                            promises.push(removeFile($this.runningConfig.removal_override.source))
                        }
                        else{
                            promises.push(removeFile($this.runningConfig.removal_override.source, 'dir'))
                        }
                    }
                    
                } else {
                    for (let i  = 0;  i < $this.status.watches.length; i++){
                        let watch = $this.status.watches[i]
                        if (typeof watch.source == 'string'){
                            promises.push(removeFile(watch.source))
                        } else { 
                            watch.source.forEach((w)=>{
                                promises.push(removeFile(w))
                            })
                        }  
                    }
                } 
            } 
            Promise.allSettled(promises).then((respo)=>{
                resolve()  
            }).catch((err)=>{  
                reject(err)  
            })
        })
    } 
    setParams(params){
        if (params.images){
            params.images.forEach((service)=>{ 
                this.services[service.service].override.image = service.image
            })
        }
        
        this.services.forEach((service)=>{ 
            service.config.dry = params.dry
        })
        this.mergeInputs(params, 'mergedConfig'  )
        return   
 
 

    } 
    updateCommand(service, command){ 
        const $this = this   
        if (command){
            service.config.command = command  
        }  
    }
    setSource(source){
        if (source && typeof source == 'string'){ 
            source = source.replaceAll(/\s/g, "\ ")
        }
        return source
    }
    setTarget(target){
       
        if (target && typeof target == 'string'){
            target = target.replaceAll(/\\/g, "/")
            target = target.replaceAll(/\s/g, '_')
            target = target.replaceAll(/:/g, "_")
            if (target && target != '' && !target.startsWith("/")){
                target = `/${target}`
            }
        } 
        return target

    }
    setVariables(variables){  
        
        this.variables = variables
        const $this = this
        for(let [key, value] of Object.entries(variables)){
            if (!$this.runningConfig.variables[key] && value.custom){
                $this.runningConfig.variables[key] = value
            } 
            let obj = $this.runningConfig.variables[key]
            this.setValueVariable(value, obj, key)
             
        }

        
        this.services.forEach((service)=>{ 
            service.config.variables = $this.runningConfig.variables
        })
        return 
    }
    async defineServices (services, params ) {
        const $this = this;
        
        for (let ix = 0; ix < services.length;  ix++){
            let serviceIdx = services[ix]
            if (serviceIdx < this.baseConfig.services.length){
                
                let service = new Service($this.baseConfig.services[serviceIdx], serviceIdx)
                await service.setOptions()
                let command;
                let commandsIndex = -1

                if (params.command){
                    commandsIndex = params.command.findIndex((d)=>{
                        return d.service == serviceIdx
                    })
                    if (commandsIndex>=0){
                        command = params.command[commandsIndex].command
                    }
                }
                service.config.setUser = params.setUser
                $this.updateCommand(service, command)
                this.services.push(service)
            }
        }  
        this.status.services_used = services
        this.create_interval()
        return 
    }
    async getProgress(){
        const $this = this; 
        return new Promise(function(resolve,reject){
            try{
                let variables = ( $this.runningConfig.variables ? $this.runningConfig.variables : $this.baseConfig.variables)
                
                let promises = [] 
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
                                $this.status.watches[index] = resp.value.status
                                $this.status.watches[index] = {
                                    ...filtered_outputs[index],
                                    ...resp.value.status
                                }
                            } else {
                                store.logger.error("Error in getting status for watched location: %o", resp.reason )
                                $this.status.watches[index] = 
                                { 
                                    ...filtered_outputs[index]
                                }
                            }
                        })
                        resolve()
                    })
                }
            } catch (err){
                store.logger.error("%o error in get progress %s", err, $this.name)
                reject(err)
            } 
        }) 
    }
    async statusCheck(){
		const $this = this; 
        let env = {}
		return new Promise(function(resolve,reject){
            let promises = [] 
                let running = false
                let error = null 
                $this.services.forEach((service, key)=>{
                    let step = null;
                    if (service.status.error){
                        error = `Service: ${key}, Error: ${service.status.error}\n`
                    }
                    $this.status.services[key] = service.status
                    if(service.status.exists.running){
                        $this.service_steps[key] = true 
                        running = true
                    } else {
                        $this.service_steps[key] = false
                    }
                    
                    if (service.env){
                        if (typeof service.env == 'object'){
                            $this.env = {...service.env}
                        }
                    }
                } )
                let success = $this.services.every((d)=>{
                    return !d.status.error && d.status.complete
                })
                let complete = $this.services.every((d)=>{
                    return d.status.complete
                })
                $this.status.stream = [].concat.apply([], $this.services.map((d)=>{
                    return d.status.stream.info
                }))
                let cancelled = $this.services.some((d)=>{
                    return d.status.cancelled
                })
                $this.status.fully_installed = $this.status.procedure.fully_installed
                $this.status.stream = $this.status.stream.splice(-350)
                $this.status.success = success 
                $this.status.complete = complete
                $this.status.running = running
                $this.status.error = error
                
                
                
                 
                $this.getProgress()


                resolve()
        }) 
	}
    async stop(){
        const $this = this
        let promises = [] 
        this.services.forEach((service)=>{
            if (service.status){
                promises.push(service.stop()) 
            }
        }) 
        let response = await Promise.allSettled(promises)
        return 
    }
    async loopServices(){      
        const $this  = this 
        let cancelled_or_skip = false
        let end = false  
        try{ 
            for (let i = 0; !end && i < $this.services.length; i++){
                let service = $this.services[i]
                try{  
                    let skip        
                    store.logger.info("I: %s, Starting a new job service %s", i, service.name)
                        
                    skip = await service.check_then_start({ variables: $this.variables }, true)
                    if (skip){ 
                        store.logger.info("skip %s", skip)
                        cancelled_or_skip = skip
                        end = true 
                    }
                } catch(err){
                    logger.error("%o Error in procedure: %s, key: %s", err, $this.name, i)
                    end = true
                    cancelled_or_skip = true
                    $this.status.error = err
                }
            }
            store.logger.info("Job completed or skipped/exited")
            return cancelled_or_skip
        } catch(err){  
            store.logger.error("Err in starting job %o", err)
            throw err
        }
    }
    mergeInputs(params, path){
        if (!path){
            path = ""
        }
        
        const $this = this;
        for (let [key, custom_variable] of Object.entries(params)){
            if ( custom_variable && typeof custom_variable == 'object' ){
                this.mergeInputs(custom_variable, `${path}${(path !== '' ? "." : "")}${key}`)
            } else {
                if (custom_variable){  
                     
                    nestedProperty.set($this, `${path}.${key}`, custom_variable)
                }
            }
        }
    } 
    async start(params){       
        const $this = this
        let services;  
        $this.status.error = null 
        $this.status.running = true 
        $this.status.complete = false
        let promises = []; 
        if (!params.variables){
            params.variables = {} 
        }
        store.logger.info("%s setting variables", $this.baseConfig.name)
        // this.mergeInputs(params, 'mergedConfig'  )
        this.runningConfig = this.defineConfiguration(this.mergedConfig)
        this.setVariables(params.variables) 
        store.logger.info("%s closing existing streams if existent", $this.name)
        this.promises.forEach((service)=>{
            if (service && service.streamObj){
                service.streamObj.close()
            }
        })
        store.logger.info("%s setting every complete status to false", $this.name)

        for (let i = 0; i < $this.services.length; i++){
            $this.services[i].status.complete = false
        }
        
        store.logger.info("Job starting: %s", $this.name)
        try{
            this.loopServices()
            return 
        } catch (err){
            store.logger.error(err)
            throw err
        }
        
    }
    
    
}