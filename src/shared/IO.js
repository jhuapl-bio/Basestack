const fs  = require("fs")
import glob from "glob"
import  path  from "path"
import { parse } from 'csv-parse';

export async function readFile(filepath, split){ // 1st argument is filepath, second is whetehr or not to split the data into a tsv with a string/char
	return new Promise((resolve, reject)=>{
		  fs.readFile(filepath, (err, data) => { // read the filepath, must be a file!
			  if (err){
			  	console.error("%s %s %s", "Error in reading the file: ", filepath, err)
			  	reject(err)  
			  } else {   
				resolve(split ? data.toString().split("\n") : data.toString())
			  } 
		  });		
	}) 
}

export async function checkExists(location, globSet){ // location to check for existence of path, second is to check if there is a regex match 
	return new Promise((resolve, reject)=>{
		if (!globSet){
			fs.stat(location, function(err, exists){ // if it is found, mark as exists in an object or not if doesnt exists, always resolve
				
				if (err){
					resolve(
						{location: location, exists: null}
					)
				}
				if(exists){
					
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
			console.log(location,"<<<<<<")
			glob(
			path.basename(location), // if you need to check for a pattern, glob for a path
				{ cwd: path.dirname(location) },  // you want to search in parent directory
				(err, files) => { // list array of files that match the glob pattern 
					
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