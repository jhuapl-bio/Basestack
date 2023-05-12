
var { store } = require("./store.js");
import { import_cfgs, getFiles } from "./configurations"
export class Library {
    
    modules: any
    all: any = {}
    catalog: any
    locals: any
    selected: any
    imported: any
    constructor() {
        
    }
    getIndexVersion(name) {
        let indx = 0
        if (this.catalog[name] && this.catalog[name].config) {
            let indx = this.all[name].choices.findIndex((f) => {
                return f.version == this.catalog[name].config.version
            })
        }
        return indx
    }
    
    defineEntry(name: string) {
        const $this = this
        if (!this.all[name]) {
            this.all[name] = {
                choices: []
            }
            Object.defineProperty($this.all[name], "imported", {
                enumerable: true,
                get: function () {
                    let any = $this.all[name].choices.some((a) => {
                        return a.imported
                    })
                    return any
                }
            })
            Object.defineProperty($this.all[name], 'selected', {
                enumerable: true,
                get: function () {
                    let base2 = $this.getIndexVersion(name)

                    return base2

                }
            })
            Object.defineProperty($this.all[name], "latest", {
                enumerable: true,
                get: function () {
                    let sorted = $this.all[name].choices.sort((a, b) => {
                        b.version - a.version
                    })
                    return sorted[0]
                }
            })
        }
    }
    addLocal(config, name) {
        if (!this.all.hasOwnProperty(name) ) {
            this.defineEntry(name)
        }
        if (Array.isArray(config)) {
            let maxIdx = this.all[name].choices.length - 1
            config.forEach((con) => {
                let idx = this.all[name].choices.findIndex((f) => {
                    return f.version == con.version && !f.imported && f.local
                })

                con.idx = maxIdx + 1
                maxIdx += 1
                con.imported = false
                con.local = true
                con.remote = false
                con.removable = false
                con.id = `${con.path}-${con.version}-${con.imported}-${con.removable}-${con.name}-${con.remote}-local`
                this.all[name].choices.unshift(con)
            })

        } else {

            let maxIdx = this.all[name].choices.length - 1
            let idx = this.all[name].choices.findIndex((f) => {
                return f.version == config.version && !f.imported && f.local
            })
            config.idx = maxIdx + 1
            config.imported = false
            config.remote = false
            config.removable = false
            config.local = true
            config.id = `${config.path}-${config.version}-${config.imported}-${config.removable}-${config.name}-${config.remote}-local`
            this.all[name].choices.unshift(config)
            

        }
    } 
    async importLibrary() {
        let module_paths = store.system.localModulesPath
        let promises: any[] = []
        promises.push(import_cfgs(module_paths, ''))
  
        let results_default = await Promise.allSettled(promises)
        results_default.forEach((result, index) => {
            if (result.status == 'fulfilled') {   
                result.value.forEach((config) => {
                    config.map((d) => {
                        let version = (d.version ? d.version : 0)
                        if (d.version == "local") {
                            d.version = 0
                        }
                        d.version = version
                        try {
                            this.addLocal(d, d.name)
                        } catch (err) {
                            store.logger.error(err)
                        }
                    })


                })
            }
        })
        // promises = []
        // promises.push(import_cfgs(module_paths.importPath[0], ''))
        // results_default = await Promise.allSettled(promises)
        // results_default.forEach((result, index) => {
        //     if (result.status == 'fulfilled') {
        //         result.value.forEach((config) => {
        //             let localIdx = -1
        //             if (this.locals[config.name]) {
        //                 localIdx = this.locals[config.name].findIndex((f) => {
        //                     return f.version == config.version
        //                 })
        //             }
        //             this.addImported(config, config.name, true)

        //         })
        //     }
        // })
        return
    }
    addImported(config: { removable: boolean, imported: boolean, idx: number, local: boolean, version: string  }, name, removable) {

        const $this = this
        if (!this.all[name]) {
            this.defineEntry(name)
        }
        if (Array.isArray(config)) {
            let maxIdx = this.all[name].choices.length - 1
            config.forEach((con) => {

                let idx = this.all[name].choices.findIndex((f) => {
                    return f.version == con.version
                })

                if (idx == -1) {
                    con.idx = maxIdx + 1
                    maxIdx += 1
                    con.removable = removable
                    con.imported = true
                    con.local = true
                    this.imported[name].push(con)
                    this.all[name].choices.push(con)
                } else {
                    con.idx = maxIdx + 1
                    maxIdx += 1
                    config.removable = removable
                    con.local = true
                    con.imported = true
                    this.imported[name][idx] = con
                    this.all[name][idx] = con

                }

            })

        } else {
            let maxIdx = this.all[name].choices.length - 1
            let idx = this.all[name].choices.findIndex((f) => {
                return f.version == config.version && f.imported
            })
            if (idx == -1) {
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
}