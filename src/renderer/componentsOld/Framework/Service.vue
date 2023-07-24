
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
  <v-toolbar dense dark >
      <v-toolbar-title class="white--text text-center ">{{service.label}}</v-toolbar-title>
      <div v-if="status.running">
        <!-- <looping-rhombuses-spinner  
          :animation-duration="6000" 
          :size="6" class="ml-3"
          :color="'white'"
        /> -->
      </div>
      <div v-else-if="status.error">
        <v-tooltip bottom>
          <template v-slot:activator="{ on }">
            <v-icon v-on="on" color="orange darken-2"  class="ml-3"  small >$exclamation-triangle</v-icon>
          </template>
          Error in running procedure, check logs
        </v-tooltip>
      </div>
      <v-spacer></v-spacer>
      <v-tooltip top>
        <template v-slot:activator="{ on }">
          <v-icon class="mx-4" v-on="on" @click="start_service()" medium >$play-circle</v-icon> 
        </template>
        Run Service Individually
      </v-tooltip>
      <v-tooltip top v-if="status.running">
        <template v-slot:activator="{ on }">
          <v-icon class="mx-4"  v-on="on"  @click="cancel_service()" color="orange darken-2" medium>$times</v-icon>
        </template>
        Cancel Service 
      </v-tooltip> 
      <v-dialog
          v-model="logdialog" v-if="status && status.stream"
        > 
          <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="light"
                  
                  icon
                  class="mx-2"
                  v-bind="attrs"
                  v-on="on"
                  ><v-icon medium >$comment</v-icon>
                </v-btn>
          </template>
          <v-card  class="w-100 pr-2 pl-2 mt-2 mb-2">
            <p class="entry-label" style="font-size: 120%">Logs</p>
            <LogWindow :info="status.stream.info"></LogWindow>
          </v-card> 
      </v-dialog>
      <template v-slot:extension>
          <v-tabs 
            v-model="tabParam" 
            show-arrows 
            next-icon="$arrow-alt-circle-right"
            prev-icon="$arrow-alt-circle-left"
            icons-and-text 
            color="white"
            slider-color="primary"
          >
            <v-tab 
              centered
              v-for="entry in categories"
              v-bind:key="entry.title"
            >
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <div  >
                    <span class="tabSideItemText">{{entry.title }}</span>
                  </div>
                </template>
                <span>{{entry.tooltip}}</span>
              </v-tooltip>
              <v-icon x-small> 
                {{ '$' + entry.icon }}
              </v-icon>						
            </v-tab>
          </v-tabs>
      </template>
    </v-toolbar>
    <v-tabs-items  v-model="tabParam"  >
      <v-tab-item height="100vh"  v-for="entry in categories" :key="entry.title + 'tabitem'">
          <component
              :is="entry.component"
              :source="entry.variable"
              :status="status"
              :items="additionals"
              :defaultHeaders="headers"
              :progresses="progresses"
              @updateValue="updateValue"
              :running="( status.exists ? status.exists.running : false )"
              :service="service"
          >
        </component>
      </v-tab-item>
    </v-tabs-items>
   
  </div>
</template>

<script>
import String from '@/components/Framework/Mods/String.vue';
import File from '@/components/Framework/Mods/File.vue';
import Dir from '@/components/Framework/Mods/Dir.vue';
import List  from '@/components/Framework/Mods/List.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import ConfigurationFile from '@/components/Framework/Mods/ConfigurationFile.vue';
import Advanced from "@/components/Framework/Advanced.vue"
import FileService from '@/services/File-service.js'
import Progresses from '@/components/Framework/Progresses.vue'
// import {LoopingRhombusesSpinner} from 'epic-spinners'
import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import Multiselect from 'vue-multiselect'
import ListParams  from '@/components/Framework/Mods/ListParams.vue';



export default {
	name: 'framework',
  beforeDestroy: function(){
    if (this.interval){
      try{
        clearInterval(this.interval)
      } catch(err){
        console.error(err)
      }
    }
    if (this.intervalProgress){
      try{
        clearInterval(this.intervalProgress)
      } catch(err){
        console.error(err)
      }
    }
  },
  components:{
    File,
    Render,
    Dir,
    String,
    List,
    ConfigurationFile,
 		// LoopingRhombusesSpinner,
    Progresses,
    LogWindow,
    ListParams,
    Multiselect,
    Advanced
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
            console.log(response.data.data,"data")
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
          return "col-lg-12 "
        } else {
          return "col-lg-12"
        }
      }
    },
    async rm_service(){
      await FileService.rmService({
        service: this.name
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
    updateValue(value){
      let src = value.src
      let variable = this.service.variables[value.variable]
      if (value.option){
        variable.option = src
      } else {
        variable.source  = src
      }
      const $this = this
      this.$emit("updateValue", { src: src, service: $this.serviceIdx, variables: value.variable, option: value.option  }   )
      try{
        FileService.updateCacheServiceVariable({
          token: (process.env.NODE_ENV == 'development' ? 'development' : this.$store.token),
          service: $this.serviceIdx,
          procedure: $this.procedure, 
          module: $this.module,
          catalog: $this.catalog,
          value: value.src, 
          target: (value.option  ? "option" : "source"),
          variable: value.variable,
        }).then((response)=>{
        })
      } catch(err){
        console.error(err,"<<<<< error in caching update")
      } 
      
    },
    async getService(){
      const $this = this
      try{
        let response = await FileService.getService({
            service: $this.serviceIdx,
            procedure: $this.procedure, 
            module: $this.module,
            catalog: $this.catalog,
            token: this.$store.token
        })
        this.service  = response.data.data
        console.log(this.service.variables)
        this.status = this.service.status

      } catch(error){
        console.error(error,"error in init config for service", $this.name)
      }
      
    },
    async getStatus(){
      const $this = this
      try{
          let response = await FileService.getServiceStatus({
              service: $this.serviceIdx,
              procedure: $this.procedure, 
              token: $this.$store.token,
              module: $this.module,
              catalog: $this.catalog
          })
          this.status = response.data.data.status
          this.progresses = response.data.data.watches
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async cancel_service(){
      const $this = this
      await FileService.cancelService({
        service: $this.serviceIdx,
        procedure: $this.procedure, 
        module: $this.module,
        catalog: $this.catalog,
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
    close () {
        this.logdialog = false
    },
    async start_service( ){
      const $this = this
      let variables ={}
      if (this.service.variables){
        for (let [key, value] of Object.entries(this.service.variables)){
          variables[key] = {}
          variables[key].source = value.source
          variables[key].option = value.option
        }
      }
      await FileService.startService({
        service: $this.serviceIdx,
        procedure: $this.procedure, 
        module: $this.module,
        token: $this.$store.token,
        catalog: $this.catalog,
        variables: $this.service.variables
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
      arguments: [

      ],
      tabParam: 0, 
      mini:true,
      drawer: true,
      selectedItem: 0,
      service: {},
      status: {},
      headers: [
        {
          text: "Param",
          value: "label",
          sortable: true
        },
        {
          text: "Source",
          value: "source",
          sortable: true
        },
      ],
      logdialog: false,
      factory: {

        'string': "String",
        "file": "File",
        "render": "Render",
        "configuration-file": "ConfigurationFile",
        "dir": "Dir",
        "list": "List"

      },
      intervalProgress: false,
      progressChecking: false,
      count:0,
      variables: {},
      intervalChecking:false,
      progresses: [],
      tabService: 0,
    }
  },
  props: [  'module', 'procedure', 'catalog',  'serviceIdx'],
  watch: {
    logdialog (val) {
      val || this.close()
    },
    variant(){
      this.status = {}
    },
    serviceIdx(){
      this.status = {}
    },
    procedure(){
      this.status = {}
    }
  },
  computed: {
    categories(){
      let categories = [
        {
          "tooltip": "Variables and Parameters to Set on Run",
          "title": "Params",
          "icon": "cog",
          "component": "ListParams"
        },
        {
          "tooltip": "Outputs to watch, report",
          "title": "Outputs",
          "icon": "folder",
          "component": "Progresses"
        }
      ]
      this.additionals.forEach((variable, i)=>{
        if (variable.element == 'render'){
          categories.push(
            {
              "tooltip": i + ". Rendered visualization or dashboard from pipeline service",
              "title": "Render " + i,
              "icon": "desktop",
              "variable": variable,
              "component": "Render"
            }
          )
        }
      })
      
      return categories
    },
    additionals(){
     let ta= []
     if (this.service.variables){
       for (let [key, value ] of Object.entries(this.service.variables)){
         value.name = key
          ta.push(value)
        }
     }
        
     return ta
   }
  },
  mounted(){
    const $this = this
    this.getService({
      module: this.module,
      catalog: this.catalog,
      service: this.serviceIdx, 
      procedure: this.procedure
    
    }).then(()=>{
      $this.getStatus({
      module: $this.module,
      catalog: $this.catalog,
      service: $this.serviceIdx, 
      procedure: $this.procedure
    }).then(()=>{
        $this.started = true
          $this.interval = setInterval(()=>{
              if (!$this.intervalChecking){
                  $this.getStatus()
              }
          }, 1500)
      })
    })
    

  },
  
    
};
</script>

<style>
#service{
  overflow-y: auto;
  width: 100%;
}
</style>