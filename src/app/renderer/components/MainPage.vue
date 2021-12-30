<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<div class="mainContent">
		<b-tabs 
	        v-model="tab" 
	        nav-wrapper-class="w-3 sideWrapper" 
	        left align="center"  
        	active-nav-item-class="activeTabButton"
        	style="height: 100vh; padding:0px !important" 
        	vertical
        >
		  <b-tab  
		  	class="mainTabContent"
			
		  >
		  	<template v-slot:title style="" class="ModuleTabTitle">
				<div class="tabSide" style="justify-content:center;">
					<div class="tabSideItem" style="text-align:center"
					>	
						<span style=""
							v-tooltip="{
							content: 'Dashboard Home',
							placement: 'top',
							classes: ['info'],
							trigger: 'hover',
							targetClasses: ['it-has-a-tooltip'],
						}"
						>
							<font-awesome-icon class="" icon="home"/>
						</span>
					</div>
					<div class="tabSideItem">
						<span  v-if="!collapsed">
							Dashboard
						</span>
					</div>
				</div>
  			</template>
		  	<div class="tabContent">
  				<h2 class="header header-major" style="">Dashboard</h2>
            	<Dashboard
					:tab="0"
					@emitChange="emitChange"
				></Dashboard>
				
            </div>
			
			  
		  </b-tab>
		  
          <b-tab  
          	v-for="(entry, key) in procedures"
          	v-bind:key="entry.name"
		  	class="mainTabContent"
			vertical end
            > 
            <template v-slot:title  class="ModuleTabTitle" >
				<div  @mouseover="isHovered = entry.name" @mouseleave="isHovered = null">
					<div :class="[ 'tabSide',  isHovered == entry.name ? 'tabhovered' : ''  ]" :style="{ 'justify-content': 'center', 'background': getColor(key, 0.2) }" >
						<div :class="[ 'tabSideItem' ]" style="text-align:center"
						>
							<span class="tabIcon"
								:style="{ 'justify-content': 'center', 'color': getColor(key, 0.8) }"
								v-tooltip="{
								content: entry.tooltip,
								placement: 'top',
								classes: ['info'],
								trigger: 'hover',
								targetClasses: ['it-has-a-tooltip'],
							}"
							>
								<font-awesome-icon class="" :icon="(entry.icon ? entry.icon : 'cog')"/>
							</span>
						</div>
						<div class="tabSideItem" style="text-align:center"
						>
							<span style=""
							v-if="1!==1"
							v-tooltip="{
							content: 'An Update is available',
							placement: 'top',
							classes: ['info'],
							trigger: 'hover',
							targetClasses: ['it-has-a-tooltip'],
							}"
							>
								<font-awesome-icon class="configure warn-icon" icon="exclamation"/>
							</span>
						</div>
						<div class="tabSideItem">
							<span style="text-align:center; " v-if="!collapsed">
								{{ entry.title }}
							</span>
						</div>
					</div>
				</div>
  			</template>
  			<div  class="tabContent">
  				<h3 class="header header-minor" >{{entry.title}}
			      <span v-if="entry.tooltip" v-b-tooltip.hover.top 
			        :title="entry.tooltip"
			        style="" >
			        <font-awesome-icon class="help" icon="question-circle"  />
			      </span>
			    </h3>

            	<component 
            		:is="'Framework'"
					:moduleIdx="key"
            		:services="entry.services"
					:procedure="entry"
					:procedureIdx="key"
            	>            	
            	</component>
            </div>
          </b-tab>
		  <b-tab  
		  	class="mainTabContent"
			v-for="(entry, key) in defaults"
          	v-bind:key="key"
		  >
		  	<template v-slot:title >
            	<div  :class="[ 'tabSide', 'tabSideDefault', isHovered == entry.name ? 'tabhovered' : ''  ]" @mouseover="isHovered = entry.name" @mouseleave="isHovered = null" class="tabSide" style="justify-content:center" >
					<div class="tabSideItem" style="text-align:center"
					>
						<span style=""
		            	v-tooltip="{
			            content: entry.tooltip,
			            placement: 'top',
			            classes: ['info'],
			            trigger: 'hover',
			            targetClasses: ['it-has-a-tooltip'],
			            }"
		            	>
		            		<font-awesome-icon class="configure" :icon="(entry.icon ? entry.icon : 'cog')"/>
		            	</span>
		            </div>
					<div class="tabSideItem" style="text-align:center">
						<span  v-if="!collapsed">
							{{ entry.title }}
						</span>
					</div>
	        	</div>
  			</template>
		  	<div >
  				<component 
            		:is="entry.component"
					:modules="modules"
					:defaults="defaults"
					:moduleIdx="key+1 + modules.length"
					:defaultModule="entry"
            	>            	
            	</component>
            </div>
			  
		  </b-tab>
      	  	<template v-slot:tabs-start  style="padding:0px !important; ">
		          <b-nav-item role="presentation"  href="#">
		          	<button class="btn collapseButton"  @click="toggleCollapse()"><div :id="'collapseSidebar'" class="in-line-Button" ><span><font-awesome-icon  style="margin:auto; justify-content: center;text-align:center " icon="bars"/></span></div></button>
		          </b-nav-item>	      	  		
      	  	</template>
      	  	<template v-slot:tabs-end >
	          	<div id="emblem"><img v-bind:class="[collapsed ? 'shrunkButtonImg' : 'ButtonImg']" src="../../static/img/apl_sheild_blue_only.png" /></div>
	        </template>
        </b-tabs>
        
	</div>
</template>

<script>



import Framework from '@/components/Framework/Framework'
import Dashboard from "@/components/Dashboard/Dashboard"
import LogDashboard from "@/components/Dashboard/DashboardDefaults/LogDashboard"
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
		PlayDashboard,
		Sys
	},
	
	props: ['modules', 'defaults', 'procedures', 'services'],
	data(){
		return{
			tab:5,
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
		
		emitChange(value){
			this[value.target] = value.value
	    },
		hovered(event, entry){
			entry.hovered = event
			return event
		},
		getColor(key, opacity){
			const $this = this;
			// `${colorList.length - colorList[colorList.length % key]}, 0.8)`
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