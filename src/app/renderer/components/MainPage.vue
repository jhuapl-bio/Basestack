<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-row  class="" style="" >
		<v-col cols="12" style="" >
		<v-toolbar
			color=""
		>
			<v-app-bar-nav-icon>
				<v-img   :src="require('@/assets/apl_sheild_blue_only.png')" fluid alt="JUHAPL" ></v-img>
			</v-app-bar-nav-icon>
			<!-- <v-divider hidden vertical class="mx-4"></v-divider> -->
			<v-toolbar-title class="text-h6 mr-6 ">Basestack</v-toolbar-title>
			<!-- <v-divider hidden vertical class="mx-4"></v-divider> -->
			<v-autocomplete
				:items="Object.values(procedures)"
				chips dense
				@input="setTabProcedureNew($event)"
				v-model="indexLabel"
				:filter="filter"
				clearable
				hide-details
				hide-selected
				item-text="name"
				item-value="name"
				label="Search for a procedure..."
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
					<v-list-item-action>
					<!-- <v-btn icon>
						<v-icon color="grey lighten-1">mdi-information</v-icon>
					</v-btn> -->
					<v-tooltip right v-if="item.status.running ">
						<template v-slot:activator="{ on }">
						<div v-on="on">
							<fulfilling-bouncing-circle-spinner
							:animation-duration="3000"
							:size="10"
							style="margin-left:0%;"
							:color="'#2b57b9'"
						/>
						</div>
						</template>
						Procedure is Running 1 or more service(s)
					</v-tooltip>
					 <v-tooltip right v-else-if="item.status.error ">
						<template v-slot:activator="{ on }">
						<v-icon v-on="on" x-small color="orange darken-2">$exclamation-triangle</v-icon>
						</template>
						{{item.status.error}}
					</v-tooltip>
					</v-list-item-action>
					
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
			<v-tooltip bottom>
				<template v-slot:activator="{ on }">
					<v-tab @click="tab=0" v-on="on" class="ml-2" style="" v-if="!collapsed" >
						<v-icon @click="setTab(0, 'dashboard')" class="configure" medium >$home</v-icon>
					</v-tab>
				</template>
				<span>Home Dashboard</span>
			</v-tooltip>
			<v-menu
				left
				bottom
			>
				<template v-slot:activator="{ on, attrs }">
				<v-btn
					icon
					v-bind="attrs"
					v-on="on"
				>
					<v-icon>$bars</v-icon>
				</v-btn>
				</template>

				<v-list>
					<v-list-item
						v-for="[key, entry] in Object.entries(defaults)"
						centered
						v-bind:key="entry.name"
						@click="setTab(key, 'default')"
					>
						<v-tooltip left>
							<template v-slot:activator="{ on }">
								<v-tab v-on="on" class="" style="" v-if="!collapsed" >
									<v-icon  class="mr-2" x-small :color="getColor(key, 0.8)">{{ ( entry.icon  ? '$' + entry.icon : 'cog' ) }}</v-icon>
									<span class="tabSideItemText">{{parseInt(key)+1}}. {{ ( entry.title  ? entry.title : key  ) }}</span>
								</v-tab>
							</template>
							<span>{{ ( collapsed ? entry.title : entry.tooltip)}}</span>
						</v-tooltip>
					</v-list-item>
				</v-list>
			</v-menu>
			<template v-slot:extension>
				<v-tabs 
					v-model="tabProcedure" 
					show-arrows centered
					next-icon="$arrow-alt-circle-right"
					prev-icon="$arrow-alt-circle-left"
					icons-and-text 
					color="blue-grey"
        			slider-color="light"
					:hide-slider="hideSlider"
				>
				<v-tab 
						centered
						v-for="(entry,key) in Object.values(procedures)"
						v-bind:key="entry.name"
						:class="[  isHovered == entry.name ? 'tabhovered' : ''  ]" 
						@mouseover="isHovered = entry.name" 
						@mouseleave="isHovered = null"
						@click="selected = 'procedures'"
					>
						<v-tooltip bottom>
							<template v-slot:activator="{ on }">
								<div v-on="on" class=" " style="" v-if="!collapsed" >
									<span class="tabSideItemText">{{ ( entry.title  ? entry.title : entry.name  ) }}</span>
								</div>
							</template>
							<span>{{ ( collapsed ? entry.title : entry.tooltip)}}</span>
						</v-tooltip>
						<v-icon :color="getColor(key, 0.8)"  small>{{ ( entry.icon  ? '$' + entry.icon : 'cog' ) }}</v-icon>
					</v-tab>
					
					
				</v-tabs>
				</template>
				
			</v-toolbar>
		</v-col>
		<v-col cols="12" class="pt-0 mt-0 mb-0 pb-0" >
			<div v-if="selected == 'procedures'"  >
				<v-tabs-items  v-model="tabProcedure" >
					<v-tab-item :transition="false" class="tabContent pt-0 mt-0 mb-0 pb-0" v-for="[key, entry] in Object.entries(procedures)"
						v-bind:key="key">
						<component 
							:is="'Framework'"
							class="mainTabContent"
							:moduleIdx="key"
							:services="entry.services"
							:procedure="entry"
							:procedureKey="key"
						>            	
						</component>
					</v-tab-item>
					
				</v-tabs-items>
			</div>
			<div v-else>
				<div  v-if="selected == 'dashboard'" :transition="false" class="pt-0 mt-0 mb-0 pb-0"> 
					<Dashboard
						:tab="0"
						class="mainTabContent"
						@emitChange="emitChange"
					></Dashboard>
				</div>
				<div v-else :transition="false" class="tabContent pt-0 mt-0 mb-0 pb-0"  
					>
					<component 
							:is="defaults[tab].component"
							:modules="modules"
							:defaults="defaults"
							:services="services"
							class="mainTabContent"
							:moduleIdx="tab+1 + modules.length"
							:defaultModule="defaults[tab]"
						>            	
					</component>
				</div>
			</div>
		</v-col>
	</v-row>
</template>

<script>



import Framework from '@/components/Framework/Framework'
import Dashboard from "@/components/Dashboard/Dashboard"
import LogDashboard from "@/components/Dashboard/DashboardDefaults/LogDashboard"
import CustomGenerator from "@/components/Dashboard/DashboardDefaults/CustomGenerator"
import PlayDashboard from "@/components/Dashboard/DashboardDefaults/PlayDashboard"
import Sys from "@/components/Dashboard/System/Sys"
import Library from '@/components/Dashboard/DashboardDefaults/Library'
import {FulfillingBouncingCircleSpinner } from 'epic-spinners'

export default {
	name: 'mainpage',
	components:{
		Framework,
		Dashboard,
		Library,
		LogDashboard,
		CustomGenerator,
		PlayDashboard,
		Sys,
		FulfillingBouncingCircleSpinner
	},
	
	props: ['modules', 'defaults', 'procedures', 'services'],
	data(){
		return{
			tab:0,
			tabProcedure: 0,
			selected: 'dashboard',
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
			indexLabel: null,
			index: 0,
			tabFind:0,
			status: {},
			system: {},
			isLoading: false,
		}
	},
	created(){
		
	},
	watch:{
		indexLabel(newValue, oldValue){
			let index = 0
			if (newValue ){
				this.tab = this.labels.indexOf(newValue) + 1;
			}
	  	},
		
		
	},
	computed: {
	  hideSlider(){
		  if (this.selected == 'procedures'){
			  return false
		  } else {
			  return true
		  }
	  },
	  labels(){
		  let i = 0;
		  let labels = Object.keys(this.procedures)
		  return labels
	  }
	},
	mounted(){
		const $this = this				
	},

	methods: {
		renderIcon(entry){
			return this.$vuetify.icons.home
		},
		setTab(indx, key){
			this.selected = key
			this.tab = indx
		},
		setTabProcedureNew(key){
			let index = Object.keys(this.procedures).indexOf(key)
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
				console.log(item.name, d) 
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

			// console.log(randomElement)
			// return `${ randomElement}, ${opacity})`
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
	  async componentImport(component){
		//   let componentImport = require(`@/components/NavbarModules/${component}/${component}`)
		  
		//   this.component(component)
	  },
	  toggleCollapseParent(){
      	this.data.collapsed = !this.collapsed
      },
      toggleCollapse(){
        this.collapsed = !this.collapsed;
        this.$emit('toggleCollapseParent', this.collapsed)
      },
      
	}
};
</script>

<style>
#mainpage2{
	position:absolute;
}


  #emblem{
    height: 8%;
    padding-top: 20px;
    text-align: center;
    margin-bottom:5px;
    padding-bottom: 5px;
    fill:none;
    background:white;
  }
  .shrunkButtonImg{
    /* max-width: 100%;
    max-height: 100%; */
    display:none;
  }
  .ButtonImg{
    /* max-height:100%; max-width:100%; */
 }
.fa-icon {
  vertical-align: middle !important;
}
 
 
</style>
<style lang="css">
	@import '../../static/css/style.css';
</style>
<style lang="css">
	@import '../../static/css/myriadpro.css';
</style>
<style lang="css">
	@import '../../static/css/revised_branding_banner.css';
</style>
<style>
	@import '../../static/css/tooltip.css';
</style>
<style scoped>



</style>