import nestedProperty from "nested-property"
const cloneDeep = require("lodash.clonedeep");

const { store }  = require("../../config/store/index.js")

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

export function findObjectByLabel(obj, pattern, fullObj) {
    const $this  = this
    if (obj && typeof obj == 'object'){
        Object.keys(obj).forEach(function (key) {
            if (typeof obj[key] === 'object') {
                findObjectByLabel(obj[key], pattern, fullObj) 
                // return null
            } else if (typeof obj[key] === 'string'){  
                var replace = `${pattern}` 
                var re = new RegExp(replace,"g");
                let fullstring = cloneDeep(obj[key])
                let fo = obj[key].match(re)   
                if (fo && Array.isArray(fo)){  
                    fo.forEach((match)=>{ 
                        try{
                            let id = match.replace(/[\%\{\}]/g, "")
                            Object.defineProperty(obj, key, {
                                get: function(){
                                    let found =  nestedProperty.get(fullObj, id)
                                    
                                  
                                    fullstring  = fullstring.replaceAll(match, found)
                                    
                                    return  fullstring
                                } 
                            })
                        } catch(err)  {
                            store.logger.error(err)
                        }
                    }) 
                } 
                return obj[key]
            }
            else{
                return null
            }
        })
    } else {
        return null
    }
}
export function mapTargetConfiguration(target, configuration){
    findObjectByLabel(target, "(\%\{.+\})", configuration)
    return target
}


export function mapConfigurations(configuration_string, variables){
    for (let [key, value] of Object.entries(variables)){
        var replace = `\\$\\{${key}\\}`
        var re = new RegExp(replace,"g");
        if (typeof configuration_string == 'string'){
            configuration_string = configuration_string.replace(re, value.target    )
        }
    } 
    if (typeof configuration_string == 'string'){
        configuration_string = JSON.parse(configuration_string)
    }
    let founds =findObjectByLabel(configuration_string, "(\%\{.+\})", configuration_string)
    return configuration_string

}