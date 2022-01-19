const { store }  = require("../../config/store/index.js")

var  logger  = store.logger
import path from "path"
const { Workflow, Module } = require("../orchestrators/module.js")
const { Procedure } = require("../orchestrators/procedure.js")
const { Service } = require("../orchestrators/service.js")
const { createNetworks, createVolumes } = require("./post-installation.js")
const Docker = require("dockerode")
const { getFolders, readFile } = require("./IO.js")
 
export async function docker_init(params){
	let config = null 
	const meta  = store.dockerConfig
	let dockerObj;
	if (params){
		config = meta
		dockerObj = new Docker(params); 
	} else {
		dockerObj = new Docker();
	}
	return dockerObj  
}  
 

export async function init_dind(){  
	try{  
		logger.info("Initiating dind networks and volumes....")    
		// let procedure_index = store.procedures.map((d)=>{
		// 	return d.name
		// }).indexOf("dind") 
		// if (procedure_index > -1){ 
		// 	let procedure = store.procedures[procedure_index] 
		// 	// procedure.defaultOptions = await procedure.setOptions() 
		// 	// procedure.options = procedure.defaultOptions
		// 	// let responseNetworks = await procedure.createNetworks([ 
		// 	// 	'basestack-network'   
		// 	// ])  
		// 	// let responseVolumes = await procedure.createVolumes([   
		// 	// 	"basestack-docker", 
		// 	// 	"basestack-docker-certs-ca",
		// 	// 	"basestack-docker-certs-client" 
		// 	// ])
		// 	// let responseStart = await procedure.init()
		// }

		// // let procedure = define_service(workflow, service)
		let responseNetworks = await createNetworks([
			'basestack-network'   
		]) 
		let responseVolumes = await createVolumes([  
			"basestack-docker",
			"basestack-docker2",
			"basestack-data",
			"basestack-docker-certs-ca", 
			"basestack-docker-certs-client" 
		])
		
		return   
	} catch (err){
		logger.error(`${err}, error in init procedure`)
		throw err
	} 
} 
 
export function define_service(name, service){  
	let service_obj = new Service( 
		name,
		service
	)
	return service_obj
}

export function define_module(key, module){
	let module_obj = new Module(
		key,  
		module
	)
	return module_obj
}
export async function define_procedure(name, procedure){
	return new Promise(function(resolve,reject){
		var  procedure_obj = new Procedure (
			name, 
			procedure 
		)
		procedure_obj.define().then(()=>{
			resolve(procedure_obj)
		}).catch((err)=>{
			reject(err)
		})
	})  
}
 
export async function init_base_procedures(){
	try{    
		let procedures_default = store.config.procedures
		let promises = []
		for (const [key, procedure] of Object.entries(procedures_default) ) {
			promises.push(define_procedure(key, procedure)) 
		}
		let settled = await Promise.allSettled(promises)  
		settled.forEach((settle)=>{
			if (settle.status == 'fulfilled'){
				store.procedures[settle.value.name]= settle.value
			} 
		})
		  
		 

 
	} catch(err){
		logger.error("%s %o", "error in init procedures", err)  
		throw err 
	}  
}
export async function init_base_services(){  
		for (const [key, service] of Object.entries(store.config.services) ) { //Loop through all modules and their respective services. Many services can be a part of modules
			try{ 
				let staged_service = []	   
				//Create workflow object using the name, command (docker, singularity, snakemake etc), services, and dependencies including building params
				let staged_workflow = []  
				let service_obj = define_service(key, service)
				service_obj.setOptions()
				store.services[key] = service_obj
			} catch(err){
				logger.error("%o error in defining service %s", err, key)
			}
		}
		return 
}

export async function init_base_modules(){ 
	try{
		logger.info("Initiating status of modules and meta in fetch...") 

		for (const [key, module] of Object.entries(store.config.modules) ) { //Loop through all modules and their respective services. Many services can be a part of modules
			if (module.module || key =='dind'){
                let staged_module = []	   
				//Create workflow object using the name, command (docker, singularity, snakemake etc), services, and dependencies including building params
				let staged_workflow = []  
				store.modules[key] = define_module(key, module)
			} 
		}
		return 
	} catch(err){
		logger.error("%s %o", "error in init modules", err)
		throw err
	}
}


