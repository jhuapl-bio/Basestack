<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="framework" v-if="workflows">
    <b-tabs
      v-model="tab" 
      style="" 
    >
      <b-tab v-for="(value, workflowIdx) in workflows" :key="workflowIdx">
        <b-tabs
          v-model="tabService" 
  
        >
        <b-tab  v-for="(service, serviceIdx) in value.services" :title="service.label" :key="serviceIdx">
          <Service :serviceIdx="serviceIdx" :service="service" :workflowIdx="workflowIdx" :moduleIdx="moduleIdx"></Service>
        </b-tab>
      </b-tabs>
        
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>

import Service from '@/components/Framework/Service.vue';

import FileService from '@/services/File-service.js'

export default {
	name: 'framework',
  components:{
    Service
  },
  methods: {
    
		yes(event, arts){
      console.log(event, arts, "yes")
    },
    async cancel_module(workflowIdx, serviceIdx, service){
      console.log(service, workflowIdx, serviceIdx, this.moduleIdx)
      await FileService.cancelModule({
        module: this.moduleIdx,
        workflow: workflowIdx,
        service: serviceIdx,
        variables: service.variables
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
    async start_module(workflowIdx, serviceIdx, service){
      console.log(service, workflowIdx, serviceIdx, service.variables[0].target)
      await FileService.startModule({
        module: this.moduleIdx,
        workflow: workflowIdx,
        service: serviceIdx,
        variables: service.variables
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
        "render": "Render"

      },
      count:0,
      tab:1,
      tabService: 2,
    }
  },
  props: [ 'workflows', 'moduleIdx' ],
  computed: {
   
  },
  mounted(){


  },
  
    
};
</script>

<style>
</style>