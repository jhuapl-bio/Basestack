<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="basestackconsensus">
	<b-form  v-if="selectedHistory" ref="submitform" class="form-horizontal" @submit.stop.prevent @submit="bookmarkSelections"  >
		<div class="form-group" style="font-size: 11px !important;">
			<b-row class="nopadcolumn">
				<b-col sm="12" style="" class="nopadcolumn">
					<h4 style="text-align:left">Job Histories</h4>
						<b-form-group
				            label="Select Run"
				            label-cols-sm="1"
				            label-align-sm="center"
				            label-size="sm"
				            label-for="filterInput"
				            class="mb-0 formGroup"	
				            v-if="histories.length > 0 && selectedHistory"					           
				          >
							<b-input-group-append >
								<multiselect 
								  v-model="selectedHistory" 
								  select-label="" deselect-label="" track-by="name" :custom-label="customRunLabel" placeholder="Select Run Location" @input="updateHistory" :options="histories" :searchable="true" :allow-empty="false">
								    <template slot="singleLabel" slot-scope="{ option }">
								    	<div v-if="option.custom">
						                  	<font-awesome-icon icon="plus" size="sm"/>
						                  	<span >New Report</span>
						                </div>
						                <div v-else>
						                  	<font-awesome-icon icon="cog" size="sm"/>
						                  	<span >{{option.name}}</span>
						                </div>
								    </template>
									<template slot="option" slot-scope="{ option }">
							      		<div v-if="option.custom">
						                  	<font-awesome-icon icon="plus" size="sm"/>
						                  	<span >New Report</span>
						                </div>
						                <div v-else>
						                  	<font-awesome-icon icon="cog" size="sm"/>
						                  	<span >{{option.name}}</span>
						                </div>
							    	</template>
								</multiselect>
								<b-button v-if="selectedHistory.loaded && !modules.basestack_consensus.status.running" v-on:click="run_artic_pipeline()"  class="btn tabButton" >
									<div class="in-line-Button" >
										<span>
											<font-awesome-icon   icon="hourglass-start"/>
										</span>
										<span>Make Consensus</span></div>
								</b-button>
								<b-button class="btn tabButton tabButton-stop" v-on:click="cancel_artic_pipeline()">
									<div class="in-line-Button" >
										<span>
											<font-awesome-icon  icon="stop-circle"/>
										</span>
										<span>Cancel Pipeline</span>
									</div>
								</b-button>
							</b-input-group-append>
							<b-input-group-append >
									<b-col sm="6">
									 	<b-button v-if="selectedHistory.saved" class="btn tabButton" :class="{ selectedTabButton: selectedHistory.loaded }"
									 	v-b-tooltip.hover.left 
								             title= 'Load this run for further analysis'
								             placeholder="Name" v-on:click="loadHistory()">
								            <div class="in-line-Button" >
								            	<span><font-awesome-icon  icon="save"/></span>
								            	<span>Load</span>
								           	</div>
								        </b-button>
								        <b-button v-else 
								        class="btn tabButton" :class="{ selectedTabButton: selectedHistory.saved }" 
								        type="submit"
								        id="bookmarkButton"
								        v-b-tooltip.hover.left 
								        title='Bookmark your parameters to prepare for a run' 
								        placeholder="Name" >
								            <div class="in-line-Button" >
								            	<span><font-awesome-icon  icon="save"/></span>
								            	<span >Bookmark</span>
								           	</div>				      
								        </b-button>
								    </b-col>
									<b-col sm="6" v-if="selectedHistory.saved">								    
								        <b-button class="btn tabButton tabButton-stop" v-tooltip="{
								            content: 'Delete the run. This option will fail if you have any files from this run open when clicked!',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }" placeholder="Delete" v-on:click="deleteHistory()">
								            <div class="in-line-Button" >
								            	<span><font-awesome-icon  icon="trash-alt"/></span>
								            	<span>Delete</span>
								           	</div>
								        </b-button>
								    </b-col>
							</b-input-group-append>
						</b-form-group>
				</b-col>
				<b-col sm="12" v-if="selectedHistory.loaded">
					<b-table
			          small
			          id="module_table"
	                  class="formGroup-input"
			          :items="selectedHistory.reportDir.modules"
			          :fields="module_status_fields"
					  sticky-header="700px"						        
					>
						<template  v-slot:cell(modules_complete)="row">
							<div v-if="row.item.status" style="text-align:center; margin:auto">
				                <span >{{row.item.status.join("/")}}</span>
						    </div>							 
					    </template>
					    <template  v-slot:cell(status)="row">
							<div v-if="row.item.status" style="text-align:center; margin:auto">
						    	<span v-if="row.item.status[0] >= row.item.status[1]" >
				                  	<font-awesome-icon icon="check" size="sm" v-b-tooltip.hover
				                  	v-tooltip="{
							            content: 'Completed Module',
							            placement: 'top',
							            classes: ['info'],
							            trigger: 'hover',
							            targetClasses: ['it-has-a-tooltip'],
							            }"

		                        	/>
				                  	<a v-if="row.item.key =='report'" :href="row.item.folderpath" @click.prevent="open(selectedHistory.reportDir.reportFiles.finalReport.pdf.path)">
					                  <p style="color: #2b57b9">pdf</p>
					                </a>
						    	</span>									 
						    	<span v-else-if="row.item.status[0] < row.item.status[1] && selectedHistory.reportDir.modules[selectedHistory.reportDir.modules.length - 1].status[0] == 1" 
						    	>
				                  	<font-awesome-icon icon="times-circle" size="sm" 
				                  	  v-tooltip="{
							            content: 'Incomplete Module',
							            placement: 'top',
							            classes: ['info'],
							            trigger: 'hover',
							            targetClasses: ['it-has-a-tooltip'],
							            }"
		                        	/>
						    	</span>	
						    	<span v-else-if="row.item.status[0] < row.item.status[1] && selectedHistory.reportDir.modules[selectedHistory.reportDir.modules.length - 1].status[0] < 1 && selectedHistory.running" 
		                        style="margin:auto; text-align: center"
						    	>
				                  	<half-circle-spinner
								          :animation-duration="4000"
								          :size="10"
								           v-tooltip="{
								            content: 'Running...',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }"
								          style="margin: auto"
								          :color="'#2b57b9'"
								     />

						    	</span>	
						    			
						    </div>							 
					    </template>
					    <template  v-slot:cell(title)="row">
						    <a :href="row.item.folderpath" @click.prevent="open(row.item.folderpath)">
			                  <p style="color: #2b57b9">{{row.item.title}}
			                  </p>
			                </a>

			            </template>
					</b-table>
				</b-col>
				<b-col sm="12" >
					<div v-if="selectedHistory">
						<b-form-group
				            label="Title"
				            label-cols-sm="1"
				            label-align-sm="center"
				            label-size="sm"
				            label-for="filterInput"
				            class="mb-0 formGroup"
				          >
						    <b-input-group-append >
        						<b-form-input 
        						 :disabled="!isNew"
        						 required
        						 class="formGroup-input" v-model="selectedHistory.name" v-tooltip="{
						            content: 'If you want to bookmark this run, create a title you can reference at a later date (Mandatory for bookmarking. Not needed for quick testing)',
						            placement: 'top',
						            classes: ['info'],
						            trigger: 'hover',
						            targetClasses: ['it-has-a-tooltip'],
						            }" placeholder="Name" >
						        </b-form-input>
						    </b-input-group-append>
						    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.name.required">A Form Name is required</div>

						</b-form-group>
						<b-form-group
				            label="Run Folder"
				            label-cols-sm="1"
				            label-align-sm="center"
				            label-size="sm"
				            label-for="filterInput"
				            class="mb-2 formGroup"
				            inline
				           
				          >
				          		<b-table
									:fields="['RunDir', 'FastqDir']"
									:items="[selectedHistory]"
								>
								<template  v-slot:cell(RunDir)="row">
							          <b-form-file 
					                 	 v-if="row.item.custom"
						                 ref="seq_file" 
						                 :id="'seq_file'" 
						                 :disabled="!isNew" 
						                 aria-describedby="seq_file" 
						                 v-model="fastqFiles"
						                 directory
						                 webkitdirectory
						                 :no-traverse="false"
						                 :multiple="true"
						                 :state="selectedHistory.runDir.fastqDir.validation"
						                 :placeholder="'Choose a run Folder'"
						                 drop-placeholder="Drop folder here..."
						                 :file-name-formatter="formatNames"
						                 >
					                </b-form-file>
					                <b-form-textarea required v-else disabled
					                 	:value="row.item.runDir.basename"
					                 	class="formGroup-input"
					                 	>
					                </b-form-textarea>
								</template>
								<template  v-slot:cell(FastqDir)="row" >
							    	<multiselect 
					                  id="fastq_folder"
					                  v-if="row.item.runDir.path && row.item.custom"
									  v-model="row.item.runDir.fastqDir" 
									  :searchable="false" :close-on-select="false" :preselect-first="true" track-by="name" label="name" :show-labels="false" placeholder="Pick a value" :options="selectedHistory.runDir.possibleFastqFolders"
									  select-label="Select folder" :allow-empty="true"
									  >
									</multiselect>	
									<b-form-input required v-else disabled
					                 	:value="row.item.runDir.fastqDir.name"
					                 	class="formGroup-input"
					                 	>
					                </b-form-input>								 
							    </template>
							    <template #head(RunDir)>
							        <span  
							        	style="text-align:center"  >
							        	Run Dir
							        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
							        	title="Run Folders contain fastq directories along with manifest, run_info, and run_config files" />
						      		</span>
							    </template>
							    <template #head(FastqDir)>
							        <span  
							        	style="text-align:center"  > Fastq Dir
							        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
							        	title="Fastq directory contain your fastq files. Files must have .fastq extensions"  />
						      		</span>
							    </template>
							</b-table>
				           
				            <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.fastqDir.validation.required">A valid fastq directory is required</div>
				            <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.path.required">Run Directory Must be Specified</div>
						</b-form-group>
						<b-form-group
			            label="Run Info"
				        label-cols-sm="1"
				        label-align-sm="center"
			            label-size="sm"
			            label-for="filterInput"
				        class="mb-0 formGroup"
			          	>
			          		<template slot="label">
							    <span  
						        	style="text-align:center"  >
						        	Run Info
						        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
						        	title="Run Info is a short description of your run" />
					      		</span>
							</template>
							<b-input-group-append id="run_info">
								<b-table
									:fields="run_info_fields"
									:items="[selectedHistory.runDir.run_info]"
								>
								<template  v-slot:cell(plate)="row">
						            <b-form-textarea
								          v-model="row.item.desc"
								          label="Description"
		           						  :disabled="!isNew"
								          type="text"
						                  class="formGroup-input"
							              :state="stateValidationEmpty(row.item.desc)"
								          required
								          placeholder="01"
								    ></b-form-textarea>
								 </template>
								<template  v-slot:cell(filename)="row">
							    	<b-form-textarea
							          v-model="row.item.filename"
							          label="Filename"
					                  class="formGroup-input"
							          type="text"
							          disabled
								      :state="row.item.validation"
							          placeholder="run_info.txt"
							    	></b-form-textarea>
							    	<b-form-invalid-feedback :state="row.item.validation">
							        	run_info.txt not found
							      	</b-form-invalid-feedback>										 
							    </template>
								</b-table>
						    </b-input-group-append>
						    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.run_info.validation.required">Specify valid run information</div>
						</b-form-group>
						<b-form-group
				            label="Run Config"
				            label-cols-sm="1"
				            label-align-sm="center"
				            label-size="sm"
				            label-for="filterInput"
				            class="mb-0 formGroup"
				           
				         >
				         	<template slot="label">
							    <span  
						        	style="text-align:center"  >
						        	Run Config
						        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
						        	title="Run Config contains your barcoding, primer scheme, and basecalling configuration" />
					      		</span>
							</template>
							<b-input-group-append id="run_config">
								<b-table
									:fields="run_config_fields"
									:items="[selectedHistory.runDir.run_config]"
								>
									<template  v-slot:cell(primers)="row">
							            <b-form-textarea
								          v-model="row.item.primers"
								          label="Primers"
								          type="text"
								          required
			           				      :disabled="!isNew"
						                  class="formGroup-input"
						                  :state="stateValidationEmpty(row.item.primers)"
								          placeholder="ncov-2019/V3"
								    	></b-form-textarea>
									 </template>
									<template  v-slot:cell(basecalling)="row">
										<b-form-textarea
								          v-model="row.item.basecalling"
								          label="Basecalling"
								          type="text"
						                  class="formGroup-input"
								          required
			           				      :disabled="!isNew"
						                  :state="stateValidationEmpty(row.item.basecalling)"
								          placeholder="dna_r9.4.1_450bps_hac.cfg"
								    	></b-form-textarea>
								    </template>
									<template  v-slot:cell(barcoding)="row">
								    	<b-form-textarea
								          v-model="row.item.barcoding"
								          label="Barcoding"
								          type="text"
								          required
			           				      :disabled="!isNew"
						                  class="formGroup-input"
						                  :state="stateValidationEmpty(row.item.barcoding)"
								          placeholder="barcode_arrs_nb12.cfg"
								    	></b-form-textarea>										 
								    </template>
								    <template  v-slot:cell(filename)="row">
								    	<b-form-textarea
								          v-model="row.item.filename"
								          label="Filename"
						                  class="formGroup-input"
								          type="text"
								          disabled
								          :state="row.item.validation"
								          placeholder="run_config.txt"
								    	>
								    	</b-form-textarea>								 
										  <b-form-invalid-feedback :state="row.item.validation">
									        run_config.txt not found
									      </b-form-invalid-feedback>
									  </template>
								</b-table>
							</b-input-group-append>
						    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.run_config.validation.required">Specify valid config information</div>
						</b-form-group>
						<b-form-group
				            label="Manifest"
				            label-cols-sm="2"
				            label-align-sm="center"
				            label-size="sm"
				            id="manifest_label"
				            label-for="filterInput"
				            class="mb-0 formGroup"						           
				          >
				          	<template slot="label">
							    <span  
						        	style="text-align:center"  >
						        	Manifest
						        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
						        	title="Manifest contains your experimental setup with all barcodes for samples" />
					      		</span>
							</template>
							<b-input-group-append id="manifest"
							>	
								<b-table
						          show-empty
						          small
						          id="manifest_table"
				                  class="formGroup-input"
						          :items="selectedHistory.runDir.manifest.entries"
						          :fields="manifest_fields"
								  sticky-header="300px"						        
								>
							        <template  v-slot:cell(barcode)="row">
								    	<b-form-input
								          v-model="selectedHistory.runDir.manifest.entries[row.index].barcode"
								          label="barcode"
								          @input="changeBarcode($event, row.index)"
						                  class="formGroup-input"
								          type="text"
				           				  :disabled="!isNew"
							              :state="stateValidationNull(row.item.barcode)"
								          placeholder="NB01"
								    	></b-form-input>									 
								    </template>
								    <template  v-slot:cell(id)="row">
								    	<b-form-input
								          v-model="selectedHistory.runDir.manifest.entries[row.index].id"
								          label="barcode"
								          @input="changeID($event, row.index)"
						                  class="formGroup-input"
								          type="text"
				           				  :disabled="!isNew"
								          placeholder="MDHP-00057"
								          :state="stateManifestID(row.item.id)"							          
								    	></b-form-input>									 
								    </template>
								    <template  v-if="selectedHistory.custom" v-slot:cell(adm)="row">
								    	<b-row class="nopadcolumn">
								    		<b-col sm="2">
										    	<b-button v-on:click="addManifestRow(row.index)"  class="btn cntrButton" >
														<span>
															<font-awesome-icon   icon="plus"/>
														</span>
												</b-button>
											</b-col>
								    		<b-col sm="2" v-if="selectedHistory.runDir.manifest.entries.length > 1">
												<b-button v-on:click="rmManifestRow(row.index)"  class="btn cntrButton" >
													<span>
														<font-awesome-icon   icon="minus"/>
													</span>
												</b-button>
											</b-col>
											<b-col sm="2" v-if="selectedHistory.runDir.manifest.entries.length > 1 && row.index > 0">
												<b-button v-on:click="moveUpRow(row.index)"  class="btn cntrButton" >
													<span>
														<font-awesome-icon   icon="angle-up"/>
													</span>
												</b-button>
											</b-col>
											<b-col sm="2" v-if="selectedHistory.runDir.manifest.entries.length > 1 && row.index < selectedHistory.runDir.manifest.entries.length-1">
												<b-button v-on:click="moveDownRow(row.index)"  class="btn cntrButton" >
													<span>
														<font-awesome-icon   icon="angle-down"/>
													</span>
												</b-button>
											</b-col>
										</b-row>
								    </template>

									
								</b-table>
								<div style="text-align:center">
									<b-form-input
						    	      v-model="selectedHistory.runDir.manifest.filename"
							          label="Filename"
				    	              class="formGroup-input"
							          type="text"
							          required
							          disabled
								      :state="selectedHistory.runDir.manifest.validation"
							          placeholder="manifest.txt"
							    	></b-form-input>
							    	  <b-form-invalid-feedback 
							    	  v-b-tooltip.hover
		                        		title="You will need to create it manually on the left or make it directly within the run folder"
							    	  :state="selectedHistory.runDir.manifest.validation">
								        manifest.txt not found. 
								      </b-form-invalid-feedback>
							    	<hr>
							    	<b-button v-on:click="addManifestRow(0)"  class="btn tabButton" v-if="selectedHistory.runDir.manifest.entries.length ==0 && selectedHistory.custom">
										<span>
											<font-awesome-icon icon="plus"/>
										</span>
									</b-button>
									<span v-else style="text-align:center">One Row MUST contain an NTC as an ID</span>

						    	</div>
							</b-input-group-append>
						    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.minLength">Specify one or more barcode</div>
						    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.stateManifestID">Specify one row having NTC</div>
						</b-form-group>
					    <!-- <b-form-group
				            label="Primer Folder"
				            label-cols-sm="2"
				            label-align-sm="right"
				            label-size="sm"
				            label-for="filterInput"
				            class="mb-0"
				          >
						    <b-input-group-append>
								  <multiselect 
								  v-model="primerDir" 
								  :disabled="!isNew"
								  select-label="Select Primer Scheme" deselect-label="Click again to remove" track-by="fullname" label="fullname" placeholder="Select primer directory" @input="changePrimerSelectType" :options="preload_primerDirs" :searchable="false" :allow-empty="true">
								    <template slot="singleLabel" slot-scope="{ option }"><span>{{ option.fullname }}</span></template>
								  </multiselect>
								  <div v-show="togglePrimerSelect == 'manual'" style="width:100%; height:100%"  class="custom-file"  >
					                <b-form-file  class="custom-file-input" ref="primer_file" id="primer_file"
					                 aria-describedby="primer_file" 
					                 directory
							         v-model="primerFiles"
					                 multiple
					                 webkitdirectory
					                 :disabled="!isNew"
					                 no-traverse></b-form-file>
					                <label class="custom-file-label" for="primer_file"><span ref="primer_file_text">Browse</span></label>
						          </div>
						    </b-input-group-append>
						</b-form-group>
			            <div class="error" style="text-align:left" v-if="!$v.primerDir.required">A Primer Directory is required</div> -->
				    </div>
				</b-col>
			</b-row>
			<hr>
		</div>
		
    </b-form>
	<p class="typo__p" v-if="submitStatus === 'ERROR'">Please have a valid manifest, run_config and run_info set.</p>
  </div>
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<script>
import FileService from '../../../services/File-service.js'
import swal from 'vue-sweetalert2'
import { required, minLength } from 'vuelidate/lib/validators'
import Multiselect from 'vue-multiselect'
import path from "path"
import {HalfCircleSpinner} from 'epic-spinners'
const  stateManifestID = ((values) => {	
	const ntc_found = values.filter((d)=>{
		return d.id == "NTC"
	})

	return ntc_found.length > 0 ? true : false 
})
export default {
	name: 'basestackconsensus',
	components: {
		Multiselect,
		HalfCircleSpinner
	},
	computed: {
		stateRunFolder(){
			return this.fastqFiles.length == 0 ? false : true
		},		
	},
	props: ['modules', 'images'],
	data() {
		return {
			globalState:null,
			newState: null,
			reportDir: null,

			run_info_fields: [
				{key: 'filename', label: 'Filename', sortable: false, class: 'text-center'},
          		{key: 'desc', label: 'Description', sortable: false, class: 'text-center'},
			],
			run_config_fields: [
				{key: 'filename', label: 'Filename', sortable: false, class: 'text-center'},
          		{key: 'barcoding', label: 'Barcoding', sortable: false, class: 'text-center'},
          		{key: 'primers', label: 'Primers', sortable: false},
          		{key: 'basecalling', label: 'Basecalling', sortable: false},
			],
			manifest_fields: [
				{key: 'barcode', label: 'Barcode', sortable: false, class: 'text-center'},
          		{key: 'id', label: 'ID', sortable: false, class: 'text-center'},
          		{key: 'adm', label: 'Action', sortable: false, class: 'text-center'},
			],
			showBookmarkTooltip: false,
			runDir:{
				path: null,
				basename: null,
				possibleFastqFolders: [],
				run_info: {
					desc: null, 
					filename: 'run_info.txt'
				}, 
				fastqDir: {
					path: null,
					name: null,
					files: [],
					validation: false
				},
				run_config: {
					primers: null, 
					basecalling:null, 
					barcoding:null,
					filename: 'run_config.txt'
				}, 
				manifest: {
					entries: [],
					filename: 'manifest.txt'
				},
			},
			fastqDir: null,
			name: null,
			fastqFiles: [],


			state:false,

			primerDir: null,
			preload_primerDirs: [],
			primerFiles: null,
			togglePrimerSelect: 'select',


			histories: [],
			history: null,
			customHistory: null,
			
			module_status_fields: [
				{key: 'title', label: 'Title', sortable: false, class: 'text-center'},
          		{key: 'step', label: 'Step', sortable: false, class: 'text-center'},
          		{key: 'modules_complete', label: 'Modules Complete', sortable: false, class: 'text-center'},
          		{key: 'status', label: 'Status(es)', sortable: false, class: 'text-center'}
			],			

			selectedHistory: null,
			bookmark: false,
			submitStatus: null,
			counter: 0,
			isNew: true,


    	    changes: 0,
	        tableInterval:null,
	        fetchStatus: false,

	        srcMd: null
		}
	},
	async mounted() {
		// await this.fetchPrimers()
        await this.fetchHistories()

        this.selectedHistory = this.histories[this.histories.length - 1]
	},
    validations: {
      selectedHistory: {
      		runDir: {
        		manifest:{
        			validation: {
        				required
        			},
        			entries: {
        				required,
        				minLength: minLength(1),
        				stateManifestID
        			},
        			filename:{
        				required
        			}
        		},
        		run_info:{
        			validation: {
        				required
        			},
        			filename:{
        				required
        			}
        		},
        		run_config:{
        			validation: {
        				required
        			},
        			filename:{
        				required
        			}
        		},
        		fastqDir: {
        			validation: {
        				required
        			},
        			name: {
        				required
        			},
        			path: {
        				required
        			}
        		},
        		path:{
        			required
        		}
        	},
        	name: {
        		required
        	},

      },
      // primerDir: {
      //   required
      // },
    },
    beforeDestroy(){
        clearInterval(this.tableInterval)
    },
    watch: {
    	fastqFiles: function(val){
    		if (val && val.length > 0){   
    			if (this.isNew){
    				this.stagedFastqFiles = val
    			} 
    			if (val.length == 1){
    				val = val[0]
    			}		
	    		const flat  = val.flat(2) //flatten up to 2 directories down
    		 	this.changeRunDir(flat, 'dir')
    		} 
    	},
    	primerFiles: function(val){
    		if (val.length > 0){
    			const dir_path = path.dirname(val[0].path)
    			const protocol_name = path.basename(dir_path)
    			const obj = {fullpath: dir_path, fullname: "Custom", type: "manual", name: protocol_name}
    		 	// this.$refs.primer_file_text.innerHTML = dir_path
    			// this.data.primerDir = obj
    			this.primerDir = obj
    			this.primerDirSelect = obj
    		}
    	},
    	name: function(val){
    		if (this.isNew){
	    		this.customHistory.name = val
    		}
    	},
    	selectedHistory: function(val){
    		if (!val.custom){
    			this.isNew = false	
    			this.manifest_fields[2].thClass ='d-none'
    			this.manifest_fields[2].tdClass = 'd-none'
    		} else{
    			this.isNew = true
    			this.manifest_fields[2].thClass = null
    			this.manifest_fields[2].tdClass = null
    		}
  		
    	},
    	histories: {
    		deep:true,
    		handler(val){
    			this.$emit('updateHistory', val.filter((d)=>{return !d.custom}))
    		}
    	}
    },
	methods: {
		open (link) {
			this.$emit("open", link)
      	},
      	hideTooltipLater() {
	      setTimeout(() => {
	        this.showBookmarkTooltip = false;
	      }, 3000);
	    },
      	formatNames(files) {
        	return files.length === 1 ? `${files[0].flat(2).length} files selected` : `${files.length} files selected`

      	},
		changeBarcode(val, index){
			this.$set(this.selectedHistory.runDir.manifest.entries, index, {id:this.selectedHistory.runDir.manifest.entries[index].id, barcode:val})
		},
		changeID(val, index){
			this.$set(this.selectedHistory.runDir.manifest.entries, index, {id:val, barcode:this.selectedHistory.runDir.manifest.entries[index].barcode})
		},
		addManifestRow(index){
			this.selectedHistory.runDir.manifest.entries.splice(index, 0, [{id:null, barcode:null}])
		},
		rmManifestRow(index){
			this.selectedHistory.runDir.manifest.entries.splice(index, 1)
		},
		moveUpRow(index){
			const tmp =  this.selectedHistory.runDir.manifest.entries[index]
			this.$set(this.selectedHistory.runDir.manifest.entries, index ,this.selectedHistory.runDir.manifest.entries[index-1] )
			this.$set(this.selectedHistory.runDir.manifest.entries, index-1, tmp)
		},
		moveDownRow(index){
			const tmp =  this.selectedHistory.runDir.manifest.entries[index]
			this.$set(this.selectedHistory.runDir.manifest.entries, index, this.selectedHistory.runDir.manifest.entries[index+1] )
			this.$set(this.selectedHistory.runDir.manifest.entries, index+1, tmp)
		},
		stateValidationEmpty(entry){
			if (entry == ""){
				entry = null
			}
			return entry ? true : false
		},
		stateValidationNull(entry){
			if (entry == ""){
				entry = null
			}
			return entry ? null : false			
		},
		formatDirectoryString(files){
			files = files.filter((d)=>{
				if(d['$path']){
					return true
				}

			})
			return path.dirname(files[0].path)
		},
		customRunLabel({name, label}){
			return name ? name : 'New Report'
		},
		stateManifestID(id){
			if (id == "NTC"){
				return null
			}
			const ntc_found = this.selectedHistory.runDir.manifest.entries.filter((d)=>{
				return d.id == "NTC"
			})

			return ntc_found.length > 0 ? null : false 
		},
		async changeRunDir(val, type){
			let root;
			let dirName;
			const files = val.filter((d)=>{
				if(d['$path']){
					return true
				} else {
					d.$path = d.webkitRelativePath
					return true
				}
			})
			if(files.length > 0){
				root = path.dirname(files[0].path)
				const sep =path.sep
				for(let i = 0; i < files.length; i++){
					let sep_paths = files[i].$path.split(/[\\/]/)
					sep_paths = sep_paths.filter(function (el) {
					  return (el != null && el != "");
					});
					const path = files[i].path
					if (path < root){
						root = path
					}
				}
			} else {
				return
			}
		 	dirName = root
		 	this.runDir.path = root
    		if (this.isNew){
	    		await this.validateRunDirContents(this.runDir).then((response)=>{
	    			this.runDir = response.runDir
		    		this.selectedHistory.runDir = response.runDir
	    		}).catch((err)=>{
	    			console.error(err, "error in validation")
	    		})
    		} 

		},
		validateRunDirContents(runDir){
			const $this = this
			return new Promise(function(resolve,reject){
				FileService.validateRunDirContents({
					runDir: runDir
				}).then((response)=>{
					return resolve(response.data.data)
				}).catch((err)=>{
					console.error("error in validating run dir", err.response.data.message)
					$this.fastqFiles  = []

					// this.$swal.fire({
					// 	position: 'center',
					// 	icon: 'error',
					// 	showConfirmButton:true,
		   //              title:  error.response.data.message
					// })
					reject(err.response.data.message)
				})
			})
		},
		updateHistory(element){
			if (this.isNew){
				this.fastqFiles = this.stagedFastqFiles
			}
			this.selectedHistory = (element.custom ? this.customHistory : element)
		},
		async setToggle(dir, dirValue, dispatch, dispatchValue){
			// this.data[dispatch] = dispatchValue
			this.updateData()
			dir = dirValue
		},
		async changePrimerSelectType(value){
			if (value) {
				if(value.fullname == "Custom"){
					// this.setToggle(this.primerDir, {fullpath: null, type: 'manual', fullname: "Custom", name: null}, 'primerDir', {fullpath: null, type: 'manual', fullname: "Custom", name: null})
					this.togglePrimerSelect =  'manual'
				} else {
					// this.setToggle(this.primerDir, value, 'primerDir', value)
					this.togglePrimerSelect =  'select'
				}
				this.$refs.primer_file_text.innerHTML = null
			}
			else {
			  this.primerDir = null;
			  // this.updateData()
	          this.togglePrimerSelect = null
	        }
	        // this.resetCustom(false)
	        this.checkError()
		},
	    async fetchHistories(){
	    	let data = await FileService.fetchHistories().then((response)=>{
	    		const selected = this.histories.filter((d)=>{
	    			return d.loaded
	    		})
				this.histories = response.data.data.map((d)=>{
					d.saved = true
					d.loaded = false
					return d
				})
				if(response.data.data.length >=1){
					if (selected.length >= 1){
						this.histories = this.histories.map((d)=>{
							if (selected[0].name == d.name){
								d.loaded = true
							}
							return d
						})						
					}
				} 
				const newReport = {
					name: null,
					runDir: this.runDir ,
					primerDir: this.primerDir ,
					annotationsDir: this.annotationsDir, 
					protocolDir: this.protocolDir ,
					custom: true
				}
				this.histories.push(newReport)

				this.customHistory = newReport
			})
	    },
		async fetchPrimers(){
			let data = await FileService.fetchPrimers().then((response)=>{
				this.preload_primerDirs = []
				if(response.data.data.length >=1){
					this.preload_primerDirs = response.data.data
				}
				this.preload_primerDirs.push({fullpath: null, type: 'manual', fullname: "Custom", name: null})
			})
			
		},
	    async cancel_artic_pipeline(){
	    	const store = this.$store;
			await FileService.cancelModule({
	            module: 'basestack_consensus'
	        }).then((response)=>{
				this.$swal.fire({
					position: 'center',
					icon: (response.data.statusType == 219 ? 'warning' : 'success' ),
					showConfirmButton:true,
	                title:  response.data.message
				})	
				this.histories.map((d)=>{
					d.running = false

				})	        	
	        }).catch((error)=>{
				this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				});	
	        })				
		},
		async run_artic_pipeline() {
			if (this.$v.$invalid) {
	          this.submitStatus = 'ERROR'
	        } 
	        else {
	        	this.checkError()
				await FileService.startModule({
		            runDir: this.selectedHistory.runDir,
		            primerDir: this.selectedHistory.primerDir,
		            reportDir: this.selectedHistory.reportDir,
		            name: this.selectedHistory.name,
		            module: 'basestack_consensus'
		        }).then((response)=>{
					this.$swal.fire({
						position: 'center',
						icon: (response.data.exists ? 'warning' : 'success' ),
						showConfirmButton:true,
		                title:  response.data.message
					});	
					this.selectedHistory.running = true	        	
		        }).catch((error)=>{
					this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
		                title:  error.response.data.message + "."
					});
		        })		

			}
		},
		bookmarkParams: async function(){
			if (this.$v.$invalid){
				return
			}
			else{
				await FileService.bookmarkSelections({
	        		runDir: this.selectedHistory.runDir,
	        		primerDir: this.selectedHistory.primerDir,
	        		name: this.selectedHistory.name,
	        	}).then((response)=>{
	        		this.bookmark = !this.bookmark
	        		this.history = null
	        		const name = this.selectedHistory.name
	    			this.showBookmarkTooltip = false
	        		this.fetchHistories().then(()=>{
	    				const running = this.histories.filter((n)=>{
	    					return n.loaded
	    				})
	    				this.selectedHistory = this.histories.filter((n)=>{return n.name == name})[0];
	    				if (running.length ==0){
	    					this.loadHistory()
	    				}

	    			}).catch((errFetch)=>{console.error(errFetch)})
	        		this.reportDir = response.data.data.reportDir;
	        		// this.updateData()        		
	        	}).catch((error)=>{
	        		this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
						title: 'Error in bookmarking run directory',
		                text:  error.response.data.message
					})
					this.reportDir = null;
					// this.updateData()
	        	})
	        }
		},
		deleteHistory: async function(){
			const $this  = this
			this.$swal({
		        title: 'Are you sure you want to remove this bookmark?',
		        text: "You won't be able to revert this!",
		        type: 'warning',
		        showCancelButton: true,
		        confirmButtonColor: '#2b57b9',
		        cancelButtonColor: '#a60139',
		        confirmButtonText: 'Yes, cancel it!'
		      }).then((res) => {
		        if (res.value) {
			        FileService.removeBookmark({
		        		reportDir: $this.selectedHistory.reportDir
		        	}).then((response)=>{
		        		this.bookmark = !this.bookmark
		        		this.fetchHistories().then(()=>{
    						this.histories.length > 0 ? this.selectedHistory = this.histories[0] : this.history = null;
	        			}).catch((errFetch)=>{console.error(errFetch)})
		        	}).catch((err)=>{
		        		this.$swal.fire({
							position: 'center',
							icon: 'error',
							showConfirmButton:true,
			                title:  "Error in deleting history",
			                text: err.response.data.message

						})
		        	})
		        }
		    });
		},

		bookmarkSelections: async function(){
			if (this.$v.$invalid) {
	          this.submitStatus = 'ERROR'
	        }
	        else {
        		this.submitStatus = 'OK'
        		await this.bookmarkParams('made').catch(() => null);
	        }
		},
		loadHistory: async function(){
			if (this.$v.$invalid) {
	          this.submitStatus = 'ERROR'
	        }
	        else {
        		this.submitStatus = 'OK'
        		this.selectedHistory.loaded = true
        		this.histories = this.histories.map((d,i )=>{
        			if (d.name != this.selectedHistory.name){
        				d.loaded = false
        			} else {
        				d.loaded = true
        			}
        			return d
        		})
        		// this.updateData()
                this.fetchConsensusReport('')
	        }
		},
	    async fetchModuleStatus(mod, index){
	    	const $this = this
	    	return new Promise(function (resolve, reject) {
		    	try{
		    		(async ()=>{
		    			try{
				            let response = await FileService.moduleStatus({
				            	selectedHistory: $this.selectedHistory,
				            	module: $this.selectedHistory.reportDir.modules[index]
				            })
				            resolve(response.data.data)
			    		} catch(err){
			    			reject(err)
			    		}
		    		})().catch((err2)=>{
		    			reject(err2)
		    		})
		        } catch(error){
		        	console.error(error, "Error in module status fetch", mod, index)
		        	reject(error)
		        }	    		
	        })
	    },
      	async  fetchConsensusReport(mountState){
      		let modules = this.selectedHistory.reportDir.modules
            let promises = [];
            this.fetchStatus = true
            for(let index = 0; index < modules.length; index ++){
	            promises.push(this.fetchModuleStatus(modules[index], index))
            }
            const $this = this
            Promise.all(promises).then((response)=>{
            	for (let i = 0; i < response.length; i++){
            		$this.$set($this.selectedHistory.reportDir.modules, i, response[i])
            	}
                this.fetchStatus = false
	        }).catch((err)=>{
            	console.error(err)
	            this.fetchStatus = false
            })
        	this.$nextTick(function () {
	            $this.tableInterval = setInterval(() => {
		            promises = [];
		            if(!$this.fetchStatus){
		                modules = ($this.selectedHistory.reportDir ? $this.selectedHistory.reportDir.modules : [])
			            for(let index = 0; index < modules.length; index ++){
					        promises.push($this.fetchModuleStatus(modules[index], index))
			            }
			            Promise.all(promises).then((response)=>{
			            	for (let i = 0; i < response.length; i++){
			            		$this.$set($this.selectedHistory.reportDir.modules, i, response[i])            		
    			        	}
				            $this.fetchStatus = false
			            }).catch((err)=>{
			            	console.error(err.data, "error in interval")
			            	$this.fetchStatus = false
			            })
			        }

            	},5000);
        	})         

      	},
		checkError(){
			if (this.selectedHistory.runDir && this.selectedHistory.name) {this.submitStatus = "OK"; }
		},
		async resetCustom(fresh){
			this.newState = true
			this.history = this.customHistory
			this.bookmark = false
			this.selectedHistory.name = this.params.name;
			// this.togglePrimerSelect = this.data.primerDir
			this.selectedHistory.runDir = this.data.runDir;
		},
		handleFileUpload: async function(dirType, obj){
			const globalState = this.$store.state.data
			this.checkError()
		}

	}
};
</script>

<style>
#basestackconsensus {
	margin:auto;
	vertical-align: middle;
	overflow-x:hidden;
	margin: 5px;
}

.btn-secondary{
  background-color:none !important;
}
code{
	color: #2b57b9;
}

.typo__p {
	color: #a60139;;
}
.history_btn {
  border-radius: 0 !important;
  border:0px;
  width: 100%;
}

</style>
