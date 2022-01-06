const path  = require("path")
import fs from "file-system"
import YAML from "yaml"



export function parseConfigVariables(data, config){ 
	data = data.replace(/\$\{writePath\}/g, config.writePath)
	data = data.replace(/\$\{configPath\}/g, config.configPath)
	data = data.replace(/\$\{uploadPath\}/g, config.uploadPath)
	data = data.replace(/\$\{resourcePath\}/g, config.resourcePath)
	data = data.replace(/\\/g, "/") 
	data= YAML.parse(data) 
	return data 
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
 