const {autoUpdater} = require("electron-updater");

export class Updater {

    constructor(logger, mainWindow, dialog){
        this.logger = logger
        this.dialog = dialog
        autoUpdater.autoDownload = false;
        autoUpdater.logger = this.logger;
        this.autoUpdater = autoUpdater
        this.autoUpdater.autoDownload = false;
        this.mainWindow = mainWindow
        this.releaseNotes = "No Release Notes"
        this.quitAndInstall = false
    }
    checkUpdates(){
        if(process.env.NODE_ENV == 'production'){
            this.releaseNotes.version = 0
            this.releaseNotes.releaseNotes = "Fetching..."
            this.logger.info("Check for Basestack updates and notify")
            this.autoUpdater.checkForUpdatesAndNotify()   
        } else {
            this.logger.info(`Development mode enabled, skipping check for updates`)
            this.autoUpdater.checkForUpdatesAndNotify()   
        }
    }
    defineUpdater(){
        const $this = this
        this.autoUpdater.on('error', (err) => {
            $this.logger.error(`Error in auto-updater. ${err}`)
            $this.releaseNotes.version = -1
            $this.releaseNotes.releaseNotes = "Not Available"
            // sendStatusToWindow('Error in auto-updater. ' + err);
        })
        this.autoUpdater.on('update-available', (info) => {
            $this.logger.info(info)
            $this.logger.info("update available")
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
            $this.releaseNotes  = info
            $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
            $this.logger.info($this.dialog)
            $this.dialog.showMessageBox(null, options).then((response) => { 
              this.logger.info("%s update choice -> %s", response)
              if (response.response == 0){
                 $this.autoUpdater.downloadUpdate()
                 $this.logger.info("downloading Update")
                 $this.mainWindow.webContents.send('mainNotification', {
                   icon: '',
                   loading: true,
                   message: `Downloading Update`,
                   disable_popup: true
                 })
                 if (response.checkboxChecked ){
                   $this.quitUpdateInstall = true;
                 }
              } else {
                  $this.logger.info("Skipping update")
              }
            });
        })
        this.autoUpdater.on('update-downloaded', (info, err) => {
            $this.logger.info("Update Downloaded")
            if (err){
                $this.logger.error(err)
            }
            try{
                $this.mainWindow.webContents.send('mainNotification', {
                icon: 'success',
                patchNotes: true,
                message: `Update downloaded. Restart the application to apply install changes \n ${info.releaseNotes}`,
                })
                $this.releaseNotes=info
                $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
                $this.quitUpdateInstall ? $this.autoUpdater.quitAndInstall() : '';
            } catch(err) {
                this.logger.error(`Download update failed to finish. ${err}`)
                // throw new Error("Could not download update, check error logs")
            }
        });
        $this.autoUpdater.on('checking-for-update', () => {
            $this.logger.info('Checking for Basestack update...');
        })
        $this.autoUpdater.on('update-not-available', (info, err) => {
            if (err){
                $this.logger.error(`${err} err in update not available messaging`)
            }
            $this.logger.info('Basestack update not available.');
            $this.releaseNotes=info
            $this.logger.info(`${JSON.stringify(info)}`)
            $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
        })     
        $this.autoUpdater.on('download-progress', (progressObj) => {
            let log_message = "Download speed: " + progressObj.bytesPerSecond;
            log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
            log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
            $this.logger.info("%s <-- Update Download progress", log_message)
            // sendStatusToWindow(log_message);
            $this.mainWindow.webContents.send('mainNotification', {
               type: 'info',
               message: log_message,
               disable_popup: true
            })
        })     
    }
   
}