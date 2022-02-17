import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep");
const path  = require("path")
const { store }  = require("../../config/store/index.js")


export function mapFunctions(target){  
    let functions = {
        "directory": path.dirname,
        "basename": path.basename,
    }
    

    
    const $this  = this
    if (target && typeof target == 'object'){

        Object.keys(target).forEach(function (key) {
            if (typeof target[key] === 'object') {
                target[key] = mapFunctions(target[key]) 
            } else {
                target[key] = mapFunctions(target[key]) 
            }
        })
    } else if (typeof target == 'string') {
        let regexp =  /\^\(.+?\)/g;
        let inner_variables = target.match(/(?<=\^).*?(?=\))/gs); 
        if (inner_variables && Array.isArray(inner_variables)){     
            inner_variables.forEach((vari)=>{
                let split = vari.split("(")
                if (split[0] in functions){
                    let newTarget = functions[split[0]](split[1])
                    target = target.replace("^"+vari+")", newTarget)
                }
            })

            return target
        } else {
            return target
        }
    }
    return target
}


export function mapVariables(target, variables){  
	try{ 
		if (Array.isArray(target)){
			let y = target.reduce()  
			return target
		} else if (target) { 
			let inner_variables = target.match(/(\${.+?\}){1}/g)  
			// Replace variables ${variable} entries in the target section
			if (inner_variables && Array.isArray(inner_variables)){     
				inner_variables.forEach((vari)=>{
					let id = vari.replace(/[\$\{\}]/g, "")
					// let source = ( selected_option.options ? selected_option.options[selected_option.source] : selected_option.source )
					if (variables){ 
						if (id in variables){
							if (typeof variables[id] === 'object'){
								target = target.replaceAll(vari, variables[id].source) 
							} else {
								target = target.replaceAll(vari, variables[id]) 
							}
						} else {
							target = target.replaceAll(vari, "") 
						}    
					} else { 
						target = target.replaceAll(vari, "") 
					}
				})
			} 
			return target
			
		} else {
			return target
		} 
	} catch(err){
		store.logger.error(err)
		return target
	}
}
export function mapCacheVariables(variables, service, token){
    let tokenVals = store.server.cache.get(token) 
    let cachedVariables = nestedProperty.get(tokenVals, `services.${service}.variables`)
    if (cachedVariables){
        for(let [key, value ] of Object.entries(cachedVariables)){
            if (value.option){
                variables[key].option = value.option
            }
            if (value.source){
                variables[key].source = value.source
                
            } 
        }
        console.log(cachedVariables, "get variable token services", service)
    }
    return variables
}

// export function mapTargetConfiguration(target, configuration){
//     findObjectByLabel(target, "(\%\{.+?\})", configuration)
//     return target
// }
// export function mapObject(targetString, pattern, variables){
//     let newTarget = findObjectByLabel(targetString, pattern, variables)
//     newTarget = mapFunctions(newTarget)
//     return newTarget
// }

// export function mapConfigurations(configuration_string, variables){
//     for (let [key, value] of Object.entries(variables)){
//         var replace = `\\$\\{${key}\\}`
//         var re = new RegExp(replace,"g");
//         if (typeof configuration_string == 'string'){
//             configuration_string = configuration_string.replace(re, value.target    )
//         }
//     } 
//     let newString = mapObject(configuration_string, "(\%\{.+?\})", variables)
//     return newString

// }

// export function defineMapping(target){
//     // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< define mapping")
//     let newTarget = findObjectByLabel(target, "(\%\{.+?\})", target) 
//     newTarget = target 
//     // newTarget.variables.file.source = "yes"
//     // console.log("<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<")
//     return target
// }
