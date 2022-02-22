import {  mapVariables } from '../controllers/mapper.js';
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

const {  validateFramework } = require("../controllers/validate.js")
const { readFile, writeFile, copyFile } = require("../controllers/IO.js")
const { module_status }  = require("../controllers/watcher.js")
const { check_container, check_image  } = require("../controllers/fetch.js")
const { spawnLog } = require("../controllers/logger.js")
const { Configuration }  = require("./configuration.js")
var logger = store.logger
// var docker = new Docker();
const fs = require("file-system") 
let dockerObj; 

export class Service {
	constructor(service, serviceIdx, orchestrated){
		this.name = service.name
        this.serviceIdx = serviceIdx
        this.type = "service"
        this.config = service 
        this.orchestrated = orchestrated
        this.dependencies = [], 
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }
        this.status = { 
            exists: false,
            exit_code: -1,
            error: null,
            success: null,
            running: false,
            complete: true,
            stream: {
                info: [
                ]
            },
        };
        this.jobInterval = null
        let depends = this.config.depends
        this.defineDependencies()
        this.readVariables()
        this.options = null
        // this.config = this.mapConfigurations()

	}
    async readVariables(){
        const $this = this;
        if ($this.config.variables){
            // for (let [key, value] of Object.entries($this.config.variables)){
            //     if (value.options){
            //         if (!value.option){
            //             value.option = 0
            //         } 
            //         value.optionValue = value.options[value.option]
            //     }
            //     if (value.load){
            //         readFile(value.load).then((data)=>{
            //             value.source = JSON.parse(data)
            //         }).catch((err)=>{
            //             store.logger.error("%o error in reading file to load for server %s", err, $this.name)
            //         })
            //     }
            // }
        }
    }
    async create_interval (){
        const $this = this
		let checking = false
        $this.watch().catch((err)=>{
            logger.error(err)
        })
        let interval = setInterval(()=>{
            if (!checking){
                checking = true 
                $this.watch().then((e)=>{
                    checking = false
                }).catch((err)=>{
                    logger.error("error in getting status %o", err)
                    checking = false
                })
            }
        }, 5000)
    //     return interval
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
    
    async watch(){ 
		let container_name = this.name
		const $this  = this;
		return new Promise(function(resolve,reject){
            // if (!$this.config.orchestrated){
                const response = check_container($this.name).then((response)=>{
                    $this.status.exists = response
                    if (response && typeof response === 'object' ){
                        $this.status.running = response.running
                        if ('err' in response && response.err && !$this.status.cancelled){
                            $this.status.error = response.err
                        }
                        if (response.msg){
                            $this.status.stream.info.push(response.msg)
                        }
                        if ($this.orchestrated){
                            $this.building = response.running
                        }
                        $this.status.complete = response.complete
                        $this.status.success = response.success
                    }
                    if (response && response.container && !$this.container){
                        $this.container = response.container
                    }
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
                    $this.dependencies.push(store.modules[dependency.id])
                }
                if (dependency.type == 'service' && dependency.id in store.modules){
                    $this.dependencies.push(store.services[dependency.id])
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
    async archive(source, destination){
        const $this = this;
        return new Promise(function(resolve,reject){
            let promises = []
            if ($this.container){  
                $this.container.putArchive(source, {path: destination}).then((response)=>{
                    resolve()
                }).catch((err)=>{
                    store.logger.error("%o error in archiving file to running container %s", err, $this.name)
                    reject(err)
                })
            } else {
                reject("No container running for service")
            }
        })
    }
    async stop() {
		let container_name = this.name;
        const $this = this;
        $this.status.cancelled = true
		return new Promise(function(resolve,reject){
			// delete store.modules[container_name]
            
            if ($this.config.orchestrated){
                let process = $this.pid
                let contr  = $this.orchestratorContainer
                if (contr){
                    resolve()
                } else {
                    resolve("Already dead...")
                }
            } else { 
                var container = store.docker.getContainer(container_name).remove({force:true}, function(err,data){
                    if (err){
                        logger.error("%s %s %o", "Error in stopping docker container: ",container_name, err)
                        reject(`Module does not exist: ${container_name}`)
                    } else {
                        logger.info("%s %s", "Success in removing container: ", container_name)
                        resolve(`Success in stop module: ${container_name}`)
                    }
                })
                
            }
		})
	}
    async check_then_start(params, wait){
        const $this = this;
        return new Promise(function(resolve,reject){
            ( async ()=>{
                let name = $this.name;
                store.logger.info(`starting container..${name}`)
                let exists = await check_container($this.name)
                if ( ( exists.exists && $this.config.force_restart) ||  exists.exists ){
                    store.logger.info("Force restarting")
                    await $this.stop()
                }
                $this.container = null
                let skip = false
                skip = await $this.start(params, wait)
                if ($this.status.cancelled){
                    skip = true
                }
                store.logger.info(`started END run...${name}`)
                resolve(skip)
            })().catch((err)=>{
                store.logger.error(err)
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
                    let runnable = returned.every((d)=>{
                        if (d.type == 'service'){
                            if (d.status && d.status.exists){
                                return d.status.exists.running
                            } else {
                                return false
                            }
                        } else {
                            return true
                        }
                    })
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
    createContentOutput(item, sep, header, newline){
        if (!sep){
            sep = ","
        }
        let tsv_file_content = item.map((d)=>{
            let full = []
            if (header && !Array.isArray(d) && typeof d == 'object'){
                header.forEach((head)=>{
                    full.push(d[head])
                    // full.push()
                })
                // full = d

            }  else {
                full = d
            }
            return full.join( ( sep == 'tab' ? "\t" : sep )  )

        }).join('\n')
        if (newline){
            tsv_file_content = tsv_file_content + "\n"
        }
        return tsv_file_content 
    }
    

    start(params, wait){ 
		const $this = this
        this.status.error = null
        this.status.running = true
        this.status.cancelled = false
        return new Promise(function(resolve,reject){
            let options = cloneDeep($this.options)
            store.logger.info("Starting.. %s", $this.name)
            let env = []
            if (!params){
                params = {}
            }
            let bind = []
            if ($this.config.bind){
                $this.config.bind.forEach((b)=>{
                    bind.push(b)
                })
            }
            if (params.bind){
                params.bind.forEach((b)=>{
                    bind.push(b)
                })
            }
            let cmd = $this.config.command
            if (cmd){
                options.Cmd = $this.config.command
            }
            let promises = []; 
            let promisesInside = []
            let values = []
            options = cloneDeep($this.updateConfig(options))
            /////////////////////////////////////////////////
            let custom_variables = params.variables
            let defaultVariables = {}
            let seenTargetTos = []
            defaultVariables = $this.config.variables
            if ($this.config.serve ){ 
                let variable_port = defaultVariables[$this.config.serve]
                options = $this.updatePorts([`${variable_port.bind.to}:${variable_port.bind.from}`],options)
            }   
            // $this.config.variables = defaultVariables
            if (defaultVariables &&  typeof defaultVariables == 'object'){
                for (let [name, selected_option ] of Object.entries(defaultVariables)){
                    // let targetBinding = (selected_option.create ? selected_option.create : selected_option)
                    let targetBinding = selected_option
                    if (selected_option.options && selected_option.option >=0){
                        selected_option= selected_option.options[selected_option.option]
                    }
                    if (selected_option.framework){
                        let validated_framework = validateFramework(selected_option.framework, defaultVariables)
                        selected_option.source = validated_framework
                    }
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
                        if (selected_option.create.type !== 'object'){
                            let output = $this.createContentOutput(selected_option.source, selected_option.create.sep, selected_option.header, selected_option.append_newline)
                            promises.push(writeFile(  selected_option.create.target, output ).catch((err)=>{
                                logger.error(err)  
                            }))

                        } else { 
                            promises.push(writeFile(selected_option.create.to, JSON.stringify(selected_option.source,null, 4)).catch((err)=>{
                                logger.error(err)
                            })) 
                        }
                    } 

                    if (selected_option.bind){
                        let from = selected_option.bind.from
                        let to = selected_option.bind.to
                        
                        try{

                            if (selected_option.bind_parent_dir){
                                env.push(`${name}=${to}/${path.basename(from)}`)
                                if (from && to && seenTargetTos.indexOf(to) == -1){
                                    bind.push(`${path.dirname(from)}:${to}`)
                                    seenTargetTos.push(to)
                                } 
                            } else {
                                if (!selected_option.port ){
                                    env.push(`${name}=${to}`)
 
                                    if (from && to && seenTargetTos.indexOf(to) == -1){
                                        bind.push(`${from}:${to}`) 
                                        seenTargetTos.push(to)
                                    }
                                } 
                            }    
                        } catch(err){ 
                            store.logger.error("%o, with variable %s", err, name)
                        }
                    } else {  
                        env.push(`${name}=${( selected_option.target ? selected_option.target : selected_option.source)}`)
                    }     
                    if (selected_option.define){
                        for( let [key, value] of Object.entries(selected_option.define)){
                            env.push(`${key}=${value}`)
                        }
                    }   
                    // Define the command additions if needed  
                    if (selected_option.append){
                        console.log("APPEND!")
                    }
                    if (selected_option.append && cmd && ( !selected_option.element ||  selected_option.source ) ){ 
                        let serviceFound = selected_option.append.services.findIndex(data => data == $this.serviceIdx)
                        if (serviceFound >= 0){ 
                            let service = selected_option.append
                            if (service.placement || service.placement == 0){
                                if (selected_option.append.position == 'start'){
                                    options.Cmd[service.placement] =  selected_option.append.command + " " + options.Cmd[service.placement]  +  " "
                                }else {
                                    options.Cmd[service.placement] =  options.Cmd[service.placement]  +  selected_option.append.command + " "
                                }
                            } else{
                                if (selected_option.append.position == 'start'){
                                    options.Cmd[options.Cmd.length - 1] =  selected_option.append.command  + " && " +   options.Cmd[options.Cmd.length - 1] 
                                } else {
                                    options.Cmd[options.Cmd.length - 1] =  options.Cmd[options.Cmd.length - 1]  + " && " +   selected_option.append.command
                                }
                            }
 
                        } 
                            
                    } 
                }  
            }
            if ($this.config.image){
                options.Image = $this.config.image  
            }
            if (! options.Image ){ 
                throw new Error("No Image available")
            } 
               
            if (typeof options.Cmd == "string"){  
                options.Cmd = ['bash', '-c', options.Cmd]
            }   
            options.Env = [...options.Env, ...env] 
            options.HostConfig.Binds = [...options.HostConfig.Binds, ...bind]
            options.HostConfig.Binds = Array.from(new Set(options.HostConfig.Binds))
            // Promise.all(promises).then((response)=>{
            //     logger.info("Finished all promises") 
            // }).catch((err)=>{ 
            //     reject(err)
            // })
            logger.info("%o ______", options)
            // logger.info(`starting the container ${options.name} `)
            $this.status.stream.info.push(JSON.stringify(options, null, 4))
            $this.status.success = false 
            $this.status.error = false 
            $this.status.complete = false
            // resolve()
            store.docker.createContainer(options,  function (err, container) {
                $this.container = container
                if (err ){
                    logger.error("%s %s %o","Error in creating the docker container for: ", options.name , err)
                    // if (err.reason && err.reason == 'no such container'){
                    //     store.docker.pull(options.Image)
                    // }
                    $this.status.running = false
                    // $this.status.error = err
                    if (err.json && err.json.message){
                        $this.status.error = err.json.message
                    } else {
                        $this.status.error = err
                    }
                    $this.status.success= false
                    $this.status.stream.info.push(err)
                    reject(err)
                }
                try{
                    function inspect(container){
                        return new Promise((resolve, reject)=>{
                            container.inspect((err, inspection)=>{
                                try{
                                    if (err){
                                        logger.error(`${err}, error in container finalization of exit code: ${$this.name}`)
                                        $this.status.error  = err
                                    } else if (!inspection){
                                        $this.status.complete= true
                                        $this.status.running = false
                                    } else if (inspection.State.exited) {
                                        logger.info(`${$this.name}, container finalized with exit code: ${inspection.State.ExitCode} ${inspection.State.Error}`)
                                        if ( (inspection.State.ExitCode > 0 && inspection.State.ExitCode !== 137 ) || inspection.State.ExitCode == 1 ){
                                            $this.status.error  = `ERROR: exit code: ${inspection.State.ExitCode}; ${inspection.State.Error}`
                                            $this.status.success = false
                                        } else { 
                                            $this.status.success = true
                                        }
                                        $this.status.complete = true
                                        $this.status.running = false
                                        $this.status.exit_code = inspection.State.ExitCode
                                    } else {  
                                        $this.status.running = true
                                        $this.status.complete = false
                                    }
                                } catch(err2){
                                    logger.error("%o error in inspecting container on end", err2)
                                } finally{
                                    if(inspection){
                                        resolve(inspection.State.Running)
                                    } else {
                                        resolve(false)
                                    }
                                } 

                            })
                        })
                    } 
                    store.logger.info("Attaching stream %s", $this.name)
                    container.attach({stream: true, stdout: true, stdin:true, stderr: true}, function (err, stream){
                        $this.log = spawnLog(stream, $this.logger)
                        $this.status.stream =  $this.log
                        $this.stream = stream 
                        container.start(function (err, data) {
                            store.logger.info("Starting... %s", $this.name)
                            if (err){  
                                logger.error("%o  error in container name: %s", err, $this.name)
                                if (err.json && err.json.message){
                                    $this.status.error = err.json.message
                                } else {
                                    $this.status.error = err
                                }
                                reject(err)
                            } 
                            if (!wait || $this.config.continuous){
                                resolve( false )
                            } else { 
                                
                                // if (process.platform == 'win32'){
                                let ended = false
                                $this.jobInterval = setInterval(()=>{
                                    if (ended){
                                        clearInterval($this.jobInterval)
                                    }
                                    if ($this.status.complete){
                                        ended = true
                                        clearInterval($this.jobInterval)
                                        if ($this.status.error){
                                            resolve(true)
                                        } else {
                                            resolve(false)

                                        }
                                    }
                                },1000)
                                // }
                            } 
                            stream.on("close",()=>{ 
                                store.logger.info("Stream Closed!")
                                
                            })
                            stream.on("error",(err)=>{ 
                                $this.status.error  = err
                                reject()
                            })
                        })
                    })
                } catch(err){
                    store.logger.error("Error in running container: %s %o", $this.name, err)
                    $this.status.running = false
                    // $this.status.error = err
                    $this.status.success= false
                    $this.status.complete = true 
                    if (err.json && err.json.message){
                        $this.status.stream.info.push(err.json.message)
                    } else {
                        $this.status.stream.info.push(err)
                    }
                    
                    reject()
                }
            } )
        });
	}
}
