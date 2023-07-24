<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div >
    
      <v-navigation-drawer  id="information_panel_drawer" ref="information_panel_drawer" permanent :border="true" app floating location="right"  :width="navigation.width"  v-model="navigation.shown">
          <v-toolbar color="primary">
            <v-toolbar-title class="headline text-uppercase">
              <span>t a</span><span class="font-weight-light"> b s </span>
              {{ tab }}
            </v-toolbar-title>
            <template v-slot:extension>
              <v-tabs v-model="tab">
                <div style="width:100px; " id="resizeSection"></div>
                <v-tab>
                  Terminal
                </v-tab>
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
            </template>
          </v-toolbar>
          <!-- Make title bold and standout. If description and info are not null, make a large noneditable field that has information, use an css styling for easier viewing -->
          <!-- Wrap it in a vuetify alert box -->
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
          <v-window class="information-panel" v-model="tab">
            <v-window-item  >
            <Terminal
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
            </v-window-item>
    
            <v-window-item  >
              <LogDashboard   :env="env" :logs="logs"></LogDashboard> 
            </v-window-item>
            <v-window-item  >
              <Processes :env="env"></Processes>
            </v-window-item>
            <v-window-item  >
              <History  ></History>
            </v-window-item>
          </v-window>
          
      </v-navigation-drawer>
      
  </div>
</template>

<script lang="ts" >



import { defineComponent, watch, onMounted} from 'vue';
import Terminal from '../Terminal.vue'
import Processes from '../Processes.vue'
import LogDashboard from "./LogDashboard.vue"
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
    LogDashboard
  },
  watch: {
    navigationPanel(val) {
      this.navigation.shown = val
    },
     
  },
  data: State => { // ADD
    return {
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 1000,
        rows: 1000
      },
      tab: 3  ,
      navigation: {
        shown: true,
        width: 550,
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
    setBorderWidth() {

      let i = this.$el 
        .querySelector(
        "#resizeSection"
      );
      // i.style.width = this.navigation.borderSize + "px";
      i.style.cursor = "ew-resize";
    },
    setEvents() {
      const minSize = this.navigation.borderSize;
      const $this = this
      const el = this.$el.querySelector('#information_panel_drawer');
      const drawerBorder = el.querySelector(".v-navigation-drawer__content");
      const vm = this;
      const direction = el.classList.contains("v-navigation-drawer--right")
        ? "right"
        : "left";
      function resize(e) {
        document.body.style.cursor = "ew-resize";
        let f = direction === "right"
          ? document.body.scrollWidth - e.clientX
          : e.clientX;
        el.style.width = f + "px";
      }

      drawerBorder.addEventListener(
        "mousedown",
        function (e) {
          console.log(e.offsetX, minSize)
          if (e.offsetX < minSize) {
            let m_pos = e.x;
            el.style.transition = 'initial'; document.addEventListener("mousemove", resize, false);
          }
        },
        false
      );

      document.addEventListener(
        "mouseup",
        function () {
          el.style.transition = '';
          let width = el.style.width.replace("px", "")
          document.body.style.cursor = "";
          $this.navigation.width = width;
          document.removeEventListener("mousemove", resize, false);
        },
        false
      );
    }
  },
  mounted() {
    // this.setBorderWidth();
    // this.setEvents();
    window.electronAPI.getSideTab((event: any, data: any) => {
      this.tab = data
    })
  }
});
</script>
<style>
.information-panel{
  height: 80vh;
}
</style>
