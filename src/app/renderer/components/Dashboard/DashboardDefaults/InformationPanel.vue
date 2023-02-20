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
    <v-btn @click="navigation.shown = !navigation.shown">Toggle {{ direction }}</v-btn>
    
    <v-navigation-drawer ref="information_panel_drawer" app right :width="navigation.width" v-model="navigation.shown">
      <v-toolbar color="primary">
        <v-toolbar-title class="headline text-uppercase">
          <span>t a</span><span class="font-weight-light"> b s </span>
        </v-toolbar-title>
      </v-toolbar>
      <v-tabs>
        <v-tab>
          Terminal
        </v-tab>
        <v-tab-item  >
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
        </v-tab-item>
        <v-tab>
            Logs
          </v-tab>
          <v-tab-item  >
            <LogDashboard   :logs="logs.slice().reverse()"></LogDashboard> 
          </v-tab-item>
      </v-tabs>
    </v-navigation-drawer>
  </div>
</template>

<script>

import Terminal from '@/components/Dashboard/Terminal'
import LogDashboard from "@/components/Dashboard/DashboardDefaults/LogDashboard"

export default {
  name: 'InformationPanel',
  props: ['logs', 'navigationPanel'],
  components: {
    Terminal,
    LogDashboard
  },
  watch: {
    navigationPanel(val) {
      console.log(val, "<<<<<")
      this.navigation.shown = val
    }
  },
  methods: {
    open(link) {
      this.$electron.shell.openExternal(link)
    }
  }, //https://codepen.io/dagalti/pen/ywRNYx - Copied code from here
  data() {
    return {
      terminal: {
        pid: 1,
        name: 'terminal',
        cols: 1000,
        rows: 1000
      },
      navigation: {
        shown: true,
        width: 550,
        borderSize: 3
      },
    }
  }, 
  computed: {
    direction() {
      return this.navigation.shown === false ? "Open" : "Closed";
    }
  },
  methods: {
    setBorderWidth() {
      let i = this.$refs.information_panel_drawer.$el.querySelector(
        ".v-navigation-drawer__border"
      );
      i.style.width = this.navigation.borderSize + "px";
      i.style.cursor = "ew-resize";
    },
    setEvents() {
      const minSize = this.navigation.borderSize;
      const el = this.$refs.information_panel_drawer.$el;
      const drawerBorder = el.querySelector(".v-navigation-drawer__border");
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
          vm.navigation.width = el.style.width;
          document.body.style.cursor = "";
          document.removeEventListener("mousemove", resize, false);
        },
        false
      );
    }
  },
  mounted() {
    this.setBorderWidth();
    this.setEvents();
  }
};
</script>
<style>

</style>
