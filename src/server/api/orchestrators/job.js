import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep"); 
import { mapVariables } from '../controllers/mapper.js';
 const { Configuration }  = require("./configuration.js")
 const { Service }  = require("./service.js")
const { module_status }  = require("../controllers/watcher.js")
const { readFile, removeFile, removeFolder, checkExists } = require("../controllers/IO.js")
const { store }  = require("../../config/store/index.js")
   
var logger = store.logger

export  class Job { 
    constructor(procedure){         
        this.config = null  
        this.options = null   
        this.configurations = null
        this.services = []
        this.variables = {}
        this.status = { 
            exists: false, 
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
        let configuration = new Configuration(config)
        configuration.defineMapping();
        this.configuration = configuration
        return 
    }
    setValueVariable(value, obj, key){
        const $this = this;
        if (value.source){
            let getter = Object.getOwnPropertyDescriptor(obj, 'source');
            if (getter && getter.get){
                obj = value.source

            } else {
                $this.configuration.variables[key].source = value.source
            }
        } 
        if (value.option || value.option == 0){
            let getter = Object.getOwnPropertyDescriptor(obj, 'option');
            if (getter && getter.get){
                obj = value.option
            } else {
                $this.configuration.variables[key].option = value.option
            }
        }
    } 
    async setVariable(value, variable, target){
        return new Promise ((resolve, reject)=>{
            let data = {}
            data[target] = value 
            let obj = this.configuration.variables[variable]
            this.setValueVariable(data, obj, variable)
            let variables = this.configuration.variables
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
                                    vari.source = f
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
                console.log("Single remove!")
                let watch = $this.status.watches[dependency]
                if (typeof watch.source == 'string'){
                    promises.push(removeFile(watch.source))
                } else {
                    watch.source.forEach((w)=>{
                        promises.push(removeFile(w))
                    })
                }
            } else {
                if ($this.configuration.removal_override){
                    let type = $this.configuration.removal_override
                    if (!type){
                        type == 'file'
                    }
                    if ($this.configuration.removal_override.source){
                        if(type == 'file') {
                            promises.push(removeFile($this.configuration.removal_override.source))
                        }
                        else{
                            promises.push(removeFile($this.configuration.removal_override.source, 'dir'))
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
                console.log(respo)
                resolve()
            }).catch((err)=>{
                reject(err)
            })
        })
    }
    setVariables(variables){
        this.variables = variables
        const $this = this
        for(let [key, value] of Object.entries(variables)){
            let obj = $this.configuration.variables[key]
            this.setValueVariable(value, obj, key)
        }
        this.services.forEach((service)=>{ 
            service.config.variables = $this.configuration.variables
        })
        return 
    }
    async defineServices (services ) {
        const $this = this;
        for (let ix = 0; ix < services.length;  ix++){
            let serviceIdx = services[ix]
            let service = new Service($this.configuration.services[serviceIdx], serviceIdx)
            await service.setOptions()
            this.services.push(service)
        }  
        this.create_interval()
        return 
    }
    async getProgress(){
        const $this = this;
        return new Promise(function(resolve,reject){
            try{
                let variables = $this.configuration.variables
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
                } )
                let success = $this.services.every((d)=>{
                    return !d.status.error && d.status.complete
                })
                let complete = $this.services.every((d)=>{
                    return d.status.complete
                })
                $this.status.stream = $this.services.map((d)=>{
                    return d.status.stream
                })
                let cancelled = $this.services.some((d)=>{
                    return d.status.cancelled
                })
                $this.status.fully_installed = $this.status.procedure.fully_installed
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
    async start(){
        const $this = this
        let services;
        $this.status.error = null
        $this.status.running = true
        $this.status.complete = false
        let promises = [];
        this.configuration.setVariables()
        this.promises.forEach((service)=>{
            if (service && service.streamObj){
                service.streamObj.close()
            }
        })
        let cancelled_or_skip = false
        for (let i = 0; i < $this.services.length; i++){
            $this.services[i].status.complete = false
        }
        let end = false
        for (let i = 0; !end && i < $this.services.length; i++){
            let service = $this.services[i]
            if (service.config.orchestrator){
                logger.info("Skipping service %s since it is orchestrated. Ensure that the orchestrator is function/running for proper procedure completion", i)
            } else{
                try{
                    let skip
                    skip = await service.check_then_start({ variables: $this.variables}, true)
                    if (skip){ 
                        cancelled_or_skip = skip
                        end = true
                        // i = $this.services.length
                    }
                } catch(err){
                    logger.error("%o Error in procedure: %s, key: %s", err, $this.name, i)
                    // if (!$this.configuration.skipError){
                    //     i = $this.services.length
                    // }
                    end = true
                    cancelled_or_skip = true
                    $this.status.error = err
                }
            }
        }
        return cancelled_or_skip
    }
    
    
}