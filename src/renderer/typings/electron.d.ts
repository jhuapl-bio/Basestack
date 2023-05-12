import { CallbackResponse, Event } from "electron";

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
[x: string]: any;
    sendMessage: (message: string) => void 
    requestEnv: (message: string) => void,
    requestLogs: () => void,
    requestLibraryNames: () => any , 
    requestProcesses: () => any, 
    createProcess: (params: Object) => any, 
    restartProcess: (id: string) => any, 
    installDependency: (params: Object) => void, 
    requestDependencies: () => any,
    terminalInto: (key: string) => any, 
    terminalRestart: (key: string) => any, 
    terminalRun: (key: string) => any,
}  

declare global {
    interface Window {
        electronAPI: ElectronApi,
    } 
}