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
          <!-- Make v list item extract both the value and the index -->
  					<v-list-item
  						v-for="(entry, idx) in libraryNames"  
              :prepend-icon="`${entry.icon ?  entry.icon   : 'mdi-home' }`"
  						v-bind:key="`${entry}-catalogentry`" class="pl-2"
              @click="moduleSelected = entry; moduleIdx= idx; selectedCatalog = entry; installationSelected = false"
  						@mouseover="isHovered = true " 
              :title="`${entry.title ? entry.title : entry.name} `"
  						@mouseleave="isHovered = false"
  					>

  					</v-list-item>
  					<v-divider></v-divider>
  				</v-list>
        <template v-slot:append>
          <v-list
            class="procedure-list pr-5"
          >
            <v-list-item
              :prepend-icon="`mdi-home`"
              :title="'Installations'"
              @click="installationSelected = true; moduleSelected = {}"
            >	
            </v-list-item>
          </v-list>
        
          <v-img   src="/assets/1-icon.svg" 
            max-height="40"
            class="mb-5 pb-2 configure"
            max-width="200" 
            contain @click="open_external('https://github.com/jhuapl-bio/Basestack')"
          >
          </v-img>
        </template>
      </v-navigation-drawer>
      <InformationPanel   :env="env" :logs="logs" :moduleSelected="moduleSelected"></InformationPanel>
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
          <Dependencies v-if="installationSelected" :env="env"></Dependencies>
          <Module v-else-if="moduleSelected &&   Object.keys(moduleSelected).length > 0" 
              :module="moduleSelected" 
              :moduleIdx="moduleIdx"
              >
          </Module>
          <v-file-input type="file" ref="fileInputRef" @change="loadYaml" 
            :accept="['.yaml', '.YAML', '.yml']" 
            label="Insert Custom Module YAML"/>
        </v-container>
        <v-snackbar
          v-model="snackbar" vertical :color=" snackbarMessage.type == 'error' ? 'orange-darken-2' : 'green-lighten-2'"
          :timeout="2000" absolute max-width="90vh"
        >
          {{ snackbarMessage.message }}
          <template v-slot:actions>
            <v-btn
              color="blue"
              variant="text"
              @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
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
      <!-- make a sparkline for successsparkline, remove after 2 seconds  of it changing -->
      
        

    </v-app> 
   
</template>

<script lang="ts" >
import { defineComponent, onMounted, ref, reactive, watch } from 'vue';
import InformationPanel from './components/Dashboard/InformationPanel.vue'
import Dependencies from './components/Dependencies.vue'
import Module from './components/Module.vue'
import yaml from 'js-yaml'


export default defineComponent({
  name: 'App',
  components: {
    InformationPanel,
    Dependencies,
    Module
  },
  computed: {
    version() {
      return window.electronAPI.version
    }
  },
  setup(props) {
    // window.electronAPI.logger(`Adding`) 
    //listen on the getlog, console log the log from the main process
    window.electronAPI.customModule((event:any, params: {type: string, module:string, value: Object})=>{
      moduleSelected.value = params.value
      selectedCatalog.value = params.value
      // selectedCatalog.value.custom = true
    })
    window.electronAPI.success((event:any, message:string)=>{
      snackbarMessage.message = message
      snackbarMessage.type == 'success'
      snackbar.value = true
    })
    window.electronAPI.error((event:any, message:string)=>{
      snackbarMessage.message = message 
      snackbarMessage.type == 'error'
      snackbar.value = true
    })
    const snackbarMessage = reactive({
      type: 'success',
      message: ''
    })
    const logs = ref([])
    const env = reactive({})
    const fileInputRef = ref(null)
    let snackbar = ref(null)
    const mini = ref(false)
    const drawer = ref(false)
    const selectedCatalog = ref(null) 
    const isHovered = ref(false)
    const  libraryNames  = ref([])
    const moduleIdx: any = ref(0)
    const moduleSelected = ref({})
    //Set default name if you want

    const name = ref('helloworld')
    let installationSelected = ref(true)


    onMounted(() => {
      
      window.electronAPI.libraryNames((event: any, library: any[]) => { 
        libraryNames.value = library
        console.log(moduleSelected.value)
        if ( library.length > 0 && !moduleSelected.value['name']  ) {
          console.log("new Library names", library)
          if (name){ 
            let indx = library.findIndex((entry: any) => entry.name === name.value)
            moduleIdx.value = indx > -1 ? indx : 0
            moduleSelected.value = library[indx > -1 ? indx : 0]
          } else {
            moduleSelected.value = library[0]
          }
          // installationSelected.value = false
        }
      }); 
      // fetch_environment() 
      // fetch history
      window.electronAPI.requestLibraryNames()
      window.electronAPI.watchEnv((event: any, env: any[]) => {
        env = env
      }); 

      window.electronAPI.requestLibraryNames()
    }); 
    const open_external = (url: string) => {
      window.electronAPI.openurl(`${url}`)
    }
    const loadYaml = () => {
        const file = fileInputRef.value.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const yamlObj = yaml.load(event.target.result);
                    // Assuming the structure of the YAML file corresponds to your existing data structure
                    selectedCatalog.value = yamlObj[0]
                    moduleSelected.value = yamlObj[0]
                    moduleSelected.value['custom'] = true
                    window.electronAPI.recordHistory({
                        module: yamlObj[0].name,
                        type: "customModule",
                        value: yamlObj[0]
                    });
                } catch (e) {
                    console.error('Error parsing YAML', e);
                }
            };
            reader.readAsText(file);
        }
    }
    return {
      loadYaml,
      moduleSelected,
      snackbar,
      isHovered,
      logs,
      snackbarMessage,
      moduleIdx,
      selectedCatalog,
      env,
      fileInputRef,
      mini, 
      drawer,
      libraryNames,
      open_external,
      installationSelected,
      
    }



  },
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
