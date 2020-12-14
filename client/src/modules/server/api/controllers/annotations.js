const { removeFile, ammendJSON } = require("./IO.js")
const { logger } = require('./logger.js')
const path = require("path")
export async function removeAnnotation(params){
	try {
		console.log("removing annotation", params.annotationDir, params.protocolDir.relativePath)
	  	await removeFile(params.annotationDir.path, 'dir')
	  	await removeFile(params.protocolDir.relativePath, 'dir').then((response)=>{
	  		logger.info("%s %s", "Success in deleting annotation", response)
			const metaFile = path.join(params.reportDir.path, "/", "report-meta.json")
	  		ammendJSON({
				value: null,
				file: metaFile,
				attribute: "annotationsDir"
			}).catch((err)=>{
				logger.error(err)
				throw err
			})
	  		return response
	  	}).catch((errinner)=>{logger.error(errinner); throw errinner})
	} catch (err){
		logger.error(err)
		throw err
	}
}