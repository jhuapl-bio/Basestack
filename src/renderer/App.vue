<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-app id="app-v" class="px-0 py-0" 
  	>
  		<v-navigation-drawer
  				:value="drawer" 
  				class="elevation-12 nav-drawer"  
  				:mini-variant.sync="mini" app
  				mini-variant-width="6" rail expand-on-hover
  				permanent   location="left"
  			>
        <v-list
  					 class="procedure-list pr-5"
  				>
  					<v-list-item
  						v-for="entry in libraryNames"  
              :prepend-icon="`${entry.icon ?  entry.icon   : 'mdi-home' }`"
  						v-bind:key="`${entry}-catalogentry`" class="pl-2"
              @click="selectedCatalog = entry"
  						@mouseover="isHovered = true " 
              :title="`${entry.title ? entry.title : entry.name} `"
  						@mouseleave="isHovered = false"
  					>

  					</v-list-item>
  					<v-divider></v-divider>
  				</v-list>
      </v-navigation-drawer>
      <InformationPanel :env="env" :logs="logs"></InformationPanel>
      <v-app-bar app
          class="elevation-24"
        >
          <v-img src="/assets/1-icon.svg"
            max-height="40"
            class="mx-0 px-0 configure"
            max-width="200"
            contain  @click="open_external('https://basestackwebsite.readthedocs.io/en/latest/index.html')"
          >
          </v-img>
      </v-app-bar>
      <v-main >
  			<v-container fluid >
          <Dependencies :env="env"></Dependencies>
        </v-container>
      </v-main>
      <v-footer
  			 absolute inset app
         class=""
  			>
  			<v-card
  				width="100%"
  				color="primary"
  				class="lighten-1 text-center "
  			>
          <v-card-text class="white--text">
            {{ version }} -- <strong>Basestack</strong> 
          </v-card-text> 
        </v-card>
      </v-footer>
        

    </v-app> 
   
</template>

<script lang="ts" >
import { defineComponent } from 'vue';
import InformationPanel from './components/Dashboard/DashboardDefaults/InformationPanel.vue'
import Dependencies from './components/Framework/Dependencies.vue'

interface State {
  inputText: string;
  mini: Boolean;
  libraryNames: any[]
  selectedCatalog: string;
  isHovered: boolean;
  env: any,
  logs: string[]
  drawer: Boolean
}

export default defineComponent({
  name: 'App',
  components: {
    InformationPanel,
    Dependencies
  },
  computed: {
    version() {
      return this.env.version
    },
  },
  data: (): State => { // ADD
    return {
      drawer: true,
      env: {},
      logs: ['test'],
      mini: true,
      libraryNames: [],
      isHovered: false,
      selectedCatalog: "",
      inputText: ''
    }
  },
  props: {
   
  },
  setup(props) {
    window.electronAPI.logger(`Adding`) 
  },
  
  mounted() {
    window.electronAPI.libraryNames((event: any, library: any[]) => { 
      this.libraryNames = library
    });
    window.electronAPI.sendMessage("yes")
    this.fetch_environment()
    window.electronAPI.watchEnv((event: any, env: any[]) => {
      this.env = env
    }); 

    window.electronAPI.requestLibraryNames()
    window.electronAPI.requestEnv()
  }, 
  emits: {
  },
  methods: { 
    open_external(url: string) {
      window.electronAPI.openurl(`${url}`)
    }, 
    fetch_environment() {
      console.log("fetching env") 
    },
    
  }
})
</script>

<style>

#app { 
  border:0px;
  border-style: solid;
}
.mainPage{
  margin:auto;
}
.hoverheader:hover{
  background-color: white;
  color: black !important;
}

.hoverheader:hover  {
  color:red
}


.v-carousel {
  height: 10000px !important;
  overflow-y:auto;
}

</style>
