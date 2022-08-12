/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const fs = require("fs")
const { convert_custom, checkFileExist,  checkFolderExists, validateAnnotation, validateHistory, validateProtocol, validatePrimerVersions }  = require("./validate.js")
import  path  from "path"
const { bytesToSize } = require("./configurations.js")
const { create_module } = require("./init.js")
const { store }  = require("../../config/store/index.js")
var  logger  = store.logger
const { getFiles, readFile,  writeFile, writeFolder } = require("./IO.js")
const si = require('systeminformation');
const { spawn } = require("child_process")
const axios = require("axios")
const YAML = require("js-yaml") 
const { parseConfigVariables } = require("../../../shared/definitions.js")

export async function validatePrimerDir(fullpath, item, primerNameDir, fullpathVersion){
	return new Promise((resolve, reject)=>{
		let message = {}
		fs.lstat(fullpath, (err2, stats) => {
	    	if (err2){
	    		console.error(err2)
	    		reject()
	    	} else{ 
	    		if (!stats.isFile()){
	    			(async ()=>{
						let validVersion = await validatePrimerVersions(fullpath, primerNameDir,fullpathVersion)
						if(validVersion){
							resolve(item)
						} else{
							resolve(false)
						}
	    			})().catch((err3)=>{console.error(err3); resolve(false)})
	    		}
	    	}
	    })
	})
}


export async function getPrimerDirsVersions(filepath, primerNameDir){
	return new Promise((resolve, reject)=>{
		let valid_dirs = []
		fs.readdir(filepath, (err, items)=>{
			if(err){
				logger.error(err)
				reject(err)
			} else {
				let promises = []
				let items_filtered  = [];
				(async ()=>{
					for (let i = 0; i < items.length; i++){
						const item = items[i]
						const fullpathVersion = path.join(filepath, item)
						let item_filtered = await validatePrimerDir(filepath, item, primerNameDir, fullpathVersion).then((d)=>{
							if (d){
								const ret_item = {fullpath: fullpathVersion, name: primerNameDir, fullname: path.join(primerNameDir, item), type: 'select'}
								items_filtered.push(ret_item)					
							}
						}).catch((err2)=>{
							console.error(err2)
						})					
					}
				})().then(()=>{
					resolve(items_filtered)
				})
			}
		})
	})
}
export async function fetch_protocols(){
	const server_config = store.config.modules['rampart']['config']
	let protocolFiles = await getFiles(server_config.protocolDir)
	let response = []
	for (let i = 0; i < protocolFiles.length; i++){
		const fullpathProtocol = path.join(server_config.protocolDir, protocolFiles[i])
		let validProtocol = await validateProtocol(fullpathProtocol,protocolFiles[i])
		if(validProtocol){
			response.push({
				srcPath:fullpathProtocol, 
				relativePath:null,  
				fullname: protocolFiles[i], 
				type: 'select'
			})
		}
	}
	return response
}
export async function fetch_annotations(){
	const server_config = store.config.modules['rampart']['config']
	let annotationDirs = await getFiles(server_config.annotationsPath)
	let response = []
	for (let i = 0; i < annotationDirs.length; i++){
		const fullpathAnnotation = path.join(server_config.annotationsPath, annotationDirs[i])
		let validAnnotation = await validateAnnotation(fullpathAnnotation,annotationDirs[i])
		if(validAnnotation){
			const content = await readFile(path.join(fullpathAnnotation, "report-meta.json"), false)
			response.push(JSON.parse(content))
		}
	}
	return response
}
export async function fetch_primers(){
	const server_config = store.config.modules['rampart']['config']
	let primerFiles = await getFiles(server_config.primerDir)
	let validated_files  = []
	let response = []
	for (let i = 0; i < primerFiles.length; i++){
		const fullpathPrimerVersions = path.join(server_config.primerDir, primerFiles[i])
		await getPrimerDirsVersions(fullpathPrimerVersions,primerFiles[i])
		.then((versions, error)=>{
			if (error){
				console.error(error)
			}
			if (versions){
				for (let j = 0; j < versions.length; j++){
					response.push(versions[j])
				}
			}

		})
		.catch((err)=>{
			console.error(err)
		})
	}
	return response
}    
export async function fetch_videos_meta(){ 
	const server_config  = store.config.modules['basestack_tutorial'].config
	let videoMeta = await checkFileExist(server_config.basePath, "system.json")
	let userMeta = await readFile(store.system.userMeta) 
	userMeta = JSON.parse(userMeta).modules.basestack_tutorial  
    
	let meta={};   
	let srcMetaString =  await readFile(server_config.meta)			
	let srcMeta  = JSON.parse(srcMetaString)  
	const base = server_config.base +":" + server_config.port
	const videoAddress  = base + "/" + server_config.mp4
	const resourceAddress = base + "/" + server_config.material 
	if(!videoMeta){
		await writeFolder(server_config.basePath)
		videoMeta = true 
		meta = srcMeta 
	} else { 
		//the video file already exists, store the older, user defined meta file to compare to new resources one
		let string = await readFile(server_config.meta)		 
		meta = (JSON.parse(string))     
		const keys = Object.keys(meta)    
		for(let i = 0; i < keys.length; i++){ 
			const key = keys[i]
			if(srcMeta[key]){
				const sections = meta[key].sections
				for(let j =0; j < sections.length; j++){
					const section = sections[j]
					if (userMeta && userMeta.bookmark && userMeta.bookmark[section.key]){
						userMeta.bookmark[section.key].forEach((chapter)=>{
							srcMeta[key].sections[j].chapters.push(chapter)
						})
					}
					srcMeta[key].sections[j].chapters = srcMeta[key].sections[j].chapters.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
				}
				
			}
		}
		meta  = srcMeta
	}
	const keys = Object.keys(meta)
	for (let i = 0; i < keys.length; i++){
		const key = keys[i]
		const sections = meta[key].sections
		for(let j = 0; j < sections.length; j++){
			const section =  sections[j];  
			meta[key].sections[j].fullpath = videoAddress +"/"+section.video
			if (section.script){ 
				meta[key].sections[j].script =  resourceAddress + "/" +section.script
			}  
			if (section.pptx){ 
				meta[key].sections[j].pptx = resourceAddress + "/" +section.pptx
			}   
			if (section.pdf){
				meta[key].sections[j].pdf = resourceAddress + "/" +section.pdf	
			}
		}
	} 
		 
	return meta
	
} 

export function save_remote_module(config){
	try{
		let version = 0
		if (config.version){ 
			version  = config.version
		}
		let basename = `${config.name}_${version}.yml`

		let savePath = path.join(store.system.remotes.modules, basename) 
		config.path = savePath 
		config.version = version
		config.remote = true
		config.local = false
		config.custom = false
		let parsed_item = parseConfigVariables(JSON.stringify(config), store.system)
		let modl = create_module(parsed_item)
		modl.version = config.version
		modl.remote = config.remote 
		modl.local = config.local
		modl.custom = config.custom
		store.library.catalog[config.name].modules.push(modl)
	} catch(err){
		store.logger.error(err) 
		return
	}
}

export async function fetch_external_config_target(key,catalog){
	try{
		let url = `https://basestack-support.herokuapp.com/db/get/${key}/${catalog}`
		logger.info("%s %s", "Getting url: ", url)
		let json =  await axios.get(`${url}`)
		logger.info("returned json: %s", url)
		try{
			json.data.data.map((d)=>{
				d.remote = true
				d.local = false
			})
			return json.data.data
		} catch(err){
			logger.error(`${err} error in fetching external url____________`)
			throw err
		}
		
	} catch(err){
		logger.error(`${err} error in fetching external url____________`)
		throw err
	} 
}
export  function fetch_external_config(key){
	return new Promise((resolve,reject)=>{
		let url = `https://basestack-support.herokuapp.com/db/get/${key}`
		logger.info("%s %s", "Getting url: ", url)
		axios.get(`${url}`).then((json)=>{
			logger.info("returned json: %s", url)
			json.data.data.map((d)=>{
				d.remote = true 
				d.local = false
			})
			resolve(json.data.data)
		}).catch((err)=>{
			logger.error("Error in fetching remote url modules %s", err)
			reject(err)
		})
		
	}) 
	
}


export async function getExternalSource(url){
	try{
		logger.info("%s %s", "Getting url: ", url)
		let json =  await axios.get(`${url}`) 
		logger.info("%s %o", "returned json: ", json.data)
		return json 
	} catch(err){ 
		logger.error(`${err} error in fetching external url`)
		throw err
	} 
} 
  
  
export async function getRemoteConfigurations(url){
	var clone = require("git-clone/promise");
	try{
		logger.info("%s %s", "Getting url: ", url)
		let json = await clone(url, "/Users/Desktop/tmp")
		logger.info("%s %o", "returned json: ", json.data)
		return json
	} catch(err){
		logger.error(`${err} error in fetching external url`)
		throw err  
	}  
}
 



export async function fetch_external_dockers(key){
	let url = `https://registry.hub.docker.com/v2/repositories/${key}/tags`
	try{
		key = key.split(":")[0]
		if (! store.images[key] ){
			store.images[key] = {
				fetching_available_images: {},
				latest_digest: {},
			}
		} 
		const element = store.images[key]
		store.images[key].fetching_available_images.errors = null
		store.images[key].fetching_available_images.status = true
		let json =  await axios.get(url)
		let latest = null; 
		let full_tags = json.data
		let full_names = []
		// latest = json.data
		if (full_tags && Array.isArray(full_tags.results))
		{
			full_tags.results.forEach((f)=>{
				if (f.name == "latest"){
					store.images[key].latest_digest = f.images[0].digest
				}
				full_names.push(f.name)

			})
		}
		store.images[key].all_tags = full_names
			
		return store.images[key]
	} catch(err){
		logger.error(`${err} error in fetching external dockers ${key}`)
		store.images[key].fetching_available_images.errors  = err
	} finally{
		// logger.info("Checked the presence of "+key)
		store.images[key].fetching_available_images.status = false
	}
}


async function check_image_promise(image){
	return new Promise((resolve, reject)=>{
		try{
			(async ()=>{
				let getImage = await store.docker.getImage(image).inspect()
				let latest;
				let tags=[];
				let digests = getImage.RepoDigests.map((d)=>{
					return d.replace(image+"@", "")
				})
				for (const tag of getImage.RepoTags) {
					if (tag.includes('latest')){
						if(digests){
							store.status.images[image].installed_digest = digests[0]
						}
					}
				}
				resolve({
					image: getImage,
					imageName: image,
					status: true
				})
				
			})().catch((error)=>{
				// console.error(error, "error in checking image exist")
				resolve({
					image: error,
					imageName: image,
					status: false
				})
			});
		} catch(err){
			logger.error("%s %s", err, " error in retrieving imageName: "+image)
			resolve({
				image: err,
				imageName: image,
				status: false
			})
		}
 
	})

}

export async function check_container(container_name){
	return new Promise(function(resolve,reject){
		(async ()=>{
			var container = await store.docker.getContainer(container_name);
			let err = null
			let complete = false
			let success = false
			let running = false
			let returnable = {
				complete: false,
				exists: false,
				running: false,  
				msg: null,
				container: {},
				success:false
			}
			await container.inspect((err,inspection)=>{ 
				try{
					if (err){ 
						// logger.error(`${err}, error in container finalization of exit code: ${container_name}`)
						// returnable.error  = err
						returnable.running = false
						returnable.success = false
						returnable.complete= true
					} else if (!inspection){
						returnable.complete= true
						returnable.container = inspection.Config
						returnable.running = false
					} else if (inspection.State.Status == 'exited') {
						returnable.exists = true
						returnable.container = inspection.Config
						if ( (inspection.State.ExitCode > 0 && inspection.State.ExitCode !== 127 ) || inspection.State.ExitCode == 1 ){
							// logger.info(`${container_name}, container finalized with exit code: ${inspection.State.ExitCode} ${inspection.State.Error}`)
							returnable.err  = `ERROR: exit code: ${inspection.State.ExitCode}; ${inspection.State.Error}. Check Logs!`
							if (inspection.State.OOMKilled){
								returnable.err += ', Killed by Memory Limit being reached'
								returnable.msg  = "Killed by Memory Limit"
							} 
							returnable.success = false
						} else {
							returnable.success = true
						}
						returnable.complete = true
						returnable.running = false
						returnable.exit_code = inspection.State.ExitCode
					} else {
						returnable.exists = true
						returnable.running = true
						returnable.complete = false
						returnable.container = inspection.Config
					} 
				} catch(err2){
					// logger.error("%o error in inspecting container on end", err2)
				} finally{
					if (returnable.container && returnable.container.Env && returnable.container.Env.length > 0){
						let newEnv = {}
						returnable.container.Env.forEach((f)=>{
							const split = f.split("=")
							newEnv[split[0]] = split[1]
						})
						returnable.container.env = newEnv
					}
					resolve(returnable)
				}
			})
		})().catch((error)=>{ 
			logger.error("%s error checking if docker exists", error)  
			resolve({container: null, running: false, exists: false})     
		})
       
	})
}



export async function listImages(dind){
	return new Promise((resolve, reject)=>{
		if (dind){
			store.dind.listImages().then((images)=>{
				console.log("images") 
				resolve(images)
 
			}) 
		} else {
			store.docker.listImages().then((images)=>{
				console.log("images")
				resolve(images)

			}) 
		}  
	})
}

export async function check_image(image){
	return new Promise((resolve, reject)=>{
		try{
			(async ()=>{
				let getImage = await store.docker.getImage(image).inspect()
				let latest; let installed;
				let tags=[];
				let digests = getImage.RepoDigests.map((d)=>{
					return d.replace(image+"@", "")
				}) 
				if (getImage.Size){
					getImage.Size = bytesToSize(getImage.Size)
				}
				for (const tag of getImage.RepoTags) {
						if(digests){
							installed = digests[0]
						}
					// }
				}
				resolve({
					size: (getImage.Size ? getImage.Size : 0),
					version: installed
				})
				
			})().catch((error)=>{ 
				// logger.error(`check image exists failed or doesn't exist %o`, error)
				reject(error)
			});
		} catch(err){
			logger.error("%s %s", err, " error  in retrieving docker image name: "+image)
			reject(err)
		}
	})
} 

export async function fetch_histories(){
	const historyPath = store.config.modules['basestack_consensus'].config.historyPath
	let exists = await checkFolderExists( historyPath)
	if (!exists){
		await writeFolder(historyPath)
	}
	let histories = await getFiles(historyPath)
	let validated_files  = []
	let response = []
	for (let i = 0; i < histories.length; i++){
		const fullpathHistory = path.join(historyPath, histories[i])

		let validHistory = await validateHistory(fullpathHistory,histories[i])
		if(validHistory){
			try{
				await readFile(path.join(fullpathHistory, "report-meta.json"), false).then(async (content, error)=>{
					if (error){
						logger.error(`${error}`)
					} else {
						let contentobj = JSON.parse(content)
						if (store.config.modules['basestack_consensus'] 
				    		&& store.config.modules['basestack_consensus'].streamObj 
				    		&& store.config.modules['basestack_consensus'].run.name == contentobj.name){
				    		contentobj.running = true
				    	} else {
				    		contentobj.running = false
				    	}
				    	contentobj.runDir.run_config.primers = convert_custom(contentobj.runDir.run_config.primers, 
				    		store.config.modules.basestack_consensus.resources.run_config.primers, 'name') 	
				    	contentobj.runDir.run_config.basecalling = convert_custom(contentobj.runDir.run_config.basecalling,
				    		store.config.modules.basestack_consensus.resources.run_config.basecalling, 'name') 
				    	contentobj.runDir.run_config.barcoding = convert_custom(contentobj.runDir.run_config.barcoding, 
				    		store.config.modules.basestack_consensus.resources.run_config.barcoding, 'name', 'arr') 	
						contentobj.fullpathHistory = fullpathHistory
						response.push(contentobj)
					}
					
				}) //This is a problem
			} catch(err){
				logger.error(`${err} <-- Couldn't read file`)
			}
		}
	} 
	return response
}
 
 
 

export async function fetch_resources(){
	try{
		let mem = await si.mem()
		let cpu = await si.cpu()
		let disk = await si.fsSize()
		let system = await si.system()
		let os  = await si.osInfo()
		return {cpu: cpu, mem: mem, disk: disk, system: system, os: os}
	} catch(err){ 
		logger.error(`${err} <-- error in fetching resources`)
		throw err
	}
}
export async function fetch_docker_stats(){
	try{
		let docker_info  = await store.docker.info()
		let docker = {
			KernelVersion: docker_info.KernelVersion,  
			Socket: store.docker.modem.socketPath,
			Driver: docker_info.Driver,
			ContainersRunning: docker_info.ContainersRunning,
			ServerVersion: docker_info.ServerVersion,
			DockerRootDir: docker_info.DockerRootDir,
			MemTotal: docker_info.MemTotal
		}
		
		return docker
	} catch(err){
		logger.error(`${err} <-- error in fetching docker version`)
		throw err
	}
}


export async function fetch_docker_version(){
	try{
		let response = await store.docker.version()
		return response
	} catch(err){
		logger.error(`${err} <-- error in fetching docker status via ping`)
		throw err
	}
}

export async function fetch_status(){
	let response = {
		docker : {
			installed: true, //placeholder for now
			running: false,
			version: null,
			stats: null,
			socket: ( store.docker  ?  store.docker.modem.socketPath : null),
			host: (process.env.DOCKER_HOST ? process.env.DOCKER_HOST : null),
			xdg_runtime_dir: (process.env.XDG_RUNTIME_DIR ? process.env.XDG_RUNTIME_DIR : null)
		},
		resources: null,
		status: null,
		meta: null
	}
	let dockers;
	let errors = [];

	// response.meta = store.meta

	// try{
	// 	let re = await fetch_modules()
	// 	response.status = re
	// } catch(err){
	// 	errors.push(err)
	// }
	try{
		let resources = await fetch_resources()
		response.resources = resources
	} catch(err){
		logger.error(err)
		errors.push(err)
	}
	

	try{
		let docker = await fetch_docker_version()
		response.docker.version = docker
		// response.docker.installed = true
	} catch(err){
		response.docker.version = null
		// response.docker.installed = true
		errors.push(err)
	}
	
	response.ready = store.system.ready
	// logger.info("%j %j", response.docker.running, response.docker.installed)
	return response
} 

export async function fetch_modules(){
	try{
		let errors = {
			images: [],
			modules:[]		
		}
	
		let completed = []
		// Begin by getting the installation status of all of the images
		// for (const [key, value] of Object.entries(store.meta.images)){
		// 	console.log(key, store.status.images)
		// 	if (!store.status.images[key].init){
		// 		await formatDockerLoads(key)
		// 		store.status.images[key].init = true
		// 	}
		// 	// store.status.images[key].stream = ['Done', 'Done', 'Done', "done"]
		// 	if (store.status.images[key].complete && store.status.images[key].installed){
		// 		completed.push(value.title)
				
		// 	}
		// }
		// for (const [key, value] of Object.entries(store.meta.modules)){
		// 	if (value.module){
				
		// 	}
		// }
		return {
			errors: errors,
			status: store.status
		}
	} catch(err){
		console.error(err, "error in fetching modules status")
		throw err
	}
}



async function formatDockerLoads(image){
	try{
		const system = store.system
		let config = store.meta
		
		// let config = await readFile(path.join(system.resourcePath, "meta.json"), false);
		// config = config.replace(/\$\{writePath\}/g, system.writePath)
		// config = config.replace(/\$\{resourcePath\}/g, system.resourcePath)
		// config = config.replace(/\\/g, "/")
		// config = JSON.parse(config, 'utf-8')
		// store.config.images = config.images
		// store.config.modules = config.modules
		
		const element = store.meta.images[image]
		store.status.images[image] = {
			pause: false,
			stream: [],
			changed: false, 
			running:false,
			complete: false,
			errors : null,
			installed: false,
			inspect: null,
			interval: null,
			fetching_available_images: {
				status: false,
				errors: false
			}
		}
		if (store.statusIntervals.images[image]){
			clearInterval(store.statusIntervals.images[image]);
		}
		
		store.status.images[image].installed_digest = null
		store.status.images[image].installation = store.meta.images[image].config
		store.status.images[image].installation.src = null
		
		store.dockerStreamObjs[image] = null
		if (!element.private){
			fetch_external_dockers(image)
		}
		store.statusIntervals.images[image] = setInterval(function(){ 
			(async function(){
				let response =  await check_image(image)
				store.status.images[image].installed = response.status
				store.status.images[image].inspect = response.image
			})().catch((err)=>{
				logger.error(err)
				store.status.images[image].installed = false
				store.status.iamges[image].inspect = null
			})			
		}, 2000);
		
		
	}
	catch(err){
		logger.error(`Initiating Storage of Docker modules and images function formatDockerLoads() failed, error: ${err}`)
		throw err 
	}
} 




export async function getMeta(){
	store.system.ready = true
	// let response = await fetch_modules()
	return store.meta
}
export async function getServerStatus(){
	// let response = await fetch_modules()
	console.log("returning server run status...")
	return true
}
export async function getDockerStatus(){
	try{
		let response = await store.docker.ping()
		return response
	} catch(err){
		logger.error(`${err} <-- error in fetching docker status via ping`)
		throw err
	}
}