<template>
  <div>
    <v-row id="library"  style="" >
        <v-col   sm="4" @click="isHovered = module" v-for="module in modules_new" :key="module.name " style="cursor:pointer; outline: none" >
            <div class="libraryModule" :id="module.name"    >
                <v-divider></v-divider>
                {{ module ? module.title : module }}
                <v-icon  x-small  v-if="module.status && module.status.fully_installed" color="green" >$check</v-icon>
                <!-- <div v-tooltip="{
                        content: module.tooltip,
                        placement: 'top',
                        classes: ['info'],
                        trigger: 'hover',
                        targetClasses: ['it-has-a-tooltip'],
                    }" :class="[ 'tabSideItem',  ]" style="text-align:center; float: right" v-if="module.status && module.status.fully_installed"
                >
                    <span class="tabIcon"
                        
                    >
                        <font-awesome-icon class="configure success-icon" icon="check"/>
                    </span>
                </div> -->
                
                <v-icon color="orange darken-2" x-small style="text-align:center; float: right" v-else >$exclamation</v-icon>   
                <!-- <div class="tabSideItem" style="text-align:center; float: right" v-else v-tooltip="{
                    content: 'Not installed or metadata not retrievable',
                    placement: 'top',
                    classes: ['info'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                >
                    <span style=""
                    
                    >
                        <font-awesome-icon class="configure warn-icon" icon="exclamation"/>
                    </span>
                </div> -->
                
            </div>
        </v-col>
        <v-col sm="12">
        <!-- <v-collapse :visible="true" style="width: 100%; margin:auto" :id="'collapse'"> -->
            <v-card>
                <v-icon class="configure" @click="buildModule(isHovered.name)">$download</v-icon>
                <v-icon v-on:click="deleteModule(isHovered.name)" style="text-align:right" class="configure">$trash-alt</v-icon>
                <!-- <div :style="{ 'justify-content': 'center' }" v-if="isHovered">
                    <span>
                        <span 
                            style="margin:auto; text-align:center" v-if="isHovered"
                            v-tooltip="{
                            content: 'Build Module',
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                            }" v-on:click="buildModule(isHovered.name)" >
                            <font-awesome-icon :icon="'download'" class="configure " size="sm" />
                        </span> 
                        <span  class="center-align-icon" style="float:right" 
                            v-tooltip="{
                            content: 'Delete Module in entirety ' ,
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                            }" 
                            v-on:click="deleteModule(isHovered.name)" 
                            >
                            <font-awesome-icon class="configure" icon="trash-alt" size="sm" />
                        </span>
                    </span> -->
                    
                    <!-- <div class="tabSideItem" style="text-align:center; float: right" 
                        v-if="status[isHovered.name] && status[isHovered.name].status.fully_installed && status[isHovered.name].status.version !== status[isHovered.name].status.latest"
                    >                
                        <span class="center-align-icon warn-icon" style="float:right" 
                            v-tooltip="{
                                content: 'This isHovered is not up to date',
                                placement: 'top',
                                classes: ['info'],
                                trigger: 'hover',
                                targetClasses: ['it-has-a-tooltip'],
                            }">
                            <span ><font-awesome-icon icon="exclamation" size="sm"/></span>
                        </span>
                    </div> -->
                <!-- </div> -->
                <v-col sm="12" class="tabSideItem">
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
                            small
                            responsive
                        >
                            <template v-slot:item.status.exists="{ item }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                    <v-icon v-on="on" :color="(item.status.exists ? 'green ' : 'orange darken-1')" 
                                        x-small> {{ (item.status.exists  ? '$check' : '$times-circle'  )}}
                                    </v-icon>
                                    </template>
                                    Running Status 
                                </v-tooltip>
                            </template>
                            <template v-slot:item.status.building="{ item }">
                                <v-tooltip bottom>
                                   <template v-slot:activator="{ on }">
                                   <v-progress-circular x-small
                                        indeterminate v-if="item.status.building"
                                        v-on="on"
                                        :size="20"
                                        color="blue-grey"
                                    ></v-progress-circular>
                                    
                                    </template>
                                    Build Progress
                                </v-tooltip>
                            </template>
                            <template v-slot:item.status.downloading="{ item }">
                                <v-tooltip bottom>
                                    <template v-slot:activator="{ on }">
                                        <v-progress-circular v-on="on" x-small 
                                            v-if="item.status.downloading"
                                            color="blue-grey"
                                            :size="10"
                                            indeterminate
                                        ></v-progress-circular>
                                    </template>
                                    Download Progress {{item.status.progress}} %
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
                            
                            <template v-slot:item.status.error="{ item }">
                                <v-tooltip bottom>
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
                            <template v-slot:item.label="{ item }">
                                <p>{{ ( item.label ? item.label : item.target   )}}</p>
                            </template>
                            <template v-slot:item.build="{ item }">
                                <v-btn class="btn"  color="teal darken-1" 
                                    style=""
                                    @click="buildModuleDependency(isHovered.name, item.index)">Build
                                </v-btn>
                            </template>
                        </v-data-table>
                    </div>
                </v-col>
            </v-card>
        <!-- </v-collapse> -->
        </v-col>
    </v-row>
  </div>
</template>

<script>
    import FileService from '@/services/File-service.js'
	export default {
		name: 'library',	    
		data() {
			return {
                status: [],
                update: 0,
                isHovered: null,
                modules_new: [],
                fields: [
                    {
                        value: 'label',
                        text: 'Name',
                        class: "table-text"
                    },
                    {
                        value: 'type',
                        text: "Type",
                        sortable: false,
                        class: "table-text"
                    },
                    {
                        value: 'status.downloading',
                        text: 'Downloading'
                    },
                    {
                        value: 'status.exists',
                        text: 'Exists',
                        class:"table-text"
                    },
                    {
                        value: 'build',
                        text: 'Install'
                    },
                    {
                        value: 'status.latest',
                        text: 'Latest'
                    },
                    {
                        value: 'status.building',
                        text: 'Building'
                    },
                    {
                        value: 'status.error',
                        text: 'Errors'
                    }
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
                        this.isHovered = this.modules_new[0]
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