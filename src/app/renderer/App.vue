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
				mini-variant-width="56"
				permanent  
			>
			<!-- <v-layout column fill-height height="20px" style="overflow-y:auto"> -->
				<v-list
					dense class="procedure-list"
				>
					<v-list-item-group v-model="tab" @click="selected='procedures'">
					<v-list-item
						v-for="(entry, key) in catalog"  
						v-bind:key="entry.name"
						@mouseover="isHovered = entry.name; " 
						@mouseleave="isHovered = null"
						@change="selected = 'procedures'"
					>
						<v-list-item-action>
							<v-tooltip top>
							<template v-slot:activator="{ on }">
								<v-icon  :color="getColor(key, 0.8)" class="mr-2" small>{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
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
			<!-- </v-layout>			 -->
			<template v-slot:append>
				<v-divider></v-divider>
				<v-list-item-group v-model="tab">
				<v-list-item
					v-for="[key, entry] in Object.entries(defaults)"
					justify-end
					v-bind:key="entry.name" @change="selected = 'defaults'"
					
				>							
					<v-list-item-action>
						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<v-icon v-on="on" small >{{ ( entry.icon  ? '$' + entry.icon : '$cog' ) }}</v-icon>
							</template>
							{{ (  collapsed ? entry.title : entry.tooltip) }}
						</v-tooltip>
					</v-list-item-action>
					<v-list-item-content>
						<v-list-item-title>{{parseInt(key)+1}}. {{ ( entry.title  ? entry.title : key  ) }}</v-list-item-title>
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
          v-model="tab"
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
            <v-list-item-avatar left>
              <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            </v-list-item-avatar>
            
            <v-list-item-content outlined>
              <v-list-item-title >{{ item.title ? item.title : item.name }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  x-small
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
            <v-icon class="mr-1 "  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            {{ item.title ? item.title : item.name }}
            </v-chip>
          </template>
        </v-autocomplete>
        
    </v-app-bar>
		<v-main >
			<v-container fluid >
        <component 
          :is="'Module'" 
          v-if="selected == 'procedures'"
          :module="catalog[tab]"
          :key="catalog[tab].idx"
          @updateSelected="updateSelected"
          :moduleIndex="tab"
        >       
        </component>
        <component 
          :is="defaults[tab].component"
          :defaults="defaults"  v-else
          :key="defaults[tab].name"
          :defaultModule="defaults[tab]"
          >            	
        </component>
        <!-- <v-tab-items
          v-model="tab"

        :is="default.component"
          :defaults="defaults" 
          v-else
          :defaultModule="default"


          v-else
        >
          <v-tab-item>
             
          </v-tab-item>
          <v-tab-item  v-for="[key, entry] in Object.entries(defaults)"
              v-bind:key="entry.name">
            <component 
              :is="entry.component"
              :defaults="defaults"
              :defaultModule="entry"
              >            	
            </component>
          </v-tab-item>
        </v-tab-items> -->
				<!-- <v-carousel
					v-model="tab" 
					:show-arrows="false"
					hide-delimiters
					vertical  
          class="car"
					v-if="selected == 'procedures'"
					delimiter-icon="$circle"
					>
					<template v-slot:prev="{ on,  }"  >
						<v-icon  small v-on="on">
							$arrow-alt-circle-left
						</v-icon>
					</template>
					<template v-slot:next="{ on,  }">
						<v-icon small v-on="on">
							$arrow-alt-circle-right
						</v-icon>
					</template>
					<v-carousel-item
						:transition="false" class=""   v-for="( entry, key) in catalog"
						v-bind:key="key" 
					>
						<component 
							:is="'Module'"
							:module="entry"
							@updateSelected="updateSelected"
							:moduleIndex="key"
						>            	
						</component>
						
					</v-carousel-item>
					</v-carousel>
					<v-carousel
						v-model="tab"
						:show-arrows="false"
						hide-delimiters 
						vertical 
						v-if="selected == 'defaults'"
						delimiter-icon="$circle"
					>
						<v-carousel-item 
							class="car" 
						>  -->
					
<!-- 							
						</v-carousel-item>
						<v-carousel-item v-for="[key, entry] in Object.entries(defaults)"
						
						v-bind:key="entry.name"> 
							<component 
								:is="entry.component"
								:defaults="defaults"
								:defaultModule="entry"
								>            	
							</component>
							
						</v-carousel-item>
					</v-carousel>
					
				</v-carousel> -->
			</v-container>
		</v-main>
		<v-footer
			 absolute inset app
			>
			<v-card
				flat
				tile
				width="100%"
				color="primary"
				class="lighten-1 text-center"
			>
				<v-card-text class="white--text">
				{{ version  }} — <strong>Basestack</strong>
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
	  hideSlider(){
		  if (this.selected == 'procedures'){
			  return false
		  } else {
			  return true
		  }
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
      tab:0,
			mini:true,
      defaultModule: {},
			version: process.env.version_basestack,
			drawer:false,
			tabProcedure: 0, 
			sel: 0,
			selected: 'defaults',
			colorList: [
				"rgb(70, 240,240",
				"rgb(128,0,0",
				"rgb(128,128,0",
				"rgb(255,165,0",
				"rgb(255,255,0",
				"rgb(0,128,0",
				"rgb(128,0,128",
				"rgb(255,0,255",
				"rgb(255,0,0",
				"rgb(0,255,0",
				"rgb(0,128,128", 
				"rgb(0,255,255",
				"rgb(0,0,255",
				"rgb(0,0,128",
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
      modules: false,
      services: false,
      procedures: false,
      defaults: false,
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

    
    let f = await $this.pingServerPort()
    if (f)
    {
      this.runningServer = true
      await this.init()
    } else {
      this.createPingInterval()
      this.ready = false
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
      console.log(idx)
			let index = this.catalog[idx]
			this.tab = index
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
				return `${ this.colorList[0] }, ${opacity})`
			} else {
				let color = `${this.colorList[this.colorList.length % key+1]}, ${opacity})`
				return color
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
      if (this.interval){
        clearInterval(this.interval)
      }
      this.clearAll()
      this.runningServer = false
      this.ready  = false
      this.interval = setInterval(async ()=>{
        if (this.runningServer){
          clearInterval($this.interval)
        } else {
          try{
            let f = await $this.pingServerPort()
            if (f)
            {
              this.runningServer = true
              await this.init()
            }
          } catch(err){
              console.error("Could not get server status, check if it is running on port: ", process.env.PORT_SERVER)
              this.ready = false
              this.runningServer = false

          }
        }
        
      }, 2000)
    },
    async pingServerPort(){
      return FileService.pingServerPort()
    },
    async init(){
      try{
        const $this = this
        // let modules = await FileService.getModules()
        // this.modules = modules.data.data
        let defaults= await FileService.getDefaults()
        let catalog = await FileService.getInstalledModules()
        catalog = catalog.data.data.map((d,i)=>{
          d.idx = i
          return d
        })
        this.catalog = catalog
        if (process.env.NODE_ENV == 'development'){
          // let token = await FileService.createSession()
          this.$store.token = 'development'
        } else {
          let token = await FileService.createSession()
          this.$store.token = token.data.data
        }
        // // let serverStatus = await FileService.getServerStatus()
        // let dockerStatus = await FileService.getDockerStatus()
        this.defaults = defaults.data.data
        // this.services = services.data.data
        // this.procedures = procedures.data.data
        this.running = true
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

