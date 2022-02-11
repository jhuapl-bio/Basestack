<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  
    <v-row  style="height: 50vh" >
		  <v-col cols="12"  >
			<v-card >
      <v-toolbar class="my-5 "> 
        <v-toolbar-title>{{selected.title}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-select
            v-model="selected"  v-if="selected"
            :items="modules"
            icon-color="primary"
            :hint="'Version select'"
            item-text="version"
            item-value="version"
            class="mx-auto pr-4"
            style="max-width: 15%;"
            persistent-hint
            return-object
        >
          <template v-slot:prepend>
            <v-icon color="indigo">{{ ( selected.icon  ? '$'+selected.icon : '$cog' ) }}</v-icon>
          </template>
          <template v-slot:item="{ item }" >
            <v-list-item-avatar left>
              <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            </v-list-item-avatar>
            
            <v-list-item-content outlined>
              <v-list-item-title >{{ item.version ? item.version : 'No Version Available' }}</v-list-item-title>
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
        </v-select>
        
        <v-divider vertical inset></v-divider>
        <v-select
            v-model="selectedProcedure"
            :items="selected.procedures"
            :prepend-icon="( selectedProcedure.icon  ? '$'+selectedProcedure.icon : '$cog')"
            :hint="'Procedure select'"
            item-text="title"
            item-name="name"
            item-value="idx"
            class="mx-auto pl-4 pr-2"
            style="max-width: 33%;"
            label="Select Procedure"
            persistent-hint
            :return-object="true"
            single-line
        >
          <template v-slot:prepend>
            <v-icon color="primary">{{ ( selectedProcedure.icon  ? '$'+selectedProcedure.icon : '$cog' ) }}</v-icon>
          </template>
          <template v-slot:item="{ item, index }">
            <v-icon v-if="item.icon" color="primary" class="mx-2" x-small>{{ '$' + item.icon }}</v-icon>
            {{item.title}}
          </template>
        </v-select>
        
        <v-divider vertical inset></v-divider>
        <v-menu
          :close-on-content-click="false"
          :nudge-width="400"
          offset-x
        >
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              icon
              v-bind="attrs"
              v-on="on"
            >
              <v-icon medium>$bars</v-icon>
            </v-btn>
          </template>
           
          <v-card>
            <v-list>
              <v-subheader>Select Services to Run for Job</v-subheader>
              <v-list-item-group
                v-model="services_selected"
                multiple
              >
                
                <v-list-item
                  v-for="(entry, key ) in selectedProcedure.services"
                  centered
                  v-bind:key="entry.name"
                >
                  <template v-slot:default="{ active, item }">
                    <v-list-item-action>
                      <v-checkbox
                        :input-value="active"
                        on-icon="$check-square"
                        off-icon="$square"
                        color="primary"
                      ></v-checkbox>
                    </v-list-item-action>

                    <v-list-item-content>
                      <v-list-item-title>Notifications</v-list-item-title>
                      <v-list-item-subtitle>Allow notifications</v-list-item-subtitle>
                    </v-list-item-content>
                  </template>
                  <v-tooltip left>
                    <template v-slot:activator="{ on }">
                      <v-tab v-on="on" class="" style="" >
                        <span class="tabSideItemText">{{parseInt(key)+1}}. {{ ( entry.label  ? entry.label : key  ) }}</span>
                      </v-tab>
                    </template>
                    <span>{{ ( !entry.tooltip ? entry.title : entry.tooltip )}}</span>
                  </v-tooltip>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
			</v-menu>
      
      <v-tooltip top class="ml-2" v-if="selected.custom">
        <template v-slot:activator="{ on }">
          <v-btn @click="rmCustomModule(selected)" v-on="on" icon >
            <v-icon color="orange" medium>
              $trash-alt
            </v-icon>
          </v-btn>
        </template>
        Remove Custom Module 
      </v-tooltip>
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
          color="primary"
      ></v-progress-linear>
        
      </v-toolbar>
       <v-spacer></v-spacer>
        
      
        <v-divider></v-divider>
            <component 
              :is="'Job'"
              v-if="selected.idx || selected.idx == 0"
              :module="module.name"
              ref="job"
              :title="module.title"
              :watches="(job ? job.watches : [])"
              :status="( job ? job.services : {})"
              :procedureIdx="selectedProcedure.idx"
              class="fill-width fill-height"
              :moduleIdx="selected.idx"
            >            	
            </component>

    </v-card>
    </v-col>
  </v-row  >
</template>

<script>

import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import Procedure from "@/components/Framework/Procedure.vue"
import FileService from '@/services/File-service.js'
import Job from "@/components/Framework/Job.vue"
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
export default {
	name: 'module',
  components:{
    // Service,
    Job,
    Procedure,
    LogWindow,
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
    async getJobStatus(){
      const $this = this
      try{
        let response = await FileService.getJobStatus({
          module: this.selected.idx,
          procedure: this.selectedProcedure.idx,
          catalog: this.module.name
        })
       this.selectedProcedure.job = response.data.data
       this.job = response.data.data
     
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async cancel_procedure(procedureKey){
      let ref  = this.$refs['job']
      ref.cancel_procedure()
    },
    async start_procedure(){
      let ref  = this.$refs['job']
      ref.start_procedure()

    },
    
    async rmCustomModule(selected){
      if (selected.custom){
        await FileService.rmModule({
          variant: this.selected_variant_index, 
          module: this.module.name
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
      }
    },
    async updateValue(event){

    },
    getStatus(serviceIdx){
      return this.statuses[serviceIdx] && this.statuses[serviceIdx].running
    },
		sendStatus(event){
      // this.status[event.service] = event.status.exists
      
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
    
    async getStatus(){
      const $this = this
      try{
        let response = await FileService.getModules({
          catalog: this.module.name
        })
        this.modules = response.data.data.map((d,i)=>{
          d.idx  = i 
          return d
        })
        try{
          if (!this.selected.name){
            this.selected = this.modules[this.selected_index]
          }
          if (!this.selectedProcedure.name){
            this.selectedProcedure = this.selected.procedures[this.selected_index]
          }
        } catch(err){
          console.error("Could not assign defaults in module, ", err)
        }
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
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
      mini: true,
      services_selected: [],
      selectedProcedure: {},
      selected_index: 0,
      logdialog: false,
      selected: {},
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
      job: null,
      tabService: 0,
    }
  },
  props: [ "module", "variant", "moduleIndex" ],
  watch: {
    module(newValue, oldValue){
      if (!this.selected && newValue){
        this.selected = newValue[this.defaultModule]
      }
    },
    selectedProcedure(newValue){
      this.services_selected = newValue.services
      const $this = this
      if (this.interval){
        clearInterval(this.interval)
      }
      $this.getJobStatus()
      this.interval = setInterval(()=>{
          $this.getJobStatus()
      }, 2000)
    }

  },
  computed: {
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
    selected_variant_index(){
      if (this.module){
        let index  = this.modules.findIndex(data => data === this.selected)
        
        if (index == -1){
          return 0
        } else{
          return index
        }
      } else{
        return 0
      }
    },
    selected_procedure_index(){
      if (this.selected && this.selected.name){
        let index  = this.selected.procedures.findIndex(data => data === this.selectedProcedure)
        if (index == -1){
          return 0
        } else{
          return index
        }
      } else{
        return 0
      }
    },
    // selected(){
    //   if (this.selected_index || this.selected_index == 0){
    //     this.selectedProcedure = this.module.variants[this.selected_index].procedures[this.defaultProcedure]
    //     return this.module.variants[this.selected_index]
    //   } else {
    //     return {}
    //   }
    // }
  },
  mounted(){
    const $this = this;
    $this.getStatus()
    // this.interval = setInterval(()=>{
    //   $this.getStatus()
    // }, 3000)
  },
  
    
};
</script>

<style>
#framework{
}
.caro-bottom .v-icon {
  /* left: 10% !important; */
  background: "blue"
}


</style>