/**
 This file instantiates the server opening for the user which then
 Facilitates backend commmunication with the Vue Frontend and filesystem or docker

/* eslint-disable */

import { logger } from "../shared/logger.js"
import { store } from "./config/store/index.js"

let { Server } = require("./serverClass.js") 


 // let { open_server } = require("./server.js");
// const { define_configuration } = require("./api/controllers/configurations.js")


export async function create_server(port){ 
    return new Promise((resolve, reject)=>{ 
        console.log("creating server........")
        
        let server = new Server((port ? port : process.env.PORT_SERVER))
        server.server_configuration().then((response)=>{
            server.initiate(process.env.PORT_SERVER).then((response)=>{
                resolve()
            })
        }).catch((err)=>{
            console.error(err, "Error in server config or init")
            reject(err)
        })
    })

}
console.log(process.env.NODE_ENV, "Node Environment")
if (process.env.NODE_ENV == 'development' || process.env.serveProduction == 'true'){
    console.log(store.system.configPath)
     
    create_server().catch((err)=>{
        console.error(err) 
    }).then((e)=>{
        store.logger.info("Created development server success....")
    })
}



// const {define_base}  = require("./api/controllers/configurations.js")
// // const { define_base } = require("./api/controllers/init.js")
// async function initiate_server(port){
// 	console.log("initiating the server")
// 	return new Promise((resolve, reject)=>{
// 		(async ()=>{
// 			await open_server(port);
// 			console.log(port, "this is the port server");
// 			resolve(port)
// 		})().catch((err)=>{
// 			console.error(err, "error in starting server")
// 			reject(err)
// 		});	
// 	})
// }

// define_configuration().then((config)=>{
// 	store.system  = { ...store.system, ...config }
// 	store.logger = require("../shared/logger.js").logger(store.system.logs.error, store.system.logs.logfile)
// 	define_base().then(()=>{
// 		initiate_server(process.env.PORT_SERVER).catch((err)=>{
// 			console.error(err, "Error  found in init wserver function")
// 			throw (err)
// 		}).then((res)=>{
// 			console.log(res,"resolved successfully")
// 			return(res)
// 		})
// 	})
	
// })






