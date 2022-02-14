
const path  = require("path")


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
	resourcePath = path.join(process.env.resourcesPath, 'data')
} 

else {
	dataPath = path.join(globalPath, "data")
	writePath = path.join(dataPath, 'userdata');
	resourcePath = dataPath
}


 
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
		configPath: path.join(resourcePath,  "config", "server"),
		configFile: path.join(resourcePath,  "config", "server", "meta.yaml"),
		logPath: path.join(writePath, "logs"),
		logs: {
			docker: path.resolve(path.join(writePath, "logs", "docker.log")),
			error: path.resolve(path.join(writePath, "logs", "serverError.log")),
			info: path.resolve(path.join(writePath, "logs", "server.log")),
		},
		dockerConfigs : {},
		gid: gid,
		modules: {},
		procedures: [],
		uid: uid,
		OS: OS	
	},
	partition: "=".repeat(50),
	modules: {},
	images: {},
	procedures: [],
	services: {},
	config: {
		procedures: {},
		services: {},
		modules: {}
	},
	default: [],
	logger: null
}
