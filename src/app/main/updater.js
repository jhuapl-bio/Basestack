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
        this.releaseNotes = {
            version: "No Release Notes",
            releaseNotes: "No Release Notes"
        } 
        this.quitAndInstall = false
    }
    // Check for any and all updates for basestack's electron versioning system  
    checkUpdates(){
        try{
            // Only check version if production mode!
            if(process.env.NODE_ENV == 'production'){ 
                this.releaseNotes.version = 0
                this.releaseNotes.releaseNotes = "Fetching..."
                this.autoUpdater.checkForUpdatesAndNotify()   
            } else {
                this.autoUpdater.checkForUpdatesAndNotify()   
            }
        } catch (error) {
            console.error(error)
            
        }
    }
    defineUpdater(){
        const $this = this
        this.autoUpdater.on('error', (err) => {
            console.log(`Error in auto-updater. ${err}`)
            $this.releaseNotes.version = -1
            $this.releaseNotes.releaseNotes = "Not Available"
            // sendStatusToWindow('Error in auto-updater. ' + err);
        })
        this.autoUpdater.on('update-available', (info) => {
            try{
                // Ask the user to update the system 
                // If yes, set options to auto restart or not. Also, send any release notes on completed install and download of package 
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
                $this.dialog.showMessageBox(null, options).then((response) => { 
                if (response.response == 0){
                    $this.autoUpdater.downloadUpdate()
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
                    console.log("Skipping update")
                }
                });
            } catch (error) {
                console.error(error)
            }
        })
        // When the update is downloaded, send notificaton that everything is set and restart (if auto selected)
        this.autoUpdater.on('update-downloaded', (info, err) => {
            if (err){
                console.log(err)
            }
            try{
                $this.mainWindow.webContents.send('mainNotification', {
                    icon: 'success',
                    patchNotes: true,
                    message: `Update downloaded. Restart the application to apply install changes \n ${info.releaseNotes}`,
                }) 
                // Set all release notes in the updater to be that found in the GitHub Releases markdown 
                $this.releaseNotes=info
                $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
                // If the user selected to auto install the update AFTER download, do so now
                $this.quitUpdateInstall ? $this.autoUpdater.quitAndInstall() : '';
            } catch(err) {
                console.log(`Download update failed to finish. ${err}`)
                // throw new Error("Could not download update, check error logs")
            }
        });
        $this.autoUpdater.on('checking-for-update', () => { // check github releases for the update version 
            console.log('Checking for Basestack update...');
        })
        $this.autoUpdater.on('update-not-available', (info, err) => { // If version not found, report 
            if (err){
                console.log(`${err} err in update not available messaging`)
            }
            try{
                console.log('Basestack update not available.');
                $this.releaseNotes=info
                $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
            } catch (error) {
                console.error(error)
            }
        })     
        $this.autoUpdater.on('download-progress', (progressObj) => { // while electron downloads the update, monitor to console 
            try{
                let log_message = "Download speed: " + progressObj.bytesPerSecond;
                log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
                log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
                console.log("%s <-- Update Download progress", log_message)
                // sendStatusToWindow(log_message);
                $this.mainWindow.webContents.send('mainNotification', {
                    type: 'info',
                    message: log_message,
                    disable_popup: true
                })
            } catch (error) {
                console.error(error)
            }
        })     
    }
   
}