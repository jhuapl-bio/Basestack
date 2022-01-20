<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->

<template>
  <div id="app">
  <div v-if="ready && running" >
      <MainPage 
        v-bind:defaults="defaults"
        v-bind:modules="modules"
        v-bind:procedures="procedures"
        v-bind:services="services"
      ></MainPage>
  </div>
  <div v-else-if="!ready">
      <h3>Initiating....</h3>
  </div>
  <div v-else>

      <h3>Backend Server is not available</h3>
      <Sys></Sys>
  </div>
  
  </div>

</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import MainPage from '@/components/MainPage'
import FileService from '@/services/File-service.js'
import Sys from "@/components/Dashboard/System/Sys.vue"


const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components: { 
    MainPage, 
    Sys,
  },
  data(){
    return {
      ready:false,
      interval: null,
      modules: false,
      services: false,
      procedures: false,
      defaults: false,
      runningServer: false,
      running: false
    }
  },
	async mounted(){
    const $this = this;
    this.$electron.ipcRenderer.on('changePort', (evt, port)=>{
      console.log("changed port", port)
      process.env.PORT_SERVER = port
      $this.runningServer = false
      $this.createPingInterval()
    })

    this.createPingInterval()


    

    // this.$electron.ipcRenderer.send('maiN')
    // await this.$store.dispatch("UPDATEDEFAULTS", this.defaults)
    // await this.$store.dispatch("UPDATEDEMODULES", this.modules)
    this.ready = true
    
	},
  methods: {
    clearAll(){
      this.modules = []
      this.services = []
      this.defaults = []
      this.procedures = []
      this.running =false

    },
    async createPingInterval(){
      console.log("create interval for ping", process.env.PORT_SERVER)
      const $this = this;
      if (this.interval){
        clearInterval(this.interval)
      }
      this.clearAll()
      this.runningServer = false
      this.interval = setInterval(async ()=>{
        if (this.runningServer){
          clearInterval($this.interval)
        } else {
          try{
            let f = await $this.pingServerPort()
            console.log(f)
            if (f)
            {
              this.runningServer = true
              await this.init()
            }
          } catch(err){
            console.error("Could not get server status, check if it is running on port: ", process.env.PORT_SERVER)
          }
        }
        
      }, 2000)
    },
    async pingServerPort(){
      return FileService.pingServerPort()
    },
    async init(){
      try{
        const $this = this
        let modules = await FileService.getModules()
        this.modules = modules.data.data
        let defaults= await FileService.getDefaults()
        let procedures = await FileService.getProcedures()
        let services = await FileService.getServices()
        // // let serverStatus = await FileService.getServerStatus()
        // let dockerStatus = await FileService.getDockerStatus()
        this.defaults = defaults.data.data
        this.services = services.data.data
        this.procedures = procedures.data.data
        this.running = true
        return 
      } catch(err){
        console.error(err, "Backend server is not running")
        this.running = false 
        this.ready = true
        this.$swal.fire({
                  position: 'center',
                  icon: 'error',
                  showConfirmButton:true,
                  title:  "Error in starting initialization",
                  text:  err.response.data.message
              }) 
        throw err
      } finally{
        this.ready = true
      }
    }
  }
};
</script>

<style>
#app { 
  border:0px;
  border-style: solid;
}
.mainPage{
  margin:auto;
  /*overflow-y:hidden;*/
}




</style>
