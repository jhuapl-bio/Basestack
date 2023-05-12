
const { ClientMenu, openTerminal } = require("./menu") // Menu class (top of the app bar)
const { Updater } = require("./updater") // Updater class 
const { ipcMain, BrowserWindow, dialog, shell, Menu } = require('electron') // Basic electron processes
const path = require("path") // Pathing module
const { download } = require('electron-dl'); // For download electron package binaries and libs
const { spawn } = require('child_process'); // used for spawning processes directly on host system
var sudo = require('sudo-prompt');
const { join } = require('path')
const { getDependency } = require('./dependencies.js'); // For download electron package binaries and libs
let os = require("os")
const pty = require('node-pty')

class Client { // Create a class for the Electron main client
  constructor(app) {
    this.logger = null // Create a logger for sending to a text file at the writepath + console
    this.mainWindow = null
    this.app = app
    const isMac = process.platform === 'darwin'
    const isWin = process.platform === "win32"

    if (!process.env.APPDATA) {
      process.env.APPDATA = this.app.getPath('userData')//If the env is production level
    }
    this.ptyProcess = null
    this.system = {
      'isMac': isMac,
      'isWin': isWin,
      'isLinux': !isMac && !isWin
    }
    process.env.system = this.system
    const $this = this
    this.spawned_logs = function spawned_logs(bat, config) { // set function for making a log output for a spawned process piping process
      bat.stderr.on('data', (data) => { // Whenever any stderr is found, send to string
        if (config.throwError) {
          throw new Error(data.toString())
        }
      });
      bat.stdout.on('data', (data) => { // Whenever any stdout is found, send to string
        this.logger.info(`${data.toString()}`)
      });
      bat.on('exit', (code) => { // When process exits, log it and send main notification through IPC connection
        let message = `${config.process} exited with code: ${code}`
        if (config.throwExit) {
          $this.mainWindow.webContents.send('mainNotification', { // Sends the main window the notification that the spawned process failed/exceeded
            icon: (code == 0 ? `info` : `error`),
            message: (code == 0 ? `${config.process} succeeded` : `${config.process} failed`),
            disable_popup: true
          })
        }
      });
    }
  }
  updatePort(port) { // Updates the port to connect to, a client can be in a separate location from the running server
    process.env.PORT_SERVER = port
    this.mainWindow.webContents.send("changePort", port) // Send IPC channel message to update the port to connect to 
  }

  createMenu() {  // Make a menu object and the store (holds saved variables and configs)
    let menu = new ClientMenu(this.logger, this.mainWindow, dialog, this.app, this.system, this.spawned_logs, this.updater)
    menu.store = this.store
    let m = menu.makeMenu()
    this.menu = menu
  }
  createUpdater() {  // Create the updater class
    this.updater = new Updater(this.logger, this.mainWindow, dialog)
    this.updater.defineUpdater() // Set up basic functions for the updater
  }
  runSudoPrompt(cmd) {
    var options = {
      name: `Sudo Prompt Command `,
      // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
    };
    console.log(cmd)
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
  createWindow() { // Make the main windows for Electron
    /**
     * Initial window options
     */
    const $this = this

    // Adjust the location of necessary files, based on OS and if in prod/dev environment
    if (process.env.NODE_ENV !== 'production') {
      let icon = path.join(__dirname, "..", "static", "img") // Set the necessary icon
      if (process.env.platform_os == "linux") {
        icon = path.join(icon, "/icon_1024x1024.png")
      } else if (process.env.platform_os == 'win') {
        icon = path.join(icon, "/basestack.ico")
      } else {
        icon = path.join(icon, "/basestack.icns")
      }
      // instantiate the main Browser window
      this.mainWindow = new BrowserWindow({
        height: 1000,
        useContentSize: true,
        width: 1080,
        title: "Basestack",
        webPreferences: { zoomFactor: 0.83, webSecurity: true, enableRemoteModule: true, nodeIntegration: true, worldSafeExecuteJavaScript: true },
        icon: icon
      })
    } else {
      //Set icon for a prod env
      let icon = path.join(__dirname, "icons")
      if (process.env.platform_os == "linux") {
        icon = path.join(icon, "/icon_1024x1024.png")
      } else if (process.env.platform_os == 'win') {
        icon = path.join(icon, "/basestack.ico")
      } else {
        icon = path.join(icon, "/basestack.icns")
      }
      this.mainWindow = new BrowserWindow({
        height: 1000,
        useContentSize: true,
        width: 1080,
        title: "Basestack",
        webPreferences: { zoomFactor: 0.83, webSecurity: true, enableRemoteModule: true, nodeIntegration: true, worldSafeExecuteJavaScript: true },
        icon: icon
      })
    }

    // If in dev, set to local host, otherwise render the packaged file
    const winURL = (process.env.NODE_ENV === 'development'
      ? `http://localhost:9080`
      : `file://${__dirname}/index.html`);

    //IF there is a browser cache, delete it completely to allow updates to properly take hold
    this.mainWindow.webContents.session.clearCache(function () {
      //some callback.
    });
    if (process.env.NODE_ENV === 'development') {
      console.log("development<<<<")
      const rendererPort = `9080`
      this.mainWindow.loadURL(`http://localhost:${rendererPort}`);
    }
    else {
      console.log(app.getAppPath())
      this.mainWindow.loadFile(join(app.getAppPath(), 'renderer', 'index.html'));
    }
    // try {
    //   this.mainWindow.loadURL(winURL) // Finally, load the packaged ejs file for rendering through electron
    //   this.logger.info("loaded main window!")
    // } catch (err) {
    //   this.logger.error(err)
    // }
    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    var shell = os.platform() === "win32" ? "powershell.exe" : "bash";
    let i = 0
    function startProcess() {
      try {
        delete $this.ptyProcess
      } catch (e) {
        $this.logger.error(`${e} error in destroying process`)
      }
      console.log("new process")
      $this.ptyProcess = pty.spawn(shell, [], {
        name: 'xterm-color',
        cols: 80,
        rows: 24,
        cwd: process.env.HOME,
        env: process.env
      });
      i+=1
      $this.ptyProcess.on("data", (data) => {
        console.log(data, i, "<<<<<<")
        $this.mainWindow.webContents.send("terminal-incData", data);
      });
      $this.ptyProcess.on("exit", (data) => {
        console.log("<<<<exit<<")
      });
      
    }
    startProcess()
    
    ipcMain.on("terminal-clear", (event, data) => {
      $this.mainWindow.webContents.send("terminal-clear", data);
    })
    ipcMain.on("terminal-destroy", (event, data) => {
      try {
        console.log("destroying process")
        $this.ptyProcess.kill();
      } catch (err) {
        try {
          $this.ptyProcess.kill('SIGKILL');
          console.log("destroying process")
        } catch (e) {
          // couldn't kill the process
          $this.logger.error(`Error ${e}`)
        }
      }
    })
    ipcMain.on("terminal-restart", async (event, data) => {
      try {
        console.log("destroying process")
        await $this.ptyProcess.kill()
        startProcess() 
      } catch (err) {
        try {
          await $this.ptyProcess.kill('SIGKILL')
          startProcess()
          console.log("destroying process intial failed, trying again")
        } catch (e) {
          // couldn't kill the process
          $this.logger.error(`Error ${e}`)
          startProcess()
        }
      }
    }) 
    ipcMain.on("terminal-into", (event, data) => {
      $this.ptyProcess.write(data);
    })

    
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ipcMain.on("changePort", (event, arg) => { // When receive a message from the renderer (vue.js), change the port to connect to 
      event.reply('changePort', process.env.PORT_SERVER)
    })
    ipcMain.on("sudoPrompt", (event, arg) => { // When receive a message from the renderer (vue.js), change the port to connect to 
      var options = {
        name: 'Sudo Prompt',
        // icns: '/Applications/Electron.app/Contents/Resources/Electron.icns', // (optional)
      };
      let perms = `755`
      if (arg.perms) {
        perms = ''
        let sums = { User: 0, Other: 0, Group: 0 }
        for (let [key, value] of Object.entries(arg.perms)) {
          let add = 0
          arg.perms[key].forEach((value, i) => {
            if (i == 0 && value) {
              add += 4
            } else if (i == 1 && value) {
              add += 2
            } else if (i == 2 && value) {
              add += 1
            }
          })

          perms = `${perms}${add}`
        }
      }

      let cmd = ` chmod ${perms} ${arg.item}; `


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
    })
    ipcMain.on("getStore", (event, arg) => { // When receive a message from the renderer (vue.js) for the store, send store 
      event.reply('getStore', this.store)
    })
    if (process.env.NODE_ENV == 'production') {
      ipcMain.on("restartServer", (event, arg) => {
        $this.logger.info("REstarting the server with port: %s", process.env.PORT_SERVER)
        try {
          const create_server = require("../server/index.server.js").create_server
          create_server(process.env.PORT_SERVER);
        } catch (err) {
          $this.logger.error("Err in starting server: %s", err)
          throw (err)
        }
      })
    }

    ipcMain.on('download', async (event, data) => { // In development
      console.log("download!!!!!")


    });
    ipcMain.on('downloadDocker', async (event, data) => { // In development
      // Check the OS, and download the necessary binaries for Docker automatically to Downloads
      try {
        this.downloadDocker(data)
      } catch (err) {
        $this.logger.error(err)
      }



    });
    ipcMain.on("queryRelease", (event, arg) => { // If Electron finds the release notes, send to vue.js to render in html
      event.reply('releaseNotes', $this.updater.releaseNotes)
    })
    // Open the log folder
    ipcMain.on("openLogs", (event, arg) => {
      shell.openPath($this.store.system.logPath)
    })


    // Check for update to electron from Github releases  
    ipcMain.on("checkUpdates", (event, arg) => {
      this.logger.info("Checking updates")
      try {
        $this.updater.checkUpdates()
      } catch (err) {
        this.logger.error(err)
      }
    })
    // Open the directory using electron's open dialog functionality 
    ipcMain.on("openDirSelect", (event, arg) => {
      dialog.showOpenDialog({
        properties: ['openDirectory']
      }).then((val, err) => {
        if (err) {
          throw err
        } else {
          //Send the filepath of first file in the directory on selection
          this.mainWindow.webContents.send("getValue", val.filePaths[0])
        }

      }).catch((err) => {
        throw err
      })

    })

    // when electron finishes its loading process, notify with ipc message
    this.mainWindow.webContents.on('did-finish-load', function () {
      let quitUpdateInstall = false;
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







    /// deprecated
    this.mainWindow.on("close", (e) => {
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
      options.buttons = ["Quit and Stop", "Quit and Continue", "Cancel"]

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
    // When the user stops basestack, turn the main window to null 
    this.mainWindow.on('closed', (e) => {
      this.mainWindow = null

    })
  }
  checkUpdates() { // Check if the electron version has changed/updated
    this.logger.info("checking updates")
    this.updater.checkUpdates()
  }
}
module.exports = {
  Client
}