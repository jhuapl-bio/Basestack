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
      ></MainPage>
  </div>
  <div v-else-if="!ready">
      <h3>Initiating....</h3>
  </div>
  <div v-else>
      <h3>Backend Server is not available</h3>
  </div>
  
  </div>

</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import MainPage from '@/components/MainPage'
import FileService from '@/services/File-service.js'



const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components: { 
    MainPage, 
  },
  data(){
    return {
      ready:false,
      modules: false,
      defaults: false,
      running: false
    }
  },
	async mounted(){
    await this.init()
    this.$electron.ipcRenderer.send('mainN')
    await this.$store.dispatch("UPDATEDEFAULTS", this.defaults)
    await this.$store.dispatch("UPDATEDEMODULES", this.modules)
    this.ready = true
    
	},
  methods: {
    async init(){
      try{
        let modules = await FileService.getModules()
        let defaults= await FileService.getDefaults()
        // let serverStatus = await FileService.getServerStatus()
        let dockerStatus = await FileService.getDockerStatus()
        this.defaults = defaults.data.data
        this.modules = modules.data.data
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
  color: #2b57b9 ;
  border:0px;
  border-style: solid;
  border-color: #2b57b9 ;
  height: 100vh;
}
.mainPage{
  height: 100%;
  width:100%;
  margin:auto;
  /*overflow-y:hidden;*/
}




</style>

