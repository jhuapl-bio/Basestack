import { store } from "./global"

const path  = require("path")
const fs  = require("fs")
const YAML = require("yaml")


export var define_configuration = async function(){
  return new Promise((resolve, reject)=>{
    fs.readFile(system.metaPath,  'utf8', (err, data) => {
      if (err){
        console.error("%s %s %s", "Error(s) in reading the file: ", system.metaPath, err)
        reject(err)
      } else {
        // console.log("donedd", system.metaPath, YAML.parse(data))
		let config = data.replace(/\$\{writePath\}/g, system.writePath)
		config = config.replace(/\$\{resourcePath\}/g, system.resourcePath)
		config = config.replace(/\\/g, "/")
		config= YAML.parse(config)
        resolve(config)
      }
    });
  
  })
}

export var define_base = function(){
	let keys = ['images', 'modules']
	let mapKeys = ['images','modules']
	for (let [key, entry] of Object.entries(store.meta.modules) ) {
		if (entry.module){
			store.status.modules[key] = {
				stream: ["Start"],
				changed: false, 
				running:false,
				complete: false,
				errors : null,
				nterval: null,
				pause: false
			}
		}
	}

	// for (let [key, entry] of Object.entries(store.meta.images) ) {
	// 	store.status.images[key] = {
	// 		pause: false,
	// 		init: false,
	// 		stream: ["Start"],
	// 		changed: false, 
	// 		running:false,
	// 		complete: false,
	// 		errors : null,
	// 		installed: false,
	// 		inspect: null,
	// 		interval: null,
	// 		fetching_available_images: {
	// 			status: false,
	// 			errors: false
	// 		}
	// 	}
		
	// }


	// mapKeys.forEach((d, i)=>{
	// 	if (store.meta[keys[i]]){
	// 		const metas = Object.keys(store.meta[keys[i]])
	// 		metas.forEach((element)=>{
	// 			store.status[d][element] = {
	// 				pause: false,
	// 				init: false,
	// 				stream: ["Start"],
	// 				changed: false, 
	// 				running:false,
	// 				complete: false,
	// 				errors : null,
	// 				installed: false,
	// 				inspect: null,
	// 				interval: null,
	// 				fetching_available_images: {
	// 					status: false,
	// 					errors: false
	// 				}
	// 			}
	// 		})
	// 	}
			
	// })
	return 
}

let globalPath; let OS;
if (!process.env.PWD) {
  globalPath = process.cwd();
  OS = "WIN"
} else {
	globalPath = process.env.PWD
	OS = "UNIX"
}

let writePath;
let resourcePath;
let dataPath;
if (process.env.NODE_ENV != "development"){
	dataPath = path.join(process.env.APPDATA, "Basestack", "data")
	writePath = path.join(dataPath, 'userdata')
	globalPath = (process.env.resourcesPath)
} 

else {
	dataPath = path.join(globalPath, "data")
	writePath = path.join(dataPath, 'userdata');
}

resourcePath = path.join(globalPath, "src")

let uid = 1000; let gid = 1000;
if (process.getuid){
	uid  = process.getuid()
}
if(process.getgid){
	gid = process.getgid()
}
const dockerStagePath = path.join(resourcePath, 'installation');

export var system = {
	appVersion: null,
	dataPath: dataPath,
	writePath: writePath,
	globalPath: globalPath,
	metaPath: path.join(resourcePath, "meta.yaml"),
	resourcePath: resourcePath,
	userMeta: path.join(writePath, "meta.json"),
	errorLogFile: path.join(dataPath, "logs","error.log"),
	logFile: path.join(dataPath, "logs","logger.log"),
	logFolder: path.join(dataPath, "logs"),
	dockerLogFile: path.join(dataPath, "logs", "dockerLog.log"),
	dockerimagesPath: dockerStagePath,
	gid: gid,
	uid: uid,
	OS: OS	,
	ready:false
}
