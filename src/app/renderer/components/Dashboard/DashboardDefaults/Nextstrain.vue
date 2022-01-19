<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card id="nextstrain">
    <v-btn class="btn tabButton" v-on:click="forceRerender()"
        v-tooltip="{
          content: 'If Rampart does not appear given a success message, try to refresh here. If still no update, check Log Streams.',
          placement: 'top',
          classes: ['info'],
          trigger: 'hover',
          targetClasses: ['it-has-a-tooltip'],
          }"
      > Refresh
        <v-icon class="ml-3" small >$sync</v-icon>
      </v-btn>
      <v-row class=" mt-3 ml-2 ">
        <object v-if="show" type="text/html"  id ="nextstrainObj" class="renderObj p-0 m-0" data="https://nextstrain.org/ncov/global"></object>
      </v-row>
        
  </v-card>
</template>

<script>
import FileService from '../../../services/File-service.js'
// import MutationTable from './MutationTable'

  export default {
    name: 'nextstrain',
    // components: {MutationTable},
    props: ['data'],
    data(){
      return {
        fastqDir:null,
        show:true
      }
    },
    computed: {
    myProps() {
      const data= this.data
        return { 
          data
        }

      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      forceRerender(){
        const $this =this
        $this.show = false
        setTimeout(()=>{
          $this.show = true
        },500)
      },
    },
  };
</script>
<style>
#nextstrain{
  height:100%;
  overflow-y:auto;
  width: 100%;
}
#nextstrainObj{
  min-height: 70vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}
</style>
