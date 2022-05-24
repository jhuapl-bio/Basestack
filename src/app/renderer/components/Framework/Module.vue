<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  
  <v-row>
    <v-col sm="12" >
    <v-toolbar   cyan width="100%" class=" elevation-12 "> 
      <v-toolbar-title>{{title}}</v-toolbar-title>
      <v-divider vertical inset class="ml-4 mr-8"></v-divider>
      <v-btn
        color="indigo lighten-1"
        dark 
        class="text-caption "
        @click.stop="customDrawer = !customDrawer"
      >
        <v-icon class="mr-3" small  >
            $cog 
        </v-icon>
        Customize
      </v-btn>
      
      
      
      <v-autocomplete 
        v-model="selectedVersion"
        :items="libraryVersions" 
        @change="updateStagedVersion($event)"
        item-text="version"
        item-value="idx"
        clearable dense
        class="mx-auto "
        style="max-width: 50%;"
        label="Select Item"
        :return-object="true"
        single-line
      >
        <template v-slot:selection="{ item }">
            <v-list-item-title >{{ ( item.version != latest ? "Not Latest" : 'Latest' ) }}</v-list-item-title>
            <v-list-item-subtitle>v{{ item.version }}</v-list-item-subtitle>
        </template>
        <template v-slot:item="{ item }">
          <v-list-item-avatar
          >
            <v-icon v-if="item.version == latest" small color="green">$check-circle
            </v-icon>
            <v-icon v-else color="orange" small > $exclamation-triangle
            </v-icon>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title >{{`v${item.version}`}}, {{ ( item.version != latest ? "Not Latest" : 'Latest' ) }}</v-list-item-title>
            <v-list-item-subtitle v-text="(!item.imported && !item.local ? 'Not Imported' : 'Local' )"></v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-list-item-subtitle v-if="item.local">
              Base Version
            </v-list-item-subtitle>
            <v-list-item-subtitle v-else>
              Not Base Version
            </v-list-item-subtitle>
          </v-list-item-action>
        </template>
        <template v-slot:append>
          <v-tooltip top class="ml-2" >
            <template v-slot:activator="{ on }">
              <v-icon  v-on="on" @click="importVersion" medium color="primary">$download</v-icon>
            </template>
            Import module for offline use
          </v-tooltip>
          
        </template>
        <template v-slot:prepend>
          <v-subheader>Version</v-subheader>
          <v-icon medium color="primary">$tags</v-icon>
        </template>
      </v-autocomplete>
      <template v-slot:extension >
        <v-subheader>Procedures
        </v-subheader>
        <v-tabs
          v-model="procedureIdx"
          align-with-title 
          next-icon="$arrow-alt-circle-right"
          prev-icon="$arrow-alt-circle-left"
          show-arrows 
        >
          <v-tabs-slider color="yellow"></v-tabs-slider>

          <v-tab
            v-for="(item, index) of selectedVersion.procedures"
            :key="`${index}-itemtab`"
          >
            {{index}}. {{ item.title }}
          </v-tab>
        </v-tabs>
        <v-btn
          color="primary"
          class="text-caption"
          @click="reset()"
        >
          <v-icon class="mr-3" small color="primary lighten-2" >
              $cog 
          </v-icon>
        Reset Default</v-btn>
      </template>
      <v-tooltip top class="ml-2" :key="`${selectedVersion.imported}-importedkey`" v-if="selectedVersion.removable">
        <template v-slot:activator="{ on }">
          <v-btn @click="removeModule(selectedVersion.idx, selectedVersion.name)" v-on="on" icon >
            <v-icon color="orange" medium>
              $trash-alt
            </v-icon>
          </v-btn>
        </template>
        Remove saved module
      </v-tooltip>
      <v-tooltip bottom>
          <template v-slot:activator="{ on }">
              <v-icon v-on="on" medium color="indigo "  v-on:click="fetchRemoteCatalog(selectedVersion.name)" style="text-align:right" class="configure ml-2 mr-3">$external-link-alt</v-icon>
          </template>
          Fetch Versions for Module
      </v-tooltip>
      <v-divider vertical inset ></v-divider>
      <v-tooltip top>
          <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon @click="start_procedure()">
                  <v-icon   color="primary" medium>
                      $play-circle
                  </v-icon>
              </v-btn>
          </template>
          Run Procedure (1 or more services sequentially)
      </v-tooltip>
      <v-tooltip top v-if="job && job.running">
          <template v-slot:activator="{ on }">
              <v-btn v-on="on" medium icon @click="cancel_procedure()" >
                  <v-icon color="orange darken-2" medium>
                  $times
                  </v-icon>
              </v-btn>
          </template>
          Cancel Procedure 
      </v-tooltip>
      <v-progress-linear
          :active="job && job.running"
          :indeterminate="true"
          absolute
          bottom
          style="top: -25px"
          height="25"
          color="primary"
      ></v-progress-linear>
    </v-toolbar>
    
    </v-col>
    <v-navigation-drawer
        v-model="customDrawer"
        absolute right
        temporary
        style="min-width: 500px"
      >
        <v-list-item>
          <v-list-item-avatar>
            <v-icon color="primary">{{ ( procedure.icon  ? '$'+procedure.icon : '$cog' ) }}</v-icon>
          </v-list-item-avatar>

          <v-list-item-content>
            <v-list-item-title>Customization</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-select
          :items="serviceList"
          v-model="el"
          label="Adjust service"
        >
        </v-select>
        <v-card class="scroll fill-height" >
          <v-subheader>
            Adjust Cmd in Docker Pipeline
          </v-subheader>
          <v-textarea
            v-model="services[el-1].command[index]"
            v-for="(item, index) in services[el-1].command"
            :key="`${index}-commandIndex`"
            :disabled="index <=1"
            :hidden="index <=1"
            @change="changeCommand(el-1, services[el-1].command[index] )"
          >
          </v-textarea>
          <Customize
            style="max-height: 200px"
            @addCustomElement="addCustomElement"
            >
          </Customize>
        </v-card>
      </v-navigation-drawer>
    
    <v-col sm="3" class="shrink">
      <v-dialog 
          transition="dialog-bottom-transition"
      >
      <template v-slot:activator="{ on, attrs }">
          <v-card
            :color="( installStatus.fully_installed ? 'green': 'orange darken-4')"
            dark
          >
            <v-card-title v-if="installStatus.fully_installed" class="text-h5">
              Module Status
            </v-card-title>
            <v-card-title v-else class="text-h5">
              Module Status
            </v-card-title>

            <v-card-subtitle>{{showInstalled}} up-to-date dependencies</v-card-subtitle>
            <v-card-text v-if="installStatus.fully_installed">All dependencies installed</v-card-text>
            <v-card-text v-else>Missing 1 or more dependencies</v-card-text>
            <v-card-actions>
              <v-btn
                  v-on="on" v-bind="attrs"
                  class="text-caption"
                  dark small 
              >
                Check
                <looping-rhombuses-spinner  
                  :animation-duration="6000" v-if="installStatus.building"
                  :size="3" class="ml-1"
                  :color="'white'"
                  />  
              </v-btn>
              <v-btn
                  v-on="on" v-bind="attrs"
                  class="text-caption" color="primary" icon-and-text
                  dark small @click="buildModule()"
              >
                Build
                <v-icon small class="ml-3"
                >
                  $download
                </v-icon>
              </v-btn>
            </v-card-actions>
          </v-card>
          <!-- <v-alert  prominent 
          :icon="(installStatus.fully_installed ? '$check-circle': '$exclamation-triangle')"
          :type="( installStatus.fully_installed ? 'success': 'error')">
            <v-row align="center">
              <v-col v-if="installStatus.fully_installed" class="grow">  
                {{showInstalled}} up-to-date dependencies
              </v-col>
              <v-col class="grow" v-else>
                {{showInstalled}} up-to-date dependencies
              </v-col>
              <v-col class="shrink">
                <v-btn
                    v-on="on" v-bind="attrs"
                    class="text-caption"
                    dark small 
                >
                  Check
                  <looping-rhombuses-spinner  
                    :animation-duration="6000" v-if="installStatus.building"
                    :size="3" class="ml-1"
                    :color="'white'"
                    />  
                </v-btn>
                <v-icon
                    class="configure" color="white lighten-2"
                    medium @click="buildModule()"
                >
                  $download
                </v-icon>
              </v-col>
            </v-row>
              
          </v-alert> -->
        
          
            
          
          
        </template>
        <SubLibrary
              :version="selectedVersion"
              :dependencies="dependencies"
              :procedure="procedureIdx"
              :status="installStatus"
              ref="sublibrary"
          >
        </SubLibrary>
        
      </v-dialog>
      <v-alert
        dense v-if="anyRender" prominent
        text icon="$exclamation-triangle"
        type="info"
      >
        This procedure utilizes a rendered UI, select the "Click Me" button below to open it
      </v-alert>
      <v-banner v-if="selectedVersion.version != latest">
        <v-tooltip bottom class="" >
          <template v-slot:activator="{ on }">
            <v-icon class="ml-3" v-on="on" color="warning" medium> $exclamation-triangle
            </v-icon>
          </template>
          View the Library to install version {{latest}} or select from the drop-down if already loaded
        </v-tooltip>
        {{ ( latest ? 'A newer version is available' : 'Could not fetch latest version' ) }}
      </v-banner>
    </v-col>
    <v-col sm="9">
      <v-subheader class="overflow-x-visible mx-4 indigo lighten-5" v-if="selectedVersion.description">{{selectedVersion.description}}</v-subheader>
      <v-stepper  v-model="el" class="pb-0" v-if="services" >
          <v-stepper-header
              class="configure"
          >
            <template v-for="(entry, key) in services"  >
              
                <v-stepper-step
                    :complete="(status[key] ? status[key].success : false)"
                    :key="key+'-entry'"
                    :disabled="true"
                    complete-icon="$check"
                    :rules="[()=>{
                        return (status[key] && status[key].error ? !status[key].error : true) 
                    }]"
                    error-icon="$times-circle"
                    @click="el = key+1"
                    :step="key+1"
                >
                    
                    {{ ( entry.label ? entry.label : entry.name ) }} 
                    <small class="">{{ services_to_use[key] >= 1 || !services_to_use[key] == null ? 'Enabled' : "Disabled" }}
                      <v-tooltip top  :key="key+'-entryDi'" v-if="services_to_use[key] >= 1 || !services_to_use[key] == null" >
                          <template v-slot:activator="{ on }">
                              <v-icon v-on="on"  class="ml-2" small color="primary lighten-2" @click="services_to_use[key] = 0">
                                  $check
                              </v-icon>
                          </template>
                          Click to Disable
                      </v-tooltip>
                      <v-tooltip top :key="key+'-entryDi'" v-else >
                          <template v-slot:activator="{ on }">
                              <v-icon v-on="on"  class="ml-2" small color="warning lighten-1" @click="services_to_use[key] = 1">
                                  $slash
                              </v-icon>
                          </template>
                          Click to Enable
                      </v-tooltip>
                      <v-tooltip top v-if="status && status[key] && status[key].error">
                          <template v-slot:activator="{ on }">
                              <v-icon v-on="on" class="ml-2"  small color="orange darken-2">
                                  $exclamation-triangle
                              </v-icon>
                          </template>
                          {{status[key].error}}
                      </v-tooltip>
                      <v-tooltip top v-else-if="status && status[key] && status[key].cancelled">
                          <template v-slot:activator="{ on }">
                              <v-icon v-on="on"  class="ml-2" small color="orange darken-2">
                                  $ban
                              </v-icon>
                          </template>
                          Cancelled!
                      </v-tooltip>
                      <v-dialog
                        transition="dialog-bottom-transition"
                        max-width="600"
                      >
                        <template v-slot:activator="{ on,attrs }">                        
                            <v-icon  v-bind="attrs" v-on="on" class="ml-2" small color="primary lighten-2" >
                                $cog
                            </v-icon>
                        </template>
                        <template v-slot:default="dialog">
                          <v-card>
                            <v-toolbar
                              color="light"
                              dark
                            >Adjust Configuration for service: {{entry.label}}
                            <v-spacer>
                            </v-spacer>
                            </v-toolbar>
                            <v-card-text>
                              <small>Default image: {{entry.image}}</small>
                              <v-text-field
                                label="Service Image to Use"
                                v-model="custom_images[key]"
                                single-line
                              ></v-text-field>
                              <v-btn
                                text @click="custom_images[key]=entry.image"
                              >Default</v-btn>
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
                    </small>
                </v-stepper-step>
                <v-divider
                    v-if="key !== services.length - 1"
                    :key="key"
                ></v-divider>
            </template>
        </v-stepper-header>
      </v-stepper>
    </v-col>
    <v-col sm="6" v-if="procedure && procedure.variables" class="overflow:auto; min-height:">
      <ListParams
          :items="additionals"
          v-if="additionals.length > 0"
          :defaultHeaders="headers"
          @updateValue="updateValue"
          :key="updates"
          @removeCustomVariable="removeCustomVariable"
      >
      </ListParams>
    </v-col>
    <v-col sm="6" v-if="headers.length > 0 && procedure "  >
      <v-card height="90vh" class="scroll fill-height">
        
        <Progresses
          :progresses="procedure.watches"
          :status="status"
          :job="job"
          :catalog="module"
          :procedure="procedureIdx"
          :removal_override="procedure.removal_override"
          @removeCustomVariable="removeCustomVariable"
          :defaultHeaders="outputHeaders"
        >
        </Progresses>
        <LogWindow  v-if="job && job.stream  " :info="job.stream" ></LogWindow> 
        
      </v-card>
    </v-col>
  </v-row>
</template>

<script>
const cloneDeep = require("lodash.clonedeep");
import nestedProperty from 'nested-property';

import { Configuration } from '../../../../shared/configuration';
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import FileService from '@/services/File-service.js'
import ListParams  from '@/components/Framework/Mods/ListParams.vue';
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
import Progresses  from '@/components/Framework/Progresses.vue';
import Docker from "@/components/Dashboard/System/Docker";
import SubLibrary from "@/components/Dashboard/DashboardDefaults/SubLibrary"
import Customize  from '@/components/Framework/Customize.vue';

export default {
	name: 'module',
  components:{
    ListParams,
    Customize,
    Progresses,
    LogWindow,
    Docker,
    SubLibrary,
    LoopingRhombusesSpinner,
    FulfillingBouncingCircleSpinner,
  },
  beforeDestroy: function(){
    if (this.interval){
      try{
        clearInterval(this.interval)
      } catch(err){
        console.error(err)
      }
    }
  },
  methods: {
    setProcedure(event){
      this.procedure_selected_index = event
    },
    async buildModule(){
        const $this = this
        let procedureIdx  = this.procedureIdx
        FileService.buildProcedure({
            catalog: $this.selectedVersion.name,
            procedure: procedureIdx
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
    async removeModule(index,name){
      this.$swal({
          title: 'Are you sure you want to remove this version?',
          type: 'warning',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonText: `Remove module & dependencies`,
          denyButtonText: `Remove from Imports`,
      }).then((res) => {
          if (res.value !='cancel' && res.isConfirmed){

              FileService.removeModule({
                  catalog: name,
                  index: index,
                  dependencies: true,
              }).then((response)=>{
                  this.$swal.fire({
                      position: 'center',
                      icon: 'success',
                      showConfirmButton:true,
                      title:  response.data.message
                  })
                  this.selectedVersion.imported=false
              })
              .catch((err)=>{
                  console.error(err)
                  this.$swal.fire({
                      position: 'center',
                      icon: 'error',
                      showConfirmButton:true,
                      title:  error.response.data.message
                  })
              }) 
          }
          else if (res.value !='cancel' && res.isDenied){
              FileService.removeModule({
                  catalog: name,
                  index: index
              }).then((response)=>{
                  this.$swal.fire({
                      position: 'center',
                      icon: 'success',
                      showConfirmButton:true,
                      title:  response.data.message
                  })
                  this.selectedVersion.imported=false
              })
              .catch((err)=>{
                  console.error(err)
                  this.$swal.fire({
                      position: 'center',
                      icon: 'error',
                      showConfirmButton:true,
                      title:  error.response.data.message
                  })
              }) 
              
          }
      }) 
    },
    async getInstallStatus(){
      FileService.getProcedure({
        procedure: this.procedureIdx, 
        catalog: this.selectedVersion.name,
        token: this.$store.token
      }).then((f)=>{
        this.dependencies = f.data.data.dependencies
        this.installStatus = f.data.data.status
      })
      .catch((err)=>{
          console.error(err)
          
      }) 
    },
    async fetchRemoteCatalog(name){
           
        const $this = this
        FileService.fetchRemoteCatalog('stagedModules', name).then((f)=>{
          this.getLibrary().then((f)=>{
            let idx2 = this.selectedVersion.procedures.findIndex((f,i)=>{
              return f.name == this.selectedProcedure.name
            })
            
          }).catch((err)=>{
            console.error(err)
          })
          
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
    async getLibrary(){
      try{
        let response = await FileService.getLibraryVersions(this.name)
        let libraryVersions = response.data.data
        let idx = libraryVersions.findIndex((f,i)=>{
          return f.version == this.selectedVersion.version
        })
        if (idx != null && idx !== -1 && this.selectedVersion){
          this.selectedVersion = libraryVersions[idx]
          
          this.updates +=1
        }
        this.libraryVersions = libraryVersions
      }catch (Err){
        console.error(Err)
      }
    },
    removeCustomVariable(variable){
      this.$delete(this.procedure.variables, variable);
      this.$store.dispatch('REMOVE_VAR_CUSTOM', {
        name: variable.name,
        catalog: this.selected.name, 
        procedure: this.procedureIdx
      })
    },
    changeCommand(index, command){
      this.custom_command[index] = command
    },
    addCustomElement(element){
      this.$set(this.procedure.variables, element.name, element)
      element.custom = true
      this.$store.dispatch('ADD_VARIABLE_CUSTOM', {
        name: element.name,
        variable: element,
        catalog: this.selected.name, 
        procedure: this.procedureIdx
      })
      
    },
    reset(){
      this.$store.dispatch("clearCatalog", {
        procedure: this.procedureIdx, 
        catalog: this.selected.name,
      })
      let found = nestedProperty.get(this.$store.state,`configs.${this.selectedVersion.name}.procedures.${this.procedureIdx}`);
      if (found){
        
        this.loadProcedure(found)
      } else {
        this.getProcedure()
      }
    },
    async getJobStatus(){
      const $this = this
      try{
        let response = await FileService.getJobStatus({
          procedure: this.procedureIdx,
          catalog: this.selectedVersion.name
        })
       this.procedure.job = response.data.data
       this.job = response.data.data
       this.status = this.job.services
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    
    async rmCustomModule(selected){
      console.log(selected,"<")
      await FileService.rmModule({
        module: this.selectedVersion.name,
        index: this.selectedVersion.idx,
        catalog: this.name
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
        this.count +=1

      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
      
    },
    async cancel_procedure(procedureKey){
      const $this = this
      await FileService.cancelJob({
        procedure: $this.procedureIdx, 
        catalog: $this.selected.name,
        token: $this.$store.token,
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    async start_procedure(){
      this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  "Sent Procedure job to run..."
      })
      const $this = this;

      let services = Object.keys(this.services_to_use).filter((key, i)=>{
        return this.services_to_use[parseInt(key)] == 1
      })
      let images  = []
      if (this.custom_images ){
        for (let [key, value] of Object.entries(this.custom_images) ){
          images.push({
            service: parseInt(key),
            image: value
          })
        }
      }
      let keys = Object.keys(this.custom_command)
      let custom_command = []
      keys.forEach((key)=>{
        custom_command.push({
          service: key,
          command: $this.custom_command[key]
        })
      })
      await FileService.startJob({
        procedure: $this.procedureIdx, 
        catalog: $this.selected.name,
        token: $this.$store.token,
        images: images,
        dry: $this.dry,
        services: services,
        command: custom_command,
        variables: $this.procedure.variables
      }).then((response)=>{
        if (!response.data.skip){
            this.$swal.fire({
                position: 'center',
                icon: 'success',
                showConfirmButton:true,
                title:  response.data.message
            })

        }
      }).catch((error)=>{
          console.error("-----------------", error)
          this.$swal.fire({
            position: 'center',
            icon: 'error',
            showConfirmButton:true,
            title:  error.response.data.message
          })
      })
    },
    async updateValue(value){
      const $this = this;
      console.log("update value")
      $this.$store.dispatch('UPDATE_VARIABLE', {
        name: value.variable,
        source: value.src,
        option: value.option,
        catalog: $this.selected.name, 
        procedure: $this.procedureIdx
      })
      this.procedure.variables[value.variable].source = value.src
      this.procedure.updates(value).then((f)=>{
        if (f){
          f.forEach((changed)=>{
            if ($this.procedure[changed.key]){
              $this.procedure.variables[changed.key] = changed.value.source
            }
          })
        }
      })
    },
    
		loadProcedure(proc){
      const $this = this;
      let procedureConfig = ( proc ? proc : this.selectedProcedure)
      if (this.selectedVersion.shared){
        procedureConfig.shared = this.selectedVersion.shared
      }
      let procedure = new Configuration(cloneDeep(procedureConfig))
      
      
      procedure.defineMapping()
      procedure.create_intervalWatcher() 
      procedure.getProgress()
      let found = nestedProperty.get(this.$store.state, `catalog.${this.selectedVersion.name}.procedures.${this.procedureIdx}`)
      
      if (found){
        try{
          procedure.mergeInputs(found)
        } catch (Err){
          console.error(Err,"<<<") 
        }

      }
      this.procedure = procedure
      this.watches  = this.procedure.watches
      
      this.services = this.procedure.services
      if (Object.keys(this.services_to_use).length == 0){
        for (let [key, value] of Object.entries(this.services)){
            this.$set(this.services_to_use, key, 1)
        }
      }
    },
    updateStagedVersion(event){
      let index = 0
    },
    async changeVersion(){
      await FileService.createModule({
        index: this.selectedVersion.idx,
        catalog: this.name
      }).then((response)=>{
      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    defineProcedure(){
      try{
        
        this.$store.dispatch("SAVE_PROCEDURE_DEFAULT", {
          catalog: this.module, 
          procedure: this.procedureIdx,
          config: this.procedure
        })
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async importVersion(){
      await FileService.importModule({
        index: this.selectedVersion.idx,
        catalog: this.name
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
  			this.count +=1
        this.selectedVersion.imported = true
        // this.getStatus()
      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    async rm_procedure(procedureKey){
      await FileService.rmProcedure({
        procedure: procedureKey
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
  			this.count +=1

      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    
    
    dependsFind(service){
      let returnVal = true
      if (service.depends){
        service.depends.forEach((item)=>{
          let type = item.type
          let target = item.id

        })
      }
      return returnVal
    }
	},
  data(){
    return{
      drawer: true,
      customDrawer: false,
      installStatus: {},
      stored: {},
      custom_images: {},
      mini: true,
      el: 1,
      services: null,
      dialog: false,
      dependencies:[],
      updates: 0,
      procedureIdx: 0,
      services_to_use:{},
      selectedVersion: {},
      selectedProcedure: {},
      services_selected: [],
      procedure: {},
      watches: [],
      libraryVersions: [],
      selectedNewVersion: null,
      custom_command: {},
      selected_index: 0,
      logdialog: false,
      modules: [],
      factory: {

        'string': "String",
        "file": "File",
        "list": "List",
        "configuration-file": "ConfigurationFile", 
        "render": "Render"

      },

      interval: null,
      count:0,
      tab:0,
      defaultModule: 1,
      shared: [],
      status: {},
      module: {},
      job: null,
      tabService: 0,
      outputHeaders: [
            {
                text: "Label",
                value: "label",
                sortable: true,
                align:"center"
            },
            {
              text: "Access",
              value: "access",
              align:"center",
              sortable: false
            },
            {
                text: "Completed",
                value: "element",
                sortable: true,
                align:"center"
            },
            // {
            //     text: "Remove",
            //     value: "remove",
            //     sortable: false,
            //     align:"center"
            // }
            
        ],
        headers: [
            
            {
                text: "Param",
                value: "label",
                sortable: true,
                align:"center"                
            },
            {
                text: "Source",
                value: "source",
                align:"center"  ,              
                sortable: false
            },
            {
              text: "Type",
              align:"center"  ,              
              value: "element",
              sortable: false
            },
        ],
    }
  },
  props: [ "title", "name", 'selected', "importedVersions", "moduleIndex",  ],
  watch: {
    procedureIdx(newValue){
      console.log("procedure idx changed", newValue)
      if (this.selectedVersion.procedures ){
        this.selectedProcedure = this.selectedVersion.procedures[newValue]
      }
    },
    
    selected(newValue){
      this.selectedVersion = newValue
      this.dependencies = []
      this.installStatus = {}
      if (this.selectedVersion.procedures && this.selectedVersion.procedures[0]){
        this.selectedProcedure= this.selectedVersion.procedures[0]
      }
      this.services_to_use = []
      
      this.getLibrary()
    },
    selectedProcedure(newValue){
      const $this = this
      console.log("new value sleectedprocedure", newValue)
      if (newValue){
        this.services_selected = newValue.services
        this.loadProcedure(newValue)
      }
    }

  },
  computed: {
    showInstalled(){
      let returnable = `0 / 0`
      let installed = this.dependencies.filter((f)=>{
        return f.status.exists
      })
      return `${installed.length} / ${this.dependencies.length}`
    },
    serviceList(){
      let serviceList = []
      this.services.map((f,i)=>{
        serviceList.push(i+1)
      })
      return serviceList
    },
    anyRender(){
      if (this.selectedProcedure && this.selectedProcedure.variables){
        return Object.values(this.selectedProcedure.variables).some((f)=>{
          return f.element == 'render'
        })
      } else {
        return false
      }

    },
    latest(){
      return Math.max(...this.libraryVersions.map((f)=>{
        return f.version
      }))
    },
    additionals(){
        let ta= []
        console.log(this.procedure.variables)
        if (this.procedure && this.procedure.variables){
            for (let [key, value ] of Object.entries(this.procedure.variables)){
                if (!value.output){
                    value.name = key
                    if (!value.optionValue && value.options)[
                      value.optionValue = ( value.option ? value.options[value.option] : value.options[0])
                    ]
                    if (!value.source && value.options){
                      value.source = value.optionValue.source
                    }
                    ta.push(value)
                }
                
            }
        }
        return ta
            
    },
    computed_services(){
      let values = []
      for (let [key, value] of Object.entries(this.services)){
        values.push(
          {
            text: (value.label ? value.label : key),
            disabled: false,
            href: '_blank',
          },
        )
      }
      return values
    },
    
    selected_procedure_index(){
      if (this.module && this.selectedVersion.name){
        let index  = this.selectedVersion.procedures.findIndex(data => data === this.procedure)
        if (index == -1){
          return 0
        } else{
          return index
        }
      } else{
        return 0
      }
    },
    
  },
  mounted(){
    const $this = this;
    if (this.interval){
        clearInterval(this.interval)
    }
    this.selectedVersion = this.selected
    this.selectedProcedure = this.selected.procedures[0]
    $this.getJobStatus()
    $this.getInstallStatus()
    $this.getLibrary()
    $this.defineProcedure()
    this.interval = setInterval(()=>{
        $this.getJobStatus()
        $this.getInstallStatus()
        // $this.getLibrary()
    }, 2000)
},
  
    
};
</script>

<style>

.caro-bottom .v-icon {
  background: "blue"
}


</style>