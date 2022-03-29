<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->

<template>
  <v-app id="app" class="px-0 py-0" 
	>
		<v-navigation-drawer
				v-model="drawer"  
				class="elevation-12 nav-drawer" app
				:mini-variant.sync="mini"
				mini-variant-width="64"
				permanent  
			>
				<v-list
					dense class="procedure-list"
				>
					<v-list-item-group  @click="selected='procedures'" v-if="catalog">
					<v-list-item
						v-for="(entry, key) in catalog"  
            
						v-bind:key="entry.name"
            @click="tabProcedure = key"
						@mouseover="isHovered = entry.name; " 
						@mouseleave="isHovered = null"
						@change="selected = 'procedures'"
					>
						<v-list-item-action>
              <v-badge   dot left v-if="!entry.status.latest_installed " color="orange darken-2">
                <v-tooltip top>
                <template v-slot:activator="{ on }">
                  <v-icon  :color="getColor(key, 0.8)" class="" medium>{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
                </template>
                {{ ( entry.tooltip ? entry.tooltip : entry.title ) }}
                </v-tooltip>
              </v-badge>
              <v-tooltip top v-else>
              <template v-slot:activator="{ on }">
                <v-icon  :color="getColor(key, 0.8)" class="" medium>{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
              </template>
              {{ ( entry.tooltip ? entry.tooltip : entry.title ) }}
              </v-tooltip>
						</v-list-item-action>

						<v-list-item-content>
							<v-list-item-title>{{ entry.title }}</v-list-item-title>
						</v-list-item-content>
					</v-list-item>
					<v-divider></v-divider>
					
					</v-list-item-group>
				</v-list>
			<template v-slot:append>
				<v-divider></v-divider> 
				<v-list-item-group  v-if="defaults"
        >
				<v-list-item
					v-for="[key, entry] in Object.entries(defaults)"
					justify-end 
          @click="tab = key"
					v-bind:key="entry.name" @change="selected = 'defaults'; tabProcedure = null"
					
				>							
					<v-list-item-action>
            <v-badge    v-if="entry.name == 'library' && catalog && catalog.length <= 0 " :color="(catalog && catalog.length > 0  ? 'green' : 'orange darken-2')">
                <v-tooltip left>
                  <template v-slot:activator="{ on }">
                    <v-icon v-on="on" class="" medium >{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
                  </template>
                  {{ (  collapsed ? entry.title : entry.tooltip) }}
                </v-tooltip>
            </v-badge>
            <v-tooltip v-else left>
              <template v-slot:activator="{ on }">
                <v-icon v-on="on" class="" medium >{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
              </template>
              {{ (  collapsed ? entry.title : entry.tooltip) }}
            </v-tooltip>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>{{ ( entry.title  ? entry.title : key  ) }}</v-list-item-title>
					</v-list-item-content>
				</v-list-item>
				</v-list-item-group >
				<v-img   :src="require('@/assets/1-icon.svg')" 
					max-height="40"
					class="mb-5 pb-2 configure"
					max-width="200" 
					contain @click="open_external('https://github.com/jhuapl-bio/Basestack')"
				>
				</v-img>
			</template>
		</v-navigation-drawer>
    <v-app-bar app
        class="elevation-24"
      >
        <v-img   :src="require('@/assets/1-logo.svg')" 
          max-height="40"
          class="mx-0 px-0 configure"
          max-width="200"
          contain  @click="open_external('https://basestackwebsite.readthedocs.io/en/latest/index.html')"
        >
        </v-img>
        <v-spacer></v-spacer>
        <v-autocomplete
          :items="catalog"
          chips dense
          v-model="tabProcedure"
          @input="selected ='procedures'"
          :filter="filter"
          style="max-width: 45%"
          clearable
          hide-details
          hide-selected
          item-text="name"
          item-value="idx"
          label="Search for a module..."
          solo
        >
          <template v-slot:item="{ item }" >
            <v-list-item-avatar left >
              <v-icon  small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            </v-list-item-avatar>
            
            <v-list-item-content outlined >
              <v-list-item-title >{{ item.title ? item.title : item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  small
                  v-for="(tag, tagKey) in item.tags" :key="tagKey" class="mr-1"
                >
                {{tag}}
                </v-chip>
              </v-list-item-subtitle>
              
            </v-list-item-content>
          </template>
          <template v-slot:selection="{  attr, on, item,  selected }">
            <v-chip 
              v-bind="attr"
              :input-value="selected"
              color="blue-grey"
              class="white--text"
              close
              v-on="on"
            >
            <v-icon class="mr-1 "  small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            {{ item.title ? item.title : item.name }}
            </v-chip>
          </template>
        </v-autocomplete>
        
    </v-app-bar>
		<v-main >
			<v-container fluid >
        <v-row  v-if="!runningServer">
          <v-alert type="warning" shaped icon="$exclamation-triangle"
            text > Server is not Running at specified port: {{selectedPort}}
          </v-alert>
            <Dashboard/>
          
        </v-row>
        <v-row   v-if="catalog && selected == 'procedures' && catalog[(tabProcedure >=0 ? tabProcedure : 0)]">
          <v-col sm="12" >
            <component 
              :is="'Module'" 
              
              :module="catalog[tabProcedure]"
              :latest="catalog[tabProcedure].status.latest_available"
              :key="catalog[tabProcedure].idx"
              @updateSelected="updateSelected"
              :moduleIndex="tabProcedure"
            >       
            </component>
          </v-col>
        </v-row>
        <v-row  v-else-if="defaults && selected=='defaults' && defaults[(tab >=0 ? tab : 0)]">
          <v-col sm="12">
            <component 
              :is="defaults[tab].component"
              :defaults="defaults" 
              :key="defaults[tab].name"
              
              :defaultModule="defaults[tab]"
              >            	
            </component>
          </v-col>
        </v-row>
       
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
				{{  version  }} — <strong>Basestack</strong>
				</v-card-text>
			</v-card>
		</v-footer>
	</v-app>
  
  <!-- <MainPage  v-if="ready && runningServer"
    v-bind:defaults="defaults"
  ></MainPage> 
  <v-app  v-else-if="!ready || !runningServer">
    <v-main >
        <h3>Backend Server is not available</h3>
        <Dashboard></Dashboard>
    </v-main> 
  </v-app>
  <v-app v-else>
    <v-main  >
        <h3>Initiating Backend Connection....</h3>
        <Dashboard></Dashboard>
    </v-main>
  </v-app> -->

</template>

<script>
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
import FileService from '@/services/File-service.js'
import Module from '@/components/Framework/Module'
import Dashboard from "@/components/Dashboard/Dashboard"
import LogDashboard from "@/components/Dashboard/DashboardDefaults/LogDashboard"
import CustomGenerator from "@/components/Dashboard/DashboardDefaults/CustomGenerator"
import PlayDashboard from "@/components/Dashboard/DashboardDefaults/PlayDashboard"
import Sys from "@/components/Dashboard/System/Sys"
import Library from '@/components/Dashboard/DashboardDefaults/Library'
import {FulfillingBouncingCircleSpinner } from 'epic-spinners'


const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components:{
		Module,
		Dashboard,
		Library,
		LogDashboard,
		CustomGenerator,
		PlayDashboard,
		Sys,
		FulfillingBouncingCircleSpinner
	},
  computed: {
    version(){
      return  process.env.version_basestack
    },
	  hideSlider(){
		  if (this.selected == 'procedures'){
			  return false 
		  } else {
			  return true
		  } 
	  },
    selectedPort(){
      return process.env.PORT_SERVER
    },
	  filtered_installed_modules(){
		  return this.modules.filter((d)=>{
			  if (d && d.status){
			  	return d.status.fully_installed
			  } else{
				  return false
			  }
		  })
	  },
	  selected_modules(){
		  return this.modules.map((d)=>{
			  return d.modules[0]
		  })
	  },
	  labels(){
		  let i = 0;
		  let labels = Object.keys(this.procedures)
		  return labels 
	  }
	},
  data(){
    return {
      tab: 0,
			mini:true,
      defaultModule: {},
			drawer:false,
			tabProcedure: 9, 
			sel: 0,
			selected: 'procedures',
      colorList: [
        "rgb(43, 88, 185",
        "rgb(96, 125, 139", 
      ],
			modulesInner: [],
			collapsed: false,
			isHovered: -1,
			catalog: [],
			indexLabel: null,
			index: 0,
			modules: [],
			tabFind:0,
			status: {},
			procedures: {},
			system: {},
			isLoading: false,
      ready:false,
      interval: null,
      catalogInterval: null,
      modules: false,
      services: false,
      procedures: false,
      defaults: [],
      runningServer: false, 
      running: false
    }
  },
	async mounted(){
    const $this = this;
    this.$electron.ipcRenderer.on('changePort', (evt, port)=>{
      process.env.PORT_SERVER = port
      $this.runningServer = false
      $this.createPingInterval()
    })
    this.$vuetify.icons.dropdown = 'fas fa-square'

    try{
      await $this.pingServerPort()
      await this.init()
      this.ready = true
      this.runningServer = true
      // if (f)
      // {
      //   this.runningServer = true
      //   await this.init()
      // } else {
      //   this.createPingInterval()
      //   this.ready = false
      // }
    } catch(err){
      console.error(err)
      this.ready = false
    } finally {
      this.createPingInterval()
      this.ready = true
    }
    


    

    // this.$electron.ipcRenderer.send('maiN')
    // await this.$store.dispatch("UPDATEDEFAULTS", this.defaults)
    // await this.$store.dispatch("UPDATEDEMODULES", this.modules)
    this.ready = true
    
	},
  methods: {
    clearAll(){
      this.modules = []
      this.services = []
      this.defaults = []
      this.procedures = []
      this.running =false

    },
    renderIcon(entry){
			return this.$vuetify.icons.home
		},
		updateSelected(event, value){

			this.modules[event.module].icon = event.variant.icon
			this.modules[event.module].title = event.variant.title
			this.modules[event.module].hint = event.variant.hint

		},
		open_external(url){
			this.$electron.shell.openExternal(url)
		},
		setTabProcedureNew(idx){
			let index = this.catalog[idx]
			this.tabProcedure = index
			this.selected = 'procedures'
		},
		filter (item, queryText, itemText) {
			let items = []
			if (item.title){
				items.push(item.title.toLocaleLowerCase())
			}
			if (item.tags && Array.isArray(item.tags)){
				item.tags.forEach((d)=>{
					items.push(d.toLocaleLowerCase())
				})
			}
			if (item.name){
				items.push(item.name.toLocaleLowerCase())
			}
			let found = items.some((d)=>{
				return d.toLocaleLowerCase().indexOf(queryText) > -1
			})
			return found
    
		},
		emitChange(value){
			this[value.target] = value.value
	    },
		hovered(event, entry){
			entry.hovered = event
			return event
		},
		getColor(key, opacity){
			const $this = this;
			// var randomElement = this.colorList[Math.floor(Math.random()*this.colorList.length)];

			if (!(this.colorList.length % key+1)){
				return `${ this.colorList[1] }, ${opacity})`
        
			} else {
				// let color = `${this.colorList[this.colorList.length % key+1]}, ${opacity})`
        if ( (key + 1 ) % 2 == 0){
          return `${ this.colorList[0] }, ${opacity})`
        } else {
          return `${ this.colorList[1] }, ${opacity})`
        }
				  
			}
		},
    open (link) {
      try{        
            this.$electron.shell.openPath(link)
      } catch(err){
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
                  title:  "Could not open the path: "+link
        })
      }
    },
    async createPingInterval(){
      console.log("create interval for ping", process.env.PORT_SERVER)
      const $this = this;
      this.runningServer = true
      this.ready  = false
      this.interval = setInterval(async ()=>{
        if ($this.runningServer){
          clearInterval($this.interval)
        }
        try{
          let f = await $this.pingServerPort()
          if (f)
          {            
            await $this.init()
          }
        } catch(err){
            console.error("Could not get server status, check if it is running on port: ", process.env.PORT_SERVER)
            $this.ready = false
            $this.runningServer = false

        }
        
      }, 6000)
    },
    async pingServerPort(){
      return FileService.pingServerPort()
    },
    async getModules(){ 
      let catalog = await FileService.getInstalledModules()
      catalog = catalog.data.data.map((d,i)=>{
        d.idx = i
        return d
      })
      catalog.forEach((cat,i)=>{
        this.$set(this.catalog, i, cat)
      })
      this.catalog = catalog
      return 
    },
    async init(){
      try{
        const $this = this
        // let modules = await FileService.getModules()
        // this.modules = modules.data.data
        let defaults= await FileService.getDefaults()
        await this.getModules()
        if (this.moduleInterval){
          clearInterval(this.moduleInterval)
        }
        this.moduleInterval = setInterval(()=>{
          this.getModules()
        }, 2000)
        // this.catalog = catalog
        if (process.env.NODE_ENV == 'development'){
          // let token = await FileService.createSession()
          this.$store.token = 'development'
        } else {
          // let token = await FileService.createSession() Deprecated for now
          // this.$store.token = token.data.data
          this.$store.token = 'development'
        }
        // // let serverStatus = await FileService.getServerStatus()
        // let dockerStatus = await FileService.getDockerStatus()
        this.defaults = defaults.data.data
        // this.services = services.data.data
        // this.procedures = procedures.data.data
        this.runningServer = true
        return 
      } catch(err){
        console.error(err, "Backend server is not running")
        this.running = false 
        this.ready = true
        this.$swal.fire({
            position: 'center',
            icon: 'error',
            showConfirmButton:true,
            title:  "Error in starting initialization",
            text:  err.response.data.message
        }) 
        throw err
      } finally{
        this.ready = true
      }
    }
  }
};
</script>

<style>
#app { 
  border:0px;
  border-style: solid;
}
.mainPage{
  margin:auto;
}


.v-carousel {
  height: 10000px !important;
  overflow-y:auto;
}

</style>

