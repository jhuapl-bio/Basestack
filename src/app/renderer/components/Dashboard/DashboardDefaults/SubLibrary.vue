<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card dense tile id="sublibrary" >
    <v-spacer></v-spacer>
    <v-toolbar flat  class="pb-10 mb-5">
        <v-autocomplete
            v-model="selectedModule"
            :items="catalog.modules"
            icon-color="primary"
            dense outlined
            class="mr-5  pt-3 mt-3"
            style="max-width: 25%"
            item-text="version"
            label="Loaded Versions"
            :hint="`Choose Installed Module Version`"
            persistent-hint
            return-object
        >
            <template v-slot:item="{ item }" >
                <v-list-item-avatar left >
                <v-icon  :color="( item.version >= latest ? 'green' : '')" x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
                </v-list-item-avatar>
                
                <v-list-item-content    >
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
                    <strong  style="color: #2b57b9" v-if="item.version == latest">Latest</strong>
                </v-list-item-action>
            </template>
        </v-autocomplete>
        <v-tooltip bottom  v-if="!selectedModule.local">
            <template v-slot:activator="{ on }">
                <v-btn small icon class="mr-3">
                    <v-icon
                        color="indigo" 
                        
                        @click="removeCatalog"
                    >$trash-alt
                    </v-icon>
                </v-btn>
            </template>
            Unload or Remove the Module (Custom or Remote)
        </v-tooltip>
        <v-badge   class="mt-5" v-if="selectedProcedure.status" overlap x-small :color="(selectedProcedure.status  && selectedProcedure.status.fully_installed ? 'green' : 'orange darken-2')">
            <template v-slot:badge>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon 
                            x-small   v-on="on">
                            {{ ( selectedProcedure.status && selectedProcedure.status.fully_installed ? '$check' : '$exclamation' ) }}
                        </v-icon>
                    </template>
                    {{ selectedProcedure.status.fully_installed  ? 'Fully Installed ' : 'Procedure not fully installed'  }}
                </v-tooltip>
            </template>
            
            <v-autocomplete
                v-model="selectedProcedure"
                :items="procedures"
                icon-color="primary"
                item-text="title"
                class="mx-auto pr-2"
                style="max-width: 105%"
                :hint="`Choose procedure dependencies to install`"
                label="Procedure"
                persistent-hint outlined dense
                return-object
                >
                <template v-slot:item="{ item }" >
                    <v-list-item-avatar left>
                    <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
                    </v-list-item-avatar>
                    
                    <v-list-item-content outlined>
                    <v-list-item-title >{{ item.title ? item.title : item.name }}</v-list-item-title>
                    <v-list-item-subtitle>
                        <v-chip
                        x-small
                        v-for="(tag, tagKey) in item.tags" :key="tagKey" class="mr-1"
                        >
                        {{tag}}
                        </v-chip>
                    </v-list-item-subtitle>
                    
                    </v-list-item-content>
                </template>
            </v-autocomplete>
            
        </v-badge>
        
        <v-spacer>
        </v-spacer>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-icon medium color="primary" v-on="on" class="configure mr-3 ml-3 " @click="buildModule(catalog.name)">$download</v-icon>
            </template>
            Build Entire Module
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-icon v-on="on" medium color="indigo "  v-on:click="fetchRemoteCatalog(catalog.name)" style="text-align:right" class="configure ml-2 mr-3">$external-link-alt</v-icon>
            </template>
            Fetch Versions for Module
        </v-tooltip>
        <v-tooltip bottom v-if="catalog.status.building">
            <template v-slot:activator="{ on }">    
                <v-icon v-on="on" medium color="light " v-on:click="cancelModule(catalog.name)"   style="text-align:right" class="configure ml-2 mr-3">$times-circle</v-icon>
            </template>
            Cancel Module Build
        </v-tooltip>
        <v-tooltip bottom >
            <template v-slot:activator="{ on }">
                <v-icon v-on="on"  color="orange darken-2"    medium v-on:click="deleteModule(selectedModule.name)" style="" class="configure ml-4 mr-3">$trash-alt</v-icon>
            </template>
            Delete Entire Module and its dependencies 
        </v-tooltip>
        <v-spacer>
        </v-spacer>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon-and-text small color="primary" @click="pruneImages()" v-on="on">
                    <v-icon medium  class=" mr-3 ml-3 " >$recycle</v-icon>Prune Images
                </v-btn>
            </template>
            Removes unused Docker images, frees up space
        </v-tooltip>
    </v-toolbar>
    <div style="text-align:center; "
        target="dind"
        >
        <v-data-table
            style="max-width: 100%"
            :items="dependencies"
            :headers="fields"
            :items-per-page="5"
            centered
            class="elevation-1 "			
            small dense
            v-if="dependencies && dependencies.length > 0"
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
            <template v-slot:item.overwrite="{ item,index }">
                
                    <v-checkbox
                        v-model="overwrites[index]"
                        on-icon="$check-square"
                        class="align-center justify-center text-xs-center" 
                        off-icon="$square"
                        color="primary"
                    >
                    
                    </v-checkbox> 
            </template>
            <template v-slot:item.build="{ item, index }">
                <!-- <v-btn class="btn" x-small color="primary" 
                    style=""
                    @click="buildModuleDependency(module.name, index)">Build
                </v-btn> -->
                <v-icon  class="configure" small color="primary" 
                    style="" v-if="item.status.dependComplete"
                    @click="buildModuleDependency(catalog.name, index)">$download
                </v-icon>
                <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                    <v-icon v-on="on" class="" small color="warning" 
                        style="" 
                        >$slash
                    </v-icon>
                    </template>
                    Depends on another dependency to install: {{ dependencies.filter((d,i)=>{
                        return item.depends.indexOf(i) > -1
                    }).map((f)=>{
                        return f.label
                    }).join(", ") }}
                </v-tooltip>
              
            </template>
            <template v-slot:item.remove="{ item, index }">
                <!-- <v-btn class="btn" x-small color="orange darken-1" 
                    style=""
                    @click="removeModuleDependency(module.name, index)">Remove
                </v-btn> -->
                <v-icon class="configure" small color="orange darken-1" 
                    style=""
                    @click="removeModuleDependency(catalog.name, index)">$trash-alt
                </v-icon>
            </template>
            <template v-slot:item.cancel="{ item, index }">
                <!-- <v-btn class="btn" x-small color="light" 
                    style=""
                    @click="cancelModuleDependency(module.name, index)">Cancel
                </v-btn> -->
                <v-icon class="configure" small color="light" 
                    style="" v-if="item.status.building"
                    @click="cancelModuleDependency(catalog.name, index)">$times-circle
                </v-icon>
            </template>
        
        </v-data-table>
    </div>
    <LogWindow   :info="procedureLogs" :key="'logwindowModules'"></LogWindow> 
  </v-card> 
</template>

<script>
import FileService from '@/services/File-service.js'
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';

const path = require("path")
export default {
	name: 'sublibrary',
    components: {
        LogWindow
        
    },
	computed: {
        procedureIdx (){
            if (this.selectedProcedure && this.selectedProcedure.name){
                return   ( this.selectedProcedure.idx && this.selectedProcedure.idx >= 0 ? this.selectedProcedure.idx : 0 )
            }
            else {
                return 0
            }
        },
        moduleIdx(){
            if (this.selectedModule && this.selectedModule.idx >= 0 ){
                return this.selectedModule.idx
            } else {
                return 0
            }
        },
        
        dependencies(){
            return this.selectedProcedure.dependencies
        }
        
	},
	data(){
		return {
            selectedProcedure: {},
            procedures: [],
            selectedModule: {},
            defaultProcedure:0,
            procedureLogs: [],
            procedures: [],
            status: null,
            overwrites: [],
            stored: {},
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
                    value: 'overwrite',
                    align: "center",
                    text: 'Overwrite'
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
    props: [ 'catalog', 'module' , 'latest'],
    watch: {
       
        selectedModule(newValue){
            this.selectedProcedure = {}
            this.procedures = []
            this.getStatus()
            // this.stored[this.catalog.name].selected = newValue
            
            
        },
        selectedProcedure(newValue){
            if (newValue.dependencies){
                this.overwrites = newValue.dependencies.map((f,i)=>{
                    return f.overwrite
                })
            }
          
        },
        catalog(newValue){
            if (  this.stored[newValue.name] ){
                this.selectedModule = this.stored[newValue.name].module
                this.selectedProcedure = this.stored[newValue.name].selected
                this.procedures =   this.stored[newValue.name].procedures
            } else {
                this.getStatus()
            }
        }
    },
	methods:{
        async error_alert(err, title){
            let text;
            text = err
            console.log("error", err, title)
            this.$swal.fire({
                position: 'center',
                icon: 'error',
                showConfirmButton:true,
                title:  title,
                text:  text
            })
        },
        async pruneImages(){
            const $this = this
            this.$swal.fire({
                title: "Are you sure?",
                text: "You will remove any and ALL dangling images. This is useful for removing unfinished or unneeded images no longer used by your system",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes, I am sure!',
                cancelButtonText: "No!"
            })
            .then(function(isConfirm) {
                if (isConfirm.dismiss != 'cancel') {
                FileService.pruneImages().then((message, error)=>{
                    if (error){
                        $this.error_alert(error.response.data.message, "Error in pruning dockers")
                    } else{
                        function bytesToSize(bytes) {
                            var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
                            if (bytes == 0) return '0 Byte';
                            var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
                            return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
                        }
                        $this.$swal.fire({
                            position: 'center',
                            icon: 'success',
                            showConfirmButton:true,
                            title:  "Pruned Dangling Docker Images",
                            html: `Space Reclaimed: ${bytesToSize(message.data.data.SpaceReclaimed)}`
                        })
                    }
                }).catch((err)=>{
                    $this.error_alert(err.response.data.message, "Failed to prune docker images")
                })
                $this.$swal.fire({
                    position: 'center',
                    icon: 'info',
                    showConfirmButton:true,
                    title:  "Pruning images, this may take a moment.... This process will operate in the background*"
                }) 
                } else {
                return false
                }
            })
        },
        async removeCatalog(){
            FileService.removeCatalog({
                catalog: this.selectedModule.name,
                module: this.selectedModule.idx,
            }).then((response)=>{
                console.log(response,"done")
                this.selectedModule = {}
                this.selectedProcedure = {}

            }).catch((err)=>{
                console.error(err)
            })
        },
        async deleteModule(name, index){
            const $this  = this;
            let procedureIdx  = this.selectedProcedure.idx
            
            this.$swal({
                title: 'Are you sure you want to remove this procedure?',
                text: "You won't be able to revert this! All dependencies will be removed even if shared across other modules",
                type: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#2b57b9',
                cancelButtonColor: '#a60139',
                confirmButtonText: 'Yes, remove it!'
            }).then((res) => {
                if (res.value) {
                    this.$swal({
                        title: "Procedure Deletion Initiated",
                        text: "Please wait.. this may take some time", 
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                    // let variantIdx  = this.selectedModule.idx
                    // let procedureIdx  = this.selectedModule.procedures.findIndex(data => data === this.selectedProcedure)
                    FileService.removeProcedureDependency({
                        module: $this.moduleIdx,
                        catalog: $this.catalog.name,
                        procedure: procedureIdx,
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
            let procedureIdx  = this.selectedProcedure.idx
            const $this = this
            FileService.cancelBuild({
                module: $this.moduleIdx,
                catalog: $this.catalog.name,
                procedure: procedureIdx
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
        async buildModule(){
            const $this = this
            let procedureIdx  = this.selectedProcedure.idx
            FileService.buildProcedure({
                module: $this.moduleIdx,
                catalog: $this.catalog.name,
                procedure: procedureIdx,
                overwrite: this.overwrites
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
        async fetchRemoteCatalog(name){
           
            const $this = this
            FileService.fetchRemoteCatalog('modules', name)
            .then((response)=>{
               
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
        
        openDir(link,format){
            try{       
                if(format == 'file'){
                    this.$electron.shell.openPath(path.dirname(link))
                } else{
                    this.$electron.shell.openPath(path.dirname(link))
                }
          } catch(err){
            this.$swal.fire({ 
              position: 'center',
              icon: 'error',
              showConfirmButton:true,
                      title:  "Could not open the path: "+link
            })
          }
        },
        async getStatus(){
            const $this = this
            try{

                let response = await FileService.getProcedures({
                    module: this.moduleIdx,
                    catalog: this.catalog.name,
                    token: this.$store.token
                })
                let status_obj = response.data.data
                this.procedures = response.data.data
                this.procedures.map((d,i)=>{
                    d.idx = i
                })
                
                if (!this.selectedModule.name || this.selectedModule.name !== this.catalog.name){
                    this.selectedModule = this.catalog.modules[0]
                    this.selectedProcedure = {}
                }
                if (!this.selectedProcedure.name){
                    this.selectedProcedure = this.procedures[this.defaultProcedure]
                    
                }
                this.stored[this.catalog.name] = {
                    module: this.selectedModule,
                    selected: this.selectedProcedure,
                    procedures: this.procedures
                }
                this.$set(this.selectedProcedure , 'dependencies', this.procedures[this.selectedProcedure.idx].dependencies)
                this.$set(this.selectedProcedure , 'status', this.procedures[this.selectedProcedure.idx].status)

                if (this.selectedProcedure.status && this.selectedProcedure.status.buildStream){
                    // logs = this.selectedProcedure.buildStream
                    this.selectedProcedure.status.buildStream.forEach((entry, i)=>{
                        this.procedureLogs.push(entry)
                    })

                }
                this.procedureLogs = []
                try{
                    this.procedureLogs = this.procedures[this.selectedProcedure.idx].status.buildStream
                } catch(err){
                    console.log(err)
                }
                if (!this.procedures){
                    clearInterval(this.interval)
                }
                
            } catch(err){
                this.initial=false
                this.selectedModule.idx=0
                console.error(`${err} error in getting status`)
            } finally {
                this.intervalChecking = false
            }
        },
        async buildModuleDependency(name, index){
            let procedureIdx  = this.selectedProcedure.idx
            const $this = this
            let overwrite = this.overwrites[index]
            FileService.buildProcedureDependency({
                module: $this.moduleIdx,
                catalog: $this.catalog.name,
                procedure: procedureIdx,
                overwrite: [  overwrite ],
                dependency: index 
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
            let procedureIdx  = this.selectedProcedure.idx
            FileService.removeProcedureDependency({
                module: this.moduleIdx,
                catalog: this.catalog.name,
                procedure:procedureIdx,
                dependency: index
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
            FileService.cancelProcedureDependency({
                module: this.moduleIdx,
                catalog: this.catalog.name,
                procedure: this.selectedProcedure.idx,
                dependency: index
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
	},
	
	mounted() {
        this.getStatus()
        const $this  = this
        this.interval = setInterval(()=>{
            $this.getStatus()
        }, 3000)
    },
	beforeDestroy: function() {
        clearInterval(this.interval)
    }
};
</script>

<style>
#logs{
}
.v-input__slot {
  align-items: center;
  justify-content: center;
}



</style>

