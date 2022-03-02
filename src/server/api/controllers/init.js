const { store }  = require("../../config/store/index.js")

var  logger  = store.logger
import path from "path"
const { Module } = require("../orchestrators/module.js")
const { Catalog } = require("../orchestrators/catalog.js")
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
	// let module_obj = new Module(
	// 	key,  
	// 	module
	// )
	// return module_obj
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
		let returned = await create_procedure(procedures_default)
		if (returned){
			returned.forEach((value)=>{
				store.procedures[value.name]= value
			})
		}

	} catch(err){
		logger.error("%s %o", "error in init procedures", err)  
		throw err 
	}  
}

export function create_service(key, service){
	try{    
		let procedures_default = store.config.procedures
				
	} catch(err){
		logger.error("%s %o", "error in init service", err)  
		throw err 
	}  
	let service_obj = define_service(key, service)
	service_obj.setOptions()
	return service_obj
}
export  function create_module(module, key){
	try{    
		let modl = new Module(module, module.name, key)
		
		modl.initProcedures()
		
		if (!store.catalog[module.name]){
			store.catalog[module.name] = new Catalog(module)
			Object.defineProperty(store.catalog[module.name], 'tags', {
				get: ()=>{
					let allTags = store.catalog[module.name].modules.map((d)=>{ 
						if (d.config && d.config.tags){
							return d.config.tags
						} else {
							return []
						}
					}) 
					let reducedAllTags = [].concat(...allTags);
					reducedAllTags = [... new Set(reducedAllTags)]
					return reducedAllTags

 
				}
			})
				 
 
			// })
		} 
		 
		return modl
	} catch(err){
		logger.error("%s %o", "error in init module", err)  
		throw err 
	}  
}
export async function create_procedure(procedures_default){
	try{    
		let promises = []
		for (const [key, procedure] of Object.entries(procedures_default) ) {
			promises.push(define_procedure(key, procedure)) 
		} 
		let settled = await Promise.allSettled(promises)
		let returned = []  
		settled.forEach((settle)=>{
			if (settle.status == 'fulfilled'){
				returned.push(settle.value)
			} 
		})
		return returned
		
	} catch(err){ 
		logger.error("%s %o", "error in init procedures", err)  
		throw err 
	}      
}    
export async function init_base_services(){      
		for (let [key, service] of store.config.services.entries()) { //Loop through all modules and their respective services. Many services can be a part of modules
			try{   
				console.log(key,"llll")  
			} catch(err){   
				logger.error("%o error in defining service %s", err, key)
			}
		}
		return 
}

export async function init_base_modules(){ 
	try{ 
		logger.info("Initiating status of modules and meta in fetch.........................") 
		for (let [key, module] of store.config.modules.entries()) { //Loop through all modules and their respective services. Many services can be a part of modules
            let staged_module = []	 
			let modl = create_module(module, key)
			
			store.catalog[module.name].modules.push(modl)
			
		}
		 
		return 
	} catch(err){
		logger.error("%s %o", "error in init modules", err)
		throw err
	}
}


