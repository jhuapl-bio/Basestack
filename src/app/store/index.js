
const path  = require("path")
import fs from "file-system"
import YAML from "yaml"


export function parseConfigVariables(data){
	let config = data.replace(/\$\{writePath\}/g, store.system.writePath)
	config = config.replace(/\$\{resourcePath\}/g, store.system.resourcePath)
	config = config.replace(/\\/g, "/")
	config= YAML.parse(config)
	return config
}
 
export var define_configuration = async function(){
    return new Promise((resolve, reject)=>{
      fs.readFile(store.system.configPath,  'utf8', (err, data) => {
        if (err){
          console.error("%s %s %s", "Error(s) in reading the file: ", store.system.configPath, err)
          reject(err)
        } else {
		  let config = parseConfigVariables(data)
          
          resolve(config)
        }
      });
    })
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



export var store = {
	system: {
		appVersion: null,
		writePath: writePath,
		resourcePath: resourcePath,
		configPath: path.join(resourcePath, "app", "config", "meta.yaml"),
		logPath: path.join(writePath, "logs"),
		gid: gid,
		modules: [],
		uid: uid,
		OS: OS	
	},
	partition: "=".repeat(50),
	modules: [],
	default: [],
	logger: null
}
