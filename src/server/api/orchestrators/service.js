import e from 'express';
import { resolve } from 'path';
import { Configuration } from './configuration.js';
const cloneDeep = require("lodash.clonedeep");

/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */ 
var Docker = require('dockerode'); 
const path = require("path") 
var  { store }  = require("../../config/store/index.js")
const { mapVariables, validateFramework } = require("../controllers/validate.js")
const { readFile, writeFile, copyFile } = require("../controllers/IO.js")
const { module_status }  = require("../controllers/watcher.js")
const { check_container,  } = require("../controllers/fetch.js")
const { spawnLog, createLoggingObject } = require("../controllers/logger.js")
var logger = store.logger
// var docker = new Docker();
const fs = require("file-system")
let dockerObj;

export class Service {
	constructor(name, params){
		this.name = name
        this.config = params
        this.dependencies = [],
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }
        this.status = {
            exists: false,
            fully_installed: false,
            error: null,
            stream: null,
        };
        let depends = this.config.depends
        this.defineDependencies() 
	}
    async create_interval (){
        const $this = this
		let checking = false

        let interval = setInterval(()=>{
            if (!checking){
                checking = true
                $this.dependencyCheck().then((d)=>{
                    if ($this.status.fully_installed){
                        $this.watch().then((e)=>{
                            checking = false
                        }).catch((err)=>{
                            logger.error("error in getting status %o", err)
                            checking = false
                        })
                    } else {
                        checking = false
                    }
                }).catch((err)=>{
                    logger.error(err)
                    checking = false
                })
            }
        }, 3000)
        return interval
    }
	defineConfig(){ 
        let service = this.config
        let optionsFile
        if (service.config ){ 
            optionsFile = service.config
        } else if (service.orchestrated && !service.config ){
            optionsFile = store.system.orchestrators.subclient.path
        } else {
            optionsFile = store.system.orchestrators.default.path 
        }
        return optionsFile   
    } 
    async getProgress(variables, outputs){ 
        const $this = this;
        return new Promise(function(resolve,reject){
            try{
                let service = $this.config
                if (!outputs){
                    outputs = {}
                }
                if (service.outputs){
                    let watchable = {}
                    let promises = [] 
                    for (let [ key, value] of Object.entries(service.outputs)){
                        if(value.watch){
                            watchable[key] = value
                            promises.push(module_status(value, key, variables, ( outputs[key] ? outputs[key] : {}   )))
                        }
                    }
                    Promise.allSettled(promises).then((response)=>{ 
                        response.forEach((resp)=>{
                            if (resp.status == 'fulfilled'){
                                if (watchable[resp.value.key]){
                                    watchable[resp.value.key].status = resp.value.status
                                }
                            } else {
                                store.logger.error("Error in getting status for watched location: %o", resp.reason )
                            }
                        })
                        resolve(watchable)
                    })                
                } else {
                    reject()
                }
            } catch (err){
                store.logger.error("%o error in get progress %s", err, $this.name)
                reject(err)
            }
        })
    } 
    async watch(){
		let container_name = this.container_name;
		const $this  = this;
		return new Promise(function(resolve,reject){
            const response = check_container($this.name).then((response)=>{
                $this.status.exists = response 
    			resolve()
            }).catch((err)=>{
                reject(err)
            })
		})
	} 
    async defineDependencies(){
        const $this = this;
        this.dependencies = []
      
        if (this.config.depends){
            this.config.depends.forEach((dependency)=>{
                if (dependency.type == 'module' && dependency.id in store.modules){
                    $this.dependencies[dependency.id] = store.modules[dependency.id]
                }
            })
        }
    }
    async setOptions(){
        const $this = this
        let file = $this.defineConfig() 
        let data = JSON.parse(await readFile(file))
        this.options = data
        return "Success in getting options" 
    }
    async stop() {
		let container_name = this.name;
		return new Promise(function(resolve,reject){ 
			// delete store.modules[container_name]
			var container = store.docker.getContainer(container_name).remove({force:true}, function(err,data){
				if (err){
					logger.error("%s %s %o", "Error in stopping docker container: ",container_name, err)
					reject(`Module does not exist: ${container_name}`)
				} else {
					logger.info("%s %s", "Success in removing container: ", container_name)
					resolve(`Success in stop module: ${container_name}`)
				}
			})
		})
	}
    async check_then_start(params, wait){ 
        const $this = this;
        return new Promise(function(resolve,reject){ 
            ( async ()=>{
                let name = $this.name;
                let exists = await check_container($this.name)
                if ( (exists.running || exists.exists && $this.config.force_restart) || (!$this.config.force_restart && exists.exists)){
                    logger.info("Force restarting")
                    await $this.stop() 
                } 
                await $this.start(params, wait) 
                logger.info(`started run...${name}`)
                resolve(name)
            })().catch((err)=>{
                logger.error(err)
                reject(err)
            })
        })
    }  
    async dependencyCheck(){ 
		const $this = this;
        let dependencies = this.dependencies
        let returned = []
        let complete = false
        let fully_installed = false
        return new Promise(function(resolve,reject){
            try{
                if (dependencies){
                    for (const [key, dependency] of Object.entries(dependencies)){
                        dependency.dependencies.forEach((dep1)=>{
                            returned.push(dep1)
                        })
                    }
                    let fully_installed = returned.every((d)=>{
                        return d.status.exists
                    })
                    $this.status.fully_installed = fully_installed
                }
                resolve(returned) 
            } catch(err){
                reject(err)
            }
		})
	}
    volume_bind(variable){  
        let source = "";
        if (variable.bind_parent_dir){ 
            source = path.dirname(variable.source ); 
        } else {
            source = variable.source; 
        }
        
        
        let target = "";
        if (variable.bind_parent_dir){
            target = path.join(variable.bind, path.basename(path.dirname(variable.source)) )
        } else {
            target = path.join(variable.bind, path.basename((variable.source)) )
        }
        return [source, target]

    }
    replaceVariables(variable, variables){
        let inner_variables = variable.match(/(\${.+?\}){1}/g)
        let final = variable
        
        const $this = this 
        inner_variables.forEach((in_vari)=>{
            let topLevelObj = cloneDeep(variables)
            let id = in_vari.replace(/[\$\{\}]/g, "")
            let splitVar = id.split(".")
            splitVar.forEach((v)=>{
                if (topLevelObj[v].value){ 
                    topLevelObj[v].source = topLevelObj[v].value
                } 
                topLevelObj = topLevelObj[v]
            })
            final = final.replace(in_vari, topLevelObj)
        }) 
        
        return final
    }
    
    defineSourceTargetBinding(selected_option, variables){
        const $this =this 
        if (typeof selected_option === 'string' || selected_option instanceof String){
            selected_option  = {
                source: selected_option
            }
        }
        let source = selected_option.source
        // let target = selected_option.target
        let target = selected_option.target
        try{
            if ( target && target !== ''){
                target = mapVariables(target, variables)
            } 
            
            //Define the Bind Mounts Target  and Source 
            // if (selected_option.bind){  
            //     let bind = $this.volume_bind(selected_option)
            //     selected_option.target = bind[1]
            //     source = bind[0]
            //     target = bind[1]
            // }             
        } catch(err){
            logger.error(err)

        }
        
        // if (!target){
        //     target = source
        // }
        //Define the Source path for Bind Mounts
        return [source, target]
    }
    updatePorts(ports, options){
        const $this = this
        options.HostConfig.PortBindings = {}
        options.ExposedPorts = {}
        ports.forEach((port)=>{
            if (Array.isArray(port)){
                for (let i  = port[0]; i <= port[1]; i+=1){
                    options = $this.port_bind(i, options)  
                }
            } else {
                options = $this.port_bind(port, options)
            }
        })
        return options
    }
    port_bind(portSpec, options){  
        let from; let to;

        if (typeof portSpec === 'string' && portSpec.includes(":")){
            let splitPorts = portSpec.split(":")
            from = splitPorts[0]
            to = splitPorts[1]
        } else {
            from = portSpec
            to = portSpec
        }
        let port_bind = `${to}/tcp` 
        const $this = this
        !options.HostConfig.PortBindings[to] ? options.HostConfig.PortBindings[to] = [] : ''
        options.HostConfig.PortBindings[to].push(
            { 
                "HostPort": `${from}` // make the port a string
            }  
        )     
        options.ExposedPorts[to] = {}
        return options
    }
    updateConfig(options){         
      
        const $this = this
        let service = this.config
        if (service.ports && (Array.isArray(service.ports) )) {
            options  = $this.updatePorts(service.ports, options)
        }
  
        if (!options.Image){ 
            options.Image = service.image
        }
        options.name = this.name
       
        if (service.workingdir){
            options.WorkingDir = service.workingdir
        }
        return options
               
    }
    createContentOutput(item, sep){
        if (!sep){
            sep = ","
        }
        let tsv_file_content = item.map((d)=>{
            return d.join( ( sep == 'tab' ? "\t" : sep )  )
        }).join('\n')
        return tsv_file_content + "\n"
    }
    start(params, wait){ 
		const $this = this   
        return new Promise(function(resolve,reject){ 
            let options = JSON.parse(JSON.stringify($this.options)) 
            let custom_variables = params.variables
            let defaultVariables = {}
            if ($this.config.variables){
                defaultVariables = cloneDeep($this.config.variables)
            }
            (! custom_variables ? custom_variables = {}: '');
            options = $this.updateConfig(options)
            let env = []    
            let binds = [] 
            let complete = Object.values($this.dependencies).every((dependency)=>{
                let complete2 = dependency.dependencies.every((dep)=>{ 
                    return dep.status
                })  
                return complete2 
                
            })  
            //Identity if the service should be started and ONLY IF all dependencies are installed for said module
            if (!complete){  
                logger.info(`running a module that has does not have all necessary deps... ${$this.command}`)
                reject(new Error("All Dependencies aren't installed"))
            }   
            if ($this.config.binds){
                $this.config.binds.forEach((bind)=>{
                    binds.push(bind)
                })
            }
            if (params.binds){
                params.binds.forEach((bind)=>{
                    binds.push(bind)
                })
            }
            let cmd = $this.config.command 
            if (cmd){
                options.Cmd = $this.config.command
            }
            let promises = []
            let values = []
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
                defaultVariables[key] = { 
                    ...selected_option,  
                    ...custom_variable    
                } 
            }
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                let srcTarget = $this.defineSourceTargetBinding(selected_option, defaultVariables)
                defaultVariables[name].source = srcTarget[0]
                defaultVariables[name].target = srcTarget[1] 
            } 
            let clonedConfig = cloneDeep($this.config)  
            clonedConfig.variables = defaultVariables 
            let configuration_string = JSON.stringify(clonedConfig) 
            let configuration = new Configuration(configuration_string, defaultVariables)
            configuration.mapConfigurations()
            defaultVariables = configuration.config.variables 
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                // let targetBinding = (selected_option.create ? selected_option.create : selected_option)
                let targetBinding = selected_option
                if (selected_option.framework){
                    let validated_framework = validateFramework(selected_option.framework, defaultVariables)
                    selected_option.source = validated_framework 
                }
                // if (selected_option.option){
                //     selected_option = selected_option.options[selected_option.option]
                // }
                if (selected_option.copy){
                    let filepath = ( selected_option.copy.basename ?   
                        path.join( selected_option.copy.to, path.basename(selected_option.copy.from)   ) :
                        selected_option.copy.to
                    )
                    promises.push(copyFile(selected_option.copy.from, filepath).catch((err)=>{
                        logger.error(err)
                    }))
                }
                if (selected_option.create){
                    let output = $this.createContentOutput(selected_option.source, selected_option.create.sep)
                    promises.push(writeFile(  selected_option.create.target, output ).catch((err)=>{
                        logger.error(err)
                    }))
                } 
                if (selected_option.bind){
                    let from = selected_option.bind.from 
                    let to = selected_option.bind.to
                    try{
                        if (selected_option.bind_parent_dir){
                            env.push(`${name}=${path.join(to, path.basename(from))}`) 
                            binds.push(`${path.dirname(from)}:${to}`) 
                        } else {  
                            if (!selected_option.port ){ 
                                binds.push(`${from}:${to}`) 
                                env.push(`${name}=${to}`) 
                            } else if (selected_option.port ){
                                options = $this.updatePorts([`${selected_option.from}:${selected_option.to}`], options)
                            } 
                        }
                    } catch(err){
                        store.logger.error("%o, with variable %s", err, name)
                    }
                } else {
                    env.push(`${name}=${selected_option.target}`) 
                }
                // Define the command additions if needed
                if (cmd){ 
                    if (selected_option.placement){
                        options.Cmd[selected_option.placement] =  selected_option.cmd + " && " + options.Cmd[selected_option.placement]
                    }
                }
            }   
            console.log($this.options, $this.config)
            if (! options.Image ){
                throw new Error("No Image available")
            }  
            options.Env = [...options.Env, ...env]   
            options.HostConfig.Binds = [...options.HostConfig.Binds, ...binds]
            options.HostConfig.Binds = Array.from(new Set(options.HostConfig.Binds))
            Promise.all(promises).then((response)=>{
                logger.info("Finished all promises")
            }).catch((err)=>{
                reject(err)
            })
            logger.info("%o ______", options)
            logger.info(`starting the container ${options.name} `)
            // resolve() 
            store.docker.createContainer(options,  function (err, container) { 
                $this.container = container
                if (err){    
                    logger.error("%s %s %o","Error in creating the docker container for: ", options.name , err)
                    reject(err)
                } else{ 
                    container.attach({stream: true, stdout: true, stderr: true}, function (err, stream){
                        $this.log = spawnLog(stream, $this.logger) 
                        $this.status.stream =  $this.log
                        if (wait){
                            stream.on("end",()=>{
                                resolve(options)
                            })
                        }
                    });
                    container.start(function (err, data) {
                        if (err){
                            logger.error("%o  error in container name: %s", err, $this.name)
                            reject(err)
                        } 
                        if (!wait){ 
                            resolve( options ) 
                        }
                    })
                        
                }   
            });	
           
        });
		   
	} 
} 
 