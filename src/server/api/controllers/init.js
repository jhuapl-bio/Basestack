const { store }  = require("../../config/store/index.js")

var  logger  = store.logger
import path from "path"
const { Workflow } = require("./workflow.js")
const { Orchestrator } = require("./orchestrator.js")
const Docker = require("dockerode")
const { getFolders, readFile } = require("./IO.js")

export async function docker_init(params){
	let config = null
	const meta  = store.dockerConfig
	let dockerObj;
	if (meta && meta.socketPath){
		config = meta
		dockerObj = new Docker(config);
	} else {
		dockerObj = new Docker();
	}
	return dockerObj  
}  
 

export async function init_dind(){ 
	try{  
		logger.info("Initiating dind....")   
		let workflow = store.system.orchestrators.dind.workflow
		let service = workflow.services[0]
		let orchestrator = define_service(workflow, service)
		store.dind = orchestrator 
		await orchestrator.setOptions()
		let responseNetworks = await orchestrator.createNetworks([
			'basestack-network' 
		])
		let responseVolumes = await orchestrator.createVolumes([  
			"basestack-docker",
			"basestack-docker-certs-ca",
			"basestack-docker-certs-client" 
		])
		let responseStart = await orchestrator.init()
		return 
	} catch (err){
		logger.error(`${err}, error in init orchestrator`)
		throw err
	}
} 

function define_service(workflow, service){
	
	service.dependencies = workflow.dependencies
	
	service.workflow = workflow.name
	let orchestrator = new Orchestrator(service.name)
	orchestrator.service  = service
	orchestrator.workflow = workflow.name
	return orchestrator
}

export async function init_base_modules(){
	try{
		logger.info("Initiating status of modules and meta in fetch...") 
		store.modules.forEach((module, i)=>{ //Loop through all modules and their respective services. Many services can be a part of modules
			if (module.module){
                let dependencies = ( module.dependencies ? module.dependencies : [] )
				let workflows = module.workflows
                let staged_module = []	   
 				workflows.forEach((workflow, y)=>{ //Loop through all services that can be derived from the module. 
                    //Create workflow object using the name, command (docker, singularity, snakemake etc), services, and dependencies including building params
					let services = workflow.services;
					let staged_workflow = []  
					store.modules[i].workflows[y]   = new Workflow(
						workflow.name, 
						workflow.dependencies, 
						[],
						path.join(store.system.modules.path,  "workflows", workflow.name)    
					)
					services.forEach((service, j)=>{
						service.workflow_bind = true  
						let orchestrator = define_service(workflow, service)
						// if (service.init){
						orchestrator.init() 
						// }
						staged_workflow.push(orchestrator)
						store.modules[i].workflows[y].services.push(orchestrator) 
						
						
					}) 
					staged_module.push(staged_workflow)
						
				})
			} 
		})
		return 
	} catch(err){
		logger.error("%s %o", "error in init", err)
		throw err
	}
}


