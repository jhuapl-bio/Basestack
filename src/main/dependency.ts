import { checkExists, getFiles, readFile } from "./configurations";
const YAML = require("js-yaml") 
var commandExists = require('command-exists');
var { store } = require("./store.js");
import { ipcMain } from 'electron'
import { Process } from './process'
import { checkImageExists } from "./docker";
import { checSingularityInstanceExists } from "./singularity";

import { parseConfigVariables } from "./definitions";
export class Dependency {
    checkingExists: boolean
    processes: Process[]
    dependencies: {
        executions: Object,
        images: Object, 
        files: Object
    }
    mainWindow: any
    interval: ReturnType<typeof setInterval> | undefined;
    constructor() {
        this.dependencies = {
            executions: [],
            images: [],
            files: []
        } 
        this.processes = []
        this.mainWindow = null 
        this.checkingExists = false
        ipcMain.handle('installDependency', async (event: any, dep: Object) => {
            try {
                this.installDependency(dep)
            } catch (err) {
                console.error(err,"<<<<<< in install dep")
            }
        })
        this.interval = setInterval(async () => {
            if (!this.checkingExists) { 
                this.checkingExists = true 
                let results: void = await this.checkDependencyExists() 
                this.mainWindow.webContents.send('getDependencies', this.dependencies)
                this.checkingExists = false
            }
        }, 3000)   
    }
    sendDepUpdate(type: string, index: number, choice: number | null) {
        this.mainWindow.webContents.send('getDependency', {
            type: type,
            index: index,
            choice: choice,
            dep: this.dependencies[type][index]['choices'][choice]
        })
    }
    removeProcess(processidx: number, id: string) {
        let proc = store.processes[processidx]
        if (proc['params'].dependency) { // is a dependency install process
            let findindex = this.dependencies[proc.params.type][proc.params.index].processes.findIndex(x => x == id)
            this.dependencies[proc.params.type][proc.params.index].processes.splice(findindex, 1)
            this.sendDepUpdate(proc.params.type, proc.params.index, proc.params.choice)
        } else { // is a module 

        }
    }
    async installDependency(params: Object  ) {
        let platform = process.platform
        let index = this.dependencies[params['type']][params['index']].os == 'any' ? 0 : this.dependencies[params['type']][params['index']].os.findIndex(x=>x == platform)
        if (index > -1) {
            for (let key of Object.keys(this.dependencies[params['type']][params['index']].choices[params['choice']])) {
                params[key] = this.dependencies[params['type']][params['index']].choices[params['choice']][key]
            }
            params['label'] = this.dependencies[params['type']][params['index']]['label']
            let proc = new Process(params)
            // proc.start()
            proc.addtoqueue()
            this.processes[params['choice']] = proc
            this.dependencies[params['type']][params['index']].processes.push(proc.id)
            this.sendDepUpdate(params['type'], params['index'], params['choice'] )
            
            
        }
        
        return 
    }
    async checkDependencyExists() {
        const $this = this
        Object.keys(this.dependencies).map(async (type) => {
            this.dependencies[type].map(async (item: any, i: number) => {
                item.choices.map(async (choice: Object, ix: number) => {
                    if (type == 'executions') {
                        await commandExists(item.key, async function (err, commandExists) {
                            if (commandExists) {
                                $this.dependencies[type][i].choices[ix].status.command = item.keys
                                $this.dependencies[type][i].choices[ix].status.exists = commandExists
                            } else {
                                $this.dependencies[type][i].choices[ix].status.command = item.key
                                $this.dependencies[type][i].choices[ix].status.exists = false
                            }
                            return

                        })
                    } else if (type == 'images') {
                        let results: Object = {
                            installed: String,
                            size: Number
                        }
                        if (choice['format'] == 'singularity') {
                            results = await checkExists(choice['to'], false)
                            try {
                                $this.dependencies[type][i].choices[ix].status.info = results
                                $this.dependencies[type][i].choices[ix].status.exists = results['exists'] 
                            } catch (err: any) {
                                $this.dependencies[type][i].choices[ix].status.exists = false
                                store.logger.error(`${err.message} error in checking if a singularity dep. exists in your environment`)
                            }
                        } else {
                            results = await checkImageExists(choice['target'])
                            try {
                                $this.dependencies[type][i].choices[ix].status.info = results
                                $this.dependencies[type][i].choices[ix].status.exists = results['installed'] ? true : false
                            } catch (err: any) {
                                $this.dependencies[type][i].choices[ix].status.exists = false
                                store.logger.error(`${err.message} error in checking if an image exists in your environment`)
                            }
                        }
                    } else if (type == 'files') {
                        let results: Object = {
                            installed: String,
                            size: Number
                        } 
                        results = await checkExists(choice['target'], false)
                        try {
                            $this.dependencies[type][i].choices[ix].status.info = results
                            $this.dependencies[type][i].choices[ix].status.exists = results['exists'] ? true : false
                        } catch (err: any) {
                            $this.dependencies[type][i].choices[ix].status.exists = false
                            store.logger.error(`${err.message} error in checking if an file exists in your environment`)
                        }
                    }
                    else if (type == 'files') {
                        let results: Object = {
                            installed: String,
                            size: Number
                        }
                        results = await checkExists($this.dependencies[type][i].choices[ix].to, false)
                        try {
                            $this.dependencies[type][i].choices[ix].status.info = results
                            $this.dependencies[type][i].choices[ix].status.exists = results['exists'] ? true : false
                        } catch (err: any) {
                            $this.dependencies[type][i].choices[ix].status.exists = false
                            store.logger.error(`${err.message} error in checking if an file exists in your environment`)
                        }
                    }
                })             
                $this.dependencies[type][i]['status']['exists'] = item.choices.some((f: Object) => {
                    return f['status']['exists']
                })
            })
        })


        return 
    }
    async importDependencies() {
        const $this = this
        return new Promise<any[]>((resolve, reject) => {
            store.system.dependencies.map(async (depthPath: string) => {
                let files2 = await getFiles(depthPath)
                let promises: any[] = []
                if (files2 && files2.length > 0) {
                    files2.map((filepath) => {
                        promises.push(readFile(filepath, false))
                    })
                    let results = await Promise.allSettled(promises)
                    let inputdata: any = {}
                    results.map((result, index) => {
                        if (result.status == 'fulfilled') {
                            let yamldata = parseConfigVariables(result.value, store.system)
                            if (yamldata) {
                                for (let key of Object.keys(yamldata)) {
                                    yamldata[key].map((value) => {
                                        let pushable = 0
                                        if (value.choices) {
                                            // if (value.label == 'Nextflow') {
                                            const choicesd = value.choices.reduce(function (a, x, i) {
                                                let pushable = (  x.arch == 'any' || !x.arch || (Array.isArray(x.arch) ?
                                                    (x.arch.findIndex(y => y == process.arch)) :
                                                    (x.arch === process.arch))
                                                    &&
                                                    (Array.isArray(x.platform) ?
                                                        (x.platform.findIndex(y => y == process.platform)) :
                                                        (x.platform === process.platform && x.arch == process.arch)) ||
                                                    x.platform == 'any' 
                                                )

                                                if (pushable) {
                                                    a.push(i);
                                                }
                                                        
                                                return a;
                                            }, []);
                                            const c = choicesd.map((e) => {
                                                value.choices[e].status = {
                                                    exists: false,
                                                    building: false, 
                                                    error: null
                                                }
                                                return value.choices[e]
                                            })
                                            value.choices = c
                                            if (choicesd.length > 0) {
                                                value.status = {
                                                    exists: false, 
                                                    command: ''
                                                }
                                                value.processes = []
                                                $this.dependencies[key].push(value)
                                            }
                                        // }
                                        }
                                    })
                                }
                            }
                        }
                    })
                    resolve(inputdata)

                } else {
                    resolve([])
                }
            })
        })
    }
}