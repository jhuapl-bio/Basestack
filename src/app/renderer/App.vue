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
      <MainPage :meta="meta" :components="Object.values(meta.modules).map((d)=>{ return d.component})" class="mainPage"></MainPage>
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
      meta: null,
      running: false
    }
  },
	async mounted(){
    let response = await this.init()
    await this.$store.dispatch("UPDATEMETA", response.data.data)
    this.meta = response.data.data
    this.ready = true
    
	},
  methods: {
    async init(){
      try{
        let meta = await FileService.getMeta()
        let serverStatus = await FileService.getServerStatus()
        let dockerStatus = await FileService.getDockerStatus()
        this.meta = meta.data.data
        this.running = true
        return response
      } catch(err){
        console.error(err, "Backend server is not running")
        this.running = false
        this.ready = true
        // this.$swal.fire({
        //           position: 'center',
        //           icon: 'error',
        //           showConfirmButton:true,
        //           title:  "Error in starting initialization",
        //           text:  err.response.data.message
        //       }) 
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

