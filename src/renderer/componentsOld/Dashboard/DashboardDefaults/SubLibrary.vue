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
       
        <v-badge   class="mt-5" v-if="selectedProcedure.status" overlap large :color="(selectedProcedure.status  && selectedProcedure.status.fully_installed ? 'green' : 'orange darken-2')">
            <template v-slot:badge>
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon 
                            large  v-on="on">
                            {{ ( selectedProcedure.status && selectedProcedure.status.fully_installed ? '$check' : '$exclamation' ) }}
                        </v-icon>
                    </template>
                    {{ selectedProcedure.status.fully_installed  ? 'Fully Installed ' : 'Procedure not fully installed'  }}
                </v-tooltip>
            </template>
        </v-badge>        
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn medium v-on="on" fab  @click="buildModule(version.name)">
                    <v-icon large color="primary" class="configure  ">$download</v-icon>
                </v-btn>
            </template>
            
            Build Entire Module
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn class="mx-2"  medium v-on="on" fab  @click="buildModule(true)">
                    <v-icon large color="secondary"  class="configure  ">$download</v-icon>                
                </v-btn>
            </template>
            
            Build Required
        </v-tooltip>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn class="mx-2"  medium v-on="on" fab v-on:click="fetchRemoteCatalog(version.name)" >
                    <v-icon  large color="indigo "  style="text-align:right" class="configure">$external-link-alt</v-icon>                
                </v-btn>
            </template>
            Fetch Versions for Module
        </v-tooltip>
        <v-tooltip bottom v-if="selected.status && selected.status.building">
            <template v-slot:activator="{ on }">    
                <v-btn class="mx-2" medium v-on="on" v-on:click="cancelModule(version.name)" fab>
                    <v-icon  large color="light "    style="text-align:right" class="configure">$times-circle</v-icon>
                </v-btn>
            </template>
            Cancel Module Build
        </v-tooltip>
        <v-tooltip bottom >
            <template v-slot:activator="{ on }">
                <v-btn class="mx-2" medium v-on="on" v-on:click="deleteModule(version)"  fab>
                    <v-icon  color="orange darken-2"    large style="" class="configure">$trash-alt</v-icon>
                </v-btn>
            </template>
            Delete Entire Module and its dependencies 
        </v-tooltip>
        <v-spacer>
        </v-spacer>
        <v-tooltip bottom>
            <template v-slot:activator="{ on }">
                <v-btn icon-and-text large color="primary" @click="pruneImages()" v-on="on">
                    <v-icon large  class=" mr-2 ml-1 " >$recycle</v-icon>Prune Images
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
            :items-per-page="itemsPerPage"
            centered
            :page="page"
            class="elevation-1 "			
            large dense
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
            <template v-slot:[`item.exists`]="{ item }">
                <v-badge :dot="!item.status.progress" :content="( item.status.progress ? `${item.status.progress}%` : null)" v-if="item.status.building "  large color="info" >
                    <v-progress-circular large bottom
                        indeterminate  
                        :size="25"
                        color="blue-grey"
                    ></v-progress-circular>                                
                </v-badge>
                <v-tooltip bottom v-else-if="item.status.error">
                    <template v-slot:activator="{ on }">
                        <v-icon large v-on="on"
                            color="green "
                            v-if="!item.status.error"
                        >
                        </v-icon>
                        <v-icon v-on="on" large v-else color="red darken-2">
                            $times-circle
                        </v-icon>
                    </template>
                    {{ ( item.status.error ? item.status.error : 'No Errors' ) }}
                </v-tooltip> 
                <div v-else-if="item.status.exists && item.size_estimate && item.status.size != item.size_estimate">
                    <v-icon class=""  :color="(item.size_estimate != item.status.size || !item.status.exists ? 'orange lighten-1' : 'green ')" 
                        large>{{ (item.size_estimate == item.status.size ? '$check' : '$times-circle') }}
                    </v-icon> 
                    Incomplete Download / Estimated: {{ item.size_estimate }}
                </div>
                <v-tooltip v-else bottom>
                    <template v-slot:activator="{ on }">
                    
                        <v-icon class=""   v-on="on" :color="(item.status.exists ? 'green ' : 'red darken-1')" 
                            large> {{ (item.status.exists  ? '$check' : '$times-circle'  )}}
                        </v-icon>
                        </template>
                    
                    Existence Status (Downloaded + Installed)
                </v-tooltip>
            </template>
            <template v-slot:[`item.optional`]="{ item }">
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                    <v-icon class=""  v-on="on" :color="(!item.optional ? 'green' : 'orange lighten-1')" 
                    large> {{ (!item.optional  ? '$check' : ''  )}}
                    </v-icon>
                    </template>
                    
                    This is {{!item.optional ? "not" : ""}} optional
                </v-tooltip>
            </template>
            <template v-slot:[`item.format`]="{ item }">
                <v-tooltip v-if="item.format == 'file' || item.format == 'dir'" bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon  
                            v-on="on" class="configure" color="primary" @click="openDir(item.target, item.format)"
                            large>$archive
                        </v-icon>
                    </template>
                    Open: {{item.target}}
                </v-tooltip>
                <v-tooltip v-else-if="item.format == 'docker'" bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon  
                            v-on="on" class="configure" color="primary" 
                            large>$question-circle
                        </v-icon>
                        
                    </template>
                    Docker Image
                </v-tooltip>
            </template>
            <template v-slot:[`item.status.latest`]="{ item }">
                
                <v-tooltip bottom>
                    <template v-slot:activator="{ on }">
                        <v-icon large v-on="on"
                            color="green "
                            v-if="item.status.latest && item.status.version && item.status.latest == item.status.version "
                        >
                            $check
                        </v-icon>
                        <v-icon v-on="on" large v-else-if="item.status.latest !== item.status.version && item.status.version" color="orange lighten-2">
                            $times-circle
                        </v-icon>
                        <v-icon v-on="on" large v-else color="teal darken-2">
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
            <template v-slot:[`item.label`]="{ item }">
                <div :class="[ $vuetify.breakpoint.lgOnly?'text-left':'text-right', 'text-subtitle-1']">
                    {{ ( item.label ? item.label : item.target   )}}
                </div>
            </template>
            <template v-slot:[`item.tags`]="{ item }">
                <v-dialog v-if="item.type == 'docker' && item.tags && item.tags.length > 0"
                    transition="dialog-bottom-transition"
                    max-width="600"
                    >
                    <template v-slot:activator="{ on,attrs  }">                    
                        <v-icon class="mr-3 configure" v-on="on" v-bind="attrs" large  color="primary lighten-2" >
                            $cog 
                        </v-icon>
                    </template>
                    <template v-slot:default="dialog">
                        <v-card>
                        <v-toolbar
                            color="light"
                            dark
                        >All Tags available for {{item.target}}
                        
                        </v-toolbar>
                        <v-card-text>
                            <v-list dense>
                                <v-list-item
                                    v-for="(item, i) in item.tags"
                                    :key="i"
                                >
                                    {{item}}
                                </v-list-item>
                            </v-list>
                        </v-card-text>
                        <v-card-actions class="justify-end">
                            <v-btn
                            text
                            @click="dialog.value = false"
                            >Close</v-btn>
                        </v-card-actions>
                        </v-card>
                    </template>
                </v-dialog>
               
                
                    
            </template>
            <template v-slot:[`item.skip`]="{ index, page }">
                
                    <v-checkbox
                        v-model="skips[(page - 1) *itemsPerPage+index]"
                        on-icon="$check-square"
                        class="align-center justify-center text-xs-center" 
                        off-icon="$square"
                        color="primary"
                    >
                    
                    </v-checkbox> 
            </template>
            <template v-slot:[`item.build`]="{ item, index }">
                <v-icon  class="configure" large color="primary" 
                    style="" v-if="item.status.dependComplete"
                    @click="buildModuleDependency(version.name, (page-1) * itemsPerPage+index )">$download
                </v-icon>
                
                <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                    <v-icon v-on="on" class="" large color="warning" 
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
            <template v-slot:[`item.remove`]="{  index }">
                <v-icon class="configure" large color="orange darken-1" 
                    style="" 
                    @click="removeModuleDependency(version.name,   (page - 1) *itemsPerPage  + index)">$trash-alt
                </v-icon>
            </template>
            <template v-slot:[`item.size`]="{ item }">
                {{item.status.size}}
            </template>
            <template v-slot:[`item.cancel`]="{ item, index}">
                <v-icon class="configure" large color="light" 
                    style="" v-if="item.status.building"
                    @click="cancelModuleDependency(version.name,   (page - 1) * itemsPerPage + index)">$times-circle
                </v-icon>
            </template>
        
        </v-data-table>
    </div>
    <LogWindow v-if="procedureLogs"  :info="procedureLogs.slice().reverse()" :key="'logwindowModules'"></LogWindow> 
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
        procedureLogs(){
            let logs = []
            try{
                logs = this.status.buildStream
            } catch(err){
                console.log(err)
            }
            return logs
        },
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
        
        
        
	},
	data(){
		return {
            selectedProcedure: {},
            custom_images: {},
            procedures: [],
            selectedModule: {},
            defaultProcedure:0,
            selected: {},
            itemsPerPage: 8,
            page: 1,
            skips: [],
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
                    value: 'optional',
                    text: "Required",
                    sortable: false,
                    align: "center",
                    class: "table-text"
                },
                {
                    value: 'exists',
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
                    value: 'skip',
                    align: "center",
                    text: 'Skip'
                },
                {
                    value: 'size',
                    align: "center",
                    text: 'Size'
                },
                
                {
                    value: 'cancel',
                    align: "center",
                    text: 'Cancel'
                },
                // {
                //     value: 'status.latest',
                //     align: "center",
                //     text: 'Latest'
                // },
                // {
                //     value: 'tags',
                //     align: "center",
                //     text: 'Versions'
                // },
                {
                    value: 'remove',
                    align: "center",
                    text: 'Remove'
                },
                
            ],
			
		}
	},
    props: [ 'version', 'procedure', 'dependencies', 'status' ],
    watch: {
      
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
        async removeCatalog(idx){
            FileService.removeModule({
                catalog: this.version.name,
                index: idx
            }).then((response)=>{
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
                    FileService.removeProcedureDependency({
                        module: $this.moduleIdx,
                        catalog: $this.version.name,
                        procedure: procedure,
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
            let procedureIdx  = this.procedure
            const $this = this
            FileService.cancelBuild({
                module: $this.moduleIdx,
                catalog: $this.version.name,
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
        async buildModule(requiredOnly){
            const $this = this
            let indic = []
            let names = []
            let procedureIdx  = this.procedure
            if (requiredOnly){
                this.dependencies.map((f,i)=>{
                    if(!f.optional){
                        indic.push(i)
                        names.push(f.label ? f.label : f.target)
                    }
                })
                names = names.join(", ")
            }
            this.$swal({
                title: `${$this.version.name}`,
                text: `Module Build Dependency Starting for ${names}`,
                icon: 'info',
                showConfirmButton: true,
                allowOutsideClick: true
            });
            FileService.buildProcedure({
                module: $this.moduleIdx,
                catalog: $this.version.name,
                procedure: procedureIdx,
                dependency: indic,
                skip: this.skips
            })
            .then((response)=>{
                this.$swal({
                    title: `${$this.version.name}`,
                    text: `Module Build  started for ${names}`,
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
                    title: `${$this.version.name}-${names}`,
                    text: err.response.data.message
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
       
        async buildModuleDependency(name, index){
            let procedureIdx  = this.procedure
            const $this = this
            console.log(index)
            let label = this.dependencies[index].label   ?   this.dependencies[index].label  : this.dependencies[index].target      
            let skip = this.skips[index]
            FileService.buildProcedureDependency({
                catalog: $this.version.name,
                procedure: procedureIdx,
                skip: [  skip ],
                dependency: index 
            })
            .then((response)=>{
                this.$swal({
                    title: `${$this.version.name}`,
                    text: `Build started for dependency: ${label}`,
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
                    title: err.response.data.message,
                    text: `${$this.version.name}, ${label}`,
                    })
                }) 
            this.$swal({
              title: `${this.version.name}: ${name}`,
              text: "Module Build Initiated. Please wait.. this may take some time",
              icon: 'info',
              showConfirmButton: true,
              allowOutsideClick: true
            });   
        },

        async removeModuleDependency(name, index){
            let procedureIdx  = this.procedure
            let depname = this.dependencies[index].label ?  this.dependencies[index].label : this.dependencies[index].target
            FileService.removeProcedureDependency({
                catalog: this.version.name,
                procedure: procedureIdx,
                dependency: index
            })
            .then((response)=>{
                this.$swal({
                    title: `${name}`,
                    text: `Completely removed ${depname}`,
                    icon: 'success',
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
                    title: `${name}`,
                    text: err.response.data.message
                })
            }) 

            this.$swal({
                title: `${name}`,
                text: `Please wait.. this may take some time to remove ${depname}`,
                icon: 'info',
                showConfirmButton: true,
                allowOutsideClick: true
            });
        },
        async cancelModuleDependency(name, index){
            let depname = this.dependencies[index].label ?  this.dependencies[index].label : this.dependencies[index].target
            this.$swal({
                title: `${name}`,
                text: `Canceling Build: ${depname}. Please wait.. this may take some time`,
                icon: 'info',
                showConfirmButton: true,
                allowOutsideClick: true
            });
            FileService.cancelProcedureDependency({
                catalog: this.version.name,
                procedure: this.procedure,
                dependency: index
            })
            .then((response)=>{
                this.$swal({
                    title: "Dependency install process cancelled",
                    text: "Depency Install Process Cancelled",
                    icon: 'success',
                    showConfirmButton: true,
                    allowOutsideClick: true
                });
                console.log(response)
            })
            .catch((err)=>{
                console.error(err)
                this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                    title: `${name}`,
                    text: err.response.data.message
                })
            }) 
        },
	},
	
	mounted() {
        
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

