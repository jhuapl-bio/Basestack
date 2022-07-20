const { store }  = require("../../config/store/index.js")

var  logger  = store.logger
import path from "path"
const { Module } = require("../orchestrators/module.js")
const { Catalog } = require("../orchestrators/catalog.js")
const { Procedure } = require("../orchestrators/procedure.js")
const { Service } = require("../orchestrators/service.js") 
const { createNetworks, createVolumes } = require("./post-installation.js")
const Docker = require("dockerode")
const {  readFile } = require("./IO.js")  
 
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
		store.logger.info("Initiating dind networks and volumes....")    
		let responseNetworks = await createNetworks([
			'basestack-network'   
		]) 
		let responseVolumes = await createVolumes([  
			"basestack-docker-certs-ca", 
			"basestack-docker-certs-client" 
		])
		return   
	} catch (err){
		store.logger.error(`${err}, error in init procedure`)
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
export async function import_configurations(){
	try{
		let data = await readFile(store.system.configurationFile)
		data = JSON.parse(data)
		return data  
	} catch (err){
		store.logger.error("Could not import config file %o ", err) 
		throw err
	}
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
		// for (let [key, service] of store.config.services.entries()) { //Loop through all modules and their respective services. Many services can be a part of modules
		// 	try{   
		// 	} catch(err){   
		// 		logger.error("%o error in defining service %s", err, key)
		// 	}
		// }
		// return 
}

export async function init_base_modules(){ 
	try{ 
		store.logger.info("Initiating status of modules and meta in fetch.........................") 
		
		for (let [key, module] of store.config.modules.entries()) { //Loop through all modules and their respective services. Many services can be a part of modules
			store.library.addLocal(module, module.name)
		}

		  
		return 
	} catch(err){
		store.ogger.error("%s %o", "error in init modules", err)
		throw err  
	} 
}     
   
export async function init_modules(){    
	try{       
		store.logger.info("Initiating catalog modules .........................",">")
		for (let [key, module] of Object.entries(store.library.all)) { //Loop through all modules and their respective services. Many services can be a part of modules
			try{ 
				if (module.imported){
					// console.log(key,"<<<<<<<")
					let latest = store.library.all[key].latest
					let modl = store.library.create_module(latest)			
				}		 
			} catch(err){ 
				store.logger.error("%s error in creating module %s", err, key)
			} 
		}
		store.logger.info("Done initiating")
		return 
	} catch(err){
		logger.error("%s %o", "error in init modules", err)
		throw err
	}
}

