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
const https = require("https")
ncp.limit = 16;
const fs  = require("fs")
import  path  from "path"
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
import parse  from 'csv-parser'
import axios from "axios";
import { dir } from "console";
import { stream } from "winston";
const { bytesToSize } = require("./configurations.js")
const { store }  = require("../../config/store/index.js")
const  targz = require('targz');
var Client = require('ftp');
const extract = require('extract-zip')
const clone = require('git-clone');
const tar = require("tar")
import glob from "glob"
const  gunzip = require('gunzip-file');
const YAML = require("js-yaml")    

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

export async function readCsv(filepath, sep){ // 1st argument is filepath, second is whetehr or not to split the data into a tsv with a string/char
	return new Promise((resolve, reject)=>{
				
		const csvData = []; 
			fs.exists(filepath,(exists)=>{
				if (exists){
					fs.createReadStream(filepath)
					.pipe(parse({delimiter: sep}))
					.on('data', function(csvrow) {
						//do something with csvrow
						csvData.push(csvrow);        
					})
					.on("error", function(err){
						reject(err)
					})
					.on('end',function() {
						resolve(csvData)
					});
				} else {
					reject(new Error(`${filepath} doesn't exist`))
				}
				
			})
			
		
	}) 
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

export async function writeJSON(file, data){
	// let exists = await fs.stat(file)
	// console.log(file, exists)
	return new Promise((resolve, reject)=>{
		 fs.stat(file, function(err, exists){
			 ( async ()=>{
				if (err){
					console.log("File Doesn't exist", err)
					// await writeFile(file, "")
				}
				console.log("exists", data )
				await writeFile(file, JSON.stringify(data,null,4) )
				resolve()
				// fs.readFile(obj.file, (err, data) => {
				// 	if (err){
				// 	store.logger.error("%s %s %s", "Error in reading file to ammend json: ", obj.file, err)
				// 	reject(err)
				// 	}
				// 	let js = JSON.parse(data.toString())
				// 	const depthAttribute = obj.attribute
				// 	js = set(obj.attribute, obj.value, js, obj.type);
				// 	// resolve()
				// 	(async function(){
				// 	await writeFile(obj.file, JSON.stringify(js,null,4))
				// 	})().then(()=>{
				// 		resolve(js)
				// 	})
				// });
			 })().catch((err)=>{
				 reject(err)
			 })
				
		})
	})
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
				resolve(items.map((d)=>{return path.join(filepath, d)}))
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
export async function readTableFile(filepath, delimeter, header){
	return new Promise((resolve, reject)=>{ 
		let dataFull = [] 
		fs.exists(filepath, function(exists){
			if (exists){
				fs.createReadStream(filepath)
				.pipe(parse({separator: (delimeter == 'tab' ? "\t" : delimeter), headers:( header ? header: false), skip_empty_lines: true }))
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
				})
				.on("error", function(err){
					store.logger.error(err)
				});   
			} else {
				resolve(dataFull)
			}
		})
	})
}
export async function checkExists(location, globSet){
	return new Promise((resolve, reject)=>{
		if (!globSet){
			fs.stat(location, function(err, exists){
				if (err){
					resolve(
						{location: location, exists: false}
					)
				}
				if(exists){
					// let size = 0 
					// if (exists.size){
					// 	size = bytesToSize(exists.size)
					// 	console.log(size, path)
					// }
					resolve(
						{location: location, exists: true}
					)
				} else {
					resolve({
						location: null,
						exists: null
					})
				}
			})
		} else { 
			glob(
			path.basename(location),
				{ cwd: path.dirname(location) },  // you want to search in parent directory
				(err, files) => {
					if (err) {
						resolve(
							{location: location, exists: false}
						)
					}
					console.log(path.basename(location), path.dirname(location))
				
					if (files && files.length) {
						console.log(files,"<<<<<")
						resolve(
							{location: files, exists: true}
						)
					} else {
						resolve(
							{location: files, exists: false}
						)
					}
				}
			);
		}
		
	})
}

export async function removeFile(filepath, type, silentExists){
	return new Promise((resolve, reject)=>{
		 fs.exists(filepath, function(exists){
		    if(exists){
				if (!type){
					type = "file"
				}
		    	if (type == "file"){
			      fs.unlink(filepath, (err) => {
					  if (err) {
					    reject(err)
					  }
					  resolve("Removed file: " + filepath)
				  })
			    } else {
			    	rimraf(path.join(filepath), (err) => {
					  if (err) {
					  	store.logger.error("%s %s", "error in folderpath", err)
					    reject(err)
					  }
					  resolve("Removed folder: " + filepath)
				    })
			    }
		    } else {
		    	silentExists ? resolve("File doesn't exist, silent exit") : reject(`Path Doesnt exist ${filepath}`)
		    }
		})
		
	})
}
function showDownloadingProgress(received, total) {
    var platform = "win32"; // Form windows system use win32 for else leave it empty
    var percentage = ((received * 100) / total).toFixed(2);
	return percentage + "% | " + received + " bytes downloaded out of " + total + " bytes."
    // process.stdout.write((platform == 'win32') ? "\033[0G": "\r");
    // process.stdout.write(percentage + "% | " + received + " bytes downloaded out of " + total + " bytes.");
}
export async function downloadSource(url, target, params)  {
	return new Promise((resolve, reject) => {
		try{
			const p = path.resolve(target)	
			const dirpath = path.dirname(target) 
			
			var received_bytes = 0;
			var total_bytes = 0;
			// if (url.startsWith("https")){
			// 	store.logger.info("https not supported, falling back on http url instead...")
			// 	url = url.replace("https", "http")
			// }	
			let writer; 
			// p = url.parse(url),           
			let timeout = 1000; 
			let seen = {
				start: 0,  
				end: .020
			}
			let request;
			var timeout_wrapper = function( req ) {
				return function() {
					req.abort();
					writer.destroy()
					reject("File transfer timeout!"); 
				};
			};
			var downloaded = 0
			console.log("write folder....", dirpath)
			writeFolder(dirpath).then(()=>{ 
				writer = fs.createWriteStream(p)
				console.log("folder made if not existing, or continuing...") 
				if (params && params.protocol == "git"){
					store.logger.info("git protocol called to get file")
					clone(url, dirpath, {}, (err, stream)=>{ 
						console.log(err, stream)
					})
				}
				else if (params && params.protocol == 'ftp'){
					store.logger.info("ftp protocol called to get file")
					var c = new Client();   
					c.on('ready', function() {
						c.size(params.path, (err, len)=>{
							if (err) { 
								store.logger.error("Error in getting item: %s", params.path)
								reject(err)
							}
							c.get(params.path, function(err, stream) {
							if (err) { 
								store.logger.error("Error in getting item: %s", params.path)

								reject(err)
							}
								// stream.once('close', function() { c.end(); });
								stream.on("data", (buffer)=>{
									var segmentLength = buffer.length;
									downloaded += segmentLength; 
									if ( downloaded/len >= seen.start && downloaded/len <= seen.end){
										let percent= (100 * downloaded/len ).toFixed(0)
										store.logger.info("Downloading " + percent + "% " + downloaded + " bytes to " + target )
										seen.start =  .02 + downloaded/len
										seen.end =  seen.end + .02 
										writer.status = percent
									} 
									// console.log("Progress:\t" + ((downloaded/len *100).toFixed(2) + "%"));
								}) 
								.once('destroy', function () {
									c.end()
									writer.destroy() 
									// resolve(null);
								}).once('end', function () {
									c.end()
									writer.destroy()
									resolve(null);
								}).once('close', function () {
									writer.status = 100			
									writer.destroy()
									c.end()
									resolve(null);
								}).once('error', function (err) {
									store.logger.error(`Got error on ftp get: %o`, err);
									c.end() 
									writer.destroy()
									// reject(err.message);
								});
								writer.on("close", ()=>{
									console.log("ending writing of stream...")
									c.end()
								})
								stream.pipe(writer)
							});
						})
							
					});
					c.connect({ 
						host: params.url,
						user: params.user,
						password: params.password
					})
				} else { 
					store.logger.info("http(s) protocol called to get file %s", url)
					// if (!url.startsWith("http://")){
					// 	store.logger.info("url not beginning with http://, appending now..")
					// 	url = "http://" + url
					// }
					console.log(url, "to", dirpath)
					let fnct = https
					if (url.startsWith("http:")){
						fnct  = http
					}  
					let request = fnct.get(url).on("response", (response)=>{
						var len = parseInt(response.headers['content-length'], 10);
						response.on('data', function(chunk) {
							if(chunk){
								downloaded += chunk.length;
								if ( downloaded/len >= seen.start && downloaded/len <= seen.end){
									let percent= (100 * downloaded/len ).toFixed(0)
									store.logger.info("Downloading " + percent + "% " + downloaded + " bytes to " + target )
									 seen.start =  .02 + downloaded/len   
									seen.end =  seen.end + .02  
									writer.status = percent
								} 
							}

							
							// reset timeout 
							clearTimeout( timeoutId );  
							timeoutId = setTimeout( fn, timeout );  
						}).on('destroy', function () { 
							// clear timeout 
							// clearTimeout( timeoutId ); 
							writer.destroy() 
							// resolve(null);   
						}).on('end', function () {
							// clear timeout
							// clearTimeout( timeoutId );
							writer.status = 100			
							writer.destroy()
						}).on('error', function (err) {
							// clear timeout 
							store.logger.error(`Got error on http get: %o`, err);
							clearTimeout( timeoutId );
							writer.destroy()
							// reject(err.message);
						});
						response.pipe(writer)  
						// generate timeout handler
						var fn = timeout_wrapper( request );
	
						// set initial timeout
						var timeoutId = setTimeout( fn, timeout );
						writer.on("close", ()=>{
							if (typeof request.end === "function") { 
								request.end()
							}
						}).on("error", (err)=>{
							store.logger.error("err %o", err)
						})
						// resolve(writer)
					}).on('error', (e) => {
						store.logger.error(`Got error: ${e.message}`);
						reject(e)
					});
				}
				resolve(writer)
			}).catch((err)=>{
				store.logger.error("Error in downloading file: %o to: %o", url, target)
				reject(err)
			})
		} catch (Err){
			reject(Err)
		}
	});    
} 
export async function decompress_file(file, outpath){
	return new Promise((resolve, reject) => {
		const ext = path.extname(file) 
		if (ext == '.tgz' || file.endsWith('tar.gz')){
			store.logger.info("Decompress file .tgz: %s to: %s", file, outpath)
			targz.decompress({ 
				src: file, 
				dest: outpath
			}, function(err, stream){ 
				if(err) {
					store.logger.error("%o error decompressing at location", err)
					reject(err)
				} else {
					store.logger.info("Decompressed .tgz file: %s ", file)
					resolve()  
				} 
			});
		} else if (ext == 'zip' || ext == '.zip' || file.endsWith(".zip") ){
			store.logger.info("Decompress file .zip: %s to: %s", file, outpath)
			extract(file, { dir: outpath }, (err, stream)=>{
				if(err) {
					store.logger.error(err)
					reject(err)
				} else { 
					store.logger.info("Decompressed .zip file: %s ", file)
					resolve() 
				} 
			}).catch((err)=>{
				store.logger.error("Not able to unzip file")
				reject(err) 

			})
			
		} else if (ext == '.gzip' || file.endsWith(".gz") ) {
			store.logger.info("Decompress file .gz: %s to: %s", file, outpath)
			gunzip(file, path.join( outpath, path.parse(file).name) , (err, stream) => {
				if(err) {
					store.logger.error(err)
					reject(err)
				} else { 
					store.logger.info("Decompressed .gz file: %s ", file)
					resolve() 
				} 
			})
		} else {
			store.logger.error("Not proper format: tgz or .tar.gz ")
			// reject()
			reject("Not proper format: tgz or .tar.gz")
		}
	})

	
}	
export async function archive(filepath, gzip){
	return new Promise((resolve, reject)=>{
			fs.exists(filepath, function(exists){
			if (exists){
				let filetar = path.resolve(`${filepath}.tar`)
				if (gzip){
					filetar = filetar+".gz"
				}
				let basefilename = path.basename(filepath)
				let foldername = path.dirname(filepath)
				let basefiletar = path.basename(filetar) 
				// let writer = fs.createWriteStream(filetar)
				tar.c( // or tar.create
				{
					gzip: gzip,
					file: filetar,
					C: foldername,
					cwd: foldername,
					preservePaths: true
				},
				[basefilename]
				).then(_ => { 
					store.logger.info("%s tar archive made", filetar)
					resolve()
				}).catch((err)=>{
					store.logger.error("err in writing archive tgx %s %s", filetar, err)
					reject(err)
				})
				
			} else {
				reject("File doesnt exist " + filepath)
			}
		})	 
	})
}

export async function writeFile(filepath, content){
	return new Promise((resolve, reject)=>{
			const directory = path.dirname(filepath)
			console.log("writing file: file", filepath)
			mkdirp(directory).then(response=>{
				fs.writeFile(filepath, content,(errFile)=>{
					if (errFile){
						store.logger.error("Error in writing file... %o", errFile)
						reject(errFile)
					}
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
				console.log(response)
				resolve() 
			}).catch((errmkdrir)=>{
				console.log(directory) 
				store.logger.error(errmkdrir); 
				reject(errmkdrir)
			})	
	})
}

export function copyFile(source, destination){ 
	return new Promise((resolve, reject)=>{
		store.logger.info("Copying file %s to %s ", source, destination)
		let directory = path.dirname(destination)
		mkdirp(directory).then((resp)=>{
			fs.copyFile(source, destination, 0, (err)=>{
			// let response = await fs.copyFile(source, destination)
				let found = false  
				let max = 5;   
				if (err){
					store.logger.error("Error in copying file %s to %s %o", source, destination, err)
					reject(err)
				}
				store.logger.info("Copied file...")
				resolve()
				
			})
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
