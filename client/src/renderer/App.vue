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
  <div v-if="ready" >
      <MainPage class="mainPage"></MainPage>
  </div>
  
  </div>

</template>

<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import MainPage from './components/MainPage'

const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components: { 
    MainPage, 
  },
  data(){
    return {
      ready:false
    }
  },
	mounted(){
    if(process.env.NODE_ENV == "development"){
      this.ready = true  
    } else {
      this.ready = true
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
body{

}
.mainPage{
  height: 100%;
  width:100%;
  margin:auto;
  /*overflow-y:hidden;*/
}




</style>

