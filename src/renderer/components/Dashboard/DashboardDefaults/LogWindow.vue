<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="logs" class="mt-3 mx-5" ref="logs" v-if="logs">
    <v-btn
        icon-and-text
        color="secondary" small
        @click="open(link)"
    ><v-icon  class="mr-3"
        small
    >mdi-link
    </v-icon>
    Open Log Folder
    </v-btn>
    <div class="logWindow" >
        <div v-if="logs" class="logDiv" style="max-height: 70vh; border: none; overflow-y:auto; ">
            <!-- <code v-for="(line, index) in logs"  v-bind:key="index" class="align-start">
                {{ line }}
            </code> -->
            <pre v-for="(line, index) in logs"  v-bind:key="index" >{{ pretty(line) }}</pre>
        </div>
    </div> 
  </div> 
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
    }
  },
  props: {
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
    console.log("listen for log") 
    window.electronAPI.requestLogs()
    this.logs = []
    window.electronAPI.getLog((event: any, log: string | string[]) => {
      this.logs.unshift(...log)
      this.logs = this.logs.slice(0, 200)
    });
  },
});
</script>

<style>





</style>

