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
	async watch(data){
		const $this = this
		return new Promise(function(resolve,reject){
			let filename = data.filename
			
			let modules =  [
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
				},
			]
			
			$this.modules = modules
			let promises = []
			list_module_statuses(modules).then((returned_data)=>{
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
			if (cmd_option == 'basestack_mytax_build_flukraken'){
				command = [ 'bash', '-c', `source /opt/conda/etc/profile.d/conda.sh &&\
					conda activate mytax && bash build_flukraken.sh -k /opt/databases/flukraken`
				]
				binds.push(data.data.outputDirPath + ":/opt/databases"  )
				
			} else{

				binds.push(data.data.dirpath + ":/opt/data")
				let db = data.db_name
				const filename = data.data.filename
				command = [ 'bash', '-c', `source /opt/conda/etc/profile.d/conda.sh &&\
				conda activate mytax && kraken --db /opt/databases/${db} --output /opt/data/${data.data.filename}.out /opt/data/${data.data.filename} &&\
				kraken-report --db /opt/databases/${db}  /opt/data/${data.data.filename}.out | tee  /opt/data/${data.data.filename}.report &&\
				bash krakenreport_fullstring.sh -i /opt/data/${data.data.filename}.report -k /opt/databases/${db} -o /opt/data/${data.data.filename}.fullstring
				bash krakenreport2json.sh -i /opt/data/${data.data.filename}.fullstring -o /opt/data/${data.data.filename}.json` ]
			}

			console.log("command: ", command, "binds", binds)
			let options = {
				name: "basestack_mytax_report",
				user: store.meta.uid.toString() + ":"+store.meta.gid.toString(),
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