import { app, dialog, BrowserWindow, ipcMain, IpcRenderer, session, shell, ipcRenderer } from 'electron';
import { Client } from './client'
import { define_configuration, importDependencies } from './definitions';
import { Process } from './process';
var { store } = require("./store.js");

// import  Lexer  from './lexer'

// let lexer = new Lexer().lexer
// const stringtext = "yes"
// let continuation = true 
// lexer.reset("${variable}.basename().trim(2) while testing(2)")
// while (continuation){
//     continuation = lexer.next()
//     if (continuation)    {
//         console.log(continuation)
//     }
// }

app.whenReady().then(() => {
    const client = new Client(app)
    client.createWindow()
    /////// Set IPC Functions
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
        client.logger.info('getting all logs__________________________________')
        client.mainWindow.webContents.send('getLog', client.logger.logs)
    })
    ipcMain.handle('fetchDependencies', async (event, message) => {
        client.mainWindow.webContents.send('getDependencies', client.dependencies.dependencies)
    }) 
    ipcMain.handle('fetchEnv', async (event, message) => {
        client.mainWindow.webContents.send('watchEnv', {
            version: process.env.version,
            port: 5023,
            os: client.os,
            logDir: store.system.logPath,
            releaseNotes: client.updater.releaseNotes
        })
    })
    ipcMain.handle('open-url', (event, url) => {
        client.logger.info(`opening url: ${url}`)
        shell.openExternal(url)
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
    ipcMain.handle('getLibrary', () => {
        client.logger.info(`${Object.keys(client.library.all)}, requesting a list of all available modules in the library`)
        let choices = Object.values(client.library.all).map((d: any) => {
            return d.choices[0]
        })
        client.mainWindow.webContents.send('libraryNames', choices)
    })
    ///////////////
    define_configuration(store.system).then(async (config: any) => {
        try {
            // Set up the logging object for rendering to console AND filesystem log files
            process.env.logfile = config.logs.logfile
            importDependencies(store.system).then(async (results) => {
                // client.logger.info(results)
                await client.initLibrary()
                await client.initDependencies()
                await client.initModules()
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
    client.createMenu(); 
    client.logger.info("Checking for updates...")
    client.checkUpdates()
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
        if (BrowserWindow.getAllWindows().length === 0) {
            client.createWindow()
        }
        

    });
});

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
});

ipcMain.on('message', (event, message) => {
    console.log(message,"this is a message");
})
