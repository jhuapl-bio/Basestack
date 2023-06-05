import { getFiles, readFile } from "./configurations";
const YAML = require("js-yaml") 
var { store } = require("./store.js");
import { Process } from './process'
import { parseConfigVariables, traverse_object } from "./definitions";

export class Module {
    processes: Process[]
    
    mainWindow: any
    interval: ReturnType<typeof setInterval> | undefined;
    constructor() {
        
        this.processes = []
        this.mainWindow = null 
         
    }
    async importModules() {
        const $this = this
        return new Promise<any[]>((resolve, reject) => {
            store.system.localModulesPath.map(async (depthPath: string) => {
                let files2 = await getFiles(depthPath)
                let promises: any[] = []
                if (files2 && files2.length > 0) {
                    files2.map((filepath) => {
                        promises.push(readFile(filepath, false))
                    })
                    let results = await Promise.allSettled(promises)
                    let inputdata: any = {}
                    results.map((result:any , index) => {
                        let yamldata: any = parseConfigVariables(result.value, store.system)
                        if (yamldata) {
                            yamldata.map((value) => {
                                traverse_object(value)
                                store.modules.push(value)
                            })
                            
                        }
                    })
                    resolve(inputdata)

                } else {
                    resolve([])
                }
            })
        })
    }
    start(params: Object) {
        console.log(params)
        // let proc = new Process(params)
        // proc.addtoqueue()        
    }
}