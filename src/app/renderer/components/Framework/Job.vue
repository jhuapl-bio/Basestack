
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
    <v-stepper  v-model="el" v-if="services" >
        <v-stepper-header
            class="configure"
        >
            
            
            <v-dialog
              transition="dialog-bottom-transition"
              max-width="600"
            >
              <template v-slot:activator="{ on,attrs  }">
               
                <v-btn
                  color="primary"
                  class="text-caption"
                  v-bind="attrs"
                  v-on="on"
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
          <v-col sm="6" v-if="procedure && procedure.variables" >
            <ListParams
                :items="additionals"
                v-if="additionals.length > 0"
                :defaultHeaders="headers"
                @updateValue="updateValue"
            >
            </ListParams>
            
          </v-col>
          <v-col sm="6" v-if="headers.length > 0 && procedure "  >
            <v-card height="70vh" class="scroll fill-height">
              <Progresses
                  :progresses="procedure.watches"
                  :status="status"
                  :job="jobStatus"
                  :catalog="module"
                  :module="moduleIdx"
                  :procedure="procedureIdx"
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
   LoopingRhombusesSpinner,
   FulfillingBouncingCircleSpinner
  },
  
  methods: {
    updateImage(index,val){
      this.custom_images[index] = val
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
      await FileService.startJob({
        procedure: $this.procedureIdx, 
        module: $this.moduleIdx,
        catalog: $this.module,
        token: $this.$store.token,
        images: images,
        dry: $this.dry,
        services: services,
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
      let procedure = new Configuration(proc)
      procedure.defineMapping()
      procedure.create_intervalWatcher() 
      // procedure.variables.file.source = "/Users/merribb1/Desktop/test-data2/metagenome/sample_metagenome.fastq"
      procedure.getProgress()
      let found = nestedProperty.get(this.$store.state, `catalog.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`)
      console.log("daksjdksadj", found)
      if (found){
        try{
          procedure.mergeInputs(found)
        } catch (Err){
          console.error(Err,"<<<")
        }

      }
      this.procedure = procedure
      this.watches  = this.procedure.watches
      // this.$store.dispatch('CREATE_PROCEDURE', {
      //   obj: procedure,
      //   module: $this.moduleIdx, 
      //   catalog: $this.module, 
      //   procedure: $this.procedureIdx
      // })
      
      // this.updateValue({
      //   src: "/Users/merribb1/Desktop/test-data2/metagenome/sample_metagenome.fastq",
      //   option: 0,
      //   variable: "file"

      // })
      
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
    ...mapState({
      catalog: state => state.catalog
    }),
    // watches(){
    //   return this.procedure.watches
    // },
    // procedure(){
    //   let found = nestedProperty.get(this.$store.state, `catalog.${this.module}.modules.${this.moduleIdx}.procedures.${this.procedureIdx}`)
    //   if (!found){
    //     return {}
    //   } else {
    //     return this.$store.state.catalog[this.module].modules[this.moduleIdx].procedures[this.procedureIdx]
    //   }
    // },

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
    // this.$store.dispatch("clearAll")
    if (!found){
      this.getProcedure()
    } else {
      
      // this.loadProcedure(cloneDeep(found))
      this.getProcedure()

    }
    $this.watcherInterval = setInterval(()=>{
      // let procedure = $this.$store.getters.getProcedure({
      //   module: $this.moduleIdx, 
      //   catalog: $this.module, 
      //   procedure: $this.procedureIdx
      // })
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