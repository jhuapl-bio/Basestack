<template>
  <v-container fluid>
    <v-row id="library"  >
        <v-col   sm="3" class="mx-0 pb-1 " align="start" @click="isHovered = module" v-for="(module, key) in modules_new" :key="module.name " >
            <v-card dense class="configure mx-0 elevation-4 ">
                
                    <v-app-bar
                        dense
                        :color="getColor(key, 0.95, true)"
                    >
                        <v-toolbar-title  class=" pl-0 " v-bind:style="{ color: getColor(key, 0.95), fontSize: '0.9em' }">
                            {{ module ? module.title : module }}
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-badge overlap x-small :color="(module.status && module.status.fully_installed ? 'green' : 'orange darken-2')">
                            <template v-slot:badge>
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-icon 
                                            x-small   v-on="on">
                                            {{ ( module.status && module.status.fully_installed ? '$check' : '$exclamation' ) }}
                                        </v-icon>
                                    </template>
                                    {{ module.status.fully_installed  ? 'Fully Installed ' : 'Module not fully installed'  }}
                                </v-tooltip>
                            </template>
                            <v-btn 
                                icon 
                            >
                                <v-icon :color="getColor(key, 0.95, false)">$bars</v-icon>
                            </v-btn>
                        </v-badge>
                    </v-app-bar>
                <v-card-actions >
                    <v-tooltip bottom>
                        <template v-slot:activator="{ on }">
                            <v-icon small color="primary" v-on="on" class="configure " @click="buildModule(isHovered.name)">$download</v-icon>
                        </template>
                        Build Entire Module
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
                </v-card-actions>
            </v-card>
            <!-- <div class="libraryModule" :id="module.name"    >
                <v-divider></v-divider>                
                <v-icon  x-small  v-if="module.status && module.status.fully_installed" color="green" >$check</v-icon>
                <v-icon color="orange darken-2" x-small style="text-align:center; float: right" v-else >$exclamation</v-icon>   
               
            </div> -->
        </v-col>
        <v-col sm="12">
        <!-- <v-collapse :visible="true" style="width: 100%; margin:auto" :id="'collapse'"> -->
            <v-card dense v-if="isHovered">
                <v-card-title  color="light" align="center">{{(isHovered.title ? isHovered.title :isHovered.name)}}</v-card-title>
                <v-card-subtitle color="light" align="center">Individual Dependencies</v-card-subtitle>
                <div v-if="isHovered" style="text-align:center; "
                    target="dind"
                    >
                    
                    <v-data-table
                        style="max-width: 100%"
                        :items="isHovered.dependencies"
                        :headers="fields"
                        :items-per-page="5"
                        centered
                        class="elevation-1"			
                        small dense
                        :footer-props="{
                        showFirstLastPage: true,
                            prevIcon: '$arrow-alt-circle-left',
                            nextIcon: '$arrow-alt-circle-right',
                            firstIcon: '$step-backward',
                            lastIcon: '$step-forward',
                        }"
                        responsive
                    >
                        <template v-slot:item.status.exists="{ item }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                <v-icon class=""  v-on="on" :color="(item.status.exists ? 'green ' : 'orange darken-1')" 
                                    x-small> {{ (item.status.exists  ? '$check' : '$times-circle'  )}}
                                </v-icon>
                                </template>
                                Existence Status (Downloaded + Installed)
                            </v-tooltip>
                        </template>
                        <template v-slot:item.status.building="{ item }">
                            <v-badge :dot="!item.status.progress" :content="( item.status.progress ? `${item.status.progress}%` : null)" v-if="item.status.building "  x-small color="info" >
                                <v-progress-circular x-small  bottom
                                    indeterminate 
                                    :size="15"
                                    color="blue-grey"
                                ></v-progress-circular>                                
                            </v-badge>
                            <v-tooltip bottom v-else-if="item.status.error">
                                <template v-slot:activator="{ on }">
                                    <v-icon x-small v-on="on"
                                        color="green "
                                        v-if="!item.status.error"
                                    >
                                    </v-icon>
                                    <v-icon v-on="on" x-small v-else color="red darken-2">
                                        $times-circle
                                    </v-icon>
                                </template>
                                {{ ( item.status.error ? item.status.error : 'No Errors' ) }}
                            </v-tooltip> 
                        </template>
                      
                        <template v-slot:item.format="{ item }">
                            <v-tooltip v-if="item.format == 'file' || item.format == 'dir'" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon  
                                        v-on="on" class="configure" color="primary" @click="openDir(item.target, item.format)"
                                        x-small>$archive
                                    </v-icon>
                                </template>
                                Open: {{item.target}}
                            </v-tooltip>
                            <v-tooltip v-else-if="item.format == 'docker'" bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon  
                                        v-on="on" class="configure" color="primary" 
                                        x-small>$question-circle
                                    </v-icon>
                                    
                                </template>
                                Docker Image
                            </v-tooltip>
                        </template>
                        <template v-slot:item.status.latest="{ item }">
                            <v-tooltip bottom>
                                <template v-slot:activator="{ on }">
                                    <v-icon x-small v-on="on"
                                        color="green "
                                        v-if="item.status.latest && item.status.version && item.status.latest == item.status.version "
                                    >
                                        $check
                                    </v-icon>
                                    <v-icon v-on="on" x-small v-else-if="item.status.latest !== item.status.version && item.status.version" color="red darken-2">
                                        $times-circle
                                    </v-icon>
                                    <v-icon v-on="on" x-small v-else color="teal darken-2">
                                        $exclamation-triangle
                                    </v-icon>
                                </template>
                                
                                <div v-if="item.type == 'docker' ">
                                    {{ ( !item.status.version ? 'Could not get version' : '' ) }}
                                    <v-divider></v-divider>
                                    Latest:  {{ item.status.latest }}
                                    <v-divider></v-divider>
                                    Current: {{item.status.version }}
                                </div>
                                <p v-else> Version not available</p>
                            </v-tooltip> 
                        </template>                        
                        <template v-slot:item.label="{ item }">
                            {{ ( item.label ? item.label : item.target   )}}
                        </template>
                        <template v-slot:item.build="{ item, index }">
                            <!-- <v-btn class="btn" x-small color="primary" 
                                style=""
                                @click="buildModuleDependency(isHovered.name, index)">Build
                            </v-btn> -->
                            <v-icon class="configure" small color="primary" 
                                style=""
                                @click="buildModuleDependency(isHovered.name, index)">$download
                            </v-icon>
                        </template>
                        <template v-slot:item.remove="{ item, index }">
                            <!-- <v-btn class="btn" x-small color="orange darken-1" 
                                style=""
                                @click="removeModuleDependency(isHovered.name, index)">Remove
                            </v-btn> -->
                            <v-icon class="configure" small color="orange darken-1" 
                                style=""
                                @click="removeModuleDependency(isHovered.name, index)">$trash-alt
                            </v-icon>
                        </template>
                        <template v-slot:item.cancel="{ item, index }">
                            <!-- <v-btn class="btn" x-small color="light" 
                                style=""
                                @click="cancelModuleDependency(isHovered.name, index)">Cancel
                            </v-btn> -->
                            <v-icon class="configure" small color="light" 
                                style="" v-if="item.status.building"
                                @click="cancelModuleDependency(isHovered.name, index)">$times-circle
                            </v-icon>
                        </template>
                    
                    </v-data-table>
                </div>
                <Docker/>
            </v-card>
        <!-- </v-collapse> -->
        </v-col>
    </v-row>
  </v-container>
</template>

<script>
    const path = require("path")
    import FileService from '@/services/File-service.js'
    import Docker from "@/components/Dashboard/System/Docker";

	export default {
		name: 'library',	 
        components: {
            Docker
        },
		data() {
			return {
                status: [],
                update: 0,
                isHovered: null,
                colorList: [
                    "rgb((139,0,139",
                    "rgb(112,128,144",
                    "rgb(139,69,19",
                   
                   
                ],
                modules_new: [],
                fields: [
                    {
                        value: 'label',
                        text: 'Name',
                        align: "center",
                        class: "table-text",
                        
                    },
                    {
                        value: 'format',
                        text: "Format",
                        sortable: false,
                        align: "center",
                        class: "table-text"
                    },
                    {
                        value: 'status.exists',
                        text: 'Exists',
                        align: "center",
                        class:"table-text"
                    },
                    {
                        value: 'build',
                        align: "center",
                        text: 'Install'
                    },
                    {
                        value: 'status.building',
                        align: "center",
                        text: 'Building'
                    },
                    
                    {
                        value: 'cancel',
                        align: "center",
                        text: 'Cancel'
                    },
                    {
                        value: 'status.latest',
                        align: "center",
                        text: 'Latest'
                    },
                    {
                        value: 'remove',
                        align: "center",
                        text: 'Remove'
                    },
                    
                ],
			}
	  	},
		props: ['modules'],
		computed: {
		
		},
		
	    mounted(){
            this.getStatus()
            setInterval(()=>{
                this.getStatus()
            },4000)    
	    },
	    watch: { 
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
            openDir(loc, format){
                if (format == 'file'){
                    this.open(path.dirname(loc))
                } else {
                    this.open(loc)
                }
            },
            getColor(key, opacity, background){
                const $this = this;
                let max = this.colorList.length -1
                let val = max % (key +1)
                if (background){
                    if (key % 2 == 0){
                        return `${ this.colorList[0] }, ${opacity})`
                    } else {
                        let color = `${ this.colorList[1] }, ${opacity})`
                        return color
                    }
                } else {
                    if (key % 2 == 0){
                        return "grey"
                    } else {
                        let color = `${ this.colorList[1] }, ${opacity})`
                        return "white"
                    }
                }
            },
            async deleteModule(name){
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
                        FileService.deleteModule({
                            module: name
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
                FileService.buildModule({
                    module: name
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
            async buildModuleDependency(name, index){
                FileService.buildModuleDependency({
                    module: name,
                    dependency:index,
                    overwrite: true
                })
               .then((response)=>{
                    this.$swal({
                        title: "Dependency install started",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    console.error(err)
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                        })
                    }) 
            },
            async removeModuleDependency(name, index){
                FileService.removeModuleDependency({
                    module: name,
                    dependency:index,
                })
               .then((response)=>{
                    this.$swal({
                        title: "Dependency removed",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    console.error(err)
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                        })
                    }) 
            },
            async cancelModuleDependency(name, index){
                FileService.cancelModuleDependency({
                    module: name,
                    dependency:index,
                })
               .then((response)=>{
                    this.$swal({
                        title: "Dependency install process cancelled",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    console.error(err)
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
                    let response = await FileService.getModules()
                    let status_obj = response.data.data
                    let reported_status_obj = {}
                    this.modules_new = []
                    this.modules_new = status_obj
                    this.update = this.update + 1
                    // status_obj.forEach((status)=>{
                    //     reported_status_obj[status.name] = {}
                    //     status.dependencies.forEach((dependency)=>{
                    //         reported_status_obj[status.name][dependency.name] = dependency
                    //     })

                    //     // // $this.$set($this.status, status.name, status)
                    //     let modules_identified = this.modules.filter((module)=>{
                    //          return module.name in reported_status_obj
                    //     })
                    //     modules_identified.forEach((module)=>{
                    //         module.dependencies.forEach((d)=>{
                    //             if (d.name in reported_status_obj[module.name]){
                    //                 d.status = reported_status_obj[module.name][d.name].status
                    //             }
                    //         })
                    //     })
                    // })
                    if (!this.isHovered){
                        this.isHovered = this.modules_new[6]
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