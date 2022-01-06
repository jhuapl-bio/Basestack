/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const path = require("path")
const { store }  = require("../../config/store/index.js")
const chokidar = require("chokidar")
const { getFiles} = require("./IO.js")
const {checkFolderExists } = require("./validate.js")
const { mapVariables } = require("./mapper.js")
var  logger  = store.logger 
const fs = require("fs")  
const glob = require("glob")  
var readFile = function(filename){ 
    return new Promise(function(resolve,reject){ 
	    fs.readFile(filename, function(err,data){  
	    	if (err){  
	    		reject()
	    	} else {
	    		resolve(JSON.parse(data))
	    	}
	    })

    }) 

 
}

export var watch_consensus = async function (params){
	const reportDir = params.selectedHistory.reportDir
	const articConsensusDir = reportDir.consensus.path
	const articConsensusReport = reportDir.reportFiles.finalReport.pdf.path
	if (store.consensus.change){
		store.consensus.change=false
		return store.consensus.data
	} else {
		return store.consensus.data 
	}

} 

export var list_module_statuses = async function(paths){
	return new Promise(function(resolve,reject){ 
		let promises = [] 
		console.log(paths,"<<<<")
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

export  var module_status = async function(params, key, variables, outputs){
	const $this = this;
	return new Promise(function(resolve,reject){
		let mod = {
			status: {
				total: 0, 
				complete: 0,
				source: null
			},
			key: key
		}
		params.path = mapVariables(params.path, variables)
		if (params.type =="file"){
			mod.status.total = 1
			fs.access(params.path, function( error){
				if (error){
					mod.status.complete = 0
					mod.status.source = params.path
				}
				else{
					mod.status.complete = 1
					mod.status.source = params.path
		    	} 
				resolve(mod)
		    	
			})	
		} else { // we need to look to see if all files are found
			
			if (typeof outputs.total == 'object'){
				mod.status.total = (outputs.total.target ? outputs.total.target : 0);
			} else {
				mod.status.total = (outputs.total ? outputs.total : 0);
			}
			(async ()=>{
				const exists = await checkFolderExists(params.path)
				let files_complete = [];
				if (exists){
					let files = await getFiles(params.path)
					
					let count = 0;
					for (let j = 0; j < files.length; j++){
						if(files[j].includes(params.pattern)){
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
	})  	
}

 

export  var init_watch_consensus = async function(params){
	const reportDir = params
	const articConsensusDir = reportDir.consensus.path
	const articConsensusReport = reportDir.reportFiles.finalReport.md.path

	if (store.consensus.watcher){
		store.consensus.watcher.close() 
		store.consensus.data = []
	}
	store.consensus.change=true



 	// Todo in order to watch for changes in consensus file rather than intervas of seconds from frontend
    let watcher = chokidar.watch(articConsensusReport, {persistent: true}).on('all', (event, pathwatch) => {
    	store.consensus.change = true
    	fs.exists(articConsensusReport, function(exists){
    		if(exists){
	    		fs.readFile(articConsensusReport,function(err,data){
		    		if (err){
		    			logger.error("File doesnt exist: ", articConsensusReport)
		    		} else {
			    		store.consensus.data = data.toString()
			    		store.consensus.watcher = watcher
			    		return "Watching file: " + pathwatch
		    		}
		    	})
	    	} else {
	    		logger.error("File Doesnt exist")
	    	}
    	})
	    	
	});	
	watcher.on("error", (event,pathwatch)=>{
		logger.error("Event error", event)
	})
}

