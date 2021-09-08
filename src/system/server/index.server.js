/**
 This file instantiates the server opening for the user which then
 Facilitates backend commmunication with the Vue Frontend and filesystem or docker

/* eslint-disable */

let { open_server,close_server } = require("./server.js");

	
async function initiate_server(port){
	console.log("initiating the server")
	return new Promise((resolve, reject)=>{
		(async ()=>{
			await open_server(port);
			console.log(port, "this is the port server");
			console.log("__________________Port served successfully")
			resolve(port)
		})().catch((err)=>{
			console.error(err, "error in starting server")
			reject(err)
		});	
	})
}
initiate_server(process.env.PORT_SERVER).catch((err)=>{
	console.error(err, "Error  found in init wserver function")
	throw (err)
}).then((res)=>{
	console.log(res,"resolved successfully")
	return(res)
})




