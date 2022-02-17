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
			let modules = {items: []}
	
			
			if (req.pipeline.key == 'basestack_mytax_report'){
				modules =  
					{
						items: [
							{
								key: "report",
								title: "Report",
								step: 1,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.report`
							},
							{
								key: "fullstring",
								title: "String File",
								step: 2,
								status: null,
								statusType: 'file',
								filepath: `${data.filepath}.fullstring`
							},
							{
								key: "json",
								title: "Final JSON",
								step: 3,
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
			} else if (req.pipeline.key == 'basestack_mytax_process_db') {
				modules =  
					{
					items: [
						{
							key: "kdb",
							title: "KDB File",
							step: 1,
							status: null,
							statusType: 'file',
							filepath: `${data.dirpath}/database.kdb`
						},
						{
							key: "names",
							title: "Names.dmp",
							step: 2,
							status: null,
							statusType: 'file',
							filepath: `${data.dirpath}/taxonomy/names.dmp`
						},
						{
							key: "nodes",
							title: "Nodes.dmp",
							step: 3,
							status: null,
							statusType: 'file',
							filepath: `${data.dirpath}/taxonomy/nodes.dmp`
						},
						{
							key: "idx",
							title: "Idx (Index)",
							step: 4,
							status: null,
							statusType: 'file',
							filepath: `${data.dirpath}/database.idx`
						},
						{
							key: "joined_full",
							title: "Joined.full",
							step: 5,
							status: null,
							statusType: 'file',
							filepath: `${data.dirpath}/taxonomy/joined.full`
						}
					],
					header: [
						
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
					conda activate mytax && bash build_flukraken.sh -k /opt/databases/flukraken2` 
				]
				binds.push(data.data.dirpath + ":/opt/databases"  )

			}  else if (cmd_option.key == 'basestack_mytax_build_flucentrifuge'){
				command = [ 'bash', '-c', `source /opt/conda/etc/profile.d/conda.sh &&\
					conda activate mytax && bash build_flukraken.sh -k /opt/databases/flucentrifuge -c centrifuge` 
				]
				binds.push(data.data.dirpath + ":/opt/databases"  )

			} else if (cmd_option.key == 'basestack_decompress_mytax_db'){
				let db = path.basename(data.data.filepath)
				command = [ 'bash', '-c', `tar -xvzf /opt/databases/${db} -C /opt/databases/`
				]

				binds.push(data.data.dirpath + ":/opt/databases"  )

			} else{
				binds.push(data.data.dirpath + ":/opt/data") 
				let db = ( data.db.name == 'custom' ? data.db.info.dirname : data.db.name )
				console.log(data)
				let e = `source /opt/conda/etc/profile.d/conda.sh && conda activate mytax && `
				// let e = "source /opt/conda/etc/profile.d/conda.sh && conda activate mytax && "
				if (data.db.compressed){
					e = `tar -xvzf /opt/databases/${data.db.fullname} -C /opt/databases/ && `
				}
				if (data.db.name == 'custom'){  
						binds.push(`${data.db.info.dirpath}:/opt/databases/${db}`)
				}
				if (data.classifier_name == 'centrifuge'){ 
					e = `${e} $CONDA_PREFIX/lib/centrifuge/centrifuge -f -x /opt/databases/${db}/${path.basename(db)}  --report /opt/data/${data.data.filename}.centrifuge.report -q /opt/data/${data.data.filename} >  /opt/data/${data.data.filename}.out   &&\
							$CONDA_PREFIX/lib/centrifuge/centrifuge-kreport  -x /opt/databases/${db}/${path.basename(db)} /opt/data/${data.data.filename}.centrifuge.report > /opt/data/${data.data.filename}.report && `
					// e = `${e} $CONDA_PREFIX/lib/centrifuge/centrifuge-kreport  -x /opt/databases/${db}/${path.basename(db)} --output /opt/data/${data.data.filename}.out /opt/data/${data.data.filename}.centrifuge.report > /opt/data/${data.data.filename}.report && `
				} else if (data.classifier_name == 'kraken2'){
					e = `${e}  export KRAKEN2_DEFAULT_DB="/opt/databases/${db}" && \
					kraken2  --output /opt/data/${data.data.filename}.out  --report /opt/data/${data.data.filename}.report  /opt/data/${data.data.filename} && `
					// e = `${e} `
				} else {
						e = `${e} echo "Running DEPRECATED kraken1" && \
						kraken --db /opt/databases//${db} --output /opt/data/${data.data.filename}.out /opt/data/${data.data.filename} &&\
						kraken-report --db /opt/databases/${db} /opt/data/${data.data.filename}.out | tee  /opt/data/${data.data.filename}.report && `
				}
				command = ['bash', '-c']
				
				const filename = data.data.filename
				command.push(`${e} \
				python3  /opt/software/mytax/generate_hierarchy.py \
					-o /opt/data/${data.data.filename}.fullstring \
					--report /opt/data/${data.data.filename}.report  \
					-taxdump ${( data.db.taxonomy ? data.db.taxonomy : '/taxdump'  ) }/nodes.dmp
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
			console.log(command)
			resolve({options: options, command: command })
		})
	}
}