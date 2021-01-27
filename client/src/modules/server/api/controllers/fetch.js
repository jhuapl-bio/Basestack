/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const fs = require("fs")
const { checkFileExist, checkFolderExistsReject, checkFolderExists, checkFolderExistsAccept,  validateVideo, validateAnnotation, validateHistory, validateProtocol, validatePrimerVersions }  = require("./validate.js")
import  path  from "path"
const axios = require("axios")
var   { store }  = require("../store/global.js")
var { logger } = require("../controllers/logger.js")
const { removeFile, getFiles, copyFile, readFile,  writeFolder } = require("./IO.js")
const si = require('systeminformation');
import Docker from 'dockerode';
import  docker  from "./docker.js"


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
	let videoMeta = await checkFileExist(server_config.basePath, "meta.json")
	let userMeta = await readFile(store.meta.userMeta)
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

export async function fetch_external_dockers(key){
	let url = `https://registry.hub.docker.com/v2/repositories/${store.config.images[key].installation.path}/tags`
	try{
		logger.info(url)
		const element = store.config.images[key]
		store.config.images[key].status.fetching_available_images = true
		let json =  await axios.get(url)
		let latest = null;
		json = json.data.results
		if (json){
			latest = json.filter((d)=>{
				return d.name == 'latest'
			})[0]
		}
		store.config.images[key].latest_digest = latest.images[0].digest
		store.config.images[key].available_images = json.map((d)=>{

			return {
				fullname: `${element.name}:${d.name}`, 
				name: d.name, 
				version:d.name,
				digest: d.images[0].digest, 
				image: element.name, 
				installed: false,
				selected:false 
			}
		})
	} catch(err){
		logger.error(err)
	} finally{
		logger.info("Checked the presence of "+key)
		store.config.images[key].status.fetching_available_images = false
	}
}

async function check_image_promise(imageName){
	return new Promise((resolve, reject)=>{
		try{
			(async ()=>{
				let getImages = await docker.listImages({ 'filters' : { 'reference' : [ imageName ] }})
				let tags = [];
				let latest; 
				for (const image of getImages) {
					if (image.RepoTags && image.RepoTags.length > 0){
						tags = tags.concat(image.RepoTags.map((d,i)=>{
							let obj = {
								version: d.replace(imageName+":", ""), 
								name: d, 
								fullname: `${d}`,
								image: imageName,
								installed: true,
								digest: (image.RepoDigests && image.RepoDigests[i] ? image.RepoDigests[i].replace(`${imageName}@`, "") : null)
							}
							if (obj.version =='latest'){
								latest = obj
							}
							return obj
						}))
					}
				}
				let installed_count = tags.length
				tags.some((item, idx) => 
				  item.version.includes('latest') && 
				  tags.unshift( 
				    tags.splice(idx,1)[0] 
				  ) 
				)
				if (latest && !store.config.images[imageName].selectedTag.digest){
					store.config.images[imageName].selectedTag = latest
				}
				const available_versions = tags.map((d)=>{
					return d.version
				})
				
				store.config.images[imageName].available_images.forEach((d, i)=>{
					const available = (available_versions.some((item, idx)=>{
						return item == d.version
					}) || installed_count == 0)
					if (!available){
						tags.push(d)
					}
				})
				resolve({
					tags: tags,
					imageName: imageName,
					error: null,
					status: (installed_count > 0 ? true : false)
				})
				
			})().catch((error)=>{
				logger.error(`${error} error in checking image exist`)
				resolve({
					image: error,
					imageName: imageName,
					status: false
				})
			});
		} catch(err){
			logger.error("%s %s", err, " error in retrieving imageName: "+imageName)
			resolve({
				image: err,
				imageName: imageName,
				status: false
			})
		}

	})

}

export async function check_image(image){
	return new Promise((resolve, reject)=>{
		check_image_promise(image).then((response)=>{
			resolve(response)			
		}).catch((err)=>{
			console.error(err, "error in promises fetch images")
			resolve(err)
		})
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
				await readFile(path.join(fullpathHistory, "report-meta.json"), false).then((content, error)=>{
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
		return {cpu: cpu, mem: mem, disk: disk}
	} catch(err){
		logger.error(err)
		throw err
	}
}
export async function fetch_docker_status(){
	try{
		let response = await docker.version()
		// let response = true
		return response
	} catch(err){
		logger.error(err)
		throw err
	}
}
export async function fetch_status(){
	let response = {}
	let dockers;
	let errors = [];
	try{
		response = await fetch_modules()
	} catch(err){
		errors.push(err)
	}
	try{
		let resources = await fetch_resources()
		response.resources = resources
	} catch(err){
		logger.error(err)
		errors.push(err)
	}
	try{
		let docker_status = await fetch_docker_status()
		response.docker = true
	} catch(err){
		// console.error(err)
		response.docker = false
		errors.push(err)
	}
	response.ready = store.meta.ready
	return response
}

export async function fetch_modules(){
	try{
		if (!store.config.images){
			await formatDockerLoads(store)
		} 
		let modules = store.config.modules
		let images = store.config.images
		let errors = {
			images: [],
			modules:[]
		}
		let completed = []
		for (const [key, value] of Object.entries(store.config.images)){
			if (value.status.complete && value.status.installed){
				completed.push(modules[key].title)
				store.config.images[key].status.complete = false
			}
			store.config.images[key].status.stream = store.config.images[key].status.stream.splice(-200)
		}
		for (const [key, value] of Object.entries(store.config.modules)){
			if (value.module && store.modules[key]){
				store.config.modules[key].status = store.modules[key].status
				store.config.modules[key].status.stream = store.config.modules[key].status.stream.splice(-200)
				store.config.modules[key].status.installed = store.config.images[value.image].status.installed
			}
		}
		return {
			images: {
				entries: store.config.images,
				errors: errors.images,
				completed: completed,
			}, 
			modules: {
				entries: store.config.modules,
				errors: errors.modules
			}, 
		}
	} catch(err){
		console.error(err)
		throw err
	}
}



async function formatDockerLoads(){
	try{
		const meta = store.meta
		let config = await readFile(path.join(meta.resourcePath, "meta.json"), false)
		config = config.replace(/\$\{writePath\}/g, meta.writePath)
		config = config.replace(/\$\{resourcePath\}/g, meta.resourcePath)
		config = config.replace(/\\/g, "/")
		config = JSON.parse(config, 'utf-8')
		store.config.images = config.images
		store.config.modules = config.modules
		for (const key of Object.keys(store.config.images)){
			const element = store.config.images[key]
			store.config.images[key].status = {
				pause: false,
				stream: [],
				changed: false, 
				running:false,
				complete: false,
				errors : null,
				installed: false,
				inspect: null,
				fetching_available_images: false
			}
			let base_tags = [ {fullname: `${element.name}:latest`, image:`${element.name}`, name: 'latest', digest: null, installed: false, selected:true, version:'latest'}]
			store.config.images[key].tags = base_tags
			store.config.images[key].available_images = base_tags
			store.config.images[key].selectedTag = base_tags[0]
			store.dockerStreamObjs[key] = null
			let checking = false
			if(!element.private){
				fetch_external_dockers(key)
			}
			store.statusIntervals.images[key] = setInterval(function(){ 
				if (!checking){
					(async function(){
						checking = true
						let response =  await check_image(key)
						store.config.images[key].status.installed = response.status
						store.config.images[key].status.errors = response.error
						store.config.images[key].tags = (response.tags.length > 0 ? response.tags : base_tags)
						checking = false
					})().catch((err)=>{
						logger.error(err)
						store.config.images[key].status.installed = false
						store.config.images[key].tags = []
						store.config.images[key].selectedTag = null
						checking = false
					})
				}			
			}, 2000);
		}
		
	}
	catch(err){
		logger.error(`Initiating storage of Docker Modules and images function formatDockerLoads() failed, error: ${err}`)
		throw err
	}
}