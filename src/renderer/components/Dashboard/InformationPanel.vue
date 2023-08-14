<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
    <v-card>
      <v-tabs
        v-model="tab"
        class="infopaneltabs"
        style="background-color: #3f51b5; color:white"
      >
          <v-tab>
            Logs
          </v-tab>
          <v-tab>
            Processes
          </v-tab>
          <v-tab>
            History
          </v-tab>
      </v-tabs>

      <v-card-text>
        <v-window v-model="tab">
           <!-- <v-window-item  >
             <Terminal :panelHeight="panelHeight"
                ref="terminal"
                :terminal="terminal"
                :cols="100"
                :rows="24"
                  auto-size
                  :options="{
                    scrollback: 5000,
                    disableStdin: true, 
                    useFlowControl: true
                  }"
                  open-links
                /> 
            </v-window-item> -->
    
            <v-window-item  >
              <LogWindow  
                 
                :panelHeight="panelHeight"
                :env="env" 
                :logs="logs">
              </LogWindow> 
            </v-window-item>
            
            <v-window-item class="maxHeight" >
            
              <Processes :env="env" :panelHeight="panelHeight"></Processes>
            </v-window-item>
            <v-window-item  >
              <History  :panelHeight="panelHeight">

              </History>
            </v-window-item>
        </v-window>
      </v-card-text>  
    </v-card>
    <v-window  v-model="tab"> 
            
  </v-window>
  <!-- <div >
      <v-navigation-drawer  id="information_panel_drawer" ref="information_panel_drawer" permanent :border="true" app floating :height="navigation.height" v-model="navigation.shown" style="width: 100%; position: absolute; bottom: 0;">
          <v-toolbar color="primary">
            <v-toolbar-title class="headline text-uppercase">
              <span>t a</span><span class="font-weight-light"> b s </span>
              {{ tab }}
            </v-toolbar-title>
            <template v-slot:extension>
              
            </template>
          </v-toolbar>
          <v-alert type="info"
          >
            <span class="font-weight-bold">Page Info</span>
          </v-alert>
          
          <div v-if="moduleSelected" class="mx-auto overflow-y-auto" style="max-height: 90%; overflow-y: scroll;">
                  <v-textarea v-if="moduleSelected.description"
                      v-model="moduleSelected.description"
                      label="Description"
                      readonly
                      rows="3"
                      auto-grow
                      outlined
                  ></v-textarea>
                  <v-textarea v-if="moduleSelected.info"
                      v-model="moduleSelected.info"
                      label="Info"
                      readonly
                      rows="3"
                      auto-grow
                      outlined
                  ></v-textarea>
          </div>
          
          
      </v-navigation-drawer>
      
  </div> -->
</template>

<script lang="ts" >



import { defineComponent, watch, onMounted} from 'vue';
import Terminal from '../Terminal.vue'
import Processes from '../Processes.vue'
import LogWindow from "./LogWindow.vue"
import History from './History.vue'

interface State {
  navigation: Object
  terminal: Object 
  tab: number
}
export default defineComponent({
  name: 'InformationPanel',
  props: {
    moduleSelected: {
      type: Object,
      required: true
    },
    panelHeight: {
      type: [Number, String],
      required: false ,
      default: 200
    },
    logs: {
      type: Array,
      required: true
    },
    env: Object
  },
  components: {
    Terminal,
    Processes,
    History,
    LogWindow
  },
  watch: {
    navigationPanel(val) {
      this.navigation.shown = val
    },
    panelHeight(val){
       
    }
     
  },
  data: State => { // ADD
    return {
      startY: 0,
      startHeight: 0,
      minHeight: 40, 
      initialLoad: false ,
      maxWindowHeight: 400,
      dragging: false,
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 1000,
        rows: 1000
      },
      tab:  2 ,
      navigation: {
        shown: true,
        height: 55,
        borderSize: 10
      },
    }
  }, 
  computed: {
    direction() {
      return this.navigation.shown === false ? "Open" : "Closed";
    },
    dir() {
      return this.env.logDir
    }
  },
  methods: {
    
  }, 
  mounted() {
    
  }
});
</script>
<style>

</style>
