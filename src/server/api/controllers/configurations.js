
const { store, parseConfigVariables  } = require("../../config/store/index.js")

const { getFolders, readFile } = require("./IO.js")
import path from "path"
const YAML = require("yaml") 

async function define_workflows(module){
    let promises_files = []
    let promises_folders = []
    if (module.format == 'single' ){
        promises_files.push(readFile(module.path))
    } else {
        promises_folders.push(getFolders(module.path)) 
    }
    if (promises_folders.length > 0){   
        let results = await Promise.allSettled(promises_folders)
        results.forEach((result)=>{ 
            let inner_file_read = [] 
            
            result.value.forEach((dir)=>{
                promises_files.push(readFile(path.join( dir.path,  "index.yml"  )    )     )
            })
            // promises_files .push(inner_file_read)
        })
    }
    let results = await Promise.allSettled(promises_files)
    let return_data = []
    results.forEach((result, i)=>{
        if (result.status == 'fulfilled'){
            let config = [];
            // let module = modules[i]
            // if (module.type == 'yml'){
            try{
                config = parseConfigVariables(result.value)
                // config = YAML.parse(result.value)
            } catch (err_2){
                store.logger.error(`______Init YAML ERROR for ${result.value}___________`)
                store.logger.error(err_2)
                store.logger.error("_________________________")
            }
            // } 
            // else {
            //     config = JSON.parse(result.value)
            // }  
            return_data.push(config)
        }
    })
    return return_data
}

export const  define_base = async function(){
    try{
        // console.log(store.system) 

        // let dirs = await getFolders(store.system.modules)
        
        // console.log(store)
        const { Workflow } = require("./workflow.js") 

        let dind = store.system.orchestrators.dind
        let result_dind = await define_workflows(dind)
        store.system.orchestrators.dind.workflow = new Workflow(
            result_dind.name, 
            result_dind[0][0].workflows[0].dependencies, 
            result_dind[0][0].workflows[0].services,
            path.join(store.system.modules.path,  "dind")    
        )
        // store.system.orchestrators.dind.workflow = result_dind[0][0].workflows[0]
        let promises = []

        let defaults = store.system.default.items
        defaults.forEach((item)=>{ 
            promises.push(define_workflows(item))
        })
        let results_default = await Promise.allSettled(promises)
        results_default.forEach((result)=>{
            result.value.forEach((config)=>{
                store.default = [ ...store.default, ...config ]
            })
               
        })


        promises  = []
        let modules = store.system.modules.items
        modules.forEach((module)=>{ 
            promises.push(define_workflows(module))
        })
        let results_data = await Promise.allSettled(promises)
        results_data.forEach((result)=>{
            result.value.forEach((config)=>{
                store.modules = [ ...store.modules, ...config ]
            })
               
        })
       
        return 
    } catch(err){
        console.error(err)
        store.logger.error(`${err}, error in defining  base environment of static and workflow modules`)
        throw err
    }
}