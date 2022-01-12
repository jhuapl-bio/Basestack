<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-row  class="m-0 "  >
		<v-col cols="2" class=" elevation-4">
			<v-tabs 
				v-model="tab" 
				show-arrows
				vertical 
				icons-and-text 
				class=""
			>
			<v-tab 
					:class="[ 'tabSide', 'tabSideDefault',   ]"  
				>
				
				<v-tooltip right>
					<template v-slot:activator="{ on }">
						<div v-on="on" class=" tabSide" style="" v-if="!collapsed" >
						
							<span class="tabSideItemText">Dashboard</span>
						</div>
					</template>
					<span>Dashboard Home Page</span>
				</v-tooltip>
				<v-icon >$home</v-icon>
			</v-tab>
			<v-tab 
					centered
					v-for="[key, entry] in Object.entries(procedures)"
					v-bind:key="entry.name"
					:class="[ 'tabSide', 'tabSideDefault', isHovered == entry.name ? 'tabhovered' : ''  ]" 
					@mouseover="isHovered = entry.name" 
					@mouseleave="isHovered = null"
				>
				
					<v-tooltip right>
						<template v-slot:activator="{ on }">
							<div v-on="on" class=" tabSide" style="" v-if="!collapsed" >
								<span class="tabSideItemText">{{ ( entry.title  ? entry.title : key  ) }}</span>
							</div>
						</template>
						<span>{{ ( collapsed ? entry.title : entry.tooltip)}}</span>
					</v-tooltip>
					<v-icon :color="getColor(key, 0.8)" >{{ ( entry.icon  ? '$' + entry.icon : 'cog' ) }}</v-icon>
				</v-tab>
				
				<v-tab class="" style="justify-content:center"
					v-for="[key, entry] in Object.entries(defaults)"
					centered
					v-bind:key="entry.name"
					:class="[ 'tabSide', 'tabSideDefault', isHovered == entry.name ? 'tabhovered' : ''  ]" 
					@mouseover="isHovered = entry.name" 
					@mouseleave="isHovered = null"
				>
					<v-tooltip bottom>
						<template v-slot:activator="{ on }">
							<div v-on="on" class=" tabSide" style="" v-if="!collapsed" >
								<span class="tabSideItemText">{{ ( entry.title  ? entry.title : key  ) }}</span>
							</div>
						</template>
						<span>{{ ( collapsed ? entry.title : entry.tooltip)}}</span>
					</v-tooltip>
					<v-icon :color="getColor(key, 0.8)">{{ ( entry.icon  ? '$' + entry.icon : 'cog' ) }}</v-icon>
				</v-tab>
			</v-tabs>
		</v-col>
		<v-col cols="10" class="p-0 m-0">
			<v-tabs-items v-model="tab">
				<v-tab-item >
					<Dashboard
						:tab="0"
						@emitChange="emitChange"
					></Dashboard>
				</v-tab-item>
				<v-tab-item class="tabContent" v-for="[key, entry] in Object.entries(procedures)"
					v-bind:key="key">
					
					<component 
						:is="'Framework'"
						:moduleIdx="key"
						:services="entry.services"
						:procedure="entry"
						:procedureKey="key"
					>            	
					</component>
				</v-tab-item>
				<v-tab-item  v-for="[key, entry] in Object.entries(defaults)"
					v-bind:key="key">
					<component 
							:is="entry.component"
							:modules="modules"
							:defaults="defaults"
							:services="services"
							:moduleIdx="key+1 + modules.length"
							:defaultModule="entry"
						>            	
					</component>
				</v-tab-item>
			</v-tabs-items>
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

export default {
	name: 'mainpage',
	components:{
		Framework,
		Dashboard,
		Library,
		LogDashboard,
		CustomGenerator,
		PlayDashboard,
		Sys
	},
	
	props: ['modules', 'defaults', 'procedures', 'services'],
	data(){
		return{
			tab:8,
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
			index: 0,
			status: {},
			system: {},
		}
	},
	created(){
		
	},
	watch:{
		
	},
	computed: {
	  myProps() {
	    	return { 
	    		
	    	}
	  }
	},
	mounted(){
		const $this = this				
	},

	methods: {
		renderIcon(entry){
			return this.$vuetify.icons.home
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
	/*overflow-y:hidden;*/
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