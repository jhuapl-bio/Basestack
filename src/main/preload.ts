import { contextBridge, ipcRenderer } from 'electron';
import path from 'path'
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message: string) => ipcRenderer.send('message', message),
    logger: (message: string) => {
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
    requestLibraryNames: (event, library:any)=>{
        ipcRenderer.invoke('getLibrary').then((libraryResponse) => {
            library = libraryResponse
        })
    }, 
    requestEnv: () => {
        ipcRenderer.invoke('fetchEnv')
    },
    requestDependencies: () => {
        ipcRenderer.invoke('fetchDependencies')
    },
    requestLogs: () => {
        ipcRenderer.invoke('requestLogs')
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
    processLogs: (callback) => ipcRenderer.on('processLogs', callback),
    removedProcess: (callback) => ipcRenderer.on('removedProcess', callback),
    processStatus: (callback) => ipcRenderer.on('processStatus', callback),
    dependencyStatus: (callback) => ipcRenderer.on('dependencyStatus', callback),
    ping: () => ipcRenderer.invoke('ping'),
})