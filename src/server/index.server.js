/**
 This file instantiates the server opening for the user which then
 Facilitates backend commmunication with the Vue Frontend and filesystem or docker

/* eslint-disable */

import { store } from "./config/store/index.js"

let { Server } = require("./serverClass.js")  
 
export async function create_server(port){ 
    return new Promise((resolve, reject)=>{ 
           
        if (store.server ){
            try{ 
                store.server.close() 
            } catch (err){
                console.error(err)
            }
        }        
        let server = new Server((port ? port : process.env.PORT_SERVER))
        store.server = server
         
        server.server_configuration().then((response)=>{ /// define configuration setup based on the meta.yml file
            store.logger.info("Server config done")
            server.initiate_cache().catch((err)=>{ // create  a cache on teh server to remember variables and configs
                store.logger.info("%o error in redis caching", err)
            }).then(()=>{ 
                // store.logger.info(response, "redis cacher successfully created server");
                server.initiate(process.env.PORT_SERVER).then((response)=>{ // start the server
                    resolve() 
                })
            })
             
        }).catch((err)=>{
            console.error("%o Error in server config or init", err)
            reject(err)
        })
    })
 
}
if (process.env.NODE_ENV == 'development' || process.env.serveProduction == 'true'){
     
    create_server().catch((err)=>{ // if the system is in dev mode, create the server because it isn't auto called like in prod mode from the client (electron)
        console.error(err) 
    }).then((e)=>{
        store.logger.info("Created development server success....")
    })
}








