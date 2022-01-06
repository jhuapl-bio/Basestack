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
    <!-- <b-col sm="3" >
      <b-row no-gutters class="text-center"  style="align-items: center;
    justify-content: center;" v-for="[serviceIdx, service] of Object.entries(services)" :title="service.label" :key="serviceIdx">
        <b-col xs="6" class="text-center" style="align-items: center;
            justify-content: center;">
            <hr>
            <span style="font-size: 0.7vw !important;  align-items: center;
              justify-content: center;">{{service.label}}
            </span>
            <hr>
        </b-col>
        <b-col xs="6" class="text-center" >
          <div style="float:right !important">
            <b-spinner v-if="status && status[serviceIdx] && status[serviceIdx].exists.running" type="grow"  variant="info"  ></b-spinner>
            <b-icon v-else-if="status  && status[serviceIdx] && status[serviceIdx].exists.exists && !status[serviceIdx].exists.running" variant="info" icon="circle-fill"></b-icon>
            <b-icon v-else variant="info" icon="circle"></b-icon>
            <br>
            <b-icon  variant="info" icon="caret-down-fill"></b-icon>
          </div>
        </b-col>


      </b-row>
      <b-button class="btn"  variant="info"
          style="bottom: 0; position:absolute;"
          @click="start_procedure(procedureIdx)">Start Procedure 
       
      </b-button>

    </b-col>
    <b-col sm="9" style="max-height: 100vh !important; overflow:auto">
      <div v-for="[serviceIdx, service] of Object.entries(services)" :title="service.label" :key="serviceIdx">
        <Service  
          @sendStatus="sendStatus" 
          @updateValue="updateValue" 
          :serviceIdx="serviceIdx" 
          :procedureIdx="procedureIdx" 
          :name="serviceIdx"
          :service="service" 
          :moduleIdx="moduleIdx">
        </Service>
        <hr>
      </div>
    </b-col> -->
    <b-tabs
      v-model="tab" 
      nav-wrapper-class="w-3 " 
      left 
    >
      <b-tab  v-for="[serviceIdx, service] of Object.entries(services)" :title="service.label" :key="serviceIdx">
          <template #title   style="4.5s linear infinite spinner-grow !important">
            <b-spinner v-if="status && status[serviceIdx] && status[serviceIdx].exists.running" type="grow"  variant="info"  small ></b-spinner>
            <span class="">{{service.label}}</span>
        </template>
        <Service  
          @sendStatus="sendStatus" 
          @updateValue="updateValue" 
          :serviceIdx="serviceIdx" 
          :procedureIdx="procedureIdx" 
          :name="serviceIdx"
          :service="service" 
          :moduleIdx="moduleIdx">
        </Service>

      </b-tab>
      <template v-slot:tabs-end >
         <b-button class="btn sideButton"  v-if="status"
          style="right:0;"
          @click="start_procedure(procedure.name)">Start Procedure 
        </b-button>
        <b-button class="btn " variant="warn" v-if="procedure.custom"
          style="right:0;"
          @click="rm_procedure(procedure.name)">Remove Custom Procedure
        </b-button>
      </template>
    </b-tabs>
    
     

  </div>
</template>

<script>

import Service from '@/components/Framework/Service.vue';

import FileService from '@/services/File-service.js'

export default {
	name: 'framework',
  components:{
    Service,
  },
  methods: {
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
      // this.statuses[event.service] = event.status.exists
    },
    async rm_procedure(procedureIdx){
      await FileService.rmProcedure({
        procedure: procedureIdx
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
    async cancel_procedure(procedureIdx){
      await FileService.cancelProcedure({
        procedure: procedureIdx
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
        let response = await FileService.getProceduresStatusSelect({
              procedure: $this.procedureIdx
          })
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
      count:0,
      tab:0,
      shared: [],
      status: {},
      tabService: 2,
    }
  },
  props: [ 'services', 'moduleIdx', "procedureIdx" , "procedure" ],
  computed: {
    
  },
  mounted(){
    const $this = this;
    // setInterval(()=>{
    //   $this.getStatus()
    // }, 2000)
  },
  
    
};
</script>

<style>
</style>