
const { store  } = require("../../config/store/index.js")
const { parseConfigVariables } = require("../../../shared/definitions.js")
const { getFolders, readFile, getFiles} = require("./IO.js")
import path from "path"
const YAML = require("yaml") 



async function import_cfgs(module, type){
    try{
        let promises_files = []
        let promises_folders = []
        let files_marked = []
        if (module.format == 'single' ){
            promises_files.push(readFile(module.path))
            files_marked.push(module.path)
        } else if (module.format == 'files') {
            promises_folders.push(getFiles(module.path))
        } else { 
            promises_folders.push(getFolders(module.path)) 
        }
        if (promises_folders.length > 0){    
            let results = await Promise.allSettled(promises_folders)
            results.forEach((result, i)=>{ 
                let inner_file_read = [] 
                result.value.forEach((dir)=>{
                    if  (module.format == 'dir'){
                        promises_files.push(readFile(path.join( dir.path,  module.filename )    )     )
                        files_marked.push(path.join( dir.path,  module.filename )    )
                    } else {
                        promises_files.push(readFile(dir )     )
                        files_marked.push(( dir  ))
                    }
                })
            })
        }
        let results = await Promise.allSettled(promises_files)
        let return_data = []
        results.forEach((result, i)=>{
            if (result.status == 'fulfilled'){
                let config = [];
                try{
                    config = parseConfigVariables(result.value, store.system)
                    // config = parseConfigVariables(result.value, module.type, files_marked[i])
                    // config.path = files_marked[i]
                } catch (err_2){ 
                    store.logger.error(`______Init YAML/JSON ERROR for ${result.value}___________`)
                    store.logger.error(err_2)
                    store.logger.error("_________________________")
                }                
                return_data.push(config)
            }
        })
        if (type !== 'docker'){
            return_data.forEach((data, i)=>{
                if (Array.isArray(data)  ){
                    data.forEach((d)=>{
                        d.path = files_marked[i]
                    })
                } else {
                    for (let [key, value] of Object.entries(data)){
                        value.path = files_marked[i]
                    }
                }
            })
        }
        return return_data
    } catch(err){ 
        console.error(err,"<<<")
        throw err
    }
}

export const  define_base = async function(){
    try{
       
        const { Module } = require("../orchestrators/module.js") 
        const { Procedure } = require("../orchestrators/procedure.js")
        const { Service } = require("../orchestrators/service.js")

        let default_config = null
        let subclient_config = null
        let custom = {
            services: [],
            modules: [],
            procedures: [],
        }

        let config = await import_cfgs(store.system.orchestrators.default, "docker")
        let subclient = await import_cfgs(store.system.orchestrators.subclient, "docker")
        store.system.dockerConfigs.subclient = subclient
        store.system.dockerConfigs.default = config

        console.log("Defining the base for modules and procedures of all types...")
        let dind = store.system.orchestrators.dind
        let procedure_config = dind.procedure
        let service_config = dind.service
        let module_config = dind.module
        let result_dind = await import_cfgs(module_config)
        if (result_dind){
            let key = Object.keys(result_dind[0])[0]
            let module_dind = result_dind[0]
            store.config.modules[key] = module_dind[key]
        }


        result_dind = await import_cfgs(service_config)
        if (result_dind){
            result_dind = result_dind[0]
            let keys = Object.keys(result_dind)
            keys.forEach((key)=>{ 
                let service_dind = result_dind[key]
                store.config.services[key] = service_dind
            })
        }
            
        result_dind = await import_cfgs(procedure_config)
        if (result_dind){
            result_dind.forEach((re)=>{
                for (let [key, procedure] of Object.entries(re)){
                    store.config.procedures[key] = procedure
                }
            })
        }
        let promises = []

        let defaults = store.system.default.items
        defaults.forEach((item)=>{ 
            promises.push(import_cfgs(item))
        })
        let results_default = await Promise.allSettled(promises)
        results_default.forEach((result)=>{
            if (result.status == 'fulfilled'){ 
                result.value.forEach((config)=>{
                    store.default = [ ...store.default, ...config ]
                })
            }
               
        })

        promises  = []
        let modules = store.system.modules
        modules.forEach((module)=>{ 
            custom.modules.push({
                custom: module.custom,
                path: module.path
            })
            promises.push(import_cfgs(module))
        })
        let results_data = await Promise.allSettled(promises)
        if (results_data){
            results_data.forEach((result, i)=>{
                if (result.status == 'fulfilled'){
                    result.value.forEach((config)=>{
                        try{ 
                            const key = Object.keys(config)[0]
                            config[key].custom = custom.modules[i].custom
                            store.config.modules[key] = config[key]
                        } catch(err){
                            store.logger.error(err)
                        }
                    })
                }
            })
        }

        promises  = []
        let services = store.system.services 
        services.forEach((service)=>{
            custom.services.push({
                custom: service.custom,
                path: service.path
            })
            promises.push(import_cfgs(service)) 
        })
        results_data = await Promise.allSettled(promises)
        if (results_data){
            results_data.forEach((result, i)=>{
                if (result.status == 'fulfilled'){
                    result.value.forEach((config)=>{
                        for(let [key2, entry] of Object.entries(config)){
                            try{
                                entry.custom = custom.services[i].custom
                                store.config.services[key2] = entry
                            } catch(err){
                                store.logger.error(err)
                            }
                        }
                    })
                }
                
            })
        }
        let procedures = store.system.procedures
        promises = []
        procedures.forEach((procedure)=>{ 
            custom.procedures.push({
                custom: procedure.custom,
                path: procedure.path
            })
            promises.push(import_cfgs(procedure))
        })
        results_data = await Promise.allSettled(promises)
        if (results_data){
            results_data.forEach((result, i)=>{
                if (result.status == 'fulfilled'){
                    result.value.forEach((config)=>{
                        for(let [key2, entry] of Object.entries(config)){
                            try{
                                entry.custom = custom.procedures[i].custom
                                store.config.procedures[key2] = entry
                            } catch(err){
                                store.logger.error(err)
                            }
                        }
                        // config.forEach((conf)=>{
                        //     conf.custom = custom.procedures[i]
                        // })
                        // store.config.procedures = [ ...store.config.procedures,  ...config]
                    })
                }
            }) 
        }
        return 
    } catch(err){
        console.error(err)
        store.logger.error(`${err}, error in defining  base environment of static and workflow modules`)
        throw err
    }
}