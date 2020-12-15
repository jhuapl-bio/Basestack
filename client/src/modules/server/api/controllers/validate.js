/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var { logger } = require("./logger.js")
const {readTableFile,getFiles, getFolders } = require("../controllers/IO.js")

const fs  = require("fs")
import  path  from "path"
export async function validatePrimerVersions(primerDir,primerNameDir, fullpathVersion){
	// console.log('validate primer version ',primerNameDir, fullpathVersion)
	return new Promise((resolve, reject)=>{
		(async function(){
			await checkFileExist(fullpathVersion, ".tsv")
			await checkFileExist(fullpathVersion, ".reference.fasta")
			await checkFileExist(fullpathVersion, ".bed")
			// await checkFileExist(fullpathVersion, primerNameDir+".tsv")
			// await checkFileExist(fullpathVersion, primerNameDir+".reference.fasta")
			// await checkFileExist(fullpathVersion, primerNameDir+".bed")
			resolve(true)			
		})().catch((err)=>{logger.error("%s %s %s %s", err, "Not valid primer dir: ", primerNameDir, primerDir); resolve(false);})
	})
}

export async function validateProtocol(protocolDir){
	// console.log('validate protocol ',protocolDir)
	return new Promise((resolve, reject)=>{
		(async function(){
			await checkFileExist(protocolDir, 'protocol.json')
			await checkFileExist(protocolDir, 'primers.json')
			await checkFileExist(protocolDir, 'genome.json')
			await checkFileExist(protocolDir, 'references.fasta')
			resolve(true)			
		})().catch((err)=>{logger.error("%s %s", "Not valid protocol dir: ", protocolDir); resolve(false);})
	})
}

export async function validateHistory(historyDir){
	return new Promise((resolve, reject)=>{
		(async function(){
			const basename = path.basename(historyDir)
			basename == "custom" ? resolve(false) : ''
			await checkFileExist(historyDir, 'report-meta.json')
			resolve(true)			
		})().catch((err)=>{logger.error("%s %s", "Not valid history dir: ", historyDir); resolve(false);})
	})
}
export async function validateAnnotation(annotationDir){
	return new Promise((resolve, reject)=>{
		(async function(){
			const basename = path.basename(annotationDir)
			await checkFileExist(annotationDir, 'report-meta.json')
			resolve(true)			
		})().catch((err)=>{logger.error("%s %s", "Not valid annotation dir: ", annotationDir); resolve(false);})
	})
}
export async function validateVideo(videoPath){
	return new Promise((resolve, reject)=>{
		(async function(){
			if (path.extname(videoPath) == ".mp4"){
				resolve(true)			
			} else {
				resolve(false)
			}
		})().catch((err)=>{logger.error("%s %s", "Not valid video: ", videoPath); resolve(false);})
	})
}


export async function checkFileExist(dir, extension, silent){
	return new Promise((resolve, reject)=>{
		if(dir){
			fs.exists(dir, function(exists){
			    if(exists){
			    	fs.readdir(dir, (err, items)=>{
						if(err){
							logger.error(err)
							reject(err)
						} else {
							var targetFiles = items.filter(function(file) {
							    return path.basename(file).includes(extension);
							});
							if (silent){
								targetFiles.length === 0 ? resolve(false) : ''																					
							} else {
								targetFiles.length === 0 ? resolve(new Error("No "+ extension+" files found in specified directory: " + dir)) : ''													
							} 

							resolve(true)
						}
					})
			    } else {
			    	resolve(false)
			    }
			})
		} else {
			resolve(false)
		}
	})
}

export async function checkFolderExistsReject(filepath){
	return new Promise((resolve, reject)=>{
		 fs.exists(filepath, function(exists){
		    if(exists){
		    	reject("Folder exists with that name. Try a different one or remove the bookmark on your current one and try again.")
		    } else {
		    	resolve("Doesnt exist")
		    }
		})
	})
}

export async function checkFolderExists(filepath){
	return new Promise((resolve, reject)=>{
		 fs.exists(filepath, function(exists){
		    if(exists){
		    	resolve(true)
		    } else {
		    	resolve(false)
		    }
		})
	})
}

export async function checkFolderExistsAccept(filepath){
	return new Promise((resolve, reject)=>{
		 fs.exists(filepath, function(exists){
		    if(exists){
		    	resolve(true)
		    } else {
		    	resolve(false)
		    }
		})
	})
}
export async function validate_run_dir(runDir){
	const run_info = runDir.run_info.filename
	const run_config = runDir.run_config.filename
	const manifest = runDir.manifest.filename
	const runDir_path = runDir.path
	const fastqFolderName = runDir.fastqDir.name
	const basename = path.basename(runDir_path)
	const validation = {
		fastq: {
			exists: false,
			valid: false,
		},
		run_info: {
			exists: false,
			valid: false
		},
		run_config: {
			exists: false,
			valid: false
		},
		manifest: {
			exists: false,
			valid: false
		}
	}
	runDir.fastqDir.validation = false
	runDir.run_config.validation = false
	runDir.run_info.validation = false
	runDir.manifest.validation = false
	runDir.basename = basename
	let files = []; let content;
	try{
		// const fastqFolderPath = path.join(runDir_path, fastqFolderName)
		const manifestPath = path.join(runDir_path, manifest)
		const run_configPath = path.join(runDir_path, run_config)
		const run_infoPath = path.join(runDir_path, run_info)
		const run_configExists = await checkFileExist(runDir_path, run_config, true)
		const run_infoExists = await checkFileExist(runDir_path, run_info, true)
		const manifestExists = await checkFileExist(runDir_path, manifest, true)
		
		let possibleFolders  = await getFolders(runDir_path)
		let validFolders = []; let checkExists = [];
		for (let i = 0; i < possibleFolders.length; i++){
			checkExists.push(checkFileExist(possibleFolders[i].path, ".fastq", true))
		}
		let response = await Promise.all(checkExists)
		validFolders = possibleFolders.filter((d,i)=>{
			if (response[i]){
				possibleFolders[i].validation = true
				return true
			} else {
				possibleFolders[i].validation = false
				return false
			}
		})
		let promises = []
		validFolders.forEach((d)=>{
			promises.push(getFiles(d.path))
		})
		response = await Promise.all(promises)
		response.forEach((d,i)=>{
			validFolders[i].files = d
		})
		runDir.possibleFastqFolders  = validFolders
		if (validFolders.length > 0){
			runDir.fastqDir = validFolders[0]
		}
		if(run_configExists){
			validation['run_config']['exists'] = run_configExists
			content = await readTableFile(run_configPath, '\t')
			runDir.run_config.primers = content[0][1]	
			runDir.run_config.basecalling = content[1][1]
			runDir.run_config.barcoding = content[2][1]
			runDir.run_config.validation = run_configExists
		}
		if(run_infoExists){
			validation['run_info']['exists'] = run_infoExists
			content = await readTableFile(run_infoPath, '\t')	
			runDir.run_info.desc = content[0][1]
			runDir.run_info.validation = run_infoExists
		}
		if(manifestExists){
			validation['manifest']['exists'] = manifestExists
			content = await readTableFile(manifestPath, '\t')	
			runDir.manifest.entries = content.map((d)=>{
				return {barcode: d[0], id: d[1]}
			})
			runDir.manifest.validation = manifestExists
		}
		console.log("return final____")
		return {
			runDir: runDir
		}
	} catch(err){
		logger.error(err)
		throw err
	}
}