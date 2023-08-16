<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card
        class="mx-auto; " style="overflow-y: auto; width: 100%; right: 2%" :height="panelHeight" v-if="logs"
    >
      <v-btn class="ml-8"
          icon-and-text
          color="secondary" small
          @click="open(link)"
      >
        <v-icon  class="mr-3"
            small
        >mdi-link
        </v-icon>
        Open Log Folder 
      </v-btn>
        <div      class="ml-8"  style="padding-bottom: 20px; overflow-y:scroll; ">
            <pre v-for="(line, index) in formattedLogs"  v-bind:key="index" >{{ pretty(line) }}</pre>
        </div>
    
  </v-card> 
  
</template>

<script lang="ts" >

import { defineComponent } from 'vue';

interface State {
  systemLog: any,
  scroll: boolean,
  link: any,
  logs: string[],
  element: {pause: boolean}
}

export default defineComponent({
  name: 'logs',
  filters: {
    
  },
	computed: {
    link() {
      return this.env.logDir
    },
    formattedLogs(){
      return this.logs.reverse()
    }
  },
  props: {
    panelHeight: {
      type: [Number, String], 
      required: false,
      default: 500
    },
    env: {
      type: Object, 
      required: false
    }
  },
  data: State => { // ADD
		return {
			systemLog: [],
      scroll: true,
      logs: [],
      element: { pause: false }
		}
	},
  watch: {
  },
  methods: {
    pretty: function (value: string) {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value
      }
    },
		open (link) {
      try {        
            window.electronAPI.openPath(link)
      } catch (err) { 
            console.log(err)
      }
    },
	},
	updated: function(){
	
	},
  mounted() {
    window.electronAPI.requestLogs()
    this.logs = []

    window.electronAPI.getLog((event: any, log: string | string[]) => {
      this.logs.push(...log)
      this.logs = this.logs.slice(-200)
    });
  },
});
</script>

<style>





</style>

