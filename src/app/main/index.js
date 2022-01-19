'use strict'

const { app, dialog } = require('electron')






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

// process.env.NODE_ENV = 'production'

const path = require("path")
// const {  show_MinKnow, show_sublime, show_aliview, show_spreaD3, show_BEAUTI, show_BEAST, show_figtree, show_tempest, show_tracer } = require('./menu.js')

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
  // process.env.version_basestack = autoUpdater.currentVersion
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
  
var {define_configuration } = require("../../shared/definitions.js")
const { Client } = require("./client.js")
const client = new Client(app)
 
let create_server; let close_server; let  cancel_container;
if (process.env.NODE_ENV === 'production'){
    create_server = require("../../server/index.server.js").create_server
    // close_server = require("../../server/server.js").close_server
    // const { 
    //   cancel_container
    //  } = require('../modules/server/api/controllers/index.js')
}

  


let logger;



client.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 

client.app.on('activate', () => {
  if (client.mainWindow === null) {
    client.createWindow()
    client.createUpdater()
    client.checkUpdates()
    client.createMenu()
  }
})
client.app.on('ready', () => {
    // if (process.env.NODE_ENV !== 'production') {
    //   require('vue-devtools').install()
    // }
  
  
  var { store } = require("../store/store.js");
  client.store = store;
  define_configuration(store.system).then((config)=>{
    try{
      logger = require("./logger.js").logger(config.logs.error, config.logs.logfile)
      process.env.logfile = config.logs.logfile
      process.env.errorfile = config.logs.error
      client.logger = logger;
      if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
      client.logger.info("Creating window")
      client.createWindow()
      client.logger.info("Creating updater")
      client.createUpdater()
      client.logger.info("Checking for updates...")
      client.checkUpdates()
      client.logger.info("Creating menu ")
      client.createMenu(); 
      try{
        (async () => {
          try{
            client.logger.info("Checking node env for server")
            if (process.env.NODE_ENV == 'production'){
              client.logger.info("Production Mode detected, starting backend server...")
              let port =  await create_server() 
              if (!port ){
                port = 5003
              }
              process.env.PORT_SERVER = port
              client.updatePort(port)
              client.logger.info("Server started at port: %s", port)
            }
          } catch(error){
            client.logger.info("%s error in readying the app", error)
            client.logger.info(error)
            // throw error
          } 
            
          })().catch((err)=>{
            client.logger.info("Error in ready app occurred somewhere, see above")
            client.logger.info(err.message)
            dialog.showMessageBox(client.mainWindow, {
              type: 'error',
              defaultId: 0,
              buttons: ['Ok'],
              title: 'Error',
              message: (err.message ? err.message : JSON.stringify(err, null, 4)),
          });
        })
      } catch(err){
        console.error(err)
      }
    } catch(err){
      console.error(err)
    }
  }).catch((err)=>{
    console.error(err)
  })
  
})




