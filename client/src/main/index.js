'use strict'

const { app, ipcMain, BrowserWindow, Menu, dialog, shell } = require('electron')
const { spawn, exec, execSync } = require('child_process');



import promiseIpc from 'electron-promise-ipc';
const isMac = process.platform === 'darwin'
const isWin = process.platform === "win32"

if (!process.env.APPDATA){
  process.env.APPDATA = app.getPath('userData')
}
if (isMac){
  process.env.platform_os = "mac"
} else if(isWin){
  process.env.platform_os = "win"
} else {
  process.env.platform_os = "linux"
}


const path = require("path")
// const {  show_MinKnow, show_sublime, show_aliview, show_spreaD3, show_BEAUTI, show_BEAST, show_figtree, show_tempest, show_tracer } = require('./menu.js')

require("../renderer/store")



const {autoUpdater} = require("electron-updater");


const {fs} = require("fs")
// autoUpdater.logger.transports.file.level = 'info';
/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
let releaseNotes;

let os = require("os")

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  process.env.version_basestack = autoUpdater.currentVersion
  releaseNotes = {
    releaseNotes: "None Available",
    version: "Not Available",
    releaseDate: "NA"
  };
} else {
  process.env.version_basestack = "Development"
  releaseNotes = {
    releaseNotes: "None Available",
    version: "Development",
    releaseDate: "NA"
  };
}
process.env.resourcesPath = process.resourcesPath

let mainWindow

const { store } = require("../modules/server/api/store/global.js")
const {logger } = require("../modules/server/api/controllers/logger.js")

let open_server; let close_server; let  cancel_container;
if (process.env.NODE_ENV === 'production'){
    open_server = require("../modules/server/server.js").open_server
    close_server = require("../modules/server/server.js").close_server
    const { 
     cancel_container
    } = require('../modules/server/api/controllers/index.js')
}


let bat = undefined;
autoUpdater.logger = logger;
var menu = Menu.buildFromTemplate([
   {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
        { role: 'delete' },
        { type: 'separator' },
        { role: 'selectAll' }
      ])
    ]
  },
  {
    label: 'System',
    submenu: [
      {
        label: 'Refresh Server',
        click() {  close_server(); open_server();  }
      },
      {
        label: 'Print ENV',
        click() {  logger.info(JSON.stringify(process.env, null, 4))  }
      },
      {
        label: 'Docker Site',
        click() { 
          shell.openExternal('https://docs.docker.com/get-docker/')
        }        
      },
      { 
        label: 'Open Desktop',
        click(){
          shell.openPath(app.getPath('desktop'))
        }
      }, 
      {
        label: 'Restart App',
        click() {  
          if (process.env.NODE_ENV === 'production'){
            app.relaunch(); app.quit()
          } else { 
            app.quit()
          }  
        }
      },
      {
        label: "Check Docker Installed",
        click(){
          let bat;
          if (isWin){
            bat = exec("whereis docker", { cwd: app.getPath('desktop') }); 
          }
          else {
            bat = exec("which docker", { cwd: app.getPath('desktop') })
          }
          spawned_logs(bat, {throwError: true, throwExit: true, process: "Checking Docker installed: "})
        }
      },
      {
        label: "Open Terminal",
        click(){
          let bat;
          if (isWin){
            bat = exec("start cmd", { cwd: app.getPath('desktop') }); 
          }
          else if(isMac){
            bat = exec("open -a Terminal", { cwd: app.getPath('desktop')})
          } else {
            bat = exec("gnome-terminal", { cwd: app.getPath('desktop'), detached:true })
          }
          spawned_logs(bat, {throwError: true, process: "Open Terminal"})
        }
      },
      ...(isWin ? [
      {
        label: 'Windows Services',
        submenu: [
          {
            label: 'Hyper-V',
            submenu:[
              {
                label: 'Disable Hyper-V',
                click() {  
                  let bat = exec("powershell -Command \"Start-Process -Verb RunAs cmd.exe \'/K DISM /Online /Disable-Feature:Microsoft-Hyper-V\'\"", { cwd: app.getPath('desktop') }); 
                  spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
                }
              },
              {
                label: 'Enable Hyper-V',
                click() {  
                  let bat = exec("powershell \"Start-Process -Verb RunAs cmd.exe \' /K DISM /Online /Enable-Feature /All /FeatureName:Microsoft-Hyper-V\' \"", { cwd: app.getPath('desktop') }); 
                  spawned_logs(bat, {throwError: true, process: "Enable HyperV"})
                }
              },
            ]
          },
          {
            label: 'WSL2',
            submenu:[
              {
                label: '1. Download WSL2',
                click() { 
                let batDownload = exec("curl.exe https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi -o wsl_installer.msi", { cwd: app.getPath('desktop') }); 
                batDownload.stderr.on('data', (data) => {
                    logger.error(`${data.toString()} err`);
                    mainWindow.webContents.send('mainNotification', {
                       icon: '',
                       loading: false,
                       message: data.toString(),
                       disable_popup: true
                    })
                });
                batDownload.stdout.on('data', (data) => {
                    logger.info(`${data.toString()} info`)
                });
                batDownload.on('exit', (code) => {
                  const text = `<p>WSL2 MSI Download Process complete with code: ${code}.<hr> 0: Success, 1 or more is failure <hr> Next, select 2. Install WSL2</p>`
                    logger.info(text);
                    mainWindow.webContents.send('mainNotification', {
                       icon: '',
                       loading: false,
                       message: text,
                       disable_popup: true
                    })
                  });
                }
              },
              {
                label: '2. Install WSL2',
                click() { 
                  let batInstaller = exec("start /wait msiexec /i wsl_installer.msi ", { cwd: app.getPath('desktop') }); 
                  spawned_logs(batInstaller, {throwError: true, process: "Install WSL2"})
                }
              },
              {
                label: '3. Turn WSL On',
                click() {  
                  let bat = exec("powershell -Command \"Start-Process -Verb RunAs cmd.exe \'/K DISM /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart\'\"", { cwd: app.getPath('desktop') }); 
                  spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
                }
              },
              {
                label: '4. Enable Virtualization',
                click() {  
                  let bat = exec("powershell -Command \"Start-Process powershell \'Enable-WindowsOptionalFeature -Online -FeatureName Microsoft-Windows-Subsystem-Linux\' -Verb runAs \"", { cwd: app.getPath('desktop'), detached:true }); 
                  spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
                }
              },
              {
                label: '5. Set WSL2',
                click() {  
                  let bat = exec("powershell -Command \"wsl --set-default-version 2\"", { cwd: app.getPath('desktop') }); 
                  spawned_logs(bat, {throwError: true, process: "Disable HyperV"})
                }
              },
              
            ]
          },
          {
            label: "Add User Docker-Users",
            click(){
              // "net localgroup docker-users %USERNAME% /add"
              let bat = exec("powershell \"Start-Process -Verb RunAs cmd.exe \' /K net localgroup docker-users %USERNAME% /add\' \"  ", { cwd: app.getPath('desktop') }); 
              spawned_logs(bat, {throwError: true, process: "Add docker-users"})
            }
          },
          {
            label: "Show System Info",
            click(){
              // "net localgroup docker-users %USERNAME% /add"
              let bat = exec("start cmd /K systeminfo", { cwd: app.getPath('desktop') }); 
              spawned_logs(bat, {throwError: true, process: "Show System Info"})
            }
          },
          {
            label: "Open Powershell",
            click(){
              let bat = exec("powershell \"Start-Process powershell -Verb runAs\"", { cwd: app.getPath('desktop') }); 
              spawned_logs(bat, {throwError: true, process: "Open Terminal"})
            }
          },
        ]
      }, 
      {role: "close"} 
      ] : 
      [ 
        { role: 'close' } 
      ]),
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'close' },
      { role: 'quit' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close' }
      ])
    ]
  },
  {
    label: "Check for Updates",
    click() { 
      checkUpdates()
    }
  },
  {
    label: 'Logs and Info',
    submenu: [
      {
        label: 'Open Logs',
        click() { shell.openPath(store.meta.logFolder)  }
      },
      {
        label: 'View Release Notes',
        click() {  
          // logger.info("Getting release notes")
          mainWindow.webContents.send('mainNotification', {
            icon: 'info',
            message: `${releaseNotes.releaseNotes}`,
            disable_popup: true,
            patchNotes: true
          })
          mainWindow.webContents.send('releaseNotes', releaseNotes)
          // logger.info(`${autoUpdater.currentVersion} --> ${JSON.stringify(releaseNotes)}`)
        }
      },
      {
        label: 'Open Issue/Feature Tracker',
        click(){shell.openExternal('https://github.com/jhuapl-bio/Basestack/issues')}
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { shell.openExternal('https://github.com/jhuapl-bio/Basestack') }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);

function spawned_logs(bat, config){
    bat.stderr.on('data', (data) => {
      logger.error(data.toString());
      if (config.throwError){
        throw new Error(data.toString())
      }
    });
    bat.stdout.on('data', (data) => {
      logger.info(`${data.toString()}`)
    });
    bat.on('exit', (code) => {
      let message = `${config.process} exited with code: ${code}`
      if(config.throwExit){
        mainWindow.webContents.send('mainNotification', {
            icon: (code == 0 ? `info` : `error`),
            message: (code == 0 ? `${config.process} succeeded` : `${config.process} failed`),
            disable_popup: true
        })
      }
      logger.info(message);
    });
}

const winURL = (process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`);

  console.log("winurl defined")



function checkUpdates(){
  if(process.env.NODE_ENV == 'production'){
    logger.info("Check for Basestack updates and notify")
    autoUpdater.checkForUpdatesAndNotify()   
  } else {
    logger.info(`Development mode enabled, skipping check for updates`)
  }
}


function createWindow () {
  /**
   * Initial window options
   */

  if (process.env.NODE_ENV !== 'production'){
    mainWindow = new BrowserWindow({
      height: 1000,
      useContentSize: true,
      width: 1080,
      title: "Basestack",
      webPreferences: {webSecurity: true,enableRemoteModule: true, nodeIntegration:true, worldSafeExecuteJavaScript: true},
      icon: path.join(__dirname, '..', '..', 'static', 'img', 'jhulogo.png')
    })
  } else {
    mainWindow = new BrowserWindow({
      height: 1000,
      useContentSize: true,
      width: 1080,
      title: "Basestack",
      webPreferences: {webSecurity: true,enableRemoteModule: true, nodeIntegration:true, worldSafeExecuteJavaScript: true},
      icon: path.join(__dirname, "static", 'img', 'jhulogo.png')
    })
  }
  mainWindow.webContents.session.clearCache(function(){
  //some callback.
  });
  try{
    mainWindow.loadURL(winURL)
  } catch(err){
    console.error(err)
  }
  mainWindow.webContents.send('releaseNotes', releaseNotes)
  ipcMain.on("queryRelease", (event, arg) => {
    event.reply('releaseNotes', releaseNotes)
  })
  ipcMain.on("checkUpdates", (event, arg) => {
    checkUpdates()
  })
  mainWindow.webContents.on('did-finish-load', function () {
    let quitUpdateInstall = false;
    logger.info("Basestack is finished loading")
    function sendStatusToWindow(text) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        defaultId: 0,
        buttons: ['Ok'],
        message: 'Info',
        detail: text
      });
    }
    autoUpdater.on('error', (err) => {
      logger.error(`Error in auto-updater. ${err}`)
      sendStatusToWindow('Error in auto-updater. ' + err);
    })
    autoUpdater.on('update-available', (info) => {
      logger.info(info)
      logger.info("update available")
      let message = 'Would you like to install it? You will need to restart Basestack to apply changes.';
      const options = {
          type: 'question',
          buttons: ['Install', 'Skip'],
          defaultId: 0,
          title: 'Update Available from https://github.com/jhuapl-bio/Basestack/releases',
          message: message,
          detail: '',
          checkboxLabel: 'Auto-restart after download?',
          checkboxChecked: true,
      };
      releaseNotes=info

      mainWindow.webContents.send('releaseNotes', releaseNotes)
      dialog.showMessageBox(null, options).then((response) => { 
        logger.info("%s update choice -> %s", response)
        if (response.response == 0){
           autoUpdater.downloadUpdate()
           mainWindow.webContents.send('mainNotification', {
             icon: '',
             loading: true,
             message: `Downloading Update`,
             disable_popup: true
           })
           if (response.checkboxChecked ){
             quitUpdateInstall = true;
           }
        }
      });
    })
    autoUpdater.on('download-progress', (progressObj) => {
      let log_message = "Download speed: " + progressObj.bytesPerSecond;
      log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
      log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
      logger.info("%s <-- Update Download progress", log_message)
      // sendStatusToWindow(log_message);
      mainWindow.webContents.send('mainNotification', {
         type: 'info',
         message: log_message,
         disable_popup: true
      })
    })

    autoUpdater.on('update-downloaded', (info, err) => {
      if (err){
        logger.error(err)
      }
      try{
        mainWindow.webContents.send('mainNotification', {
          icon: 'success',
          patchNotes: true,
          message: `Update downloaded. Restart the application to apply install changes \n ${info.releaseNotes}`,
        })
        releaseNotes=info
        mainWindow.webContents.send('releaseNotes', releaseNotes)
        quitUpdateInstall ? autoUpdater.quitAndInstall() : '';
      } catch(err) {
        logger.error(`Download update failed to finish. ${err}`)
        // throw new Error("Could not download update, check error logs")
      }
    });
    autoUpdater.on('checking-for-update', () => {
      logger.info('Checking for Basestack update...');
    })
    autoUpdater.on('update-not-available', (info, err) => {
      if (err){
        logger.error(`${err} err in update not available messaging`)
      }
      logger.info('Basestack update not available.');
      releaseNotes=info
      logger.info(`${JSON.stringify(info)}`)
      mainWindow.webContents.send('releaseNotes', releaseNotes)
    })
    
  });
  
  



  mainWindow.on("close", (e)=>{
    // e.preventDefault();
    

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
    options.normalizeAccessKeys = true  




  })

  mainWindow.on('closed', (e) => {
    mainWindow= null
  })
}


// async function close_server(){
//   try{
//     if(process.env.NODE_ENV === 'production'){
//       bat.kill()
//     }
//     return "Closed Server"
//   } catch(err){
//     logger.error(err)
//     throw err
//   } 
// }
// function open_server(){
//   bat = spawn('node', ['server.js'], {env: process.env, cwd: path.join(process.resourcesPath, "data", "server") })
//   bat.stderr.on('data', (data) => {
//     logger.error(data.toString());
//     console.error(data.toString());
//     // throw new Error(code)
//     throw new Error(data.toString())
//   });

//   bat.on('exit', (code) => {
//     logger.info(`Server Child process exited with code ${code}`);
//   });
// }

autoUpdater.autoDownload = false
app.on('ready', ()=>{
  (async () => {
    try{
      await createWindow();   
      checkUpdates();
      if (process.env.NODE_ENV == 'production'){
        logger.info("Production Mode detected, starting backend server...")
        const port =  await open_server()
        process.env.PORT_SERVER = port
        logger.info("Server started at port: %s", port)
      }
    } catch(error){
      logger.error("%s error in readying the app", error)
      logger.error(error)
      throw error
    } 
  })().catch((err)=>{
    logger.error("Error in ready app occurred somewhere, see above")
    logger.error(err.message)
    dialog.showMessageBox(mainWindow, {
      type: 'error',
      defaultId: 0,
      buttons: ['Ok'],
      title: 'Error',
      message: (err.message ? err.message : JSON.stringify(err, null, 4)),
    });
    // throw err
  })
    
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


ipcMain.on('restartApp', (event, arg)=>{
  app.relaunch()
  app.quit()
})
process.on('exit', function() {
  // if(process.env.NODE_ENV === 'production'){
  //   bat.kill()
  // }
});
/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
