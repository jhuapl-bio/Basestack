'use strict'

const { app, dialog } = require('electron')



import promiseIpc from 'electron-promise-ipc';



const path = require("path")
// const {  show_MinKnow, show_sublime, show_aliview, show_spreaD3, show_BEAUTI, show_BEAST, show_figtree, show_tempest, show_tracer } = require('./menu.js')






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


var {define_configuration } = require("../store/index.js")

const { Client } = require("./client.js")
const client = new Client(app)

let open_server; let close_server; let  cancel_container;
if (process.env.NODE_ENV === 'production'){
    open_server = require("../../system/server/server.js").open_server
    close_server = require("../../system/server/server.js").close_server
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
    console.log("created windows")
    client.createUpdater()
    client.checkUpdates()
    client.createMenu()
  }
})
client.app.on('ready', () => {
    // if (process.env.NODE_ENV !== 'production') {
    //   require('vue-devtools').install()
    // }
  define_configuration().then((config)=>{
    // const config = {
    //   logs: {
    //     logfile: "/Users/merribb1/logfile.log",
    //     error: "/Users/merribb1/logfileerror.log"
    //   }
    // }
    var { store } = require("../store/index.js")
    
    try{
      client.store = store
      logger = require("../../shared/logger.js").logger(config.logs.error, config.logs.logfile)
      process.env.logfile = config.logs.logfile
      process.env.errorfile = config.logs.error
      client.logger = logger
      // if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
      client.createWindow()
      client.createUpdater()
      client.checkUpdates()
      client.createMenu();
      (async () => {
        try{
          if (process.env.NODE_ENV == 'production'){
            logger.info("Production Mode detected, starting backend server...")
            let port =  await open_server()
            if (!port ){
              port = 5003
            }
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
  }).catch((err)=>{
    console.error(err)
  })
  
})





