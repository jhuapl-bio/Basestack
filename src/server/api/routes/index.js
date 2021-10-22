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
var { store } = require("../../config/store/index.js")
var { error_alert } = require("../controllers/logger.js")
const logger = store.logger
import upload from "../controllers/upload.js"

//Import Validation Scripting
const { validate_run_dir } = require("../controllers/validate.js")

// Import cusotm modules and functions
const { 
	remove_images, 
	prune_images, 
	install_images_offline, 
	install_images_online, 
	cancel_load_images } = require("../controllers/post-installation.js")
// const {	init_container_logs } = require("../controllers/dockerLogs.js")
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
	getMeta,
	getDockerStatus,
	getServerStatus,
	fetch_external_dockers
	} = require("../controllers/fetch.js")

const { 
	readFile 
} = require("../controllers/IO.js")

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
router.get("/server/status/fetch", (req,res,next)=>{
	try {
		logger.info("Getting server run status")
		getMeta().then((response)=>{
			logger.info(`getting  server run status... ${response}`)
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
router.get("/docker/status/fetch", (req,res,next)=>{
	try {
		logger.info("docker status")
		getMeta().then((response)=>{
			logger.info(`getting docker status... ${response}`)
			res.status(200).json({status: 200, data: response, message: "Docker is running" });
		}).catch((err)=>{
			logger.error(`Error in Docker Status Fetch ${err}`)
			res.status(419).send({status: 419, message: error_alert(err) });
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
			console.log("tags");
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
		console.log(req.body)
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
			console.log(req.body)
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
			console.log(workflow)
			let response = await workflow.build([0], true)
			logger.info(`Success in beginning to build workflow orchestrator: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed workflow build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.post("/workflow/build", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let workflow = store.modules[req.body.module].workflows[req.body.workflow]
			let response = await workflow.build(req.body.dependencies, true)
			logger.info(`Success in beginning to build workflow: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed workflow build", data: response });
		} catch(err2){
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.get("/workflow/build/status", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let orchestrator = store.modules[req.body.module].workflows[req.body.workflow].services[req.body.service]
			let response = orchestrator.service.dependencies
			logger.info(`Success in beginning to build workflow: ${req.body.module}`)
			res.status(200).json({status: 200, message: "Completed workflow build", data: response });
		} catch(err2){ 
			logger.error("%s %s", "Error in loading images2", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})()
})
router.get("/defaults/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		logger.info("getting BASE modules")
		res.status(200).json({status: 200, message: "retrieved module information", data: store.default    });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})

router.get("/modules/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules = store.modules
		let data = []
		
		modules.forEach((module)=>{ 
			let returnable = {workflows: []}

			Object.keys(module).map((m)=>{ if( m !== 'workflows' && module[m] ){ returnable[m] = module[m]  }   })
			let staged_workflows = []
			module.workflows.forEach((workflow , index)=>{
				let staged_services = []
				workflow.services.forEach((service)=>{
					staged_services.push(
						{
							status: service.service.status.running,
							variables: service.service.variables,
							progress: service.service.progress,
							service: service.name,
							label: ( service.service.label ? service.service.label : service.name )
						}
					) 
				})
				returnable.workflows.push({
					name: workflow.name,
					dependencies: workflow.dependencies, 
					services: staged_services
				})
			})
			// data.push(...staged_workflows)
			data.push(returnable)

		})
		res.status(200).json({status: 200, message: "retrieved module information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})



router.get("/modules/get/status", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules = store.modules
		let data = []		
		modules.forEach((module)=>{ 
			let returnable = {name: module.name, workflows: []}
			let staged_workflows = []
			module.workflows.forEach((workflow, index)=>{
				let staged_services = []
				workflow.services.forEach((service)=>{
					staged_services.push(
						{
							status: service.service.status.running,
						}
					) 
				})
				returnable.workflows.push({
					name: workflow.name,
					services: staged_services
				})
			})
			// data.push(...staged_workflows)
			data.push(returnable)
		})
		res.status(200).json({status: 200, message: "retrieved module specifics information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})



router.get("/modules/get", (req,res,next)=>{ // build workflow according to name and index
	try {
		let modules = store.modules
		let data = []		
		modules.forEach((module)=>{ 
			let returnable = {name: module.name, workflows: []}
			let staged_workflows = []
			module.workflows.forEach((workflow, index)=>{
				let staged_services = []
				workflow.services.forEach((service)=>{
					staged_services.push(
						{
							cmd: service.service.command,
							variables: service.service.variables
						}
					) 
				})
				returnable.workflows.push({
					name: workflow.name,
					services: staged_services
				})
			})
			// data.push(...staged_workflows)
			data.push(returnable)
		})
		res.status(200).json({status: 200, message: "retrieved module specifics information", data: data });
	} catch(err2){
		logger.error("%s %s", "Error in loading images2", err2)
		res.status(419).send({status: 419, message: error_alert(err2)});
	}	
})


router.post("/workflow/run", (req,res,next)=>{ // build workflow according to name and index
	(async function(){
		try {
			let orchestrator = store.modules[req.body.module].workflows[req.body.workflow].services[req.body.service]
			let variables = orchestrator.updateVariables(req.body.variables)
			let response = await orchestrator.check_then_start(variables)
			logger.info("%o workflow sent for running", response)
			res.status(200).json({status: 200, message: `Completed ${orchestrator.name} run start`, data: response });
		} catch(err2){
			logger.error("%s %s", "Error in running workflow", err2)
			res.status(419).send({status: 419, message: error_alert(err2)});
		}	
	})().catch((err2)=>{
		logger.error("%s %s", "Error in running workflow", err2)
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
			let response2 = await orchestrator.check_then_start()
			logger.info("%o response sent for running", {})
			res.status(200).json({status: 200, message: "Completed orchestrator startup", data: response });
		} catch(err2){
			logger.error("%s %o", "Error in running workflow", err2)
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
router.get("/workflow/status/:module/:workflow/:service", (req,res,next)=>{ 
	try {
		let service = store.modules[req.params.module].workflows[req.params.workflow].services[req.params.service]
		let running = service.service.status
		res.status(200).json({status: 200, message: "Returning running orchestrated services", 
			data: running
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
router.post("/install/cancelInstallImage", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	try {
		const imageName = req.body.imageName
		let message = ""
		if (imageName in  store.meta.Images && store.status.images[imageName].running){
			(async ()=>{
				await cancel_load_images(imageName)
			})().then(()=>{
				res.status(200).json({status: 200, message: "Completely canceled the docker image load process", data:  imageName });
			}).catch((error)=>{
				res.status(419).json({status: 419, message: error_alert(error) });				
			})
		} else{
			res.status(419).send({status: 419, message: "No installation occuring for this image", data:[] });
		}
	} catch(err2){
		logger.error("%s %s", "Error in canceling images installs", err2)
		res.status(419).send({status: 419, message: error_alert(err2) });
	}	
})
router.post("/install/pruneImages", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
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
router.post("/install/removeImages", (req,res,next)=>{ //this method needs to be reworked for filesystem watcher
	( async function() {
		try {
			await remove_images(req.body.imageName).then((response)=>{
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