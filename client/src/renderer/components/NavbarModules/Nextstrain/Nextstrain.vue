<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="nextstrain">
    <button class="btn tabButton" v-on:click="forceRerender()"
        v-tooltip="{
          content: 'If Rampart does not appear given a success message, try to refresh here. If still no update, check Log Streams.',
          placement: 'top',
          classes: ['info'],
          trigger: 'hover',
          targetClasses: ['it-has-a-tooltip'],
          }"
      ><div class="in-line-Button" ><span><font-awesome-icon  icon="sync"/></span><span> Refresh</span></div></button>
     <object id ="nextstrainObj" type="text/html" data="https://nextstrain.org/ncov/global">
    </object>      
  </div>
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
        this.$forceUpdate();
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
  min-height: 90vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}
</style>
