import { resolve } from "path"
import nestedProperty from "nested-property"
import { config } from "winston"
const { parseConfigVariables } = require("../../../shared/definitions.js")
const path = require("path")    
const { store }  = require("../../config/store/index.js")
const lodash = require("lodash")  
const {removeDep} = require("../controllers/post-installation.js")
const {   fetch_external_config, fetch_external_yamls } = require("../controllers/fetch.js") 
const { removeFile } = require("../controllers/IO.js")
const {  init_modules } = require("../controllers/init.js")
const {   import_cfgs } = require("../controllers/configurations.js") 
const { Module } = require("../orchestrators/module.js")
const { Catalog } = require("../orchestrators/catalog.js")
export  class Library {  
    constructor(config){            
        this.remotes = {}
        this.defaults = {}
        this.imported = {}
        this.catalog = {} 
        this.locals = store.config.imported
        this.customs = {}
        const $this = this
        this.all = {}

        // Object.defineProperty(this, "all", {
        //     enumerable: true,   
        //     get: function(){
        //         let base = {}
        //         let seen = {}
                
        //         for (let [name,t] of Object.entries(this.all)){
        //             if (!base[name]){
        //                 base[name] = {
        //                     choices: []
        //                 }
        //             } 
        //             let value = t.choices
        //             value.forEach((choice)=>{
        //                 let idx = base[name].choices.findIndex((f)=>{
        //                     return f.version == choice.version
        //                 })                        
        //                 base[name].choices.push(choice)
        //             })
        //             Object.defineProperty(base[name], "imported", {
        //                 enumerable: true,   
        //                 get: function(){ 
        //                     let any = base[name].choices.some((a)=>{
        //                         return a.imported
        //                     })
        //                     return any 
        //                 }
        //             })
        //             Object.defineProperty(base[name], 'selected', {
        //                 enumerable: true,   
        //                 get: function(){
        //                     let base2 = $this.getIndexVersion(name)
                            
        //                     return base2
            
        //                 }
        //             })
        //         }
        //         return  base
        //     }
        // })
        
        // }
        //         return base
                
        //     },
        // }) 
    }  
    getLatest(name){
        let any = this.all[name].choices.some((a)=>{
            return a.latest
        })
        return any 
    }
    getImported(name){
        let any = this.all[name].choices.some((a)=>{
            return a.imported
        })
        return any 
    } 
    sorting(a,b){
        if (a.version < b.version){
            return 1
        } else if (a.version > b.version){
            return -1
        } else if (b.remote){
            return 1
        } else {
            return -1 
        }
    }
    getSortedImported(name){ 
        const $this = this
        if (!name){
            let base ={}
            for (let [key,value] of Object.entries(this.all)){
                if (value.imported){
                    base[key] = value
                }
            }
            for (let [key, value] of Object.entries(base)  ){
                base[key].choices = base[key].choices.sort((a,b)=>{
                    return $this.sorting(a,b)
                })
                
            }
            return base
        } else {
            let base = this.all[name].choices
            base = base.sort((a,b)=>{
                $this.sorting(a,b)
                
            })   
            return base             
        }
            
        
    }
    
    getLatestImported(name){
        let base = this.all[name].choices.map((f,i)=>{
            f.idx = i
            return f
        })
        let i=0
        base = base.sort((a,b)=>{
            if (!a.version){
                a.version = 0
            }
            if (!b.version){
                b.version = 0
            }
            return b.version - a.version
        })   
        
        return base[0]
    }
    getIndexVersion(name){ 
        let indx=0
        if (this.catalog[name] && this.catalog[name].config){
            let indx  = this.all[name].choices.findIndex((f)=>{
                return f.version == this.catalog[name].config.version
            })
        }
        return indx
    }
    addImported(config, name, removable){
        
        const $this = this
        if (!this.all[name]){
            this.defineEntry(name)
        } 
        if (Array.isArray(config)){
            let maxIdx = this.all[name].choices.length - 1
            config.forEach((con)=>{
                
                let idx = this.all[name].choices.findIndex((f)=>{
                    return f.version == con.version
                })
                
                if (idx == -1){
                    con.idx = maxIdx + 1
                    maxIdx +=1
                    con.removable = removable
                    con.imported = true
                    con.local =true
                    this.imported[name].push(con)
                    this.all[name].choices.push(con)
                } else {
                    con.idx = maxIdx + 1
                    maxIdx +=1
                    config.removable = removable
                    con.local =true
                    con.imported = true
                    this.imported[name][idx] = con
                    this.all[name][idx] = con

                }
                  
            }) 
            
        } else { 
            let maxIdx = this.all[name].choices.length - 1
            let idx = this.all[name].choices.findIndex((f)=>{
                return f.version == config.version && f.imported
            })
            if (idx == -1){
                config.idx = maxIdx + 1
                config.imported = true 
                config.removable = removable
                config.local = true
                this.all[name].choices.push(config)
            } else {
                config.idx = maxIdx + 1
                config.removable = removable
                config.local = true
                config.imported = true 
                this.all[name][idx] = config
            } 
            
        }   
        
        return
    }
    async create_module(module, key){
        try{    
            let found= nestedProperty.get(store.library.catalog, module.name)
            if (found){ 
                store.logger.info("cleaning up the existing %s", module.name)
                found.cleanup()  
                delete store.library.catalog[module.name]
            } 
            store.logger.info("Cleaned up existing modules, making module now")
            let modl = new Module(module, module.name, key)
            store.logger.info("Maade module, initiating procedures")

            modl.initProcedures()  
             
            if (!store.library.catalog[module.name]){
                store.logger.info("%s making catalog", module.name)
                store.library.catalog[module.name] = new Catalog(module)
                store.library.catalog[module.name] = modl
                store.logger.info("defining tags for %s", module.name)
                Object.defineProperty(store.library.catalog[module.name], 'tags', {
                    get: ()=>{
                        let allTags = store.library.catalog[module.name].modules.map((d)=>{ 
                            if (d.config && d.config.tags){
                                return d.config.tags
                            } else {
                                return []
                            }
                        }) 
                        let reducedAllTags = [].concat(...allTags);
                        reducedAllTags = [... new Set(reducedAllTags)]
                        return reducedAllTags
    
     
                    }
                })
            } 
            
            store.logger.info("Returning module now... %s", module.name)
            return modl 
        } catch(err){
            store.logger.error("%s %o", "error in init module", err)  
            throw err 
        }   
    }
    defineEntry(name){
        const $this = this
        if (!this.all[name]){
            this.all[name] = {
                choices: []
            }
            const $this = this
            Object.defineProperty($this.all[name], "imported", {
                enumerable: true,   
                get: function(){ 
                    let any = $this.all[name].choices.some((a)=>{
                        return a.imported
                    })
                    return any 
                }
            })
            Object.defineProperty($this.all[name], 'selected', {
                enumerable: true,   
                get: function(){
                    let base2 = $this.getIndexVersion(name)
                    
                    return base2
    
                }
            })
            Object.defineProperty($this.all[name], "latest", {
                enumerable: true,   
                get: function(){
                    let sorted  = $this.all[name].choices.sort((a,b)=>{
                        b.version - a.version
                    })
                    return sorted[0]
                }
            })
        } 
    }
    addLocal(config,name){
        if (!this.all[name]){
            this.defineEntry(name)
        }
        if (Array.isArray(config)){
            let maxIdx = this.all[name].choices.length - 1
            config.forEach((con)=>{
                let idx = this.all[name].choices.findIndex((f)=>{
                    return f.version == con.version && !f.imported && f.local
                })

                con.idx = maxIdx + 1
                maxIdx +=1
                con.imported = false
                con.local = true
                con.remote = false 
                con.removable = false
                this.all[name].choices.push(con)
            })
            
        } else { 
            
            let maxIdx = this.all[name].choices.length - 1
            let idx = this.all[name].choices.findIndex((f)=>{
                return f.version == config.version  && !f.imported && f.local
            }) 
            // if (idx == -1){
            config.idx = maxIdx + 1
            config.imported = false 
            config.remote = false
            config.removable = false
            config.local = true
            this.all[name].choices.push(config) 
            
         
        }  
    }
    addRemote(config, name){
        if (!this.all[name]){
            this.defineEntry(name)
        }
        if (Array.isArray(config)){
            let maxIdx = this.all[name].choices.length - 1
            config.forEach((con)=>{
                let idx = this.all[name].choices.findIndex((f)=>{
                    return f.version == con.version && !f.local && !f.imported && f.remote
                })
                
                    con.idx = maxIdx + 1
                    maxIdx +=1
                    con.imported = false
                    con.remote = true
                    con.removable = false
                    if (idx > -1){
                        this.all[name][idx] = con
                    } else {
                        this.all[name].choices.push(con) 
                    }
                    
             
            })            
        } else { 
            let maxIdx = this.all[name].choices.length - 1
            let idx = this.all[name].choices.findIndex((f)=>{
                return f.version == config.version && !f.local && !f.imported && f.remote
            })
                config.idx = maxIdx + 1
                config.imported = false 
                config.remote = true
                config.removable = false
                if (idx > -1){
                    this.all[name][idx] = config    
                } else {
                    this.all[name].choices.push(config) 
                }
        }   
        return   
    } 
    async getRemotes(target, catalog){
        const $this = this;
        let modules = await fetch_external_yamls(catalog)
        if (modules && modules.length > 0){
            modules.forEach((f)=>{
                this.addRemote(f, f.name)    
            })
        } else {  
            store.logger.info("No modules found at remote location")
        }  
        return modules
       
        
    }
    removeDependencies(choices){
        let targets = []
        choices.map((choice,idx)=>{
            choice.procedures.map((f)=>{
                f.dependencies.map((u)=>{
                    let idx = targets.findIndex((o)=>{
                        return o.target.trim() == u.target.trim()
                    })
                    if (idx == -1){
                        targets.push(parseConfigVariables(JSON.stringify(u), store.system))
                    }
                })
            })
        })
        let promises = []
        targets.forEach((target)=>{
            promises.push(removeDep(target))
        })
        
    }
    async removeModule(name, idx, dependencies){
        if (dependencies && this.all[name].choices){
            try{ 
                if (idx >=0 ){
                    this.removeDependencies( [ this.all[name].choices[idx] ] )
                } else {
                    this.removeDependencies(this.all[name].choices)
                }
            } catch (err){ 
                store.logger.error("Remove Dependencies failed %s", err)
            } 
        }
        try{  
            if (idx >=0 && this.all[name] ){
                try{ 
                    if (this.all[name] && 
                        this.all[name].choices[idx] && 
                        this.all[name].choices[idx].path && 
                        this.all[name].choices[idx].removable
                    ){ 
                        removeFile(this.all[name].choices[idx].path)
                        this.all[name].choices[idx].path = null
                        this.all[name].choices[idx].imported = false
                    }
                     
                } catch(er){
                    store.logger.error("%s error in removing path to yaml file %s", er, name)
                } 
            } else if (this.all[name]) {   
                try{  
                    this.all[name].choices.forEach((m,i)=>{
                        if (m && m.path && m.path && m.removable){ 
                            removeFile(m.path) 
                            m.path = null
                            m.imported = false
                        }
                         
                    })   
                } catch(er){
                    store.logger.error("%s error in removing path to yaml file %s", er, name)
                }
            } 
        } catch(err){
            store.logger.error("Err in remove paths: %s", err)
        }
        
         
    } 
    async checkAvailableModule(name, autocreate){
        if (this.all[name] && this.all[name].choices.length > 0){
            if (autocreate){
                this.create_module(this.all[name].choices[0], name, name )
            } 
            return true
        }
    }
    async importModules(){
        let module_paths = store.system.modules
        let promises = []
        module_paths.savedPaths.forEach((item)=>{ 
            promises.push(import_cfgs(item))
        })
        
        let results_default = await Promise.allSettled(promises)
        results_default.forEach((result, index)=>{
            if (result.status == 'fulfilled'){ 
                result.value.forEach((config)=>{
                    config.map((d)=>{
                        let version = ( d.version ? d.version : 0 )
                        if (d.version == "local"){
                            d.version = 0    
                        }
                        if (module_paths.savedPaths[index].custom){
                            version = 0
                        } else if (module_paths.savedPaths[index].remote){
                            version = module_paths.savedPaths[index].version
                        } 
                        d.local = module_paths.savedPaths[index].local
                        d.custom = module_paths.savedPaths[index].custom
                        d.remote = module_paths.savedPaths[index].remote
                        d.version = version 
                        try{
                            this.addLocal(d, d.name)
                        } catch (err){
                            store.logger.error(err)
                        }
                    })
                    
                    
                })
            }
        })
        promises = []
        promises.push(import_cfgs(module_paths.importPath[0] ))
        results_default = await Promise.allSettled(promises)
        results_default.forEach((result, index)=>{
            if (result.status == 'fulfilled'){ 
                result.value.forEach((config)=>{
                    let localIdx = -1 
                    if (this.locals[config.name]){
                        localIdx = this.locals[config.name].findIndex((f)=>{
                            return f.version == config.version
                        })
                    }
                    this.addImported(config, config.name,  true)
                    
                })  
            }
        })
        return 
    }
    async init_modules(){
        let $this = this
        return new Promise((resolve, reject)=>{
            store.logger.info("Initiating status of modules and meta in fetch.........................") 
            
            init_modules().catch((err)=>{
                reject(err)
            })
            resolve()
        })
    }


}