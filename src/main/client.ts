




import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { join } from 'path';
import { Dependency } from './dependency';
import { Library } from './library';
import { Logger } from "./logger"
import { History } from './history';
import { Module } from "./module"
import fs from "fs"
import path from "path"
var { store } = require("./store.js");
const { Updater } = require("./updater") // Updater class 
// const { ClientMenu, openTerminal } = require("./menu") // Menu class (top of the app bar)
const { download } = require('electron-dl'); // For download electron package binaries and libs
var sudo = require('sudo-prompt');
// const pty = require('node-pty')
import { Process } from './process'
import { Queue } from './queue'


export class Client {
    app: any // Create a class for the Electron main client
    mainWindow: any
    logger: Logger
    history: History
    modules: Module
    config: any 
    nodeptyshell: any
    menu: any 
    queue: Queue
    updater: any
    library: Library
    dependencies: Dependency
    store: any 
    ptyProcess: any
    os: string
    processes: any[]
    aarch: string
    system: any
    constructor(app) {
        this.app = app
        this.history = new History()
        this.processes = []
        const isMac = process.platform === 'darwin'
        const isWin = process.platform === "win32"
        this.os = process.platform,
        this.aarch = process.arch,
        this.store = store
        store.processes = []
        this.logger = new Logger(path.join(store.system.logPath, 'error.log'), path.join(store.system.logPath, 'client.log'))
        store.logger = this.logger  
        this.dependencies = new Dependency()
        store.dependencies = this.dependencies
        this.library = new Library()
        this.modules = new Module()
        this.queue = this.enableQueue()
        store.queue  = this.queue.queue
        store.library = this.library
        this.ptyProcess = null
        this.updater = new Updater()
        this.system = {
            'isMac': isMac,
            'isWin': isWin,
            'isLinux': !isMac && !isWin
        }
        this.createShell()
    }
    enableQueue() {
        return new Queue()
    }
    startProcess() {
        // var shell = process.platform === "win32" ? "powershell.exe" : "bash";
        // this.ptyProcess = pty.spawn(shell, [], {
        //     name: 'xterm-color',
        //     cols: 80,
        //     rows: 24,
        //     cwd: process.env.HOME,
        //     env: process.env
        // });
        // this.ptyProcess.on("data", (data) => {
        //     this.mainWindow.webContents.send("terminalInc", data);
        // });
        // this.ptyProcess.on("exit", (data) => {
        //     this.logger.info("<<<<exiting the node pty process")
        // });
    }
    createShell() {
        const $this = this
        try {
            if ($this.ptyProcess > -1) {
                $this.ptyProcess   = -1             
            }
        } catch (e) {
            $this.logger.error(`${e} error in destroying process`)
        }
        

        
        $this.startProcess()

        ipcMain.handle("terminal-clear", (event, data) => {
            $this.mainWindow.webContents.send("terminal-clear", data);
        })
        ipcMain.handle("terminal-into", (event, data) => {
            $this.ptyProcess.write(`${data}`);
        })
        ipcMain.handle("terminal-run", (event, data) => {
            this.logger.info("run terminal command")
            $this.ptyProcess.write(data);
        })
        ipcMain.handle("terminal-destroy", (event, data) => {
            try {
                this.logger.info("destroying process of node-pty") 
                $this.ptyProcess.kill();
            } catch (err) {
                try {
                    $this.ptyProcess.kill('SIGKILL');
                } catch (e) {
                    // couldn't kill the process
                    $this.logger.error(`Error ${e}`)
                }
            }
        })
        ipcMain.handle("terminal-restart", async (event, data) => {
            try {
                await $this.ptyProcess.kill()
                $this.startProcess()
            } catch (err) {
                try {
                    await $this.ptyProcess.kill('SIGKILL')
                    $this.startProcess()
                    console.log("destroying process intial failed, trying again")
                } catch (e) {
                    // couldn't kill the process
                    $this.logger.error(`Error ${e}`)
                    $this.startProcess()
                }
            }
        }) 
    }
    createMenu() {  // Make a menu object and the store (holds saved variables and configs)
        // let menu = new ClientMenu(this.logger, this.mainWindow, dialog, this.app, this.system, this.updater)
        // menu.store = this.store
        // let m = menu.makeMenu()
        // this.menu = menu 
    }
    createUpdater() {  // Create the updater class
        this.updater = new Updater(this.logger, this.mainWindow, dialog)
        this.updater.defineUpdater() // Set up basic functions for the updater
        if (process.env.NODE_ENV !== 'development') {
            global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
            process.env.version = autoUpdater.currentVersion
            
        } else {
            // If in dev mode, skip versioning steps
            process.env.version = "Development"
            
        }
    }
    async initLibrary() {
        await this.library.importLibrary()
    }
    async initModules() {
        await this.modules.importModules()
    }
    async initDependencies() {
        await this.dependencies.importDependencies()
    }
    async restartProcess(id: String) {
        this.logger.info(`${id} restarting process`)
        let processidx = store.processes.findIndex(x => x.id == id)
        if (processidx > -1) {
            let process = store.processes[processidx]
            process.start()
        } else{
            store.logger.error(`${id} process not found, skipping...`)
        }
    }
    //add a function to send to the renderer process the logs while also logging with this.logger.info
    async log(message: string) {
        this.logger.info(message)
        // this.mainWindow.webContents.send("log", message)
    }
    async loadFile(file: string) {  
        this.logger.info(`Loading file ${file}`)
        let data = fs.readFileSync(file, 'utf8')
        return data
    }
    async createProcess(params: Object) {
        this.logger.info(`${params} starting process`)
        let process = new Process(params)
        process.createProcess(params)
    }
    runSudoPrompt(cmd) {
        var options = {
            name: `Sudo Prompt Command `,
            // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
        };
        cmd = "echo yes"
        const $this = this
        sudo.exec(cmd, options,
            function (error, stdout, stderr) {
                let code = 0
                $this.logger.info(stdout)
                $this.logger.error(stderr)
                $this.logger.error(error)
                if (error) {
                    $this.logger.error(error)
                    code = 1
                    dialog.showMessageBox($this.mainWindow, {
                        type: 'error',
                        defaultId: 0,
                        buttons: ['Ok'],
                        title: 'Error',
                        message: `${error}`,
                        detail: `Run
                  
                    ${cmd}
                    
                    from your terminal`
                    });
                } else {
                    // event.reply('sudoPrompt', {message: `${cmd} completed successfully`, type: 'info'} )
                    dialog.showMessageBox($this.mainWindow, {
                        type: 'info',
                        defaultId: 0,
                        buttons: ['Ok'],
                        title: 'Info',
                        message: `${cmd} completed successfully`
                    });
                }


            }
        );
    }
    checkUpdates() { // Check if the electron version has changed/updated
        this.logger.info("checking updates")
        setTimeout(() => {
            console.log("sendupdates")
            this.mainWindow.webContents.send('getLog', 'checking updates')
            
        },3000)
        this.updater.checkUpdates()
    }
    downloadDocker(data) {
        const win2 = BrowserWindow.getFocusedWindow();
        let bat;
        if (data.platform == 'darwin') {
            let url;
            // determine the url to pull the binary from 
            if (data.arch == 'x64') {
                url = "https://desktop.docker.com/mac/main/amd64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-amd64"
            } else {
                url = "https://desktop.docker.com/mac/main/arm64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-arm64"
            }
            // Utilize the electron-download package properly to download a binary, report a progress bar
            let downloading = download(win2, url, {
                overwrite: true,
                openFolderWhenDone: true
            });
            //Send to the renderer the download status starting
            this.mainWindow.webContents.send("dockerDownloadStatus", {
                "type": "info",
                "message": `Downloading file now.. check toolbar for status. Please open the file when complete`
            }) 
            downloading.then((event) => { // At the end of the above download, send to renderer that it is done and should be executed manually 
                let filepath = event.getSavePath()
                this.mainWindow.webContents.send("dockerDownloadStatus", {
                    "type": "success",
                    "info": `Downloaded success to: ${filepath}. `,
                    message: "Please open the .dmg (double-click) file to extract and complete installation"
                })
            })
        } else if (data.platform == 'linux') { // If linux, instead pull bash script and auto run it 
            let url;
            if (data.arch == 'x64') {
                url = "curl -sSL https://get.docker.com/ | sh"
            } else {
                url = "curl -sSL https://get.docker.com/ | sh"
            }
            this.runSudoPrompt(url)

        } else {
            let url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
            let downloading = download(win2, url, {
                overwrite: true,
            });
            downloading.then((event) => {
                this.mainWindow.webContents.send("dockerDownloadStatus", {
                    "type": "success",
                    "message": `Downloaded success to: ${event.getSavePath()}`
                })
            })
        }


    }
    createWindow() {
        const mainWindow = new BrowserWindow({
            height: 1000,
            useContentSize: true,
            width: 1080,
            title: "Basestack",
            webPreferences: {
                preload: join(__dirname, 'preload.js'),
                nodeIntegration: true,
                contextIsolation: true,
                zoomFactor: 0.83,
                webSecurity: true
            }
        });

        if (process.env.NODE_ENV === 'development') {
            const rendererPort = process.argv[2];
            mainWindow.loadURL(`http://localhost:${rendererPort}`);
        }
        else {
            mainWindow.loadFile(join(app.getAppPath(), 'dist', 'electron', 'renderer', 'index.html'));
        }
        this.mainWindow = mainWindow
        this.store.mainWindow = mainWindow
        this.dependencies.mainWindow = mainWindow
        
    }
}