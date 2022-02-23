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
    checkUpdates(){
        console.log("check updates")
        try{
            if(process.env.NODE_ENV == 'production'){
                this.releaseNotes.version = 0
                this.releaseNotes.releaseNotes = "Fetching..."
                console.log("Check for Basestack updates and notify")
                this.autoUpdater.checkForUpdatesAndNotify()   
            } else {
                console.log(`Development mode enabled, skipping check for updates`)
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
                console.log(info)
                console.log("update available")
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
                console.log($this.dialog)
                $this.dialog.showMessageBox(null, options).then((response) => { 
                console.log("%s update choice -> %s", response)
                if (response.response == 0){
                    $this.autoUpdater.downloadUpdate()
                    console.log("downloading Update")
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
        this.autoUpdater.on('update-downloaded', (info, err) => {
            console.log("Update Downloaded")
            if (err){
                console.log(err)
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
                console.log(`Download update failed to finish. ${err}`)
                // throw new Error("Could not download update, check error logs")
            }
        });
        $this.autoUpdater.on('checking-for-update', () => {
            console.log('Checking for Basestack update...');
        })
        $this.autoUpdater.on('update-not-available', (info, err) => {
            if (err){
                console.log(`${err} err in update not available messaging`)
            }
            try{
                console.log('Basestack update not available.');
                $this.releaseNotes=info
                console.log(`${JSON.stringify(info)}`)
                $this.mainWindow.webContents.send('releaseNotes', $this.releaseNotes)
            } catch (error) {
                console.error(error)
            }
        })     
        $this.autoUpdater.on('download-progress', (progressObj) => {
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