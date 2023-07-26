import { app, dialog, BrowserWindow, ipcMain, IpcRenderer, session, shell, ipcRenderer } from 'electron';
import { Client } from './client'
import { define_configuration, importDependencies } from './definitions';
import { Process } from './process';
var { store } = require("./store.js");
import fs from "fs"
import {join} from 'path';

import YAML from "yaml"
import path from "path"
import { run } from './integration'
app.whenReady().then(() => {            

    const client = new Client(app) 
    store.client = client
    client.createWindow()
    // /////// Set IPC Functions
    client.log("Setting IPC Functions")
    ipcMain.handle('log', async (event, message) => {
        client.logger.info(message)
    })
    ipcMain.handle('process-create', async (event: Event, key: string) => {
        client.logger.info(' create process _________________________________')
        client.createProcess(key)
    })
    ipcMain.handle('restartProcess', async (event: Event, key: string) => {
        client.logger.info(key + ' restart process _________________________________')
        client.restartProcess(key)
    })
    ipcMain.handle('removeProcess', async (event: Event, id: string) => {
        client.logger.info(id + ' remove process _________________________________')
        let processidx = store.processes.findIndex(x => x.id == id)
        if (processidx > -1) {
            let proc = store.processes[processidx]
            proc.stop()
            client.dependencies.removeProcess(processidx, id)
            store.processes.splice(processidx, 1)
            client.mainWindow.webContents.send('removedProcess', id)
        } else {
            store.logger.error(`${id} process not found, skipping removal...`)
        }
    })
    ipcMain.handle('requestLogs', async () => {
        client.mainWindow.webContents.send('getLog', client.logger.logs)
    })
    ipcMain.handle('sendSideTab', async (event: any, tab: number) => {
        console.log(tab)
        client.mainWindow.webContents.send('getSideTab', tab)
    })
    ipcMain.handle('requestDependenciesInfo', async (event: any, params: any) => {
        // Iterate through client.dependencies.dependencies and send the info to the renderer
        // loop through params (which is a list of dependencies marked by a key and type
        // match all dependencies like dependencies[params['type']][params['key']]
        // return a list which has the index, type, index, and choiceidx (since each dep has choices like dep.choices)
        // send the list to the renderer
        let results: any[] = []
        if (params){
            if (Array.isArray(params)){
                params.map((param: any) => {
                    let idx = client.dependencies.dependencies[param['type']].findIndex((dep: any) => dep.key == param['key'])
                    if (idx>-1){
                        let dep = client.dependencies.dependencies[param['type']][idx]
                        results.push({type: param['type'], ...dep, 'idx': idx, 'choiceidx': dep.choices.findIndex((choice: any) => choice.value == dep.value)})
                    }
                }
                )
            } else {
                let idx = client.dependencies.dependencies[params['type']].findIndex((dep: any) => dep.key == params['key'])
                if (idx>-1){
                    let dep = client.dependencies.dependencies[params['type']][idx]
                    results.push({ type: params['type'], ...dep, 'idx': idx, 'choiceidx': dep.choices.findIndex((choice: any) => choice.value == dep.value)})
                }
            }
            client.mainWindow.webContents.send('sendRequirementInfo', results)
        }
    })
    ipcMain.handle('getDepStatus', async (event: any, params: any) => {
        let dep = client.dependencies.dependencies[params['type']][params.index].choices[params.choice]
        if (dep){
            let data = {...dep.status, 'icon':dep.icon, 'key': params['key']} 
            // client.mainWindow.webContents.send('requestDepStatusReturn', data )
            return data
        } else {
            return null
        }
    })
    ipcMain.handle('requestDependenciesStatus', async (event: any , params: object[] | object ) => {   
        if (Array.isArray(params)){
            params.map((param: any) => { 
                let idx = client.dependencies.dependencies[param['type']].findIndex((dep: any) => dep.key == param['key'])
                console.log( {...client.dependencies.dependencies[param['type']][idx].status, 'key': param['key']})
                if (idx>-1){
                    let dep = client.dependencies.dependencies[param['type']][idx]
                    
                    client.mainWindow.webContents.send('getDependenciesStatus', {...dep.status, 'icon':dep.icon, 'key': param['key']})
                }
            })
        } else {
            let idx = client.dependencies.dependencies[params['type']].findIndex((dep: any) => dep.key == params['key'])
            if (idx>-1){
                let dep = client.dependencies.dependencies[params['type']][idx].status
                client.mainWindow.webContents.send('getDependenciesStatus', {...dep, 'icon':dep.icon, 'key': params['key']} )
            }
        }
    })
    ipcMain.handle('getFile', async (event: any, filePath: string) => {
        try {
            let data = await fs.readFileSync(filePath, 'utf8')
            return data
        } catch (err: any) {
            client.logger.error(err)
            return null
        }
    })
    ipcMain.handle('fetchDependencies', async (event, message) => {
        client.mainWindow.webContents.send('getDependencies', client.dependencies.dependencies)
    }) 
    ipcMain.handle('selectFile', async (event: any) => {
        const { filePaths } = await dialog.showOpenDialog({
            properties: ['openFile']
        })
        return filePaths ? filePaths[0] : null
        
    }) 
    interface Params {
        module: string;
        type: string;
        value: any;
    }
    ipcMain.handle('updateCurrentModule', (event, params: Params) => {
        if (params.type == 'variable') {
            client.mainWindow.webContents.send('getVariable', params)
        } else if (params.type == 'run'){
            client.mainWindow.webContents.send('getRun', params)
        } else if (params.type == 'customModule'){
            client.mainWindow.webContents.send('customModule', params)
        } 
    })
    ipcMain.handle('addVariable', (event, params: Params) => {
        client.mainWindow.webContents.send('addedVariable', params)
    })
    ipcMain.handle('saveFileBackendDefault', async (event: any, 
            data: any, 
            type: string | null, 
            name: string,
            locationDefault: string 
        ) => {
        // call electron savedialogsync to save file with data
        let mapping = {
            'customModule': store.system.customModulesPath,
        }
        let filePath = path.join(mapping[locationDefault], `${name}.custom.yaml`)
        // // check if type is null or not, if it isn't then use regex to match the extension. If the ext isn't the same, append type
        if (type && type.length >0 && filePath && filePath.length > 0) {
            //get ext using path parse
            let ext = path.parse(filePath).ext
            // if ext starts with '.' delete it
            if (ext.startsWith('.')) {
                ext = ext.substring(1)
            }
            // if ext doesnt exists or is null or doesnt equal type 
            if (!ext || ext != type) {
                filePath += `.${type}`
            }
        }
        if (filePath) { 
            // check if the directory of filePAth exists, if not, then make it otherwise just make the file
            if (!fs.existsSync(path.dirname(filePath))) {
                await fs.mkdirSync(path.dirname(filePath), { recursive: true })
            }
            try{
                let result = await fs.writeFileSync(filePath, YAML.stringify(YAML.parse(data)))
                client.logger.info(`file saved to ${filePath}`)
                client.mainWindow.webContents.send('success', `file saved to ${filePath}`)
                return result
            } catch (err: any){
                client.logger.error(err)
                client.mainWindow.webContents.send('error', err)
                throw err 
            }
             
        }
    })
    ipcMain.handle('addedVariableRequest', (event: any, varname: string)=>{
        console.log("event!")
        client.mainWindow.webContents.send('addedVariableRequestReturn', varname)
    })
    
    ipcMain.handle('saveFile', async (event: any, data: any, type: string | null, locationDefault: string | null) => {
        // call electron savedialogsync to save file with data
        let { filePath }: any | null = await dialog.showSaveDialog({
            properties: ['showHiddenFiles'],
            title: 'Save File',
        })
        // check if type is null or not, if it isn't then use regex to match the extension. If the ext isn't the same, append type
        if (type && type.length >0 && filePath && filePath.length > 0) {
            //get ext using path parse
            let ext = path.parse(filePath).ext
            if (!ext || ext != type) {
                filePath += `.${type}`
            }
        }
        if (filePath) {
            fs.writeFile(filePath, data, (err: any) => {
                if (err) {
                    client.logger.error(err)
                    return
                }
                client.logger.info(`file saved to ${filePath}`)
            })
        }
    })
    
    
    ipcMain.handle('fetchEnv', async (event, message) => {
        // client.mainWindow.webContents.send('watchEnv', {
        //     version: process.env.version,
        //     port: 5023,
        //     os: client.os,
        //     logDir: store.system.logPath,
        //     releaseNotes: client.updater.releaseNotes
        // })
        return {
            version: process.env.version,
            port: 5023,
            os: client.os,
            logDir: store.system.logPath,
            releaseNotes: client.updater.releaseNotes
        }
    })
    ipcMain.handle('open-url', (event, url) => {
        client.logger.info(`opening url: ${url}`)
        shell.openExternal(url)
    })
    //add ipcMain run handler
    //run is imported from integration.ts file
    ipcMain.handle('run', async (event, command) => {
        client.logger.info(`running command: ${command}`)
        let parsed_command = run(command, process.platform)
        console.log("parsed command", parsed_command)
    })
    ipcMain.handle('openpath', (event, url) => {
        client.logger.info(`opening location of path: ${url}`)
        shell.openPath(url)
    })
    ipcMain.handle('requestProcesses', (event, url) => {
        client.logger.info(`fetching processes ran or currently running`)
        let processes = store.processes.map((process: Process) => {
            return process.status
        })
        client.mainWindow.webContents.send('getProcesses', processes)
    })
    ipcMain.handle('checkFileExists', (event, filePath) => {
        fs.access(filePath, fs.constants.F_OK, (err: any) => {
            if (err){
                client.logger.error(`${err.stack}`)
            } else {
                client.mainWindow.webContents.send('sendExistsFile', !err)
            }
          
        })
    })
    ipcMain.handle('getLibrary', () => {
        client.logger.info(` requesting a list of all available modules in the library`)
        sendLibrary()
    }) 
    // ///////////////
    const sendLibrary = ()=> {
        let choices = Object.values(client.library.all).map((d: any) => {
            return d.choices[0]
        })
        client.mainWindow.webContents.send('libraryNames', choices)
    }
    define_configuration(store.system).then(async (config: any) => {
        try {
            // Set up the logging object for rendering to console AND filesystem log files
            process.env.logfile = config.logs.logfile
            importDependencies(store.system).then(async (results) => {
                // client.logger.info(results)
                  
                await client.initLibrary()
                await client.initDependencies()
                await client.initModules()
                sendLibrary()
            }) 
            process.env.errorfile = config.logs.error

            // Check if the node.js server is running
            client.logger.info("Checking node env for server")
        } catch (err: any) {
            console.log("ERRR", err)
            client.logger.error(`${err} error in connecting to the server`)
            dialog.showMessageBox(client.mainWindow, { // If the app ever failes to start up, report it
                type: 'error',
                defaultId: 0,
                buttons: ['Ok'],
                title: 'Error',
                message: (err.message ? err.message : JSON.stringify(err, null, 4)),
            });
        }
    }).catch((err) => {
        client.logger.error(`${err} error in connecting to the apps configurations`)
        dialog.showMessageBox(client.mainWindow, { // If the app ever failes to start up, report it
            type: 'error',
            defaultId: 0,
            buttons: ['Ok'],
            title: 'Error',
            message: (err.message ? err.message : JSON.stringify(err, null, 4)),
        });
    })
    client.createUpdater()
    client.logger.info("Creating menu ")
    // client.createMenu(); 
    client.logger.info("Checking for updates...")
    // client.checkUpdates()
    setTimeout(() => client.mainWindow.webContents.toggleDevTools(), 900)
    
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
        callback({
            responseHeaders: {
                ...details.responseHeaders,
                'Content-Security-Policy': ['script-src \'self\'']
            }
        })
    })

    app.on('activate', function () {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
         

    });
});

function createWindow () {
    const mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
        preload: join(__dirname, 'preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
      }
    });
  
    if (process.env.NODE_ENV === 'development') {
      const rendererPort = process.argv[2];
      mainWindow.loadURL(`http://localhost:${rendererPort}`);
    }
    else {
      mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
    }
  }

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
    console.log(message,"this is a message");
})
