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
const YAML = require("yaml") 
const { Server } = require("../../serverClass.js")
var { store } = require("../../config/store/index.js")
var { error_alert } = require("../controllers/logger.js")
const logger = store.logger
import { Procedure } from "../orchestrators/procedure.js";
const { Service } = require('../orchestrators//service.js');
const { Job } = require("../orchestrators/job.js")

import upload from "../controllers/upload.js"
import { cacheParams }  from "../controllers/cache.js" ;
import { mapTargetConfiguration, mapCacheVariables } from "../controllers/mapper.js";
import nestedProperty from "nested-property"
const path = require("path")
const { create_job } = require("../controllers/configurations.js")
//Import Validation Scripting
const { validate_run_dir } = require("../controllers/validate.js")
let dateFormat = require("date-format")

// Import cusotm modules and functions
const { 
	remove_images, 
	prune_images, 
	pullImage,
	loadImage,
	install_images_offline, 
	install_images_online, 
	cancel_load_images } = require("../controllers/post-installation.js")
const {	define_service, define_module, define_procedure, create_procedure, create_module, create_service } = require("../controllers/init.js")
const { 
	getPrimerDirsVersions, 
	fetch_protocols, 
	check_image,
	fetch_annotations, 
	fetch_primers, 
	fetch_videos_meta, 
	fetch_video,
	fetch_histories,
	fetch_status,
	listImages,
	getMeta,
	getDockerStatus,
	getServerStatus,
	fetch_external_dockers,
	getExternalSource,
	getRemoteConfigurations,
	fetch_docker_stats,
	fetch_external_config,
	fetch_external_config_target,
	set_stored, 
	save_remote_module
	} = require("../controllers/fetch.js")
const cloneDeep = require("lodash.clonedeep");


const { 
	readFile, 
	decompress_file,
	copyFile,
	writeFile,
	readTableFile,
	archive,
	removeFile,
	downloadSource
} = require("../controllers/IO.js")
const crypto  = require("crypto")

const { 
	 start_module,
	 init,
	 cancel_container, 
	 initialize,
	 updateDockerSocket,
	 add_selections,
	 rm_selections
 } = require('../controllers/index')

const {	removeAnnotation } = require("../controllers/annotations.js")

const { 
	watch_consensus, 
	init_watch_consensus, 
	module_status  
} = require("../controllers/watcher.js")


router.get("/server/ping", (req,res,next)=>{
	try {
		res.status(200).send({status: 200, message: `Server is running at port: ${process.env.PORT_SERVER}` });
	} catch(err){
		logger.error(`Error in server status ping ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})



router.get("/docker/status/get", (req,res,next)=>{
	try {
		fetch_docker_stats().then((response)=>{
			res.status(200).json({status: 200, data: response, message: "Docker is running" });
		}).catch((Err)=>{
			res.status(419).send({status: 419, message: error_alert(Err) });
		})
	} catch(err){
		logger.error(`Error in docker status fetch ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})


router.post("/container/cancel", (req,res,next)=>{
	try {  
		cancel_container(req.body.module).then((response)=>{
			res.status(200).json({status: 200, message: response.message });
		}).catch((err)=>{
			res.status(409).json({status: 409, message: error_alert(err) });
		})
	} catch(err){
		logger.error("%s %s", "Cancel rampart error", err.message)
		res.status(409).json({status: 409, message:  error_alert(err)});
	} 
})

router.get("/log/system", (req,res,next)=>{
	try {
		(async function(){
			console.log(store.system)
			let log = await readFile(store.system.logs.info, true)
			res.status(200).json({status: 200, message: "Got system log", data: log});
		})().catch((err)=>{
			store.logger.error(err)
			res.status(419).send({status: 419, message: `There was an error ${err}`});
		})
	} catch(err){
		res.status(419).send({status: 419, message: error_alert(err) });
	}	
})


router.post("/tags/fetch", (req,res,next)=>{ 
	(async function(){
		try {
			fetch_external_dockers(req.body.name).then((response)=>{
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
router.post("/tags/select", (req,res,next)=>{ 
	try {
		store.config.images[req.body.image].selectedTag = req.body
		res.status(200).json({status: 200, message: "Returning selected tag completed" });
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})  

router.post("/docker/socket", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await updateDockerSocket(req.body.socket)
			res.status(200).json({status: 200, message: "Updated Docker Socket!", data: null });
		} catch(err2){
			logger.error("%s %s", "Error in changing docker socket", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
})


router.post("/module/build/dependency/decompress", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let path = req.body.path 
			let target = req.body.target_path
			let response = await decompress_file(path, target )
			logger.info(`Success in beginning to decompress file: ${path}`)
			res.status(200).json({status: 200, message: "Completed decompression", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in decompressing file", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

router.post("/module/build/dependency", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let response = await module.build( req.body.overwrite, req.body.dependency)
			logger.info(`Success in beginning to building of module: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed module build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
}) 
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
router.get("/module/build/status", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let orchestrator = store.modules[req.body.module]
			let response = orchestrator.dependencies 
			logger.info(`Success in beginning to build  status modules: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed status build of module", data: response });
		} catch(err2){ 
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.get("/defaults/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		res.status(200).json({status: 200, message: "retrieved module information", data: store.default    });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
}) 

router.get("/module/get/:module/:variant", (req,res,next)=>{ // build workflow according to name and index
	try { 
		let variant = store.modules[req.params.module].variants[req.params.variant] 
		let data = [] 
		let returnable = [
			{
				status: variant.status,
				...variant.config 
			}
		]
		res.status(200).json({status: 200, message: "retrieved module information", data: returnable });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.post("/catalog/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){  
		try { 
			let response;
			let module = store.catalog[req.body.catalog].modules[req.body.module];
			console.log(module.config.path)
			if (module.config.custom || !module.config.local){
				let path_to_procedure = module.config.path
				await removeFile(path_to_procedure)
				let removed  = store.catalog[req.body.catalog].modules.splice(req.body.module, 1) 
			}
			logger.info("%o removing module complete", response)
			res.status(200).json({status: 200, message: `Completed module removal: ${req.body.catalog}`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in removing module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})().catch((err2)=>{ 
		logger.error("%s %s", "Error in removing module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})
router.get("/catalog/all/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.catalog
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
		logger.error("%s %s", "Error in loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/catalog/installed/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.catalog
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
		logger.error("%s %s", "Error in loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/catalog/get/:name", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules = store.config.modules.filter((d)=>{
			return d.name == req.params.name
		})
		
		res.status(200).json({status: 200, message: "retrieved module information", data: modules });
	} catch(err2){
		logger.error("%s %s", "Error in loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/catalog/installed/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.catalog
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
		logger.error("%s %s", "Error in loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})


router.get("/modules/get/:catalog", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = cloneDeep(store.catalog[req.params.catalog])
		let data = [] 
		catalog.modules.forEach((module)=>{
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
		})
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading module to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/procedures/get/:catalog/:module/:token", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures = store.catalog[req.params.catalog].modules[req.params.module].procedures
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
				let cached_variables = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.module}.${i}`)
				returnable.cached_variables = cached_variables
				data.push(returnable)
			} 
			
			catch (err){
				store.logger.error("Could not get procedure build loaded for... %o %o", data, err)
			}
		})
		
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){ 
		logger.error("%s %s", "Error in loading procedure to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	 
})
router.get("/services/get/:catalog/:module/:procedure", (req,res,next)=>{ // build workflow according to name and index
	try {
		let services = cloneDeep(store.catalog[req.params.catalog].modules[req.params.module].procedures[req.params.procedure].services)
		let data = []  
		services.forEach((service)=>{
			let { streamObj, ...status } = service.status
			delete status['exists']
			let returnable =  {
				status: status,
				...service.config
			}
			data.push(returnable)
		})
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading procedure to library", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/modules/custom/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules = Object.entries(store.modules)
		let data = []
		modules.forEach((module)=>{ 
			try{
				let returnables = []
				let name = module[0]
				
				let value = module[1]
				if (value.config.custom ){
					let dependencies = value.dependencies.map((d)=>{
						let { streamObj, ...newObj } = d //Remove the stream obj on return 
						return newObj
					})
					data.push({ 
						name: name,
						custom: value.config.custom,
						dependencies: dependencies
					})
				}
				
			} catch (err){
				store.logger.error("Could not get module loaded for... %o", module)
			}
		})
		res.status(200).json({status: 200, message: "retrieved custom module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading info for custom modules", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/procedures/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures = Object.entries(store.procedures)
		let data = {}
		procedures.forEach((val)=>{ 
			let returnables = []
 
			let name = val[0]
			let procedure = val[1]

			let status = procedure.status 
			
			let returnable = {  
				name: name
			}
			for (let [key, entry] of Object.entries(procedure.params)){
				returnable[key] = entry
			}

			let services = {};
			for (let [key, service] of Object.entries(procedure.services)){
				services[key] = service.config
			}
			returnable.status = status
			returnable.services = services
			
			data[name] = returnable
		

		}) 
		res.status(200).json({status: 200, message: "retrieved procedure information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/service/get/:catalog/:module/:procedure/:service/:token", (req,res,next)=>{ // build workflow according to name and index
	try {
		let service = store.catalog[req.params.catalog].modules[req.params.module].procedures[req.params.procedure].services[req.params.service]
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
router.get("/status/get/service/:catalog/:module/:procedure/:service/:token", (req,res,next)=>{ // build workflow according to name and index
	try { 
		(async ()=>{
			let service = store.catalog[req.params.catalog].modules[req.params.module].procedures[req.params.procedure].services[req.params.service]
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


router.get("/procedures/status", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures = Object.entries(store.procedures)
		let data = []	
		procedures.forEach((p)=>{ 
			let name = p[0]
			let procedure = p[1]
			let returnable = {name: procedure.name, services: []}
			let staged_services = []
			if (procedure.services){
				procedure.services.forEach((service, index)=>{
					staged_services.push(
						{
							installed: service.status.fully_installed,
							exists: service.status.exists,
							log: service.status.stream,
							name: service.name,
							dependencies: service.dependencies
						}
					) 
				})
				returnable.services = staged_services
				data.push(returnable)
			}
		})
		res.status(200).json({status: 200, message: "retrieved procedure specifics information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting procedure status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.post("/archive/files/", (req,res,next)=>{ 
	(async function(){
		try {
			let files = req.body.files
			console.log(files)
			for (let file of files){
				await await archive(file, req.body.gzip)
			}
			res.status(200).json({status: 200, message: "archived file", data: "tar'd 1 or more files to stage for archiving"  });
		} catch(err2){ 
			logger.error("%s %s", "Error in archiving file %s", err2, req.body.file)
			res.status(419).send({status: 419, message: error_alert(err2)});
		} 	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in getting archive completed for file %s", err2, req.body.file)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})

router.post("/module/save/file", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let filepath = req.body.source
			let filename = path.basename(req.body.source)
			let st = await readFile(filepath)
			let parsed = YAML.parse(st)
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
					let modl = create_module(module)
					store.config.modules.push(module)
					store.catalog[module.name].modules.push(modl)
					let response = YAML.stringify([module])
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
				let modl = create_module(parsed)
				store.config.modules.push(parsed)
				store.catalog[module.name].modules.push(modl)
				let response = YAML.stringify([parsed])
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
router.post("/module/save/text", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let parsed;
			let type = req.body.type
			let source = req.body.source
			if (type == 'YAML'){
				parsed = YAML.parse(source)
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
					let modl = create_module(module)
					let basename = module.name + "_"+ module.version
					let endpath = path.join(store.system.shared.modules, basename+".yml")
					module.path = endpath
					store.config.modules.push(module)
					store.catalog[module.name].modules.push(modl)
					let response = YAML.stringify([module]) 
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
				let modl = create_module(parsed)
				store.config.modules.push(parsed)
				store.catalog[module.name].modules.push(modl)
				let response = YAML.stringify([parsed])
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

router.get("/session/cache/get/:catalog/:module/:procedure/:token", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			
			let tokenVals = store.server.cache.get(req.params.token)  
			let services = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`)
			
			res.status(200).json({status: 200, message: "Completed caching of service variables", data: services });
		} catch(err2){
			logger.error("%s %s", "Error in caching variables", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})() 
}) 


router.post("/service/run", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let procedure = req.body.procedure
			let module = req.body.module
			let catalog = req.body.catalog
			let service= req.body.service
			let response;
			let variables = req.body.variables
			let token = req.body.token
			let params = req.body
			service = store.catalog[catalog].modules[module].procedures[procedure].services[service]
			if (!token){ 
				token = 'development'
			}
			if (req.body.variables){
				let bb = {
					...req.body,

				}
				for (let [key, variable] of Object.entries(req.body.variables)){
					if (variable.source){
						cacheParams(token, {
							...bb,
							value: variable.source, 
							variable:key,
							target: "source"  
						})    
					}
					if (variable.option || variable.option == 0){
						cacheParams(token, {
							...bb,
							variable: key,  
							value: variable.option,
							target: "option"
						})
					}
						
				}
					
			}
			let tokenVals = store.server.cache.get(token)
			let variables_cached = nestedProperty.get(tokenVals, `catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}.${req.body.service}`)
			await service.check_then_start(params, false)
			logger.info("%o service sent for running", req.body.service)
			res.status(200).json({status: 200, message: `Completed run service submission: ${service.name}`, data: req.body.service });
		} catch(err2){
			logger.error("%s %s", "Error in runnin service", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in running service", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})

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
			service = store.catalog[catalog].modules[module].procedures[procedure].services[service]
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


router.post("/procedure/run", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let response;
			let procedure = req.body.procedure
			let module = req.body.module
			let catalog = req.body.catalog
			let variables = req.body.variables
			let token = req.body.token 
			let params = req.body

			procedure = store.catalog[catalog].modules[module].procedures[procedure]
			if (!token){ 
				token = 'development'
			}
			if (req.body.variables){
				let bb = {
					...req.body,

				}
				for (let [key, variable] of Object.entries(req.body.variables)){
					if (variable.source){
						cacheParams(token, {
							...bb,
							value: variable.source,
							variable:key,
							target: "source"
						})
					}
					if (variable.option || variable.option == 0){
						cacheParams(token, {
							...bb,
							variable: key,
							value: variable.option,
							target: "option"
						})
					}
						
				}
					
			}
			variables = procedure.updateVariables(variables)
			response = await procedure.start(variables)
			logger.info("%o workflow sent for running", response)
			res.status(200).json({status: 200, message: `Completed procedure run: ${procedure.config.title}`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in running procedure", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in running procedure", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})


router.post("/procedure/stop", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let response;
			if (req.body.procedure || req.body.procedure == 0){
				let procedure = req.body.procedure
				let module = req.body.module
				let variant = req.body.variant
				let variables = req.body.variables
				let token = req.body.token 
				let params = req.body
				procedure = store.modules[module].variants[variant].procedures[procedure]
				response = await procedure.stop()
				logger.info("%o procedure stopping ", response)
				res.status(200).json({status: 200, message: `Completed stopping of: ${procedure.config.title}`, data: response });
			} else {
				res.status(419).send({status: 419, message: "Procedure doesn't exists in the system"});
			}
			
		} catch(err2){
			logger.error("%s %s", "Error in running procedure", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in running procedure", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})

router.post("/remote/save/modules", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let remote_module = store.remotes[req.body.catalog][(req.body.module ? req.body.module : 0 )]
			let savePath = remote_module.path
			if (!savePath){
				let basename = `${remote_module.name}_${remote_module.version}.yml`

				savePath = path.join(store.system.remotes.modules, basename) 
			}

			await writeFile(savePath, YAML.stringify([remote_module]))

			console.log(savePath)
			let data = []
			logger.info("%s cache %o", req.body.catalog, data.length)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	 
	})()
})

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

router.get("/remote/get/:target", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let data = await fetch_external_config_target(req.params.target)
			if (data && data.length >0){
				data = data.filter((f)=>{
					return req.params.target == f.name
				})
				set_stored(req.params.target, data)
				
			}
			logger.info("%s cache %o", req.params.target, data.length)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

router.get("/remote/get/:target/:catalog", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let data = await fetch_external_config_target(req.params.target, req.params.catalog)
			set_stored(req.params.target, data)
			logger.info("%s cache %o", req.params.target, data.length)
			res.status(200).json({status: 200, message: `${req.params.target}, received from remote site`, data: data });
		
		} catch(err2){
			logger.error( "Error  %o in getting config target remotely %s", err2, req.params.target)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})


router.get("/cache/get/:token", (req,res,next)=>{ // build workflow according to name and index
	try {
		let cache = store.server.cache.get(req.params.token)
		logger.info("%s cache %o", req.params.token, cache)
		res.status(200).json({status: 200, message: "Completed caching of service variables", data: cache });
	
	} catch(err2){
		logger.error("%s %s", "Error in caching variables", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.post("/session/cache/create", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			crypto.randomBytes(48, function(err, buffer) {
				if (err){
					logger.error("%s %s", "Error in caching variables", err)
					res.status(419).send({status: 419, message: error_alert(err)});
				}
				var token = buffer.toString('hex');
				let response;
				console.log("Create session")
				let cach = store.server.defineCache(token)
				store.server.cache.set(token, cach)
				// let response = await server.cache(req.body.variables, req.body.token)
				res.status(200).json({status: 200, message: "Completed caching of service variables", data: token });
			});
			
		} catch(err2){
			logger.error("%s %s", "Error in caching variables", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

 
router.get("/service/cache/get/:service/:token", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let variables;
			let tokenVals = store.server.cache.get(req.params.token) 
			variables = nestedProperty.get(tokenVals, `services.${req.params.service}.variables`)
			res.status(200).json({status: 200, message: "Completed retrieval of cached service variables", data: variables });
		} catch(err2){
			logger.error("%s %s", "Error in  getting cached variables", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})


router.post("/procedure/build", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.build( req.body.overwrite, null)
			logger.info(`Success in beginning to building of procedure dependencies for: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed module build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.post("/procedure/build/dependency", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.build( req.body.overwrite, req.body.dependency) 
			logger.info(`Success in beginning to building of procedure dependencies for: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed module build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
}) 

router.post("/output/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			// let module = store.catalog[req.body.catalog].modules[req.body.module]
			// let procedure = module.procedures[req.body.procedure]
			let job = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
			if (job){
				let response = await job.removeOutputs( req.body.idx ) 
				logger.info(`Success in beginning to building of procedure output for: ${req.body.module}`)
				res.status(200).json({status: 200, message: "Completed removal of output", data: response });
			} else {
				logger.error("Error in removing output for job")
				res.status(419).send({status: 419, message:  'No Job available'});
			}
		} catch(err2){
			logger.error("%s %s", "Error in removing output", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
}) 

router.post("/procedure/build/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		(async function() {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]

			let response = await procedure.cancel_build()
			logger.info("Cancel complete for procedure: %s",  req.body.module) 
			res.status(200).json({status: 200, message: "Completely canceled the build process for procedure", data:  "" });
		})().catch((err)=>{
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err2){
		logger.error("%s %s", "Error in canceling the procedure build procss", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})


router.post("/procedure/build/cancel/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		(async function() {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.cancel_build(req.body.dependency)
			logger.info("Cancel complete for procedure: %s",  req.body.module) 
			res.status(200).json({status: 200, message: "Completely canceled the build process for procedure", data:  "" });
		})().catch((err)=>{
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err2){
		logger.error("%s %s", "Error in canceling the procedure build procss", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})

router.post("/procedure/remove/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
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


router.post("/procedure/dependencies/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.remove()
			logger.info(`Procedure removal attempt completed: ${req.body.module} ${response}`)
			res.status(200).json({status: 200, message: "Completed procedure of module removal", data: response });
		} catch(err2){    
			logger.error("%s %s", "Error in module removal", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})()
})

router.post("/module/build/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
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

router.post("/module/build/cancel/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	
	(async function(){
		try {
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let response = await procedure.cancel_build(req.body.dependency)
			logger.info(`Success in cancelling dependency build: ${req.body.dependency}`)
			res.status(200).json({status: 200, message: "Removed process for install dependency for this module", data: response });
		} catch(err2){ 
			logger.error("%s %s", "Error in cancelling module dependency build", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()  
}) 

 
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
 

router.get("/job/stage/:catalog/:module/:procedure", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try { 
			let module = store.catalog[req.params.catalog].modules[req.params.module]
			let procedure = module.procedures[req.params.procedure]
			let services = procedure.services.map((d,i)=>{
				d.idx = i
				return d
			})
			let returnable = {
				services:services,
				...procedure.config
			}
			res.status(200).json({status: 200, message: "Completed job setting", data: returnable });
		} catch(err2){
			logger.error("%s %s", "Error in setting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()  
}) 

router.get("/job/status/:catalog/:module/:procedure", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try { 
			let found = nestedProperty.get(store, `jobs.catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`)
			let returnable = {}
			if (!found){
				let module = store.catalog[req.params.catalog].modules[req.params.module]
				let procedure = module.procedures[req.params.procedure]
				let services = procedure.services.map((d,i)=>{
					return i
				}) 
				let job = await create_job(procedure.config, {}, services, procedure)
				found = job
				nestedProperty.set(store, `jobs.catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`, job)
			}
			res.status(200).json({status: 200, message: "Completed job setting", data: found.status });
		} catch(err2){
			logger.error("%s %s", "Error in setting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()   
})  

router.post("/job/set/variable", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {   
		try {      
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure] 
			let token = req.body.token
			if (!token){     
				token = 'development' 
			}
			
			// let tokenVals = store.server.cache.get(token)  
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
			let job;
			 
			if (!found){
				let services = req.body.services
				job = await create_job(procedure.config, req.body.variables, services, procedure)
				nestedProperty.set(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`, job)
			} else {
				job = found 
			}
			let changed_variables = await job.setVariable(req.body.value, req.body.variable, req.body.target )
 			res.status(200).json({status: 200, message: "Completed job setting", data: changed_variables });
		} catch(err2){  
			logger.error("%s %s", "Error in setting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()  
}) 
router.post("/job/set", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try { 
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let token = req.body.token
			if (!token){ 
				token = 'development'
			}
			let services = req.body.services
			// let tokenVals = store.server.cache.get(token)  
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
			let job;
			
			if (!found){ 
				job = await create_job(procedure.config, req.body.variables, services)
				nestedProperty.set(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`, job)
			} else {    
				job = found      
			}          
			job.setVariables(req.body.variables) 
			res.status(200).json({status: 200, message: "Completed job setting", data: job.configuration });
		} catch(err2){    
			logger.error("%s %s", "Error in setting job", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	   
	})()     
}) 

router.post("/job/start", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {     
		try {     
			store.logger.info("Init job start") 
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let token = req.body.token    
			if (!token){         
				token = 'development'     
			}      
			let services = req.body.services    
			// let tokenVals = store.server.cache.get(token)   
			// nestedProperty.set(tokenVals, `catalog.${req.body.catalog}.${req.body.module}.${req.body.pro    cedure}.variables`, req.body.variables)
			// nestedProperty.set(tokenVals, `catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}.job`, job)
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
			if (found){        
				store.logger.info("found job, cleaning it up") 
				found.cleanup()      
				delete store.jobs.catalog[req.body.catalog][req.body.module][req.body.procedure]
				store.logger.info("found job, cleaned up")  
			} 
			store.logger.info("Starting Job!")  
  			let job = await create_job(procedure.config, req.body.variables, services, procedure)
			// console.log("req body", job.configuration.variables.file.source, job.configuration.variables.file.bind.from)
			store.logger.info("job created")   
			nestedProperty.set(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`, job)
			let skip = await job.start()
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


router.post("/job/cancel", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() { 
		try { 
			let module = store.catalog[req.body.catalog].modules[req.body.module]
			let procedure = module.procedures[req.body.procedure]
			let token = req.body.token  
			if (!token){    
				token = 'development'
			}
			let job;
			let found = nestedProperty.get(store, `jobs.catalog.${req.body.catalog}.${req.body.module}.${req.body.procedure}`)
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

router.get("/job/get/:catalog/:module/:procedure/:token", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function() {
		try { 
			let job;
			let token =req.params.token
			if (!req.params.token){
				token = 'development'
			}
			let tokenVals = store.server.cache.get(token)  
			// job = nestedProperty.get(tokenVals, `catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`)
			job = nestedProperty.get(store, `jobs.catalog.${req.params.catalog}.${req.params.module}.${req.params.procedure}`)
			// console.log(store.jobs.catalog[req.params.catalog][req.params.module])
			let status = {
				running: false,
				errors: false,
				complete: false	,
				exists: false			
			}
			let variables = {}
			if (job){
				if( job.status){
					status = {
						...job.status,
					}
				}
				if (job.configuration){
					variables = job.configuration.variables
				}
			}
			let returnable = {
				status: status, 
				variables: variables
			}
			res.status(200).json({status: 200, message: "Completed job setting", data: returnable });
		} catch(err2){
			logger.error("%s %s", "Error in getting job status", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()  
}) 


export default router