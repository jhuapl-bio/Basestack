/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const express  = require('express')
const app = express()
const http  = require("http")
const cors =  require("cors")
const path = require('path')


app.use(express.json())
app.use(express.urlencoded({extended: true, limit: '500mb'}));
app.use(express.static('public')) 

const { docker_init } = require("./api/controllers/docker.js")

import { init } from "./api/controllers/index.js"
import router  from "./api/routes/index.js"
import upload from "./api/controllers/upload.js"
import { store } from "./api/store/global.js"
import { define_configuration, define_base } from "./api/store/index.js"

// Reset all on reload 
const {logger}  = require('./api/controllers/logger.js')

app.get('/', (req, res) => res.send('Basestack Backend Server is Running at port 5003 on localhost!'))
app.use((req,res,next)=>{
  res.setHeader("Access-Control-Allow-Origin", '*');
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH,PUT, DELETE, OPTIONS"
  );
  next();
})
app.use(router)
app.use(cors())
app.use(upload.array());

let server;



export var open_server = async function(port){
  return new Promise((resolve, reject)=>{
    logger.info("Attempting to open server at port: %s", port)
    if (!port){
      port = 5003
    }
    (async ()=>{
      let meta = await define_configuration()
      store.meta = meta
      define_base()
      store.docker = await docker_init();
      await init()
    })().then(()=>{
      server = app.listen(port, () => {
        // process.env.SERVER = server
        logger.info(`Example app listening at http://localhost:${port}`)
        resolve(port)
      })
      .on("error", (err)=>{
        logger.error("error in opening server %s", err)
        if (err.code === 'EADDRINUSE' ) {
          const erry = new Error(`${err.code} failed to start server at port: ${port}. Please clear usage of that port, make sure only one instance of Basestack is running, and restart the app...`)
          logger.error(erry)
          reject(erry)
        } else{
          reject(err)
        }
      })
    }).catch((err)=>{
      logger.error(err)
    })

    
  })    
}







export var close_server = function(){
  console.log("closing server now...", server)
  server.close()
  console.log("Server closed")
}

export var serv  = server

