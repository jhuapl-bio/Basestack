import { getFiles, readFile } from "./configurations";
const YAML = require("js-yaml") 
var { store } = require("./store.js");
import { Process } from './process'
import { parseConfigVariables, traverse_object } from "./definitions";
import { ipcMain } from 'electron'

export class Module {
    processes: Process[]
    
    mainWindow: any
    interval: ReturnType<typeof setInterval> | undefined;
    constructor() {
        
        this.processes = [] 
        this.mainWindow = null 
        ipcMain.handle('runModule', async (event: any, params: Object) => {
            try {
                let processid = await this.runModule(event, params)
                return processid
            } catch (err) {
                console.error(err,"<<<<<< in install dep")
            }
        })
    }
    


    //add a runModule that first calls the run command to parse the run string from integration.ts, 
    // then, if the run command is a module, it will call the module's run function
    // make it an async function as well with await
    async runModule(event: any, params: Object) {
        console.log(params)
        params['format'] = params['key']
        let proc = new Process(params) 
        proc.addtoqueue()
        return proc['status']['id']
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
        // let proc = new Process(params)
        // proc.addtoqueue()        
    }
}