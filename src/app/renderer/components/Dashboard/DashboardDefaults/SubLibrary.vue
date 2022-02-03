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
    <v-badge  v-if="selectedProcedure.status" overlap x-small :color="(selectedProcedure.status  && selectedProcedure.status.fully_installed ? 'green' : 'orange darken-2')">
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
            item-value="name"
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
    
    <div style="text-align:center; "
        target="dind"
        >
        <v-data-table
            style="max-width: 100%"
            :items="selectedProcedure.dependencies"
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
                {{item.status.building}}
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
                    @click="buildModuleDependency(catalog.name, index)">$download
                </v-icon>
            </template>
            <template v-slot:item.remove="{ item, index }">
                <!-- <v-btn class="btn" x-small color="orange darken-1" 
                    style=""
                    @click="removeModuleDependency(isHovered.name, index)">Remove
                </v-btn> -->
                <v-icon class="configure" small color="orange darken-1" 
                    style=""
                    @click="removeModuleDependency(catalog.name, index)">$trash-alt
                </v-icon>
            </template>
            <template v-slot:item.cancel="{ item, index }">
                <!-- <v-btn class="btn" x-small color="light" 
                    style=""
                    @click="cancelModuleDependency(isHovered.name, index)">Cancel
                </v-btn> -->
                <v-icon class="configure" small color="light" 
                    style="" v-if="item.status.building"
                    @click="cancelModuleDependency(catalog.name, index)">$times-circle
                </v-icon>
            </template>
        
        </v-data-table>
    </div>
  </v-card> 
</template>

<script>
import FileService from '@/services/File-service.js'

export default {
	name: 'sublibrary',
    components: {
        
    },
	computed: {
        procedureIdx (){
            if (this.selectedProcedure && this.selectedProcedure.name){
                return   ( this.selectedProcedure.idx && this.selectedProcedure.idx >= 0 ? this.selectedProcedure.idx : 0 )
            }
            else {
                return 0
            }
        }
	},
	data(){
		return {
            selectedProcedure: {},
            procedures: [],
            defaultProcedure:0,
            procedures: [],
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
    props: ['moduleIdx', 'catalog', 'module'],
    watch: {
        moduleIdx(newValue){
            if ( this.stored[this.module.name] && this.stored[this.module.name][newValue]){
                this.selectedProcedure = this.stored[this.module.name][newValue].selected
                this.procedures  = this.stored[this.module.name][newValue].procedures
            } else {
                this.selectedProcedure = {}
            }
        },
        module(newValue){
            console.log("module changed")
            if (  this.stored[newValue.name] && this.stored[newValue.name][this.moduleIdx]  ){
                this.selectedProcedure = this.stored[newValue.name][this.moduleIdx].selected
                this.procedures =   this.stored[newValue.name][this.moduleIdx].procedures
            } else {
                this.selectedProcedure = {}
                this.getStatus()
            }
        }
    },
	methods:{
        async getStatus(){
            const $this = this
            try{
                let response = await FileService.getProcedures({
                    module: this.moduleIdx,
                    catalog: this.catalog.name
                })
                let status_obj = response.data.data
                this.procedures = response.data.data
                this.procedures.map((d,i)=>{
                    d.idx = i
                })

                
                if (!this.stored[this.module.name]){
                    this.stored[this.module.name] = []
                }
                if (!this.selectedProcedure.name){
                    this.selectedProcedure = this.procedures[this.defaultProcedure]
                    this.stored[this.module.name][this.moduleIdx] = {
                        selected: this.selectedProcedure,
                        procedures: this.procedures
                    }
                }
                
                // this.update = this.update + 1
                // if (!this.isHovered){
                //     this.isHovered = this.modules_new[6]
                // }
                
            } catch(err){
                this.initial=false
                console.error(`${err} error in getting status`)
            } finally {
                this.intervalChecking = false
            }
        },
        async buildModuleDependency(name, index){
            let procedureIdx  = this.selectedProcedure.idx
            const $this = this
            console.log(this.procedures, this.selectedProcedure)
            FileService.buildProcedureDependency({
                module: $this.moduleIdx,
                catalog: $this.catalog.name,
                procedure: procedureIdx,
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
            FileService.cancelModuleDependency({
                module: this.moduleIdx,
                catalog: this.catalog.name,
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
	},
	
	mounted() {
        this.getStatus()
        const $this  = this
        setInterval(()=>{
            $this.getStatus()
        }, 3000)
    },
	beforeDestroy: function() {
        
    }
};
</script>

<style>
#logs{
}




</style>

