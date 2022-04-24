const path  = require("path")
import fs from "file-system"
const YAML = require("js-yaml")

// const Ajv = require("ajv")
// const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}


export function parseConfigVariables(data, config){ 
  if (process.platform == 'win32'){
    config.writePath = config.writePath.replace(/\\/g, "/")
    config.resourcePath = config.resourcePath.replace(/\\/g, "/")
    config.configPath = config.configPath.replace(/\\/g, "/")
    
  }
	data = data.replace(/\$\{writePath\}/g, config.writePath)
	data = data.replace(/\$\{configPath\}/g, config.configPath)
	data = data.replace(/\$\{uploadPath\}/g, config.uploadPath)
	data = data.replace(/\$\{resourcePath\}/g, config.resourcePath)
	data= YAML.load(data)  
	return data   
} 

export var validateSchema = function(configTesting, schema){
  console.log("validating schema")

}

export var define_configuration = async function(config){
    return new Promise((resolve, reject)=>{
      
      fs.readFile(config.configFile,  'utf8', (err, data) => {
        if (err){
          console.error("%s %s %s", "Error(s) in reading the file: ", config, err)
          reject(err)
        } else {
		      config = parseConfigVariables(data, config)
          resolve(config)
        }
      });
    })
}
 