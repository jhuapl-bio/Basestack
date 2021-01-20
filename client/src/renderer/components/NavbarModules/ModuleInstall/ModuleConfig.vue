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
    <b-table
		:fields="tag_fields"
		:items="[selectedElement]"
		striped
	>
		<template v-slot:head(available)="item">
			<div style="">
				{{item.label}}
				<span v-if="!selectedElement.private" class="center-align-icon" style=" float:right"   v-tooltip="{
	            content: 'Search Available Tags',
	            placement: 'top',
	            classes: ['info'],
	            trigger: 'hover',
	            targetClasses: ['it-has-a-tooltip'],
	            }">
	        		<font-awesome-icon  class="configure" icon="arrow-alt-circle-down" @click="fetch_docker_tags(selectedElement.name)" size="sm" />
	        	</span>
	        </div>
		</template>
		<template  v-slot:cell(available)="row" style="max-width: 50%">
			<multiselect 
              v-if="selectedElement.available_images"
			  v-model="row.item.selectedInstallTag"  
			  :options="row.item.available_images"
			  :searchable="true" 
			  :close-on-select="false" 
			  :preselect-first="true" 
			  track-by="name" 
			  label="name" 
			  class="formGroup-input"
			  :show-labels="false" 
			  placeholder="Pick a tag" 
			  select-label="" 
			  :allow-empty="false"
			  >
			</multiselect>
			<span v-if="selectedElement.status.fetching_available_images"
           		style="margin:auto; text-align: center; max-width:50%; display:flex"
	    	>	
				<looping-rhombuses-spinner
			          :animation-duration="4000"
			          :size="20"
			          style="margin: auto"
			          :color="'#2b57b9'"
			     /><p style="margin:auto; text-align:center">Searching for Versions</p>
			</span>
		 </template>
		 <template  v-slot:cell(installed)="row">
		 	{{selectedElement.latest_digest}}
			<multiselect 
               v-model="row.item.selectedTag" 
               v-if="selectedElement.tags" 
               :options="row.item.tags"
			  :searchable="true" 
			  :close-on-select="false" 
			  :preselect-first="true" 
			  class="formGroup-input"
			  :show-labels="false" 
			  placeholder="Pick a tag" 
			  track-by="name" 
			  label="name" 
			  select-label="" 
			  :allow-empty="false"
			  >
			  <template slot="singleLabel" slot-scope="{ option }">
			  	<strong>{{ option.name }} {{option.digest}}</strong>
			  	<p v-if="option.digest == selectedElement.latest_digest"> (latest)</p>
			  </template>
			</multiselect>
		 </template>
	</b-table>
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
	import Multiselect from 'vue-multiselect'
    import FileService from '../../../services/File-service.js'
	export default {
		name: 'moduleconfig',
	    components: {
	    	Multiselect, 		
	    	LoopingRhombusesSpinner
	    },
	    props: ['selectedElement'],
		data() {
			return {
				src:[],
				tag_fields: [

					{
						key: 'available',
						label: "Available Tags"
					},
					{
						key: 'installed',
						label: 'Installed Tags'
					}

				]
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
		    		let response = await FileService.fetchDockerTags(name)
		    		console.log(response)
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