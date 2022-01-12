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
    <v-row>
    <v-col align-self="start" >
      <h5 class="header header-minor" >
        {{ ( procedure  ? procedure.title : procedureKey  ) }}
        <span v-if="procedure.tooltip" 
          style="" >
          <font-awesome-icon class="help" icon="question-circle"  />
        </span>
      </h5>
    </v-col>
    <v-col  align-self="end" >
      <v-btn class="btn sideButton"   v-if="status"
        style=""
        @click="start_procedure(procedure.name)">Start Procedure 
      </v-btn>
    </v-col>
    <v-col   align-self="end">
      <v-btn class="btn warnButton "  v-if="status"
        style=""
        @click="cancel_procedure(procedure.name)">Cancel Procedure 
      </v-btn>
    </v-col>
    <v-col align-self="end" v-if="procedure.custom">
      <v-btn class="btn " variant="warn" 
        style=""
        @click="rm_procedure(procedure.name)">Remove Custom Procedure
      </v-btn>
    </v-col>
    </v-row>
    <v-row>
    <v-col cols="3" >
      <v-list >
          <v-list-item
            class="entry"
          >
            
            <v-list-item-content>
              <v-list-item-title v-text="'Total Services'"></v-list-item-title>
              <v-list-item-subtitle v-text="Object.keys(services).length"></v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
          <v-list-item
            class="entry"
          >
              <v-list-item-content>
                <v-list-item-title v-text="'Status'"></v-list-item-title>
                
              </v-list-item-content>
              <v-list-item-icon v-if="procedure.status.running ">
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                  <div v-on="on">
                      <fulfilling-bouncing-circle-spinner 
                        :animation-duration="3500"
                        :size="10"
                        :color="'#2b57b9'"
                      />
                  </div>
                  </template>
                  Running
                </v-tooltip>
              </v-list-item-icon>
              <v-list-item-icon v-else> 
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" x-small color="orange darken-2">$times-circle</v-icon>
                  </template>
                  Not Running
                </v-tooltip>
              </v-list-item-icon>
              
          </v-list-item>
          <v-list-item
            class="entry"
            style="font-size: 0.8em" 
            v-for="(service, serviceKey) of status.services"  :key="serviceKey"
          >
            
            <v-list-item-content>
              <v-list-item-title v-text="service.label">
              </v-list-item-title>
              <v-card  :title="`Running: ${service.status.running}`" align-self="start" style="display:flex">
                <v-icon x-small :class="[ 'fa-1x', 'configure']" 
                      @click="runServiceIndividually(service.name)"
                      :title = "'Run Service Individually'"
                      icon="play-circle" 
                >$play-circle</v-icon>  
                <v-icon  x-small
                  @click="cancelServiceIndividually(service.name)"
                  :title = "'Cancel Running Service'"
                  :class="[ 'fa-1x', 'configure', ]"  
                  icon="times" >$times</v-icon>        
              </v-card>
            </v-list-item-content>
            <v-list-item-icon v-if="procedure.status.running ">
                <v-tooltip right>
                  <template v-slot:activator="{ on }">
                  <div v-on="on">
                      <fulfilling-bouncing-circle-spinner
                      :animation-duration="4000"
                      :size="10"
                      style="margin-left:2%;"
                      v-if="service.status.running "
                      :color="'#2b57b9'"
                    />
                  </div>
                  </template>
                  Running
                </v-tooltip>
              </v-list-item-icon>
          </v-list-item>
      </v-list>
      <!-- <v-card class="m-0 p-0">
          <p>
            Total Services: {{ Object.keys(services).length }}
          </p>
          <span style="display:flex;"  >Running
            <fulfilling-bouncing-circle-spinner
              :animation-duration="4000"
              :size="10"
              style="margin-left:1%;"
              v-if="status.running "
              :color="'#2b57b9'"
            />
            <font-awesome-icon style="margin-left:1%; font-size: 70%" :class="[ 'fa-1x', 'text-warning' ]" 
                v-else
                icon="times-circle" 
            />
            </span>
          
          <hr>
          <v-row  style="font-size: 0.8em" v-for="(service, serviceKey) of status.services"  :key="serviceKey">
          <v-col  :title="`Running: ${service.status.running}`" align-self="start">
            <span style="display:flex" >{{service.label ? service.label : serviceKey }}
              <fulfilling-bouncing-circle-spinner
                  :animation-duration="4000"
                  :size="10"
                  style="margin-left:2%;"
                  v-if="service.status.running "
                  :color="'#2b57b9'"
                />
            </span>         
          </v-col> 
          <v-col class="m-0" align-h="stretch" align-self="start">
              <font-awesome-icon style="" :class="[ 'fa-1x', 'configure']" 
                  @click="runServiceIndividually(service.name)"
                  :title = "'Run Service Individually'"
                  icon="play-circle" 
              />

          </v-col>
          <v-col class="m-0" align-h="stretch" align-self="start" v-if="service.status.running || service.status.exists" >
              <font-awesome-icon  
                @click="cancelServiceIndividually(service.name)"
                  :title = "'Cancel Running Service'"
                :class="[ 'fa-1x', 'configure', ]"  
                icon="times" />
          </v-col>
        </v-row>

      </v-card> -->
    </v-col>
     <v-col  cols="9" class="" style="">
     <div class="box" v-for="(service, serviceKey) of status.services" :title="serviceKey" :key="serviceKey">
        <Service  
          :ref="service.name"
          @sendStatus="sendStatus" 
          @updateValue="updateValue" 
          :name="service.name" 
          :serviceIdx="serviceKey"
          :procedure="procedureKey" >
        </Service>
      </div>
      <!-- <div class="box" v-for="[serviceIdx, service] of Object.entries(services)" :title="service.label" :key="serviceIdx"> -->
      <!-- <v-tab  v-for="[serviceIdx, service] of Object.entries(services)" :title="service.label" :key="serviceIdx"> -->
          <!-- <template #title   style="4.5s linear infinite spinner-grow !important">
            <v-spinner v-if="status && status[serviceIdx] && status[serviceIdx].exists.running" type="grow"  variant="info"  small ></v-spinner>
            <span class="">{{service.label}}</span>
        </template> -->
        

      <!-- </v-tab> -->
      <!-- <template v-slot:tabs-end > -->
      <!-- </div> -->
      </v-col>
      </v-row>
      <!-- </template> -->
    <!-- </v-tabs> -->
    
     

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
    runServiceIndividually(key){
      // console.log(key)
      let ref  = this.$refs[key]
      ref[0].start_service()


    },
    cancelServiceIndividually(key){
      console.log(key)
      let ref  = this.$refs[key]
      ref[0].cancel_service()

    },
    updateValue(event){
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
      console.log(services, this.name)
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
	},
  data(){
    return{
      factory: {

        'string': "String",
        "file": "File",
        "list": "List",
        "configuration-file": "File",
        "render": "Render"

      },
      interval: null,
      count:0,
      tab:0,
      shared: [],
      status: {},
      tabService: 2,
    }
  },
  props: [ 'services', 'moduleIdx', "procedureKey" , "procedure" ],
  computed: {
    
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
</style>