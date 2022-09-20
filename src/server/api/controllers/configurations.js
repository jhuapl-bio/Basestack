
const { store  } = require("../../config/store/index.js")
const { parseConfigVariables } = require("../../../shared/definitions.js")
const { set_stored } = require("./fetch.js")
const { Job } = require("../orchestrators/job")
const { getFolders, readFile, getFiles} = require("./IO.js") 
import path from "path" 
const YAML = require("js-yaml")    
 
export function bytesToSize(bytes) {
   var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
   if (bytes == 0) return '0 Byte';         
   var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}  

export async function create_job(config, params, services, procedure){
    let job = new Job(procedure,config)   
    if (!services){   
          
        services = config.services.map ((d,i)=>{ 
            return i  
        })                   
    }  
    
    await job.defineServices(services, params) 
    if (params){       
        job.setParams(params)      
    }    
    return job   
}           

   
export async function import_cfgs(module, type){ 
    try{   
        let promises_files = [] 
        let promises_folders = []   
        let files_marked = []   
        if (module.format == 'single' ){   
            promises_files.push(readFile(module.path)) 
            files_marked.push(module.path)
        } else if (module.format ==  'files') {  
            promises_folders.push(getFiles(module.path))  
        } else {   
            promises_folders.push(getFolders(module.path))   
        }    
        if (promises_folders.length > 0 ){
            let results = await Promise.allSettled(promises_folders)
            results.filter((F)=>{
                return F.status == 'fulfilled'
            }).forEach((result, i)=>{ 
                let inner_file_read = []    
                
                result.value.forEach((dir)=>{  
                    try{  
                        if  (module.format == 'dir'){ 
                            promises_files.push(readFile(path.join( dir.path,  module.filename )    )     )
                            files_marked.push(path.join( dir.path,  module.filename )    )
                        } else {  
                            promises_files.push(readFile( dir )     )
                            
                            files_marked.push(( dir  ))
                        }
                    } catch(err){
                        console.error(err) 
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
                    if(config){
                        return_data.push(config)
                    }
                } catch (err_2){ 
                    store.logger.error(`______Init YAML/JSON ERROR for ${result.value}___________`)
                    store.logger.error(err_2)
                    
                    store.logger.error("_________________________")
                }   
                 
            }
        })
        if (type !== 'docker'){
            return_data.forEach((data, i)=>{
                if (Array.isArray(data)  ){
                    data.forEach((d)=>{
                        d.path = files_marked[i]
                    })
                } else if (typeof data == 'object') {
                    data.path = files_marked[i]
                    
                }
            })
        }
        return return_data
    } catch(err){ 
        store.logger.error("%o could not import configurations", err )
        throw err
    }
}


export const  define_base = async function(){
    try{
       
        let default_config = null
        let subclient_config = null
        let custom = {
            services: [],
            modules: [],
            procedures: [],
            imported: []
        }
        
 
        let config = await import_cfgs(store.system.orchestrators.default, "docker")
        let subclient = await import_cfgs(store.system.orchestrators.subclient, "docker")
        store.system.dockerConfigs.subclient = subclient
        store.system.dockerConfigs.default = config

        let dind = store.system.orchestrators.dind
        let promises = []
        let results_default

        let defaults = store.system.default.items
        defaults.forEach((item)=>{ 
            promises.push(import_cfgs(item))
        })
        results_default = await Promise.allSettled(promises)
        results_default.forEach((result)=>{
            if (result.status == 'fulfilled'){ 
                result.value.forEach((config)=>{
                    config.forEach((conf)=>{
                        let idx = store.default.findIndex((f)=>{
                            return f.name == config.name
                        }) 
                        if (idx == -1){
                            // store.logger.info("%s idx %s",conf,idx)
                            store.default.push(conf)
                        } else {
                            // store.logger.info("%s idx %s",conf,idx)
                            store.default[idx] = conf
                        }
                    })
                    
                })
            }
               
        })
       
        return 
    } catch(err){
        console.error(err)
        store.logger.error(`${err}, error in defining  base environment of static and workflow modules`)
        throw err
    }
}