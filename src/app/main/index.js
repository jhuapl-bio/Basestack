'use strict'

const { app, dialog } = require('electron')

//Setup devtools package
import { installVueDevTools } from 'electron-devtools-installer'





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

// If in prod move, setup the auto updater to set the current version of basestack to render
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
  process.env.version_basestack = autoUpdater.currentVersion
  releaseNotes = {
    releaseNotes: "None Available",
    version: "Not Available",
    releaseDate: "NA"
  };
} else {
  // If in dev mode, skip versioning steps
  process.env.version_basestack = "Development"
  releaseNotes = {
    releaseNotes: "None Available",
    version: "Development",
    releaseDate: "NA"
  };
}

//Set path where all non-editable files/folders are located
process.env.resourcesPath = process.resourcesPath
  
// Import the confiugrations object for downstream use 
var {define_configuration, importDependencies } = require("../../shared/definitions.js")
const { Client } = require("./client.js") // Import main client class
const client = new Client(app)
 
let create_server; let close_server; let  cancel_container;
if (process.env.NODE_ENV === 'production'){
    // Since dev is separate in starting app and server, we prepackage the server in prod mode
    // Import the function to start the server and then run it later .
    create_server = require("../../server/index.server.js").create_server
}

  


let logger;


// When the client is closed, close down all forked processes
client.app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
}) 

client.app.on('activate', () => {
  if (client.mainWindow === null) {
    client.createWindow() // Create the main electron window
    client.createUpdater() // Set up the updater for electron 
    client.checkUpdates()  // Check the update version of Basestack
    client.createMenu() // Make a menu to utilize in Electron's app bar
  }
})
client.app.on('ready', async () => {
    
  
  // Set up the store for storing and retrieving global values
  var { store } = require("../store/store.js");
  client.store = store;
  if (process.env.NODE_ENV !== 'production') {
    try {
      await installVueDevTools() // IF in dev mode, set up dev tools for easier debugging processes
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  // Set up the configuration object for all base configs of the system 
  define_configuration(store.system).then((config)=>{
    try{
      // Set up the logging object for rendering to console AND filesystem log files 
      logger = require("./logger.js").logger(config.logs.error, config.logs.logfile)
      process.env.logfile = config.logs.logfile
      importDependencies(store.system).then((results)=>{
        
      })
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

      


      // Check if the node.js server is running
      client.logger.info("Checking node env for server")
      if (process.env.NODE_ENV == 'production'){
        client.logger.info("Production Mode detected, starting backend server... at port: %s", process.env)
        create_server().then((port)=>{
          if (!port ){
            port = 5003
          }
          client.logger.info("Server started at port: %s", port)
          process.env.PORT_SERVER = port
          client.updatePort(port)
          
        }).catch((err)=>{
          client.logger.error("%o Error in starting server", err)
          client.logger.info("Error in ready app occurred somewhere, see above")
          client.logger.info(err.message)
          dialog.showMessageBox(client.mainWindow, { // If the app ever failes to start up, report it 
            type: 'error',
            defaultId: 0,
            buttons: ['Ok'],
            title: 'Error',
            message: (err.message ? err.message : JSON.stringify(err, null, 4)),
          });
        })
        
      }
    } catch(err){
      client.logger.error("%o error in connecting to the server: ",err)
      dialog.showMessageBox(client.mainWindow, { // If the app ever failes to start up, report it 
        type: 'error',
        defaultId: 0,
        buttons: ['Ok'],
        title: 'Error',
        message: (err.message ? err.message : JSON.stringify(err, null, 4)),
      });
    }
  }).catch((err)=>{
    client.logger.error("%o error in connecting to the server: ",err)
    dialog.showMessageBox(client.mainWindow, { // If the app ever failes to start up, report it 
      type: 'error',
      defaultId: 0,
      buttons: ['Ok'],
      title: 'Error',
      message: (err.message ? err.message : JSON.stringify(err, null, 4)),
    });
  })
  
})




