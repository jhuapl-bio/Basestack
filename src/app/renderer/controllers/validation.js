const path = require("path")
import FileService from '@/services/File-service.js'
async function contains(validations, value,source){
    return new Promise((resolve,reject)=>{
        let returnable = []
        validations = validations.filter((f)=>{
            return f.type == 'contains'
        })
        if (validations.length == 0){
            resolve(true)
        } else {
            validations.forEach((validation)=>{
                if (validation.target.type == 'value' || !validation.target || !validation.target.type){
                    var replace = `${validation.target.value}`;
                    var re = new RegExp(replace,"g");
                    const found = value.match(re);
                    returnable.push(found) 
                }
                else if (validation.target.type == 'column') {
                    
                    if (validation.target.location){
                        let filtered = value.map((f)=>{
                            return f[validation.target.location]
                        })
                        let index = filtered.indexOf(validation.target.value);
                        ( index > -1 ? returnable.push(true) : returnable.push(false) ) ;
                    } else {
                        let filtered = [].concat(...value);
                        let index = filtered.indexOf(validation.target.value);
                        ( index > -1 ? returnable.push(true) : returnable.push(false) ) ;
                    }
                }
                
            })
            returnable = returnable.filter((f)=>{
                return !f
            })
            resolve(returnable.length == 0)
        }
    })
}
async function files(validations, value,source){
    return new Promise((resolve,reject)=>{
        let returnable = []
        validations = validations.filter((f)=>{
            return f.type == 'files' || f.type == 'file'
        })
        if (validations.length == 0){
            resolve(true)
        } else {

            validations.forEach((validation)=>{
                (async ()=>{
                    if (validation.target.type == 'value' || !validation.target || !validation.target.type){
                        let dir = value
                        if (validation.type == 'file'){
                            dir = path.dirname(value)
                        }
                        let files = await FileService.listFilesDirectory(dir)
                        files  = files.data.data                        
                        var replace = `${validation.target.value}`;
                        var re = new RegExp(replace,"g");
                        const index = files.findIndex((value)=>{
                            return value.match(re)
                        });
                        ( index >= 0 ? returnable.push(true) : returnable.push(false) );
                    }
                })().catch((err)=>{
                    console.error(err)
                    returnable.push(false)
                    resolve(false)
                }).then((f)=>{
                    returnable = returnable.filter((f)=>{
                        return !f
                    })
                    resolve((returnable.length == 0))
                })
                    
            })
        }
    })
}
export const in_column = (source) => (v) => {
    return new Promise((resolve,reject)=>{
        let returnable = true
        let validations = source.validations
        let value = source.source
        let promises = []

        
        if (validations){
            promises.push(contains(validations, value, source))
            promises.push(files(validations, value,source))
            Promise.allSettled(promises).then((passes)=>{
                passes = passes.filter((f)=>{
                    return f.status == 'fulfilled'
                }).map((f)=>{
                    return f.value
                })
                const anyFail = (element) => !element;
                resolve(   passes.findIndex(anyFail) == -1   );       
            }).catch((Err)=>{
                console.error(Err)
                resolve(true)
            })
        } else {
            resolve(true)
        }
    })
    
}
