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
			const consensusScripts = path.join(store.system.dockerimagesPath, "sciserver", "covid19")
			const baseDir = data.runDir.path
			const reportDir = data.reportDir
			const meta = reportDir.meta
			const run_config = meta.run_config
			const manifest = meta.manifest
			// const versionDir = path.basename(primerDir)
			// const primerNameDir = path.basename(path.dirname(primerDir))


			//Error checking for artic consensus generation
			//Read file presence
			await checkFileExist(path.dirname(run_config.path), run_config.filename)
			await checkFileExist(path.dirname(manifest.path), manifest.filename)
			await checkFileExist(fastqDir, ".fastq")

			// await checkFileExist(primerDir.fullpath, ".tsv")
			// await checkFileExist(primerDir.fullpath, ".reference.fasta")
			// await checkFileExist(primerDir.fullpath, ".bed")

			// const tmpprimerDir = "/tmp/consensus/primers/"+primerNameDir+"/"+versionDir
			const tmpreportDir = "/tmp/consensus/reports"

			// const tmpConsensusDir = "/root/idies/workspace/covid19/sequencing_runs/example-run/artic-pipeline"
			// const tmpbaseDir = "/root/idies/workspace/covid19/sequencing_runs/example-run"
			// const tmpfastqDir = "/root/idies/workspace/covid19/sequencing_runs/example-run/fastq_pass"
			const tmpConsensusDir = "/opt/basestack_consensus/sequencing_runs/example-run/artic-pipeline"
			const tmpbaseDir = "/opt/basestack_consensus/sequencing_runs/example-run"
			const tmpfastqDir = "/opt/basestack_consensus/sequencing_runs/example-run/fastq_pass"

			// const tmpConsensusScripts = "/root/idies/workspace/covid19"
			const tmpManifest = tmpfastqDir + manifest
			const tmpRunConfig = tmpfastqDir + run_config
			const consensusDir = path.join(reportDir.path,'consensus','artic-pipeline')


			const tmpPrimerSchemes = "/opt/basestack_consensus/code/artic-ncov2019/primer_schemes/"
			const tmpBarcoding = '/opt/basestack_consensus/code/ont-guppy-cpu/data/barcoding'
			const tmpBasecalling = '/opt/basestack_consensus/code/ont-guppy-cpu/data'
			const tmpMeta = "/opt/basestack_consensus/sequencing_runs/sequencing_runs/meta"

			await writeFolder(consensusDir)
			let exists = await checkFolderExists(baseDir)
			if (!exists){
				await writeFolder(baseDir)
			}
			await copyFile(run_config.path, path.join(baseDir,  data.runDir.run_config.filename))
			await copyFile(manifest.path, path.join(baseDir,  data.runDir.manifest.filename))
			await writeFile(path.join(data.runDir.path, 'run_info.txt'), "NA")
			
			let volumes = [ 
				reportDir.path, tmpreportDir,
				baseDir, tmpbaseDir,
				consensusDir, tmpConsensusDir,
				baseDir, tmpbaseDir,
				consensusDir, tmpConsensusDir,
				fastqDir, tmpfastqDir
			]

			let command = ['bash', '-c', 'echo Starting consensus pipeline...' ]

			if (data.runDir.run_config.primers.custom && data.runDir.run_config.primers.path){
				volumes.push(data.runDir.run_config.primers.path)
				volumes.push(`${tmpPrimerSchemes}/${data.runDir.run_config.primers.name}`)
				command[2] +=(`; mkdir -p /opt/basestack_consensus/primer_schemes/${data.runDir.run_config.primers.name} &&
					ln -sf ${tmpPrimerSchemes}/${data.runDir.run_config.primers.name} /opt/basestack_consensus/primer_schemes/${data.runDir.run_config.primers.name}`)
			}
			if (data.runDir.run_config.barcoding.custom && data.runDir.run_config.barcoding.path){
				volumes.push(data.runDir.run_config.barcoding.path)
				volumes.push(`${tmpBarcoding}/${data.runDir.run_config.barcoding.name}`)
				// command[2] +=(` && ls ${tmpBarcoding}`)
			}
			if (data.runDir.run_config.basecalling.custom && data.runDir.run_config.basecalling.path){
				volumes.push(data.runDir.run_config.basecalling.path)
				volumes.push(`${tmpBasecalling}/${data.runDir.run_config.basecalling.name}`)
				// command[2] +=(`&& ls ${tmpBasecalling}`)
			}
			let binds = []
			let i  =0 ;
			while (i < volumes.length) {
			    binds.push(volumes.slice(i, i += 2).join(":"));
			}
			let options = {
				name: "basestack_consensus",
				// user: store.system.uid.toString() + ":"+store.system.gid.toString(),
			    "HostConfig": {
			    	"AutoRemove": true,
			        "Binds": binds	
			    },
		        "Volumes": {
		        }
			}	
			command[2] += (`;  bash artic-module1-barcode-demux.sh -i ${tmpbaseDir}  `)
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
		const runDir = params.runDir
		const type = params.type
		const server_config = store.config.modules['basestack_consensus']['config']
		const currentDateTime = moment().format('YYYY-MM-DDTHH-mm-ss')

		const reportName = name + "-" + currentDateTime
		const reportPath = path.join(server_config.historyPath, name)
		const runReportPath = path.join(runDir.path, "basestack",  name )
		const finalConsensusPath = path.join(runReportPath, "5-post-filter") 
		const metaDir = path.join(reportPath, "meta")
		const run_statsPath = path.join(runReportPath, "run_stats") 
		const reportDir = {
			path: runReportPath,
			meta: {
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
					folderpath: path.join(runReportPath, 'consensus', 'artic-pipeline', "1-barcode-demux")
				},
				{
					key: "length-filter",
					title: "Length Filter",
					step: 2,
					status: null,
					statusType: "multiple_files",
					statusCompleteFilename: ".complete",			
					folderpath: path.join(runReportPath,  'consensus', 'artic-pipeline', "2-length-filter")
				},
				{
					key: "normalization",
					title: "Normalization",
					step: 3,
					status: null,
					statusType: 'multiple_files',
					statusCompleteFilename: ".complete",
					folderpath: path.join(runReportPath, 'consensus', 'artic-pipeline', "3-normalization")
				},
				{
					key: "draft-consensus",
					title: "Consensus Draft",
					step: 4,
					status: null,
					statusType: 'multiple_files',
					statusCompleteFilename: ".complete",
					folderpath: path.join(runReportPath,  'consensus', 'artic-pipeline', "4-draft-consensus")
				},
				{
					key: "post-filter",
					title: "Post Filter",
					step: 5,
					status: null,
					statusType: 'file',
					statusCompleteFilename: "module5-example-run.complete",
					folderpath: path.join(runReportPath,  'consensus', 'artic-pipeline', "5-post-filter")
				},
				{
					key: "report",
					title: "Report Generation",
					step: 6,
					status: null,
					statusType: 'file',
					statusCompleteFilename: "report.pdf",
					folderpath: path.join(runReportPath,  'consensus', 'artic-pipeline' )
				}
			],
			reportFiles: 
			{ 
				finalReport: {
					pdf: {
						path: path.join(runReportPath, 'consensus', 'artic-pipeline', "report.pdf"),
						name: "report.pdf"
					}, 
					Rmd: {
						path: path.join(runReportPath, 'consensus', 'artic-pipeline', "report.Rmd"),
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
		params.currentDateTime = currentDateTime;
		params.reportDir = reportDir;
		params.reportName = reportName;
		params.annotationsDir = annotationsDir
		// Manual Error checking section
		// Check if the directory contains one or more fastq files
		
		// const primerNameDir = path.basename(path.dirname(primerDir.fullpath))
		// await checkFileExist(fastqDir, ".fastq")
		if (params.runDir.run_config.primers.path){
			const path =params.runDir.run_config.primers.path
			await checkFileExist(path, ".tsv")
			await checkFileExist(path, ".reference.fasta")
			await checkFileExist(path, ".bed")
		}
		try {
			if (type != 'update'){
				await checkFolderExistsReject(reportPath) //uncomment if you'd like to not overwrite the folder
			}
		  	//write the meta data file for the run
		  	
		  	//
	
		  	let barcoding_specification = null;
		  	if (Array.isArray(runDir.run_config.barcoding)){
		  		barcoding_specification = runDir.run_config.barcoding.map((d)=>{ return d.name }).join(" ")
		  	} else {
		  		barcoding_specification = runDir.run_config.barcoding.name		  		
		  	}

		  	let tsv_file_content = "primers\t"+runDir.run_config.primers.name+"\n"+
		  	'basecalling\t'+ runDir.run_config.basecalling.name+"\n" +
		  	'barcoding\t'+ barcoding_specification+"\n"
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
		  	await writeFile(path.join(reportPath, "report-meta.json"), JSON.stringify(params,null,4)).then((response)=>{
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
		try {			
		  	await removeFile(reportDir, 'dir', true)
		  	const server_config = store.config.modules['basestack_consensus']['config']
		  	const historyPath = path.join(server_config.historyPath, params.name)
		  	if (historyPath != reportDir ){
			  	await removeFile(historyPath, 'dir')				
		  	}
		  	return "Success on removing directory"
		} catch (err){
			logger.error(err)
			throw err
		}
	}

}