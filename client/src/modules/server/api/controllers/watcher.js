/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const path = require("path")
const { store }  = require("../store/global.js")
const chokidar = require("chokidar")
const { getFiles} = require("./IO.js")
const {checkFolderExists } = require("./validate.js")
var { logger } = require("../controllers/logger.js")
const fs = require("fs")
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
export  var module_status = async function(params, mod){
	return new Promise(function(resolve,reject){
		const reportDir = params.reportDir
		const modules = reportDir.mod
		let completeFile = path.join(mod.folderpath, mod.statusCompleteFilename)
		if (mod.statusType =="file"){
			fs.exists(completeFile, function(exists, error){
				if (error){
					reject(error)
				}
				if(exists){
		    		mod.status = [1, 1]
		    	} else {
		    		mod.status = [0, 1]
		    	}
		    	resolve(mod)
			})	
		} else { // we need to look to see if all of the BC have been completed since it is async
			let modules = params.runDir.manifest.entries
			let module_dir = mod.folderpath;
			(async ()=>{
				const exists = await checkFolderExists(module_dir)
				if (exists){
					let files = await getFiles(module_dir)
					let count = 0;
					for (let j = 0; j < files.length; j++){
						if(files[j].includes(mod.statusCompleteFilename)){
							count +=1
						}
					}
					mod.status = [count, modules.length]
				} else {
					mod.status = [0, modules.length]
				}
				resolve(mod)

			})().catch((err)=>{
				reject(err)
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

