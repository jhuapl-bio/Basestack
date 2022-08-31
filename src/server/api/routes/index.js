/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */ 
var express = require('express');
var router = express.Router();
const YAML = require("js-yaml")         
var { store } = require("../../config/store/index.js")
var { error_alert } = require("../controllers/logger.js")
const logger = store.logger

import { cacheParams }  from "../controllers/cache.js" ;
import {  mapCacheVariables } from "../controllers/mapper.js";
import nestedProperty from "nested-property"
import { fs } from "file-system";
const path = require("path")
const { create_job } = require("../controllers/configurations.js")
let dateFormat = require("date-format") // Used for logging purposes
// Import cusotm modules and functions
const { 
	prune_images,  
	 } = require("../controllers/post-installation.js")
const { 

	fetch_status,
	getMeta,
	fetch_external_dockers,
	fetch_docker_stats,
	save_remote_module
	} = require("../controllers/fetch.js")
const cloneDeep = require("lodash.clonedeep");

const { 
	readFile, 
	writeFile,
	getFiles,
	removeFile,
} = require("../controllers/IO.js")
const crypto  = require("crypto")

const { 
	 updateDockerSocket,
 } = require('../controllers/index')

//Used
router.get("/server/ping", (req,res,next)=>{ // Used
	try {
		res.status(200).send({status: 200, message: `Server is running at port: ${process.env.PORT_SERVER}` });
	} catch(err){
		logger.error(`Error in server status ping ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})
// //Used
// router.post("/server/close", (req,res,next)=>{ // Used
// 	try {
// 		store.server.close().then((f)=>{
// 			res.status(200).send({status: 200, message: `Server is closed at port: ${process.env.PORT_SERVER}` });
// 		}).catch((err)=>{
// 			res.status(419).send({status: 419, message: error_alert(err) });
// 		})
// 	} catch(err){
// 		logger.error(`Error in server status ping ${err}`)
// 		res.status(419).send({status: 419, message: error_alert(err) });
// 	} 
// })
// //Used
// router.post("/server/start", (req,res,next)=>{ // Used  
// 	try {    
// 		store.server.initiate_server().then((f)=>{  
// 			res.status(200).send({status: 200, message: `Server is now running at port: ${process.env.PORT_SERVER}` });
// 		}).catch((err)=>{   
// 			res.status(419).send({status: 419, message: error_alert(err) });  
// 		})    
// 	} catch(err){ 
// 		logger.error(`Error in server status ping ${err}`)
// 		res.status(419).send({status: 419, message: error_alert(err) });
// 	} 
// })
 
//Used 

// Get the state of the docker instance, if it is running, df, etc
router.get("/docker/status/get", (req,res,next)=>{
	try {
		fetch_docker_stats().then((response)=>{ // Run the dockerode api to get the basic status of docker
			res.status(200).json({status: 200, data: response, message: "Docker is running" });
		}).catch((Err)=>{
			res.status(419).send({status: 419, message: error_alert(Err) });
		})
	} catch(err){
		logger.error(`Error in docker status fetch ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})
//Used

// Figure out the system logs, read directly from logfile (max MB size), and send back thru api call
router.get("/log/system", (req,res,next)=>{
	try {
		(async function(){
			let log = await readFile(store.system.logs.info, true) // based on the meta.yml: logs.info params 
			res.status(200).json({status: 200, message: "Got system log", data: log});
		})().catch((err)=>{
			store.logger.error(err)
			res.status(419).send({status: 419, message: `There was an error ${err}`});
		})
	} catch(err){
		res.status(419).send({status: 419, message: error_alert(err) });
	}	
})

//Used
// Get all of the docker hub tag versions for an image
router.post("/tags/fetch", (req,res,next)=>{ 
	(async function(){
		try {
			fetch_external_dockers(req.body.name).then((response)=>{ // Call the v2 Docker api
				res.status(200).json({status: 200, message: "Returning compelted fetch", data: response });
				}).catch((err1)=>{
					logger.error(err1)
					res.status(419).send({status: 419, message: "There was an error in fetch tags. Check Logs"});
				})			
		} catch(err3){
			logger.error(err3)
			res.status(419).send({status: 419, message: error_alert(err3) });
		}	
	})().catch((err2)=>{console.error(err2)})
})

//Used
// change the socket to connect to (for docker purposes)
router.post("/docker/socket", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await updateDockerSocket(req.body.socket) // Update socket, only used for Linux really
			res.status(200).json({status: 200, message: "Updated Docker Socket!", data: null });
		} catch(err2){     
			logger.error("%s %s", "Error in changing docker socket", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	  
	})() 
})
//Used
router.post("/files/get", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){ 
		try {
			let files = await getFiles(req.body.dir) // Update socket, only used for Linux really
			res.status(200).json({status: 200, message: "got files!", data: files });
		} catch(err2){
			logger.error("%s %s", "Error in getting files from the specified dir %s", err2, req.body.dir)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
})

//Used
// Get the status of the server 
router.get("/status/fetch", (req,res,next)=>{ 
	(async function(){
		try {
			fetch_status().then((response)=>{
				res.status(200).json({status: 200, message: "Returning status", data: response });
				}).catch((err1)=>{
					logger.error(err1)
					res.status(419).send({status: 419, message: "There was an error in fetch status. Check Logs"});
				})			
		} catch(err3){
			logger.error(err3)
			res.status(419).send({status: 419, message: error_alert(err3) });
		}	
	})().catch((err2)=>{console.error(err2)})
})
//Used
router.get("/server/status/fetch", (req,res,next)=>{
	try {
		getMeta().then((response)=>{
			// logger.info(`getting  server run status... ${response}`)
			res.status(200).json({status: 200, data: response, message: "Server is running" });
		}).catch((err)=>{
			logger.error(`Error in server status fetch ${err}`)
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err){
		logger.error(`Error in server status fetch ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})


//USed
router.get("/defaults/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		res.status(200).json({status: 200, message: "retrieved module information", data: store.default    });
	} catch(err2){  
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})       
  
//Used
// Remove a catalog from being runnable on teh system, mainly used to conserve resources
router.post("/catalog/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){  
		try {  
			let response;
			// Removes the catalog from the library altogether, including the files on the fs if imported
			store.library.removeModule(req.body.catalog, req.body.index, req.body.dependencies).then((f)=>{
			})
			logger.info("%o removing module complete", response)
			res.status(200).json({status: 200, message: `Completed module removal: ${req.body.catalog}`, data: response });
		} catch(err2){ 
			logger.error("%s %s", "Error in removing module, try to remove from %s manually", err2, store.system.modules.importPath[0])
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})().catch((err2)=>{ 
		logger.error("%s %s", "Error in removing module %s", err2, store.system.modules.importPath[0])
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})
// used
router.get("/procedure/export/config/:catalog/:module/:procedure/", (req,res,next)=>{ // build workflow according to name and index
	try {
		let token = req.params.token
		if (!req.params.token){
			token = "development"
		}
		let config = nestedProperty.get(store, `jobs.catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`)
		if (config && config.mergedConfig){
			console.log("found running config")
			res.status(200).json({status: 200, message: "config", data: config.mergedConfig  });
		} else  {
			console.log("no running config available, getting base procedure config")
			config = nestedProperty.get(store, `catalog.${req.params.catalog}.modules.${req.params.module}.procedures.${req.params.procedure}`)
			if (!config){
				res.status(419).send({status: 419, message: error_alert(new Error("No Config available"))});
			} else {
				res.status(200).json({status: 200, message: "config", data: config.baseConfig  });
			}
		}
		
	} catch (err2){
		res.status(419).send({status: 419, message: error_alert(err2)});
	}
})
//USED
router.post("/procedure/save/config", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let token = req.params.token
			if (!req.body.token){
				token = "development"
			}
			let config = nestedProperty.set(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
			if (config){
				res.status(200).json({status: 200, message: "config", data: 'config'  });
			} else {
				let procedure = nestedProperty.get(store, `catalog.${req.body.catalog}.modules.${req.body.module}.procedures.${req.body.procedure}`)
				let services = procedure.services.map((d,i)=>{
					return i
				}) 
				let job = await create_job(procedure.config, req.body, services, procedure)
				if (!job.mergedConfig){
					res.status(419).send({status: 419, message: error_alert(new Error("No Config available"))});
				} else {
					res.status(200).json({status: 200, message: "config", data: job.mergedConfig  });
				}
			}
			
		} catch (err2){
			res.status(419).send({status: 419, message: error_alert(err2)});
		}
	})().catch((err2)=>{
		res.status(419).send({status: 419, message: error_alert(err2)});
	})

})
//Used
router.get("/catalog/all/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.library.catalog
		let data = [] 
		let seen = {}
		for (let [name, value] of Object.entries(cloneDeep(catalog))){
			delete value['interval'] 
			seen[name] = 1
			let { modules, ...returnable } = value;
			if (store.remotes[name]){
				returnable.remotes = store.remotes[name].map((d,i)=>{
					d.idx = i
					return d
				})
			} else {
				returnable.remotes = []
			}
			let module_config = value.modules.map((d)=>{
				return {
					status: d.status,
					...d.config
				}
			})
			returnable.modules = module_config
			data.push(returnable)
		}
		for (let [name, value] of Object.entries(cloneDeep(store.remotes))){
			if (!seen[name]){
				seen[name] = 1
				let returnable = cloneDeep(value[0])
				returnable.remotes = cloneDeep(value)
				returnable.modules=[]
				data.push(returnable)
			}
		}
 

		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading catalog/all/get module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
//Used
router.get("/library/get/:catalog", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.library.catalog
		let data = [] 
		for (let [name, value] of Object.entries(cloneDeep(catalog))){
			if (value.status.installed){
				delete value['interval']
				let { modules, ...returnable } = value;
				data.push(returnable)
			}
		}
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in library/get/:catalog loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
//Used
router.get("/library/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.library.catalog
		let data = [] 
		for (let [name, value] of Object.entries(cloneDeep(catalog))){
			if (value.status.installed){
				delete value['interval']
				let { modules, ...returnable } = value;
				data.push(returnable)
			}
		}
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading library/get module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})


//Used
router.get("/modules/imported/all", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data =  store.library.getSortedImported()
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){ 
		logger.error("%s %s", "Error in loading /modules/imported/all module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	 
})

//Used
router.get("/library/imported/:catalog", (req,res,next)=>{ // build workflow according to name and index
	try {
		
		let catalog =  store.library.all[req.params.catalog]
		res.status(200).json({status: 200, message: "retrieved module information", data: catalog });
	} catch(err2){
		logger.error("%s %s", "Error in loading modules/imported/:catalog module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})


//Used
router.get("/catalog/get/:catalog", (req,res,next)=>{ // build workflow according to name and index
	try {
		let module = cloneDeep(store.library.catalog[req.params.catalog])		
		let data = {}
		let { procedures, ...config } = module.config
		procedures = module.procedures.map((d, i)=>{
			d.config.idx = i
			if(d.services){
				d.services = d.services.map((f,y)=>{
					f.idx = y
					return f
				})
			}
			return d.config
		})
		let able = {
			...config,
			status: module.status,
			procedures:procedures
		}
		try{ 
			let procedures_config = module.procedures.map((d)=>{
				return d.config
			})
			data= able
		} catch (err){ 
			store.logger.error("Could not get module build loaded for... %o %o", data, err)
		}
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading catalog/get/:catalog module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
//Used 
router.get("/catalog/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = cloneDeep(store.library.catalog)		
		let data = []   
		for(let [key, module] of Object.entries(catalog)){
			let { procedures, ...config } = module.config
			procedures = module.procedures.map((d, i)=>{
				d.config.idx = i
				if(d.services){
					d.services = d.services.map((f,y)=>{
						f.idx = y
						return f 
					})
				}
				return d.config
			})
			let able = {
				...config,
				status: module.status,
				procedures:procedures
			}
			try{ 
				let procedures_config = module.procedures.map((d)=>{
					return d.config
				})
				data.push(able)
			} catch (err){ 
				store.logger.error("Could not get module build loaded for... %o %o", data, err)
			}
		}
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading catalog/get module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})



//Used
router.get("/procedures/get/:catalog/:token", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures = store.library.catalog[req.params.catalog].procedures
		let data = []  
		let token = req.params.token
		if (!req.params.token){
			token = 'development'
		}
		
		
		procedures.forEach((procedure,i)=>{
			let { procedures, ...config } = procedure.config
			let returnable =  {
				status: procedure.status,
				dependencies: [],
				services: [], 
				...config
			}
			let dependencies = procedure.dependencies.map((d,i)=>{
				let { streamObj, ...ret } = d
				if (d.type == 'docker'){
					if (store.images[d.target.split(":")[0] ]){
						ret.tags = store.images[d.target.split(":")[0] ].all_tags
					} else {
						ret.tags = []
					}
				}
				return ret  
			})
			returnable.dependencies = dependencies
			returnable.services = []
			try{
				procedure.services.forEach((service,i)=>{
					returnable.services.push({
						name: service.config.name,
						command: service.config.command, 
						label: service.config.label,
						idx: i,
						variables: service.config.variables
					})
				}) 
				let tokenVals = store.server.cache.get(token)  
				let cached_variables = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${i}`)
				returnable.cached_variables = cached_variables
				data.push(returnable)
			} 
			
			catch (err){
				store.logger.error("Could not get procedure build loaded for... %o %o", data, err)
			}
		})
		
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){ 
		logger.error("%s %s", "Error in gettnig procedure status from library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	 
})
//Used
router.get("/procedure/get/:catalog/:procedure/:token", (req,res,next)=>{ // build workflow according to name and index
	try { 
		let procedure = store.library.catalog[req.params.catalog].procedures[req.params.procedure]
		let data = []   
		let token = req.params.token
		if (!req.params.token){ 
			token = 'development'
		}
		let config = procedure.config
		let returnable =  {
			status: procedure.status,
			dependencies: [],
			services: [], 
			...config
		}
		let dependencies = procedure.dependencies.map((d,i)=>{
			let { streamObj, ...ret } = d
			if (d.type == 'docker'){
				if (store.images[d.target.split(":")[0] ]){
					ret.tags = store.images[d.target.split(":")[0] ].all_tags
				} else {
					ret.tags = []
				}
			}
			return ret  
		})
		returnable.dependencies = dependencies
		returnable.services = []
		returnable.spaceUsedTotal = procedure.spaceUsedTotal
		try{
			procedure.services.forEach((service,i)=>{
				returnable.services.push({
					name: service.config.name,
					command: service.config.command, 
					label: service.config.label,
					idx: i,
					variables: service.config.variables
				})
			})
			let tokenVals = store.server.cache.get(token)  
			let cached_variables = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.procedure}`)
			returnable.cached_variables = cached_variables
			
		} 

		catch (err){
			store.logger.error("Could not get procedure build loaded for... %o %o", data, err)
		} 
		res.status(200).json({status: 200, message: "retrieved module information", data: returnable });
	} catch(err2){ 
		logger.error("%s %s", "Error in getting procedure status from library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	 
})
//Used
router.get("/service/get/:catalog/:module/:procedure/:service/:token", (req,res,next)=>{ // build workflow according to name and index
	try {
		let service = store.library.catalog[req.params.catalog].modules[req.params.module].procedures[req.params.procedure].services[req.params.service]
		let data = service.config
		if (req.params.token && data.variables){
			let tokenVals = store.server.cache.get(req.params.token)  
			let val = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}.${req.params.service}`)
			if (val && typeof val == 'object'){
				for(let [key , value] of Object.entries(val)){
					if (value.source){
						data.variables[key].source = value.source
					}  
					if (value.option || value.option == 0){
						data.variables[key].option = value.option
					}
					data.variables[key].cached = true
					
					
				}
			}
			data.variables = mapCacheVariables(data.variables, req.params.service, 'development')
		}
		data.status  = service.status 
		
		res.status(200).json({status: 200, message: "retrieved procedure specifics information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting procedure status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
//Used
router.get("/status/get/service/:catalog/:module/:procedure/:service/:token", (req,res,next)=>{ // build workflow according to name and index
	try { 
		(async ()=>{
			let service = store.library.catalog[req.params.catalog].modules[req.params.module].procedures[req.params.procedure].services[req.params.service]
			let token  = req.params.token
			if (!req.params.token){
				token = "development"
			}
			// let tokenVals = store.server.cache.get(req.params.token)  
			// let val = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}.${req.params.service}`)
			// let watches  = await service.getProgress((val ? val : service.config.variables), service.config.output)
			let data = { 
				stream: service.status.stream.info,
				status: service.status,
				watches: []
			}
			res.status(200).json({status: 200, message: "retrieved service status specifics information", data: data });
		})().catch((err2)=>{
			logger.error("%s %s", "Error in getting procedure status(es)", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});

		})
	} catch(err2){
		logger.error("%s %s", "Error in getting procedure status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})



//Used
router.post("/module/save/file", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let filepath = req.body.source
			let filename = path.basename(req.body.source)
			let st = await readFile(filepath)
			let parsed = YAML.load(st)
			if (Array.isArray(parsed)){
				
				let promises = []
				parsed.forEach((module)=>{
					// let index = store.config.modules.findIndex(data => data == module)
					module.custom = true
					if (!module.version){
						let d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); // just the time
						module.version = 0
					}
					let basename = module.name + "_"+ module.version
					let endpath = path.join(store.system.shared.modules, basename+".yml")
					module.path = endpath
					let modl = store.library.create_module(module)
					store.config.modules.push(module)
					store.library.catalog[module.name].modules.push(modl)
					let response = YAML.dump([module])
					// promises.push(writeFile(endpath, response))
				})
				await Promise.all(promises)
			} else {
				parsed.custom = true
				if (!parsed.version){
					let d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); 
					parsed.version = 0
				}
				let basename = parsed.name + "_"+ parsed.version
				let endpath = path.join(store.system.shared.modules, basename+".yml")
				parsed.path = endpath
				let modl = store.library.create_module(parsed)
				store.config.modules.push(parsed)
				store.library.catalog[module.name].modules.push(modl)
				let response = YAML.dump([parsed])
				// await writeFile(endpath, response)
			}
			logger.info("Module(s) copied %s", req.body.source)
			res.status(200).json({status: 200, message: `Completed module copy`, data: '' });
		} catch(err2){
			logger.error("%s %s", "Error in copying module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
}) 
//Used
router.post("/module/save/text", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let parsed;
			let type = req.body.type
			let source = req.body.source
			if (type == 'YAML'){
				parsed = YAML.load(source)
			} else if (type == 'JSON'){ 
				parsed = JSON.parse(source)
			} else {
				parsed = source
			} 
			if (Array.isArray(parsed)){
				
				let promises = []
				parsed.forEach((module)=>{
					module.custom = true
					if (!module.version){
						let d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); // just the time
						module.version = 0
					}
					let modl = store.library.create_module(module)
					let basename = module.name + "_"+ module.version
					let endpath = path.join(store.system.shared.modules, basename+".yml")
					module.path = endpath
					store.config.modules.push(module)
					store.library.catalog[module.name].modules.push(modl)
					let response = YAML.dump([module]) 
					promises.push(writeFile(endpath, response))
				}) 
				await Promise.all(promises) 
			} else {
				parsed.custom = true
				
				if (!parsed.version){
					let d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); // just the time
					parsed.version = 'custom-'+d
				}
				let basename = parsed.name + "_"+ parsed.version
				let endpath = path.join(store.system.shared.modules, basename+".yml")
				parsed.path = endpath
				let modl = store.library.create_module(parsed)
				store.config.modules.push(parsed)    
				store.library.catalog[module.name].modules.push(modl)
				let response = YAML.dump([parsed])
				await writeFile(endpath, response)
			}
			
			logger.info("%s \n module copied", req.body.type)
			res.status(200).json({status: 200, message: `Completed run save text to YAML`, data: '' });
		} catch(err2){ 
			logger.error("%s %s", "Error in copying module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
})
// USED
router.post("/module/create", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let library = store.library.imported
			let data = library[req.body.catalog]
			let index = req.body.index
			let module = data.choices[index]
			let found= nestedProperty.get(store.library.catalog, req.body.catalog)
			
			try{ 
				if (found){
					found.cleanup()  
					delete store.library.catalog[req.body.catalog]
				} 
			} catch (err){
				store.logger.error("err in cleaning up already loaded catalog: %s", err)
			} 
			let modl = store.library.create_module(module)
			store.library.catalog[module.name] = modl
			logger.info("Module(s) copied %s", req.body.source)
			res.status(200).json({status: 200, message: `Completed module copy`, data: '' });
		} catch(err2){
			logger.error("%s %s", "Error in creating/staging module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in staging/creating module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
}) 

// USED
router.post("/module/import", (req,res,next)=>{ // build workflow according to name and index
	(async function(){  
		try {    
			let library = store.library.all 
			let data = library[req.body.catalog].choices
			let index = req.body.index  
			let module = data[index]   
			let d="new" 
			if (!module.version){
				d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); // just the time
				module.version = 0
			}
			let basename = module.name + "_"+ module.version + (d.remote ? "_remote" : "_default")
			let endpath = path.join(store.system.modules.importPath[0].path, basename+".yml")
			module.path = endpath 
			await writeFile( endpath, YAML.dump(module))  
			let found= nestedProperty.get(store.library.catalog, module.name)
			try{  
				if (found){
					found.cleanup()   
					delete store.library.catalog[req.body.catalog]
				}   
			} catch (err){   
				store.logger.error("err in cleaning up already loaded catalog: %s", err)
			}   
			let modl = store.library.create_module(module) 
			store.library.catalog[module.name] = modl	 
			store.library.addImported(module, module.name,true)
			res.status(200).json({status: 200, message: `Completed module copy`, data: '' });
		} catch(err2){ 
			logger.error("%s %s", "Error in importing module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})().catch((err2)=>{
		logger.error("%s %s", "Error in importing module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
}) 



//Used
router.post("/session/cache/service/variable", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			
			cacheParams(req.body.token, req.body)
			let response = store.server.cache.get(req.body.token)
			let tokenVals = store.server.cache.get(req.body.token)  
			let variables = nestedProperty.get(tokenVals, `catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}.${req.body.service}`)
			console.log("cached", variables)
			res.status(200).json({status: 200, message: "Completed caching of service variables", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in caching variables", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})() 
}) 

//Used
router.post("/service/stop", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let procedure = req.body.procedure
			let module = req.body.module
			let catalog = req.body.catalog
			let service= req.body.service
			let response;
			let token = req.body.token
			let params = req.body
			service = store.library.catalog[catalog].modules[module].procedures[procedure].services[service]
			response = await service.stop()
			logger.info("%o stopping service ", response)
			res.status(200).json({status: 200, message: `Completed stopped of service: ${service.name}`, data: response });
		} catch(err2){ 
			logger.error("%s %s", "Error in stopping service", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})().catch((err2)=>{
		logger.error("%s %s", "Error in stopping service", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
}) 


//Used
router.post("/remote/save/modules", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let remote_module = store.remotes[req.body.catalog][(req.body.module ? req.body.module : 0 )]
			let savePath = remote_module.path
			if (!savePath){
				let basename = `${remote_module.name}_${remote_module.version}.yml`

				savePath = path.join(store.system.remotes.modules, basename) 
			} 

			await writeFile(savePath, YAML.dump([remote_module]))
			let data = []
			logger.info("%s cache %o", req.body.catalog, data.length)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})()
})

//Used
router.post("/remote/set/modules", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let remote_module = store.remotes[req.body.catalog][(req.body.module ? req.body.module : 0 )]
			save_remote_module(remote_module)
			let data = []
			logger.info("%s cache %o", req.body.catalog, data.length)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

//Used
router.get("/remote/get/:target/:catalog", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try { 
			let library = store.library
			let data = await library.getRemotes(req.params.target, req.params.catalog)
			logger.info("%s get remotes ", req.params.target)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})()  
}) 
router.get("/library/versions/get/latests", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let library = store.library.all
			let latest = {}
			for (let [key,value] of Object.entries(library)){
				latest[key] = value.latest
			}
			res.status(200).json({status: 200, message: `${req.params.target}, received latests`, data: latest });
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.catalog)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})()
}) 
router.get("/library/versions/get/all", (req,res,next)=>{ // build workflow according to name and index
	(async function(){  
		try {   
			let library = store.library.all
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: library });
		} catch(err2){  
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.catalog)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	  
	})()  
})
router.get("/library/versions/get/:catalog", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let library = store.library
			let data = library.all[req.params.catalog].choices
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.catalog)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})()
})



//Used
router.post("/procedure/build", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.build( req.body.skip, null)
			logger.info(`Success in beginning to building of procedure dependencies for: ${req.body.catalog}: ${req.body.procedure}`)
			res.status(200).json({status: 200, message: "Completed module build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()                
})  
//Used
router.get("/install/status/get/:catalog/:procedure", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let procedure = store.library.catalog[req.params.catalog].procedures[req.params.procedure]
			let dependencies = procedure.dependencies.map((d,i)=>{
				let { streamObj, ...ret } = d
				if (d.type == 'docker'){
					if (store.images[d.target.split(":")[0] ]){
						ret.tags = store.images[d.target.split(":")[0] ].all_tags
					} else {
						ret.tags = []
					}
				}
				return ret  
			})
			logger.info(`Success in beginning to building of procedure dependencies for: ${req.params.catalog}:  ${req.params.procedure}`)
			res.status(200).json({status: 200, message: "Completed module build", data: dependencies });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()  
}) 
//Used
router.post("/procedure/build/dependency", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.build( req.body.skip, req.body.dependency) 
			logger.info(`Success in beginning to building of procedure dependencies for: ${req.body.catalog}:  ${req.body.procedure}`)
			res.status(200).json({status: 200, message: "Completed module build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()  
}) 


//USED
router.post("/procedure/build/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		(async function() {
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]

			let response = await procedure.cancel_build()
			logger.info("Cancel complete for procedure: %s",  req.body.catalog) 
			res.status(200).json({status: 200, message: "Completely canceled the build process for procedure", data:  "" });
		})().catch((err)=>{ 
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err2){
		logger.error("%s %s", "Error in canceling the procedure build procss", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})

//USED
router.post("/procedure/build/cancel/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		(async function() {
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.cancel_build(req.body.dependency)
			logger.info("Cancel complete for procedure: %s",  req.body.catalog) 
			res.status(200).json({status: 200, message: "Completely canceled the build process for procedure", data:  "" });
		})().catch((err)=>{
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err2){
		logger.error("%s %s", "Error in canceling the procedure build procss", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})

//Used
// router.post("/output/remove", (req,res,next)=>{ // build workflow according to name and index
// 	(async function(){
// 		try {
// 			// let module = store.library.catalog[req.body.catalog].modules[req.body.module]
// 			// let procedure = module.procedures[req.body.procedure]
// 			// let job = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.procedure}`)
// 			let promises = []
// 			req.body.paths.forEach((pathh)=>{
// 				if (pathh.type == 'dir'){
// 					promises.push(removeFile(pathh.path, pathh.type))
// 				} else {
// 					promises.push(removeFile(pathh.path))
// 				}
// 			})
// 			Promise.allSettled(promises).then((response)=>{
// 				res.status(200).json({status: 200, message: "Completed removal of output", data: 'Removed files' });
// 			}).catch((err2)=>{
// 				logger.error("%s %s", "Error in removing output", err2)
// 				res.status(419).send({status: 419, message: error_alert(err2)});
// 			})
// 			// if (job){
// 			// 	let response = await job.removeOutputs( req.body.idx ) 
// 			// 	logger.info(`Success in beginning to building of procedure output for: ${req.body.catalog}`)
// 			// 	res.status(200).json({status: 200, message: "Completed removal of output", data: response });
// 			// } else {
// 			// 	logger.error("Error in removing output for job")
// 			// 	res.status(419).send({status: 419, message:  'No Job available'});
// 			// }
// 		} catch(err2){
// 			logger.error("%s %s", "Error in removing output", err2)
// 			res.status(419).send({status: 419, message: error_alert(err2)});
// 		}	
// 	})()
// }) 


//Used
router.post("/procedure/remove/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.remove(req.body.dependency)
			logger.info(`Success in removal of module dependency: ${req.body.dependency}`)
			res.status(200).json({status: 200, message: "Completed module removel of single dependency", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in removing module dependency", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()    
}) 
 

//Used 
router.post("/module/build/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	
	(async function(){
		try {
			let module = store.library.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.cancel_build()
			logger.info(`Success in cancelling dependency build: ${req.body.catalog}`)
			res.status(200).json({status: 200, message: "Removed process for installation for this module", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in cancelling module dependency build", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

//Used
router.post("/images/prune", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try {
			await prune_images(req.body).then((response)=>{
				logger.info("Success in pruning all images") 
					res.status(200).json({status: 200, message: "Completed full pruning of dangling images", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in pruning images", err)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			 
		} catch(err2){
			logger.error("%s %s", "Error in pruning images", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	    
	})()  
})    
 
  
//Used
router.get("/procedure/config/:catalog/:procedure", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {     
		try {        
			let found = nestedProperty.get(store, `catalog.${req.params.catalog}.procedures.${req.params.procedure}`)
			let returnable = {}	
			res.status(200).json({status: 200, message: "Got procedure configuration", data: found.config });
		} catch(err2){
			logger.error("%s %s", "Error in getting procedure config", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()   


})
//Used
router.get("/job/status/:catalog/:procedure", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try {  
			let found = nestedProperty.get(store, `jobs.catalog.${req.params.catalog}.${req.params.procedure}`)
			let returnable = {}
			if (!found){
				let module = store.library.catalog[req.params.catalog]
				let procedure = module.procedures[req.params.procedure]
				let services = procedure.services.map((d,i)=>{
					return i
				}) 
				let job = await create_job(procedure.config, {}, services, procedure)
				found = job
				nestedProperty.set(store, `jobs.catalog.${req.params.catalog}.${req.params.procedure}`, job)
			} 
			res.status(200).json({status: 200, message: "Completed job setting", data: found.status });
		} catch(err2){
			logger.error("%s %s", "Error in setting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()   
})  

//Used
router.post("/job/start", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {     
		try {     
			store.logger.info("Init job start") 
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let token = req.body.token  
			if (!req.body.variables){
				req.body.variables = {}
			}  
			for (let [key, value] of Object.entries(req.body.variables)){
				req.body.variables[key] = {
					source: value.source,
					option: value.option
				}
			}
			if (!token){         
				token = 'development'     
			}         
			let services = req.body.services    
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.procedure}`)
			if (found){          
				store.logger.info("found job, cleaning it up")  
				found.cleanup()           
				delete store.jobs.catalog[req.body.catalog][req.body.procedure]
				store.logger.info("found job, cleaned up")    
			}    
			let skip = true
			store.logger.info("Starting Job! with services: %s", services) 
  			let job = await create_job(procedure.config, req.body, services, procedure)
			store.logger.info("job created")   
			nestedProperty.set(store, `jobs.catalog.${req.body.catalog}.${req.body.procedure}`, job)
			skip = await job.start(req.body) 
			store.logger.info("Completed or Exited Job!")

			if (!skip){
				res.status(200).json({status: 200, message: "Initiated job " + procedure.name, skip: skip });
			} else {
				res.status(200).json({status: 200, message: "Job skipped or cancelled" + procedure.name, skip: skip });
			}	    
			
		} catch(err2){
			logger.error("%s %s", "Error in starting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
	.catch((err2)=>{
		logger.error("%s %s", "Error in start job", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	})
}) 

//Used
router.post("/job/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() { 
		try { 
			let module = store.library.catalog[req.body.catalog]
			let procedure = module.procedures[req.body.procedure]
			let token = req.body.token  
			if (!token){    
				token = 'development'
			}
			let job;
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.procedure}`)
			if (found){ 
				await found.stop() 
				// found.cleanup() 
				// delete store.jobs.catalog[req.body.catalog][req.body.module][req.body.procedure]
			} else {
				found = {}
			}
			res.status(200).json({status: 200, message: "Completed job cancel", data: found.config });
		} catch(err2){
			logger.error("%s %s", "Error in canceling job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()  
}) 



export default router