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

resourcePath = path.join(globalPath, "data", "config")

let uid = 1000; let gid = 1000;
if (process.getuid){
	uid  = process.getuid()
}
if(process.getgid){
	gid = process.getgid()
}
const dockerStagePath = path.join(resourcePath, 'installation');
var meta = {
	appVersion: null,
	dataPath: dataPath,
	writePath: writePath,
	globalPath: globalPath,
	resourcePath: resourcePath,
	userMeta: path.join(writePath, "meta.json"),
	errorLogFile: path.join(dataPath, "logs","error.log"),
	logFile: path.join(dataPath, "logs","logger.log"),
	logFolder: path.join(dataPath, "logs"),
	dockerLogFile: path.join(dataPath, "logs", "dockerLog.log"),
	dockerImagesPath: dockerStagePath,
	gid: gid,
	uid: uid,
	OS: OS	,
	ready:false
}
console.log("0000000000000000000000000000", meta, "\n________________________________________________")
module.exports.meta = meta