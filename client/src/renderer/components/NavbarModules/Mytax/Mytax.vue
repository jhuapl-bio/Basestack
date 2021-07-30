<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="mytax" >
	  <b-form-file 
			ref="seq_folder" 
			:id="'seq_folder'" 
			aria-describedby="seq_folder" 
			v-model="fastqFolder"
			directory
			webkitdirectory
			:no-traverse="false"
			:multiple="true"
			:placeholder="'Choose a run Folder'"
			drop-placeholder="Drop folder here..."
		>
	  </b-form-file>
	  <b-button v-if="!modules.basestack_mytax.status.running" v-on:click="run_module_pipeline()"  class="btn tabButton" >
		<div class="in-line-Button" >
			<span>
				<font-awesome-icon   icon="hourglass-start"/>
			</span>
			<span>Run Pipeline</span></div>
	  </b-button>
	
	  <span v-b-tooltip.hover.top 
		title="Start Mytax"
		v-if="!modules.basestack_mytax.status.running"
		class="center-align-icon configure"
			@click="start_module()" >
		<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
	</span>
		
	<span v-b-tooltip.hover.top
		v-else 
		title="Cancel Mytax Sync"
		class="center-align-icon configure"
			@click="cancel_module()" >
		<font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
	</span>
	
	  <b-row>
		<b-table
			small
			id="module_table"
			class="formGroup-input"
			:items="[]"
			:fields="module_status_fields"
			sticky-header="700px"						        
		>
			
		</b-table>  
	  </b-row>
	<b-row v-if="modules.basestack_mytax_visualization && modules.basestack_mytax.status && modules.basestack.status.running">
		<object id ="mytaxObj" type="text/html" :data="`${modules.basestack_mytax.config.base}:${modules.basestack_mytax.config.port}`">
		</object>
	</b-row>
	<b-row v-else>
		<h4>Mytax isn't running</h4>
		<span v-b-tooltip.hover.top 
				title="Reload module ui, check logs if issues persist"
				class="center-align-icon configure"
  			 @click="start_module()" >
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

export default {
	name: 'Mytax',
	components: {
		Multiselect
	},
	props: ['modules', 'images', 'selectedTag'],
	data(){
		return {
			fastqFolder: null,
			module_status_fields: [
				{key: 'title', label: 'Title', sortable: false, class: 'text-center'},
          		{key: 'step', label: 'Step', sortable: false, class: 'text-center'},
          		{key: 'modules_complete', label: 'Modules Complete', sortable: false, class: 'text-center'},
          		{key: 'status', label: 'Status(es)', sortable: false, class: 'text-center'}
			],	
		}
	}, 
	async mounted(){
		console.log("start module")
		this.start_module()
	},
	computed: {
	  
	},

	beforeDestroy(){
		this.cancel_module()
    },
	methods: {
		open_link (link,e) {
			e.stopPropagation()
			this.$emit("open", link)
      	},
		async run_module_pipeline(){
			if (!this.fastqFolder || this.fastqFolder.length  == 0){
				this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  "No fastq Folder selected"
				})
			}
			await FileService.startModule({
				module: 'basestack_mytax_classify',
      			submodule: 'basestack_mytax_pipeline',
      		}).then((response)=>{
				this.count +=1
        	}).catch((error)=>{
		        console.error("-----------------", error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
		},
		async start_module(){
      		await FileService.startModule({
				module: 'basestack_mytax_visualization',
      			submodule: 'basestack_mytax_visualization',
      		}).then((response)=>{
				this.count +=1
        	}).catch((error)=>{
		        console.error("-----------------", error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
      	},
      	async cancel_module(){
      		await FileService.cancelModule({
				module: 'basestack_mytax'
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
	}
};
</script>

<style>
#mytax{
	height:100%;
    overflow-y:auto;
    width: 100%;
}

#mytaxObj{
  min-height: 90vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}

</style>