const { Service } = require('./service.js');
const { Procedure } = require("./procedure.js")
const { store } = require('../../config/store/index.js')
const path = require("path") 
const cloneDeep = require("lodash.clonedeep"); 
const { check_image, fetch_external_dockers } = require("../controllers/fetch.js")
const {  removeFile, decompress_file, checkExists } = require("../controllers/IO.js")
const { spawnLog } = require("../controllers/logger.js") 
const {  remove_images } = require("../controllers/post-installation.js")
export  class Module {      
	constructor(module, catalog, moduleIdx){       
        this.name= module.name 
        this.module = moduleIdx
        this.catalog = catalog
        this.type = 'module'
        this.config = module
        this.procedures = []
        this.status =  { 
            fully_installed: false,
            latest: null,
            building: false,
            version:null,
            partial_install: false,
        }
        this.interval = {
            checking: false,
            interval: this.create_interval() 
        }
        this.statusCheck()
	} 
    async create_interval (){
        const $this = this
        let interval = setInterval(()=>{
            if (!$this.interval.checking){
                $this.interval.checking = true
                $this.statusCheck().then((state)=>{
                    $this.interval.checking = false
                }).catch((err)=>{
                    store.logger.error("%s err in status check interval for module %s",err, $this.name)
                    $this.interval.checking = false
                })
            }
        }, 1000)


        return interval

    }
    async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
            let promises = []
                let running = false
                let error = null
                let full_install = true
                let building = false
                let partial_install = false
                $this.procedures.forEach((procedure, key)=>{
                    let step = null;
                    if (procedure.status.error){
                        if (!error){
                            error = ""
                        }
                        error += `Procedure: ${key}, Error: ${procedure.status.error}\n`
                    } 
                    if(procedure.status.running){
                        // $this.service_steps[key] = true
                        running = true
                    } 
                    if (procedure.status.partial_install){
                        partial_install = true
                    }
                    if (!procedure.status.fully_installed){
                        full_install = false
                    }
                    if ($this.name == 'mytax'){
                        // console.log(procedure.status, "<preocedure")
                    }
                    if (procedure.status.building){
                        building = true
                    }

                } )
                $this.status.building  = building
                $this.status.running = running
                $this.status.error = error
                $this.status.fully_installed = full_install
                $this.status.partial_install = partial_install 
                resolve($this.status)
            // $this.dependencyCheck().then((dependencies)=>{
            //     resolve()
            // }).catch((err)=>{
            //     store.logger.error("%o error in dependency check for procedure %s", err, $this.name)
            // })
        }) 
	}
    async initProcedures(){
        let promises = []   
        const $this = this;
        cloneDeep(this.config.procedures).forEach((procedure, idx)=>{
            promises.push(this.defineProcedure(procedure, idx))
        }) 
        Promise.allSettled(promises).then((response)=>{
            response.forEach((item, i)=>{
                if (item.status == 'fulfilled'){
                    
                    $this.procedures.push(item.value)
                } else {
                    store.logger.error("Error in initiating procedure... %o %s" , item, $this.config.procedures[i].name)
                }
            })
        })
    }
    async defineProcedure(procedure, procedureIdx){
        procedure.shared = this.config.shared
        let proce = new Procedure(procedure, this.catalog, this.module, procedureIdx )
        
        await proce.init() 
        
        return proce
    }
    async fetchVersion(dependency){
        try{
            if(dependency.type == 'docker'){
                // fetch_external_dockers(dependency.target).then((response)=>{
                //     if ( response){ 
                //         dependency.status.latest = response.latest_digest
                //     } else {
                //         dependency.status.latest  = null
                //     }
                // }).catch((err)=>{
                //     store.logger.error(err)
                // })
            } else {
                return 
            }
        } catch (err){
            store.logger.error("error in fetching versioning %o", err)
        }
    }
    
    async remove ( dependencyIdx ){
		const $this = this; 
        let promises = []
        let objs = [] 
        let selectedDep = []
        if (!dependencyIdx){
            selectedDep = $this.dependencies
        } else {
            selectedDep  = [ $this.dependencies[dependencyIdx] ]
        }
        selectedDep.map((dependency_obj, i)=>{            
            // dependency_obj.status.downloading = true
            objs.push(dependency_obj) 
            if (dependency_obj.type == 'docker' || dependency_obj.type == 'docker-image'  ){
                promises.push(remove_images(dependency_obj.target)) 
            }
            else{
                promises.push(removeFile(dependency_obj.target, dependency_obj.type, false) )
            }
        })
        let settled_data = await Promise.allSettled(promises)
        let messages = []
        settled_data.forEach((settled, i)=>{
            let obj = objs[i] 
            if (settled.status == 'fulfilled'){
                messages.push(
                    `Removed dependency ${settled.value}`
                )
            } else {
                messages.push(
                    `Error in removal of dependency: ${settled.reason}`
                )
            }
        })
        return messages
	} 
	
	
}