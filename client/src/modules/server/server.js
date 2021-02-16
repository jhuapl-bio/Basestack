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
var  { store }  = require("./api/store/global.js")

const  bodyParser  = require("body-parser")
const { ammendJSON } = require("./api/controllers/IO.js")
import router  from "./api/routes/index.js"
const path = require('path')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false, limit: '500mb'}));
app.use(express.static('public')) 
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

let server;



export var open_server = async function(port){
  return new Promise((resolve, reject)=>{
    logger.info("Attempting to open server at port: %s", port)
    if (!port){
      port = 5003
    }
    server = app.listen(port, () => {
      logger.info(`Example app listening at http://localhost:${port}`)
      resolve(port)
    })
    .on("error", (err)=>{
      logger.error("error in opening server %s", err)
      if (err.code === 'EADDRINUSE' ) {
        const erry = new Error(`${err.code} failed to start server at port: ${port}. Please clear usage of that port and restart the app...`)
        logger.error(erry)
        reject(erry)
      } else{
        reject(err)
      }
    })
  })    
}







export var close_server = function(){
  server.close()
  console.log("Server closed")
}

export var serv  = server

