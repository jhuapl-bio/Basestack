<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="moduleinstall"  style="overflow-y:auto">
  	<div class="text-center" >  
    	<h4 v-if="!docker">Docker is not running or installed</h4>
    	<Memory v-if="resources" v-bind:resources="resources"></Memory>
      	<Disk v-if="resources" v-bind:hoverElement="hoverElement" v-bind:resources="resources"></Disk>
  	</div>
	<b-row v-if="images">
    	<b-col sm="6" >
    	  <h4 style="text-align:center">Not Installed</h4>
          	<div v-for="[key, element] of Object.entries(available)" :key="key" >
		          <li class="list-group-item"  @mouseover="hoverElement = element" @mouseout="hoverElement = null">
	        		<b-row >
	        			<b-col sm="12" style="overflow-wrap: anywhere; text-align:center ">
	        				<span style="text-align:center">{{element.title}}</span>
	        				<span v-if="element.status.errors" class="center-align-icon warn-icon" style="float:right" v-tooltip="{
				            content: 'Error in installation, check logs',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            		<font-awesome-icon icon="times-circle" size="sm" />
			            	</span>
	        			</b-col>
	        		</b-row>
	        		<b-row>
			            <b-col sm="4"  style="text-align:center"> 
			            	<span class="center-align-icon"  v-tooltip="{
					            content: 'View Installation Logs',
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }" v-on:click="(selectedElement == stagedInstallation[key] ? showLog = !showLog : showLog = true); selectedElement = stagedInstallation[key]; ">
				            	<font-awesome-icon class="configure" icon="book-open" size="sm" />
				            </span>
						</b-col>
			            <b-col sm="4"  v-if="element.status.running">
		            		<div v-tooltip="{
					            content: 'This module is currently installing',
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }" style="margin:auto" class="">
				            	<half-circle-spinner
						          :animation-duration="1000"
						          style="
						          		margin:auto;
						          		
								  "
								  :size="20"
						          :color="'#2b57b9'"
						     	/>
					     	</div>
					 	</b-col>
			            <b-col sm="4" style="text-align:center" v-else> 
			            	<span class="center-align-icon"  v-if="docker" v-tooltip="{
					            content: 'Install Method: '+stagedInstallation[key].installation.type,
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }" v-on:click="selectedElement = stagedInstallation[key]; stagedInstallation[key].installation.type == 'online' ? install_online_dockers(element) : install_offline_dockers(element)">
				            	<font-awesome-icon class="configure" icon="play-circle" size="sm" />
				            </span>
			            </b-col>
			            <b-col sm="3"  v-if="!element.status.running" style="text-align:center"> 
			            	<span class="center-align-icon;" :id="'configInstall'+element.name"
			            		v-tooltip="{
					            content: 'Configure installation method',
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }"

			            	>
			            		<font-awesome-icon class="configure"  @click="(selectedElement == stagedInstallation[key] ? showConfig = !showConfig : showConfig = true); selectedElement = stagedInstallation[key];" icon="cog" size="sm"  />
						    </span>
						    
						</b-col>
						<b-col sm="3"  v-else style="text-align:center"> 
			            	<span class="center-align-icon"  v-tooltip="{
					            content: 'Cancel Install for: '+element.title,
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }" v-on:click=" stagedInstallation[key].installation.type == 'online' ? cancelDockerInstall(element) : restartApp(element.name)">
				            	<font-awesome-icon class="configure" icon="stop-circle" size="sm" />
				            </span>
						</b-col>
					</b-row>
		        </li>
			</div>
    	</b-col>
    	<b-col sm="6" >
    	  <h4 style="overflow-wrap: anywhere; text-align:center ">Installed</h4>
    	  <div v-for="[key, element] of Object.entries(installed)" :key="key" >
	          <li class="list-group-item" >
	            <b-row >
	            	<b-col sm="12" class="nodpadcolumn" style="overflow-wrap: anywhere; text-align:center ">
	    				<span style="text-align:center">{{element.title}}</span>
	    				<span v-if="element.status.errors" class="center-align-icon warn-icon" style="float:right" v-tooltip="{
				            content: 'Error in updating module, check logs',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
		            		<font-awesome-icon icon="times-circle" size="sm" />
		            	</span>
		            	<span class="center-align-icon"  v-tooltip="{
				            content: 'The module is attempting an update',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" style="float:right" v-else-if="element.status.running" >
			            	<font-awesome-icon icon="circle-notch" size="sm" />
			            </span>
	    				<span class="center-align-icon success-icon" style="float:right" v-else v-tooltip="{
				            content: 'This module is installed and operable',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span ><font-awesome-icon icon="check" size="sm"/></span>
			            </span>

	    			</b-col>
		            <b-col sm="3"  v-if="!element.status.running" style="text-align:center"> 
		            	<span class="center-align-icon;" :id="'configInstall'+element.name"
		            		v-tooltip="{
					            content: 'Configure installation method',
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }"
		            	>
		            		<font-awesome-icon class="configure"  @click="(selectedElement == stagedInstallation[key] ? showConfig = !showConfig : showConfig = true); selectedElement = stagedInstallation[key];" icon="cog" size="sm"  />
					    </span>
					</b-col>
					<b-col sm="3"  v-else style="text-align:center">
						<span class="center-align-icon"  v-tooltip="{
				            content: 'Cancel Install for: '+element.title,
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" v-on:click="stagedInstallation[key].installation.type == 'online' ? cancelDockerInstall(element) : restartApp(element.name)">
			            	<font-awesome-icon class="configure" icon="stop-circle" size="sm" />
			            </span> 
					</b-col>
		            <b-col sm="3" style="text-align:center" > 
		            	<span class="center-align-icon configure"  v-tooltip="{
				            content: 'Uninstall Module. RECOMMENDED Clean Images after selecting this',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span @click="remove_docker(element)" >
			            		<font-awesome-icon class="configure" icon="trash-alt" style="text-align:center"/>
			            	</span>
			            </span>
		            </b-col>
		            <b-col sm="3" style="text-align:center" v-if="!element.status.running"> 
		            	<span class="center-align-icon configure" v-if="docker"
		            	v-on:click="selectedElement = stagedInstallation[key]; stagedInstallation[key].installation.type == 'online' ? install_online_dockers(element) : install_offline_dockers(element)"
		            	v-tooltip="{
				            content: 'Update Module',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }"
		            	>	
			            	<font-awesome-icon  class="configure" icon="level-up-alt" size="sm" />
			            </span>
		            </b-col>
		            <b-col sm="3" style="text-align:center" v-else> 
		            	<span class="center-align-icon success-icon" style="float:right" v-tooltip="{
				            content: 'This module is currently updating',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" >
			            	<half-circle-spinner
					          :animation-duration="1000"
					          style="
					          		margin:auto;
					          		
							  "
							  :size="20"
					          :color="'#2b57b9'"
					     	/>
				     	</span>
		            </b-col>
		            <b-col sm="3" style="text-align:center" > 
			        	<span class="center-align-icon configure"  v-tooltip="{
				            content: 'View Logs (if any)',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" v-on:click="(selectedElement == stagedInstallation[key] ? showLog = !showLog : showLog = true); selectedElement = stagedInstallation[key]; ">
			            	<font-awesome-icon class="configure" icon="book-open" size="sm" />
				        </span>
				    </b-col>
		        </b-row>
	            
	          </li>
	        </div>
    	</b-col>
    </b-row>
    <b-row style="padding-top: 10px; padding-bottom:10px; " >
    	<b-col sm="6" class="text-center">
		    <button class="btn tabButton tabButton-stop" style="border-radius: 10px; " v-on:click="pruneImages()"  >
		        <div  >
	        		<font-awesome-icon  icon="trash-alt" style="text-align:center"/>
		        	<span>Clean Installs</span>
	        		<font-awesome-icon class="help" icon="question-circle" 
	        			v-tooltip="{
					        content: 'Prune ALL dangling docker images AND steopped containers. Helps save on space',
					        placement: 'top',
					        classes: ['warning'],
					        trigger: 'hover',
					        targetClasses: ['it-has-a-tooltip'],
					    }" 
				    />
		        </div>
		    </button>
		</b-col>
		<b-col sm="6" v-if="selectedElement"  class="text-center">
		    <button class="btn tabButton" style="border-radius: 10px; margin:auto" v-on:click="openFolder(meta.logFolder)" v-tooltip="{
		        content: '',
		        placement: 'top',
		        classes: ['warning'],
		        trigger: 'hover',
		        targetClasses: ['it-has-a-tooltip'],
		        }" >
		        <div >
		        	<font-awesome-icon  icon="book-open" style="text-align:center"/>
		        	<span>Open Logs</span>
		        	<font-awesome-icon class="help" icon="question-circle" 
	        			v-tooltip.html="{
					        content: 'Open Log Folder<br>Useful for viewing all log output or sending errors to developers.<br>Resets on exiting Basestack',
					        placement: 'top',
					        trigger: 'hover',
					        targetClasses: ['it-has-a-tooltip'],
					    }" 
				    />
		        </div>
		    </button>
		</b-col>
		<b-col sm="12" style="display:flex">
			<div class="logWindow" v-if="selectedElement && showLog">
				<div class="topline" style="vertical-align: center"  >
					<h3>{{selectedElement.title}}</h3>
					<div class="centerToggle" >
						  <span v-if="logInterval[selectedElement.name].pause" class="center-align-icon configure" style="" v-tooltip="{
				            content: 'Continue Logging',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" @click="stopLog=false; updateLogInterval(selectedElement.name, stopLog)">
			            		<font-awesome-icon icon="comment-slash" size="sm" />
			               </span>
			               <span v-else class="center-align-icon" style="" v-tooltip="{
				            content: 'Pause Logging',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" @click="stopLog=true; updateLogInterval(selectedElement.name, stopLog)">
			            		<font-awesome-icon class="configure" icon="comment" size="sm" />
			               </span>
					</div>
				</div>
				<div  v-if="logInterval[selectedElement.name].log.length > 0" id="logWindow" class="logDiv" style="height: 200px; overflow-y:auto; ">
					<code >
						<p v-for="(line, index) in logInterval[selectedElement.name].log" v-bind:key="`lineDockerLog-${index}`"> {{ line }}</p>
					</code>
				</div>	
			</div>
			<ModuleConfig :selectedElement="selectedElement" @updateSrc="updateSrc" v-if="selectedElement && showConfig"></ModuleConfig>
		</b-col>
	</b-row>
  </div>
</template>

<script>

    import FileService from '../../../services/File-service.js'
    import {HalfCircleSpinner} from 'epic-spinners'
    import ModuleConfig from "@/components/NavbarModules/ModuleInstall/ModuleConfig"
    import Disk from "@/components/NavbarModules/System/Disk";
  	import Memory from "@/components/NavbarModules/System/Memory";
    import path from 'path'
	export default {
		name: 'moduleinstall',
	    components: {
	    	HalfCircleSpinner, 
	    	ModuleConfig,
	    	Disk,
	    	Memory
	    },
	    props: ['modules', "images", "resources", "docker"],

		data() {
	      return {
	      	logInterval: {},
	      	isDragging: false,
	      	editable: true,
      		delayedDragging: false,
      		stagedLog: [],
      		selectedElement: null,
	      	installed: {},
	      	available: {},
	      	imageNames:{},
	      	perPage: 1,
	      	inc:0,
	      	selectedConfig: null,
	      	existsImagesLogInterval: {},
	      	errorAlert: {},
	      	tab:0,
	      	showLog: false,
	      	showConfig: false,
	      	stagedInstallation: {},
	      	offlineImage: null,
	      	meta: {},
	      	stopLog: false,
	      	hoverElement: null
		  }
		},

	    async mounted(){
	    	this.meta = await FileService.fetchMeta()
	    	this.meta = this.meta.data.data
			this.updateStatus(this.images)    	
	    },
	    beforeDestroy: function() {
	    	for (let i = 0; i < this.available.length; i+=1){
	        	this.removeInterval(this.available[i])
	    	}
	    },
	    watch: { 
		    images: {
		    	deep: true,
		    	handler(val){
		    		this.updateStatus(val)
		    	}
		    }
	    },
	    methods: {
	    	updateSrc(val){
	    		if (this.stagedInstallation[this.selectedElement.name]){
	    			this.stagedInstallation[this.selectedElement.name].installation = val
	    		}
	    	},
	    	updateLogInterval(name, val){
	    		if(this.$el.querySelector("#logWindow")){ 
	    			this.logInterval[name].pause = val
					if(!this.logInterval[name].pause){
						this.$el.querySelector("#logWindow").scrollTop =  this.$el.querySelector("#logWindow").scrollHeight 
					} 
				}
	    	},
	    	updateStatus(val){
				const $this = this
	    		this.installed = {}
	    		this.available = {}
				for(const [key, value] of Object.entries(val)){
					if (!$this.logInterval[key]){
						$this.logInterval[key] = {
							log: null,
							pause: false
						}
					}	
					if (value.status && !$this.logInterval[key].pause){
						$this.$set($this.logInterval[key], 'log', value.status.stream)
					}

					if (!value.status.installed){
						$this.$set($this.available, key, value)
					} else {
						$this.$set($this.installed, key, value)
					}
					if (!this.stagedInstallation[key]){
						this.stagedInstallation[key] = value
					}
				}
				if (this.selectedElement){
					this.updateLogInterval(this.selectedElement.name, this.stopLog)
				}
	    	},

	    	restartApp(imageName){
	    		const $this = this
	    		this.$swal.fire({
				    title: "Are you sure?",
				    text: "You will restart the entire app to cancel build (offline) for: "+imageName,
				    type: "warning",
				    showCancelButton: true,
				    confirmButtonColor: '#DD6B55',
				    confirmButtonText: 'Yes, I am sure I want to restart!',
				    cancelButtonText: "No, continue!"
				})
				.then(function(isConfirm) {
			      if (isConfirm.dismiss != 'cancel') {
			    	$this.$electron.ipcRenderer.send('restartApp')
			      } else {
			      	return false
			      }
			    })
	    	},
	    	openFolder (link) {
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
			async cancelDockerInstall(image,i){
				const $this = this
				this.$swal.fire({
				    title: "Are you sure?",
				    text: "You will cancel the online install process for: "+image.title,
				    type: "warning",
				    showCancelButton: true,
				    confirmButtonColor: '#DD6B55',
				    confirmButtonText: 'Yes, I am sure I want to cancel!',
				    cancelButtonText: "No, continue the building!"
				})
				.then(function(isConfirm) {
			      if (isConfirm.dismiss != 'cancel') {
			      	FileService.cancelInstallImage(image.name).then((response, error)=>{
						if (error){
							console.error(error)
				            $this.error_alert(error.response.data.message, "Error in canceling docker install")
						} else{
							$this.$swal.fire({
				              position: 'center',
				              icon: 'info',
				              showConfirmButton:true,
				              title:  "Canceled docker build process for: " + image.title
				            })
						}
					}).catch((err)=>{
						console.error(err)
				    	$this.error_alert(err.response.data.message, "Error in canceling docker install")
					})

			      } else {
			      	return false
			      }
			    })
			},
			async pruneImages(){
				const $this = this
				this.$swal.fire({
				    title: "Are you sure?",
				    text: "You will remove any and ALL dangling images. This is useful for removing unfinished or unneeded images no longer used by your system",
				    type: "warning",
				    showCancelButton: true,
				    confirmButtonColor: '#DD6B55',
				    confirmButtonText: 'Yes, I am sure!',
				    cancelButtonText: "No!"
				})
				.then(function(isConfirm) {
			      if (isConfirm.dismiss != 'cancel') {
			        FileService.pruneImages().then((message, error)=>{
			        	console.log(message)
						if (error){
				            $this.error_alert(error.response.data.message, "Error in pruning dockers")
						} else{
							$this.$swal.fire({
				              position: 'center',
				              icon: 'success',
				              showConfirmButton:true,
				              title:  "Pruned Dangling Docker Images",
				              html: `Space Reclaimed: ${message.data.data.SpaceReclaimed}`
				            })
						}
					}).catch((err)=>{
						$this.error_alert(err.response.data.message, "Failed to prune docker images")
					})
					$this.$swal.fire({
		              position: 'center',
		              icon: 'info',
		              showConfirmButton:true,
		              title:  "Pruning images, this may take a moment.... This process will operate in the background*"
		            }) 
			      } else {
			      	return false
			      }
			    })
			},
			
	    	
		   	async error_alert(err, title){
		    	let text;
	    		text = err
	    		console.log("error", err, title)
		        this.$swal.fire({
	                position: 'center',
	                icon: 'error',
	                showConfirmButton:true,
	                title:  title,
	                text:  text
	            }) 
		    },
	    	async install_offline_dockers(element){
	    		try{
	    			const name = element.name
	    			const i = name
		    		element.pause = false
		    		this.showLog = true
	    			this.$swal({
		              title: "Loading Docker images offline",
		              text: "Please wait..This may take some time",
		              icon: 'info',
		              showConfirmButton: true,
		              allowOutsideClick: true
		            });
		            this.errorAlert[name] = false
		            if (!this.stagedInstallation[element.name].src){
		            	this.error_alert("No offline file selected", "Error in loading offline Docker image!")
		            	return
		            }
		            if (this.available[i]){
		    			this.available[i].log = ['Building '+name+' from a compressed file, this may take some time...']
		            } else if(this.installed[i]){
		    			this.installed[i].log = ['Building '+name+' from a compressed file, this may take some time...']
		            }
	    			await FileService.loadImages(
	    				{
	    					name: element.name,
	    					config: this.stagedInstallation[element.name].installation,
	    					path: this.stagedInstallation[element.name].src.path
	    				}
	    			).then((response)=>{
	    			}).catch((error)=>{
	    				this.error_alert(error.response.data.message, "Error in loading offline Docker!")
	    			})
	    		} catch(err){
	    			this.error_alert(err, "Error in loading offline Docker!")

	    		}
	    	},
	    	async loadAllOnlineImages(imageName){
		    	const $this = this
		    	return new Promise(function (resolve, reject) {
			    	try{
			            FileService.loadImages({
		    				type: "online", 
		    				src: {
		    					name: imageName
		    				}
		    			})
		    			resolve()	
			        } catch(error){
			        	reject(error)
			        }	    		
		        })
		    },
	    	async install_online_dockers(element){
	    		let promises = []
	    		element.pause = false
	    		let errors = [];
	    		if (this.stagedInstallation[element.name].installation.resources){
	    			
	    			for (const [key, value ] of Object.entries(this.stagedInstallation[element.name].installation.resources)){
	    				if (value.type == 'file' && (value.src)){
	    					value['srcFormat'] = { filename: value.src.name, filepath: value.src.path }
	    				}
	    				if (!value.srcFormat){
	    					errors.push(key)
	    				}
	    			}
	    		}
	    		if (errors.length > 0){
	    			this.error_alert(errors.join(","), "Error in online resources needing to be provided!")
	    			this.showConfig = true
	    		} else{
		            await FileService.loadImages(
	    				{
	    					config: this.stagedInstallation[element.name].installation,
	    					name: element.name
	    				}
	    			)
		            .then((response)=>{
		            	this.$swal({
			              title: "Image Building process initiated",
			              text: "Please wait.. this may take some time",
			              icon: 'info',
			              showConfirmButton: true,
			              allowOutsideClick: true
			            });
		            })
	    			.catch((err)=>{
				        this.error_alert(err.response.data.message, "Error in loading docker image(s)!")
	    			})
	    			const imageName = element.name
	    			const i = imageName
	    			this.showLog = true
	    		}
	    	},
	    	async remove_docker(image, i){
	    		const $this = this
				this.$swal.fire({
				    title: "Are you sure?",
				    text: "You will remove: "+image.title+" used in this software.",
				    type: "warning",
				    showCancelButton: true,
				    confirmButtonColor: '#DD6B55',
				    confirmButtonText: 'Yes, I am sure I want to remove!',
				    cancelButtonText: "No, keep them."
				})
				.then(function(isConfirm) {
			      if (isConfirm.dismiss != 'cancel') {
			      	try{
		    			$this.$swal({
			              title: "Deleting image",
			              text: "Please wait..This may take some time",
			              icon: 'info',
			              showConfirmButton: true,
			              allowOutsideClick: true
			            });
		    			( async function() {
		    				await FileService.removeImages(image.name).then((msg, err)=>{
				    			$this.$swal.fire({
					              position: 'center',
					              icon: 'success',
					              showConfirmButton:true,
					              title:  "Docker image: "+image.title+" successfully deleted"
					            })
			    			}).catch((err2)=>{
			    				console.log(err2, "remove error")
			    				$this.$swal.fire({
					              position: 'center',
					              icon: 'warning',
					              showConfirmButton:true,
					              title:  err2.response.data.message
					            })
			    			})
		    			})()		    				
		    		} catch(err){
		    			console.log("err", err)
			            $this.error_alert(err.response.data.message, "Error in deleting docker images!")

		    		}
			      } else {
			      	return false
			      }
			    })
	    	}
	    }
	};
</script>

<style>
#moduleinstall{
	overflow-x:hidden;
	overflow-y:auto;
	height: 100%;
}
.tooltip-inner {
/* This will make the max-width relative to the tooltip's container, by default this is body */
 max-width: 100%; 
}

.list-group-item{
	border-radius: 0px;
}
.installationure{
	cursor:pointer;
}
</style>


