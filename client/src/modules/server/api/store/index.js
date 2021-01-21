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
console.log(3, "productions")
	dataPath = path.join(process.env.APPDATA, "Basestack", "data")
	writePath = path.join(dataPath, 'userdata')
console.log(4, dataPath)
	globalPath = process.resourcesPath
} 

else {
console.log(3, "development")
	dataPath = path.join(globalPath, "data")
	writePath = path.join(dataPath, 'userdata');
console.log(4)
}
console.log(1, process.env.PWD, globalPath, assetPath, modulesPath, process.env.APPDATA, writePath)
console.log(2)

console.log(globalPath, dataPath, "<<<<<<")
resourcePath = path.join(globalPath, "data", "config")

let uid = 1000; let gid = 1000;
if (process.getuid){
	uid  = process.getuid()
}
if(process.getgid){
	gid = process.getgid()
}
console.log(5, resourcePath)
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
	OS: OS	
}
console.log("0000000000000000000000000000", meta, "\n________________________________________________")
module.exports.meta = meta