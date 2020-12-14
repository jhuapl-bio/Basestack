'use strict'

const { app, ipcMain, BrowserWindow, Menu, dialog } = require('electron')
const isMac = process.platform === 'darwin'
const version = '1.0'
process.env.version_basestack = version

if (!process.env.APPDATA){
  process.env.APPDATA = app.getPath('userData')
}


const { 
 cancel_container
 } = require('../modules/server/api/controllers/index.js')


const path = require("path")
// const {  show_MinKnow, show_sublime, show_aliview, show_spreaD3, show_BEAUTI, show_BEAST, show_figtree, show_tempest, show_tracer } = require('./menu.js')
const  store  = require("../modules/server/api/store/global.js")

require("../renderer/store")


const {logger } = require("../modules/server/api/controllers/logger.js")

const log = require('electron-log');
const {autoUpdater} = require("electron-updater");


const {fs} = require("fs")
// autoUpdater.logger = log;
// autoUpdater.logger.transports.file.level = 'info';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let { open_server,close_server } = require("../modules/server/server.js")
open_server()
// logger.info(JSON.stringify(process.env, null, 4))
var menu = Menu.buildFromTemplate([
  // {
  //     label: 'Quick Launch Software',
  //     submenu: [
  //         {label:'MinKNOW', 
  //         click(){
  //             show_MinKnow()
  //           }
  //         },
  //         {label:'Sublime Text',
  //           click(){  
  //             show_sublime()
  //           }
  //         },
  //         {label:'ALiView',
  //           click(){  
  //             show_aliview()
  //           }
  //         },
  //         {label:'spreaD3',
  //           click(){  
  //             show_spreaD3()
  //           }
  //         },
  //         {label:'BEAUTI', 
  //         click(){  
  //             // render.show_BEAUTI("<APP_DIR>/pre-commands/")
  //             show_BEAUTI()
  //           }
  //         },
  //         {label:'BEAST', 
  //         click(){  
  //             // render.show_BEAST("<APP_DIR>/pre-commands/")
  //             show_BEAST()
  //           }
  //         },
  //         {label:'FigTree', 
  //         click(){  
  //             show_figtree()
  //           }
  //         },
  //         {label:'Tempest', 
  //         click(){  
  //             show_tempest()
  //           }
  //         },
  //         {label:'Tracer', 
  //         click(){  
  //             show_tracer()
  //           }
  //         }
  //     ]
  // },
  // {
  //   label: 'Post Installation',
  //     submenu: [
  //     {
  //       label: "Offline",
  //       click: async ()=>{
  //         install_images_offline()
  //       }
  //     },
  //     {
  //       label: "Online",
  //       click: async ()=>{
  //         install_images_online()
  //        }
  //      },
  //      {
  //       label: "Cancel",
  //       click: async ()=>{
  //         cancel_load_images()
  //        }
  //      }
  //     ]
  // },
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
    label: 'Restart',
    submenu: [
      {
        label: 'Refresh Server',
        click() {  close_server(); open_server();  }
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

    ]
  },
  // { role: 'viewMenu' }
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
  // { role: 'windowMenu' }
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
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternalSync('https://electronjs.org') }
      }
    ]
  }
])
Menu.setApplicationMenu(menu);


// if (process.env.NODE_ENV !== 'development') {
//   global.__static = require('path').join(__dirname, '/static').replace(/\//g, '\\')
//   // global.__static = require('path').join(__dirname, '/static').replace(/\/g, '\\')
// } else {
//   global.__static = ""
// }

const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

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
  mainWindow.loadURL(winURL)
  autoUpdater.autoDownload = false
  function sendStatusToWindow(text) {
    log.info(text);
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      defaultId: 0,
      buttons: ['Ok'],
      message: 'Info',
      detail: text
    });
  }
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err);
  })
  autoUpdater.on('update-available', (info) => {
    log.info(info)
    let message = 'Would you like to install it?';
    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Install', 'Skip'],
      defaultId: 0,
      message: 'A new version of Basestack is now available',
      detail: message
    }, response => {
      if(response === 0) {
        log.info(response)
        autoUpdater.downloadUpdate()
      } else {
        log.info(response)
      }
    });
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    sendStatusToWindow(log_message);
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded');
  });
  autoUpdater.on('checking-for-update', () => {
    logger.info('Checking for Basestack update...');
  })
  autoUpdater.on('update-not-available', (info) => {
    logger.info('Basestack update not available.');
  })




  mainWindow.on("close", (e)=>{
    // e.preventDefault();
    try{
        cancel_container({module: 'rampart', silent:true})
    } catch(err){
      console.log(err)
    }
    try{
        cancel_container({module: 'basestack_consensus', silent:true})
    } catch(err){
      console.log(err)
    }
    try{
        cancel_container({module: 'basestack_tutorial', silent: true})
    } catch(err){
      console.log(err)
    }

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



    
    // https://stackoverflow.com/a/40790310/11572828,
  //   console.log(process.NODE_ENV)
  //   if(process.env.NODE_ENV !== 'production'){
  //     console.log("enside the close loop now")
  //     dialog.showMessageBox(mainWindow,options, (res,checked)=>{
  //       console.log(checked, res, "dsfdsfjdksfjkjk")
  //       if (res === 0 || res === 1) {
  //          // mainWindow.destroy()
  //          console.log("response", res)
  //         if (res === 0){
  //           let removal_message = ""
  //           logger.info("Exiting consensus generation")
  //           try {
  //             cancel_artic_consensus_promise()
  //             logger.info("Completed cancel artic_consensus")
  //             removal_message += "Removed artic_consensus pipeline"
  //           } catch(err2){
  //             logger.error(err2.message)
  //           }
  //           try {
  //             cancel_RAMPART_promise()
  //             logger.info("Removed Rampart pipeline")
  //             removal_message += "Removed rampart"
  //           } catch (err2){
  //             logger.error(err2.message)
  //           }
  //           console.log("tried to the end")
  //           mainWindow.destroy()
  //         } else {
  //           console.log("else")
  //           mainWindow.destroy()
  //         }
  //       } 
  //       elses if (res === 2){
  //         logger.info("Asked to quit, decided not to exit")
  //       }
  //     });
  //   }
  //   else{
  //     console.log("no matter")
  //     mainWindow.destroy()
  //   }

  })


  mainWindow.on('closed', (e) => {
     // cancel_RAMPART_promise()
     // cancel_artic_consensus_promise()
     mainWindow= null
  })
}

app.on('ready', ()=>{
  try{
    createWindow();
    autoUpdater.checkForUpdatesAndNotify();
   } catch(err){
      logger.error(err)
   }
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
