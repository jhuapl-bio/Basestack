import { Variable } from "./Variable"

const fs  = require("fs")
const YAML = require("js-yaml")
import nestedProperty from "nested-property"

// const Ajv = require("ajv")
// const ajv = new Ajv() // options can be passed, e.g. {allErrors: true}


export function parseConfigVariables(data: string, config: any){ 
  if (process.platform == 'win32'){ // If this is a windows machine, you need to remove the double \\ in paths!
    config.writePath = config.writePath.replace(/\\/g, "/")
    config.resourcePath = config.resourcePath.replace(/\\/g, "/")
    config.configPath = config.configPath.replace(/\\/g, "/")
  }
  // replace the ${} store systems to the current system's setup
	data = data.replace(/\$\{writePath\}/g, config.writePath) // where custom user data is like databases, output files, etc
	data = data.replace(/\$\{configPath\}/g, config.configPath) // constant, non editable packaged files location
	data = data.replace(/\$\{uploadPath\}/g, config.uploadPath) // where files can be uploaded and shared across teh system
	data = data.replace(/\$\{resourcePath\}/g, config.resourcePath) // non editable path, like config path but higher up
	data= YAML.load(data)   // load info as yaml string into object
	return data   
} 

var validateSchema = function(configTesting, schema){ // deprecated, in development
  console.log("validating schema")

}
export var importDependencies  = async function(config){
  try {
    const doc = YAML.load(fs.readFileSync(config.dependenciesPath, 'utf8'));
    return doc
  } catch (e) {
    console.log(e);
    return null
  }
}
function iterate(obj, stack, parsevariable) {
  for (var property in obj) {
    if (obj.hasOwnProperty(property)) {
      if (typeof obj[property] == "object") {
        iterate(obj[property], `${stack}${(stack !== '' ? "." : "")}${property}`, parsevariable);
      } else {
        var regex = /\$\{.+\}.*/g
        // var re = new RegExp(replace, "g");
        let fo = String(obj[property]).match(regex)  
        if (fo && Array.isArray(fo)) {
          let ydf = new Variable(fo[0], stack)
        } else {
          nestedProperty.set(parsevariable, stack, obj[property])
        }
      }
    }
  }
}
export var traverse_object = function (data: Object) {
  let parsevariable = {}
  iterate(data, '', parsevariable)
}
export var define_configuration = async function(config){
    return new Promise((resolve, reject)=>{
      fs.readFile(config.configFile,  'utf8', (err, data) => { // read the config file for a given YAML
        if (err){
          console.error("%s %s %s", "Error(s) in reading the file: ", config, err)
          reject(err)
        } else {
		      config = parseConfigVariables(data, config) // update the variables with necessary values for system in which basestack is one
          resolve(config)
        }
      });
    })
}
