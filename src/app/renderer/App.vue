<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->

<template>
  <v-app id="app" >
    <v-main  v-if="ready && runningServer" >
        <MainPage 
          v-bind:defaults="defaults"
          v-bind:modules="modules"
          v-bind:procedures="procedures"
          v-bind:services="services"
        ></MainPage> 
    </v-main>
    
    <v-main  v-else-if="!ready || !runningServer">
        <h3>Backend Server is not available</h3>
        <Dashboard></Dashboard>
    </v-main> 
    <v-main  v-else>
        <h3>Initiating Backend Connection....</h3>
        <Dashboard></Dashboard>
    </v-main>
  
  </v-app>

</template>

<script>
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
import MainPage from '@/components/MainPage'
import FileService from '@/services/File-service.js'
import Dashboard from "@/components/Dashboard/Dashboard.vue"


const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components: { 
    MainPage, 
    Dashboard,
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
      process.env.PORT_SERVER = port
      $this.runningServer = false
      $this.createPingInterval()
    })
    this.$vuetify.icons.dropdown = 'fas fa-square'

    
    let f = await $this.pingServerPort()
    if (f)
    {
      this.runningServer = true
      await this.init()
    } else {
      this.createPingInterval()
      this.ready = false
    }


    

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
      this.ready  = false
      this.interval = setInterval(async ()=>{
        if (this.runningServer){
          clearInterval($this.interval)
        } else {
          try{
            let f = await $this.pingServerPort()
            if (f)
            {
              this.runningServer = true
              await this.init()
            }
          } catch(err){
              console.error("Could not get server status, check if it is running on port: ", process.env.PORT_SERVER)
              this.ready = false
              this.runningServer = false

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
        if (process.env.NODE_ENV == 'development'){
          // let token = await FileService.createSession()
          this.$store.token = 'development'
        } else {
          let token = await FileService.createSession()
          this.$store.token = token.data.data
        }
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
  overflow-y:hidden;
}




</style>

