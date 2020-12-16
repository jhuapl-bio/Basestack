<template>
  <div id="moduleconfig"  style="">
   <label style="text-align:center" class="typo__label">Installation Type</label>
	<b-form-select v-model="selectedElement.installation.type"  :options="['offline', 'online']" >
	</b-form-select>
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
	export default {
		name: 'moduleconfig',
	    components: {},
	    props: ['selectedElement'],
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