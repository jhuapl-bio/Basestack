const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const path = require("path")
const { 
	checkFileExist,
	checkFolderExists,
	checkFolderExistsReject  
} = require("../controllers/validate")

const {copyFile, writeFolder, readTableFile,getFiles, writeFile, readFile, removeFile } = require("../controllers/IO.js")
const moment = require("moment")

export class BasestackConsensus{
	constructor(){

	}
	async build(data) {
		try {
			// Send websocket command to return the results of articserved at a port through docker
			// Likely volume could be used here that is mounted somehwere in host OS or we cna return a json/tsv 
			//get the current datetime for this report
			const currentDateTime = moment().format('YYYY-MM-DDTHH-mm-ss')
			// const primerDir = data.primerDir
			const fastqDir = data.runDir.fastqDir.path //get parent directory that contians fastq_pass
			const consensusScripts = path.join(store.meta.dockerImagesPath, "sciserver", "covid19")
			const baseDir = data.runDir.path
			const reportDir = data.reportDir
			const meta = reportDir.meta
			const run_config = meta.run_config
			const run_info = meta.run_info
			const manifest = meta.manifest
			// const versionDir = path.basename(primerDir)
			// const primerNameDir = path.basename(path.dirname(primerDir))


			//Error checking for artic consensus generation
			//Read file presence
			await checkFileExist(path.dirname(run_info.path), run_info.name)
			await checkFileExist(path.dirname(run_config.path), run_info.name)
			await checkFileExist(path.dirname(manifest.path), run_info.name)
			await checkFileExist(fastqDir, ".fastq")
			// await checkFileExist(primerDir.fullpath, ".tsv")
			// await checkFileExist(primerDir.fullpath, ".reference.fasta")
			// await checkFileExist(primerDir.fullpath, ".bed")

			// const tmpprimerDir = "/tmp/consensus/primers/"+primerNameDir+"/"+versionDir
			const tmpreportDir = "/tmp/consensus/reports"
			const tmpConsensusDir = "/root/idies/workspace/covid19/sequencing_runs/example-run/artic-pipeline"
			const tmpbaseDir = "/root/idies/workspace/covid19/sequencing_runs/example-run"
			const tmpfastqDir = "/root/idies/workspace/covid19/sequencing_runs/example-run/fastq_pass"
			// const tmpConsensusScripts = "/root/idies/workspace/covid19"
			const tmpRunInfo = tmpfastqDir + run_info
			const tmpManifest = tmpfastqDir + manifest
			const tmpRunConfig = tmpfastqDir + run_config
			const consensusDir = path.join(reportDir.path, 'consensus', "artic-pipeline")
			const tmpMeta = "/root/idies/workspace/meta"
			await writeFolder(consensusDir)
			await copyFile(run_config.path, path.join(baseDir,  data.runDir.run_config.filename))
			await copyFile(run_info.path, path.join(baseDir,  data.runDir.run_info.filename))
			await copyFile(manifest.path, path.join(baseDir,  data.runDir.manifest.filename))
			let volumes = [ reportDir.path, tmpreportDir,
				baseDir, tmpbaseDir,
				path.join(reportDir.path, "meta"), tmpMeta,
				consensusDir, tmpConsensusDir,
				fastqDir, tmpfastqDir
			]
			let options = {
				name: "basestack_consensus",
				// user: store.meta.uid.toString() + ":"+store.meta.gid.toString(),
			    "HostConfig": {
			    	"AutoRemove": true,
			        "Binds": [
			                volumes[0]+":"+volumes[1],
			                volumes[2]+":"+volumes[3],
			                volumes[4]+":"+volumes[5],
			                volumes[6]+":"+volumes[7],
			                volumes[8]+":"+volumes[9],
			        ],	
			    },
		        "Volumes": {
		        	[tmpreportDir]: {},
		        	[tmpfastqDir]: {},
		        	[tmpMeta]: {},
		        	[tmpConsensusDir]: {},
		        	[tmpfastqDir]: {}
		        }
			}	

			let command = [
				"bash", 
				"-c", 
				`bash artic-module1-barcode-demux.sh -i ${tmpbaseDir} `
			]
			// let command = [
			// 	"bash", 
			// 	"-c", 
			// 	`touch /root/idies/workspace/covid19/sequencing_runs/example-run/artic-pipeline/test.txt `
			// ]

			return {options: options, command: command }
		} catch(err){
			logger.error(err)
			throw err
		}				
	}
	async bookmarkSelections(params){
		const fastqDir = params.fastqDir
		const protocolDir = params.protocolDir
		const primerDir = params.primerDir
		const name = params.name
		const type = params.type
		const server_config = store.config.modules['basestack_consensus']['config']
		const currentDateTime = moment().format('YYYY-MM-DDTHH-mm-ss')
		const reportName = name + "-" + currentDateTime
		const reportPath = path.join(server_config.historyPath, name)
		const runReportPath = path.join(reportPath, "consensus", 'artic-pipeline')
		const finalConsensusPath = path.join(runReportPath, "5-post-filter") 
		const metaDir = path.join(reportPath, "meta")
		const run_statsPath = path.join(runReportPath, "run_stats") 
		const reportDir = {
			path: reportPath,
			meta: {
				run_info: {
					name: "run_info.txt",
					path: path.join(metaDir, 'run_info.txt')
				},
				run_config: {
					name: "run_config.txt",
					path: path.join(metaDir, 'run_config.txt')
				},
				manifest: {
					name: "manifest.txt",
					path: path.join(metaDir, 'manifest.txt')
				}
			},
			modules: [
				{
					key: "barcode-demux",
					title: "Demultiplexing",
					step: 1,
					status: null,
					statusType: 'file',
					statusCompleteFilename: "1-barcode-demux.complete",
					folderpath: path.join(runReportPath, "1-barcode-demux")
				},
				{
					key: "length-filter",
					title: "Length Filter",
					step: 2,
					status: null,
					statusType: "multiple_files",
					statusCompleteFilename: ".complete",			
					folderpath: path.join(runReportPath, "2-length-filter")
				},
				{
					key: "normalization",
					title: "Normalization",
					step: 3,
					status: null,
					statusType: 'multiple_files',
					statusCompleteFilename: ".complete",
					folderpath: path.join(runReportPath, "3-normalization")
				},
				{
					key: "draft-consensus",
					title: "Consensus Draft",
					step: 4,
					status: null,
					statusType: 'multiple_files',
					statusCompleteFilename: ".complete",
					folderpath: path.join(runReportPath, "4-draft-consensus")
				},
				{
					key: "post-filter",
					title: "Post Filter",
					step: 5,
					status: null,
					statusType: 'file',
					statusCompleteFilename: "module5-example-run.complete",
					folderpath: path.join(runReportPath, "5-post-filter")
				},
				{
					key: "report",
					title: "Report Generation",
					step: 6,
					status: null,
					statusType: 'file',
					statusCompleteFilename: "report.pdf",
					folderpath: runReportPath
				}
			],
			reportFiles: 
			{ 
				finalReport: {
					pdf: {
						path: path.join(runReportPath, "report.pdf"),
						name: "report.pdf"
					}, 
					Rmd: {
						path: path.join(runReportPath, "report.Rmd"),
						name: "report.Rmd"					
					}
				},
				mutations: {
					path: path.join(run_statsPath, "mutations-table.txt"),
					name: "mutations-table.txt"
				},
				summary: {
					path: path.join(run_statsPath, "summary.txt"),
					name: "summary.txt"
				}
			},
			consensus: {
				rootPath: runReportPath,
				path: finalConsensusPath,
				files: {
					postfilt: {
						all:  "postfilt_all.txt", 
						fasta:  "postfilt_consensus_all.fasta",
						summary: "postfilt_summary.txt"
					},
					snp: {
						final:  "final_snpEff_report.txt"
					}
				},

			}
		}

		const annotationsDir = null
		const runDir = params.runDir
		params.currentDateTime = currentDateTime;
		params.reportDir = reportDir;
		params.reportName = reportName;
		params.annotationsDir = annotationsDir
		// Manual Error checking section
		// Check if the directory contains one or more fastq files
		
		// const primerNameDir = path.basename(path.dirname(primerDir.fullpath))
		// await checkFileExist(fastqDir, ".fastq")
		// await checkFileExist(primerDir.fullpath, ".tsv")
		// await checkFileExist(primerDir.fullpath, ".reference.fasta")
		// await checkFileExist(primerDir.fullpath, ".bed")
		try {
			await checkFolderExistsReject(reportPath) //uncomment if you'd like to not overwrite the folder
		  	//write the meta data file for the run
		  	
		  	//
		  	console.log(runDir.run_info)
		  	let tsv_file_content = runDir.run_info.desc + "\n"
		  	logger.info("%s", "Bookmark run info")
		  	await writeFile(path.join(metaDir, runDir.run_info.filename), tsv_file_content+"\n").then((response)=>{
		  		logger.info("%s %s", "Success in writing runInfo files")
		  	}).catch((errinner)=>{logger.error(errinner); throw errinner})
		  	
		  	tsv_file_content = "primers\t"+runDir.run_config.primers+"\n"+
		  	'basecalling\t'+ runDir.run_config.basecalling+"\n" +
		  	'barcoding\t'+ runDir.run_config.barcoding +"\n"
		  	console.log(tsv_file_content)

		  	logger.info("%s", "Bookmark run config file")
		  	await writeFile(path.join(metaDir, runDir.run_config.filename), tsv_file_content +"\n" ).then((response)=>{
		  		logger.info("%s %s", "Success in writing runInfo file")
		  	}).catch((errinner)=>{logger.error(errinner); throw errinner})
		  	tsv_file_content = runDir.manifest.entries.map((d)=>{
		  		return d.barcode + "\t" + d.id
		  	})
		  	logger.info("%s", "Bookmark manifest")
		  	await writeFile(path.join(metaDir, runDir.manifest.filename), tsv_file_content.join("\n")+"\n" ).then((response)=>{
		  		logger.info("%s %s", "Success in writing manifest file")
		  	}).catch((errinner)=>{logger.error(errinner); throw errinner})

		  	logger.info("%s", "Bookmark meta config")
		  	await writeFile(path.join(reportDir.path, "report-meta.json"), JSON.stringify(params,null,4)).then((response)=>{
		  		logger.info("%s %s", "Success in bookmark meta file", response)
		  	}).catch((errinner)=>{logger.error(errinner); throw errinner})

		  	return params
		} catch (err){
			console.error(err)
			throw err
		}
	}
	async removeBookmark(params){
		// Manual Error checking section
		// Check if the directory contains one or more fastq files
		const reportDir = params.reportDir.path
		console.log(params)
		try {
		  	await removeFile(reportDir, 'dir').then((response)=>{
		  		logger.info("%s %s", "Success in deleting bookmark", response)
		  		return response
		  	}).catch((errinner)=>{logger.error(errinner); throw errinner})
		} catch (err){
			logger.error(err)
			throw err
		}
	}

}
