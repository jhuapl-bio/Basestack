
// import Docker from 'dockerode'; 
import path  from "path"
const { store }  = require("../../config/store/index.js")
var  logger  = store.logger      
const { checkFileExist, reformatResponseVideo }  = require("./validate.js")
const { init_base_modules, init_dind, init_base_procedures, import_configurations, init_base_services } = require("./init.js")
const {  writeFile, ammendJSON, readFile, get, set, writeJSON } = require("./IO.js") 
         
  
const {  listImages, fetch_external_config, set_stored } = require("./fetch.js")
     
   
const { docker_init } = require("./init.js")   
const lodash = require("lodash")   

     
 
export async function init(){     
	store.ready = true  
	// Initiating the Docker Class     
	try{
		let data = await import_configurations()
		store.configurations = data
		console.log(store.configurations.socketPath)
	} catch(err){
		store.logger.error("%o, ------------------------error in import configurations", err)
	}
	store.docker = await docker_init( (store.configurations.socketPath ? {socketPath: store.configurations.socketPath } : null ) );  
	// //Initiating the Status Class of Modules 
	let response_orchestrator = await init_dind()
	
	let response_init = await init_base_modules()
	// let response_init_services = await init_base_services()
	  
	fetch_external_config('modules').then((modules)=>{ 
		if (module){
			set_stored(module.name, modules)
		} else {
			store.logger.info("No modules found at remote location")
		}
	}).catch((err)=>{
		store.logger.error("Could not get modules externally, check connections %o", err)
	})
	console.log("finished initializing")
}

export async function updateDockerSocket(socket){
	try{
		if (socket == ''){
			socket = null
		}
		if (socket){
			store.docker  = await docker_init({socketPath: socket})
		} else {
			store.docker  = await docker_init()
		}
		store.configurations.socketPath = socket
		await writeJSON(store.system.configurationFile, store.configurations)
		// await ammendJSON({
		// 	value: socket,
		// 	file: path.join(store.system.writePath, "system.yml"),
		// 	attribute: 'dockerConfig.socketPath'
		// }).catch((err)=>{
		// 	logger.error(err)
		// 	throw err
		// })
		return 
	} catch(err){
		logger.error(err)
		throw err 
	} 
}

// export async function initialize(params){
// 	// logger.info("%s <------ initialize", store.meta)
// 	try{
// 		// let re = await setup_data()''f
// 		store.system.ready  = false
// 		let userMeta = path.join(store.system.writePath, "system.json")
// 		let metaExists = await checkFileExist(store.system.writePath, "system.json", true)
// 		let metaContent = {
// 			modules: {},
// 			images: {},
// 			dockerConfig: {}
// 		};
// 		if (!metaExists){
// 			await writeFile(userMeta, JSON.stringify(metaContent, null, 4))
// 		} 
// 		let meta;
// 		try{
// 			meta = await readFile(userMeta)
// 			meta = JSON.parse(meta)
// 		} catch(err){
// 			logger.error(err)
// 			await writeFile(userMeta, JSON.stringify(metaContent, null, 4))
// 			meta = metaContent
// 		}
// 		let attributes = ['modules', 'images', 'dockerConfig']
// 		for (let i = 0; i < attributes.length; i++){
// 			if (!meta[attributes[i]]){
// 				meta[attributes[i]] = {}
// 				await ammendJSON({
// 					value: {},
// 					file: userMeta,
// 					attribute: attributes[i]
// 				}).catch((err)=>{
// 					logger.error(err)
// 					throw err
// 				})
// 			}
// 		}
// 		store.dockerConfig = meta.dockerConfig
// 		store.docker = await docker_init();
// 		let response = await fetch_modules()
// 		// for (const [key, image] of Object.entries(store.config.images)){
// 		// 	if (!meta.images || !meta.images[key]){
// 		// 		await ammendJSON({
// 		// 			value: {resources: null},
// 		// 			file: userMeta,
// 		// 			attribute: "images."+key
// 		// 		}).catch((err)=>{
// 		// 			logger.error(err)
// 		// 			throw err
// 		// 		})
// 		// 	} 
// 		// 	else {
// 		// 		if (image.installation.resources){
// 		// 			for (const [key2, value2 ] of Object.entries(image.installation.resources)){
// 		// 				if (store.config.images[key].installation.resources[key2] && meta.images[key].resources){
// 		// 					store.config.images[key].installation.resources[key2].srcFormat = meta.images[key].resources[key2]
// 		// 				}
// 		// 			}
// 		// 		}
				
// 		// 	}
// 		// }
// 		let tag = "name"
// 		function customizer(objValue, srcValue) { //https://lodash.com/docs/#merge
// 		  if (Array.isArray(objValue)) {
// 		    const unio = lodash.union(objValue, srcValue);
// 		    console.log(unio, objValue, srcValue)
// 		  	return lodash.uniqBy(unio, tag)
// 		  }
// 		}
// 		for (const [key, value] of Object.entries(response.modules.entries)){
// 			if (value.module){
// 		// 		if (!system.modules[key]){
// 		// 			system.modules[key] = {}
// 		// 		}
// 		// 		const container_name = value.name 
// 		// 		let folderExists = await checkFileExist(path.join(store.system.writePath, container_name), true)
// 		// 		if (!folderExists){
// 		// 			await writeFolder(path.join(store.system.writePath, container_name))
// 		// 		}
// 		// 		tag = "name"
// 		// 		const merged  = lodash.mergeWith( value.resources, system.modules[key].resources, customizer)
// 		// 		let objectname = value.objectname
// 		// 		let objectfile = value.objectfile
// 		// 		if (! objectname){
// 		// 			objectname = value.name
// 		// 		}
// 		// 		if (! objectfile ) {
// 		// 			objectfile = `./modules/${objectname}`
// 		// 		}
// 		// 		const { docker } = require(`../${objectfile}`)
// 		// 		store.factory[value.name] = new docker()
// 		// 		let obj = await initialize_module_object(value)
// 		// 		// for (const [pipeline, conf] of Object.entries(value.pipelines)){
// 		// 		// 	const { docker } = require(`../${objectfile}`)
// 		// 		// 	store.factory[pipeline] = new docker()
// 		// 		// 	let obj = await initialize_module_object(value)
// 		// 		// }

// 		// 		// if (value.config.initial && response.images.entries[value.image].status.installed){
// 		// 		// 	let response2 = await obj.cancel()
// 		// 		// 	let response_start = await start_module({module: container_name, tag: "latest"})
// 		// 		// }
// 		// 		// if (value.submodules){
// 		// 		// 	for (const [key2, value2] of Object.entries(value.submodules)){
// 		// 		// 		let obj = await initialize_module_object(value2)
// 		// 		// 		// console.log("______")
// 		// 		// 		// console.log(value2.config, key2, response.images.entries[value.image].status.installed, response.images.entries[value.image])
// 		// 		// 		// console.log("______")
// 		// 		// 		// if (value2.config.initial && response.images.entries[value.image].status.installed){
// 		// 		// 		// 	console.log("key2______")
// 		// 		// 		// 	let response2 = await obj.cancel()
// 		// 		// 		// 	let response_start = await start_module({module: key2, tag: "latest"})
// 		// 		// 		// }

// 		// 		// 	}
// 		// 		// }
// 			}	
// 		}
// 		// await ammendJSON({
// 		// 	value: system.modules,
// 		// 	file: path.join(store.system.writePath, "system.json"),
// 		// 	attribute: "modules"
// 		// }).catch((err)=>{
// 		// 	logger.error(err)
// 		// 	throw err
// 		// })
		
// 		store.system.ready = true
// 		return response
// 	} catch(err){
// 		logger.error(`Error in initializing the app with modules, ${err}, function: initialize()`)
// 		store.system.ready = false
// 		throw err
// 	}
// }


 
// async function initialize_module_object(container_name){     
// 	// let obj;
// 	// if (container_name == 'rampart'){
// 	// 	obj  = new DockerObj('jhuaplbio/basestack_consensus', 'rampart', new RAMPART());
// 	// } else if (container_name == 'basestack_tutorial'){
// 	// 	obj = new DockerObj('basestack_tutorial', 'basestack_tutorial', new Tutorial());
// 	// } else if (container_name == 'basestack_consensus'){
// 	// 	obj  = new DockerObj('jhuaplbio/basestack_consensus', 'basestack_consensus', new BasestackConsensus());
// 	// } 
// 	// else if (container_name == 'basestack_mytax'){
// 	// 	obj  = new DockerObj('jhuaplbio/basestack_mytax', 'basestack_mytax', new BasestackMytax());
// 	// } else if (container_name == 'basestack_mytax_report'){
// 	// 	obj  = new DockerObj('jhuaplbio/basestack_mytax', 'basestack_mytax_report', new BasestackMytaxReport());
// 	// }  
// 	// else if (container_name == 'pavian'){
// 	// 	obj  = new DockerObj('florianbw/pavian', 'pavian', new Pavian());
// 	// }	
// 	// else {
// 	// 	return;
// 	// }

// 	obj.config = store.config.modules[container_name]
// 	store.modules[container_name]  = obj
// 	store.statusIntervals.modules[container_name] = null
// 	try{
// 		let response = await obj.watch()
// 		return obj
// 	} catch(err){
// 		logger.error(`Error in initializing module object ${err}, function: initialize_module_object() `)
// 		throw err
// 	}
// }

// export async function start_module(params){
// 	let container_name;
// 	try{
// 		container_name = params.module
// 		let obj; 
// 		if (store.modules[container_name]){
// 			obj = store.modules[container_name]
// 		} else {
// 			obj = await initialize_module_object(container_name)
// 		}
// 		console.log(container_name)
// 		let response = await obj.start(params)
// 		store.modules[container_name] = obj;
// 		return response
			
		
// 	} catch(err){
// 		logger.error(`${container_name}: couldn't start the necessary module, function: start_module(), check error -> ${err}`)
// 		store.config.modules[container_name].errors = err
// 		console.error(err)
// 		throw err
// 	}
		
// }

// export async function cancel_container(params){
// 	let obj = store.modules[params.module]
// 	if (!obj || !obj.status.running){
// 		if (!params.silent){
// 			throw new Error(`Pipeline: ${params.module} with that name doesn't exist`)
// 		}
// 	} else {
// 		try{
// 			let response = await obj.cancel()
// 			return response
// 		} catch(err){
// 			logger.error(`${err}, function: cancel_container()`)
// 			throw err
// 		}
// 	}
// }
// export async function add_selections(params){
// 	try{
// 		if (!params.file_target){
// 			params.file_target = params.target
// 		}
// 		const attrs = params.file_target.split(".")
// 		let meta = await readFile(store.system.userMeta)
// 		meta = JSON.parse(meta)
// 		let depth  = get(params.file_target, meta, params.type)
// 		let push = false
// 		if (params.key){
// 			if (depth.some(e => params.value[params.key] === e[params.key] )) {
// 				push = false
// 			} else {
// 				push = true			
// 			}
// 		}
// 		else {
// 			if(!depth.includes(params.value)){
// 				push = true
// 			} else {
// 				push = false
// 			}
// 		}
// 		if (push){
// 			let st = get(params.target, store, params.type) 
// 			st.push(params.value)
// 			depth.push(params.value)
// 			await ammendJSON({
// 				value: depth,
// 				type: "arr",
// 				file: store.system.userMeta,
// 				attribute: params.file_target
// 			})	
// 		} else {
// 			throw new Error("value already found, please opt for a different target name")
// 		}
		

// 		return 1
// 	} catch(err){
// 		logger.error("%s Error in adding custom file based on params: %j", err, params)
// 		throw err
// 	}
// }
// export async function rm_selections(params){
// 	try{
// 		const attrs = params.target.split(".")
// 		let meta = await readFile(store.system.userMeta)
// 		meta = JSON.parse(meta)
// 		let depth  = get(params.file_target, meta, params.type)
// 		let st = get(params.target, store, params.type) 
// 		let found = false
// 		if (params.key){
// 			depth = depth.filter((d)=>{
// 				return d[params.key] !== params.value[params.key]
// 			})
// 			st = st.filter((d)=>{  
// 				return d[params.key] !== params.value[params.key]
// 			})
// 		}
// 		else {
// 			depth = depth.filter((d)=>{
// 				return d !== params.value
// 			})
// 			st = st.filter((d)=>{
// 				return d !== params.value
// 			})
// 		}
// 		set(params.target, st, store, params.type)
// 		await ammendJSON({
// 			value: depth,
// 			file: store.system.userMeta,
// 			attribute: params.file_target
// 		})	
// 		let obj = {custom: false}
// 		obj[params.target]  = null
// 		return obj
// 	} catch(err){
// 		logger.error("%s Error in removing custom file based on params: %j", err, params)
// 		throw err
// 	}
// }