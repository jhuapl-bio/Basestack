<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="procedure"  >
    <v-sheet class="fill-height"  height="auto">
    <v-select
          v-model="selectedProcedure"
          :items="procedures"
          :prepend-icon="( selectedProcedure.icon  ? '$'+selectedProcedure.icon : '$cog')"
          :hint="'Procedure select'"
          item-text="title"
          item-name="name"
          item-value="idx"
          class="mx-auto pl-2"
          style="max-width: 43%;"
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
			<v-container
				fluid  
				class="d-flex  align-start pa-0 align-stretch"
			>
      
      <v-navigation-drawer
        v-model="drawer"
        class="elevation-12 nav-drawer" 
        :mini-variant.sync="mini" 
        left
        mini-variant-width="56"
        permanent height="auto"
      >
      <v-layout column fill-height>
        <v-list class="grow" dense>
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-icon x-small color="primary">{{ ( selectedProcedure.icon  ? '$' + selectedProcedure.icon : 'cog' ) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-title>{{ ( selectedProcedure.title  ? selectedProcedure.title : '1'  ) }}</v-list-item-title>
          <v-list-item-title>{{ ( selectedProcedure.version  ? selectedProcedure.version : '1'  ) }}</v-list-item-title>

          <v-btn
            icon
            @click.stop="mini = !mini"
          >
            <v-icon small>$chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item class="px-2"
        >
            
            
            <v-list-item-avatar  v-if="status.running" >
                <div   >
                    <fulfilling-bouncing-circle-spinner 
                      :animation-duration="3000"
                      :size="10"
                      :color="'#2b57b9'"
                    />
                </div>
            </v-list-item-avatar>
            <v-list-item-avatar  v-else-if="status.error" >
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" color="orange darken-2" x-small >$exclamation-triangle</v-icon>
                  </template>
                  Error in running procedure, check logs
                </v-tooltip>
            </v-list-item-avatar>
            <v-list-item-avatar v-else  > 
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" x-small >$slash</v-icon>
                </template>
                No services are running
              </v-tooltip>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="( status.running ? 'Running' : 'Not Running') "></v-list-item-title>
              
            </v-list-item-content>
            
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item-group
          color="primary" 
          v-model="serviceTab"
        >
          <!-- <v-list-item class="px-2"
            v-for="(service, serviceKey) of status.services"  :key="serviceKey"
          >
            
              <v-list-item-avatar v-if="service.status.running ">
                <v-tooltip right >
                  <template v-slot:activator="{ on }">
                  <div v-on="on"  >
                      <fulfilling-bouncing-circle-spinner 
                        :animation-duration="3000"
                        :size="10"
                        :color="'#2b57b9'"
                      />
                  </div>
                  </template>
                  Running
                </v-tooltip>
              </v-list-item-avatar>
              <v-list-item-avatar   v-else> 
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                    <v-subheader>{{ serviceKey + 1 }}</v-subheader>
                  </template>
                  Service is not running
                </v-tooltip>
              </v-list-item-avatar>
              <v-list-item-content>
                 <v-list-item-title v-text="service.label"></v-list-item-title>
              </v-list-item-content>
              
          </v-list-item> -->
          <v-list-item
            @click="tabService = serviceKey"
            v-for="(service, serviceKey) of selectedProcedure.services"  :key="serviceKey"
          >
            <v-list-item-avatar  >
                <v-tooltip right v-if="service.status && service.status.running ">
                  <template v-slot:activator="{ on }">
                  <div v-on="on" style="display:flex" >
                      <fulfilling-bouncing-circle-spinner 
                        :animation-duration="3000"
                        :size="10"
                        :color="'#2b57b9'"
                      />
                      
                  </div>
                  </template>
                  Running
                </v-tooltip>
                <v-tooltip right v-else-if="service.status && service.status.error ">
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" x-small color="orange darken-2">$exclamation-triangle</v-icon>
                  </template>
                  {{service.status.error}}
                </v-tooltip>
                <small v-else>{{serviceKey+1}}.</small>
            </v-list-item-avatar>
            <v-list-item-content >
              <v-list-item-title v-text="service.label"></v-list-item-title>
            </v-list-item-content>
            
           <!-- <v-list-item-icon>
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" small v-if="service.orchestrator">
                      $chess
                    </v-icon>
                    <v-icon v-on="on" small v-else-if="service.orchestrated">
                      $chess-pawn
                  </v-icon>
                  <v-icon v-on="on"  small v-else>
                      $chess-rook
                  </v-icon>
                  </template>
                  {{  (  service.orchestrator ? 'Orchestrator for one or more services' : ( service.orchestrator ? "Orchestrated by an orchestrator container" : 'Standalone Service, can be run without an orchestrator present ')      )   }}
                </v-tooltip>
            </v-list-item-icon> -->
            </v-list-item>
            <v-list-item  @click="start_procedure(selectedProcedure.name)" class="px-2" >
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item-avatar v-on="on" >
                    <v-icon  color="primary" x-small>
                      $play-circle
                    </v-icon>
                  </v-list-item-avatar>
                </template>
                Run Procedure (1 or more services sequentially)
              </v-tooltip>
              <v-list-item-content><v-subheader>Run Procedure</v-subheader></v-list-item-content>
            </v-list-item>
            <v-list-item  @click="cancel_procedure(selectedProcedure.name)"  class="px-2" v-if="status.running">
              <v-tooltip right>
                <template v-slot:activator="{ on }">
                  <v-list-item-avatar v-on="on" >
                    <v-icon color="orange darken-2" x-small>
                      $times
                    </v-icon>
                  </v-list-item-avatar>
                </template>
                Cancel Procedure 
              </v-tooltip>
              <v-list-item-content><v-subheader>Cancel Procedure</v-subheader></v-list-item-content>
            </v-list-item>
            
            <v-list-item  v-if="status && status.stream" class="px-2" >
              <v-list-item-avatar >
                <v-dialog
                    v-model="logdialog" 
                  > 
                    <template v-slot:activator="{ on, attrs }">
                          <v-btn
                            color="primary"
                            icon
                            class="mx-2"
                            v-bind="attrs"
                            v-on="on"
                            ><v-icon x-small>$comment</v-icon>
                          </v-btn>
                          
                    </template>
                    <v-card   class="w-100 pr-2 pl-2 mt-2 mb-2">
                      <p class="entry-label" style="font-size: 120%">Logs</p>
                      <LogWindow :info="status.stream"></LogWindow>
                    </v-card> 
                </v-dialog>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-subheader>View Logs</v-subheader>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
           <v-list-item class="px-2">
              <v-list-item-avatar>
                <v-icon x-small>
                  $tags
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-chip   v-for="(tag, tagKey) of selectedProcedure.tags"  :key="tagKey" x-small dense>
                  {{tag}} 
                </v-chip>
              </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-layout>
      </v-navigation-drawer>
      <v-card height="100%" width="100%">
      {{selectedService.name}}
        <Service  
          :ref="selectedService.name"
          :key="selectedService.name"
          @sendStatus="sendStatus" 
          v-if="selectedService.name"
          @updateValue="updateValue" 
          :serviceIdx="selectedService.idx"
          :service="selectedService"
          :module="moduleIdx"
          :catalog="module"
          :procedure="selectedProcedure.idx"
          :status="selectedService.status"
          :label="( selectedProcedure.title  ? selectedProcedure.title : ''  )"
            
          >
        </Service>
      </v-card>
      <!-- <v-carousel
          height="100vh" 
          v-model="tabService"
          v-if="selectedProcedure.services"
          :show-arrows="false"
          hide-delimiters
          vertical 
          delimiter-icon="$circle"
        >
          <template v-slot:prev="{ on,  }"  >
              <v-icon  small v-on="on">
                $arrow-alt-circle-left
              </v-icon>
          </template>
          <template v-slot:next="{ on,  }">
            <v-icon small v-on="on">
                $arrow-alt-circle-right
            </v-icon>
          </template>
          <v-carousel-item
            v-for="(service, serviceKey) of selectedProcedure.services"  
            :key="serviceKey" class="elevation-6 " 
          >
        </v-carousel-item>
      </v-carousel> -->
      </v-container>
    </v-sheet>
     

  </div>
</template>

<script>

import Service from '@/components/Framework/Service.vue';
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';

import FileService from '@/services/File-service.js'
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
export default {
	name: 'procedure',
  components:{
    Service,
    LogWindow,
    LoopingRhombusesSpinner,
    FulfillingBouncingCircleSpinner,
  },
  watch: {
    selectedProcedure(newValue){
      this.tabService = 0
      this.serviceTab = 0
      this.status = newValue.status
    }
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
    runServiceIndividually(key, idx){
      // console.log(key)
      let ref  = this.$refs[key]
      ref[0].start_service()
      this.tabService = idx
    },
    cancelServiceIndividually(key){
      let ref  = this.$refs[key]
      ref[0].cancel_service() 

    },
    async updateValue(event){
      console.log(event,"<<<<<<<<<")
      console.log(this.selectedProcedure.services)
      if (event.option){
        this.selectedProcedure.services[event.service].variables[event.variable].option = event.src
      } else {
        this.selectedProcedure.services[event.service].variables[event.variable].source = event.src
      } 
      
      // let filtered = this.services.filter((service)=>{
      //   return service.name == event.name
      // })
      // let procedure = this.procedure
      // if (procedure.shared){
      //   procedure.shared.forEach((share)=>{
      //     if (share.output.service == event.name){
      //       let indexes = this.services.map((d)=>{return d.name}).indexOf(share.input.service)
      //       if (indexes > -1){
      //         let variables = this.services[indexes][share.input.target]
      //         console.log(share)
      //         let indexV = variables.map((variable)=>{ return variable.name}).indexOf(share.input.variable)
      //         if(indexV > -1){
      //           this.services[indexes][share.input.target][indexV].source = event.target
      //         }
      //       }
      //     }
      //   })
      // }
      
    },
    getStatus(serviceIdx){
      return this.statuses[serviceIdx] && this.statuses[serviceIdx].running
    },
		sendStatus(event){
      // this.$set(this.procedure.services[event.service], 'running', event.status.running)
      // console.log(event, this.procedure.services[event.service].running)
      
    },
    async rm_procedure(procedureKey){
      await FileService.rmProcedure({
        procedure: $this.selectedProcedure.idx, 
        module: $this.moduleIdx,
        catalog: $this.module,
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
      await FileService.cancelProcedure({
        procedure: $this.selectedProcedure.idx, 
        module: $this.moduleIdx,
        catalog: $this.module,
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
        let response = await FileService.getProcedures({
          module: this.moduleIdx,
          catalog: this.module
        })
        this.procedures = response.data.data.map((d,i)=>{
          d.idx = i
          return d; 
        })
        if (!this.selectedProcedure.name){
          this.selectedProcedure = this.procedures[0]
        }
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async start_procedure(name, services){
      this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  "Sent Procedure job to run..."
      })
      const $this = this;
      console.log(this.module, this.moduleIdx, this.selectedProcedure.idx, $this.selectedProcedure.services)
      await FileService.startProcedure({
        procedure: $this.selectedProcedure.idx, 
        module: $this.moduleIdx,
        catalog: $this.module,
        variables: $this.selectedProcedure.services.map((d)=>{
          if (!d.variables){
            return {}
          } else {
            return d.variables
          }
        })
      }).then((response)=>{
			  this.count +=1
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
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
      serviceStatus: [],
      serviceTab: 0,
      procedures: [],
      selectedProcedure: {},
      logdialog: false,
      factory: {

        'string': "String",
        "file": "File",
        "list": "List",
        "configuration-file": "ConfigurationFile", 
        "render": "Render"

      },

      interval: null,
      count:0,
      tab:1,
      shared: [],
      status: {},
      tabService: 0,
    }
  },
  props: [  'module', 'moduleIdx' ],
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
    selectedService(){
      console.log(this.selectedProcedure.services[this.tabService], this.tabService)
      return this.selectedProcedure.services[this.tabService]
    }
  },
  mounted(){
    const $this = this;
    $this.getStatus()
    this.interval = setInterval(()=>{
      $this.getStatus()
    }, 3200)
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