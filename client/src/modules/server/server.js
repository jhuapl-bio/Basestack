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
const  bodyParser  = require("body-parser")
const port = 5003
import router  from "./api/routes/index.js"
const path = require('path')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:false, limit: '500mb'}));
app.use(express.static('public')) 
// Reset all on reload 

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



export var open_server = function(){
  console.log("Opening server")
  server = app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))
}



export var close_server = function(){
  server.close()
  console.log("Server closed")
}

export var serv  = server

