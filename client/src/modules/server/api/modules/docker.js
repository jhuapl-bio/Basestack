var { initDockerLogs, attachStream, init_container_logs, check_container_exists } = require("../controllers/dockerLogs.js")
const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const { readFile, ammendJSON, copyFile, writeFolder } = require("../controllers/IO.js")
let docker = store.docker
const { Tutorial } = require("../modules/tutorial")
const { BasestackConsensus } = require('../modules/consensus')
export class DockerObj {
	constructor(image, container_name, obj){
		this.image = image;
		this.container_name = container_name;
		this.container = null;
		this.cmd = null;
		this.options = null;
		this.obj = obj;
		this.streamObj = null;
		this.config = null;
		this.status = {
			running: false,
			errors: null,
			stream: []
		}
	}
	async watch(){
		let container_name = this.container_name;
		const $this  = this;
		return new Promise(function(resolve,reject){
				store.statusIntervals.modules[container_name] = setInterval(()=>{
				(async () => {					
					const response = await $this.check_container_exists(container_name)
					store.modules[container_name].status.running = response
				})().catch((err)=>{
					reject(err)
				})
			}, 2000)
			resolve()

			


		})
	}
	async cancel() {
		let container_name = this.container_name;
		return new Promise(function(resolve,reject){
			// delete store.modules[container_name]
			var container = store.docker.getContainer(container_name).remove({force:true}, function(err,data){
				if (err){
					logger.error("%s %s %s", "Error in stopping docker container: ",container_name, err)
					resolve({message: `Module does not exist: ${container_name}`})
				} else {
					logger.info("%s %s", "Success in removing container: ", container_name)
					resolve({message: `Success in stop module: ${container_name}`})
				}
			})
		})
	}
	async check_container_exists(){
		let container_name = this.container_name;
		return new Promise(function(resolve,reject){
			(async function(){
				let response = await check_container_exists(container_name)
				resolve(response.exists)
			})().catch((err)=>{
				logger.error(`${err}`)
				reject(err)
			})


		})
	}
	start(params){
		// var container = store.docker.getContainer(this.name);
		const $this = this
		let options; let command;
		return new Promise(function(resolve,reject){
			let name = $this.container_name
			store.docker.info(function(err,data){
				if(err){
		 		  	logger.error("%s %s","Error in grabbing docker information, likely docker isn't running: ", err)
		 		  	reject(new Error("Error in starting docker, please ensure docker is running. You can find more information on this through the README or via https://docs.store.docker.com/get-docker/"))
				} else{
					(async function(){
						let exists;
						exists = await $this.check_container_exists(name)
						if (!exists){
							logger.info(1)
							const opt  = await $this.obj.build(params);//build up the params for docker to run appropriately
							logger.info(2)
							options = opt.options;
							command = opt.command
							store.docker.createContainer({
								Image: $this.image, 
								Cmd: command, 
								Tty: true,
								name: options.name,
								Volumes: options.Volumes,
								HostConfig: options.HostConfig,
								ExposedPorts: options.ExposedPorts,
								User: options.user

							},  function (err, container) {
								  
						 		  if (err){
						 		  	logger.error("%s %s %s","Error in creating docker container for: ", options.name , err)
						 		  	reject(err)
								  	// reject({code: err.statusCode, message: err.message})
								  } else{
							  		container.start(function (err, data2) {
							  			if(err){
							  				logger.error("%s error in starting container", err)
							  				reject(err)
							  			}
										initDockerLogs(container, options.name, $this).then(()=>{
								  			resolve({message: `Successfully started container: ${name} and generating logfiles`, payload: opt.payload, exists: false })
							  			}).catch((errLog)=>{
							  				logger.error("%s %s %s","Error in initiating docker logs for: ", options.name, errLog)
							  				reject(errLog)
							  			})
							  		})	
						  	  }
							});	
						}
						else {
							resolve({message: `Container ${name} already running...`, exists: true, payload: null })
						}
					})().catch((err)=>{
						logger.error(`Error in checking if container exists and starting ${err} `)
						reject(err)
					})
				}
			})
		});
	}
}