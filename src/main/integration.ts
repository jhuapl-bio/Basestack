var { store } = require("./store.js");
import fs from "fs"


const { exec } = require('child_process');
// Generate an echo statement of hello world that can be used for a variety of OS types, that is, if on windows use wsl and call the wsl command file in this file
// If on linux, just call the command file in this file
// If on mac, just call the command file in this file
// If on windows, call the wsl command file in this file
// check the OS type first, if it is windows, then make sure to prepend "wsl" term to ensure wsl uses it
export  function run(command: string, platform: string | null) {
    // Define your command string here. You can replace 'ls -al' with any valid bash command.
    //check if command is empty string, if it is, set it to an echo that states comamnd is empty
    if (command === "") {
        command = 'echo "command is empty"';
    }
    //use if else statement to check if on windows or not
    //if on windows, prepend wsl to the command
    //if on linux or mac, just run the command 
    if (!platform) {
        if (process.platform === "win32") {
            //use regex to match if wsl is the first command in the string
            if (command.match(/^\s*wsl/)) {
                //if wsl is the first command in the string, then just run the command
            } else {
                //if wsl is not the first command in the string, then prepend it to the command, use ` to make variable
                command = `wsl   bash -c "${command.replace(/"/g, '\\"')}; echo 'PLEASE EXIT THE WINDOW'"`
                command = command.replace(/([A-Z]):/g, (match, p1) => `/mnt/${p1.toLowerCase()}`)
            }
        }
    } else {
        if (platform == "wsl2" || platform == 'wsl') {
            if (command.match(/^\s*wsl/)) {
                //if wsl is the first command in the string, then just run the command
            } else {
                //if wsl is not the first command in the string, then prepend it to the command, use ` to make variable
                command = `wsl bash -c "${command.replace(/"/g, '\\"')};  echo 'PLEASE EXIT THE WINDOW'"`
                command = command.replace(/([A-Z]):/g, (match, p1) => `/mnt/${p1.toLowerCase()}`)
            }
        } 
    }
    return command
}

   
module.exports = {
    run
}