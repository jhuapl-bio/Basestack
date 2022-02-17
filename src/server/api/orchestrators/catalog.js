
const path = require("path") 
var  { store }  = require("../../config/store/index.js")

export class Catalog {
    constructor(config){
        this.icon = (config.icon ? config.icon : 'cog'),
        this.title = config.title
        this.name = config.name
        this.tags = []
        this.modules = []
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }
        this.status =  { 
            installed: false, // At least one module is installed in this catalog specification
            latest: null,
            building: false,
            latest_installed: false,
            version:null,
        }
        this.latest_version = 0
        this.latest = {} 
        this.latest_index = 0
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
                let latest_version  = 0
                let latest = null
                let latest_key = 0
                let building = false
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
                    if (!latest){
                        latest = module.config
                        latest_version = ( latest.version ? latest.version : 0)
                    }
                    if (module.config.version >= 0 && module.config.version > latest_version){
                        latest = module.config
                        latest_version = module.config.version
                        latest_key = key
                    }
                    if ($this.name == 'agave'){
                        // console.log(module.status)
                    }
                    if (module.status.building){
                        building = true
                    }


                    
                    

                } )
                $this.latest = latest
                $this.status.building = building
                $this.latest_version  = latest_version
                $this.latest_index = latest_key
                let filtered = store.config.modules.filter((f)=>{
                    return f.name == $this.name 
                }) 
                latest = 0
                latest = Math.max.apply(Math, filtered.map(function(o) { return ( o.version ? o.version : 0 ); }))
                  
                if (latest_version >= latest){ 
                    $this.status.latest_installed = true
                }
 
                
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
        }, 1500)


        return interval

    }

}