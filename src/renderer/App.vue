<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-app id="app-v"  
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
      
      <!-- <v-app-bar app
          class="elevation-24"
        >
          <v-img src="/assets/1-icon.svg"
            max-height="40"
            class="mx-0 px-0 configure"
            max-width="200"
            contain  @click="open_external('https://basestackwebsite.readthedocs.io/en/latest/index.html')"
          >
          </v-img>
      </v-app-bar> -->
      <v-main id="parentDiv"   ref="parentDiv" style="height: 100%;  overflow-y:hidden; display: flex; flex-direction: column; position: relative;" >
  			<div   :style="{  'height': containerHeight }" >
          <Dependencies v-if="installationSelected" :env="env"></Dependencies>
          <Module v-else-if="moduleSelected &&   Object.keys(moduleSelected).length > 0" 
              :module="moduleSelected" :env="env"
              :moduleIdx="moduleIdx"   @loadYaml="loadYaml($event)"
              :containerHeight="containerHeight"
              >
          </Module>
          
          
        </div>
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
          <div   @mousedown="dragStart"  @mouseup="dragEnd" id="informationpanel" ref="informationPanelDiv" :style="{height: panelHeight}" style="position: fixed;  bottom: 0; width: 100%;">
            <div class="draggable-bar " ></div>
            <InformationPanel  
              :env="env" :panelHeight="panelHeight"
              :logs="logs" 
              :moduleSelected="moduleSelected"  >
            </InformationPanel>
          </div>
      </v-main>
      <v-footer
  			  inset app
         class="my-footer  "
  			>
  			 
          <v-card-text class="text-center  my-card-text">
            <strong>Basestack</strong> 
          </v-card-text> 
       </v-footer>
      <!-- make a sparkline for successsparkline, remove after 2 seconds  of it changing -->
      
        

    </v-app> 
   
</template>

<script lang="ts" >
import { defineComponent, ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import InformationPanel from './components/Dashboard/InformationPanel.vue'
import Dependencies from './components/Dependencies.vue'
import Module from './components/Module.vue'
import yaml from 'js-yaml'
import Swal from 'sweetalert2'


export default defineComponent({
  name: 'App',
  components: {
    InformationPanel,
    Dependencies,
    Module
  },
  setup(_props) {
    const moduleDiv = ref(null);
    const startY = ref(0);
    const startHeight = ref(0);
    const dragging = ref(false);
    const informationPanelDiv = ref(null);
    const parentDiv = ref(null);
    const panelHeight = ref(`300px`)
    const dragStart = (e) => {
      startY.value = e.clientY;
      startHeight.value = informationPanelDiv.value.offsetHeight;
      dragging.value = true;
    };

    const dragEnd = () => {
      dragging.value = false;
    };

    const drag = (e) => {
      if (!dragging.value) return;
      let newHeight = startHeight.value + (startY.value - e.clientY);
      if (newHeight < 40) newHeight = 40; // this.minHeight
      panelHeight.value = `${newHeight}px`;
    };

    
    // window.electronAPI.logger(`Adding`) 
    //listen on the getlog, console log the log from the main process
    window.electronAPI.customModule((_event:any, params: {type: string, module:string, value: Object})=>{
      moduleSelected.value = params.value
      selectedCatalog.value = params.value
      // selectedCatalog.value.custom = true
    })
    window.electronAPI.success((_event:any, message:string)=>{
      snackbarMessage.message = message
      snackbarMessage.type == 'success'
      snackbar.value = true
    })
    window.electronAPI.error((_event:any, message:string)=>{
      snackbarMessage.message = message 
      snackbarMessage.type == 'error'
      snackbar.value = true
    }) 
    const snackbarMessage = reactive({
      type: 'success',
      message: ''
    })
    const logs = ref([])
    const env = ref({})
    let snackbar = ref(null)
    const mini = ref(false)
    const drawer = ref(false)
    const selectedCatalog = ref(null) 
    const isHovered = ref(false)
    const  libraryNames  = ref([])
    const moduleIdx: any = ref(0)
    const moduleSelected = ref({})
    //Set default name if you want

    const name = ref('ncbi_scrubber')
    let installationSelected = ref(false)

    const fetch_environment = async () => {
      let envt = await window.electronAPI.requestEnv() 
      env.value = envt  
    }
    window.electronAPI.dockerDownloadStatus((evt, message)=>{
      Swal.fire({
        position: 'center',
        icon: (message.type ? message.type : 'info'),
        showConfirmButton:true,
        title:  message.message,
        text:  message.info
      })

    })
    const containerHeight = computed( () => {
      let height = 800; 
      if (parentDiv.value){
        height = parentDiv.value['$el'].offsetHeight
      }
      const panelHeightNum = Number(panelHeight.value.replace('px', ''));
      // get the height of v-main using javascript

      const appHeightNum = height - 5 /* retrieve app height here, assuming it's in pixels */
      const newHeight = appHeightNum - panelHeightNum 
      return `${newHeight}px`;
    })

    onMounted(() => {
      informationPanelDiv.value.addEventListener('mousedown', dragStart);
      document.addEventListener('mousemove', drag);
      document.addEventListener('mouseup', dragEnd);

      window.electronAPI.libraryNames((_event: any, library: any[]) => { 
        libraryNames.value = library
        if ( library.length > 0 && !moduleSelected.value['name']  ) {
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
      
      // fetch history
      window.electronAPI.requestLibraryNames()
      fetch_environment()

      window.electronAPI.requestLibraryNames()
    }); 
    const open_external = (url: string) => {
      window.electronAPI.openurl(`${url}`)
    }
    const loadYaml = (file) => {
      console.log(file)
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
      containerHeight, 
      informationPanelDiv,
      parentDiv,
      dragStart,
      panelHeight, 
      dragEnd,
      drag,
      moduleSelected,
      snackbar,
      isHovered,
      logs,
      snackbarMessage,
      moduleIdx,
      selectedCatalog,
      env,
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
#parentDiv {
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  /* remove overflow: auto; */
}
.v-container {
  height: calc(100vh - 400px - 60px); /* adjust this as needed */
  overflow-y: auto;
}

#informationpanel {
  background-color: #ccc; /* For visibility */
  z-index: 1000; /* Any large number so it appears on top of other content */
  overflow-y:hidden;
  height: 400px; /* adjust this as needed */
}
.draggable-bar {
  height: 5px;
  background-color: gray;
  cursor: ns-resize;
}
.drag-handle {
  height: 20px;
  background-color: #999;
  min-height: 20px;
  overflow-y:auto;
 }


.my-footer {
  height: 20px;
  font-size: 20px;
  background-color: #3f51b5  !important;
  fill: #3f51b5  !important;
}

.my-card {
  height: 100%;
}

.my-card-text {
  font-size: 0.9rem !important;  /* adjust as needed */
  line-height: 0.1 !important; /* adjust as needed */
  color: rgb(226, 216, 216);
}
#app { 
  border:0px;
  border-style: solid;
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
