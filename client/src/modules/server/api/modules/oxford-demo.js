const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const path = require("path")
export  class Oxford_Demo {
// export class docker {
	constructor(){
        this.title = "oxford_demo"
		this.docker_module = store.config.images["jhuaplbio/oxford-demo"] 
	}
	async build(data) {
        const $this = this;
		return new Promise(function(resolve,reject){
			let options = {
				name: $this.title,
				"ExposedPorts": {
		            "80/tcp": {},
					"8089/tcp": {}
		        },
			    "HostConfig": { 
				    "AutoRemove": true,
			        "Binds": [
			        ],	
			        "PortBindings": {
					    "8089/tcp": [ 
				            {
				                "HostPort": "8089"
				            }
				        ]
		            },
			    },
		        "Volumes": {
		        }

			};	
			let command = []
			// let command = ['bash', '-c', 'python3']
			resolve({options: options, command: command })
		})
	}
}