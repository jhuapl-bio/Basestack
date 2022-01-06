const { store } = require('../../config/store/global')
const {logger}  = require('../controllers/logger')
const path = require("path")
export  class Pavian {
// export class docker {
	constructor(){
        this.title = "pavian"
		this.docker_module = store.config.images["florianbw/pavian"] 
	}
	async build(data) {
        const $this = this;
		return new Promise(function(resolve,reject){
			let options = {
				name: $this.title,
				"ExposedPorts": {
		            "80/tcp": {}
		        },
			    "HostConfig": {
				    "AutoRemove": true,
			        "Binds": [
			        ],	
			        "PortBindings": {
					    "80/tcp": [
				            {
				                "HostPort": "8087"
				            }
				        ]
		            },
			    },
		        "Volumes": {
		        }

			};	
			let command = []
			resolve({options: options, command: command })
		})
	}
}