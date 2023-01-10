

// export function downloadDocker(data){
//     const win2 = BrowserWindow.getFocusedWindow();
//     let bat;
//     if (data.platform == 'darwin'){ 
//         let url;
//         // determine the url to pull the binary from 
//         if (data.arch == 'x64'){
//             url ="https://desktop.docker.com/mac/main/amd64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-amd64"
//         } else {
//             url = "https://desktop.docker.com/mac/main/arm64/Docker.dmg?utm_source=docker&utm_medium=webreferral&utm_campaign=docs-driven-download-mac-arm64"
//         }
//         // Utilize the electron-download package properly to download a binary, report a progress bar
//         let downloading = download(win2, url, {
//             overwrite: true,
//             openFolderWhenDone: true
//         }); 
//         //Send to the renderer the download status starting
//         this.mainWindow.webContents.send("dockerDownloadStatus", {
//             "type": "info",
//             "message": `Downloading file now.. check toolbar for status. Please open the file when complete`
//         })
//         downloading.then((event)=>{ // At the end of the above download, send to renderer that it is done and should be executed manually 
//             let filepath = event.getSavePath()
//             this.mainWindow.webContents.send("dockerDownloadStatus", {
//             "type": "success",
//             "info": `Downloaded success to: ${ filepath }. `,
//             message: "Please open the .dmg (double-click) file to extract and complete installation"
//             })
//         })
//     } else if (data.platform == 'linux') { // If linux, instead pull bash script and auto run it 
//         let url;
//         if (data.arch == 'x64'){
//             url = "curl -sSL https://get.docker.com/ | sh"
//         } else {
//             url = "curl -sSL https://get.docker.com/ | sh"
//         }            
//     } else {
//         let url = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
//         let downloading = download(win2, url, {
//             overwrite: true,
//         });
//         downloading.then((event)=>{
//             this.mainWindow.webContents.send("dockerDownloadStatus", {
//             "type": "success",
//             "message": `Downloaded success to: ${event.getSavePath()}`
//             })
//         })
//     }


// }