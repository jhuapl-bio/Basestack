const fs  = require("fs")
import glob from "glob"
import  path  from "path"


export async function readFile(filepath, split){
	return new Promise((resolve, reject)=>{
		  fs.readFile(filepath, (err, data) => {
			  if (err){
			  	console.error("%s %s %s", "Error in reading the file: ", filepath, err)
			  	reject(err)  
			  } else {   
				resolve(split ? data.toString().split("\n") : data.toString())
			  } 
		  });		
	}) 
}

export async function checkExists(location, globSet){
	return new Promise((resolve, reject)=>{
		if (!globSet){
			fs.stat(location, function(err, exists){
				
				if (err){
					resolve(
						{location: location, exists: null}
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
							{location: location, exists: null}
						)
					}
					if (files && files.length) {
						resolve(
							{location: files, exists: true}
						)
					} else {
						resolve(
							{location: files, exists: null}
						)
					}
				}
			);
		}
		
	})
}