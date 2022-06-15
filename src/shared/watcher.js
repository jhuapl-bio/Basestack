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

export var list_module_statuses = async function(paths){ // check waht the status of a module is based on output files
	return new Promise(function(resolve,reject){ 
		let promises = [] 
		paths.forEach((path)=>{ 
			promises.push(get_status_complete(path)) // for each patch, check status based on config params
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
		glob(`${filepath}`, {}, function(error, files){ // use glob to check a pattern match, return list of files
			if (error){
				status = 0
			}
			else if(files.length){ // if dev has defined not the length to be a certain amount, check if the existence of any files are there 
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
			status: { // set up object that reports the total output files made/needed for run to be done, and where the source location is as well as how many are complete
				total: 0,  
				complete: 0,
				source: null
			},
			key: key
		} 
		if (!params.source){
			resolve(mod)
		} else {
			if (params.element =="file"){ // if element is a file
				mod.status.total = 1 // say it only needs 1 output
				fs.access(params.source, function( error){ // figure out if it exists
					if (error){
						mod.status.complete = 0 
						mod.status.source = params.source
					}
					else{
						mod.status.complete = 1
						mod.status.source = params.source // source is equal to the path
					} 
					resolve(mod) 
					
				})	
			} else { // we need to look to see if all files are found
				if (typeof outputs.total == 'object'){
					mod.status.total = (outputs.total.target ? outputs.total.target : 0);
				} else {
					mod.status.total = (outputs.total ? outputs.total : 0); // if the defined amount is based on a total length (like array list), report toal as that otherwise 0
				}
				(async ()=>{
					const exists = await checkFolderExists(params.source)
					let files_complete = [];
					if (exists){
						let files = await getFiles(params.source)
						
						let count = 0;
						for (let j = 0; j < files.length; j++){ // if any files match the regex 
							var re = new RegExp( params.pattern, 'g' ); // match a pattern based on the pattern described in the yaml file
							if (files[j].match(re)){
								count +=1
								files_complete.push(files[j])
							}
						}
						
						mod.status.complete = count
						mod.status.source = files_complete
						
						
					} else {
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

 
