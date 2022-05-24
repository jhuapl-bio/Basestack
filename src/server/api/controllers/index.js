
const { store }  = require("../../config/store/index.js")
var  logger  = store.logger      
const { init_dind,  import_configurations } = require("./init.js")
const {   writeJSON } = require("./IO.js") 
        
   
const { docker_init } = require("./init.js")   
const lodash = require("lodash")   
let { Library } = require("../orchestrators/library.js")

       
 
export async function init(moduleLocation){     
	store.ready = true   
	
	// Initiating the Docker Class     
	try{
		let data = await import_configurations()
		store.configurations = data
	} catch(err){
		store.logger.error("%o, -------------------- ----error in import configurations", err)
	}
	let library = new Library()
	store.library = library 
	
	
	 
	store.docker = await docker_init( (store.configurations.socketPath ? {socketPath: store.configurations.socketPath } : null ) );  
	// //Initiating the Status Class of Modules 
	let response_orchestrator = await init_dind() 
	store.logger.info("Getting modules to import")
	await store.library.importModules() 
	// store.library.getRemotes(moduleLocation).catch((err)=>{
	// 	store.logger.error("%o error in fetching remote modules initially", err)
	// 	store.library.init_modules().catch((err)=>{
	// 		store.logger.error("%o error in init modules")
	// 	})
	// }).then(()=>{
	// 	store.library.init_modules().catch((err)=>{
	// 		store.logger.error("%o error in init modules")
	// 	})
	// })
	try{ 
		store.logger.info("Getting modules from remote site")
		await store.library.getRemotes(moduleLocation)
	} catch(err){
		store.logger.error("%o error in fetching remote modules initially", err)
	} finally {
		store.logger.info("Done getting remote configs, init modules (latest)")
		await store.library.init_modules()
		store.logger.info("Done initializing the server")
	}
	// return 
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
