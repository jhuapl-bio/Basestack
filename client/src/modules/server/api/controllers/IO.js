/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var { logger } = require("./logger.js")
var ncp = require("ncp").ncp
ncp.limit = 16;
const fs  = require("fs")
import  path  from "path"
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
import parse  from 'csv-parser'



export function set(attribute, value, obj, type) {
    var depth_attributes = attribute.split('.');
    var depth = obj
    try{
	    for(var i = 0; i < depth_attributes.length; i++) {
			if (i < depth_attributes.length - 1 ){
		    	depth = depth[depth_attributes[i]] 
		    } else {
		    	depth[depth_attributes[i]]  = value
		    }
	    }
	    return obj
	} catch(err){
		logger.error("Error in set :%j", err)
		throw err
	}
}

export function get(attribute, obj, type) {
    let depth = obj; 
    const typeMap = {
		'arr': [],
		'obj': {},
		"str": ""
	}
    var depth_attributes = attribute.split('.');
    try{
	    for(var i = 0; i < depth_attributes.length; i++) {
	       if (!depth[depth_attributes[i]]){
				if (i < depth_attributes.length - 1 || !type){
			    	depth[depth_attributes[i]] = {}
			    } else {
			    	depth[depth_attributes[i]] = typeMap[type]
			    }
			}	  
			depth = depth[depth_attributes[i]]	    
	    }
	    console.log("returning depth_attributes")
	    return depth
	} catch(err){
		logger.error("Error in get attributes :%j", err)
		throw err
	}
}
export async function ammendJSON(obj){
	return new Promise((resolve, reject)=>{
		 fs.exists(obj.file, function(exists){
		    if(exists){
		    	fs.readFile(obj.file, (err, data) => {
				  if (err){
				  	logger.error("%s %s %s", "Error in reading file to ammend json: ", obj.file, err)
				  	reject(err)
				  }
				  let js = JSON.parse(data.toString())
				  const depthAttribute = obj.attribute
				  js = set(obj.attribute, obj.value, js, obj.type);
				  // resolve()
				  (async function(){
				  	await writeFile(obj.file, JSON.stringify(js,null,4))
				  })().then(()=>{
					  resolve(js)
				  })
				});
		    } else {
		    	reject("File doesnt exist to ammend json attribute")
		    }
		})
	})
}
export async function itemType(filepath){
	return new Promise((resolve, reject)=>{
		fs.lstat(filepath, (err, stats) => { 
			if (err) {
		    	logger.error(err); 
				reject(err);
			}
		  	else { 
				resolve({name: path.basename(filepath), path: filepath, directory: stats.isDirectory()})
		  	} 
		}); 
	})
}



export async function getFolders(filepath){
	return new Promise((resolve, reject)=>{
		fs.readdir(filepath, (err, items)=>{
			if(err){
				logger.error(err)
				reject(err)
			} else {
				let folder_checks = [];
				for(let i =0; i < items.length; i++){
					let element = items[i]
					folder_checks.push(itemType(path.join(filepath, items[i])))
				}
				Promise.all(folder_checks).then((response)=>{
					resolve(response.filter((d)=>{return d.directory}))
				}).catch((err)=>{
					logger.error(err)
					resolve([])
				})
			}
		})
		
	})
}


export async function getFiles(filepath){
	return new Promise((resolve, reject)=>{
		fs.readdir(filepath, (err, items)=>{
			if(err){
				logger.error(err)
				reject(err)
			} else {
				resolve(items)
			}
		})
		
	})
}
export async function readFile(filepath, split){
	return new Promise((resolve, reject)=>{
		  fs.readFile(filepath, (err, data) => {
			  if (err){
			  	logger.error("%s %s %s", "Error in reading the file: ", filepath, err)
			  	reject(err)
			  } else {
				resolve(split ? data.toString().split("\n") : data.toString())
			  }
		  });		
	})
}
//Sync method of getting data
export async function readTableFile(filepath, delimeter){
	return new Promise((resolve, reject)=>{
		let dataFull = []
		fs.createReadStream(filepath)
		.pipe(parse({separator: "\t", headers:false, skip_empty_lines: true }))
		.on('data', function(data){
		    try {
		    	dataFull.push(data)
		        //perform the operation
		    }
		    catch(err) {
		    	reject(err)
		        //error handler
		    }
		})
		.on('end',function(){
			resolve(dataFull)
		});  
	})
}

export async function removeFile(filepath, type, silentExists){
	return new Promise((resolve, reject)=>{
		 fs.exists(filepath, function(exists){
		    if(exists){
		    	if (type == "file"){
			      fs.unlinkSync(filepath, (err) => {
					  if (err) {
					    reject(err)
					  }
					  resolve("Removed file: " + filepath)
				  })
			    } else {
			    	rimraf(path.join(filepath), (err) => {
					  if (err) {
					  	logger.error("%s %s", "error in filepath", err)
					    reject(err)
					  }
					  resolve("Removed file: " + filepath)
				    })
			    }
		    } else {
		    	silentExists ? resolve("File doesn't exist, silent exit") : reject(`Path Doesnt exist ${filepath}`)
		    }
		})
		
	})
}


export async function writeFile(filepath, content){
	return new Promise((resolve, reject)=>{
			const directory = path.dirname(filepath)
			mkdirp(directory).then(response=>{
				fs.writeFile(filepath, content,(errFile)=>{
					if (errFile) reject(errFile)
						resolve("Success in bookmarking file")
				})
			}).catch((errmkdrir)=>{
				logger.error(errmkdrir); reject(errmkdrir)
			})	
	})
}
export async function writeFolder(directory){
	return new Promise((resolve, reject)=>{
			mkdirp(directory).then(response=>{
				resolve()
			}).catch((errmkdrir)=>{
				logger.error(errmkdrir); reject(errmkdrir)
			})	
	})
}

export async function copyFile(source, destination){
	return new Promise((resolve, reject)=>{
		fs.copyFile(source, destination, (error)=>{
			if(error){
				logger.error(error,"error in copyfile")
				reject(error)
			}
			resolve()
		})

	})
}

export async function copyFolder(source, destination){
	return new Promise((resolve, reject)=>{
		ncp(source, destination, (error)=>{
			if(error){
				logger.error(error,"error in copyfolder")
				reject(error)
			}
			resolve()
		})

	})
}
