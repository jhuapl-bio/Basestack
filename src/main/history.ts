// create a history file that records all changes to the system.
// import Client from ./client first
// each action (variable updates, install dependencies, etc) should be recorded in the history file
// on app load (client.ts), the history file should be read and displayed in the history tab of the app
// all history handling should be done in the this file
// this is a class that is created on app start in main.ts
// record all history into a list of objects AND a json file
// history is a json file that is stored in the log directory
const fs = require("fs");
var { store } = require("./store.js");
const { ipcMain } = require("electron");  
import path from "path"

export class History {
    history: any[]
    number: number = 10
    historyfile: string = path.join(store.system.logPath, "history.json")
    constructor(){
        this.importHistory()
        this.history = [ ]
        ipcMain.handle('getHistory', async () => {
            try { 
                store.client.mainWindow.webContents.send('sendHistory',  this.history.slice().reverse())
            } catch (err) {
                store.logger.error(err,"<<<<<< in get history")
            }
        })
        // add a function that records the history of the system, from invoke of renderer
        // this function should be called after every action that changes the system
        ipcMain.handle('recordHistory', async (event, params) => {
            try {
                this.recordHistory(params)
                
            } catch
                (err) {
                store.logger.error(err,"<<<<<< in record history")
            }
        })
    }
    // on startup from constructor, impor thte history file and add it to the history list
    async importHistory(){
        // read the history file
        // add the history file to the history list
        // the history file should be a json file
        try{
            let historyFile = await fs.readFileSync(path.join(store.system.logPath, "history.json"))
            let hist = JSON.parse(historyFile)
            // the most recent history items must be first in the list, so reverse the list, also check if the history is empty before doing so
            if (hist.length > 0) {
                // hist.reverse()
                
                if (hist.length > this.number){
                    // don't shift, just check if length greater than 3 and get index 0-3
                    // this needs to pull the final 3 indices
                    hist = hist.slice(-this.number)
        
                }
                this.history = hist
            }
            
        } catch (err){
            store.logger.error(err)
        }
    }
    // add a function that records the history of the system
    // this function should be called after every action that changes the system    
    async recordHistory(params:Object){
        // create a history object
        // add the history object to the history list
        // write the history list to the history file
        // the history file should be a json file
        let historyObject = {
            timestamp: new Date(),
            params: params
        }
        this.history.push(historyObject)
        // also, set max history length, prioritizing the latest 20 actions
        if (this.history.length > 3){
            // don't shift, just check if length greater than 3 and get index 0-3
            // this needs to pull the final 3 indices
            this.history = this.history.slice(-this.number)
        }
        store.client.mainWindow.webContents.send('sendHistory',  this.history.slice().reverse()  )
        //write file using path resolve and path.join
        try{
            await fs.writeFileSync(this.historyfile, JSON.stringify(this.history))
        } catch (err){
            store.logger.error(err)
        }

    }
}
module.exports = { History }