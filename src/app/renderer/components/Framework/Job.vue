
<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card id="job"  >
    <v-stepper  v-model="el" v-if="services" >
        <v-stepper-header
            class="configure"
        >
            <template v-for="(entry, key) in services"  >
                <v-stepper-step
                    :complete="(status[key] ? status[key].success : false)"
                    :key="key+'-entry'"
                    complete-icon="$check"
                    :rules="[()=>{
                        return (status[key] && status[key].error ? !status[key].error : true) 
                    }]"
                    error-icon="$times-circle"
                    @click="el = key+1"
                    :step="key+1"
                >
                    {{ ( entry.label ? entry.label : entry.name ) }}
                    <v-tooltip top v-if="status && status[key] && status[key].error">
                        <template v-slot:activator="{ on }">
                            <v-icon v-on="on" small color="orange darken-2">
                                $exclamation-triangle
                            </v-icon>
                        </template>
                        {{status[key].error}}
                    </v-tooltip>
                </v-stepper-step>
                <v-divider
                    v-if="key !== services.length - 1"
                    :key="key"
                ></v-divider>
            </template>
        </v-stepper-header>
        <v-stepper-items v-if="services">
            <v-stepper-content
                v-for="(entry, key) in services" :key="entry.name+`content`" 
                :step="key+1"
            >
                <LogWindow  v-if="status && status[key]" :info="status[key].stream.info" :key="entry.name"></LogWindow> 
            </v-stepper-content>
        </v-stepper-items>
    </v-stepper>    
    <v-card v-if="procedure && procedure.variables">
        <ListParams
            :items="additionals"
            v-if="additionals.length > 0"
            :defaultHeaders="headers"
            @updateValue="updateValue"

        >
        </ListParams>
        <Progresses
            :progresses="watches"
            v-if="headers.length > 0 && procedure "
            :status="status"
            :defaultHeaders="outputHeaders"
        >
        </Progresses>
    </v-card>

  </v-card>
</template>

<script>
import FileService from '@/services/File-service.js'
import ListParams  from '@/components/Framework/Mods/ListParams.vue';
import Progresses  from '@/components/Framework/Progresses.vue';

import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'

export default {
  name: 'job',
  beforeDestroy: function(){
   
  },
  components:{
   LogWindow,
   ListParams,
   Progresses,
   LoopingRhombusesSpinner,
   FulfillingBouncingCircleSpinner
  },
  methods: {
      
    async cancel_procedure(procedureKey){
      const $this = this
      console.log("cancel job")
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
      console.log("yes")
      await FileService.startJob({
        procedure: $this.procedureIdx, 
        module: $this.moduleIdx,
        catalog: $this.module,
        token: $this.$store.token,
        variables: $this.procedure.variables
      }).then((response)=>{
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
    updateValue(value){
      let src = value.src
      console.log(value, this.service)
      let variable = this.procedure.variables[value.variable]
      if (value.option){
        variable.option = src
      } else {
        variable.source  = src
      }
      const $this = this
      try{
        FileService.updateVariableJob({
          module: this.moduleIdx,
          procedure: this.procedureIdx,
          catalog: this.module,
          value: value.src, 
          target: (value.option  ? "option" : "source"),
          variable: value.variable,
        }).then((response)=>{
        })
      } catch(err){
        console.error(err,"<<<<< error in caching update")
      } 
      

    },
    async getProcedure(){
      const $this = this
      try{
        let response = await FileService.getJobStaged({
          module: this.moduleIdx,
          procedure: this.procedureIdx,
          catalog: this.module
        })
        this.procedure = response.data.data
        this.services = this.procedure.services
        // this.el = 1
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
        services: null,
        procedure: null,
        outputHeaders: [
            {
                text: "label",
                value: "label",
                sortable: true,
                align:"center"
            },
            {
                text: "Status",
                value: "element",
                sortable: false,
                align:"center"
            },
        ],
        headers: [
            // {
            //   text: "Actions",
            //   value: "actions",
            //   sortable: true
            // },
            {
                text: "Param",
                value: "label",
                sortable: true,
                align:"center"                
            },
            // {
            //   text: "Bind",
            //   value: "bind",
            //   sortable: true
            // },
            {
                text: "Source",
                value: "source",
                align:"center"  ,              
                sortable: false
            },
            // {
            //   text: "Target",
            //   value: "target",
            //   sortable: false
            // },
            {
              text: "Type",
              align:"center"  ,              
              value: "element",
              sortable: false
            },
            // {
            //   text: "Status",
            //   value: "status",
            //   sortable: false
            // }
        ],

     
    }
  },
  props: [ 'module', 'moduleIdx', 'procedureIdx', 'title', 'status' ,'watches' ],
  watch: {
    procedureIdx(newValue){
        console.log("new procedure")
        this.getProcedure()
    },
    job(newValue){
        console.log(newValue, "<<<")
    }
  },
  computed: {
    statuses(){
        return this.status.services
    },
    // watches(){
    //     let ta= []
    //     if (this.status && this.status.watches){
    //         this.status.watches.forEach((value)=>{
    //             if (value.output){
    //                 // value.name = key
    //                 ta.push(value)

    //             }

    //         })
    //     }
    //     console.log(this.status,"status")
    //     return ta
    // },
    additionals(){
        let ta= []
        if (this.procedure && this.procedure.variables){
            for (let [key, value ] of Object.entries(this.procedure.variables)){
                if (!value.output){
                    value.name = key
                    ta.push(value)

                }
            }
        }
        return ta
            
    }
        
  },
  mounted(){
    const $this = this
   
    this.getProcedure()
    

  },
  
    
};
</script>

<style>
#service{
  overflow-y: auto;
  width: 100%;
}
</style>