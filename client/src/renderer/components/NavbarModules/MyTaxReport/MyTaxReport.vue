<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="mytaxreport" >
	  <b-row>
		  <b-col sm="6">
			<b-form-group
				id="fieldset-1"
				label="Pipeline"
				label-for="input-1"
				>
				<multiselect v-model="cmd" 
					deselect-label="" 
					track-by="key" 
					select-label=""
					:preselect-first="true"
					label="title" placeholder="Select one" 
					:options="modules.basestack_mytax_report.pipelines" 
					:searchable="false" 
					:allow-empty="false"
				>
				</multiselect>
			</b-form-group>
			<div v-if="cmd && cmd.key == 'basestack_mytax_report' ">
				<b-form-group
					id="fieldset-1"
					label="Classifier"
					label-for="input-1"
					>
					<multiselect v-model="classifier" 
						deselect-label="" 
						track-by="name" 
						select-label=""
						:preselect-first="true"
						label="name" placeholder="Select one" 
						:options="modules.basestack_mytax_report.resources.classifiers" 
						:searchable="false" 
						:allow-empty="false"
					>
					</multiselect>
				</b-form-group>
				<b-form-group
					id="fieldset-1"
					description=""
					label="Fastq File"
					label-for="input-1"
					>
					<b-form-file 
						v-model="fastqFolder"
						:placeholder="'Choose a fastq file'"
						drop-placeholder="Drop file here..."
					>
					</b-form-file>
				</b-form-group>
				<b-form-group
					v-if="classifier"
					id="fieldset-1"
					label="Database"
					label-for="input-1"
					>
					<multiselect v-model="db" 
						deselect-label="" 
						select-label=""
						track-by="name" 
						label="name" 
						:preselect-first="true"
						placeholder="Select one" 
						:options="classifier.dbs" 
						:searchable="false" 
						:allow-empty="false"
					>
					</multiselect>
				</b-form-group>
			</div>
			<div v-else>
				<b-form-group
					id="fieldset-1"
					label="Flukraken DB Path"
					label-for="input-1"
					description="Warning, folder must not be empty"
				>
					<b-button
						@click="electronOpenDir"
					> Select Folder
					</b-button>
				</b-form-group>
			</div>
			<b-form-group>
				<span v-b-tooltip.hover.top 
					title="Start Mytax"
					v-if="!modules.basestack_mytax_report.status.running"
					class="center-align-icon configure"
						@click="start_module()" > Start Module
					<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
				</span>
					
				<span v-b-tooltip.hover.top
					v-else 
					title="Cancel Mytax Sync"
					class="center-align-icon configure"
						@click="cancel_module()" > Cancel Module
					<font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
				</span>
			</b-form-group>
			
		</b-col>
	    <b-col sm="6" v-if="module_statuses">
			<b-table
				small
				id="module_table"
				class="formGroup-input"
				:items="module_statuses"
				:fields="module_status_fields"
				sticky-header="700px"						        
			>	
				<template  v-slot:cell(status)="row">
					<font-awesome-icon :class="[ 'text-success' ]" 
						v-if="row.item.status == 1" 
						icon="check" 
					/>
				</template>
				
			</b-table>
			<span v-if="modules.basestack_mytax_report.status.running"
				style="margin:auto; text-align: center; min-width:20%; display:flex"
			>	
				<looping-rhombuses-spinner
						:animation-duration="4000"
						:size="20"
						style="margin: auto"
						:color="'#2b57b9'"
					/><p style="margin:auto; text-align:center">Running</p>
			</span>  
		</b-col>
	</b-row>
  </div> 
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>

import FileService from '@/services/File-service.js'
import moment from "moment"
import Multiselect from 'vue-multiselect'
import path from "path"
import { LoopingRhombusesSpinner } from 'epic-spinners'

export default {
	name: 'Mytax',
	components: {
		Multiselect,
		LoopingRhombusesSpinner
	},
	props: {
		modules: {
			required:true
		},
		images: {},
		selectedTag: {}
	},
	data(){
		return {
			fastqFolder: null,
			data: null,
			module_statuses: [],
			cmd: null,
			db:null,
			interval: null,
			dbPath: null,
			classifier: null,
			module_status_fields: [
				
			],	
		}
	}, 
	mounted(){
	},
	computed: {
	  
	},
	watch : {
		fastqFolder(val) {
			this.data = { dirpath: path.dirname(val.path), filepath: val.path, filename: val.name }
		},
		data(val){
			this.get_status(val)
		}
	},

	beforeDestroy(){
		this.cancel_module()
		this.interval = null		
    },
	methods: {
		formatNames(files) {
        	return files.length === 1 ? `${files[0].name} selected` : `${files.length} files selected`
      	},
		electronOpenDir(evt){
			this.$electron.ipcRenderer.on('getValue', (evt, message)=>{
				this.data = { dirpath: message, dirname: path.dirname(message) }

			})
			this.$electron.ipcRenderer.send("openDirSelect", "")
			
		},
		open_link (link,e) {
			e.stopPropagation()
			this.$emit("open", link)
      	},
		async start_module(){
			if (this.cmd.key == "basestack_mytax_report"){
				if (!this.fastqFolder || this.fastqFolder.length  == 0){
					this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
						title:  "No fastq Folder selected"
					})
					return 
				}
				
			} else {
				if (!this.data){
					this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
						title:  "No dir selected to create database"
					})
					return 
				}
			}
			const $this = this
			await FileService.startModule({
				module: 'basestack_mytax_report',
      			submodule: 'basestack_mytax_report',
				db: this.db,
				classifier_name: this.classifier.name,
				cmd: this.cmd,
                data: this.data
      		}).then((response)=>{
				this.count +=1
				this.$swal({
					title: `Running mytax report.`,
					type: 'success',
					text: "Check log streams for more information on status",
					icon: "success",
					confirmButtonColor: '#2b57b9',
				})
				this.interval = setInterval(()=>{
					$this.get_status($this.data)
				}, 1500)
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
				module: 'basestack_mytax_report'
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
		async get_status(data){
			const $this = this
			FileService.fetchStatus({ data: $this.data, container: "basestack_mytax_report", pipeline: this.cmd }).then((response)=>{
				$this.module_statuses = response.data.data
				console.log($this.module_statuses)
			})
		
		}
	}
};
</script>

<style>
#mytaxreport{
	height:100vh;
    overflow-y:auto;
    width: 100%;
}



</style>