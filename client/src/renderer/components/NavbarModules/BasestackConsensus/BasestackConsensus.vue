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
								  select-label="" deselect-label="" track-by="name" :custom-label="customRunLabel" placeholder="Select Run Location" @input="updateHistory" :options="histories" :searchable="true" :allow-empty="false" :preselect-first="true">
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
								<span v-if="selectedHistory.loaded" class="center-align-icon;"
				            		v-tooltip="{
							            content: 'Open Report Folder',
							            placement: 'top',
							            classes: ['info'],
							            trigger: 'hover',
							            }"
				            	>
				            		<font-awesome-icon class="configure"  @click="open(selectedHistory.reportDir.path, $event)" icon="archive" size="sm"  />
							    </span>
								<b-button v-if="selectedHistory.loaded && !modules.basestack_consensus.status.running" v-on:click="run_artic_pipeline()"  class="btn tabButton" >
									<div class="in-line-Button" >
										<span>
											<font-awesome-icon   icon="hourglass-start"/>
										</span>
										<span>Make Consensus</span></div>
								</b-button>
								<span v-else-if="selectedHistory.loaded && modules.basestack_consensus.status.running"
		                       		style="margin:auto; text-align: center; min-width:20%; display:flex"
						    	>	
				                  	<looping-rhombuses-spinner
								          :animation-duration="4000"
								          :size="20"
								          style="margin: auto"
								          :color="'#2b57b9'"
								     /><p style="margin:auto; text-align:center">Running</p>
						    	</span>
						    	<span 
									v-if="!modules.basestack_consensus.status.running && modules.basestack_consensus.status.errors" 
									class="center-align-icon warn-icon" 
									style="float:right; margin:auto; text-align:center" v-tooltip="{
						            content: 'Error in module, check logs',
						            placement: 'top',
						            classes: ['info'],
						            trigger: 'hover',
						            targetClasses: ['it-has-a-tooltip'],
						            }">
			            			<font-awesome-icon icon="times-circle" size="sm" />
				            	</span>	
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
						    	<span v-else-if="row.item.status[0] < row.item.status[1] && selectedHistory.reportDir.modules[selectedHistory.reportDir.modules.length - 1].status[0] < 1 && selectedHistory.running && modules.basestack_consensus.status.running" 
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
				<b-col sm="5" >
					<b-form-group
			            label="Title"
			            label-align-sm="center"
			            label-size="sm"
			            inline
			            label-for="filterInput"
			            class="mb-2 formGroup"
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
			            label-align-sm="center"
			            label-size="sm"
			            id="manifest_label"
			            label-for="filterInput"
			            class="mb-0 formGroup"						           
			          >
			          	<template slot="label">
						    <span  
					        	style="text-align:center"  >
					        	Specifics
				      		</span>
						</template>
						<b-input-group-append>
							<b-table
					          show-empty
					          small
					          label=""
					          v-if="selectedHistory.runDir.specifics"
					          style="width: 100%"
			                  class="formGroup-input"
					          :items="[
					          	selectedHistory.runDir.specifics.seq_summary, 
					          	selectedHistory.runDir.specifics.drift_correction, 
					          	selectedHistory.runDir.specifics.throughput 
					          ]"
					          :fields="specifics_table_fields"
							  sticky-header="300px"						        
							>
								<template #cell(exists)="data">
									<span 
										:class="[(data.value ? 'center-align-icon success-icon' :'center-align-icon  warn-icon' )]" 
										style="margin:auto; text-align:center" v-tooltip="{
							            content: 'Presence in Run Directory?',
							            placement: 'top',
							            classes: ['info'],
							            trigger: 'hover',
							            targetClasses: ['it-has-a-tooltip'],
							            }">
				            			<font-awesome-icon :icon="(data.value ? 'check' : 'exclamation')" size="sm" />
					            	</span>								 
							    </template>
							    <template #cell(errors)="data">
									<span v-if="data.value && data.value.length > 0"
										:class="['center-align-icon  warn-icon']" 
										style="margin:auto; text-align:center; cursor: pointer;" v-tooltip="{
							            content: 'Click me to show errors',
							            placement: 'top',
							            classes: ['danger'],
							            trigger: 'hover',
							            targetClasses: ['it-has-a-tooltip'],
							            }">
				            			<font-awesome-icon @click="toast('b-toaster-top-full', {variant: 'danger', message: data.value, title: 'Error Message' } )"  :icon="'exclamation'" size="sm" />
					            	</span>								 
							    </template>
							</b-table>
						</b-input-group-append>
					</b-form-group>
					<b-form-group
			            label="Manifest"
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
						<div style="text-align:center">
							<b-form-input
				    	      v-model="selectedHistory.runDir.manifest.filename"
					          label="Filename"
		    	              class="formGroup-input"
					          type="text"
					          required
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
							<span v-else style="text-align:center">Set one Barcode as NB00 (or other unused name) for the NTC</span>

				    	</div>
						<b-input-group-append id="manifest"
						>	
							<b-table
					          show-empty
					          small
					          responsive
					          id="manifest_table"
			                  class="formGroup-input"
					          :items="selectedHistory.runDir.manifest.entries"
					          :fields="manifest_fields"
					          sticky-header="250px"	
							>
						        <template  v-slot:cell(barcode)="row">

							    	<b-form-input
							          v-model.trim="selectedHistory.runDir.manifest.entries[row.index].barcode"
							          label="barcode"
							          @input="changeBarcode($event, row.index)"
					                  class="formGroup-input"
							          type="text"
			           				  :disabled="!isNew && !overrideManifest"
						              :state="stateValidationNull(row.item.barcode)"
							          placeholder="NB01"
							    	></b-form-input>									 
							    </template>
							    <template  v-slot:cell(id)="row">
							    	<b-form-input
							          v-model.trim="selectedHistory.runDir.manifest.entries[row.index].id"
							          label="barcode"
							          @input="changeID($event, row.index)"
					                  class="formGroup-input"
							          type="text"
			           				  :disabled="!isNew && !overrideManifest"
							          placeholder="MDHP-00057"
							          :state="stateManifestID(row.item.id)"							          
							    	></b-form-input>									 
							    </template>
							    <template  v-if="overrideManifest || selectedHistory.custom"   v-slot:cell(adm)="row">
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
						</b-input-group-append>
					    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.minLength">Specify one or more barcode</div>
					    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.stateManifestID">
					    	<span  
					        	style="text-align:center"  >
					        	No NTC present
					        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
					        	title="One Sample ID must have NTC (No Template Control)" />
					      	</span>
						</div>
						
					</b-form-group>
					<b-form-group
			            label-align-sm="center"
			            label-size="sm"
			            label="Define Standard Manifest Scheme"
			            label-for="filterInput"
			            class="mb-0 formGroup"
			           
			         >	
						<template slot="label">
						    <span 
					        	style="text-align:center"  >
					        	Modify Manifest
				      		</span>
				      		<span  class="center-align-icon;"
			            		v-tooltip="{
						            content: 'Define Manifest',
						            placement: 'top',
						            classes: ['info'],
						            trigger: 'hover',
						            targetClasses: ['it-has-a-tooltip'],
						            }"
			            	>
			            		<font-awesome-icon class="configure"  v-b-toggle.sidebar-right icon="cog" size="sm"  />
						    </span>		
						</template>
						<b-sidebar id="sidebar-right" title="Manifest Config" right shadow @shown="overrideManifest=true" @hidden="overrideManifest=false">
							<h3 style="text-align:center">Create a Baseline Manifest</h3>
							<b-table
					          show-empty
					          small
					          label=""
					          stacked
					          responsive
					          style="width: 100%"
			                  class="formGroup-input"
					          :items="[1]"
					          :fields="['Barcode', 'SampleID', 'Count', 'Submit']"
							  sticky-header="300px"						        
							>
								<template  v-slot:cell(Barcode)>
									<b-form-textarea 
				                 		v-model="placeHolderBarcode"
				                 		class="formGroup-input"
				                 	>
				                	</b-form-textarea>								 
							    </template>
							    <template  v-slot:cell(Count)>
									<b-form-select class="formGroup-input"  v-model="placeHolderManifestCount"   :options="[12, 24, 96]"></b-form-select>							 
							    </template>
							    <template  v-slot:cell(SampleID)>
									<b-form-textarea 
				                 	v-model="placeHolderSampleID"
				                 	class="formGroup-input" 
				                 	>
				                	</b-form-textarea>						 
							    </template>
							    <template  v-slot:cell(Submit)>
									<span class="center-align-icon;"
					            		v-tooltip="{
								            content: 'Adjust The Placeholder Manifest',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }"
					            	>
					            		<font-awesome-icon class="configure"  v-b-toggle.sidebar-right @click="adjustManifest()" icon="cog" size="sm"  />
								    </span>					 
							    </template>
							</b-table>
							<hr>
							<div style="text-align:center" :hidden="selectedHistory.custom">
								<h3 v-if="overrideManifest">Override Saved</h3>
			            		<font-awesome-icon
			            		v-tooltip="{
						            content: 'Adjust manifest mid-run',
						            placement: 'top',
						            classes: ['info'],
						            trigger: 'hover',
						            targetClasses: ['it-has-a-tooltip'],
						            }" class="configure"  @click="updateBookmark()" icon="cog" size="sm"  />
						    </div>
						</b-sidebar >
					</b-form-group>
				</b-col>
				<b-col sm="7">
					<b-form-group
			            label="Run Folder"
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
						<template  v-slot:cell(RunDir)="row" style="display:flex">
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
				                 :placeholder="'Choose a run Folder'"
				                 drop-placeholder="Drop folder here..."
				                 :file-name-formatter="formatNames"
				                 >
			                </b-form-file>
			                <b-form-textarea required v-else disabled
			                 	:value="row.item.runDir.basename"
			                 	:state="selectedHistory.runDir.exists"
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
								  select-label="Select folder" :allow-empty="false"
								  >
								</multiselect>	
								<b-form-input required v-else disabled
				                 	:value="row.item.runDir.fastqDir.name"
				                 	:state="row.item.runDir.fastqDir.validation"
				                 	class="formGroup-input"
				                 	>
				                </b-form-input>	
				                <p style="text-align:center" v-if="row.item.runDir.fastqDir">Total # of Fastq Files: {{row.item.runDir.fastqDir.files}}</p>							 
						    </template>
						    <template #head(RunDir)>
						        <span  
						        	style="text-align:center"  >
						        	Run Folder
						        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
						        	title="Run Folders contain fastq directories along with manifest,  and run_config files" />
						        	<span class="center-align-icon" style="float:middle; display:flex" v-tooltip="{
							            content: 'Validating Run Directory',
							            placement: 'top',
							            classes: ['info'],
							            trigger: 'hover',
							            targetClasses: ['it-has-a-tooltip'],
							            }" v-if="validatingRunDir">
						            	<looping-rhombuses-spinner
									          :animation-duration="4000"
									          :size="10"
									          style="margin: auto"
									          :color="'#2b57b9'"
									     />
							     	</span>
							     	<span v-if="selectedHistory.runDir.path" class="center-align-icon;"
					            		v-tooltip="{
								            content: 'Open Run Folder',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }"
					            	>
					            		<font-awesome-icon class="configure"  @click="open(selectedHistory.runDir.path, $event)" icon="archive" size="sm"  />
								    </span>	
					      		</span>
						    </template>
						    <template #head(FastqDir)>
						        <span  
						        	style="text-align:center"  > Fastq Folder
						        	<font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
						        	title="Fastq directory contain your fastq files. Files must have .fastq extensions and be contained at a depth of 1 only"  />
					      		</span>
						    </template>
						</b-table>
			           
			            <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.fastqDir.validation">A valid fastq directory is required</div>
			            <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.path.required">Run Directory Must be Specified</div>
					</b-form-group>
					<b-form-group
			            label-align-sm="center"
			            label-size="sm"
			            label-for="filterInput"
			            class="mb-0 formGroup"
			            v-slot="{ ariaDescribedby }"
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
								id="run_config_table"
								:fields="run_config_fields"
								:items="[
									'primers', 	
									'basecalling', 
									'barcoding'
								]"
								small
								style="text-align:left"
							>
								<template  v-slot:cell(key)="row" >
									<p style="text-transform: capitalize">{{row.item}}</p>
								</template>
								<template  v-slot:cell(filename)="row">
									<b-alert show v-if="selectedHistory.runDir.run_config[row.item].not_found && !isNew" variant="warning">{{selectedHistory.runDir.run_config[row.item].name}} - Unsaved {{row.item}}</b-alert>
									<b-form-select class="formGroup-input" 
										v-model="selectedHistory.runDir.run_config[row.item]"  
										:disabled="!isNew"
										:multiple="(row.item == 'barcoding' ? true : false)"
										v-else
										text-field="text"
										value-field="value"
										style="text-align:left"
										:options="modules.basestack_consensus.resources.run_config[row.item].map((x) => { return {text: x.name, value: x}   })">
									</b-form-select>
								</template>
								<template  v-slot:cell(custom)="row">
									<font-awesome-icon :class="[ 'text-success' ]" 
										v-if="selectedHistory.runDir.run_config[row.item].name && selectedHistory.runDir.run_config[row.item].custom && !selectedHistory.runDir.run_config[row.item].not_found " 
										icon="check" 
									/>
									<font-awesome-icon :class="['text-warning']" 
										v-else-if="selectedHistory.runDir.run_config[row.item].name && selectedHistory.runDir.run_config[row.item].custom && selectedHistory.runDir.run_config[row.item].not_found "  
										icon="times-circle"
										v-tooltip="{
								            content: `${selectedHistory.runDir.run_config[row.item].name} not present in list of options, consider registering it via the custom toggle`,
								            placement: 'top',
								            classes: ['text-info', 'bg-dark'],
								            trigger: 'hover',
								        }"
									/>
								</template>
								<template  v-slot:cell(remove)="row">
									<span v-if="selectedHistory.runDir.run_config[row.item].custom && !selectedHistory.runDir.run_config[row.item].not_found && isNew"   v-on:click="rmAttribute(selectedHistory.runDir.run_config[row.item], row.item ).then((val)=>{ selectedHistory.runDir.run_config[row.item] = val});"  style="justify-content: right !important" class="center-align-icon justify-content-end" 
					            		v-tooltip="{
								            content: 'Remove',
								            placement: 'top',
								            classes: ['info'],
								            trigger: 'hover',
								            targetClasses: ['it-has-a-tooltip'],
								            }"
						            	>
										<font-awesome-icon class="configure warn-icon" icon="minus"/>
									</span>
								</template>
							</b-table>
						</b-input-group-append>
					    <span 
				        	style="text-align:center"  >
				        	Modify Config File
			      		</span>
			      		<span  class="center-align-icon;"
		            		v-tooltip="{
					            content: 'Define Default Primer, Barcoding, or Basecalling',
					            placement: 'top',
					            classes: ['info'],
					            trigger: 'hover',
					            targetClasses: ['it-has-a-tooltip'],
					            }"
		            	>
		            		<font-awesome-icon class="configure"  v-b-toggle.sidebar-right-run-config icon="cog" size="sm"  />
					    </span>	
					    <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.run_config.validation.required">Specify valid config information</div>
					   	<b-sidebar id="sidebar-right-run-config" title="Customize Run Config" right shadow @shown="customPrimerAdd=true" @hidden="customPrimerAdd=false">
					   		<b-input-group-append v-for="key in ['primers', 'basecalling', 'barcoding']" > 
					   			<hr>
					   			<h3 style="text-align: center">{{key}}</h3>
					   			<br>
								<b-form-file 
			                 	 :directory="key == 'primers' ? true : false"
				                 :no-traverse="true"
				                 :multiple="key == 'primers' ? true : false"
				          		 :file-name-formatter="formatNames"
				                 :disabled="!isNew" 
				                 aria-describedby="seq_file" 
				                 @change="changeFile(
				                 {
				                 	event: $event, 
				                 	target: `config.modules.basestack_consensus.resources.run_config.${key}`,
									file_target: `modules.basestack_consensus.resources.run_config.${key}`,
									type: key == 'primers' ? 'dir' : 'file',
									sublevel: key == 'primers' ? 1 : 0
				                 })"
				                 :placeholder="`Choose ${key} input`"
				                 :drop-placeholder="`Drop ${key} input`"
				                 >
			                	</b-form-file>
							</b-input-group-append>
						</b-sidebar >

					</b-form-group>
				</b-col>

				

			</b-row>
			<hr>
		</div>
		
    </b-form>


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
import { LoopingRhombusesSpinner } from 'epic-spinners'
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
		HalfCircleSpinner,
		LoopingRhombusesSpinner
	},
	computed: {
		stateRunFolder(){
			return this.fastqFiles.length == 0 ? false : true
		},	
	},
	props: ['modules', 'images', 'selectedTag'],
	data() {
		return {
			globalState:null,
			newState: null,
			reportDir: null,
			checkboxBasecalling: false,
			customPrimerAdd: false,
			checkboxBarcoding: false,
			run_config_fields: [
          		{key: 'key', label: 'Key', sortable: false},
				{key: 'filename', label: 'Filename', sortable: false, class: 'text-center'},
          		{key: 'custom', label: 'Custom', sortable: false, class: 'text-center'},
          		{key: 'remove', label: 'Remove', sortable: false},
			],
			manifest_fields: [
				{key: 'barcode', label: 'Barcode', sortable: false, class: 'text-center'},
          		{key: 'id', label: 'ID', sortable: false, class: 'text-center'},
          		{key: 'adm', label: 'Action', sortable: false, class: 'text-center'},
			],
			specifics_table_fields: [
				{key: 'exists', label: 'Exists', sortable: false, class: 'text-center'},
				{key: 'name', label: 'Filename', sortable: false, class: 'text-center'},
				{key: 'errors', label: 'Errors', sortable: false, class: 'text-center'},
			],
			showBookmarkTooltip: false,
			runDir:{
				path: null,
				basename: null,
				possibleFastqFolders: [],
				fastqDir: {
					path: null,
					name: null,
					files: null,
					validation: false
				},
				run_config: {
					primers: {
						custom: false,
						name: null,
						key: 'primers'
					}, 
					basecalling:{
						custom: false,
						key: 'basecalling',
						name: null
					}, 
					barcoding:[
						{
							custom:false,
							name: null,
							key: 'barcoding'
						}
					],
					
					filename: 'run_config.txt'
				}, 
				manifest: {
					entries: [],
					filename: 'manifest.txt'
				},
				specifics: {
					throughput: {exists: false, name: 'Throughput', errors: null},
					seq_summary: {exists: false, name: 'Sequencing Summary', errors: null},
					drift_correction: {exists: false, name: 'Drift Correction', errors: null}
				}
			},
			validatingRunDir: false,
			baseRunDir: null,
			fastqDir: null,
			name: null,
			fastqFiles: [],
			overrideManifest: false,
			state:false,

			primerDir: null,
			preload_primerDirs: [],
			primerFiles: null,
			barcodingFiles: null,
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

	        srcMd: null,
	        placeHolderSampleID: 'Sample',
	        placeHolderBarcode: 'NB',
	        placeHolderManifestCount: 12
		}
	},
	async mounted() {
		// await this.fetchPrimers()
		this.baseRunDir = this.runDir
        await this.fetchHistories()
        // this.selectedHistory = this.histories[this.histories.length - 1]
        this.selectedHistory = this.histories[this.histories.length - 1]
        

	},
    validations: {
      selectedHistory: {
      		runDir: {
      			exists: {
      				required
      			},
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
        				checked: value => value === true 
        			},
        			path: {
        				required
        			}
        		},
        		specifics: {
        			seq_summary: {
        				exists: {
        					checked: value => value === true 
        				},
        				errors: {
        					checked: value => value && value.length == 0 
        				}
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

    	primerFiles: async function(val){
    		if (this.selectedHistory.runDir.run_config.primers.custom){
    			let root = this.parseFileInput(val)
    			const primerV = path.basename(root)
    			const baseP = path.basename(path.dirname(root))
    			const fullname = `${baseP}/${primerV}`		
    			try{	
	    			let response =  await FileService.addSelection({
						target: `config.modules.basestack_consensus.resources.run_config.primers`,
						file_target: "modules.basestack_consensus.resources.run_config.primers",
						value: { name: fullname, custom: true, path: root},
						type: 'arr',
						key: "name"
					})
	    		} catch(err){
	    			console.error(err)
	    			this.$swal.fire({
						position: 'center',
						icon: 'error',
						showConfirmButton:true,
		                title:  err.response.data.message
					});
	    		}
    		}
    	},
    	barcodingFiles: async function(val){
    		for (entry in this.selectedHistory.runDir.run_config.barcoding){
	    		if (entry.custom){
	    			let root = this.parseFileInput(val)
	    			const primerV = path.basename(root)
	    			const baseP = path.basename(path.dirname(root))
	    			const fullname = `${baseP}/${primerV}`		
	    			try{	
		    			let response =  await FileService.addSelection({
							target: `config.modules.basestack_consensus.resources.run_config.barcoding`,
							file_target: "modules.basestack_consensus.resources.run_config.barcoding",
							value: { name: fullname, custom: true, path: root},
							type: 'arr',
							key: "name"
						})
		    		} catch(err){
		    			console.error(err)
		    			this.$swal.fire({
							position: 'center',
							icon: 'error',
							showConfirmButton:true,
			                title:  err.response.data.message
						});
		    		}
	    		}
	    	}
    	},
    	name: function(val){
    		if (this.isNew){
	    		this.customHistory.name = val
    		}
    	},
    	selectedHistory: function(val){
    		console.log(this.overrideManifest)
    		if (!val.custom){
    			this.isNew = false //Change this	
    		} else {
    			this.isNew = true
    		}
    		if (!this.overrideManifest){
    			// this.manifest_fields[2].thClass ='d-none'
    			// this.manifest_fields[2].tdClass = 'd-none'
    		} else{
    			
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
      	changeFile(data){
      		this.$emit('changeFile', data)
      	},
      	yes(){
      		console.log(this.selectedHistory.runDir.run_config.primers)
      	},
      	async rmAttribute(value, target){
      		try{	
      			let res = await this.$swal({
			        title: `Are you sure you want to remove ${target} attribute?`,
			        text: "You won't be able to revert this!",
			        type: 'warning',
			        showCancelButton: true,
			        confirmButtonColor: '#2b57b9',
			        cancelButtonColor: '#a60139',
			        confirmButtonText: 'Yes, remove it!'
		      	})
		        if (res.value) {
	    			let response = await FileService.rmSelection({
	    				target: `config.modules.basestack_consensus.resources.run_config.${target}`,
						file_target: `modules.basestack_consensus.resources.run_config.${target}`,
						value: value,
						type: 'arr',
						key: "name"
					})
					this.$swal({
				        title: `Removed attribute`,
				        type: 'success',
				        confirmButtonColor: '#2b57b9',
			      	})
			      	return response.data.data
	    		} else {
	    			return value
	    		}
    		} catch(err){
    			console.error(err)
    			this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  err.response.data.message
				});
				return value
    		}
      	},
      	parseFileInput(val){
			let root;
			let dirName;
			const files = val;
			if (Array.isArray(files)){
				if(files.length > 0){
					root = path.dirname(files[0].path)
					return root
				} else {
					return null
				}
			} else {
				return val.path
			}
	  	},
      	hideTooltipLater() {
	      setTimeout(() => {
	        this.showBookmarkTooltip = false;
	      }, 3000);
	    },
      	formatNames(files) {
        	return files.length === 1 ? `${files[0].name} selected` : `${files.length} files selected`
      	},
      	adjustManifest(){
      		if (this.placeHolderManifestCount){
      			let manifests_entries = []
      			for (let i =1; i <= this.placeHolderManifestCount; i++){

      				manifests_entries.push({
      					id: `${this.placeHolderSampleID}${(i < 10 ? "0"+i.toString() : i)}`, 
      					barcode: `${this.placeHolderBarcode}${(i < 10 ? "0"+i.toString() : i)}`
      				})
      			}
	      		this.selectedHistory.runDir.manifest.entries = manifests_entries
      		}
      	},
		changeBarcode(val, index){
			this.$set(this.selectedHistory.runDir.manifest.entries, index, {id:this.selectedHistory.runDir.manifest.entries[index].id, barcode:val})
		},
		changeID(val, index){
			this.$set(this.selectedHistory.runDir.manifest.entries, index, {id:val, barcode:this.selectedHistory.runDir.manifest.entries[index].barcode})
		},
		addManifestRow(index){
			this.selectedHistory.runDir.manifest.entries.splice(index, 0, {id:null, barcode:null})
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
		replaceChars(val){
			return val.replace(/[^A-Z0-9-]/gi,'-')
		},
		stateManifestID(id){
			if (id == "NTC"){
				return null
			}
			let ntc_found = false;
			this.selectedHistory.runDir.manifest.entries.map((d,i)=>{
				if (d.id){
					this.$set(this.selectedHistory.runDir.manifest.entries[i], 'id', this.replaceChars(this.selectedHistory.runDir.manifest.entries[i].id))
				}
				if (d.barcode){
					this.$set(this.selectedHistory.runDir.manifest.entries[i], 'barcode', this.replaceChars(this.selectedHistory.runDir.manifest.entries[i].barcode))
				}
				if (d.id =="NTC"){
					ntc_found = true
				}
				return d
			})
			return ntc_found ? null : false 
		},
		
		async changeRunDir(val, type){			
		 	this.runDir.path = this.parseFileInput(val)
		 	this.submitStatus = null
    		if (this.isNew){
    			this.selectedHistory.runDir.fastqDir = {
					path: null,
					name: null,
					files: [],
					validation: false
				}
			}
    		await this.validateRunDirContents(this.runDir, true).then((response)=>{
    			this.runDir = response.runDir
	    		this.selectedHistory.runDir = response.runDir

    		}).catch((err)=>{
    			console.error(err, "error in validation")
    		})
    		
		},
		validateRunDirContents(runDir, override){
			const $this = this
			this.validatingRunDir = true
			return new Promise(function(resolve,reject){
				FileService.validateRunDirContents({
					runDir: runDir,
					override: override
				}).then((response)=>{
					$this.validatingRunDir = false
					return resolve(response.data.data)
				}).catch((err)=>{
					console.error("error in validating run dir", err.response.data.message)
					$this.fastqFiles  = []
					$this.validatingRunDir = false
					reject(err.response.data.message)
				})
			})
		},
		async updateHistory(element){
			if (this.isNew){
				this.fastqFiles = this.stagedFastqFiles
			}
			this.selectedHistory = (element.custom ? this.customHistory : element)
			if (this.selectedHistory.runDir.path){
				await this.validateRunDirContents(this.selectedHistory.runDir, false).then((response)=>{
		    		this.selectedHistory.runDir = response.runDir
		    		if (this.$v.$invalid && this.selectedHistory.runDir.path) {
			        	this.submitStatus = 'Warning'
			        	this.sendSubmitMessage()
			        } else {
			    	    this.submitStatus = 'OK'
			        }
	    		}).catch((err)=>{
	    			console.error(err, "error in validation")
	    		})
	    	} else {
	    	    this.submitStatus = 'EMPTY'
	        }
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
			
		        this.selectedHistory = newReport
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
        	this.checkError()
			await FileService.startModule({
	            runDir: this.selectedHistory.runDir,
	            primerDir: this.selectedHistory.primerDir,
	            reportDir: this.selectedHistory.reportDir,
	            name: this.selectedHistory.name,
	            module: 'basestack_consensus',
	        }).then((response)=>{
				this.$swal.fire({
					position: 'center',
					icon: (response.data.exists ? 'warning' : 'success' ),
					showConfirmButton:true,
	                html:  response.data.message
				});	
				this.selectedHistory.running = true	        	
	        }).catch((error)=>{
	        	console.error(error)
				this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                html:  error.response.data.message
				});
	        })		
		},
		bookmarkParams: async function(type){
			if (this.$v.$invalid){
				this.submitStatus = 'Warning'
				this.sendSubmitMessage()
			}
			else{
				await FileService.bookmarkSelections({
	        		runDir: this.selectedHistory.runDir,
	        		primerDir: this.selectedHistory.primerDir,
	        		name: this.selectedHistory.name,
	        		type: type
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
	    				if (!this.selectedHistory){
	    					this.selectedHistory = this.histories[this.histories.length - 1]
	    				}
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
		        		reportDir: $this.selectedHistory.reportDir,
		        		name: $this.selectedHistory.name
		        	}).then((response)=>{
		        		this.bookmark = !this.bookmark
		        		this.fetchHistories().then(()=>{
    						this.histories.length > 0 ? this.selectedHistory = this.histories[0] : this.history = null;
	        			}).catch((errFetch)=>{console.error(errFetch)})
		        	}).catch((err)=>{
		        		let reportpath = this.selectedHistory.reportDir.path
		        		let html  = `
		        		${err.response.data.message}
		        		<hr>
		        		<button variant="outline-primary" id="open_folder_error" 
		        			@click="open(${reportpath})">
		        			Open Folder
		        		</button>`
		        		this.$swal.fire({
							position: 'center',
							icon: 'error',
							showConfirmButton:true,
			                title:  "Error in deleting history",
			                html: `${html}`,
			                onBeforeOpen: () => {
						    	const btn = document.querySelector('#open_folder_error')
						    	btn.addEventListener('click', () => {
						     		$this.open(reportpath)
						     	})
						   }

						})
		        	})
		        }
		    });
		},
		sendSubmitMessage(config){
			if (config){
				this.$emit('toast', 'b-toaster-top-full', config)
			} else {
	    		if (this.submitStatus == 'ERROR' || this.submitStatus == 'Warning'){
		    		let message = "No Error to report"
		    		let variant = 'danger'
		    		if (this.submitStatus == 'ERROR'){
		    			message = 'Please submit a valid Run Config, Manifest, Fastq Folder, and Run Directory. Also be sure that all errors are absent from the Specifics table'
		    		} else if (this.submitStatus =='Warning'){
		    			variant='warning'
		    			message = "Warning, one or more required items are missing or malformed. Consider fixing this issue as unforeseen issues can arise"
		    		}
	    			this.toast('b-toaster-top-center', {variant: variant, message: message, title: 'Error Message' } )
	    		}
			}
		},
		bookmarkSelections: async function(){
			if (this.$v.$invalid) {
	          this.submitStatus = 'ERROR'
	          this.sendSubmitMessage()
	        }
	        else {
        		this.submitStatus = 'OK'
        		await this.bookmarkParams('made').catch(() => null);
	        }
		},
		updateBookmark: async function(){
			if (this.$v.$invalid) {
	          this.submitStatus = 'ERROR'
	          this.sendSubmitMessage()
	        }
	        else {
        		this.submitStatus = 'OK'
        		await this.bookmarkParams('update').catch(() => null);
	        }
		},
		loadHistory: async function(){
			if (this.$v.$invalid) {
	        	this.submitStatus = 'Warning'
	        	this.sendSubmitMessage()
	        } else {
	    	    this.submitStatus = 'OK'
	        }
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
		toast(toaster, val){
        	this.$emit('toast', toaster, val)
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

#run_config_table td::before{
	margin:0px;
	text-align: right;
	width: 40%;
}

</style>