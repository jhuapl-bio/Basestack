
<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="service" v-if="status">
    <span 
            class="center-align-icon configure"
            v-if="!status.running"
            @click="start_module(workflowIdx, serviceIdx, service)"> Start Module
        <font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
        </span>
        <span v-b-tooltip.hover.top
            v-else 
            class="center-align-icon configure"
            @click="cancel_module(workflowIdx, serviceIdx, service)" > Cancel Module
        <font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
        </span>
        <b-row v-if="service.variables">
            <b-col :sm="( variable.col ? variable.col : 12 )" v-for="(variable, index3) in service.variables" :key="index3">
            <b-form-group :label="variable.label" class="column is-narrow">
                <div  v-if="!variable.options">
                <component
                    :is="factory[variable.element]"
                    :source="variable"
                    :status="status"
                    :service="service"
                    :count="count"
                    @updateValue="updateValue($event, variable)"
                    >
                </component>
                </div>
                <div v-else >
                    <b-select
                        v-model="variable.option"
                        text-field="name"
                    >
                        <option v-for="(value, index3) in variable.options" :value="index3" :key="index3">{{ value.name }}</option>
                    </b-select>
                        <component
                            :is="factory[variable.options[variable.option].element]"
                            :source="variable.options[variable.option]"
                            :status="status"
                            :service="service"
                            @updateValue="updateValue($event, variable.options[variable.option])"
                        >
                        </component>
                        <hr>
                </div>
            </b-form-group>
            </b-col>
        </b-row>
        <hr>
        <b-row>
            <Progresses
                v-if="service.progress"
                :progresses="progresses"
            ></Progresses><br>
           
        </b-row>
        <b-row>
             <b-button
                v-if="service.progress"
                @click="getServiceProgress">Get Progress
            </b-button>
        </b-row>
  </div>
</template>

<script>
import String from '@/components/Framework/Mods/String.vue';
import File from '@/components/Framework/Mods/File.vue';
import Dir from '@/components/Framework/Mods/Dir.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import FileService from '@/services/File-service.js'
import Progresses from '@/components/Framework/Progresses.vue'

export default {
	name: 'framework',
  components:{
    File,
    Render,
    Dir,
    String,
    Progresses
  },
  methods: {
    getServiceProgress(){
        const $this =this
        FileService.getServiceProgress({
            workflow: $this.workflowIdx,
            module: $this.moduleIdx,
            service: $this.serviceIdx,
            variables: this.service.variables
        }).then((response)=>{
            $this.progresses =  response.data.data
        }).catch((err)=>{
            console.error(err)
        })
    },
    updateValue(value, src){
      src.source = value
      const $this = this
      if (!this.intervalProgress){
          try{
              this.intervalProgress = true
              if ($this.service.progress){
                  $this.getServiceProgress()
              }
          } catch (err){
              console.error(err)
          } finally{
              this.intervalProgress = false
          }
      }
    },
    async getStatus(){
        const $this = this
      	try{
	      	let response = await FileService.getWorkflowStatus({
                  workflow: $this.workflowIdx,
                  module: $this.moduleIdx,
                  service: $this.serviceIdx
            })
			// this.modulesInner = response.data.data
            this.status = response.data.data
			// await this.$store.dispatch("UPDATESYSTEM", response.data.data.system)
			// await this.$store.dispatch("UPDATEMETA", response.data.data.meta)
			// await this.$store.dispatch("UPDATESTATUS", response.data.data.status.status)
			// this.system = response.data.data.system
			// this.status = response.data.data.status.status
			
			
		} catch(err){
			this.initial=false
			console.error(`${err} error in getting status`)
		} finally {
			this.intervalChecking = false
		}
    },
    async cancel_module(workflowIdx, serviceIdx){
      console.log(this.service.variables, workflowIdx, serviceIdx, this.moduleIdx)
      await FileService.cancelModule({
        module: this.moduleIdx,
        workflow: workflowIdx,
        service: serviceIdx,
        variables: this.service.variables
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
      console.log(this.service.variables, workflowIdx, serviceIdx)
      await FileService.startModule({
        module: this.moduleIdx,
        workflow: workflowIdx,
        service: serviceIdx,
        variables: this.service.variables
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
        "render": "Render",
        "dir": "Dir"

      },
      intervalProgress: false,
      count:0,
      intervalChecking:false,
      tab:0,
      status: null,
      progresses: [],
      tabService: 2,
    }
  },
  props: [ 'moduleIdx', 'workflowIdx', 'serviceIdx', 'service' ],
  computed: {
   
  },
  mounted(){
    console.log("mounted component")
    const $this = this
    this.getStatus().then(()=>{
        this.started = true
        this.interval = setInterval(()=>{
            if (!this.intervalChecking){
                $this.getStatus()
            }
        }, 2500)
    })

  },
  
    
};
</script>

<style>
</style>