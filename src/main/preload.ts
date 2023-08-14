import { contextBridge, ipcRenderer } from 'electron';
import path from 'path'
import fs from "fs"
function trimAllExtensions(filePath) {
    // remove all extensions, from a path, including things like f.tar.gz f.gz or f.tar.gz.2.2.2.g all to become f
    return filePath.replace(/(\.[^/.]+)+$/, '');

}
function trimSingleExtensions(filePath) {
    // remove only the first extensions
    return filePath.replace(/\.[^/.]+$/, '');


}
import { bytesToSize } from './functions';
var { store } = require("./store.js");
function basepath(filePath) {
    // remove all extensions from a path
    return filePath
}

contextBridge.exposeInMainWorld('electronAPI', { 
    // ////////////////////////////////Return the function directly for functions that are not allowed in renderer ////////////////////////////////////////////////////////////////
    sendMessage: (message: string) => ipcRenderer.send('message', message),
    basename: (message: string) => path.basename(message), // Return the function directly for functions that are not allowed in renderer
    directory: (message: string) => path.dirname(message), // Return the function directly for functions that are not allowed in renderer
    uppercase: (message: string) => message.toUpperCase(), // Return the function directly for functions that are not allowed in renderer
    lowercase: (message: string) => message.toLocaleLowerCase(), // Return the function directly for functions that are not allowed in renderer
    trim: (filePath: string) =>trimAllExtensions(filePath), // Return the function directly for functions that are not allowed in renderer
    trimSingle: (filePath: string) =>trimSingleExtensions(filePath), // Return the function directly for functions that are not allowed in renderer
    exists: async (filePath: string) => { 
        try{
            let stats: any = await fs.statSync(filePath)
            // convert the stats object size  to kb, mb, or gb
            stats['size'] = bytesToSize(stats['size'])
            return stats
        } catch (err){
            store.logger.error(err)
            return false
        }
    },
    
    // add the hsitory from the renderer to the main process history class
    recordHistory: (history: any) => {
        ipcRenderer.invoke('recordHistory', history)
    },
    addedVariableRequest: (varname: string) => {
        ipcRenderer.invoke('addedVariableRequest', varname)
    },
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    logger: (message: string) => {
        if (store.logger){
            store.logger.info(message, "message added")
        }
        ipcRenderer.invoke('log', message)
    },
    openurl: (url: string) => {
        ipcRenderer.invoke('open-url', url)
    },
    openDir: (location: string) => {
        ipcRenderer.invoke('openpath', path.dirname(location))
    },
    openPath: (location: string) => {
        ipcRenderer.invoke('openpath', location)
    },
    //add variable
    addVariable: (value: string) => {
        ipcRenderer.invoke('addVariable', value)
    },
    requestFileData: async (filepath: string) => {
        let data = await ipcRenderer.invoke('getFile', filepath)
        return data
    },
    requestCheckFileExists: (filepath: string)=>{
        ipcRenderer.invoke('checkFileExists', filepath) 
    }, 
    updateCurrentModule: (params: object)=>{
        ipcRenderer.invoke('updateCurrentModule', params)
    },
    selectFile:  async ()=>{
        let file = ipcRenderer.invoke('selectFile')
        return file 
    }, 
    requestLibraryNames: (event, library:any)=>{
        ipcRenderer.invoke('getLibrary').then((libraryResponse) => {
            library = libraryResponse
        })
    },  
    requestDepStatus: async ( params:any)=>{
        let data = await ipcRenderer.invoke('getDepStatus', params) 
        return data
    },
    requestHistory: async ()=>{ 
        ipcRenderer.invoke('getHistory')
    },
    requestEnv: async () => {
        console.log("reeqst")
        let data = await ipcRenderer.invoke('fetchEnv')
        return data
    },   
    loadFile: (params: object, type: string | null)=>{
        ipcRenderer.invoke('loadFile', params, type)
    }, 
    //save YAML file
    saveFile: (params: object, type: string | null, defaultLocation: string | null)=>{
        ipcRenderer.invoke('saveFile', params, type, defaultLocation)
    },
    saveFileBackendDefault: async (params: object, type: string | null, name: string, location: string )=>{
        return  await ipcRenderer.invoke('saveFileBackendDefault', params, type, name, location)
    },
    // add a process that lets your run the "run" command pulled in from the "integration.ts file"
    runModule: async (params: Object) => {
        let processid = await ipcRenderer.invoke('runModule', params)
        return processid
    },
    requestDependencies: () => {
        ipcRenderer.invoke('fetchDependencies')
    },
    requestLogs: () => {
        ipcRenderer.invoke('requestLogs')
    },
    getProcessByIdx: (params: object) => { 
        ipcRenderer.invoke('getProcessByIdx', params)
    },
    requestDependenciesInfo: (params:object | object[]) => {  
        ipcRenderer.invoke('requestDependenciesInfo', params)
    },
    requestProcesses: () => {
        ipcRenderer.invoke('requestProcesses')
    },
    installDependency: (params: { index: Number, type: String}) => {
        ipcRenderer.invoke('installDependency', params)
    },
    restartProcess: (id: string) => {
        ipcRenderer.invoke('restartProcess', id)
    },
    removeProcess: (id: string) => {
        ipcRenderer.invoke('removeProcess', id)
    },
    terminalInto: (key: string) => {
        ipcRenderer.invoke('terminal-into', key)
    },
    setSideTab: (tab: number) => {
        ipcRenderer.invoke('sendSideTab', tab)
    },
    terminalRun: (key: string) => {
        ipcRenderer.invoke('terminal-run', key)
    },
    terminalRestart: (key: string) => {
        ipcRenderer.invoke('terminal-restart', key)
    },
    terminalDestory: (key: string) => {
        ipcRenderer.invoke('terminal-destroy', key)
    },
    createProcess: (params: Object) => {
        ipcRenderer.invoke('process-create', params)
    },
    libraryNames: (callback) => ipcRenderer.on('libraryNames', callback),
    getLog: (callback) => ipcRenderer.on('getLog', callback),
    terminalInc: (callback) => ipcRenderer.on('terminalInc', callback),
    watchEnv: (callback) => ipcRenderer.on('watchEnv', callback),
    getDependencies: (callback) => ipcRenderer.on('getDependencies', callback),
    getDependency: (callback) => ipcRenderer.on('getDependency', callback),
    getProcesses: (callback) => ipcRenderer.on('getProcesses', callback),
    dockerDownloadStatus(callback) { ipcRenderer.on('dockerDownloadStatus', callback) },
    processLogs: (callback) => ipcRenderer.on('processLogs', callback),
    removedProcess: (callback) => ipcRenderer.on('removedProcess', callback),
    processStatus: (callback) => ipcRenderer.on('processStatus', callback),
    dependencyStatus: (callback) => ipcRenderer.on('dependencyStatus', callback),
    sendFile: (callback) => ipcRenderer.once('getFile', callback),
    getVariable: (callback) => ipcRenderer.on('getVariable', callback),
    getRun: (callback) => ipcRenderer.on('getRun', callback),
    addedVariableRequestReturn: (callback) => ipcRenderer.on('addedVariableRequestReturn', callback),
    customModule: (callback) => ipcRenderer.on('customModule', callback),
    sendHistory: (callback) => ipcRenderer.on('sendHistory', callback),
    addedVariable: (callback) => ipcRenderer.on('addedVariable', callback),
    sendExistsFile: (callback) => ipcRenderer.on('sendExistsFile', callback),
    getDependenciesStatus: (callback) => ipcRenderer.on('getDependenciesStatus', callback),
    success: (callback) => ipcRenderer.on('success', callback),
    sendRequirementInfo: (callback) => ipcRenderer.on('sendRequirementInfo', callback),
    requestDepStatusReturn: (callback) => ipcRenderer.on('requestDepStatusReturn', callback),
    getSideTab: (callback) => ipcRenderer.on('getSideTab', callback),
    error: (callback) => ipcRenderer.on('error', callback),
    outputStatus: (callback) => ipcRenderer.on('outputStatus', callback),
    ping: () => ipcRenderer.invoke('ping'),
})