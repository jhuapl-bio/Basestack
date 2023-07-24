var { store } = require("./store.js");
import path from "path"
// import run from integration.ts file 
import { run } from './integration'

import axios from 'axios'
const { BrowserWindow } = require('electron')
const { download } = require('electron-dl') 
import { spawn } from 'child_process'
import { installDockerImage, formatBindMounts } from './docker'
import { writeFolder, checkExists, formatBuffer, decompress_file } from './configurations';
import * as crypto from "crypto";
const fs = require("fs")
// import axios, * as others from 'axios';
import https from 'https'
import { bytesToSize } from "./functions";
const agent = new https.Agent({
    rejectUnauthorized: false
});
export class Process {
    logger: any 
    process: any 
    params: any
    outputs: any
    id: String
    label: String
    public logs() {
        return this.status['logs']
    }
    status: Object = {
        id: String, 
        label: String,
        icon: String, 
        type: String, 
        running: Boolean,
        code: Number,
        error: [],
        output: [],
        logs: [],
        progress: null,
        command: String
    }
    dependencies: any
    stream: any
    constructor(params: Object) {
        this.params = params
        this.id = crypto.randomBytes(20).toString('hex');
        this.logger = store.logger 
        this.label = params['target']
        this.status['label'] = params['label']
        this.status['running'] = false
        this.status['command'] = ""
        this.status['code'] = -1
        this.status['progress'] = null
        this.status['type'] = params['type']
        this.status['id'] = this.id
        this.status['icon'] = this.getIcon()
        this.status['choice'] = params['choice']
        this.status['index'] = params['index']
        this.status['type_install'] = params['type_install']
        this.status['installation'] = params['installation']
        this.status['format'] = params['format']
        this.status['to'] = params['to']
        this.status['target'] = params['target']
        this.status['from'] = params['from']
        this.status['dependency'] = params['dependency']
        this.dependencies = store.dependencies
    }
    async stop() {
        if (this.status['running']) {
            if (this.params.type_install == 'get') {
                this.stream.destroy()                
            } else {
                this.stream.kill()
            }
        }
    }
    async addtoqueue() {
        this.sendStatus()
        store.queue.add(() => this.start())
    }
    // Make a function that watches all outputs, if a change occurs, then send status after running fs.stat on it if it is a file or directory or static-file or static-directory or list-files or list-directory
    async watchOutputs(outputs: any) {
        let $this = this
        outputs.map((output: any) => {
            if ([ 'static-file', 'static-directory', 'list-files', 'list-directory', 'file', 'directory'].includes(output['element'] ) ){
                fs.watch(output['value'], { recursive: true }, (eventType, filename) => {
                    if (filename) {
                        
                        fs.stat(output['value'], (err, stats) => {
                            if (err) {
                                store.logger.error(err)
                            } else { 
                                let msg = `${eventType} in: ${output['value']}; ${bytesToSize(stats.size)} now`
                                output.size = bytesToSize(stats.size)
                                store.client.mainWindow.webContents.send('outputStatus', output)
                                $this.status['logs'].unshift(msg)
                            }
                        })
                    }
                })
            }
        })
    }
    async start() {
        let findindex = store.processes.findIndex(x => x == this.id)
        if (findindex > -1) {
            store.processes[findindex] = this
        } else {
            store.processes.push(this)
        }
        if (this.params.type == 'module'){
            let comm = run(this.params.command)
            if (!this.params.arguments){
                this.params.arguments = []
            } 
            if (!this.params.img && this.params.exec == 'docker'){
                this.params.img = "ubuntu:latest"
            } 
            
            store.client.logger.info(`________________________________________________`)
            // iterate through this.params.params, check static-file, static-directory, list-files, list-directory, file, directory, mkdrip the directory if doesnt exist. If list-files, make sure to move through the list/array of things as well 
            // if the file or directory doesnt exist, create it
            // if the file or directory does exist, check if it is a static file or directory, if so, do nothing, if not, delete it and create it
            Object.values(this.params.params).map((p:any)=>{
                if (p['type'] == 'static-file' || p['type'] == 'static-directory'){
                    // if static-file, check if it exists, if not, create the directory of the filepath
                    if (p['type'] == 'static-file'){
                        if (!fs.existsSync(path.dirname(p['value']))){
                            fs.mkdirSync(path.dirname(p['value']))
                        } 
                    }
                    else {
                        if (!fs.existsSync(p['value'])){
                            fs.mkdirSync(p['value'])
                        }
                    }
                } else if (p['type'] == 'list-files' || p['type'] == 'list-directory'){
                    p['value'].map((v:any)=>{
                        if (p['type'] == 'list-files'){
                            if (!fs.existsSync(path.dirname(v))){
                                fs.mkdirSync(path.dirname(v))
                            }
                        } else {
                            if (!fs.existsSync(v)){
                                fs.mkdirSync(v)
                            }
                        }
                    })
                } else if (p['type'] == 'file' || p['type'] == 'directory'){
                    if (p['type'] == 'file'){
                        if (!fs.existsSync(path.dirname(p['value']))){
                            fs.mkdirSync(path.dirname(p['value']))
                        }
                    } else {
                        if (!fs.existsSync(p['value'])){
                            fs.mkdirSync(p['value'])
                        }
                    }
                }
            })
            // run this.watchOutputs provig the params.outputs
            // if the process is a module, then run the command with the arguments
            this.watchOutputs(this.params.outputs)

            let command: any[]
            if(this.params.exec == 'conda'){
                // //check if "conda run is being used"
                command = ['conda', 'run', '-n', this.params.env, this.params.command]
            } else if(this.params.exec == 'docker'){
                let formattedParams = formatBindMounts(Object.values(this.params.params))
                command = ['docker', 'container', 'run', '-t', '--rm', 
                    ...this.params.arguments, 
                    // formattedParams.map((v:string)=> ` --mount ${v}`).join(" "), 
                    formattedParams.map((v:string)=> ` -v ${v}`).join(" "), 
                    this.params.env,  
                    this.params['pre-execute'] ? this.params['pre-execute'].join(" ") : '',
                    this.params.command, 
                ]
            } else if(this.params.exec == 'singularity'){
                command = ['singularity', 'exec', this.params.sif,  ...this.params.arguments, this.params.command]
            } else { // the process is native, no conda, docker, or singularity needed
                command = [this.params.command]
            }
            await this.runCommand(command.join(" "))
            
        } else {
            
            if (this.params.type_install == 'command') { 
                await this.runCommand(this.params.from)
            } else if (this.params.type_install == 'download' || this.params.type_install == 'fetch'){
                await this.downloadUrl(this.params.from, store.mainWindow)
            } else if (this.params.type_install == 'get' ) {
                await this.getUrl(this.params.from, this.params.to, store.mainWindow)
            } else if (this.params.type_install == 'pull') {
                await this.runPull(this.params) 
            } else {
                await this.runCommand(this.params)
            } 
        }
        
    }
    
    async getUrl(from: any, to: any, mainWindow: any) {
         this.status['command'] = `fetching target: ${from} to ${to}`
         this.stream = await this.downloadSource(from, to, true, mainWindow)
        await this.spawnLogWriter()
        return  
    }
    getIcon() {
        if (this.params['type'] == 'images') {
            return  this.params['format'] == 'singularity' ? 'mdi-relative-scale' : 'mdi-docker'
        } else if (this.params['type'] == 'executions') {
            return 'mdi-cpu-64-bit'
        } else if (this.params['type'] == 'files') {
            return 'mdi-folder'
        } else {
            return 'mdi-pipe'
        }
    }
    sendStatus() {
        store.mainWindow.send('processStatus', this.status)            
    }

    async downloadSource(url, target, follow, mainWindow) {
        const $this = this
        return new Promise<void>((resolve, reject) => {
            try {
                const p = path.resolve(target)
                const dirpath = path.dirname(target)
                writeFolder(dirpath).then(async () => {
                    try{
                        axios({ 
                            url:  url, 
                            responseType: 'stream',
                            method: 'get',
                        }).then(function (response) {
                            const data = response.data;
                            const headers = response.headers;
                            const writer = fs.createWriteStream(p);
                            
                            // get me an example axios request
                            
                            const len = headers['content-length']
                            var downloaded = 0
                            let timeout = 1000;
                            let seen = {
                                start: 0, 
                                end: .020
                            }
                            const stream = data
                            stream.pipe(writer);

                            stream.on('end', function () {
                                store.logger.info("ended stream")
                                $this.status['running'] = false
                                writer.destroy()
                                stream.destroy()
                            });
                            stream.on("data", (buffer) => {
                                var segmentLength = buffer.length;
                                
                                downloaded += segmentLength;
                                if (downloaded / len >= seen.start && downloaded / len <= seen.end) {
                                    let percent = (100 * downloaded / len).toFixed(0)
                                    let msg = ("Downloading " + percent + "% " + downloaded + " bytes to " + target)
                                    seen.start = .02 + downloaded / len
                                    seen.end = seen.end + .02
                                    writer.status = percent
                                    stream.status = percent
                                    $this.status['logs'].unshift(msg)
                                    store.logger.info(msg)

                                    $this.sendStatus()
                                }
                            })
                            writer.on("close", () => {
                                let msg = ("Download completed: 100% to " + target)
                                store.logger.info(msg)
                                $this.status['logs'].unshift(msg)
                                writer.status = 100
                                $this.sendStatus()
                                if (!follow) {
                                    resolve()
                                }
                            })
                            if (follow) {
                                resolve(stream)
                            }
                          });
                    } catch (err){
                        store.logger.error(`${err}`)
                    }
                }).catch((error1) => {
                    store.logger.error(error1)
                    reject(error1)
                })

            } catch (Err) {
                store.logger.error(`Got error: ${Err}`);
                reject(Err)
            }
        });
    }
    async spawnLogWriter() {
        return new Promise<void>((resolve, reject) => {
            const $this = this
            this.status['code'] = -1
            this.status['id'] = this.id
            this.status['error'] = []
            this.status['logs'] = []
            this.status['running'] = true
            this.sendStatus()
            this.stream.on('close', async (code: number) => {
                this.status['code'] = code
                this.status['running'] = false
                if ($this.params.decompress) {
                    $this.status['logs'].unshift(`${$this.params.decompress} decompressing...`)
                    checkExists($this.params.to, false).then((exists) => { 
                        if (exists) {
                            $this.status['running'] = true
                            this.logger.info(`download complete for ${this.params.to}`)
                            decompress_file($this.params.to, $this.params.decompress).then(() => {
                                $this.status['running'] = false
                            }).catch((err) => {
                                store.logger.error(`Error in decompressing file: ${$this.params.to} ${err.message}`)
                                $this.status['running'] = false
                            }).finally(() => {
                                this.sendStatus()
                            })
                        } else {
                            store.logger.error(`${$this.params.to} doesnt exist, exiting decompress....`)
                        }

                    })
                }
                this.sendStatus()
                resolve()
            })
        })

    }
    async spawnLog() {
        const $this = this
        return new Promise<void>((resolve, reject) => {
            const $this = this
            let command = $this.status['command'] 
            this.stream = spawn(command, { shell: true });
            this.status['code'] = -1
            this.status['id'] = this.id
            this.status['error'] = []
            this.status['logs'] = []
            this.status['running'] = true
            this.sendStatus()
            this.stream.stdout.on('data', (data) => {
                let msg = `stdout: ${data}`
                msg = formatBuffer(msg)
                $this.status['logs'].unshift(msg)
                
            
                store.logger.info(msg)
            });
            this.stream.stderr.on('data', (data) => {
                let msg = `stderr: ${data}`
                msg = formatBuffer(msg)
                $this.status['logs'].unshift(msg)
                $this.status['error'].unshift(`${msg}`)
                this.sendStatus()
                store.logger.error(msg)
            });
         
            this.stream.on('close', (code: Number) => {
                this.status['code'] = code
                this.status['running'] = false
                store.logger.info(`code ${code}: exit on command run ${$this.status['command']}`)
                this.sendStatus()
                resolve()
            })
        })
    }
    async runPull(params: Object) {
        try {
            if (!params['from']) {
                store.logger.error(`No image to pull`)
                this.status['error'] = [`No image to pull`]
                this.status['logs'].unshift(`No image to pull`)
                return
            }
            this.status['command'] = `docker pull ${params['from']}`
            store.logger.info(`docker pull ${params['from']}`)
            this.status['logs'].unshift(this.status['command'])
            this.stream = await installDockerImage(params['from'])

            await this.spawnLog()
            
            return 
        } catch (err: any) {
            store.logger.error(`${err} Error in pulling Docker Image ${params['from']}`)
        }
        
    }
    async runStandardCommand(params: Object) {
        await this.spawnLog()
        return 
    }
    createProcess(params: Object) {
        this.start()
       
    }
    downloadUrl = async (url: string, mainWindow: any) => {
        this.status['command'] = `http(s) get ${url}`
        this.status['logs'].unshift(this.status['command'])
        const win2 = BrowserWindow.getFocusedWindow();
        let downloading = download(win2, url, {
            overwrite: true,
            openFolderWhenDone: true
        });
        this.stream = downloading
        //Send to the renderer the download status starting
        mainWindow.webContents.send("dockerDownloadStatus", {
            "type": "info",
            "message": `Downloading file now.. check toolbar for status. Please open the file when complete`
        })
        downloading.then((event) => { // At the end of the above download, send to renderer that it is done and should be executed manually 
            let filepath = event.getSavePath()
            mainWindow.webContents.send("dockerDownloadStatus", {
                "type": "success",
                "info": `Downloaded success to: ${filepath}. `,
                message: "Please open the .dmg (double-click) file to extract and complete installation"
            })
        })
    }

    runCommand = async (command: string | string[] | number[] ) => {
        this.status['command'] = command
        this.status['logs'].unshift(command)
        await this.spawnLog()
        return
    }



}