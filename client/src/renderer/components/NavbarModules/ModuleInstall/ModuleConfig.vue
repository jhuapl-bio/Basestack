<template>
  <div id="moduleconfig"  style="">
   <label style="text-align:center" class="typo__label">Installation Type</label>
   	<div style="display:flex">
		<b-form-select v-model="selectedElement.installation.type"  :options="['offline', 'online']" >
		</b-form-select>
		<span class="center-align-icon info-icon" style="display:flex"><font-awesome-icon @click="fetch_docker_tags(selectedElement.name)" class="configure" v-tooltip="{
	        content: `Fetch all available version for this image. Requires Internet`,
	        placement: 'top',
	        classes: ['info'],
	        trigger: 'hover',
	        targetClasses: ['it-has-a-tooltip'],
	        }"  icon="arrow-alt-circle-down" size="sm"/>
		</span>
	    <span v-if="images[selectedElement.name].status.fetching_available_images.status"
			style="margin:auto; text-align: center; min-width:20%; display:flex"
		>	<p style="margin:auto; text-align:center">Fetching</p>
	      	<looping-rhombuses-spinner
		          :animation-duration="4000"
		          :size="20"
		          style="margin: auto"
		          :color="'#2b57b9'"
		     />
		</span>
	</div>
	<div v-if="selectedElement.installation.type =='offline'">
    	<b-form-file 
             :ref="'docker_archive'+selectedElement.name" 
             :id="'docker_archive'+selectedElement.name" 
             aria-describedby="seq_file" 
             v-model="selectedElement.src"
             style="max-width: 100%"
             placeholder="Drag/choose docker image (offline)"
             drop-placeholder="Drop .tar.gz file here"
             >
        </b-form-file> 
    </div> 
    <div v-if="selectedElement.installation.type =='online' && selectedElement.installation.resources">
    	<div v-for="[indexr, resource] of Object.entries(selectedElement.installation.resources)" :key="indexr" >
    		<div v-if="resource.type =='file'">
    			<label style="text-align:center" class="typo__label">{{resource.name}}</label>
		        <font-awesome-icon class="help" icon="question-circle"  v-if="resource.tooltip" v-b-tooltip.hover.top 
		        	:title="resource.tooltip"/>
    			<b-form-file 
	                 v-model="resource.src"
	                 style="max-width: 100%"
	                 :placeholder="resource.name"
	                 drop-placeholder="Place File here"
	                 >
	            </b-form-file> 
	            
    		</div>
    	</div>
    </div>
    <div v-if="!selectedElement.status.installed">
    	<span>Estimated Size: {{selectedElement.estimated_size}} GB</span>
    </div>
    <div v-if="selectedElement.status.installed && selectedElement.status.inspect">
    	<span>Installed Size: {{convert_gb(selectedElement.status.inspect.Size, 'B')}} GB</span>
    </div>
  </div>
</template>

<script>
	import { LoopingRhombusesSpinner } from 'epic-spinners'
	export default {
		name: 'moduleconfig',
	    components: {LoopingRhombusesSpinner},
	    props: ['selectedElement', 'images'],
		data() {
			return {
				src:[]
			}
	  	},
	    mounted(){
	    },
	    watch: { 
	    	selectedElement: {
		    	deep: true,
		    	handler(selectedElement){
		    		this.$emit('updateSrc', selectedElement.installation)
		    	}
		    },
	    },
	    methods: {
			async fetch_docker_tags(name){
	    		try{
		    		let response = await FileService.fetchDockerTags({name: name})
	    		} catch(err){
	    			console.error(err)
	    		}
	    	},
	    	convert_gb(size, val){
	    		if (val =='MB'){
		    		return size / 1000 
	    		} else {
	    			return (size / 1000000000).toFixed(2)
	    		}
	    	}
	    }
	};

</script>
<style>
#moduleconfig{
	width:100%;
}
</style>