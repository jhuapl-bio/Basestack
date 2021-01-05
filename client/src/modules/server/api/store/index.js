const  path  = require("path")
let globalPath; let assetPath; let OS;
if (!process.env.PWD) {
  globalPath = process.cwd();
  OS = "WIN"
} else {
	globalPath = process.env.PWD
	OS = "UNIX"
}

assetPath = path.join(globalPath, "src","renderer","assets")
const modulesPath  = path.join(globalPath, "src", "modules", "pipelines")
let writePath;
let resourcePath;

if (process.env.NODE_ENV != "development"){
	writePath = path.join(process.env.APPDATA, "Basestack", "data", 'userdata')
	globalPath = process.resourcesPath
} 
else {
	writePath = path.join(globalPath, 'data', 'userdata')
}
resourcePath = path.join(globalPath, "data", "config")

let uid = 1000; let gid = 1000;
if (process.getuid){
	uid  = process.getuid()
}
if(process.getgid){
	gid = process.getgid()
}
const dockerStagePath = path.join(resourcePath, 'installation');
export var meta = {
	appVersion: null,
	writePath: writePath,
	globalPath: globalPath,
	resourcePath: resourcePath,
	userMeta: path.join(writePath, "meta.json"),
	errorLogFile: path.join(writePath, "logs","error.log"),
	logFile: path.join(writePath, "logs","logger.log"),
	logFolder: path.join(writePath, "logs"),
	dockerImagesPath: dockerStagePath,
	gid: gid,
	uid: uid,
	OS: OS	
}

