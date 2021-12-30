
<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>

  <div id="service">
    <div  v-if="status && status.exists" class="wb-100 p-3 mb-1 outer-entry-right">
        <span 
            class="center-align-icon configure"
            v-if="!status.exists.running"
            @click="start_service(service)"> Start Service
        <font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
        </span>
        <span v-b-tooltip.hover.top
            v-else 
            class="center-align-icon configure"
            @click="cancel_service(name)" > Cancel Service
        <font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
        <span class="center-align-icon" style="float:middle; display:flex" v-tooltip="{
              content: 'Running',
              placement: 'top',
              classes: ['info'],
              trigger: 'hover',
              targetClasses: ['it-has-a-tooltip'],
              }">
        </span>        
        <looping-rhombuses-spinner
              :animation-duration="4000"
              :size="10"
              v-if="!service.hideStatus"
              style="margin: auto"
              :color="'#2b57b9'"
          />
        </span>
    </div>
    <div v-if="service.variables"  style="display:flex; width:100%" class=" ">
        <div  v-for="(variable, index3) in service.variables" :key="index3" :class="getClass(variable.class, variable.element)" >
            <label class="entry-label">{{variable.label}}</label>
            <div v-if="!variable.options"  class="entry from-group">
              <component
                  :is="factory[variable.element]"
                  :source="variable"
                  :status="status"
                  :service="service"
                  :count="count"
                  @updateValue="updateValue($event, variable)"
                  >
              </component>
              <div class="error" v-if="!variable.source">Field is required</div>

            </div>
            <div v-else  class="entry from-group">
              <multiselect 
                  v-model="variable.option" 
                  :options="variable.options.map((d,i)=>{ return i})" 
                  :searchable="false" 
                  @input="updateValue($event, variable.options[variable.option])"
                  :preselect-first="true"
                  :close-on-select="true" 
                  :allow-empty="false"
                  :show-labels="false" 
                  placeholder="Pick a db">
                      <template slot="singleLabel" 
                        slot-scope="{ option }"><strong>{{ variable.options[option].name }}</strong>
                      </template>
                      <template slot="option" 
                        slot-scope="{ option }"><strong>{{ variable.options[option].name }}</strong>
                      </template>
              </multiselect>
                <component
                    v-if="variable.option"
                    :is="variable.option.element"
                    :source="variable.option"
                    :status="status"
                    :service="service"
                    @updateValue="updateValue($event, variable.option)"
                >
                </component> 
                <div class="error" v-if="variable.option && !variable.options[variable.option].source">Field is required</div>

            </div>
        </div> 
    </div>
    <div class="w-100 p-3 mb-1">
        <!-- <Progresses
            v-if="service.progress"
            :progresses="progresses"
            :running="status.exists.running"
        ></Progresses> -->
    </div>
    <div v-if="status && status.stream" class="w-100 p-3 mb-1">
        <p class="entry-label" style="font-size: 120%">Logs</p>
        <LogWindow :info="status.stream.info"></LogWindow>
    </div>    
  </div>
</template>

<script>
import String from '@/components/Framework/Mods/String.vue';
import File from '@/components/Framework/Mods/File.vue';
import Dir from '@/components/Framework/Mods/Dir.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import FileService from '@/services/File-service.js'
import Progresses from '@/components/Framework/Progresses.vue'
import {LoopingRhombusesSpinner} from 'epic-spinners'
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import Multiselect from 'vue-multiselect'



export default {
	name: 'framework',

  components:{
    File,
    Render,
    Dir,
    String,
 		LoopingRhombusesSpinner,
    Progresses,
    LogWindow,
    Multiselect
  },
  methods: {
    getServiceProgress(){
        const $this =this
        $this.progressChecking = true
        FileService.getServiceProgress({
            workflow: $this.workflowIdx,
            module: $this.moduleIdx,
            service: $this.serviceIdx,
            variables: this.service.variables
        }).then((response)=>{
            $this.progresses =  response.data.data
            $this.progressChecking = false
        }).catch((err)=>{
            console.error(err)
            $this.progressChecking = false
        })
    },
    getClass(val, type){
      if (val){
        return val
      } else{
        if (type !== 'render'){
          return "w-50 p-3 mb-1"
        } else {
          return "w-100 "
        }
      }
    },
    updateValue(value, src){
      src.source = value
      const $this = this
      if (!this.intervalProgress){
          try{
              this.intervalProgress = true
              if ($this.service.progress){
                if ($this.intervalProgress){
                  try{
                    clearInterval($this.intervalProgress)
                  } catch(err){
                    console.error(err)
                  }
                }
                if  ($this.progresses.filter((d)=>{return d != 1}).length > 1 ){
                  clearInterval($this.intervalProgress)
                } 
                else {
                  $this.progressChecking = false
                  $this.getServiceProgress()
                  $this.intervalProgress = setInterval(()=>{
                    if (!$this.progressChecking){
                      $this.getServiceProgress()
                    }
                  }, 3000)
                }
              }
          }
          catch (err){
              console.error(err)
          } finally{
              this.intervalProgress = false
              this.$emit("updateValue", { src: src, name: $this.name, target: value }   )
          }
      }
    },
    async getStatus(){
      const $this = this
      try{
        let response = await FileService.getServiceStatus({
              service: $this.name
          })
          this.status = response.data.data
          this.$emit("sendStatus", { status: this.status, service: $this.serviceIdx, procedure: $this.procedureIdx } )			
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async cancel_service(name){
      // console.log(this.service.variables, workflowIdx, serviceIdx, this.moduleIdx)
      await FileService.cancelService({
        service: name
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
    // checkError(){
    //   //First, check if all variables have been assigned otherwise call error
    //   let errors = { 'variables': [], called: true }
    //   let warnings = { 'variables': [], called: false }
    //   if (this.service.variables){
    //     this.services.variables.forEach((variable)=>{
    //       if (!variable.source || variable.source === ''){
    //         errors
    //       }
    //     })
    //   }
    // },
    async start_service( service){
      // this.checkError()
      await FileService.startService({
        service: this.name, 
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
      progressChecking: false,
      count:0,
      intervalChecking:false,
      tab:0,
      status: {},
      progresses: [],
      tabService: 2,
    }
  },
  props: [ 'moduleIdx', 'serviceIdx', 'service', 'procedureIdx', "name" ],
  computed: {
   
  },
  mounted(){
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