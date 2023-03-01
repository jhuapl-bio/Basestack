import nestedProperty from 'nested-property';
import { checkExists } from '../../../shared/IO.js';
const cloneDeep = require("lodash.clonedeep"); 
const os = require("os")
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
const { readFile, readCsv, writeFile, copyFile, writeFolder } = require("../controllers/IO.js")
const { check_container,   } = require("../controllers/fetch.js")
const { spawnLog } = require("../controllers/logger.js")
const { Configuration }  = require("./configuration.js")
var logger = store.logger    
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
        this.override = {},
        this.interval = {
            checking: false, 
            interval: this.create_interval()
        }
        this.env = []
        this.mounts = []
        this.volumes = []
        this.binds = []
        this.portbinds = []
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
        this.options = null
        this.defineDependencies()
        this.readVariables()
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
            $this.status.stream.info = $this.status.stream.info.splice(-150)
        }, 5000)
    //     return interval
    }
	defineConfig(){
        let service = this.config
        let optionsFile 
        if (service.config ){
            optionsFile = service.config
        } else if ( ( typeof service.orchestrated == 'number' && service.orchestrated >= 0  ) && !service.config ){
            optionsFile = store.system.orchestrators.subclient.path
        } else if (service.orchestrator){
            optionsFile = store.system.orchestrators.orchestrator.path
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
                    $this.Config = response.container
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
                let container = store.docker.getContainer(container_name).remove({force:true}, function(err,data){
                    if (err){
                        logger.error("%s %s %o", "Error in stopping docker container: ",container_name, err)
                        reject(`Module does not exist: ${container_name}`)
                    } else {
                        logger.info("%s %s", "Success in removing container: ", container_name)
                        resolve(`Success in stop module: ${container_name}`)
                    }
                })
                // let contr  = $this.orchestratorContainer
                // if (contr){
                //     resolve()
                // } else {
                //     resolve("Already dead...")
                // }
            } else { 
                let container = store.docker.getContainer(container_name).remove({force:true}, function(err,data){
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
                if ( (  $this.config.force_restart) ||  exists.exists ){
                    store.logger.info("Force restarting______________")
                    try{
                        await $this.stop()
                    } catch(err){
                        store.logger.error("Err in stopping container %o", err)
                    }
                }
                // let index = procedures.dependencies.findIndex((f)=>{
                //     return f.fulltarget == service.config.image
                // })
                // try{
                //     if (autocheck){
                //         console.log("buidling")
                //         await procedures.build(false, index, true)
                //         console.log("doen building")
                //     }
                // } catch (err){
                //     store.logger.error(`${err} error in autopulling docker image`)
                // }
                    
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
            if (!Array.isArray(port)){
                options = $this.port_bind(port, options)
            } else {
                let from = port[0]  
                let to = port[1]
                options = $this.port_bind({from: from, to: to}, options)
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
            from = portSpec.from
            to = portSpec.to
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
    createContentOutput(item, sep, header, newline, outputHeader, type, resolve){
        if (!sep){
            sep = ","
        }

        let tsv_file_content = item.map((d)=>{ 
            let full = []
            if (header && !Array.isArray(d) && typeof d == 'object'){
                header.forEach((head)=>{
                    full.push(d[head])
                })
            }  else { 
                full = d 
            }
            return full.join( ( sep == 'tab' ? "\t" : sep )  )

        })
        if (header && outputHeader){
            tsv_file_content.unshift(header.join(( sep == 'tab' ? "\t" : sep )))
        }
        tsv_file_content = tsv_file_content.join('\n') 
        if (newline){
            tsv_file_content = tsv_file_content + "\n"
        }
        return tsv_file_content  
    } 
    definePortBinds(){
        let portbinds = [] 
        const $this = this
        let seenTargetTos = [] 
        let defaultVariables = this.config.variables 
        if (defaultVariables){
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                
                if (typeof selected_option == 'object' && selected_option.portbind){
                    let from = selected_option.portbind.from
                    let to = selected_option.portbind.to 
                    if (Array.isArray(from) && Array.isArray(to)){
                        from.forEach((p,i)=>{ 
                            portbinds.push([p, to[i]])
                        }) 
                    } else if (Array.isArray(from) && !Array.isArray(to) ){
                        from.forEach((p,i)=>{
                            portbinds.push([p, to ]) 
                        })
                    } else if (!Array.isArray(from) && Array.isArray(to) ){  
                        to.forEach((p,i)=>{
                            portbinds.push([from, p ])
                        })
                    }
                    else {
                        portbinds.push([from, to]) 
                    }

                     
                }
            }
        } 
        this.portbinds.push(...portbinds)
        return portbinds 
    }  
    removeQuotes(string){
        if (string){
            string = string.replace(/[\'\"]/g, "")
            string = string.replace(/[\s]/g, "\ ")
            return `${string}`
        } else {
            return null
        }
    }
    setTarget(target){
        if (target && typeof target == 'string'){
            target = target.replaceAll(/\\/g, "/")
            target = target.replaceAll(/\s/g, '_')
            target = target.replaceAll(/:/g, "_")
            if (!target.startsWith("/")){
                target = `/${target}`
            }
        }
        return target
    }
    async defineBinds(){
        let binds = [] 
        let mounts = []
        let volumes = []
        const $this = this
        let seenTargetTos = []
        async function formatBind(source, target, element){
            let exists = await checkExists(source)
            let returnable = {
                Source: `${source}`, 
                Type: "bind", 
                Target: `${target}`
            }
            if (exists && exists.exists){
                store.logger.info(`${source} exists, skipping creation`)
                
            } else { 
                store.logger.info(`${source} source does not exist, creating folder`)
                if (element !== "file"){
                    await writeFolder(source)
                }
                
            }
            
            return  returnable
            
        }   
        let defaultVariables = this.config.variables   
        
        let promises  = [] 
        if ($this.config.bind){ 
            if (Array.isArray($this.config.bind) || Array.isArray($this.config.bind.from)){   
                let bnd = ( $this.config.bind.from ? $this.config.bind.from : $this.config.bind)   
                    bnd.forEach((b)=>{
                        if (typeof b == 'object' && b.from){
                            promises.push(formatBind(
                                path.resolve(b.from),
                                this.reformatPath(b.to)
                            )) 
                        } else if (b) {
                            let y = b.split(":")
                            promises.push(formatBind(
                                path.resolve(b[0]),
                                this.reformatPath(b[1])
                            ))

                        }
                    })   
            } else {
                let b  = $this.config.bind
                
                if (b.from)
                {
                    promises.push(formatBind(
                        path.resolve(b.from),
                        this.reformatPath(b.to)
                    ))
                }
            } 
        } 
        if (this.config.orchestrator){
            binds.push(`basestack-docker-${$this.name}:/var/lib/docker`)
        } 
         
        if (defaultVariables){  
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                if (selected_option.options){
                    selected_option = {... selected_option.options[(selected_option.option ? selected_option.option : 0)]}
                }
                if (typeof selected_option == 'object' && selected_option.bind){
                    let from = selected_option.source
                    let to = selected_option.target 
                     
                    if (selected_option.bind && selected_option.bind.from){
                        from = selected_option.bind.from  
                    }
                    if (selected_option.bind && selected_option.bind.to){
                        to  = selected_option.bind.to
                    }  
                    if (!from){
                        continue 
                    }
                    if (from == '.'){
                        from = null
                    }  
                    
                    if (Array.isArray(selected_option.source) && selected_option.element != 'list'){
                        let s = from   
                        s.forEach((directory,i)=>{  
                            let finalpath = to[i]    
                            if (seenTargetTos.indexOf(finalpath) == -1 && directory){
                                finalpath = $this.removeQuotes(finalpath)
                                promises.push(formatBind(path.resolve(directory), this.reformatPath(finalpath),selected_option.element))
                            }   
                            
                            seenTargetTos.push(finalpath)
                        })  
                    } else { 
                        if (selected_option.bind == 'directory' || selected_option.bind == 'dir'){
                            let finalpath = path.dirname(to)
                            if (seenTargetTos.indexOf(finalpath) == -1 && from){
                                finalpath = $this.removeQuotes(finalpath)
                                
                                promises.push(formatBind(
                                        path.resolve(path.dirname(from)), 
                                        this.reformatPath(finalpath),
                                        selected_option.element
                                    ) 
                                )
                                
                                // binds.push(`${path.resolve(path.dirname(from))}:${this.reformatPath(finalpath)}`) 
                            } 
                            seenTargetTos.push(finalpath)
                        } else if (typeof selected_option.bind == 'object' && from){
                            console.log("asdasddasd")
                            if (Array.isArray(selected_option.bind)){
                                 selected_option.bind.forEach((bd)=>{
                                    bd.to = $this.removeQuotes(bd.to, bd.from)
                                    promises.push(formatBind( 
                                        path.resolve(bd.from),
                                        this.reformatPath(bd.to),
                                        selected_option.element

                                    )) 
                                 })
                            } else {
                                selected_option.bind.to = $this.removeQuotes(selected_option.bind.to, selected_option.bind.from)
                                promises.push(formatBind( 
                                    path.resolve(selected_option.bind.from),
                                    this.reformatPath(selected_option.bind.to),
                                    selected_option.element 

                                )) 
                            }
                            
                            // binds.push(`${path.resolve(selected_option.bind.from)}:${this.reformatPath(selected_option.bind.to)}`) 
                            seenTargetTos.push(selected_option.bind.to)
                        }  else {      
                            if (seenTargetTos.indexOf(to) == -1 && from){ 
                                to = $this.removeQuotes(to)
                                promises.push(
                                    formatBind(path.resolve(from), 
                                    this.reformatPath(to),
                                    selected_option.element
                                )
                                
                                )
                            }   
                            
                            seenTargetTos.push(to)
                        } 
                    }

                    
                      
                }
            }
        }
        // this.binds.push(...binds)
        let promiseMounts = await Promise.allSettled(promises)
        store.logger.info("Done creating all mounts")
        promiseMounts.forEach((f)=>{
            if (f.status == 'fulfilled'){
                if (f.value.Source && f.value.Target){
                    mounts.push(f.value)
                }
            }
        }) 
        this.mounts.push(...mounts) 
        return   
    }     
    reformatPath(selected_path){
        if (selected_path && selected_path !==''){
            selected_path = this.setTarget(selected_path)
            if (!selected_path.startsWith("/")){
                if (this.config.workingdir){
                    selected_path = `${this.config.workingdir}/${selected_path}`
                } else {
                    selected_path = `/${selected_path}`
                }
                
            }
        }
        if (selected_path == '/'){ 
            selected_path = "/junk"
        }
        return selected_path
    }
    async defineCopies(){ 
        const $this = this; 
        let promises = []
        let defaultVariables = this.config.variables
        if (!defaultVariables){
            defaultVariables = {} 
        }
        for (let [name, selected_option ] of Object.entries(defaultVariables)){
            if (!selected_option.optional || (selected_option.optional && selected_option.source ) ){
                let targetBinding = selected_option
                let full_item = cloneDeep(selected_option)   
                       
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
                    if (selected_option.create.type == 'list' && selected_option.source.length > 0){
                        console.log("create content!", selected_option.create.target)
                        let output = $this.createContentOutput(selected_option.target, selected_option.create.sep, selected_option.header, selected_option.append_newline, selected_option.create.header,'list', selected_option.resolve)
                        promises.push(writeFile(  selected_option.create.target, output ).catch((err)=>{
                            logger.error(err)  
                        }))

                    } else if (selected_option.create.type == 'json' ) {
                        promises.push(writeFile(selected_option.create.target, JSON.stringify(selected_option.source,null, 4)).catch((err)=>{
                            logger.error(err)  
                        }))      
                    } else if (selected_option.source.length > 0) {   
                        promises.push(writeFile(selected_option.create.target, JSON.stringify(selected_option.source,null, 4)).catch((err)=>{
                            logger.error(err)    
                        }))        
                    }                      
                }
            }
        }
        await Promise.allSettled((promises))
        return 
    }
    async defineSet(){      
        let promises = []
        const $this=this 
        let binds = []
        let defaultVariables = this.config.variables 
        if (defaultVariables){
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                if (selected_option.set && (!selected_option.manifest.source || selected_option.manifest.source.length == 0 ) ){
                    
                    for (let i = 0; i < selected_option.set.length; i++){
                        let set  = selected_option.set[i]
                        let exists = await fs.existsSync(set.source)
                        if (exists){
                            try{
                                let f = await readCsv(set.source, set.sep)
                                if (selected_option.set){ 
                                    store.logger.info(`${selected_option.set}`)
                                }
                                store.logger.info(`${exists}, set csv done`)
                                let updates = []
                                f.forEach((row)=>{ 
                                    let rowupdate = []
                                    set.header.forEach((head)=>{
                                        if (set.reformat && set.reformat.indexOf(head) !=-1){
                                            if (row[head] && !path.isAbsolute(row[head])){
                                                row[head] = path.join(path.dirname(set.source), row[head])
                                            }
                                            rowupdate.push($this.reformatPath(row[head]))
                                        }else {
                                            rowupdate.push(row[head])
                                        } 
                                    })
                                    updates.push(rowupdate)   
                                }) 
                                
                                nestedProperty.set($this.config, set.target, updates)
                                set.target = updates 
                            } catch (err){
                                store.logger.error(`${err}, error in reading csv to set file`)
                            }
                        }
                    }
                }
            } 
             
            return 
        }
    }
    async defineReads(){
        let promises = [] 
        let binds = []
        let defaultVariables = this.config.variables 
        if (defaultVariables){
            for (let [name, selected_option ] of Object.entries(defaultVariables)){
                if (selected_option.define_columns){  
                    let defined = selected_option.define_columns
                    let defined_keys = []

                    for (let [key, column] of Object.entries(defined)){
                        if (typeof column != 'object') {
                            continue
                        }
                        if (!Array.isArray(column.element)){
                            column.element = [column.element]
                        } 
                        
                        let tr = false 
                        column.element.map((F)=>{
                            if (['directory','dir', 'file'].indexOf(F) > -1){
                                tr=true
                            }
                        })
                        if (tr){
                            defined_keys.push(key)
                        }
                    }
                    selected_option.source
                        .forEach((read)=>{
                        try{ 
                            
                            defined_keys.forEach((key)=>{
                                let bind = {
                                    Source: "",
                                    Type: "bind",
                                    RW: true,
                                    Target: ""
                                }  
                                let row = read[key]
                                let column = defined[key]
                                if(row !== '' && row){ 
                                    
                                    bind.Source = path.resolve(`${row}`)
                                    bind.Target = this.reformatPath(row)
                                    
                                    if( row && binds.indexOf(bind) == -1){
                                        if (column.element == 'directory' || column.element == 'dir'){
                                            binds.push(bind)
                                        } else {
                                            if (column.binddir){
                                                bind.Source = path.dirname(bind.Source)
                                                bind.Target = path.dirname(bind.Target)
                                            }
                                            binds.push(bind)
                                        }
                                    }  
                                }
                            })
                        } catch (err){
                            store.logger.error(`${err}, error in reading csv file`)
                        }
                    })
                       
                
                }
            }
            return binds
        } else {
            return []
        }
        
    }
    
    
    defineEnv(){ 
        let env = []   
        let bind = []    
        const $this = this;    
        let seenTargetTos = []  
        let defaultVariables = $this.config.variables  
        if (defaultVariables){   
            for (let [key, selected_option ] of Object.entries(defaultVariables)){
                let full_item = cloneDeep(selected_option)
                if (selected_option.optionValue  && typeof selected_option.optionValue == 'object'){
                    selected_option = selected_option.optionValue
                }    
                if (typeof selected_option == 'object'){ 
                    if (selected_option.output && !selected_option.target){
                        store.logger.info(`no defined target for variable: ${key}`) 
                    } else {   
                        if (!Array.isArray(selected_option.target)){
                            if (selected_option.target || selected_option.source){
                                env.push(`${key}=${( selected_option.target ? selected_option.target : selected_option.source)}`)                         
                            } 
                        } else {
                             
                            if (selected_option.target ){
                                let su  = selected_option.target.join( (selected_option.bindChar ? selected_option.bindChar : " " ) )

                                env.push(`${key}=${su}`)
                            }
                        } 
                    }
                } else if (Array.isArray(selected_option)){
                    console.log("array!")
                } else{
                     
                    if (selected_option){
                        env.push(`${key}=${selected_option}`)
                    }
                }
                if ((selected_option.define || full_item.define) && selected_option.source){
                    if (full_item.define){
                        for( let [key, value] of Object.entries(full_item.define)){
                            if (value){
                                if (typeof value == 'object' && value.path){
                                    env.push(`${key}=${$this.reformatPath(value.target)}`)
                                } else {
                                    env.push(`${key}=${value}`)
                                }
                                
                            }
                        }  
                    } else {
                        for( let [key, value] of Object.entries(selected_option.define)){
                            if (value){
                                if (typeof value == 'object' && value.path){
                                    env.push(`${key}=${$this.reformatPath(value.target)}`)
                                } else {
                                    env.push(`${key}=${value}`)
                                }
                                
                            } 
                        }
                    }
                    
                }  
                // if (full_item.define && full_item.source){
                    
                //     for( let [key, value] of Object.entries(full_item.define)){
                //         if (value){
                //             if (typeof value == 'object' && value.path){
                //                 env.push(`${key}=${$this.reformatPath(value.target)}`)
                //             } else {
                //                 env.push(`${key}=${value}`)
                //             }
                            
                //         }
                //     }  
                // }  
                
                
               
            } 
        }    
           
        this.env.push(...env)
        return 
    }  
 
    async start(params, wait){  
		const $this = this
        this.status.error = null
        const setUser = $this.config.setUser
        this.status.running = true
        this.status.cancelled = false
        return new Promise(function(resolve,reject){ 
            ( async ()=>{
                try{ 
                    let options = cloneDeep($this.options)
                    if (!options.HostConfig.Mounts){
                        options.HostConfig.Mounts = []
                    }
                    store.logger.info("Starting.. %s", $this.name) 
                    let env = []
                    if (!params){ 
                        params = {} 
                    } 
                    
                    let cmd = $this.config.command 
                    if (cmd){  
                        options.Cmd = $this.config.command
                    } 
                    let promises = [];       
                    let promisesInside =  []  
                    let values = []    
                    options = cloneDeep($this.updateConfig(options))
                    /////////////////////////////////////////////////
                    let custom_variables = params.variables 
                    let defaultVariables = {}      
                              
                    // $this.config.variable s = defaultVariables  
                    let envs = {}       
                    // $this.setTarget()  
                    defaultVariables = $this.config.variables 
                    if ($this.config.serve  ){      
                        let variable_port = defaultVariables[$this.config.serve] 
                        options  = $this.updatePorts([`${variable_port.bind.to}:${variable_port.bind.from}`],options) 
                    }   
                    $this.defineEnv() 
                    store.logger.info("define env done")  
                    
                    let mounts = await $this.defineReads()
                    
                    store.logger.info("define reads done  ")
                    // await $this.defineSet() 
                    
                    store.logger.info("define set done")
                    await $this.defineCopies()  
                    store.logger.info("define copies doen")
                    await $this.defineBinds()   
                    store.logger.info("define binds done")
                    $this.definePortBinds()
                    // store.logger.info("define volumes")
                    // $this.defineVolumes()
                    if ($this.config.orchestrator){
                        // binds.push(`${path.join(store.system.writePath,  "workflows", this.name, "docker") }:/var/lib/docker`)
                        $this.binds.push(`basestack-docker-${$this.name}:/var/lib/docker`)
                    }
                    store.logger.info("define port binds done")
                    await $this.updatePorts($this.portbinds,options)
                    store.logger.info("update ports done") 
                    const userInfo = os.userInfo();
                    // get uid property
                    // from the userInfo object
                    if (setUser ){  
                        const uid = userInfo.uid;
                        if(uid){
                            
                            if (!options.Config){
                                options.Config = {} 
                            } 
                            const gid = userInfo.gid;
                            options['User'] = `${uid}:${gid}`
    
                        } 
                    }
                      
                    if (defaultVariables &&  typeof defaultVariables == 'object'){
                        for (let [name, selected_option ] of Object.entries(defaultVariables)){
                            if (!selected_option.optional || (selected_option.optional && selected_option.source ) ){
                                if (selected_option.options){
                                    selected_option = {... selected_option.options[(selected_option.option ? selected_option.option : 0)]}
                                }
                                let targetBinding = selected_option
                                let full_item = cloneDeep(selected_option)   
                                
                                 
                                function append_commands(appendable){  
                                    
                                    let serviceFound = appendable.services.findIndex(data => data == $this.serviceIdx)
                                    if (serviceFound >= 0){ 
                                        let service = appendable 
                                           
                                        if (service.placement >= 0){ 
                                            if (appendable.position == 'start'){
                                                options.Cmd[service.placement] =  appendable.command + " " + options.Cmd[service.placement]  +  " "
                                            }else {    
                                                options.Cmd[service.placement] =  options.Cmd[service.placement]  +  appendable.command + " "
                                            } 
                                        } else{ 
                                            if (appendable.position == 'start'){
                                                options.Cmd[options.Cmd.length - 1] =  appendable.command  + " && " +   options.Cmd[options.Cmd.length - 1] 
                                            } else {
                                                options.Cmd[options.Cmd.length - 1] =  options.Cmd[options.Cmd.length - 1]  + " && " +   appendable.append.command
                                            }
                                         }  
             
                                    } 
                                }
                                // Define the command additions if needed  
                                if (selected_option.append && cmd && ( !selected_option.element ||  full_item.source ) ){ 
                                    if (!Array.isArray(selected_option.append)) {
                                        append_commands(selected_option.append)
                                    } else{
                                        selected_option.append.forEach((appendable)=>{
                                            append_commands(appendable)
                                        })
                                    }
                                        
                                } 
                            }  
                        }
                    }
                    let append = $this.config.append
                    if (append){
                        if (append.placement || append.placement == 0){
                            if (append.position == 'start'){
                                options.Cmd[append.placement] =  append.command + " " + options.Cmd[append.placement]  +  " "
                            }else { 
                                options.Cmd[append.placement] =  options.Cmd[append.placement]  +  append.command + " "
                            }  
                        } else{   
                            if (append.position == 'start'){    
                                options.Cmd[options.Cmd.length - 1] =  append.command  + " && " +   options.Cmd[options.Cmd.length - 1] 
                            } else {   
                                options.Cmd[options.Cmd.length - 1] =  options.Cmd[options.Cmd.length - 1]  + " && " +   append.command
                            }      
                        }     
                    }    
                    if ($this.config.image){ 
                        let img = $this.config.image
                        options.Image = img    
                    }   
                    if (! options.Image ){ 
                        throw new Error("No Image available")  
                    }   
                          
                    if (typeof options.Cmd == "string"){    
                        options.Cmd = ['bash', '-c', options.Cmd]  
                    }     
                    if (!$this.config.command) 
                    {  
                        options.Cmd = null 
                    }  
                    if ($this.override.image){
                        options.Image = $this.override.image
                    } 
                    options.Env = [...options.Env, ...$this.env ]  
                    options.HostConfig.Binds = [...options.HostConfig.Binds, ...$this.binds ]
                    options.HostConfig.Binds = Array.from(new Set(options.HostConfig.Binds))
                    let seen = {}
                    mounts.forEach((m)=>{
                        if (!seen[m.Target]){ 
                            // m.Target = `"${m.Target}"`
                            // m.Source = `"${m.Source}"`
                            options.HostConfig.Mounts.push(m)
                            seen[m.Target] = m.Source
                        }
                        
                    })
                    $this.mounts.forEach((m)=>{
                        if (!seen[m.Target]){
                            options.HostConfig.Mounts.push(m)
                            seen[m.Target] = m.Source
                        }
                    })
                    if ($this.config.gpu){
                        options.HostConfig.DeviceRequests = [
                            { 
                                "Driver": "",
                                "Count": -1,
                                "DeviceIDs": null, 
                                "Capabilities": [   
                                    [
                                        "gpu"
                                    ] 
                                ], 
                                "Options":  {} 
                            } 
                        ]
                    }
                    // store.logger.info("%o", $this.config)
                    store.logger.info("%o _____ ",options)
                    // logger.info(`starting the container ${options.name} `)
                    if ($this.config.dry){ 
                        resolve()  
                    } else {
                        Promise.all(promises).then((response)=>{
                        $this.status.stream.info.push(JSON.stringify(options, null, 4))
                        $this.status.success = false 
                        $this.status.error = false 
                        $this.status.complete = false 
                        store.docker.createContainer(options,  function (err, container) {
                            $this.container = container 
                            if (err ){
                                store.logger.error("%s %s %o","Error in creating the docker container for: ", options.name , err)
                                $this.status.running = false 
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
                                    $this.status.stream.info.push("%s", JSON.stringify(options, null, 4))
                                    $this.status.stream.info.push(`starting the container ${options.name} `)
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
                                            $this.status.running = false
                                            $this.status.complete = false
                                            reject(err)  
                                        }  
                                        if (!wait || $this.config.continuous){
                                            resolve( true )
                                        } else {                                               
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
                        })
                        }).catch((err)=>{ 
                            store.logger.error(err)
                            reject(err)
                        })
                    }
                } catch (err){
                    store.logger.error(err)
                    reject(err)
                }
            })().catch((err)=>{ 
                reject(err)  
            }) 
        });
	}
}