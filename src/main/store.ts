
const path  = require("path")

let globalPath; let OS;
if (!process.env.PWD) {
	globalPath = process.cwd().replace(/\\/g, '/');
  OS = "WIN"
} else {
	globalPath = process.env.PWD
	OS = "UNIX"
}

let writePath;
let resourcePath;
let dataPath;
if (process.env.NODE_ENV != "development"){
	dataPath = path.join(process.env.APPDATA, "Basestack", "data").replace(/\\/g, '/')
	writePath = path.join(dataPath, 'userdata').replace(/\\/g, '/')
	resourcePath = path.join(process.env.resourcesPath, 'data').replace(/\\/g, '/')
} 
else {
	dataPath = path.join(globalPath, "data").replace(/\\/g, '/')
	writePath = path.join(dataPath, 'userdata').replace(/\\/g, '/');
	resourcePath = dataPath
} 

 
 
let uid = 1000; let gid = 1000;
if (process.getuid){
	uid  = process.getuid()
} 
if(process.getgid){
	gid = process.getgid()
}


var store = {   
	system: {
		appVersion: null,
		homedir: process.env.HOME ? process.env.HOME.replace(/\\/g, '/') : '',
		writePath: writePath,
		resourcePath: resourcePath, 
		configFile: path.resolve(path.join(resourcePath, "config", "app", "meta.yaml")).replace(/\\/g, '/'),
		configPath: path.resolve(path.join(resourcePath, "config", 'app')).replace(/\\/g, '/'),
		localModulesPath: [path.resolve(path.join(resourcePath, "config", 'server', 'config', 'modules')).replace(/\\/g, '/')],
		savedModulesPath: path.resolve(path.join(writePath, "data", 'imports', 'modules')).replace(/\\/g, '/'),
		customModulesPath: path.resolve(path.join(writePath, "data", 'custom', 'modules')).replace(/\\/g, '/'),
		dependencies: [path.resolve(path.join(resourcePath, "config", 'server', 'config', 'dependencies')).replace(/\\/g, '/') ],
		logPath: path.join(writePath, "logs").replace(/\\/g, '/'),
		dependenciesPath: path.resolve(path.join(resourcePath, "config", "dependencies.yaml")).replace(/\\/g, '/'),
		logs: {
			docker: path.resolve(path.join(writePath, "logs", "docker.log")).replace(/\\/g, '/'),
			error: path.resolve(path.join(writePath, "logs", "basestackError.log")).replace(/\\/g, '/'),
			info: path.resolve(path.join(writePath, "logs", "basestack.log")).replace(/\\/g, '/'),
		},	
		processes: [],
		history: [],
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

module.exports = {
	store
}