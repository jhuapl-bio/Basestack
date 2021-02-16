var { logger } = require("../controllers/logger.js")
const moment = require('moment');
const path = require ("path")
const { readFile, ammendJSON, writeFile, copyFolder, writeFolder } = require("../controllers/IO.js")
const {validateAnnotation, checkFolderExists, checkFileExist } = require("../controllers/validate")
const {store} = require('../store/global')


export class RAMPART{	
	constructor(){

	}
	async build(data) {
		return new Promise(function(resolve,reject){
			(async ()=>{
				// Send websocket command to return the results of rampart served at a port through docker. Todo
				const fastqDir = data.runDir.fastqDir.path
				const removeAnnotations = data.removeAnnotations
				
				let srcProtocol = data.protocolDir.srcPath
				let relativeProtocol = data.protocolDir.relativePath // Must define relative due to linux bind mount limitations

				const name = data.name
				const reportDir = data.reportDir
				const annotationsDir = data.annotationsDir



				const currentDateTime = moment().format('YYYY-MM-DDTHH-mm-ss')
				const metaFile = path.join(reportDir.path, "report-meta.json")
				const fastqDirBase = data.runDir.path
				// Manual Error checking section

				//If protocol is validated, we now need to copy the contents to the run directory due to Linux /tmp volatility preventing volume binding
				let protocolFolder = await checkFolderExists(relativeProtocol)

				if (!protocolFolder){
					await writeFolder(path.join(data.reportDir.path, "protocol"))
					relativeProtocol = path.join(data.reportDir.path, "protocol", data.protocolDir.fullname)
					await copyFolder(srcProtocol, relativeProtocol)
					data.protocolDir.relativePath = relativeProtocol
				}
				let protocolDir = data.protocolDir.relativePath
				// Check if the directory contains one or more fastq files
				await checkFileExist(fastqDir, ".fastq")
				await checkFileExist(protocolDir, 'protocol.json')
				await checkFileExist(protocolDir, 'primers.json')
				await checkFileExist(protocolDir, 'genome.json')
				await checkFileExist(protocolDir, 'references.fasta')
				

				let annotationObj = {name: name, protocolDir: relativeProtocol, path: null, fastqDir: fastqDir, created: currentDateTime}
				const tmpannotationsDirPath = path.join(reportDir.path, 'annotations', currentDateTime)
				await checkFileExist(reportDir.path, 'report-meta.json')






				//Now, check the output folder on host is present, if not, remake it. If annotation directory is null for this run (current or bookmark), generate it. Otherwise, check remove annotations and continue for this run
				if(!annotationsDir){
					annotationObj.path = tmpannotationsDirPath
					await ammendJSON({
						value: annotationObj,
						file: metaFile,
						attribute: "annotationsDir"
					}).catch((err)=>{
						logger.error(err)
						throw err
					})
					await ammendJSON({
						value: data.protocolDir,
						file: metaFile,
						attribute: "protocolDir"
					}).catch((err)=>{
						logger.error(err)
						throw err
					})
					await writeFile(path.join(tmpannotationsDirPath, "report-meta.json"), JSON.stringify(annotationObj,null,4))
				} else {
					let validAnnotation = await validateAnnotation(annotationsDir.path)
					if(!validAnnotation){
						annotationObj.path = annotationsDir.path
						await writeFile(path.join(annotationsDir.path, "report-meta.json"), JSON.stringify(annotationObj,null,4))
					} else { 
					 	annotationObj = JSON.parse(await readFile(metaFile, false)) //todo: error checking for json
						annotationObj = annotationObj.annotationsDir
					}
					await ammendJSON({
						value: data.protocolDir,
						file: metaFile,
						attribute: "protocolDir"
					}).catch((err)=>{
						logger.error(err)
						throw err
					})
					await ammendJSON({
						value: annotationObj,
						file: metaFile,
						attribute: "annotationsDir"
					}).catch((err)=>{
						logger.error(err)
						throw err
					})
				}

				const annotationsDirPath = annotationObj.path
				//Right now it assumes the references is alone and contains "*reference*.fasta". Add input for cusotm input of reference fasta file name
				const tmpprotocolDir = "/opt/rampart/protocolDir"
				const json = tmpprotocolDir+"/*protocol*.json"
				const references = tmpprotocolDir+"/*reference*.fasta"
				const tmpannotationsDir = "/opt/rampart/annotationsDir"
				const tmpfastqDir = "/opt/rampart/fastqDir"
				let volumes = [protocolDir,tmpprotocolDir, annotationsDirPath, tmpannotationsDir, fastqDir, tmpfastqDir]
				//Right now it assumes the references is alone and contains "*protocol*.json". Add input for cusotm input of protocl file name

				let options = {
					name: "rampart",
			        "ExposedPorts": {
			            "80/tcp": {},
			            "3001/tcp": {},
			            "3000/tcp": {}
			        },
			        // user: store.meta.uid.toString() + ":"+store.meta.gid.toString(),
				    "HostConfig": {
				    	"AutoRemove": true,
				        "Binds": [
			                volumes[2]+":"+volumes[3],
			                volumes[0]+":"+volumes[1]+":ro",
			                volumes[4]+":"+volumes[5]
				        ],
						"PortBindings": {
				            "3001/tcp": [
				                {
				                    "HostPort": "3001"
				                }
				            ],
						    "3000/tcp": [
					            {
					                "HostPort": "3000"
					            }
					        ]
			            },		        
				    },
			        "Volumes": {
			        	// [tmpprotocolDir]: {},
			        	[tmpannotationsDir]: {},
			        	[tmpfastqDir]: {}
			        }
				}	

				// let command = ['bash', '-c', `id -u && groups`]
				let command = ['bash', '-c',
				`cd ${tmpannotationsDir}\
				&& source /opt/conda/etc/profile.d/conda.sh\
				&& conda activate artic-ncov2019\
				&& export PATH=$PATH:$PATH\
				&& rampart\
				--protocol ${json}\
				--annotatedPath ${tmpannotationsDir}\
				--basecalledPath ${tmpfastqDir}\
				--referencesPath ${references} --clearAnnotated`];
				removeAnnotations ? command[2] += " --clearAnnotated": '';
				resolve({options: options, command: command, payload: {annotationsDir: annotationObj, protocolDir: data.protocolDir }})
			})().catch((err)=>{
				reject(err)
			})				
		})
	}
}