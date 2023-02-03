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
var bodyParser = require('body-parser'); 
  
 
app.use(express.json())
app.use(express.urlencoded({extended: true, limit: '500mb'}));
app.use(bodyParser.text({ type: 'text/*' }))
 
app.use(express.static('public')) 


const  { store }  = require("./config/store/index.js")
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
 
app.use(cors())   
 
let server; 
 
  
export var open_server = async function(port){ // open service function, define a port as argument and start the express setup
  return new Promise((resolve, reject)=>{
    store.logger.info("Attempting to open server at port: %s", port)
    if (!port){   
      port = 5003 // default port 
    }
    (async ()=>{   
      let router = require("./api/routes/index.js").default // define the router set for the REST API
      let upload = require("./api/controllers/upload.js").default // define the upload class / deprecated!
      app.use(router)      // use router 
      app.use(upload.array());  
      let { init } = require("./api/controllers/index.js") // define the initialize function 
      let remoteLocation = ( process.env.NODE_ENV == 'development' ? 'stagedModules' : 'modules')
      try{
        await init(remoteLocation) // star thte server configuration setup
      } catch (err){ 
        store.logger.error("%o error in init server")
      }
    })().then(()=>{ 
      try{
        console.log("starting port server")
        server = app.listen(port, () => {
          store.logger.info(`Example app listening at http://localhost:${port}`)
          resolve({port:port, server: server})
        })
        .on("error", (err)=>{
          store.logger.error("error in opening server %s", err)
          if (err.code === 'EADDRINUSE' ) {
            const erry = new Error(`${err.code} failed to start server at port: ${port}. Please clear usage of that port, make sure only one instance of Basestack is running, and restart the app...`)
            store.logger.error(erry)
            reject(erry) 
          } else{
            reject(err)
          }
        })
      } catch(err){
        reject(err)
      }
    }).catch((err)=>{
      store.logger.error(err)
      reject(err)
    })

    
  })    
}







export var close_server = async function(){
  console.log("closing server now...", server)
  await server.close() 
  console.log("Server closed")
  return 
}

export var serv  = server

