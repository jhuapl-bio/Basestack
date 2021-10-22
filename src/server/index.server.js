/**
 This file instantiates the server opening for the user which then
 Facilitates backend commmunication with the Vue Frontend and filesystem or docker

/* eslint-disable */

let { open_server } = require("./server.js");
// const { define_configuration } = require("./api/controllers/configurations.js")
var {define_configuration, store } = require("./config/store/index.js")
const {define_base}  = require("./api/controllers/configurations.js")
// const { define_base } = require("./api/controllers/init.js")
async function initiate_server(port){
	console.log("initiating the server")
	return new Promise((resolve, reject)=>{
		(async ()=>{
			await open_server(port);
			console.log(port, "this is the port server");
			resolve(port)
		})().catch((err)=>{
			console.error(err, "error in starting server")
			reject(err)
		});	
	})
}

define_configuration().then((config)=>{
	store.system  = { ...store.system, ...config }
	store.logger = require("../shared/logger.js").logger(store.system.logs.error, store.system.logs.logfile)
	define_base().then(()=>{
		initiate_server(process.env.PORT_SERVER).catch((err)=>{
			console.error(err, "Error  found in init wserver function")
			throw (err)
		}).then((res)=>{
			console.log(res,"resolved successfully")
			return(res)
		})
	})
	
})






