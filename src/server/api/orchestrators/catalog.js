
const path = require("path") 
var  { store }  = require("../../config/store/index.js")

export class Catalog {
    constructor(config){
        this.icon = (config.icon ? config.icon : 'cog'),
        this.title = config.title
        this.tags = []
        this.modules = []
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }
        this.status =  { 
            installed: false, // At least one module is installed in this catalog specification
            latest: null,
            building: true,
            version:null,
        }
        this.name = config.name
    }
    async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
            let promises = []
                let running = false
                let error = null
                let full_install = true
                let partial_install = false
                $this.modules.forEach((module, key)=>{
                    let step = null;
                    if (module.status.error){
                        if (!error){
                            error = ""
                        }
                        error += `Module: ${key}, Error: ${module.status.error}\n`
                    } 
                    if(module.status.running){
                        // $this.service_steps[key] = true
                        running = true
                    } 
                    if (module.status.partial_install){
                        partial_install = true
                    }

                } )
                $this.status.running = running
                $this.status.error = error
                $this.status.installed = partial_install
                resolve($this.status)
        }) 
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
        }, 5000)


        return interval

    }

}