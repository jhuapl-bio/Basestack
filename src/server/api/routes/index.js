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

import upload from "../controllers/upload.js"
import { cacheParams }  from "../controllers/cache.js" ;
import { mapTargetConfiguration, mapCacheVariables } from "../controllers/mapper.js";
import nestedProperty from "nested-property"
const path = require("path")
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


router.post("/modules/cancel", (req,res,next)=>{
	try {
		cancel_container(req.body).then((response)=>{
			logger.info("Success in stopping container: %s", req.body.module)
			res.status(200).json({status: 200, message: "Success in stopping " +req.body.module});
		}).catch((err)=>{
			logger.error(err)
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err){
		logger.error(err)
		throw err
	}
})

router.get("/meta/fetch", (req,res,next)=>{
	try {
		logger.info("initializing starting")
		getMeta().then((response)=>{
			logger.info(`getting meta... ${response}`)
			res.status(200).json({status: 200, data: response, message: "Retrieved Meta Information" });
		}).catch((err)=>{
			logger.error(`Error in meta service fetch${err}`)
			res.status(419).send({status: 419, message: error_alert(err) });
		})
	} catch(err){
		logger.error(`Error in meta service fetch ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
})
router.get("/server/ping", (req,res,next)=>{
	try {
		res.status(200).send({status: 200, message: `Server is running at port: ${process.env.PORT_SERVER}` });
	} catch(err){
		logger.error(`Error in server status ping ${err}`)
		res.status(419).send({status: 419, message: error_alert(err) });
	}
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


router.post("/modules/start", (req,res,next)=>{
	try {
		(async ()=>{
			let response = await start_module(req.body)
			logger.info("%s %s", "Success in starting module", response.message)
			res.status(200).json({status: 200, message: response.message, exists: response.exists, payload: response.payload });
		})().catch((err2)=>{
			logger.error(`Error in module start ${err2} `)
			res.status(419).send({status: 419, message: error_alert(err2) });
		})
	} catch(err){
		logger.error(`Error in module start ${err} `)
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
router.post("/consensus/watch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await watch_consensus(req.body).then((response)=>{
				if (response =="no change"){
					res.status(201).json({status: 201, message: "No Change"});
				} else{
					logger.info("Watching consensus report file")
					res.status(200).json({status: 200, message: "Watching consensus file report", data: response });
				}
			}).catch((err2)=>{
				logger.error("%s %s", "Error in watching consensus", err2)
				res.status(419).send({status: 419, message: error_alert(err2) });
			})			
		} catch(err){
			logger.error(err)
			res.status(419).send({status: 419, message: error_alert(err) });
		}
	})().catch((err3)=>{
		logger.error("%s %s", "Error in watching consensus", err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	})	
})


router.post("/consensus/startWatch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
				await init_watch_consensus(req.body.selectedHistory.reportDir).then((response)=>{
					// logger.info("%s", "Adding watching (success) for consensus file")
					res.status(200).json({status: 200, message: "Watching consensus file report started", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "There was an error watching the report file", err)
					res.status(419).send({status: 419, message: "There was an error"});
				})

		} catch(err2){
			logger.error("%s %s", "Error in watching consensus file", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err2)=>{})
})

router.post("/consensus/status", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await module_status(
				req.body.selectedHistory,
				req.body.module
			).then((response)=>{
				const mod = response
				res.status(200).json({status: 200, message: "Check status", data: mod });
			}).catch((err)=>{
				logger.error("%s %s", "There was an error checking the status", err)
				res.status(419).send({status: 419, message: "There was an error"});
			})
		} catch(err2){
			logger.error("%s %s", "Error in getting status of complete file", err2)
			res.status(419).send({status: 419, message: error_alert(2) });
		}
	})().catch((err2)=>{
		console.error(err2, "Error in module status")
	})
})

router.post("/status/modules/fetch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await store.modules[req.body.container].obj.watch(req.body).then((response)=>{
				res.status(200).json({status: 200, message: "Check status", data: response });
			}).catch((err)=>{
				logger.error("%s %s", "There was an error checking the status", err)
				res.status(419).send({status: 419, message: "There was an error"});
			})
			// await module_status(
			// 	req.body.selectedHistory,
			// 	req.body.module
			// ).then((response)=>{
			// 	const mod = response
			// 	res.status(200).json({status: 200, message: "Check status", data: mod });
			// }).catch((err)=>{
			// 	logger.error("%s %s", "There was an error checking the status", err)
			// 	res.status(419).send({status: 419, message: "There was an error"});
			// })
		} catch(err2){
			logger.error("%s %s", "Error in getting status of complete file", err2)
			res.status(419).send({status: 419, message: error_alert(2) });
		}
	})().catch((err2)=>{
		console.error(err2, "Error in module status")
	})
})

router.get("/log/:container_name/:type", (req,res,next)=>{
	try {
		if (req.params.type == 'container'){
			if (store.modules[req.params.container_name]){
				const log = store.modules[req.params.container_name].status.stream
				res.status(200).json({status: 200, message: "Watching  log", data: log });
			} else {
				res.status(201).json({status: 201, message: "No Stream" });			
			}
		} else if (req.params.type == 'system'){
			(async function(){
				let log = await readFile(store.system.logFile, true)
				res.status(200).json({status: 200, message: "Got system log", data: log});
			})().catch((Err)=>{
				res.status(419).send({status: 419, message: "There was an error"});
			})
		}
		
	} catch(err){
		res.status(419).send({status: 419, message: error_alert(err) });
	}	
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

router.get("/meta/fetch", (req,res,next)=>{ 
	try {
		res.status(200).json({status: 200, message: "Returning meta", 
			data: store.meta
		});
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})


router.get("/primers/fetch", (req,res,next)=>{ 
	(async function(){
		try {
			await fetch_primers().then((response)=>{
				// logger.info("%s %s", "Fetch primers", JSON.stringify(response))
					res.status(200).json({status: 200, message: "Returning primers folders", data: response });
				}).catch((err)=>{
					logger.error(err)
					res.status(419).send({status: 419, message: "There was an error in fetch primers folders. Check Logs"});
				})			
		} catch(err){
			logger.error(err)
			res.status(419).send({status: 419, message: error_alert(err) });
		}	
	})().catch((err)=>{})
})


router.get("/protocols/fetch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
			await fetch_protocols().then((response)=>{
				// logger.info("%s %s", "Fetch primers", JSON.stringify(response))
					res.status(200).json({status: 200, message: "Returning protocol folders", data: response });
				}).catch((err)=>{
					logger.error(err)
					res.status(419).send({status: 419, message: "There was an error in fetch protocol folders. Check Logs"});
				})			
			
		} catch(err){
			logger.error(err)
			res.status(419).send({status: 419, message: error_alert(err) });
		}	
	})().catch((err)=>{})
})



router.get("/histories/fetch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await fetch_histories().then((response)=>{
					// logger.info("%s %s", "Fetch histories", JSON.stringify(response, null, 4))
					res.status(200).json({status: 200, message: "Returning histories", data: response });
				}).catch((err)=>{
					logger.error("%s, %s", err, " could not fetch histories")
					res.status(419).send({status: 419, message: "There was an error in fetch histories. Check Logs"});
				})			
			
		} catch(err2){
			logger.error("%s, %s", err2, " could not fetch histories. Check Logs")
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})	
})
router.get("/annotations/fetch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
			await fetch_annotations().then((response)=>{
					// logger.info("%s %s", "Fetch annotations", JSON.stringify(response))
					res.status(200).json({status: 200, message: "Returning annotation folders", data: response });
				}).catch((err)=>{
					logger.error(err)
					res.status(419).send({status: 419, message: "There was an error in fetch annotation folders. Check Logs"});
				})			

		} catch(err){
			logger.error(err)
			res.status(419).send({status: 419, message: error_alert(err) });
		}	
	})().catch((err)=>{})
})
router.get("/videos/fetchMeta", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			await fetch_videos_meta().then((response)=>{
					// logger.info("%s %s", "Fetched videos Meta")
					res.status(200).json({status: 200, message: "Returning video params", data: response });
				}).catch((err)=>{
					logger.error("%s, %s", err, " could not fetch any videos meta files")
					res.status(419).send({status: 419, message: "There was an error in fetch videos meta. Check Logs"});
				})			
		} catch(err2){
			logger.error("%s, %s", err2, " could not fetch videos Meta . Check Logs")
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
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
router.post("/videos/fetch", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		res.sendFile(req.body.fullpath)
	} catch(err2){
		logger.error("%s, %s", err2, " could not fetch video file . Check Logs")
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})
 


router.post("/bookmark/add", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
				let consensus_obj = store.modules['basestack_consensus'];
				let response = await consensus_obj.obj.bookmarkSelections(req.body)
				res.status(200).json({status: 200, message: "Completed bookmark", data: response });
			
		} catch(err2){
			logger.error("%s %s", "Error in bookmarking of parameters", err2)
			res.status(419).send({status: 419, message: error_alert(err2)  });
		}
	})()	
})
router.post("/bookmark/remove", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
				let consensus_obj = store.modules['basestack_consensus'];
				let response = await consensus_obj.obj.removeBookmark(req.body)
				logger.info("Success in removing bookmark")
				res.status(200).json({status: 200, message: "Completed removal of bookmark", data: response });
			
		} catch(err2){
			logger.error("%s %s", "Error in removal of bookmarking due to parameters", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
})
router.post("/timestamp/add", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
				let tutorial_obj = store.modules['basestack_tutorial'];
				let response = await tutorial_obj.obj.timestampAdd(req.body)
				logger.info("success %s", response)
				res.status(200).json({status: 200, message: "Completed video timestamp", data: response });
			
		} catch(err2){
			logger.error("%s %s", "Error in timestamping params", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
})
router.post("/timestamp/remove", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
				let tutorial_obj = store.modules['basestack_tutorial'];
				let response = await tutorial_obj.obj.removeTimestamp(req.body)
				logger.info("Success in removing timestamp")
				res.status(200).json({status: 200, message: "Completed removal of timestamp", data: response });
			
		} catch(err2){
			logger.error("%s %s", "Error in removal of timestamp due to parameters", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})()
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

router.post("/annotation/remove", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {   
			
			await removeAnnotation(req.body).then((response)=>{
				logger.info("Success in removing annotation")
					res.status(200).json({status: 200, message: "Completed removal of annotation", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in removing annotation", err)
					res.status(419).send({status: 419, message: "There was an error; " + err});
				})			
			
		} catch(err2){
			logger.error("%s %s", "Error in removal of annotation due to parameters", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}
	})().catch((err)=>{})	
})

router.post("/orchestrator/build", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let workflow = store.system.orchestrators.dind.workflow
			let response = await workflow.build([0], true)
			logger.info(`Success in beginning to build workflow orchestrator: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed workflow build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
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
router.get("/catalog/all/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = store.catalog
		let data = [] 

		for (let [name, value] of Object.entries(cloneDeep(catalog))){
			delete value['interval']
			let { modules, ...returnable } = value;
			if (store.remotes[name]){
				returnable.remotes = store.remotes[name]
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
		let catalog = cloneDeep(store.catalog[req.params.name])
		let data = [] 
		delete catalog['interval']
		let { modules, ...returnable } = catalog;
		data.push(returnable)
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


router.get("/modules/get/:catalog", (req,res,next)=>{ // build workflow according to name and index
	try {
		let catalog = cloneDeep(store.catalog[req.params.catalog])
		let data = [] 
		catalog.modules.forEach((module)=>{
			let { procedures, ...config } = module.config
			let able = {
				status: module.status,
				...config
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

router.get("/images/get", (req,res,next)=>{ // build workflow  according to name and index
	try {
		console.log("images");   
		(async ()=>{             
			let images = await listImages();           
			console.log(images) 
			res.status(200).json({status: 200, message: "retrieved images information", data: images});
		})().catch((err)=>{ 
			throw err  
		})  
	} catch(err2){
		logger.error("%s %s", "Error in getting images", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	}	
})
router.get("/dind/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		(async ()=>{
			let images = await listImages(true);
			res.status(200).json({status: 200, message: "retrieved images from dind information", data: images});
		})().catch((err)=>{
			throw err
		})
	} catch(err2){
		logger.error("%s %s", "Error in getting images", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/module/:moduleName", (req,res,next)=>{ // build workflow according to name and index
	try {
		let module = store.modules[req.params.moduleName]
		let returnables = []
		let dependencies = module.dependencies.map((d)=>{
			let { streamObj, ...newObj } = d //Remove the stream obj on return 
			return newObj
		}) 
		
		let data = { 
			name: req.params.moduleName,
			dependencies: dependencies
		}
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/services/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let services = Object.entries(store.services)
		let data = []
		
		services.forEach((service)=>{ 
			let returnables = []
			let name = service[0]
			let value = service[1]
			let dependencies = value.depends
			let config = value.config
			data.push({
				name: name,
				dependencies: dependencies,
				config: config
			})
		

		})
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/services/custom/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let services = Object.entries(store.services)
		let data = []
		services.forEach((service)=>{ 
			
			let name = service[0]
			let value = service[1]
			let dependencies = value.depends
			let config = value.config
			if (value.config.custom){
				data.push({
					name: name,
					dependencies: dependencies,
					config: config
				})
			}
		})
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
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
router.get("/procedures/custom/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures = Object.entries(store.procedures)
		let data = []
		procedures.forEach((val)=>{ 
			let returnables = []
			let name = val[0]
			let procedure = val[1]
			let status = procedure.status 
			if (procedure.params.custom){
				let services = {};
				for (let [key, service] of Object.entries(procedure.services)){
					services[key] = service.config
				}
				data.push({
					name: name,
					title: procedure.params.title, 
					config: procedure.params,
					status: status,
					services: services
				})
			}
		})
		res.status(200).json({status: 200, message: "retrieved custom procedure information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting info for custom procedures", err2)
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

router.get("/status/get/procedure/:module/:variant/:procedure", (req,res,next)=>{ // build workflow according to name and index
	try { 
		let pro = req.params.procedure
		let variant = req.params.variant
		let module = req.params.module
		let procedure  = store.modules[module].variants[variant].procedures[pro]
		let procedure_steps = procedure.service_steps;
		let stream = []
		let service_statuses = []
		procedure.services.forEach((service)=>{
			stream.push(...service.status.stream.info)
			service_statuses.push(service.status)
		})
			
		let data = { 
			fully_installed: procedure.status.fully_installed,
			running: procedure.status.running,
			stream : stream,
			service_statuses: service_statuses
		}
		res.status(200).json({status: 200, message: "retrieved procedure specifics information", data: data });
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

router.get("/services/status", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data = []	
		for ( const [key, service ] of Object.entries(store.services)){
			data.push(
				{
					installed: service.status.fully_installed,
					status: service.status.exists, 
					name: service.name,
					dependencies: service.dependencies
				}
			) 
		}
		res.status(200).json({status: 200, message: "retrieved status(es) for services", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting service status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.post("/modules/status/select", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules= req.body.items
		let data = []
		modules.forEach((module)=>{
			let value = store.modules[module]
			let dependencies_list = value.dependencies.map((d)=>{
				let { streamObj, ...newObj } = d //Remove the stream obj on return 
				return newObj
			})
			// let fullStatus = dependencies_list.map((dependency)=>{
			// 	return dependency.status.stream
			// })
			let returnable = { 
				name: module,
				custom: value.custom,
				dependencies: dependencies_list,
				status:value.status
			}
			let  {dependencies, ...config_list } = value.config
			for (let [key,value] of Object.entries(config_list)){
				returnable[key]  = value
			}
			data.push(returnable)
			
		})
		
		res.status(200).json({status: 200, message: "retrieved status(es) for modules", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting module status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.post("/services/status/select", (req,res,next)=>{ // build workflow according to name and index
	try {
		let services= req.body.items
		let data = []
		services.forEach((service)=>{
			let serv = store.services[service]
			data.push(
				{
					installed: serv.status.fully_installed,
					status: serv.status.exists, 
					logs: serv.status.stream,
					name: serv.name,
					dependencies: serv.dependencies
				}
			) 
		})
		
		res.status(200).json({status: 200, message: "retrieved status(es) for services", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting service status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.post("/procedures/status/select", (req,res,next)=>{ // build workflow according to name and index
	try {
		let procedures_names = req.body.items
		let data = []
 		procedures_names.forEach((p)=>{ 
			let procedure = store.procedures[p]
			let returnable = {name: procedure.name, services: []}
			let staged_services = [] 
			if (procedure.services){
				for (let [key, service] of Object.entries(procedure.services)){
						staged_services.push(
							{
								installed: service.status.fully_installed,
								exists: service.status.exists,
								log: service.status.stream,
								name: service.name,
								dependencies: service.dependencies
							}
						) 
				}
				returnable.services = staged_services
				data.push(returnable)
			}
		})
		
		
		res.status(200).json({status: 200, message: "retrieved status(es) for procedures", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in getting procedure status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/procedures/names", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data = []	
		let names = Object.keys(store.procedures)
		res.status(200).json({status: 200, message: "retrieved names for procedures", data: names });
	} catch(err2){
		logger.error("%s %s", "Error in getting procedure name(s)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/modules/names", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data = []	
		let names = Object.keys(store.modules)
		res.status(200).json({status: 200, message: "retrieved names for modules", data: names });
	} catch(err2){
		logger.error("%s %s", "Error in getting module name(s)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.get("/services/names", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data = []	
		let names = Object.keys(store.services)
		res.status(200).json({status: 200, message: "retrieved names for services", data: names });
	} catch(err2){
		logger.error("%s %s", "Error in getting service name(s)", err2)
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
router.post("/service/archive/files/", (req,res,next)=>{ 
	(async function(){
		try {
			let archives = req.body.archives
			let destination = req.body.destination
			let service = store.services[req.body.service]
			for (let archive of archives){
				await service.archive(archive, destination)
			}
			res.status(200).json({status: 200, message: "archived file to container that is running...", data: "Archived 1 or more files"  });
		} catch(err2){ 
			console.log("yes")
			logger.error("%s %s", "Error in archiving file to service container %s", err2, req.body.archive)
			res.status(419).send({status: 419, message: error_alert(err2)});
		} 	
	})().catch((err2)=>{
		console.log("yes")
		logger.error("%s %s", "Error in getting archive sent to service container %s", err2, req.body.archive)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})


router.get("/service/status/", (req,res,next)=>{ // build workflow according to name and index
	try {
		let data = []	
		for ( const [key, service ] of Object.entries(store.services)){
			data.push(
				{
					installed: service.status.fully_installed,
					status: service.status.exists,
					name: service.name,
					dependencies: service.dependencies
				}
			) 
		}
		res.status(200).json({status: 200, message: "retrieved status(es) for services", data: data });
	} catch(err2){ 
		logger.error("%s %s", "Error in getting service status(es)", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})
router.post("/service/save/file", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let basename = store.system.shared.services
			let filename = path.basename(req.body.source)
			let response = await copyFile(req.body.source, path.join(basename, filename))
			let st = await readFile(path.join(basename, filename))
			let parsed = YAML.parse(st)
			for (let [ key, value ] of Object.entries(parsed)){
				value.custom = true
				let re = define_service(key, value)
				re.setOptions()				
				store.services[key] = re
			} 
			logger.info("Service(s) copied", response)
			res.status(200).json({status: 200, message: `Completed run  service copy`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in copying service", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying service", err2)
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
						module.version = 'custom-'+d
					}
					let basename = module.name + "_"+ module.version
					let endpath = path.join(store.system.shared.modules, basename+".yml")
					module.path = endpath
					let modl = create_module(module)
					store.config.modules.push(module)
					store.modules[module.name].variants.push(modl)
					let response = YAML.stringify([module])
					promises.push(writeFile(endpath, response))
				})
				await Promise.all(promises)
			} else {
				parsed.custom = true
				if (!parsed.version){
					let d = dateFormat.asString('dd_mm_yy_hh:mm:ss', new Date()); 
					parsed.version = 'custom-' + d
				}
				let basename = parsed.name + "_"+ parsed.version
				let endpath = path.join(store.system.shared.modules, basename+".yml")
				parsed.path = endpath
				let modl = create_module(parsed)
				store.config.modules.push(parsed)
				store.modules[module.name].variants.push(modl)
				let response = YAML.stringify([parsed])
				await writeFile(endpath, response)
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
						module.version = 'custom-' + d
					}
					let modl = create_module(module)
					let basename = module.name + "_"+ module.version
					let endpath = path.join(store.system.shared.modules, basename+".yml")
					module.path = endpath
					store.config.modules.push(module)
					store.modules[module.name].variants.push(modl)
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
				store.modules[module.name].variants.push(modl)
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
router.post("/procedure/save/text", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let response = req.body.source
			let parsed;
			let type = req.body.type
			if (type == 'YAML'){
				parsed = YAML.parse(response)
			} else if (type == 'JSON'){
				parsed = JSON.parse(response) 
			} else {
				parsed = req.body.source
				response = YAML.stringify(response)
			}
			let keys = Object.keys(parsed)
			let basename = keys[0] 
			let endpath = path.join(store.system.shared.procedures, basename+".yml")
			await writeFile(endpath, response)
			for (let [ key, value ] of Object.entries(parsed)){
				value.custom = true
				let re = await define_procedure(key, value)
				store.procedures[key] = re
			} 
			logger.info("%o \n procedure copied", YAML.stringify(response))
			res.status(200).json({status: 200, message: `Completed run save text to YAML`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in copying procedure", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying procedure", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
})

router.post("/service/save/text", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let response = req.body.source
			let parsed;
			let type = req.body.type
			if (type == 'YAML'){
				parsed = YAML.parse(response)
			} else if (type == 'JSON'){
				parsed = JSON.parse(response)
			} else {
				parsed = req.body.source
				response = YAML.stringify(response)
			}
			let keys = Object.keys(parsed)
			let basename = keys[0] 
			await writeFile(path.join(store.system.shared.services, basename+".yml"), response)
			for (let [ key, value ] of Object.entries(parsed)){
				let re = define_service(key, value)
				re.setOptions()				
				store.services[key] = re
			} 
			logger.info("%o \n service copied", YAML.stringify(response))
			res.status(200).json({status: 200, message: `Completed run save text to YAML`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in copying service", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying service", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
})

 
router.get("/procedures/external/fetch", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			downloadSource(
				"http://github.com/jhuapl-bio/Basestack/tarball/systems",  
				"/Users/merribb1/Desktop/tmp/systems.tgz"
			).then((response)=>{
				response.on("close", ()=>{
					console.log("close")
					decompress_file(
						"/Users/merribb1/Desktop/tmp/systems.tgz", 
						"/Users/merribb1/Desktop/tmp"
					).catch((err)=>{
						store.logger.error(err)
						res.status(419).send({status: 419, message: error_alert(err)});
					}).then((response)=>{
						res.status(200).json({status: 200, message: `Completed procedure fetch from external GH`, data: response });
					})
				}) 
					
			}).catch((err)=>{
				store.logger.error(err)
				res.status(419).send({status: 419, message: error_alert(err)});
			})
			
		} catch(err2){
			logger.error("%s %s", "Error in grabbing procedures", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in grabbing procedures", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
})



router.post("/procedure/save/file", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let basename = store.system.shared.procedures
			let filename = path.basename(req.body.source)
			let response = await copyFile(req.body.source, path.join(basename, filename))
			let st = await readFile(path.join(basename, filename))
			let parsed = YAML.parse(st)
			for (let [ key, value ] of Object.entries(parsed)){
				let re = await define_procedure(key, value)
				value.custom = true
				re.params.path = path.join(basename, filename)
				store.procedures[key] = re
			} 
			logger.info("Procedure(s) copied", response)
			res.status(200).json({status: 200, message: `Completed procedure copy`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in copying proceure", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in copying procedure", err2)
		res.status(419).send({status: 419, message: error_alert(err2)}); 
	})
})
router.post("/variable/read", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let response;
			let value = req.body.value
			let variable = req.body.variable
			let variables = req.body.variables
			let sep = variable.sep
			let header = variable.header
			variable.source = value 
			value = mapTargetConfiguration( { value: value }   , { variables: variables } )
			let content
			try{
				 content = await readTableFile(value.value, (!sep  ? "tab" : sep), header)	
			} catch(err){
				logger.error("end", err) 
				res.status(419).send({status: 419, data: [], message: error_alert(err)});
			}
			// logger.info("%o variable found %s", content, variable)
			res.status(200).json({status: 200, message: `Completed search for variable values`, data: content });
		} catch(err2){
			logger.error("end", err2) 
			logger.error( "failed search for variable values")
			res.status(419).send({status: 419, data: [], message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Completed search for variable values", err2)
		res.status(419).send({status: 419, data: [], message: error_alert(err2)});
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
router.post("/module/custom/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){  
		try { 
			let response;
			let module = store.modules[req.body.module].variants[req.body.variant];
			if (module.config.custom){
				let path_to_procedure = module.config.path
				await removeFile(path_to_procedure)
				let removed  = store.modules[req.body.module].variants.splice(req.body.variant, 1)
			}
			logger.info("%o removing module complete", response)
			res.status(200).json({status: 200, message: `Completed module removal: ${module.name}`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in removing module", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})().catch((err2)=>{ 
		logger.error("%s %s", "Error in removing module", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})
router.post("/service/custom/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let response;
			let service  = store.services[req.body.service];
			if (service.config.custom){
				let path_to_procedure = service.config.path
				await removeFile(path_to_procedure)
				delete store.services[req.body.service];
			}
			logger.info("%o removing service complete", response)
			res.status(200).json({status: 200, message: `Completed service removal: ${req.body.service}`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in removing service", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})().catch((err2)=>{ 
		logger.error("%s %s", "Error in removing procedure", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	})
})
router.post("/procedure/custom/remove", (req,res,next)=>{ // build workflow according to name and index
	(async function(){ 
		try {
			let response;
			let procedure  = store.procedures[req.body.procedure];
			if (procedure.params.custom){
				let path_to_procedure = procedure.params.path
				await removeFile(path_to_procedure)
				delete store.procedures[req.body.procedure];
			}
			logger.info("%o removing procedure complete", response)
			res.status(200).json({status: 200, message: `Completed procedure removal: ${procedure.params.title}`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in removing procedure", err2)
			res.status(419).send({status: 419, message: error_alert(err2)}); 
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in removing procedure", err2)
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

router.post("/orchestrator/run", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let workflow = store.system.orchestrators.dind.workflow
			let orchestrator = store.dind
			if (req.body.ports){
				orchestrator
			}
			let response = await orchestrator.init()
			let response2 = await orchestrator.check_then_start(null, null)
			logger.info("%o response sent for running", {})
			res.status(200).json({status: 200, message: "Completed orchestrator startup", data: response });
		} catch(err2){
			logger.error("%s %o", "Error in running workflow", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})


router.post("/target/set", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let target = req.body.target
			let index = req.body.index
			let id = req.body.id
			if (target == 'services'){
				let obj = create_service(id, store.stored_config[target][id][index])
				store.services[id] = obj
			} else if (target == 'procedures'){

				let returned = await create_procedure([ store.stored_config[target][id][index] ])
				if (returned){
					returned.forEach((value)=>{ 
						store.procedures[value.name]= value
					})
				}

			} else if (target == 'modules'){
				let obj = create_module(id,  store.stored_config[target][id][index])
				store.modules[id] = obj
			}
			res.status(200).json({status: 200, message: `Completed ${target} initiation`, data: '' });
		} catch(err2){
			logger.error("%s %o", "Error in running service setup", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

router.post("/remote/save/modules", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let remote_module = store.remotes[req.body.catalog][req.body.module]
			
			let version = ""
			if (remote_module.version){
				version  = remote_module.version
			}
			let basename = `${remote_module.name}_${version}.yml`

			let savePath = path.join(store.system.remotes.modules, basename)
			await writeFile(savePath, YAML.stringify([remote_module]))
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
			let remote_module = store.remotes[req.body.catalog][req.body.module]
			console.log(remote_module)
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
			let data = await fetch_external_config(req.params.target)
			// set_stored(req.params.target, data)
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


router.post("/service/cache", (req,res,next)=>{ // build workflow according to name and index
	
	try {
		let name = req.body.service
		let variables = req.body.variables
		let token = req.body.token
		let service = store.services[name]
		let response = cacheParams(token, {
			src: 'services.variables',
			value: req.body.variables,
			config: service.config
		})
		res.status(200).json({status: 200, message: "Completed caching of service variables", data: response });
	} catch(err2){
		logger.error("%s %s", "Error in caching variables", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
	
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
router.post("/workflow/stop", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let orchestrator = store.modules[req.body.module].workflows[req.body.workflow].services[req.body.service]
			let response = await orchestrator.stop()
			logger.info(`${response}`)
			res.status(200).json({status: 200, message: "Completed workflow stop", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in stopping workflow", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.post("/orchestrator/stop", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let orchestrator = store.dind
			let response = await orchestrator.stop()
			logger.info(`${response}`)
			res.status(200).json({status: 200, message: "Completed orchestrator stop", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in stopping orchestrator", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})

router.post("/workflow/:module/upload", upload.single('file'), (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let orchestrator = store.modules[req.params.module]
			logger.info(`uploading file for: ${req.params.module}. Data: ${req.file.originalname} to ${store.system.dataPath}/uploads/${req.file.filename}`)
			res.status(200).json({status: 200, message: "Completed workflow stop", data: "Uploading file..."});
		} catch(err2){
			logger.error("%s %s", "Error in stopping workflow", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.get("/orchestrator/:name/:service", (req,res,next)=>{ 
	try {
		let orchestrator = store.modules[req.params.name].services[req.params.service]
		logger.info(orchestrator)
		res.status(200).json({status: 200, message: "Returning meta", 
			data: {
				name: orchestrator.name,
				command: orchestrator.command,
				service: orchestrator.service,
				status: orchestrator.status
			}
		});
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})

router.get("/workflows/status", (req,res,next)=>{ 
	try {
		let modules = store.modules
		let running = [];
		modules.forEach((module)=>{
			module.workflows.forEach((workflow)=>{
				let service = workflow.service
				workflow.services.forEach((service)=>{
					running.push(
						{
							name: service.name,
							status: service.service.status,
							dependencies: service.service.dependencies
						}
					)
				})
					
			})
			
		})
		res.status(200).json({status: 200, message: "Returning running orchestrated services", 
			data: running
		});
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})
router.get("/service/status/:service", (req,res,next)=>{ 
	try {
		let service = store.services[req.params.service]
		let running = service.status
		
		res.status(200).json({status: 200, message: "Returning running service status", 
			data: running
		});
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})

router.post("/service/status", (req,res,next)=>{ 
	try {
		( async ()=>{
			let service = store.services[req.body.service]
			let variables = req.body.variables
			let outputs = req.body.outputs
			let watches = await service.getProgress(req.body, req.body.outputs)
			let running = service.status
			// console.log(service.status)
			// console.log(
			// 	{
			// 		watches: watches,
			// 		variables: variables,
			// 		... service.status
			// 	}


			// )
			res.status(200).json({status: 200, message: "Returning running service status with params sent", 
				data: {
					watches: watches,
					variables: variables,
					status: service.status
				}
			});
		})().catch((err3)=>{
			logger.error("%o error in getting progress", err3)
			res.status(419).send({status: 419, message: error_alert(err3) });	
		})
			
	} catch(err3){
		logger.error("%o error in getting progress", err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})



router.post("/workflow/status/batch", (req,res,next)=>{ 
	try {
		let services = req.body
		let statuses = []
		let installed = []
		services.forEach((service)=>{
			let module = store.modules[service[0]]
			let workflow = module.workflows[service[1]]
			let orchestratorService = workflow.services[service[2]]
			let running = orchestratorService.service.status
			running.name = orchestratorService.name
			running.label = orchestratorService.service.label
			running.module= module.title
			statuses.push(running)
		})
		res.status(200).json({status: 200, message: "Returning running orchestrated services", 
			statuses: statuses,
			installed: installed
		});
	} catch(err3){
		logger.error(err3)
		res.status(419).send({status: 419, message: error_alert(err3) });
	}	
})
router.post("/service/progress", (req,res,next)=>{ 
	(async function(){
		try {
			let service = store.modules[req.body.module].workflows[req.body.workflow].services[req.body.service]
			let orchestrator  = service
			let response = await service.checkProgress(req.body.variables)
			res.status(200).json({status: 200, message: "Returning running orchestrated services", 
				data: response
			});
		} catch(err3){
			logger.error(err3)
			res.status(419).send({status: 419, message: error_alert(err3) });
		}
	})()	
})


router.post("/install/imagesOffline", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			
				let response = await install_images_offline(req.body)
				logger.info(`Success in beginning to load image: ${req.body.name}`)
				res.status(200).json({status: 200, message: "Completed docker offline load", data: null });			
			
		} catch(err2){
			logger.error("%s %s", "Error in loading images", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})



router.post("/install/imagesOnline", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	(async function(){
		try {
			let response = await install_images_online(req.body)
			logger.info(`Success in beginning to load image: ${req.body.name}`)
			res.status(200).json({status: 200, message: "Completed docker online load", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
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
router.post("/procedure/build/cancel/dependency", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	
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
router.post("/images/pull", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() { 
		try {
			await pullImage(req.body.name).then((response)=>{
				logger.info("Success in pull image")
					res.status(200).json({status: 200, message: "Completed pull of image", data: ""});
				}).catch((err)=>{
					logger.error("%s %s", "Error in pulling image: ", err)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			
		} catch(err2){
			logger.error("%s %s", "Error in pulling images", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})
 
router.post("/images/remove", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {
			await remove_images(req.body.name).then((response)=>{
				logger.info("Success in removing images")
					res.status(200).json({status: 200, message: "Completed removal of images", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in removing images: ", err)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			
		} catch(err2){
			logger.error("%s %s", "Error in removing images", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})
router.post("/validate/validateRunDirContents", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {
			
			await validate_run_dir(req.body).then((response)=>{
				logger.info("Success in validating run directory")
					res.status(200).json({status: 200, message: "Completed validation of run dir", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in validating: ", err.message)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			
			
		} catch(err2){
			logger.error("%s %s", "Error in validating", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})
router.post("/selections/add", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {
			await add_selections(req.body).then((response)=>{
				logger.info("Success in adding field")
					res.status(200).json({status: 200, message: "Completed addition of field for module", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in adding field: ", err.message)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			
			
		} catch(err2){
			logger.error("%s %s", "Error in adding field", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})
router.post("/selections/rm", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {
			await rm_selections(req.body).then((response)=>{
				logger.info("Success in removal of field %j", response)
					res.status(200).json({status: 200, message: "Completed removal of field for module", data: response });
				}).catch((err)=>{
					logger.error("%s %s", "Error in adding field: ", err.message)
					res.status(419).send({status: 419, message: "There was an error; " + err.message});
				})			
		} catch(err2){
			logger.error("%s %s", "Error in removing field", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})

router.get("/test", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {			
			res.status(200).json({status: 200, message: "Completed Test"});
		} catch(err2){
			logger.error("%s %s", "Error in removing field", err2)
			res.status(419).send({status: 419, message: error_alert(err2) });
		}	
	})().catch((err)=>{})
})


export default router