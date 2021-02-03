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
        	v-if="initial || started"        	
        >
          <b-tab  
          	v-for="[key, entry] of Object.entries(modules)" 
          	v-bind:key="entry.name"
          	class="ma-0 pa-0"
            > 
            <template v-slot:title v-if="(!entry.module || entry.status.installed )  && initial">
            	<div class="tab-parent" style="display: flex; justify-content: space-between;"
				>	
					<div class="tab-item" style="">
		            	<span v-if="entry.module && images[entry.image].latest_digest != images[entry.image].installed_digest && !images[entry.image].private" style="text-align:left; text-anchor: start;"
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
		            	<span v-else-if="entry.name == 'moduleinstall' && !docker" style="text-align:left; text-anchor: start;"
		            	v-tooltip="{
			            content: 'Docker is not running. See Services Tab at the top of Basestack or refer to the README',
			            placement: 'top',
			            classes: ['info'],
			            trigger: 'hover',
			            targetClasses: ['it-has-a-tooltip'],
			            }"
		            	>
		            		<font-awesome-icon class="configure warn-icon" icon="exclamation"/>
		            	</span>
		            	<span v-else
		            	 style="text-align:left; text-anchor: start;">
		            		<font-awesome-icon class="configure" :icon="entry.icon"/>
		            	</span>
		            	<span style="  text-anchor: end; text-align:right; vertical-align:middle; white-space: nowrap; padding-left: 10px; font-size: 0.8em" v-if="!collapsed">
		            		{{ entry.title }}
		            	</span>
		            </div>
	        	</div>
  			</template>
  			<div v-if="(!entry.module || entry.status.installed )  && initial">
  				<h2 class="header" style="text-align:center">{{entry.title}}
			      <span v-if="entry.tooltip" v-b-tooltip.hover.top 
			        :title="entry.tooltip"
			        style="" >
			        <font-awesome-icon class="help" icon="question-circle"  />
			      </span>
			    </h2>

            	<component 
            		:is="entry.component" 
            		:histories="histories" 
            		@updateHistory="updateHistory" 
            		@updateModules="updateModules"
            		@updateImages="updateImages"
            		@open="open"
            		class="contentDiv"
            		v-bind:images="images"
            		v-bind:selectedTag="null"
            		v-bind:modules="modules"
            		v-bind:resources="resources"
            		v-bind:docker="docker"
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
	          	<div id="emblem"><img v-bind:class="[collapsed ? 'shrunkButtonImg' : 'ButtonImg']" src="../../../static/img/apl_sheild_blue_only.png" /></div>
	        </template>
        </b-tabs>
        <div v-else style=" height:100vh; width:100%">
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
	    </div>
	</div>
</template>

<script>
import Introduction from '@/components/NavbarModules/Introduction/Introduction'
import System from '@/components/NavbarModules/System/System'
import Nextstrain from '@/components/NavbarModules/Nextstrain/Nextstrain'
import IGV from '@/components/NavbarModules/IGV/IGV'
import RAMPART from '@/components/NavbarModules/RAMPART/RAMPART'
import BasestackConsensus from "@/components/NavbarModules/BasestackConsensus/BasestackConsensus"
import ModuleInstall from "@/components/NavbarModules/ModuleInstall/ModuleInstall"
import Logs from "@/components/NavbarModules/Logs/Logs"
import About from "@/components/NavbarModules/About/About"
import Tutorial from "@/components/NavbarModules/Tutorial/Tutorial"
import {HalfCircleSpinner} from 'epic-spinners'
import FileService from '@/services/File-service.js'
export default {
	name: 'mainpage',
	components:{
		Introduction,
		System,
		Nextstrain,
		RAMPART,
		IGV, 
		BasestackConsensus,
		ModuleInstall,
		Logs,
		About,
		Tutorial,
		HalfCircleSpinner
	},
	data(){
		return{
			histories: [],
			data:{
			      name: null,
			      fastqDir: null,
			      primerDir: null,
			      reportDir: null,
			      newState: true,
			      protocolDir: null,
			},
			initial:false,
			collapsed:false,
    		tab: 9,
	        entries: null,
	        resources: null,
	        docker:null,
	        modules: null,
	        images: null,
	        intervalChecking: false,
	        patchNotes: null,
	        interval: null,
	        started: false
		}
	},
	watch:{
		initial(val){
			if (!val){
				try{
					this.init().catch((err)=>{
						console.error(`Error in initializing the backend ${err}`)
					})
				} catch(err){
					console.error(err)
				}
			}
		}
	},
	computed: {
	  myProps() {
	    	return { 
	    		data: {
		    		name: this.name,
		    		fastqDir: this.fastqFolder,
		    		protocolDir: this.protocolFolder,
		    		primerDir: this.primerFolder,
		    		reportDir: this.reportFolder,
		    		annotationsDir: this.annotationsFolder,
		    		newState: this.newState,
		    		history: this.history
		    	},
		    	patchNotes: null
	    	}
	  }
	},
	async mounted(){
		const $this = this
		this.init().then((response)=>{
			this.getStatus().then(()=>{
				this.started = true
				this.interval = setInterval(()=>{
					if (!this.intervalChecking){
						$this.getStatus()
					}
				}, 2500)
			})
		}).catch((err)=>{
			console.error(err)
		})
	 	this.$electron.ipcRenderer.on('mainNotification', (evt, message)=>{
	 		if (message.patchNotes){
		 		$this.patchNotes = message
	 		} 
		 	this.$swal.fire({
              position: 'center',
              icon: message.icon,
              showConfirmButton:true,
              title:  "",
              html: message.message,
              didOpen: () => {
              	if (message.loading){
              		$this.$swal.showLoading()
              	}
    		  }
            })
	 	})
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
      async init(){
      	try{
	      	let response = await FileService.init()
      		return response
		} catch(err){
			console.error(err)
			this.$swal.fire({
                position: 'center',
                icon: 'error',
                showConfirmButton:true,
                title:  "Error in starting initialization",
                text:  err.response.data.message
            }) 
			throw err
		}      		
      	
      },
      async getStatus(){
      	try{
      		this.intervalChecking = true
	      	let response = await FileService.getModules()
			this.$set(this, 'images', response.data.data.images.entries)
			this.$set(this, 'modules', response.data.data.modules.entries)
			this.$set(this, 'resources', response.data.data.resources)
			this.$set(this, 'docker', response.data.data.docker)
			const images = response.data.data.images.entries
			this.initial = response.data.data.ready
			if (!this.initial){
				this.init().catch((err)=>{
					console.error(`${err} in initializing the backend service`)
				})
			}
			// console.log(images)
			const modules = response.data.data.modules.entries
			let errors_modules = response.data.data.modules.errors
			let errors_images = response.data.data.images.errors
			let completed = response.data.data.images.completed
			let errors_message = "";
			for (let i = 0; i < errors_modules.length; i++){
				errors_message += `Modules: {errors_modules[i].name} : ${errors_modules[i].error}\n`
			}
			for (let i = 0; i < errors_images.length; i++){
				errors_message += `Image: {errors_images[i].name}: ${errors_images[i].error} \n`
			}
			if ((errors_message).length > 0){
				this.$swal.fire({
	                position: 'center',
	                icon: 'error',
	                showConfirmButton:true,
	                title:  "Docker image error...",
	                text:  ""+ JSON.stringify(errors_message, null, 4)
	            }) 
			}
			if (completed.length > 0){
				this.$swal.fire({
	                position: 'center',
	                icon: 'success',
	                showConfirmButton:true,
	                title:  "Docker image build completed for modules:",
	                text:  completed.join(', ') 
	            }) 
			}
		} catch(err){
			this.initial=false
			console.err(`${err} error in getting status`)
		} finally {
			this.intervalChecking = false
		}
      },
      updateHistory(val){
      	this.histories = val
      	
      	this.$set(this.data, val)
      },
      updateModules(val){
      	console.log(val, "update module")
      },
      updateImages(val){
      	const i = this.entries.map((d)=>{return d.name}).indexOf(val.image)
      	// console.log("_________________", val)
      	this.entries[i].installed = val.exists
      },
      toggleCollapseParent(){
      	this.data.collapsed = !this.collapsed
      },
      toggleCollapse(){
        this.collapsed = !this.collapsed;
        this.$emit('toggleCollapseParent', this.collapsed)
      }
	}
};
</script>

<style>
#mainpage{
	height:100%;
	width: 100%;
	position:absolute;
	/*overflow-y:hidden;*/
}

.mainContent{
	-webkit-background-clip: padding-box; /* for Safari */
    background-clip: padding-box; /* for IE9+, Firefox 4+, Opera, Chrome */
	padding: 0px;
	height:100% !important;
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
	@import '../../../static/css/style.css';
</style>
<style lang="css">
	@import '../../../static/css/myriadpro.css';
</style>
<style lang="css">
	@import '../../../static/css/revised_branding_banner.css';
</style>
<style>
	@import '../../../static/css/tooltip.css';
</style>