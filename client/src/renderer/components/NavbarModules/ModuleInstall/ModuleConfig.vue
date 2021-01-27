<template>
  <b-row id="moduleconfig"  style="">
  	<b-col sm="12">
	   <label style="text-align:center" class="typo__label">Installation Type</label>
		<b-form-select v-model="selectedElement.installation.type"  :options="['offline', 'online']" >
		</b-form-select>
		<b-row v-if="selectedElement.installation.type =='offline'">
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
	    </b-row> 
	    <b-row v-if="selectedElement.installation.type =='online' && selectedElement.installation.resources">
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
	    </b-row>
	    <b-row v-if="selectedElement.installation.type =='online'" style="max-width:100%">
	    	<b-col sm="12" class="overflow-auto">
			    <b-table
					:fields="tag_fields"
					:items="images[selectedElement.name].tags"
					striped
					style="max-width: 100%; text-align:center; font-size: 0.8em"
					:current-page="currentPage"
					:per-page="perPage"
					
				>
					<template  v-slot:cell(remove)="option" >
						<span  v-if="!selectedElement.status.running && option.item.installed" class="center-align-icon info-icon" style="float:middle"  v-tooltip="{
				            content: 'Remove version',
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span ><font-awesome-icon @click="remove_specific(option.item)" class="configure" icon="trash-alt" size="sm"/></span>
			            </span>
					</template>
					<template v-slot:cell(name)="option">
						<p v-tooltip="{
				            content: `${option.item.digest}`,
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">{{option.item.name}}</p>

					</template>
					<template  v-slot:cell(download)="option" >
						<span  v-if="!selectedElement.status.running" class="center-align-icon info-icon" style="float:middle"  v-tooltip="{
				            content: (!option.item.installed ? 'Download this version' : 'Update'),
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span ><font-awesome-icon @click="install_specific(option.item)" class="configure" :icon="(!option.item.installed ? 'arrow-alt-circle-down' : 'level-up-alt')" size="sm"/></span>
			            </span>
			            <span v-else class="center-align-icon info-icon" style="float:middle"  v-tooltip="{
				            content: `Can only install one version of each module at a time`,
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span ><font-awesome-icon  icon="slash" size="sm"/></span>
			            </span>
					</template>
					<template  v-slot:cell(select)="option" >
						<span class="center-align-icon info-icon" style="float:middle" v-if="option.item.installed" v-tooltip="{
				            content: `Click to use this version of the module within Basestack`,
				            placement: 'top',
				            classes: ['info'],
				            trigger: 'hover',
				            targetClasses: ['it-has-a-tooltip'],
				            }">
			            	<span ><font-awesome-icon @click="updateSelectedTag(option.item)" class="configure" icon="check-circle" size="sm"/></span>
			            </span>
					</template>
					<template  v-slot:cell(selected)="option" >
						{{option.item.fullname == selectedElement.selectedTag.fullname}}
					</template>
				</b-table>
				
			</b-col>
		</b-row>
		<b-row>
			
			<b-col sm="8">
				<b-pagination
			      v-model="currentPage"
			      :total-rows="selectedElement.tags.length"
			      :per-page="perPage"
			      aria-controls="my-table"
			    ></b-pagination>
			</b-col>
			<b-col sm="4" v-if="!selectedElement.private" style="display:flex; text-align:middle; margin:auto; text-anchor:middle">
	            	<span class="center-align-icon info-icon" style="display:flex"><font-awesome-icon @click="fetch_docker_tags(selectedElement.name)" class="configure" v-tooltip="{
		            content: `Fetch all available version for this image. Requires Internet`,
		            placement: 'top',
		            classes: ['info'],
		            trigger: 'hover',
		            targetClasses: ['it-has-a-tooltip'],
		            }"  icon="arrow-alt-circle-down" size="sm"/></span>
		            <span v-if="selectedElement.status.fetching_available_images"
               		style="margin:auto; text-align: center; min-width:20%; display:flex"
		    		>	<p style="margin:auto; text-align:center">Fetching</p>
	                  	<looping-rhombuses-spinner
					          :animation-duration="4000"
					          :size="20"
					          style="margin: auto"
					          :color="'#2b57b9'"
					     />
		    		</span>
			</b-col>
			
		</b-row>
	    <div v-if="!selectedElement.status.installed">
	    	<span>Estimated Size: {{selectedElement.estimated_size}} GB</span>
	    </div>
	    <div v-if="selectedElement.status.installed && selectedElement.status.inspect">
	    	<span>Installed Size: {{convert_gb(selectedElement.status.inspect.Size, 'B')}} GB</span>
	    </div>
	</b-col>
  </b-row>
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
	    props: ['selectedElement', 'images'],
		data() {
			return {
				src:[],
				tag_fields: [
					{
						key: 'version',
						label: 'Version'
					},
					{
						key: 'download',
						label: 'Download'
					},
					{
						key: 'installed',
						label: "Installed"
					},
					{
						key: 'remove',
						label: 'Remove'
					},
					{
						key: 'selected',
						label: 'Selected'
					},
					{
						key: 'select',
						label: 'Select'
					},
					
					
				],
				currentPage:1,
				perPage: 5,
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
	    	install_specific(tag){
	    		this.$emit('installSpecific', tag)
	    	},
	    	remove_specific(tag){
	    		this.$emit('removeSpecific', tag)
	    	},
	    	updateSelectedTag(tag){
	    		this.$emit('updateSelectedTag', tag)
	    	},
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