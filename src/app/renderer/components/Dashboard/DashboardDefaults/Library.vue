<template>
  <!-- <v-container fluid> -->
    <v-row   height="10vh" >
        <v-col sm="12">
        <v-expansion-panels  style="text-align:left;"  v-model="panel">
            <v-col  :sm="(isHovered.name !== catalog.name ? 4 : 4 )"   v-for="(catalog, key) in catalog" :key="catalog.name ">
                <v-card dense class="mx-0 configure elevation-4 " >
                    <v-expansion-panel  v-model="panel" expand  @click="isHovered = catalog">
                                <v-expansion-panel-header 
                                    :color="(isHovered.name == catalog.name ? 'grey' : 'light')">
                                    <v-toolbar-title  class="pl-0 " v-bind:style="{ color: getColor(key, 0.95, (isHovered.name == catalog.name  ), false), fontSize: '0.9em' }">
                                        {{ catalog.title ? catalog.title : catalog.name }}
                                    </v-toolbar-title>
                                    <v-spacer></v-spacer> 
                                    <v-badge v-if="catalog.status && catalog.status.installed"  x-small :color="(catalog.status  && catalog.status.latest_installed ? 'green' : 'orange darken-2')">
                                        <template v-slot:badge>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon 
                                                        x-small   v-on="on">
                                                        {{ ( catalog.status.latest_installed && catalog.status.latest_installed ? '$check' : '$exclamation' ) }}
                                                    </v-icon>
                                                </template>
                                                {{ catalog.status.latest_installed  ? 'Latest Installed' : 'Module not at the latest'  }}
                                            </v-tooltip>
                                        </template>
                                    </v-badge>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>                                
                                <v-card-actions >
                                    <v-autocomplete
                                        v-model="stagedRemote"
                                        :items="catalog.remotes"
                                        :disabled="!(catalog.remotes && catalog.remotes.length > 0)"
                                        outlined
                                        :hint="`Choose remote version to load`"
                                        persistent-hint
                                        item-text="version"
                                        item-value="version"
                                        :item-disabled="'loaded'"
                                        :item-color="'primary'"
                                        dense 
                                        :label="(catalog.remotes && catalog.remotes.length > 0 ? 'Remote Versions' : 'No Remote Versions')"
                                    >
                                        <template v-slot:item="{ item }" >
                                            <v-list-item-avatar left>
                                                <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
                                            </v-list-item-avatar>
                                            
                                            <v-list-item-content outlined  class="" >
                                                <v-list-item-title >{{ item.version ? item.version : 'No Version Available' }}</v-list-item-title>
                                                
                                                <v-spacer></v-spacer>
                                                <v-list-item-subtitle>
                                                    <v-chip
                                                    x-small
                                                    v-for="(tag, tagKey) in item.tags" :key="tagKey" class="mr-1"
                                                    >
                                                    {{tag}}
                                                    </v-chip>
                                                </v-list-item-subtitle>
                                            
                                            </v-list-item-content>
                                            <v-list-item-action>
                                                <v-subheader v-if="item.loaded">Installed</v-subheader>
                                                <v-tooltip v-if="!item.loaded" bottom>
                                                    <template v-slot:activator="{ on }">    
                                                        <v-icon v-on="on" small color="light " v-on:click="loadRemoteModule(item)"   style="text-align:right" class="ml-2 configure">$download</v-icon>
                                                    </template>
                                                    Load Remote Module
                                                </v-tooltip>
                                            </v-list-item-action>
                                        </template>
                                        <template  v-if="stagedRemote && !stagedRemote.loaded" v-slot:append>
                                        <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">    
                                                    <v-icon  v-on="on" small color="light " v-on:click="loadRemoteModule(stagedRemote)"   style="text-align:right" class="ml-2 configure">$download</v-icon>
                                                </template>
                                                Load Remote Module
                                            </v-tooltip>
                                        </template>
                                    </v-autocomplete>
                                </v-card-actions>
                                <v-card-actions>
                                    
                                    
                                </v-card-actions>
                            </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-card>
            </v-col>
        </v-expansion-panels>
        <v-col sm="12">
            <SubLibrary
                :catalog="isHovered"
                :latest="isHovered.latest_version"
                v-if="selectedModule.name"
            >
            </SubLibrary>
            <Docker/>
        </v-col>
    </v-col>
    </v-row>
  <!-- </v-container> -->
</template>

<script>
    const path = require("path")
    import FileService from '@/services/File-service.js'
    import Docker from "@/components/Dashboard/System/Docker";
    import SubLibrary from "@/components/Dashboard/DashboardDefaults/SubLibrary"

	export default {
		name: 'library',	 
        components: {
            Docker,
            SubLibrary
        },
		data() {
			return {
                status: [],
                panel: 0,
                selectedModule: {},
                stagedRemote: {},
                stored: {},
                update: 0,
                select:null,
                selected: {},
                isHovered: {},
                colorList: [
                    "rgb((139,0,139",
                    "rgb(112,128,144",
                    "rgb(139,69,19",
                   
                   
                ],
                stored: {},
                modules: [],
                catalog: [],
                modules_new: [],
                
			}
	  	},
		props: [],
		computed: {
            defaultModule(){
                return this.panel
            },
            // moduleIdx(){
            //     if (this.isHovered.modules && this.selectedModule){
            //         // return   this.isHovered.variants.findIndex(data => data === this.selectedModule)
            //         return   ( this.selectedModule.idx && this.selectedModule.idx >= 0 ? this.selectedModule.idx : 0 )
            //     }
            //     else {
            //         return 0
            //     }
            // }
		
		},
		
	    mounted(){
            this.getStatus()
            const $this = this
            // this.fetchAllRemoteLibrary('modules')
            setInterval(()=>{
                $this.getStatus()
            },4000)    


            console.log(this.catalog)
	    },
	    watch: { 
            isHovered(newValue){
                this.selectedModule = newValue.modules[0]
                if (newValue.remotes){
                    this.stagedRemote = newValue.remotes[0]
                }  else {
                    this.stagedRemote = null
                }               
            },
            selectedModule(newValue){
                this.stored[newValue.name] = newValue
            }

	    },
		
	    methods: {
            open (link) {
                try{        
                    this.$electron.shell.openPath(link)
                } catch(err){
                    this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                            title:  "Could not open the path: "+link
                    })
                }
            },
            async loadRemoteModule(item){
                FileService.setRemoteModule({
                    module: item.idx,
                    catalog: this.isHovered.name,
                }).then((response)=>{
                    FileService.saveRemoteModule({
                        module: item.idx,
                        catalog: this.isHovered.name,
                    }).then((response2)=>{
                        this.$swal({
                            title: "Loading completed!",
                            icon: 'success',
                            showConfirmButton: true,
                            allowOutsideClick: true
                        });
                        this.stagedRemote = null
                    }).catch((err)=>{
                        this.$swal.fire({
                            position: 'center',
                            icon: 'error',
                            showConfirmButton:true,
                            title: err.response.data.message
                        })
                    })                     
                }).catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                    
                }) 
            },
           
            openDir(loc, format){
                if (format == 'file'){
                    this.open(path.dirname(loc))
                } else {
                    this.open(path.dirname(loc))
                }
            },
            getColor(key, opacity, selected, background){
                const $this = this;
                let max = this.colorList.length -1
                let val = max % (key +1)
                if (background){
                    if (selected){
                        return `${ this.colorList[0] }, ${opacity})`
                    } else {
                        let color = `${ this.colorList[1] }, ${opacity})`
                        return color
                    }
                } else {
                    if (selected){
                        let color = `${ this.colorList[1] }, ${opacity})`
                        return  'white'
                    } else {
                        let color = `${ this.colorList[0] }, ${opacity})`
                        return 'grey'
                    }
                }
            },
            
            
            async getStatus(){
                const $this = this
                try{
                    let response = await FileService.getCatalog()
                    let status_obj = response.data.data
                    let reported_status_obj = {}
                    this.modules_new = [] 
                    this.catalog = response.data.data
                    this.catalog.map((d,i)=>{
                        d.selected = d.modules[this.defaultModule]
                        if (!this.stored[d.name]){
                            this.stored[d.name] = d.modules[this.defaultModule]
                        }
                        d.idx = i
                        d.modules.map((f, y)=>{
                            f.idx = y
                            return f
                        })
                        return d
                    })
                    if (!this.isHovered.name){
                        this.isHovered = this.catalog[this.defaultModule]
                    } else {
                        this.isHovered = this.catalog[this.isHovered.idx]
                    }       
                } catch(err){
                    this.initial=false
                    console.error(`${err} error in getting status`)
                } finally {
                    this.intervalChecking = false
                }
            },
			
	    	
	    }
	};

</script>
<style>
#moduleconfig{
	width:100%;
}
</style>