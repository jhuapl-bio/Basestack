/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const path = require("path")
const { store }  = require("../server/config/store/index.js") 
const chokidar = require("chokidar")
const { getFiles} = require("../server/api/controllers/IO.js") 
const {checkFolderExists } = require("../server/api/controllers/validate.js")
var  logger  = store.logger  
const fs = require("fs")  
const glob = require("glob")  

export var list_module_statuses = async function(paths){
	return new Promise(function(resolve,reject){ 
		let promises = [] 
		paths.forEach((path)=>{ 
			promises.push(get_status_complete(path))
		}) 
		let statuses = []
		Promise.all(promises).then((d, i)=>{
			statuses = d.map((status, j)=>{
				return d[j]
			})
			resolve(statuses)
		}).catch((err)=>{ 
			reject(err)
		})
	})
}

async function get_status_complete (filepath){
	return new Promise(function(resolve,reject){
		let status = 0
		glob(`${filepath}`, {}, function(error, files){
			if (error){
				status = 0
			}
			else if(files.length){
				status = 1
			} else { 
				status = 0 
			} 
			resolve(status)
		})	  
	})
} 
 
export  var module_status = async function(params, key){
	const $this = this;
	let outputs = params;
	return new Promise(function(resolve,reject){
		let mod = { 
			status: {
				total: 0,  
				complete: 0,
				source: null
			},
			key: key
		} 
		if (!params.source){
			resolve(mod)
		} else {
			if (params.element =="file"){ 
				mod.status.total = 1
				fs.access(params.source, function( error){
					if (error){
						mod.status.complete = 0 
						mod.status.source = params.source
					}
					else{
						mod.status.complete = 1
						mod.status.source = params.source
					} 
					resolve(mod) 
					
				})	
			} else { // we need to look to see if all files are found
				if (typeof outputs.total == 'object'){
					// console.log(outputs.total.target, outputs.total, typeof outputs.total.target) 
					mod.status.total = (outputs.total.target ? outputs.total.target : 0);
				} else {
					mod.status.total = (outputs.total ? outputs.total : 0);
				}
				(async ()=>{
					const exists = await checkFolderExists(params.source)
					let files_complete = [];
					if (exists){
						let files = await getFiles(params.source)
						
						let count = 0;
						for (let j = 0; j < files.length; j++){
							// if(files[j].includes(params.pattern)){
							var re = new RegExp( params.pattern, 'g' );
							if (files[j].match(re)){
							// if(files[j].match(params.pattern)){
									count +=1
								files_complete.push(files[j])
							}
						}
						
						// mod.status = [count, (outputs.length ? outputs.length : 0), files_complete]
						mod.status.complete = count
						mod.status.source = files_complete
						
						
					} else {
						// mod.status = [0, (outputs.length ? outputs.length : 0), files_complete]
						mod.status.complete = 0
						mod.status.source =  files_complete
					}
					resolve(mod)
				})().catch((err)=>{
					mod.status.complete = 0
					mod.status.total = 0
					resolve(mod)
				})
			}  
		}
	
	})  	
}

 
