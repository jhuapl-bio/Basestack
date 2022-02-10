<template>
  <!-- <v-container fluid> -->
    <v-row  no-gutters  >
        
        <v-expansion-panels  style="text-align:left;"  v-model="panel">
            <v-col  :sm="(isHovered.name !== catalog.name ? 4 : 4 )"   v-for="(catalog, key) in catalog" :key="catalog.name ">
                <v-card dense class="configure mx-0 elevation-4 " >
                    <v-expansion-panel  v-model="panel" expand  @click="isHovered = catalog">
                                <v-expansion-panel-header 
                                    :color="(isHovered.name == catalog.name ? 'grey' : 'light')">
                                    <v-toolbar-title  class=" pl-0 " v-bind:style="{ color: getColor(key, 0.95, (isHovered.name == catalog.name  ), false), fontSize: '0.9em' }">
                                        {{ catalog.title ? catalog.title : catalog.name }}
                                    </v-toolbar-title>
                                    <v-spacer></v-spacer> 
                                    <v-badge v-if="catalog.status"  x-small :color="(catalog.status  && catalog.status.installed ? 'green' : 'orange darken-2')">
                                        <template v-slot:badge>
                                            <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">
                                                    <v-icon 
                                                        x-small   v-on="on">
                                                        {{ ( catalog.status && catalog.status.installed ? '$check' : '$exclamation' ) }}
                                                    </v-icon>
                                                </template>
                                                {{ catalog.status.installed  ? 'Fully Installed ' : 'Module not fully installed'  }}
                                            </v-tooltip>
                                        </template>
                                    </v-badge>
                                </v-expansion-panel-header>
                                <v-expansion-panel-content>
                                
                                <v-card-actions >
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-icon small color="primary" v-on="on" class="configure " @click="buildModule(isHovered.name)">$download</v-icon>
                                        </template>
                                        Build Entire Module
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on" small color="indigo " v-on:click="fetchAllRemoteLibrary(isHovered.name)" style="text-align:right" class="configure ml-2">$external-link-alt</v-icon>
                                        </template>
                                        Fetch Versions for Module
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">
                                            <v-icon v-on="on" small color="orange darken-2" v-on:click="deleteModule(isHovered.name)" style="text-align:right" class="configure ml-2">$trash-alt</v-icon>
                                        </template>
                                        Delete Entire Module and its dependencies
                                    </v-tooltip>
                                    <v-tooltip bottom>
                                        <template v-slot:activator="{ on }">    
                                            <v-icon v-on="on" small color="light " v-on:click="cancelModule(isHovered.name)"   style="text-align:right" class="configure ml-2">$times-circle</v-icon>
                                        </template>
                                        Cancel Module Build
                                    </v-tooltip>
                                    <v-spacer></v-spacer>
                                    
                                    
                                </v-card-actions>
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
                                            
                                            <v-list-item-content outlined  class=" " >
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
                                                        <v-icon v-on="on" small color="light " v-on:click="loadRemoteModule(item)"   style="text-align:right" class="configure ml-2">$download</v-icon>
                                                    </template>
                                                    Load Remote Module
                                                </v-tooltip>
                                            </v-list-item-action>
                                        </template>
                                        <template  v-if="stagedRemote && !stagedRemote.loaded" v-slot:append>
                                        <v-tooltip bottom>
                                                <template v-slot:activator="{ on }">    
                                                    <v-icon  v-on="on" small color="light " v-on:click="loadRemoteModule(stagedRemote)"   style="text-align:right" class="configure ml-2">$download</v-icon>
                                                </template>
                                                Load Remote Module
                                            </v-tooltip>
                                        </template>
                                    </v-autocomplete>
                                </v-card-actions>
                                <v-card-actions>
                                    <v-autocomplete
                                            v-model="selectedModule"
                                            :items="isHovered.modules"
                                            icon-color="primary"
                                            dense outlined
                                            item-text="version"
                                            label="Loaded Versions"
                                            item-value="version"
                                            @change="selectedModuleEvent($event)"
                                            :hint="`Choose Installed Module Version`"
                                            persistent-hint
                                            return-object
                                        >
                                        <template v-slot:item="{ item }" >
                                            <v-list-item-avatar left>
                                            <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
                                            </v-list-item-avatar>
                                            
                                            <v-list-item-content outlined>
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
                                                <v-subheader v-if="item.remote">Remote</v-subheader>
                                                <v-subheader v-else-if="item.custom">Custom Made</v-subheader>
                                                <v-subheader v-else-if="item.local">Local, Default</v-subheader>
                                            </v-list-item-action>
                                        </template>
                                    </v-autocomplete>
                                </v-card-actions>
                            </v-expansion-panel-content>
                    </v-expansion-panel>
                </v-card>
            </v-col>
        </v-expansion-panels>
        <v-col sm="12">
            <SubLibrary
                :moduleIdx="moduleIdx"
                :module="selectedModule"
                :catalog="isHovered"
                v-if="selectedModule.name"
            >
            </SubLibrary>
            <Docker/>
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
            moduleIdx(){
                if (this.isHovered.modules && this.selectedModule){
                    // return   this.isHovered.variants.findIndex(data => data === this.selectedModule)
                    return   ( this.selectedModule.idx && this.selectedModule.idx >= 0 ? this.selectedModule.idx : 0 )
                }
                else {
                    return 0
                }
            }
		
		},
		
	    mounted(){
            this.getStatus()
            const $this = this
            // this.fetchAllRemoteLibrary('modules')
            setInterval(()=>{
                $this.getStatus()
            },4000)    
	    },
	    watch: { 
            isHovered(newValue){
                console.log(newValue,"<<<")
                this.selectedModule = newValue.modules[0]
                if (newValue.remotes){
                    this.stagedRemote = newValue.remotes[0]
                }
            },
            selectedModule(newValue){
                // this.selectedProcedure = newValue.procedures[0]
                console.log("new module selected")
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
                    module: this.moduleIdx,
                    catalog: this.isHovered.name,
                }).then((response)=>{
                    FileService.saveRemoteModule({
                        module: this.moduleIdx,
                        catalog: this.isHovered.name,
                    }).then((response2)=>{
                        this.$swal({
                            title: "Loading completed!",
                            icon: 'success',
                            showConfirmButton: true,
                            allowOutsideClick: true
                        });
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
            selectedModuleEvent(event){
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
            async deleteModule(name){
                const $this  = this;
                this.$swal({
                    title: 'Are you sure you want to remove this module?',
                    text: "You won't be able to revert this!",
                    type: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#2b57b9',
                    cancelButtonColor: '#a60139',
                    confirmButtonText: 'Yes, remove it!'
                }).then((res) => {
                    if (res.value) {
                        this.$swal({
                            title: "Module Deletion Initiated",
                            text: "Please wait.. this may take some time",
                            icon: 'info',
                            showConfirmButton: true,
                            allowOutsideClick: true
                        });
                        let variantIdx  = this.selectedModule.idx
                        let procedureIdx  = this.selectedModule.procedures.findIndex(data => data === this.selectedProcedure)
                        FileService.deleteProcedureDependencies({
                            module: name,
                            variant: variantIdx,
                            procedure:procedureIdx
                        }).then((response)=>{
                            this.$swal({
                                title: "Module deletion completed!",
                                icon: 'success',
                                showConfirmButton: true,
                                allowOutsideClick: true
                            });
                        }).catch((err)=>{
                            this.$swal.fire({
                                position: 'center',
                                icon: 'error',
                                showConfirmButton:true,
                                title: err.response.data.message
                            })
                            
                        }) 
                    }
                });
                
                
            },
            async cancelModule(name){
                FileService.cancelModule({
                    module: name
                })
               .then((response)=>{
                    this.$swal({
                        title: "Module Build Cancelled",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                    
                }) 
            },
            async buildModule(name){
                let variantIdx  = this.selectedModule.idx
                let procedureIdx  = this.selectedModule.procedures.findIndex(data => data === this.selectedProcedure)
                FileService.buildProcedure({
                    module: name,
                    variant: variantIdx,
                    procedure:procedureIdx
                })
               .then((response)=>{
                    this.$swal({
                        title: "Module Build Initiated",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                    
                }) 
            },
            async fetchAllRemoteLibrary(name){
                // this.$swal({
                //     title: "Module Fetch Initiated",
                //     text: "Please wait.. this may take some time",
                //     icon: 'info',
                //     showConfirmButton: true,
                //     allowOutsideClick: true
                // });
                const $this = this
                FileService.fetchRemoteAll('modules')
                .then((response)=>{
                    // this.$swal({
                    //     title: "Module Fetch completed",
                    //     icon: 'info',
                    //     showConfirmButton: true,
                    //     allowOutsideClick: true
                    // });
                    this.stored = {}
                })
                .catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                    
                }) 
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
                    console.log(this.catalog[this.defaultModule])
                    if (!this.isHovered.name){
                        this.isHovered = this.catalog[this.defaultModule]
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