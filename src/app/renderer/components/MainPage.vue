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
	        nav-wrapper-class="w-3" 
	        left align="center"  
        	active-nav-item-class="activeTabButton"
        	style="height: 100vh; " 
        	vertical
        >
          <b-tab  
          	v-for="(entry, key) in modules"
          	v-bind:key="entry.name"
          	class="ma-0 pa-0"
            > 
            <template v-slot:title v-if="(entry.module  ) ">
            	<div class="tab-parent" style="display: flex; justify-content: space-between;"
				>	
					<div class="tab-item" style="">
		            	<span style="text-align:left; text-anchor: start;"
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
		            	<span style="  text-anchor: end; text-align:right; vertical-align:middle; white-space: nowrap; padding-left: 10px; font-size: 0.8em" v-if="!collapsed">
							{{ entry.title }}
						</span>
		            </div>
	        	</div>
  			</template>
  			<div v-if="(entry.module ) ">
  				<h2 class="header" style="text-align:center">{{entry.title}}
			      <span v-if="entry.tooltip" v-b-tooltip.hover.top 
			        :title="entry.tooltip"
			        style="" >
			        <font-awesome-icon class="help" icon="question-circle"  />
			      </span>
			    </h2>

            	<component 
            		:is="'Framework'"
					:moduleIdx="key"
            		:workflows="entry.workflows"
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
        <!-- <div v-else style=" height:100vh; width:100%">
        	<div style="top: 35%; margin:auto">
	        	<h4 style="text-align:center; margin:auto; top: 35%">Loading</h4>
	        	<half-circle-spinner
		          :animation-duration="1000"
		          style="vertical-align:middle !important; margin:auto; top: 35%"
				  :size="100"
		          :color="'#2b57b9'"
		     	>
		     	</half-circle-spinner>
		 	</div>
	    </div> -->
	</div>
</template>

<script>
import {HalfCircleSpinner} from 'epic-spinners'
import FileService from '@/services/File-service.js'


import Framework from '@/components/Framework/Framework'


export default {
	name: 'mainpage',
	components:{
		HalfCircleSpinner,
		Framework
	},
	
	props: ['modules', 'defaults'],
	data(){
		return{
			tab: 1,
			modulesInner: [],
			collapsed: false,
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
		  let componentImport = require(`@/components/NavbarModules/${component}/${component}`)
		  
		  this.component(component)
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
	height:100%;
	width: 100%;
	position:absolute;
	/*overflow-y:hidden;*/
}

.mainContent{
	-webkit-background-clip: padding-box; /* for Safari */
    background-clip: padding-box; /* for IE9+, Firefox 4+, Opera, Chrome */
	padding: 0px;
	height:100vh !important;
	/*position:absolute;*/
	/*margin:auto;*/
	overflow-y:hidden;
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
    max-width: 100%;
    max-height: 100%;
    display:none;
  }
  .ButtonImg{
    max-height:100%; max-width:100%;
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