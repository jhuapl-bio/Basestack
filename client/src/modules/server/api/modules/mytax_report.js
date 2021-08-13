const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const { list_module_statuses } = require("../controllers/watcher")
const path = require("path")
export  class BasestackMytaxReport {
// export class docker {
	constructor(){
        this.title = "basestack_mytax_report"
		this.docker_module = store.config.images["jhuaplbio/basestack_mytax"] 
		this.basePath = path.join(store.meta.resourcePath, "mytax")
		this.modules = {}
	}
	async watch(req){
		const $this = this
		return new Promise(function(resolve,reject){
			const data = req.data
			let filename = data.filename
			let modules = []
	
			
			if (req.pipeline.key == 'basestack_mytax_report'){
				modules =  
					{
						items: [
							{
								key: "out",
								title: "Outfile",
								step: 1,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.out`
							},
							{
								key: "report",
								title: "Report",
								step: 2,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.report`
							},
							{
								key: "fullstring",
								title: "String File",
								step: 3,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.fullstring`
							},
							{
								key: "json",
								title: "Final JSON",
								step: 4,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.json`
							}
						],
						header: [
							{key: 'title', label: 'Title', sortable: false, class: 'text-center'},
							{key: 'step', label: 'Step', sortable: false, class: 'text-center'},
							{key: 'status', label: 'Exists', sortable: false, class: 'text-center'}
						]
				}	
			} else {
				modules =  
					{
						items: [
							{
								key: "references",
								title: "References",
								step: 1,
								status: null,
								statusType: 'file',
								filepath: `${data.dirpath}/raw/influenza.fna`
							},
							{
								key: "tax",
								title: "Taxonomy",
								step: 2,
								status: null,
								statusType: 'file',
								filepath: `${data.dirpath}/taxonomy/names.dmp`
							},
							{
								key: "metadata_table",
								title: "Metadata",
								step: 3,
								status: null,
								statusType: 'file',
								filepath: `${data.dirpath}/raw/annotation_IVR.dat`
							},
							{
								key: "final",
								title: "Final",
								step: 4,
								status: null,
								statusType: 'file',
								filepath: `${data.dirpath}/database.kdb`
							}
						],
						header: [
							{key: 'tax', label: 'Taxonomy', sortable: false, class: 'text-center'},
							{key: 'references', label: 'References', sortable: false, class: 'text-center'},
							{key: 'metadata_table', label: 'Metadata', sortable: false, class: 'text-center'},
							{key: 'final', label: 'Final', sortable: false, class: 'text-center'}
						]
				}	
			}		
			$this.modules = modules
			let promises = []
			list_module_statuses(modules.items).then((returned_data)=>{
				resolve(returned_data)
			}).catch((err)=>{
				reject(err)
			})
		})
	}


	async build(data) {
		return new Promise(function(resolve,reject){			
            let binds = []
			let command = ""
			let cmd_option = data.cmd
			if (cmd_option.key == 'basestack_mytax_build_flukraken'){
				command = [ 'bash', '-c', `source /opt/conda/etc/profile.d/conda.sh &&\
					conda activate mytax && bash build_flukraken.sh -k /opt/databases/`
				]
				binds.push(data.data.dirpath + ":/opt/databases"  )

			} else{
				binds.push(data.data.dirpath + ":/opt/data")
				command = ['bash', '-c']
				let db = data.db.name
				let e = ""
				if (data.db.compressed){
					e = `tar -xvzf /opt/databases/${db}.tar.gz -C /opt/databases/ && `
				}
				if (data.db.name == 'custom'){
					binds.push(`${data.db.info.dirpath}:/opt/databases/${db}`)
				}
				
				
				const filename = data.data.filename
				command.push(`${e} source /opt/conda/etc/profile.d/conda.sh &&\
				conda activate mytax && kraken --db /opt/databases/${db} --output /opt/data/${data.data.filename}.out /opt/data/${data.data.filename} &&\
				kraken-report --db /opt/databases/${db}  /opt/data/${data.data.filename}.out | tee  /opt/data/${data.data.filename}.report &&\
				bash krakenreport_fullstring.sh -i /opt/data/${data.data.filename}.report -k /opt/databases/${db} -o /opt/data/${data.data.filename}.fullstring
				bash krakenreport2json.sh -i /opt/data/${data.data.filename}.fullstring -o /opt/data/${data.data.filename}.json` )
			}

			let options = {
				name: "basestack_mytax_report",
				"ExposedPorts": {
		        },
			    "HostConfig": {
				    "AutoRemove": true,
			        "Binds": binds,
			        "PortBindings": {
		            },
			    },
		        "Volumes": {
		        }

			};					
			resolve({options: options, command: command })
		})
	}
}