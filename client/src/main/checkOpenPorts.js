
async function checkOpenPorts(port){
  const express  = require('express')
  const app = express()
  let tries = 10
  let opened_server = false
  if (!port){
    port = 5433  
  }
  (async ()=>{
    do {
      try {
          tries -=1;
          await startServer(port);
          opened_server = true;
          resolve(`port: ${port} opened backend server`)          
      } catch(err){
        opened_server = false;
        port = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
      }
    } while (!opened_server && tries > 0);
    if (tries <= 0){
      reject(new Error("Max Tries reached for searching port, exiting..."))
    }
  })().catch((err)=>{
    logger.error(`Error in opening server outer ${err} ${port}`)
    reject(err)
  })  
}



module.exports = {checkOpenPorts, startServer}