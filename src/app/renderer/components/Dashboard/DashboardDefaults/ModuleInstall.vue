<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="moduleinstall"  style="overflow-y:auto" ref="moduleinstall">
  	<!-- <div class="text-center" >  
  		<div v-if="system && system.docker && ( !system.docker.installed || !system.docker.running )" >
	    	<h4  class="text-white bg-danger">
	    		Docker is not {{ !system.docker.installed ?  'running or installed' : 'running or installed' }}
	    		<span class="center-align-icon;"
                	v-tooltip="{
	                  content: 'View README',
	                  placement: 'top',
	                  classes: ['info'],
	                  trigger: 'hover',
	                  targetClasses: ['it-has-a-tooltip'],
	                  }"
              	>
                <font-awesome-icon class="configure"  @click="open_link('https://github.com/jhuapl-bio/Basestack/#1-install-docker', $event)" icon="exclamation" size="sm"  />
            	</span> 
	    	</h4>
	    </div>
	    <v-row v-if="meta.images && status.images">
	    	<v-col sm="12" >
	    	  <h4 style="text-align:center">Modules</h4>
	          	<div v-for="[key, element] of Object.entries(meta.images)" :key="key" >
			          <li class="list-group-item"  
					  	@mouseover="hoverElement = element" 
						@mouseout="hoverElement = null">
		        		<v-row >
		        			<v-col sm="6" >
								<v-row>
									<v-col sm="12" style="overflow-wrap: anywhere; text-align:center ">
										<span style="text-align:center">{{element.title}}</span>
										<span v-if="status.images[element.name].errors" class="center-align-icon warn-icon" style="float:right" v-tooltip="{
										content: 'Error in installation, check logs',
										placement: 'top',
										classes: ['info'],
										trigger: 'hover',
										targetClasses: ['it-has-a-tooltip'],
										}">
											<font-awesome-icon icon="times-circle" size="sm" />
										</span>
										<span class="center-align-icon" style="float:left"  v-tooltip="{
											content: (!element.config.private ? 'Public Module' : 'This module is private and requires additional resources. View the Cog icon to see more.'),
											placement: 'top',
											classes: ['info'],
											trigger: 'hover',
											targetClasses: ['it-has-a-tooltip'],
											}">
											<span ><font-awesome-icon :icon="(!element.config.private ? 'unlock-alt' : 'user-lock')" size="sm"/></span>
										</span>
										<span class="center-align-icon configure"  style="float:right" v-tooltip="{
											content: 'Continue Logging',
											placement: 'top',
											classes: ['info'],
											trigger: 'hover',
											targetClasses: ['it-has-a-tooltip'],
											}" @click="scroll=!scroll">
												<font-awesome-icon :icon="(scroll ? 'comment' : 'comment-slash')" size="sm"/>
										</span>
										
									</v-col>
								</v-row>
								<v-row>
									<v-col sm="12" style="text-align:center; padding: 0px"> 
										<div style="display:flex; ">
											<div  class="logDiv" style="max-height: 200px; overflow-y:auto; ">
												<code >
													<p v-for="(line, index) in status.images[element.name].stream" v-bind:key="`lineDockerLog-${index}`">{{ line }}</p>
												</code>
											</div>	
										</div>
									</v-col>
								</v-row>
								
		        			</v-col>
							<v-col
								sm="6"
								>
								<v-row v-if="!status.images[element.name].installed">
									<v-col sm="6"  v-if="status.images[element.name].running">
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
									</v-col>
									<v-col sm="12" style="text-align:center" v-else> 
										<span class="center-align-icon"  v-if="system.docker.running" 
											v-tooltip="{
											content: 'Install Method: ' + stagedInstallation[key].installation.type,
											placement: 'top',
											classes: ['info'],
											trigger: 'hover',
											targetClasses: ['it-has-a-tooltip'],
											}" 
											v-on:click="selectedElement = stagedInstallation[key]; 
											stagedInstallation[key].installation.type == 'online' ? install_online_dockers(element) : install_offline_dockers(element)">
											<font-awesome-icon class="configure" icon="download" size="sm" />
										</span>
									</v-col>
									<v-col sm="6" v-if="status.images[element.name].running"  style="text-align:center"> 
										<span class="center-align-icon"  v-tooltip="{
											content: 'Cancel Install for: '+element.title,
											placement: 'top',
											classes: ['info'],
											trigger: 'hover',
											targetClasses: ['it-has-a-tooltip'],
											}" v-on:click=" stagedInstallation[key].installation.type == 'online' ? cancelDockerInstall(element) : restartApp(element.name)">
											<font-awesome-icon class="configure" icon="stop-circle" size="sm" />
										</span>
									</v-col>
								</v-row>
								<v-row v-else >
									<v-col sm="4" style="text-align:center" > 
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
									</v-col>
									<v-col sm="4" style="text-align:center" v-if="!status.images[element.name].running"> 
										<span class="center-align-icon configure" v-if="system.docker.running"
										v-on:click="selectedElement ={}; selectedElement = stagedInstallation[key]; stagedInstallation[key].installation.type == 'online' ? install_online_dockers(element) : install_offline_dockers(element)"
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
									</v-col> 

									<v-col sm="4" style="text-align:center" v-else> 
										<span class="center-align-icon success-icon" style="float:right" 
											v-tooltip="{
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
									</v-col>
									<v-col sm="4" v-if="!element.config.private">
										<span v-if="!status.images[element.name].fetching_available_images.status" class="center-align-icon info-icon" style="float:middle">
											<font-awesome-icon 
											@click="fetch_docker_tags(element.name)" 
											class="configure" 
											v-tooltip="{
												content: `Fetch all available version for this image. Requires Internet`,
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
											}"  icon="arrow-alt-circle-down" size="sm"/>
										</span>
										<span v-else
											style="margin:auto; text-align: center; min-width:20%; display:flex"
											v-tooltip="{
											content: `Fetching Available Tags through internet`,
											placement: 'top',
											classes: ['info'],
											trigger: 'hover',
											targetClasses: ['it-has-a-tooltip'],
											}"  icon="arrow-alt-circle-down" size="sm"
										>	
											<semipolar-spinner
												:animation-duration="4000"
												:size="20"
												style="margin: auto"
												:color="'#2b57b9'"
											/>
										</span>
									</v-col>
								</v-row>
								
								<v-table
									stacked
									style="overflow-wrap: anywhere; overflow-y: auto; max-height: 120px"
									class="text-center"
									small
									responsie
									:fields="fields"
									:items="[
										status.images[element.name]
									]"
									>
									<template  v-slot:cell(up_to_date)>
										<span class="center-align-icon text-warning" style="" 
											v-if="!element.config.private 
											&& status.images[element.name].fetching_available_images 
											&& status.images[element.name].fetching_available_images.errors" 
											v-tooltip="{
												content: 'There was an error checking on newer versions',
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
											}">
											<span ><font-awesome-icon icon="handshake-slash" size="sm"/></span>
										</span>
										<span class="center-align-icon warn-icon" style="" 
											v-else-if="!element.config.private 
												&& status.images[element.name].installed_digest != status.images[element.name].latest_digest" 
											v-tooltip="{
												content: 'This module is not up to date',
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
											}">
											<span ><font-awesome-icon icon="exclamation" size="sm"/></span>
										</span>
										<span class="center-align-icon warn-icon" style="" 
											v-else-if="element.config.private" 
											v-tooltip="{
												content: 'This module is private and has no public release tag',
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
											}">
											<span ><font-awesome-icon icon="user-lock" size="sm"/></span>
										</span>
										<span class="center-align-icon success-icon" style="" 
											v-else 
											v-tooltip="{
												content: 'This module is installed and up to date (public only)',
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
											}">
											<span ><font-awesome-icon icon="check" size="sm"/></span>
										</span>
									</template>
									<template  v-slot:cell(installed)="cell">
										<span 
										:class="[cell.value ? 'center-align-icon success-icon' : 'center-align-icon warn-icon']" 
										style="margin:auto; text-align:center" v-tooltip="{
												content: (cell.value ? 'Installed' : 'Not Installed'),
												placement: 'top',
												classes: ['info'],
												trigger: 'hover',
												targetClasses: ['it-has-a-tooltip'],
												}">
												<font-awesome-icon :icon="cell.value ? 'check' : 'times-circle' " size="sm" />
										</span> 
									</template>
								</v-table>
								<ModuleConfig 
									v-if="staged.images[key]"
									:imageName="key" 
									@updateSrc="updateSrc"
									>
								</ModuleConfig>
							</v-col>
						
						</v-row>
							
			        </li>
				</div>
	    	</v-col>
	    </v-row>
	    <v-row style="padding-top: 10px; padding-bottom:10px; " >
	    	<v-col sm="6" class="text-center">
			    <button class="btn tabButton tabButton-stop" style="border-radius: 10px; " v-on:click="pruneImages()"  >
			        <div  >
		        		<font-awesome-icon  icon="trash-alt" style="text-align:center"/>
			        	<span>Clean Installs</span>
		        		<font-awesome-icon class="help" icon="question-circle" 
		        			v-tooltip="{
						        content: 'Prune ALL dangling docker images AND stopped containers. Helps save on space',
						        placement: 'top',
						        classes: ['warning'],
						        trigger: 'hover',
						        targetClasses: ['it-has-a-tooltip'],
						    }" 
					    />
			        </div>
			    </button>
			</v-col>
			
		</v-row>
      	<Docker @toast="toast" v-if="system.resources " v-bind:resources="system.resources" v-bind:docker="system.docker"></Docker>
	    <hr>
    	<Memory v-if="system.resources" v-bind:resources="system.resources"></Memory>
      	<Disk v-if="system.resources" v-bind:hoverElement="hoverElement" v-bind:resources="system.resources"></Disk>
  	</div> -->
  </div>
</template>

<script>
    import FileService from '../../../services/File-service.js'
    // import {HalfCircleSpinner, SemipolarSpinner  } from 'epic-spinners'
    // import ModuleConfig from "@/components/Dashboard/DashboardDefaults/ModuleConfig"
	export default {
		name: 'moduleinstall',
	    components: {
	    	// HalfCircleSpinner, 
	    	// SemipolarSpinner ,
	    	// ModuleConfig,
	    },
		computed: {
		},
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
	      	stopLog: false,
	      	hoverElement: null,
			scroll: true,
			fields: [
				{
					key: 'inspect.Created',
					label: 'Created'
				},
				{
					key: 'installed',
					label: "Installed",
					sortable: false
				},
				{
					key: 'up_to_date',
					label: 'Latest?'
				},
				{
					key: 'installed_digest',
					label: 'Digest'
				}
			],
		  }
		},

	    mounted(){
			// setInterval((d)=>{
			// 	let p = this.$refs.moduleinstall.querySelectorAll(".logDiv")
			// 	if (this.scroll && p && p.length > 0){
			// 		p.forEach((element)=>{
			// 			element.scrollTop =  element.scrollHeight
			// 		})
			// 	}
				
			// }, 2000)
	    },
	    beforeDestroy: function() {
	    	for (let i = 0; i < this.available.length; i+=1){
	        	this.removeInterval(this.available[i])
	    	}
	    },
	    watch: { 
		    meta: {
		    	deep: true,
		    	handler(val){
		    		console.log(val)
		    	}
		    }
	    },
	    methods: {
	    	open_link (link,e) {
		    	e.stopPropagation()
		    	this.$electron.shell.openExternal(link)
		    },
	    	async fetch_docker_tags(name){
	    		try{
		    		let response = await FileService.fetchDockerTags({name: name})
	    		} catch(err){
	    			console.error(err)
	    		}
	    	},
	    	updateSrc(val){
				console.log(val,"changing")
				// this.$store.dispatch("UPDATESTAGEDDEPENDENCY", {name: val.name, value: val.value, index: val.key, target: val.target} )
	    		// if (this.stagedInstallation[val.name]){
	    		// 	this.stagedInstallation[val.name].installation = val
	    		// }
	    	},
	    	updateLogInterval(name, val){
	    		if(this.$el.querySelector(".logDiv")){ 
	    			this.logInterval[name].pause = val
					if(!this.logInterval[name].pause){
						this.$el.querySelector(".logDiv").scrollTop =  this.$el.querySelector("#logWindow").scrollHeight 
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
	    		const errors = []
				console.log(this.staged.images[element.name].installation)
	    		if (this.staged.images[element.name].installation.dependencies){
	    			this.staged.images[element.name].installation.dependencies.forEach((value)=>{
	    				if (!value.srcFormat){
	    					errors.push(value.name + ": " + (value.tooltip ? value.tooltip : ''))
	    				} 
	    			})
	    		}
	    		if (errors.length > 0){
	    			this.error_alert(errors.join(","), "Error in online resources needing to be provided!")
	    			this.showConfig = true
	    		} else{

		            await FileService.loadImages(
	    				{
	    					config: this.staged.images[element.name].installation,
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
	    	toast(toaster, val){
		      this.$emit('toast', toaster, val)
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
	font-size: 12px;
}
.installationure{
	cursor:pointer;
}
</style>


