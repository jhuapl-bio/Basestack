
var { store } = require("./config/store/index.js")
var {define_configuration }  = require("../shared/definitions.js")
let { open_server,close_server } = require("./server.js");

let { createCache } = require("./api/controllers/cache.js")

export  class Server { 
    constructor(port){
        this.port = ( port ? port : ( process.env.PORT_SERVER ? process.env.PORT_SERVER : 5003))
        this.store  = store
        this.cache = null
        this.serverObj = null
    }
    async initiate_cache(){
        return new Promise((resolve, reject)=>{
            (async ()=>{
                let response = await createCache( // make the cache for redis
                    ( process.env.REDIS_PORT ? process.env.REDIS_PORT : 5014),
                    ( process.env.REDIS_HOST ? process.env.REDIS_HOST : 'host-redis')
                )
                this.cache = response
                if (process.env.NODE_ENV == 'development' || process.env.serveProduction == 'true' ){
                    let obj = this.defineCache('development')
                    let success = this.cache.set( "development", obj, 1000 );
                }
                resolve()
            })().catch((err)=>{
                console.error(err, "error in starting cache service for server")
                reject(err)
            });	
        })
    }
    defineCache(token){
        console.log("define cache")
        return {
        }
    }
    async close(){
        return new Promise((resolve, reject)=>{
            console.log("closing server")
            close_server().then((f)=>{
                resolve()
            }).catch((err)=>{
                store.logger.error("%s error", err)
                reject(err)
            })
        }) 
    }
    async initiate_server(port){
        console.log("initiating the server")
        return new Promise((resolve, reject)=>{
            (async ()=>{
                let serverObj = await open_server(port); // open the express server to allow API calls to take place
                this.serverObj = serverObj.server
                resolve(serverObj.port)
            })().catch((err)=>{
                console.error(err, "error in starting server")
                reject(err)
            });	
        })
    }
    async initiate(port ){ 
        const $this = this;
        return new Promise((resolve, reject)=>{
            $this.initiate_server(( port ? port : $this.port)).catch((err)=>{ // initiate the server
                console.error(err, "Error  found in init wserver function")
                reject(err)
            }).then((res)=>{
                console.log(res,"_____resolved successfully")
                resolve(res)
            })
        })
    }

    async server_configuration(){
        return new Promise((resolve, reject)=>{
            const $this = this;
            define_configuration(store.system).then((config)=>{ // define the configuraiton of the system based on teh yaml file(s)
                store.system  = { ...store.system, ...config }
                store.logger = require("../shared/logger.js").logger(
                    store.system.logs.error,  // set the logger info and error files based on the meta.yml file's system config
                    store.system.logs.info
                )
                const {define_base}  = require("./api/controllers/configurations.js")
                define_base().then(()=>{ // import all configurations including modules and the meta.yml file
                    resolve()
                }).catch((err)=>{
                    store.logger.error(err)
                    reject(err)
                })
            }).catch((err)=>{
                console.error(err)
                reject(err)
            })
        })
        
    }
    
}