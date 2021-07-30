const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const path = require("path")
// export  class BasestackMytax {
export class docker {
	constructor(){
        this.title = "basestack_mytax"
		this.docker_module = store.config.images["jhuaplbio/basestack_mytax"] 
		this.basePath = path.join(store.meta.resourcePath, "mytax")
	}
	async build(data) {
		console.log(data, "build this product")
		return new Promise(function(resolve,reject){
			let options = {
				name: "basestack_mytax",
				user: store.meta.uid.toString() + ":"+store.meta.gid.toString(),
				"ExposedPorts": {
		            "8088/tcp": {}
		        },
			    "HostConfig": {
				    "AutoRemove": true,
			        "Binds": [
			        ],	
			        "PortBindings": {
					    "8088/tcp": [
				            {
				                "HostPort": "8088"
				            }
				        ]
		            },
			    },
		        "Volumes": {
		        }

			};	

			
			let command = [ 'bash', '-c', 'cd sunburst && python3 -m http.server 8088' ]
			resolve({options: options, command: command })
		})
	}
}