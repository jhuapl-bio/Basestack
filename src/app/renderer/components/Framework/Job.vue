
<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card  fluid id="job" class=" noscroll mt-0 mb-0"  >
    <v-btn
      color="indigo lighten-1"
      class="text-caption "
      @click.stop="drawer = !drawer"
    >
      <v-icon class="mr-3" small  >
          $cog 
      </v-icon>
    Customize</v-btn>
    <v-dialog
      transition="dialog-bottom-transition"
      max-width="600"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="primary"
          class="text-caption"
          v-on="on"
          v-bind="attrs"
        >
          <v-icon class="mr-3" small color="primary lighten-2" >
              $cog 
          </v-icon>
        Info</v-btn>
      </template>
     
      <template v-slot:default="dialog">
        <v-card>
          <v-toolbar
            color="light"
            dark
          >Advanced Configuration Information for {{procedure.title}}
          <v-spacer>
          </v-spacer>
          
          </v-toolbar>
          <v-card-text>
            <v-checkbox
                  v-model="dry"
                  label="Perform Dry Run"
                  hint="Check the logs for the configuration JSON for this procedure"
                  on-icon="$check-square"
                  class="align-center justify-center text-xs-center mx-4" 
                  off-icon="$square"
                  color="primary"
              >
              
            </v-checkbox> 
            <v-btn
              color="primary"
              class="text-caption"
              @click="reset()"
            >
              <v-icon class="mr-3" small color="primary lighten-2" >
                  $cog 
              </v-icon>
            Reset Default</v-btn>
            <tree-view :data="services" height="300px" class=" mt-2 mb-3 pt-0 elevation-5 treeview " style="overflow-y:auto" 
                    :options="{
                        maxDepth: 3, 
                        rootObjectKey: 'root',
                        modifiable: false,
                        limitRenderDepth: false
                    }"
                >
            </tree-view>
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
    <v-banner
      elevation="12"
      v-if="services && services.filter((f)=>{return f.orchestrator}).length > 0"
    >
      <v-avatar
        slot="icon"
        color="orange accent-4"
        size="40"
      >
        <v-icon
          color="white"
        >
          $exclamation-triangle
        </v-icon>
      </v-avatar>
      This procedure uses an orchestrated container and DOES NOT end at pipeline completion. Check output field for status</v-banner>
    <v-stepper  v-model="el" v-if="services" >
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
        <v-alert type="warning" icon="$exclamation" shaped
          text v-if="jobStatus && !jobStatus.fully_installed ">All dependencies are not installed. Check the Library to see missing components
        </v-alert>
        <v-row >
          <v-navigation-drawer
            v-model="drawer"
            absolute
            temporary
            style="width: 500px"
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
          <!-- <v-col sm="4" class="scroll fill-height" >
            <v-subheader>
              Customize
            </v-subheader>
            <v-text-field
              v-model="services[el-1].command[index]"
              v-for="(item, index) in services[el-1].command"
              :key="`${index}-commandIndex`"
              hint="Service command"
              :disabled="index <=1"
              persistent-hint
            >
            </v-text-field>
            <Customize
              style="max-height: 200px"
              @addCustomElement="addCustomElement"
              >
            </Customize>
          </v-col> -->
          <v-col sm="6" v-if="procedure && procedure.variables" class="overflow:auto; min-height:">
            <ListParams
                :items="additionals"
                v-if="additionals.length > 0"
                :defaultHeaders="headers"
                @updateValue="updateValue"
                @removeCustomVariable="removeCustomVariable"
            >
            </ListParams>
            
          </v-col>
          <v-col sm="6" v-if="headers.length > 0 && procedure "  >
            <v-card height="90vh" class="scroll fill-height">
              <Progresses
                :progresses="procedure.watches"
                :status="status"
                :job="jobStatus"
                :catalog="module"
                :module="moduleIdx"
                :procedure="procedureIdx"
                @removeCustomVariable="removeCustomVariable"
                :defaultHeaders="outputHeaders"
              >
              </Progresses>
              <LogWindow  v-if="jobStatus && jobStatus.stream  " :info="jobStatus.stream" ></LogWindow> 
              
            </v-card>
          </v-col>
        </v-row>
        
    </v-stepper>    
    

  </v-card>
</template>

<script>
import FileService from '@/services/File-service.js'
import ListParams  from '@/components/Framework/Mods/ListParams.vue';
import Customize  from '@/components/Framework/Customize.vue';
import Progresses  from '@/components/Framework/Progresses.vue';
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
import { Configuration } from '../../../../shared/configuration';
import nestedProperty from 'nested-property';
import { mapState } from 'vuex';
const cloneDeep = require("lodash.clonedeep");

export default {
  name: 'job',
  beforeDestroy: function(){
   if (this.procedure){
     this.procedure.destroy_interval()
   }
   if (this.watcherInterval){
     clearInterval(this.watcherInterval)
   }
  },
  components:{
   LogWindow,
   ListParams,
   Progresses,
   Customize,
   LoopingRhombusesSpinner,
   FulfillingBouncingCircleSpinner
  },
  
  methods: {
    updateImage(index,val){
      this.custom_images[index] = val
    },
    removeCustomVariable(variable){
      this.$delete(this.procedure.variables, variable);
      console.log(this.procedure.variables[variable], variable)
    },
    changeCommand(index, command){
      this.custom_command[index] = command
    },
    addCustomElement(element){
      console.log("element sent", element)
      this.$set(this.procedure.variables, element.name, element)
      console.log(this.procedure.variables,"<")
    },
    reset(){
      this.$store.dispatch("clearCatalog", {
        procedure: this.procedureIdx, 
        module: this.moduleIdx,
        catalog: this.module,
      })
      let found = nestedProperty.get(this.$store.state,`configs.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`);
      if (found){
        this.loadProcedure(found)
      } else {
        this.getProcedure()
      }
    },
    async cancel_procedure(procedureKey){
      const $this = this
      await FileService.cancelJob({
        procedure: $this.procedureIdx, 
        module: $this.moduleIdx,
        catalog: $this.module,
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
        module: $this.moduleIdx,
        catalog: $this.module,
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
    updateValue(value){ 
      const $this = this;
        $this.$store.dispatch('UPDATE_VARIABLE', {
          name: value.variable,
          source: value.src,
          option: value.option,
          module: $this.moduleIdx, 
          catalog: $this.module, 
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
      let procedure = new Configuration(cloneDeep(proc))
      procedure.defineMapping()
      procedure.create_intervalWatcher() 
      procedure.getProgress()
      let found = nestedProperty.get(this.$store.state, `catalog.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`)
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
    async getProcedure(){
      const $this = this
      try{
        let response = await FileService.getProcedureConfig({
          module: this.moduleIdx,
          procedure: this.procedureIdx,
          catalog: this.module
        })
        this.$store.dispatch("SAVE_PROCEDURE_DEFAULT", {
          module: $this.moduleIdx, 
          catalog: $this.module, 
          procedure: $this.procedureIdx,
          config: response.data.data
        })
        console.log("next")

        this.loadProcedure(cloneDeep(response.data.data))

      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
  },
  data(){
    return{
        el: 1,
        dry:false,
        custom_command: {},
        drawer: false,
        full_services: null,
        watcherInterval: null,
        services: null,
        watches: [],
        procedure: null,
        custom_images: {},
        services_to_use: {},
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
            {
                text: "Remove",
                value: "remove",
                sortable: false,
                align:"center"
            }
            
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
  props: [ 'module', 'moduleIdx', 'procedureIdx', 'title', 'status' , "jobStatus" ],
  watch: {
    procedureIdx(newValue){
        this.services_to_use = {}
        this.getProcedure()
    },
  },
  computed: {
    procedureConfig(){
      return nestedProperty.get(this.$store.state, `configs.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`)
    },
    serviceList(){
      let serviceList = []
      this.services.map((f,i)=>{
        serviceList.push(i+1)
      })
      return serviceList
    },
    ...mapState({
      catalog: state => state.catalog
    }),
    statuses(){
        return this.status.services
    },
   
    
    
    additionals(){
        let ta= []
        if (this.procedure && this.procedure.variables){
            for (let [key, value ] of Object.entries(this.procedure.variables)){
                if (!value.output){
                    value.name = key
                    if (!value.source && value.options){
                      value.optionValue = ( value.option ? value.options[value.option] : value.options[0])
                      value.source = value.optionValue.source
                    }
                    ta.push(value)
                }
                
            }
        }
        return ta
            
    }
        
  },
  mounted(){
    const $this = this
    let found = nestedProperty.get(this.$store.state,`configs.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`);
    if (!found){
      this.getProcedure()
    } else {
      this.getProcedure()

    }
    $this.watcherInterval = setInterval(()=>{
      let procedure = $this.procedure
      if(procedure.watches){
        procedure.watches.map((f,i)=>{
          $this.$set($this.watches, i, f)
        })
      }
    },1000)
    
    

  },
  
    
};
</script>

<style>
#service{
  overflow-y: auto;
  width: 100%;
}
</style>