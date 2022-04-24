
// import Docker from 'dockerode'; 
import path  from "path"
const { store }  = require("../../config/store/index.js")
var  logger  = store.logger      
const { checkFileExist, reformatResponseVideo }  = require("./validate.js")
const { init_base_modules, init_dind, init_base_procedures, import_configurations, init_base_services } = require("./init.js")
const {  writeFile, ammendJSON, readFile, get, set, writeJSON } = require("./IO.js") 
            
     
const {  listImages, fetch_external_config, set_stored } = require("./fetch.js") 
     
   
const { docker_init } = require("./init.js")   
const lodash = require("lodash")   

     
 
export async function init(){     
	store.ready = true  
	// Initiating the Docker Class     
	try{
		let data = await import_configurations()
		store.configurations = data
	} catch(err){
		store.logger.error("%o, ------------------------error in import configurations", err)
	}
	store.docker = await docker_init( (store.configurations.socketPath ? {socketPath: store.configurations.socketPath } : null ) );  
	// //Initiating the Status Class of Modules 
	let response_orchestrator = await init_dind()
	 
	let response_init = await init_base_modules()
	fetch_external_config('modules').then((modules)=>{ 
		if (module){
			set_stored(module.name, modules)
		} else {
			store.logger.info("No modules found at remote location")
		}  
	}).catch((err)=>{
		store.logger.error("Could not get modules externally, check connections %o", err)
	})
	console.log("finished initializing")
}

export async function updateDockerSocket(socket){
	try{
		if (socket == ''){
			socket = null
		}
		if (socket){
			store.docker  = await docker_init({socketPath: socket})
		} else {
			store.docker  = await docker_init()
		}
		store.configurations.socketPath = socket
		await writeJSON(store.system.configurationFile, store.configurations)
		return 
	} catch(err){
		logger.error(err)
		throw err 
	} 
}
