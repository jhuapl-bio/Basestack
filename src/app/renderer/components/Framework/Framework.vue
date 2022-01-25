<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="framework"  >
    <v-card
      color="grey lighten-4"
      flat
      class="pb-2"
      tile
    >
    <v-toolbar  collapsed dense right>
      <v-toolbar-title class="header header-minor"  color="primary">{{ ( procedure  ? procedure.title : procedureKey  ) }}</v-toolbar-title>
      <v-tooltip bottom v-if="procedure.hint">
        <template v-slot:activator="{ on }">
          <v-app-bar-nav-icon v-on="on"> <v-icon v-on="on" small color="orange darken-1">$question-circle</v-icon>
          </v-app-bar-nav-icon>
        </template>
        {{procedure.hint}}
      </v-tooltip>
      <v-spacer vertical></v-spacer>
      <v-btn   small color="primary"  v-if="status"
        class="mr-2"
        @click="start_procedure(procedure.name)"><v-icon class="mr-2" x-small >$play-circle</v-icon> Start 
      </v-btn>
      <v-btn  color="light" small v-if="status.running"
        class="mr-2"
        @click="cancel_procedure(procedure.name)"><v-icon class="mr-2" x-small>$times</v-icon> Cancel
      </v-btn>
       <v-btn csmall v-if="procedure.custom" x-small color="orange darken-2"
        class="mr-2"
        @click="rm_procedure(procedure.name)"><v-icon class="mr-2" x-small>$times-circle</v-icon> Remove
      </v-btn>
    </v-toolbar>
    </v-card>
   
    <v-row >
      <v-divider
      vertical
      ></v-divider>
     <v-col cols="12"  class="" >
      <v-container
        fluid
        class="d-flex flex-row align-start pa-0 align-stretch"
      >
      <v-navigation-drawer
        v-model="drawer"
        permanent
        :mini-variant.sync="mini"
        expand-on-hover
        left
      >
        <v-list small dense>
        <!-- <v-text-field class="ml-2 mr-5" disabled  label="Procedure" persistent-hint hint="View Services Individually"></v-text-field> -->
        <!-- <v-list-item
          class="entry"
          
        >
          
          <v-list-item-content>
            <v-list-item-title v-text="'Total Services'"></v-list-item-title>
            <v-list-item-subtitle v-text="Object.keys(services).length"></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item> -->
        <v-list-item class="px-2">
          <v-list-item-avatar>
            <v-icon x-small color="primary">{{ ( procedure.icon  ? '$' + procedure.icon : 'cog' ) }}</v-icon>
          </v-list-item-avatar>
          <v-list-item-title>{{ ( procedure  ? procedure.title : procedureKey  ) }}</v-list-item-title>

          <v-btn
            icon
            @click.stop="mini = !mini"
          >
            <v-icon x-small>$chevron-left</v-icon>
          </v-btn>
        </v-list-item>
        <v-list-item class="px-2"
        >
            <v-list-item-avatar  v-if="procedure.status.running ">
              <v-tooltip right>
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
                  <v-icon v-on="on" x-small color="orange darken-2">$times-circle</v-icon>
                </template>
                Not Running
              </v-tooltip>
            </v-list-item-avatar>
            <v-list-item-content>
              <v-list-item-title v-text="'Status'"></v-list-item-title>
            </v-list-item-content>
            
        </v-list-item>
        <v-spacer></v-spacer>
        <v-divider></v-divider>
        <v-spacer></v-spacer>
        <v-list-item-group
          color="primary" class="px-2"
        >
          <v-list-item
            @click="tabService = serviceKey"
            v-for="(service, serviceKey) of status.services"  :key="serviceKey"
          >
            <v-list-item-icon class="mr-0 pr-0" >
              <v-tooltip right v-if="service.status.running ">
                <template v-slot:activator="{ on }">
                <div v-on="on">
                    <fulfilling-bouncing-circle-spinner
                    :animation-duration="3000"
                    :size="10"
                    style="margin-left:0%;"
                    :color="'#2b57b9'"
                  />
                </div>
                </template>
                Running
              </v-tooltip>
              <v-tooltip right v-else-if="service.status.error ">
                <template v-slot:activator="{ on }">
                  <v-icon v-on="on" x-small color="orange darken-2">$exclamation-triangle</v-icon>
                </template>
                {{service.status.error}}
              </v-tooltip>
              <small v-else>{{serviceKey+1}}.</small>
            </v-list-item-icon>
            <v-list-item-content >
              <v-list-item-title >
                {{ service.label }}
              </v-list-item-title>
              <div  style="justify-content: space-between; display:flex" class=""   >
                
                  <v-tooltip  v-if="!'runnable' in service || 'runnable' in service && service.runnable" right >
                    <template  v-slot:activator="{ on }">
                      <v-icon  v-on="on" x-small :class="[  'configure']"  color="primary"
                            @click="runServiceIndividually(service.name, serviceKey)"
                            :title = "'Run Service Individually'"
                            icon="play-circle" 
                      >$play-circle</v-icon> 
                    </template>
                    Run the service individually
                  </v-tooltip>
                  <v-tooltip v-else right >
                    <template  v-slot:activator="{ on }">
                      <v-icon  v-on="on" x-small :class="[  ]"  color="error"
                        icon="play-circle" 
                      >$exclamation-triangle</v-icon>
                    </template>
                    Not runnable due to one or more dependencies not installed or running
                  </v-tooltip>  
                <v-tooltip  right >
                  <template  v-slot:activator="{ on }">
                    <v-icon v-on="on" x-small
                      @click="cancelServiceIndividually(service.name)"
                      color="error "
                      :class="[  'configure',  ]" 
                      align-self="end" 
                      icon="times" >$times</v-icon>  
                  </template>
                  Cancel the service
                </v-tooltip>      
              </div>
            </v-list-item-content>
            
            <v-list-item-icon>
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
              </v-list-item-icon>
              <!-- <v-divider vertical></v-divider>  -->

            </v-list-item>
          </v-list-item-group>
           <v-list-item class="px-2">
              <!-- <v-subheader centered v-text="'Tags'">

              </v-subheader> -->
              <v-list-item-avatar>
                <v-icon x-small>
                  $tags
                </v-icon>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-chip   v-for="(tag, tagKey) of procedure.tags"  :key="tagKey" x-small dense>
                  {{tag}}
                </v-chip>
              </v-list-item-content>

          </v-list-item>
          <v-list-item  class="px-2" >
            <!-- <v-subheader centered v-text="'Logs'"></v-subheader> -->
            <v-list-item-avatar>
              <v-icon color="primary" x-small>
                $comment
              </v-icon>
            </v-list-item-avatar>
            <v-list-item-content>
              <div v-if="status && status.stream" >
                  <p class="entry-label" style="font-size: 120%">Logs</p>
                  <LogWindow :info="status.stream.info"></LogWindow>
              </div>  
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-carousel
          height="100%" 
          v-model="tabService"
          v-if="status.services"
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
            v-for="(service, serviceKey) of status.services"  
            :key="serviceKey" class="elevation-6 " 
            :hidden="service.orchestrator"
          >
            <v-sheet
              height="100%"
              width="100%"

              
              
              class="elevation-6 pl-24 ml-24"
            >
                <Service  
                  :ref="service.name"
                  @sendStatus="sendStatus" 
                  @updateValue="updateValue" 
                  :name="service.name" 
                  :serviceIdx="serviceKey"
                  :procedure="procedureKey" style="height: 100%; overflow-y:auto" >
                </Service>
              
            </v-sheet>
        </v-carousel-item>
      </v-carousel>
      </v-container>
     
      </v-col>
      </v-row>
    
     

  </div>
</template>

<script>

import Service from '@/components/Framework/Service.vue';

import FileService from '@/services/File-service.js'
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
export default {
	name: 'framework',
  components:{
    Service,
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
      // console.log(event)
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
    async cancel_procedure(procedureKey){
      await FileService.cancelProcedure({
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
        let response = await FileService.getStatusProcedure(this.procedureKey)
        this.status = response.data.data
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
      await FileService.startProcedure({
        procedure: name, 
        services: this.services
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
          console.log(this.status)
          if (target in this.status.services){
            console.log(type, target)

          }

        })
      }
      return returnVal
    }
	},
  data(){
    return{
      drawer: true,
      mini: true,
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
  props: [ 'services', 'moduleIdx', "procedureKey" , "procedure" ],
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
    }
  },
  mounted(){
    const $this = this;
    $this.getStatus()
    this.interval = setInterval(()=>{
      $this.getStatus()
    }, 2000)
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