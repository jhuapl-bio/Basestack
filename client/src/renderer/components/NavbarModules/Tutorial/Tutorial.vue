<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="tutorial" >
  	<b-row class="nopadcolumn" style="height:100%" v-if="count > 0 && modules.basestack_tutorial && modules.basestack_tutorial.status.running">
		<div class="col-md-9 videoPanel align-top nopadcolumn" v-if="selectedVideo">
			<b-row>
				<video preload="auto" ref="videoRef" type="video/mp4" v-if="selectedVideo" :src="selectedVideo.fullpath" id="video-container" style="width: 100% !important; max-height: 50vh; vertical-align: top" controls ></video>
			</b-row>
			<b-row class="nopadcolumn">
				<b-col sm="12" class="nopadcolumn">
					<h4 class="header" style="text-align:left; padding-left:10px ">Content
				  	</h4>
				</b-col>
			</b-row>
			<b-row class="contentDiv" style="padding-top:0px; padding-bottom:5px; padding-left:10px; padding-right:10px; border-radius:0px; ">
				<div class="col-md-6 align-top nopadcolumn" style="">
	    	 		<h5 style="margin:auto; text-align:center; background:#eeeeee; vertical:align:middle">Timestamp</h5>
		 			<div class="input-prepend" style="width:100%; display:flex; ">
					    <b-form-textarea  class="inputBox" style="padding-bottom:0px; margin-bottom:0px; width:90%; " v-model="description" ref="descriptionInput" id="descriptionInput"   v-tooltip="{
				            content: 'Set a custom description and timestamp for bookmarking a point in the video',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }" placeholder="Description" >
				 		</b-form-textarea>
			            <button class="btn quickJumpButton" style=" width: 15%; "  v-on:click="timestampVideo">
				    		<span><font-awesome-icon  icon="plus" style="margin:auto"/></span>
			 			</button>
					</div>
		    	 	<div class="col-md-9">
			 			<multiselect 
						  class="mt-3 resourcesList"
						  :show-labels="false"
						  :options="resources.filter((d)=>{return selectedVideo[d]})" 
						  @input="open" 
						  :searchable="false" :allow-empty="false">
						  <template slot="placeholder" style="width:100% !important">
						  	<div style="display: flex; width:100% !important; text-align:left !important; justify-content: space-between;">
						  		<font-awesome-icon  icon="book-open" style="padding-right: 2px; vertical-align:middle"/>
						  		<span style="text-align:right">Additional Resources</span>
						  	</div>
						  </template>
						</multiselect>
				 	</div>
				</div>
				<div class="col-md-6 nopadcolumn" style="max-height: 60vh; overflow-y:auto">
			 		<h5  style="margin:auto; text-align:center; background:#eeeeee; vertical:align:middle">Bookmarks</h5>
					<b-row v-for="(chapter, index) in selectedVideo.chapters" :key="`${index}`" class="nopadcolumn ">
			 				<b-button   class="quickJumpButton"    @click="setTime(chapter.time)">
			 					<b-row class="nopadcolumn">
									<b-col sm="5" class="nopadcolumn" style="">
 										<p class="text-xs-left" style="font-size: 1em" >{{ index }}.</p>
			 							<span v-if="chapter.type == 'custom'" class="center-align-icon configure"  v-tooltip="{
								            content: 'Remove timestamp that has been customly set',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }" v-on:click="removeTimestamp(chapter)">

								            <font-awesome-icon  icon="trash-alt" style="margin:auto"/>
								        </span>
		 							</b-col>
									<b-col sm="7" class="nopadcolumn" style=" float:left; text-align:left !important">
		 								<p class="text-xs-right" style="font-size: 1em">{{ chapter.title }}</p>
		 								<p  class="text-xs-left" style="font-size: 1em;" >{{ formatTime( chapter.time ) }}</p>
									</b-col>
		 						</b-row>
			 				</b-button>
		 			</b-row>
				</div>
			</b-row>
		</div>
		<div class="col-md-3 align-top" style="padding:0px; height:100% !important"  v-if="videos.length > 0">
			<div class="row align-top" style="text-align:center; padding-left:5px; padding-right:0px; border-bottom: 1px solid rgba(238, 238, 238);">
		  		<span style="text-align:center; margin:auto;" 
		  		>
		  			<span v-b-tooltip.hover.top 
						title="Access the course videos on Youtube"
						class="center-align-icon configure"
						@click="open_link('https://youtu.be/r4WCcBZLItM', $event)"
		  			>
		  				<font-awesome-icon  icon="video" style="margin-right: 10px"/>
		  			</span>
		  			<span v-b-tooltip.hover.top 
						class="center-align-icon configure"
				  		title="Access the course material on Google Drive"
				  		@click="open_link('https://drive.google.com/drive/folders/1EcgnWdQatPG1FzVu3bTZ56DHBTmALP3e', $event)"
				  	>
			  			<font-awesome-icon  icon="archive" style="margin-left: 10px; margin-right: 10px"/>
			  		</span>
			  		<span v-b-tooltip.hover.top 
		  				title="Reload Videos"
		  				class="center-align-icon configure"
			  			 @click="fetchVideosMeta('new')" >
			  			<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
			  		</span>
			  		<span v-b-tooltip.hover.top 
		  				title="Cancel Tutorial Sync"
		  				class="center-align-icon configure"
			  			 @click="cancel_tutorials()" >
			  			<font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
			  		</span>
		  		</span>
		  	</div>
			<div class="tutorial-nav" v-if="modules.basestack_tutorial.status.running">
					<div v-for="module in videos" class="align-top" :key="module.name" >
						<div  class="modules align-top" style=" cursor:pointer; text-align:right !important;" @click="selectedVideo = video; selectedModule = module;" v-for="video in module.sections" :key="video.fullpath"  >
							<b-row>
								<b-col sm="6" class="nopadcolumn" >
									<video :ref="'staged-'+video.title" style="width: 100% !important; height: 100%%; vertical-align: top; " oncontextmenu="return false;">
								 		<source :src="video.fullpath" type="video/mp4"/>
									</video>
								</b-col>
								<b-col sm="6" class="nopadcolumn" >
									<b-row class="nopadcolumn" >
										<b-col sm="12">
									 		<p class="text-xs-left" style="font-size:0.8em">{{ video.title }}</p>
									 	</b-col>
									</b-row>
									<b-row class="nopadcolumn" >
										<b-col sm="12">
								 			<p class="text-xs-right" style="font-size:0.8em; " v-if="video.duration">{{ video.duration | moment('mm:ss') }}</p>
								 		</b-col>
								 	</b-row>
								 </b-col>
							</b-row>
	 					</div>
			    	 	
		    	 	</div>
		    </div>	    	 	
		</div>
	</b-row>
	<b-row v-else>
		<h4>Tutorial Module isn't running</h4>
		<span v-b-tooltip.hover.top 
				title="Reload Videos, check logs if issues persist"
				class="center-align-icon configure"
  			 @click="fetchVideosMeta('new')" >
  			<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
  		</span>
	</b-row>
  </div>
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>

import FileService from '@/services/File-service.js'
import moment from "moment"
import Multiselect from 'vue-multiselect'
import path from "path"
import "vue-moment"

export default {
	name: 'Tutorial',
	components: {
		Multiselect
	},
	props: ['modules', 'images', 'selectedTag'],
	data(){
		return {
			videoFilePath: null,
			selectedVideo: null,
			selectedModule:null,
			videos: [],
			resources: ['script', 'pdf', 'pptx'],
			description:null,
			chapters: null,
			srcMaterial:null,
			src:null,
			time:0,
			test:null,
			rerender:false,
			count : 0,
			durationInterval: null
		}
	}, 
	async mounted(){
		await this.fetchVideosMeta('new')
	},
	computed: {
	  
	},

	beforeDestroy(){
        clearInterval(this.durationInterval)
    },
	methods: {
		open_link (link,e) {
			e.stopPropagation()
			this.$emit("open", link)
      	},
      	convert_seconds: function (val) {
	    	return moment(val, "second").format("h:m:s.S", {trim:false})
	  	},
	  	imageUrlAlt(event) {
    		event.target.src = "alt-image.jpg";
		},
      	async start_tutorials(){
      		await FileService.startModule({
      			module: 'basestack_tutorial'
      		}).then((response)=>{
				this.count +=1
        	}).catch((error)=>{
        		console.error(error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
      	},
      	async cancel_tutorials(){
      		await FileService.cancelModule({
				module: 'basestack_tutorial'
        	}).then((response)=>{
        		this.$swal.fire({
					position: 'center',
					icon: 'success',
					showConfirmButton:true,
	                title:  response.data.message
				})

        	}).catch((error)=>{
        		console.error(error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
      	},
		formatTime(seconds){
			return moment.utc(seconds*1000).format('HH:mm:ss')
		},
		open (key) {
			this.$emit("open", this.selectedVideo[key])
      	},
		setTime(time){
			this.$refs.videoRef.currentTime = time
		},
		sourceMaterial(path) {
	    	return require(path)
	  	},
		async changeVideo(){
			if (this.$refs.videoRef){
				this.$refs.videoRef.currentTime = 0
			}
			this.time = 0
		},
		async removeTimestamp(chapter){
			const name = this.selectedModule.name
			const section = this.selectedVideo
			await FileService.removeTimestamp({
				video: name,
				title: chapter.title,
				section: this.selectedVideo
			}).then((response)=>{
				const customs = {}
				response.data.data.forEach((d)=>{
					customs[d.title] = 1
				})
				this.selectedVideo.chapters = this.selectedVideo.chapters.filter((d)=>{
					if (d.type == 'custom'){
						return 	customs[d.title] ? true : false					
					} else {
						return d
					}
				});
				this.fetchVideosMeta('keep')
        	}).catch((error)=>{
        		console.error(error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
		},
		async timestampVideo(){
			if(!this.description || this.$refs.videoRef.currentTime < 0 ){
				this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  "You must designate a title for the timestamp and for it to be at an appropriate place in the video"
				})
			}
			else{	
				const name = this.selectedModule.name
				const time   = this.$refs.videoRef.currentTime
				const section = this.selectedVideo
				this.time = time
				await FileService.timestampAdd({
					time: this.$refs.videoRef.currentTime,
					video: name,
					section: section,
					title: this.description
				}).then((response)=>{
					this.selectedVideo.chapters.push(response.data.data)
					this.fetchVideosMeta('keep')
	        	}).catch((error)=>{
	        		this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
		                title:  error.response.data.message
					})
	        	})
	        }
		},
		async fetchVideosMeta(type){
			FileService.fetchVideosMeta().then((response)=>{
				const meta = response.data.data
				const metaKeys = Object.keys(meta)
				let metaList = []
				for (var i=0; i < metaKeys.length; i++){
					const sections = meta[metaKeys[i]].sections
					for (let j = 0; j < sections.length; j++){
						sections[j].video = sections[j].fullpath
						sections[j].duration = null
					}
					metaList.push(
						{
							name: metaKeys[i],
							sections: sections,
							video: meta[metaKeys[i]].video,
						}
					)
				}
				this.videos = metaList
				// if (type =='new'){
				// 	this.start_tutorials(type).then(()=>{
				// 		this.durationInterval = setInterval(()=>{
				// 			let nullFound = false
							
				// 			this.videos.forEach((mod)=>{
				// 		  		mod.sections.forEach((section)=>{	
				// 			  		if (this.$refs['staged-'+section.title])	{
				// 			  			section.duration = this.$refs['staged-'+section.title][0].duration
				// 			  		}  		
				// 			  		if (section.duration == undefined){
				// 			  			nullFound = true
				// 			  		}		
				// 		  		})
				//   			})
				//   			if ((this.modules.basestack_tutorial.status.running && !nullFound) || !this.images.basestack_tutorial.status.installed || !this.modules.basestack_tutorial.status.running){
				// 				clearInterval(this.durationInterval)
				// 			}
				// 		}, 600)
							
				// 	})
				// }
				
				if (!this.selectedVideo){
					if (this.videos.length > 0){
						const mod = this.videos[0]
						this.selectedModule = mod;
						if (mod.sections.length >0 ){
							this.selectedVideo = mod.sections[0]
						}
					}
				}
				if(this.$refs.videoRef){
					this.$refs.videoRef.currentTime  = this.time
				}
				return 
        	}).catch((error)=>{
        		console.error(error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
		},
	}
};
</script>

<style>
#tutorial{
	width: 100%;
	height:100% !important;
	/*overflow-y:auto;*/
	/*overflow-x:auto;*/
}
.videoPanel{
  border: 0px solid black;
  height: 100% !important;
}

.resourcesList{
	color: #2b57b9;
	font-size: 0.9em;
	text-align:center;
	margin:auto;
	overflow: visible !important;
	position: relative;
	background: none;
}
.timestamp{
	width: 100%;
	overflow-x: hidden;
	background: #EEE;
	overflow-y:hidden;
}
.tutorial-nav{
	border: 0px solid black;
	background: #fff;
	overflow-y:auto;
	max-height:80% !important;
}
.extraTutorial{
	padding-top:50px;
}
</style>