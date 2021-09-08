import { env } from 'process'

const { store } = require('../store/global')
const {logger, spawnLog, createLoggingObject }  = require('../controllers/logger')
const path = require("path")
const { check_image, check_container } = require("../controllers/fetch.js")
const { spawn } = require("child_process")
export  class Workflow {
	constructor(name, command, service,build, dependencies){
        this.name= name
		this.command = command
		this.service = service
		this.builder = build
		this.log = []
		this.logger = createLoggingObject(name)
		this.dependencies = dependencies
		this.installed = false
		this.status = {
			running: false, 
			code: false
		}
	}
	async init (){
		const $this = this
		return new Promise(function(resolve,reject){
			$this.dependencyCheck().then(()=>{
				//Check if all dependencies are installed, if not return false
				let complete = $this.dependencies.every((dependency)=>{
					return dependency.status  
				}) 
				$this.installed = complete
				$this.statusCheck().then((state)=>{
					//Identity if the service should be started and ONLY IF all dependencies are installed for said module
					if ($this.service.init && complete && !state.running){
						logger.info(` running an init module that has all necessary deps... ${$this.service.command}`)
						//Run the module according to the workflow parameters
						$this.run({})
					}
					logger.info(`${state.running}: is the running state of the service: ${$this.service.name}`)
				}).catch((error)=>{
					logger.error(error)
				})
				resolve()
			}).catch((err)=>{
				logger.error(`${err}, error in dependency checking`)
				reject(err)
			})
		})
	}
	async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
			if ($this.command == "docker-compose"  ){
				(async ()=>{
					let status = await check_container($this.service.name)
					$this.status.running = status.running
					resolve(status)
				})().catch((err)=>{
					resolve(false)
				})
			} else {
				(async ()=>{
					resolve(true)
				})().catch((err)=>{
					resolve(false)
				})
			}
		})
	}
	async dependencyCheck(){
		const $this = this;
		let dependencies = this.dependencies
		return new Promise(function(resolve,reject){
			logger.info(`Running dependency check: ${JSON.stringify(dependencies)}`)
			let promises = []
			dependencies.forEach((dependency)=>{ 
				if (dependency.type == "docker"){
					promises.push(check_image(dependency.target))
				}
			})
			
			Promise.allSettled(promises).then((response, err)=>{
				response.forEach((dependency, index)=>{
					if (dependency.status == 'fulfilled'){
						logger.info(`${dependency}: check image success`)
						$this.dependencies[index].status = true
						$this.dependencies[index].version = dependency.value.version
					} else {
						$this.dependencies[index].status = false
						$this.dependencies[index].version = null
					}
				})
				resolve(`Dependency Check finished`)
			}).catch((err)=>{
				// logger.error(`${err} Error in checking target dependencies`)
				reject(`${err} Error in checking target dependencies`)
			})
			
		})
	}
	async stop(){ 
		const $this = this;
		return new Promise(function(resolve,reject){
			const ls = spawn(
				$this.command, 
				$this.service.stop.trim().split(" "),  
				{ cwd: `src/system/workflows/${$this.name}` 
			}) 
			$this.service.process = ls
			$this.log = spawnLog(ls, $this.logger) 
			$this.statusCheck().then((state)=>{
 				resolve(`service: ${$this.service.name} state of running`)
			}).catch((err)=>{
				reject(err)
			})
		})
	}
	async build(){
		const $this = this;
		return new Promise(function(resolve,reject){
			const ls = spawn(
				$this.command, 
				$this.builder.command.trim().split(" "), 
				{ cwd: `src/system/workflows/${$this.name}` 
			});
			$this.service.process = ls
			$this.log = spawnLog(ls, $this.logger) 
			resolve(`Building workflow service`)
		}) 
	} 
	async run(data) {
        const $this = this;
		return new Promise(function(resolve,reject){ 
			let vs = ($this.service.variables ? $this.service.variables : [])
			let variables = {}
			vs.forEach((variable)=>{
				variables[variable.name] = data[variable.name]
			}) 
			console.log("variables:" ,variables)
			const ls = spawn(
				$this.command, 
				$this.service.command.trim().split(" "),  
				{ 
					cwd: `src/system/workflows/${$this.name}`,
					env: { ...process.env, ...variables }
				}
			);
 			$this.service.process = ls
			$this.statusCheck().then((state)=>{
				let response = ""
				if(state.running){
					response = `service: ${$this.service.name} is already running`
				} else {
					response = `spawning service: ${$this.service.name}`
					$this.log = spawnLog(ls, $this.logger)
				}
				resolve(response)
			}).catch((err)=>{
				reject(`${err}: error in running the pipeline`)
			})
		})
	}
}