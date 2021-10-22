/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var ncp = require("ncp").ncp
const http = require("http")
ncp.limit = 16;
const fs  = require("file-system")
import  path  from "path"
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const decompress = require('decompress');
import parse  from 'csv-parser'
const { store }  = require("../../config/store/index.js")


export function set(attribute, value, obj, type) {
    var depth_attributes = attribute.split('.');
    var depth = obj
    try{
	    for(var i = 0; i < depth_attributes.length; i++) {
			if (i < depth_attributes.length - 1 ){
				if (!depth[depth_attributes[i]]){
					depth[depth_attributes[i]] = {}
				}
		    	depth = depth[depth_attributes[i]] 
		    } else {
		    	depth[depth_attributes[i]]  = value
		    }
	    }
	    return obj
	} catch(err){
		store.logger.error("Error in set :%j", err)
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
	    return depth
	} catch(err){
		store.logger.error("Error in get attributes :%j", err)
		throw err
	}
}
export async function ammendJSON(obj){
	return new Promise((resolve, reject)=>{
		 fs.exists(obj.file, function(exists){
		    if(exists){
		    	fs.readFile(obj.file, (err, data) => {
				  if (err){
				  	store.logger.error("%s %s %s", "Error in reading file to ammend json: ", obj.file, err)
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
		    	store.logger.error(err); 
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
				store.logger.error(err)
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
					store.logger.error(err)
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
				store.logger.error(err)
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
			  	store.logger.error("%s %s %s", "Error in reading the file: ", filepath, err)
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
export async function checkExists(path){
	return new Promise((resolve, reject)=>{
		fs.exists(path, function(exists){
			if(exists){
				resolve(true)
			} else {
				resolve(false)
			}
		})
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
					  	store.logger.error("%s %s", "error in filepath", err)
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
export async function downloadSource(url, target)  {
	return new Promise((resolve, reject) => {
		const p = path.resolve(target)	
		const dirpath = path.dirname(target)	
		writeFolder(dirpath).then(()=>{
			const writer = fs.createWriteStream(p)
			const request = http.get(url, function(response) {
			response.pipe(writer);
				writer.on('finish', (evt)=>{ console.log(1, url); resolve(target)})
				writer.on('error', reject)  
			})
		})
		
	});   
} 
export async function decompress_file(file, outpath){
	
	// const decompress_files = new decompress() // Commenting this out for later work, gives progress updates on downloads
	// 	.src(file)
	// 	.dest(outpath)
	// await decompress_files.run()
	// console.log("done")
	// decompress_files.on('progress', pe => {
	// 	if (pe.lengthComputable) {
	// 	const percent = Math.round(pe.decompressed / pe.total * 100);
	// 	store.logger.info(`${percent}% complete`);
	// 	}
	// })
	// .on('entry', entry => { 
	// 	store.logger.info(`Currently decompressing ${entry.fileName}.`);
	// })
	// return new Promise((resolve, reject) => {
	// 	console.log("PROMISE_________________")
	// 	decompress_files.on('finish', resolve(outpath))
	// 	decompress_files.on('error', reject)
	// })   
	try{    
		store.logger.info("Decompress file: %s", file)
		// console.log(decompressor, "DECOMPRESSOR") 
		let dec_files = await decompress(file, outpath)
		return dec_files
	} catch(err){
		store.logger.error("Error in decompressing %s: %o", file,err)
		throw err
	} 
	
}	
	

export async function writeFile(filepath, content){
	return new Promise((resolve, reject)=>{
			const directory = path.dirname(filepath)
			mkdirp(directory).then(response=>{
				fs.writeFile(filepath, content,(errFile)=>{
					if (errFile) reject(errFile)
						resolve("Success in writingfile")
				})
			}).catch((errmkdrir)=>{
				store.logger.error(errmkdrir); reject(errmkdrir)
			})	
	})
}
export async function writeFolder(directory){
	return new Promise((resolve, reject)=>{
			mkdirp(directory).then(response=>{
				resolve()
			}).catch((errmkdrir)=>{
				store.logger.error(errmkdrir); reject(errmkdrir)
			})	
	})
}

export async function copyFile(source, destination){
	return new Promise((resolve, reject)=>{
		fs.copyFile(source, destination, (error)=>{
			if(error){
				store.logger.error(error,"error in copyfile")
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
				store.logger.error(error,"error in copyfolder")
				reject(error)
			}
			resolve()
		})

	})
}
