/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */

/* eslint-disable no-inner-declarations */

// const docker = require("./docker.js")
import Docker from 'dockerode';
import  path  from "path"
var  { store }  = require("../store/global.js")
var { logger } = require("./logger.js")
var { initDockerLogs, attachStream } = require("./dockerLogs.js")
const { checkFileExist, checkFolderExistsReject, reformatResponseVideo, checkFolderExists, checkFolderExistsAccept,  validateVideo, validateAnnotation, validateHistory, validateProtocol, validatePrimerVersions }  = require("./validate.js")
const { getPrimerDirsVersions, fetch_protocols, fetch_primers, fetch_videos, fetch_modules } = require("./fetch.js")
const { writeFolder, writeFile, ammendJSON, readFile } = require("./IO.js")
const fs  = require("fs")
const fs_promise = require("fs").promises
const containerNames = ['rampart','basestack_consensus', 'basestack_tutorial']
const moment = require('moment');
const { DockerObj } = require("../modules/docker.js")

const { Tutorial } = require("../modules/tutorial")
const { BasestackConsensus } = require('../modules/consensus')
const { RAMPART } = require('../modules/rampart')
import  docker  from "./docker.js"

export async function initialize(params){
	// logger.info("%s <------ initialize", store.meta)
	try{
		// let re = await setup_data()''


		let userMeta = path.join(store.meta.writePath, "meta.json")
		let metaExists = await checkFileExist(store.meta.writePath, "meta.json", true)
		if (!metaExists){
			let metaContent = {
				modules: {},
				images: {}
			};
			await writeFile(userMeta, JSON.stringify(metaContent, null, 4))
		} 
		let response = await fetch_modules()
		let meta = await readFile(path.join(store.meta.writePath, "meta.json"))
		meta = JSON.parse(meta)
		for (const [key, image] of Object.entries(store.config.images)){
			if (!meta.images[key]){
				await ammendJSON({
					value: {resources: null},
					file: userMeta,
					attribute: "images."+key
				}).catch((err)=>{
					logger.error(err)
					throw err
				})
			} 
			else {
				if (image.installation.resources){
					for (const [key2, value2 ] of Object.entries(image.installation.resources)){
						if (store.config.images[key].installation.resources[key2] && meta.images[key].resources){
							store.config.images[key].installation.resources[key2].srcFormat = meta.images[key].resources[key2]
						}
					}
				}
				
			}
		}
		for (const [key, value] of Object.entries(response.modules.entries)){
			if (value.module){
				if (!meta.modules[key]){
					meta.modules[key] = {}
				}
				const container_name = value.name 
				let folderExists = await checkFileExist(path.join(store.meta.writePath, container_name), true)
				if (!folderExists){
					await writeFolder(path.join(store.meta.writePath, container_name))
				}
				let obj = await initialize_module_object(container_name)
				if (value.config.initial && response.images.entries[value.image].installed){
					let response = await obj.cancel()
					let response_start = await start_module({module: container_name, tag: "latest"})
				}
			}	
		}
		await ammendJSON({
			value: meta.modules,
			file: path.join(store.meta.writePath, "meta.json"),
			attribute: "modules"
		}).catch((err)=>{
			logger.error(err)
			throw err
		})
		
		return response
	} catch(err){
		logger.error(`Error in initializing the app with modules, ${err}, function: initialize()`)
		throw err
	}
}


async function initialize_module_object(container_name){
	let obj;
	if (container_name == 'rampart'){
		obj  = new DockerObj('jhuaplbio/artic', 'rampart', new RAMPART());
	} else if (container_name == 'basestack_tutorial'){
		obj = new DockerObj('basestack_tutorial', 'basestack_tutorial', new Tutorial());
	} else if (container_name == 'basestack_consensus'){
		obj  = new DockerObj('jhuaplbio/artic', 'basestack_consensus', new BasestackConsensus());
	} 

	obj.config = store.config.modules[container_name]
	store.modules[container_name]  = obj
	store.statusIntervals.modules[container_name] = null
	try{
		let response = await obj.watch()
		return obj
	} catch(err){
		logger.error(`Error in initializing module object ${err}, function: initialize_module_object() `)
		throw err
	}
}

export async function start_module(params){
	let container_name;
	try{
		container_name = params.module
		let obj; 
		if (store.modules[container_name]){
			obj = store.modules[container_name]
		} else {
			obj = await initialize_module_object(container_name)
		}
		let response = await obj.start(params)
		store.modules[container_name] = obj;
		return response
			
		
	} catch(err){
		logger.error(`${container_name}: couldn't start the necessary module, function: start_module(), check error -> ${err}`)
		store.config.modules[container_name].errors = err
		throw err
	}
		
}

export async function cancel_container(params){
	let obj = store.modules[params.module]
	if (!obj || !obj.status.running){
		if (!params.silent){
			throw new Error(`Pipeline: ${params.module} with that name doesn't exist`)
		}
	} else {
		try{
			let response = await obj.cancel()
			return response
		} catch(err){
			logger.error(`${err}, function: cancel_container()`)
			throw err
		}
	}
}

