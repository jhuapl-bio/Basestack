
import { ClientMenu } from "./menu"
import { Updater } from "./updater"
const { ipcMain, BrowserWindow, dialog, shell, Menu } = require('electron')
const path = require("path")

export class  Client {
	constructor(app){
		this.logger = null
        this.mainWindow = null
        this.app = app
        const isMac = process.platform === 'darwin'
        const isWin = process.platform === "win32"

        if (!process.env.APPDATA){
            process.env.APPDATA = this.app.getPath('userData')
        }
        if (isMac){
            process.env.platform_os = "mac"
        } else if(isWin){
            process.env.platform_os = "win"
        } else {
            process.env.platform_os = "linux"
        }
        this.system={
            'isMac': isMac,
            'isWin': isWin
        }
        const $this = this
        this.spawned_logs = function spawned_logs(bat, config){
            bat.stderr.on('data', (data) => {
              console.log(data.toString());
              if (config.throwError){
                throw new Error(data.toString())
              }
            });
            bat.stdout.on('data', (data) => {
              console.log(`${data.toString()}`)
            });
            bat.on('exit', (code) => {
              let message = `${config.process} exited with code: ${code}`
              if(config.throwExit){
                $this.mainWindow.webContents.send('mainNotification', {
                    icon: (code == 0 ? `info` : `error`),
                    message: (code == 0 ? `${config.process} succeeded` : `${config.process} failed`),
                    disable_popup: true
                })
              } 
              console.log(message);
            });
        }
	}
    updatePort(port){
      console.log(`updating port to ${port}`)
      process.env.PORT_SERVER = port
      this.mainWindow.webContents.send("changePort", port)
    }
    createMenu(){
        // let menu = makeMenu(this.this.logger)
        console.log("creating menu")
        let menu = new ClientMenu(this.logger, this.mainWindow, dialog, this.app, this.system, this.spawned_logs, this.updater)
        menu.store = this.store
        let m = menu.makeMenu()
    }
    createUpdater(){
        this.updater = new Updater(this.logger, this.mainWindow, dialog)
        this.updater.defineUpdater()
    }
    createWindow () {
        /**
         * Initial window options
         */
        const $this = this
        if (process.env.NODE_ENV !== 'production'){
          this.mainWindow = new BrowserWindow({
            height: 1000,
            useContentSize: true,
            width: 1080,
            title: "Basestack",
            webPreferences: {webSecurity: true,enableRemoteModule: true, nodeIntegration:true, worldSafeExecuteJavaScript: true},
            icon: path.join(__dirname, '..', 'static', 'img', 'jhulogo.png')
          })
        } else {
          this.mainWindow = new BrowserWindow({
            height: 1000,
            useContentSize: true,
            width: 1080,
            title: "Basestack",
            webPreferences: {webSecurity: true,enableRemoteModule: true, nodeIntegration:true, worldSafeExecuteJavaScript: true},
            icon: path.join(__dirname, '..', "static", 'img', 'jhulogo.png')
          })
        }
          const winURL = (process.env.NODE_ENV === 'development'
        ? `http://localhost:9080`
        : `file://${__dirname}/index.html`);
    
        console.log("winurl defined")
        this.mainWindow.webContents.session.clearCache(function(){
        //some callback.
        });
        try{
          this.mainWindow.loadURL(winURL)
        } catch(err){
          console.log(err)
        }
        ipcMain.on("changePort", (event, arg) => {
          process.env.PORT_SERVER = arg
          event.reply('changePort', process.env.PORT_SERVER)
        })
        ipcMain.on("queryRelease", (event, arg) => {
          event.reply('releaseNotes', $this.updater.releaseNotes)
        })
        ipcMain.on("checkUpdates", (event, arg) => {
          console.log("Checking updates")
          $this.updater.checkUpdates() 
        })
        ipcMain.on("mainN", (event, arg) => {
          // console.log(event)
          console.log("event")
        })
        ipcMain.on("openDirSelect", (event, arg) => {
          dialog.showOpenDialog({
            properties: ['openDirectory']
          }).then((val, err)=>{
            if (err){
              throw err
            } else {
              this.mainWindow.webContents.send("getValue", val.filePaths[0])
            }
            
          }).catch((err)=>{
            throw err
          })
          
        })
      
      
        this.mainWindow.webContents.on('did-finish-load', function () {
          let quitUpdateInstall = false;
          console.log("Basestack is finished loading")
          function sendStatusToWindow(text) {
            dialog.showMessageBox($this.mainWindow, {
              type: 'info',
              defaultId: 0,
              buttons: ['Ok'],
              message: 'Info',
              detail: text
            });
          }
        })
        
      
        
          
        
      
      
      
        this.mainWindow.on("close", (e)=>{
          // e.preventDefault();
          
          // try{
          //   cancel_container({module: 'rampart', silent:true})
          // } catch(err){
          //   console.log(err)
          // }
          // try{
          //     cancel_container({module: 'basestack_consensus', silent:true})
          // } catch(err){
          //   console.log(err)
          // }
          // try{
          //     cancel_container({module: 'basestack_tutorial', silent: true})
          // } catch(err){
          //   console.log(err)
          // }
          // try{
          //   cancel_container({module: 'basestack_mytax', silent:true})
          // } catch(err){
          //   console.log(err)
          // }
          //options object for dialog.showMessageBox(...)
          let options = {}
      
          //Can be "none", "info", "error", "question" or "warning".
          options.type = "question"
      
          //Array of texts for buttons.
          options.buttons = ["Quit and Stop","Quit and Continue","Cancel"]
      
          //Index of the button in the buttons array which will be selected by default when the message box opens.
          options.defaultId = 2
      
          //Title of the message box
          options.title = "Multiple buttons on a message box"
      
          //Content of the message box
          options.message = "Do you want to quit? "
      
          //More information of the message
          options.detail = "Quit and keep your pipeline running for consensus generation, quit and stop them, or continue?"
      
      
          //options.icon = "/path/image.png"
      
          //The index of the button to be used to cancel the dialog, via the Esc key
          options.cancelId = 2
      
          //Prevent Electron on Windows to figure out which one of the buttons are common buttons (like "Cancel" or "Yes")
          options.noLink = true
      
          //Normalize the keyboard access keys
          // options.normalizeAccessKeys = true  
          // dialog.showMessageBox(WIN, options, (response, checkboxChecked) => {
          //   console.log(response)
          //   console.log(checkboxChecked) //true or false
          //  })
      
      
      
      
        })
      
        this.mainWindow.on('closed', (e) => {
          this.mainWindow= null
          
        })  
      }
    checkUpdates(){
        console.log("checking updates")
        this.updater.checkUpdates()    
    }
}