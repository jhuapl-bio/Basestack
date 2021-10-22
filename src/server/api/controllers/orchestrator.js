import e from 'express';
import { resolve } from 'path';
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
const { readFile } = require("./IO.js")
const { list_module_statuses }  = require("./watcher.js")
const { check_container, getExternalSource } = require("./fetch.js")
const { spawnLog, createLoggingObject } = require("./logger.js")
var logger = store.logger
// var docker = new Docker();
const fs = require("file-system")
let dockerObj;

export class Orchestrator {
	constructor(name, params){
		this.name = name
        this.workflow = null
        this.service = params
		this.container = null;
		this.cmd = null;
		this.options = {};
		this.streamObj = null;
		this.config = null;  
        this.logger = createLoggingObject(name)
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }

	}
	// async watch(){
	// 	let container_name = this.container_name;
	// 	const $this  = this;
	// 	return new Promise(function(resolve,reject){
	// 			store.statusIntervals.modules[container_name] = setInterval(()=>{
	// 			(async () => {					 
	// 				const response = await $this.check_container_exists(contai ner_name)
	// 				store.modules[container_name].status.running = response 
	// 			})().catch((err)=>{
	// 				reject(err)
	// 			})
	// 		}, 2000)
	// 		resolve()
	// 	})
	// }
    async create_interval (){
        const $this = this
        let interval = setInterval(()=>{
            if (!$this.interval.checking){
                $this.interval.checking = true
                // $this.dependencyCheck().then(()=>{
                //     $this.interval.checking = false
                // })

                $this.statusCheck().then((state)=>{
                    $this.interval.checking = false
                }).catch((err)=>{
                    logger.error("%s err in status check interval for %s",err, $this.name)
                    $this.interval.checking = false
                })
                
            }
        }, 2000)
        
        
        return interval

    }   
    async init(){
		const $this = this
        let service = this.service
        //Check if all dependencies are installed, if not return false
        try{
            await $this.dependencyCheck()
            let complete = $this.service.dependencies.every((dependency)=>{
                return dependency.status  
            }) 
            $this.service.status = {
                running: false, 
                errors: null, 
                stream: []
            } 
            await $this.setOptions()
            $this.updateConfig()
            if ($this.service.force_init){ 
                await $this.stop()
            }   
            
            let state = await $this.statusCheck()
            if (state.running){
                let err, stream = await state.container.logs({follow: true, stdout:true, stderr:true})
                $this.log = spawnLog(stream, $this.logger) 
            } 
            if ($this.service.init){
                if ($this.service.variables){
                    await $this.check_then_start($this.service.variables)
                } else {
                    await $this.check_then_start()
                }
            }
            return 
        } catch (err){
            logger.error(`%o error inerror in initializing service ${this.name}`, err)
            return err
        }
	} 
    defineConfig(){
        let service = this.service
        let optionsFile
        if (service.orchestrated && service.workflow_bind){ 
            optionsFile = store.system.orchestrators.subclient.config.file
        }
        else if (service.orchestrated && !service.workflow_bind){
            this.workflow = path.join(store.system.modules.path,  service.config)
            optionsFile = path.join(store.system.modules.path,  service.config)
        } else if (!service.orchestrated && service.config){
            this.workflow = path.join(this.workflow, service.config) 
            optionsFile = path.join(store.system.modules.path, "workflows", this.workflow, service.config)
        } else {
            this.workflow = 'default' 
            optionsFile = store.system.orchestrators.default.config.file 
        }
        
        
        return optionsFile 
    } 
    updatePorts(ports){
        const $this = this
        this.options.HostConfig.PortBindings = {}
        this.options.ExposedPorts = {}
        ports.forEach((port)=>{
            if (Array.isArray(port)){
                for (let i  = port[0]; i <= port[1]; i+=1){
                    $this.port_bind(i)  
                }
            } else {
                $this.port_bind(port)
            }
        })
    }
    port_bind(portSpec){  
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
        !$this.options.HostConfig.PortBindings[to] ? $this.options.HostConfig.PortBindings[to] = [] : ''
        $this.options.HostConfig.PortBindings[to].push(
            { 
                "HostPort": `${from}` // make the port a string
            }  
        )     
        $this.options.ExposedPorts[to] = {}
    }
    updateConfig(){         
        let service = this.service
 
        if (!this.options.Cmd || (Array.isArray(this.options.Cmd) &&      this.options.Cmd.length == 0 ) ){
            this.options.Cmd = service.command
        } 
        const $this = this
        if (this.service.ports && (Array.isArray(this.service.ports) )) {
            $this.updatePorts(this.service.ports)
        }
        if (this.service.variables && (Array.isArray(this.service.variables))){
            this.service.variables.forEach((variable)=>{
                if (!variable.option){
                    variable.option = 0
                }
            })
        }
        if (!this.options.Image){ 
            this.options.Image = service.image
        }
       
        if (!this.options.name){
            this.options.name = service.name
        }
        if (this.service.workflow_bind || this.service.orchestrated ){
            console.log(this.workflow)
            let p = path.join(store.system.modules.path, "workflows", this.workflow )
            this.options.WorkingDir = "/workflow" 
            this.options.HostConfig.Binds.push( p + ":/workflow:ro")
        }
        if (service.workingdir){
            this.options.WorkingDir = service.workingdir
        }
              
    }
	async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
            (async ()=>{
                let status = await check_container($this.service.name)
                $this.service.status.running = status.running
                $this.service.status.exists = status.exists
                resolve(status)
            })().catch((err)=>{
                resolve(false)
            })
        })
	}
	async dependencyCheck(){
		const $this = this;
        let dependencies = this.service.dependencies 
		return new Promise(function(resolve,reject){
			let promises = []
			// dependencies.forEach((dependency)=>{ 
			// 	console.log(dependency)
			// })
            resolve()
		})
	}
    async setOptions(){
        const $this = this
        let file = $this.defineConfig() 

        let data = JSON.parse(await readFile(file))
        this.options = data
        return "Success in getting options" 
    }
    async checkProgress(variables){
        const $this = this
        return new Promise(function(resolve,reject){
            let items = cloneDeep($this.service.progress)
            let progresses = []
            items.forEach((item)=>{
                let variable = $this.replaceVariables(item.source, variables)
                progresses.push(variable)
            })
            list_module_statuses(progresses).then((returned_data)=>{
                returned_data.map((d,i)=>{
                    items[i].status = d 
                })
                resolve(items)
            }).catch((err)=>{
                reject(err)
            })
        })

    }
    updateVariables(data){
        const $this = this
        try{
            let variables = [];
            if (!data || !this.service.variables || !Array.isArray(this.service.variables)){
                return 
            } 
            // let returned_option = 
            variables = cloneDeep(this.service.variables )
            const keys = this.service.variables.map((d)=>{return d.name})
            data.forEach((value, key)=>{
                const index = keys.indexOf(value.name)
                if(index > -1){
                    let option = ( value.option ? value.option : 0)
                    if (value.source){
                        value.value = value.source
                    }
                    variables[index].option = option
                    if (variables[index].options){
                        if (!value.value){
                            if (value.options){
                                variables[index].options[option].source = value.options[option].source
                            } 
                        } else {
                            variables[index].source = value.value
                            if (value.option){
                                variables[index].options[option].source = value.value
                            }
                        }

                    } else {
                        variables[index].source = ( value.value ? value.value : value )
                    }
                }
                

            })
            return variables
        } catch(err){
            logger.error("%o error in updating variables", err)
            throw err
        }
    }
	async stop() {
		let container_name = this.options.name;
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
    async createNetworks(names){
        try {  
            logger.info(`${names}, creating network`)
            let networks = await store.docker.listNetworks()
            // logger.info(`${JSON.stringify(networks, null, 4)}, networks`)
            let promises = []
            names.forEach((name)=>{
                promises.push(store.docker.createNetwork({Name: name, CheckDuplicate: true }))
            })
            Promise.allSettled(promises).then((response)=>{
                return response
            }).catch((err)=>{
                // throw err
                logger.error("%o %s", err, `error in creating network(s)`)
                return 
            })
        } catch(err){  
            logger.error("%o %s", err, `error in creating network(s)`)
            throw err
        }  
    }
    async createVolumes(names){
        try { 
            logger.info(`${names}, creating volumes`)
            let networks = await store.docker.listVolumes()
            // logger.info(`${JSON.stringify(networks, null, 4)}, networks`)
            let promises = []
            names.forEach((name)=>{ 
                promises.push(store.docker.createVolume({Name: name, CheckDuplicate: true }))
            })
            Promise.allSettled(promises).then((response)=>{
                return response
            }).catch((err)=>{ 
                // throw err
                logger.error("Error in creating volume, %o", err)
                return 
            }) 
        } catch(err){
            logger.error(`${err}, error in creating volume(s)`)
            throw err
        }
    }
    async check_then_start(variables){
        let name = this.options.name 
        let exists = await check_container(this.name)
       
        if ((exists.running || exists.exists && this.service.force_restart) || (!this.service.force_restart && exists.exists)){
            logger.info("Force restarting")
            await this.stop() 
        } 
        await this.start(variables)
        console.log(`started run...${name}`)
        return  name
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
    defineSourceTargetBinding(selected_option){
        const $this =this
        let source = selected_option.source
        let target = source
        if (target && target !== ''){
            let inner_variables = target.match(/(\${.+?\}){1}/g) 
            // Replace variables ${variable} entries in the target section
            if (inner_variables && Array.isArray(inner_variables)){
                inner_variables.forEach((vari)=>{
                    let id = vari.replace(/[\$\{\}]/g, "")
                    // let source = ( selected_option.options ? selected_option.options[selected_option.source] : selected_option.source )
                    if (selected_option.variables){
                        if (id in selected_option.variables){
                            target = selected_option.source.replaceAll(vari, selected_option.variables[id])
                        } else {
                            target = target.replaceAll(vari, "")
                        }    
                    } else {
                        target = target.replaceAll(vari, "")
                    }
                })
            } 
        }
        //Define the Bind Mounts Target  and Source
        if (selected_option.bind){  
            let bind = $this.volume_bind(selected_option)
            //Define the environmental variables
            // if (selected_option.bind_parent_dir ){
            //     source = path.dirname(bind[0])
            // } 
            source = bind[0]
            target = bind[1]
        } 
        //Define the Source path for Bind Mounrs
        return [source, target]
    }
	start(variables){ 
		const $this = this  
        return new Promise(function(resolve,reject){ 
            let options = JSON.parse(JSON.stringify($this.options))

            let env = []    
            let binds = [] 
            let complete = $this.service.dependencies.every((dependency)=>{
                return dependency.status  
            }) 
            //Identity if the service should be started and ONLY IF all dependencies are installed for said module
            if (!complete){  
                logger.info(`running a module that has all necessary deps... ${$this.service.command}`)
                reject(new Error("All Dependencies aren't installed"))
            }  
            if (variables && Array.isArray(variables)){
                variables.forEach((variable)=>{
                    let selected_option  = variable
                    if (variable.options){
                        selected_option = ( variable.option ? variable.options[variable.option] : variable.options[0] )
                    }
                    let srcTarget = $this.defineSourceTargetBinding(selected_option)
                    // selected_option = $this.defineTarget(selected_option)
                    if (selected_option.bind){
                        binds.push(`${srcTarget[0]}:${srcTarget[1]}`) 
                    }
                    if (selected_option.bind_parent_dir){
                        env.push(`${variable.name}=${path.join(srcTarget[1], path.basename(selected_option.source))}`) 
                    } else {
                        env.push(`${variable.name}=${path.join(srcTarget[1])}`) 
                    }
                    // Define the command additions if needed
                    if ( selected_option.cmd){
                        if (selected_option.placement){
                            options.Cmd[selected_option.placement] =  selected_option.cmd + " && " + options.Cmd[selected_option.placement]
                        } else {
                            options.Cmd.push(selected_option.cmd) 
                        }
                    }

                })
                
            }   
            // if (this.service.orchestrated || this.service.workflow_bind){
            //     binds.push()
            // }
            options.Env = [...options.Env, ...env]   
            options.HostConfig.Binds = [...options.HostConfig.Binds, ...binds]

            
            logger.info(`starting the container ${options.name} ${options.Cmd}`)
             
            console.log(binds, env,options,"______________________________________________") 
            // store.docker.createContainer({Image: "ubuntu:latest"}, function (err, container) { console.log(err, container); resolve();})
            // promise.then(()=>{
                store.docker.createContainer(options,  function (err, container) { 
                    if (err){    
                        logger.error("%s %s %o","Error in creating docker container for: ", options.name , err)
                        reject(err)
                    } else{ 
                        container.attach({stream: true, stdout: true, stderr: true}, function (err, stream){
                            $this.log = spawnLog(stream, $this.logger) 
                        });
                        container.start(function (err, data) {
                            if (err){
                                reject(err)
                            } 
                            // logger.info(("%s %o %o", `running container: ${$this.name} with service config: `, $this.options, $this.service ))
                            resolve( options ) 
                        })
                         
                    }   
                });	
            // }).catch((err)=>{
            //     logger.error(err)
            //     reject(err)
            // })
             
        });
		   
	} 
} 
 