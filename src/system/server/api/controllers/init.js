var { logger } = require("./logger.js")
import  path  from "path"
var  { store }  = require("../store/global.js")
const { Workflow } = require("../modules/workflow.js")


export async function init_modules(){
	try{
		logger.info("Initiating status of modules and meta in fetch...")
		store.meta.modules.forEach((module)=>{ //Loop through all modules and their respective services. Many services can be a part of modules
			if (module.module){
                let dependencies = ( module.dependencies ? module.dependencies : [] )
				let workflow = module.workflow
                store.modules[module.name] = {  //Define backend storage object for selection from frontend, user response. Store in the store
                    services:[]    
                }
				
				workflow.services.forEach((service)=>{ //Loop through all services that can be derived from the module. 
                    //Create workflow object using the name, command (docker, singularity, snakemake etc), services, and dependencies including building params
                    let orchestrator = new Workflow(
                        module.name, 
                        workflow.command, 
                        service, 
                        workflow.build,
                        dependencies
                    )
                    store.modules[module.name].services.push(orchestrator) //Add the module's service into array into the store, access by index from UI
                    orchestrator.init()
				})
			}
		})
		return 
		
		
		
		// store.status.images[image].installed_digest = null
		// store.status.images[image].installation = store.meta.images[image].config
		// store.status.images[image].installation.src = null
		
		// store.dockerStreamObjs[image] = null
		// if (!element.private){
		// 	fetch_external_dockers(image)
		// }
		// store.statusIntervals.images[image] = setInterval(function(){ 
		// 	(async function(){
		// 		let response =  await check_image(image)
		// 		store.status.images[image].installed = response.status
		// 		store.status.images[image].inspect = response.image
		// 	})().catch((err)=>{
		// 		logger.error(err)
		// 		store.status.images[image].installed = false
		// 		store.status.iamges[image].inspect = null
		// 	})			
		// }, 2000);
	} catch(err){
		logger.error(err)
		throw err
	}
}