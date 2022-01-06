<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<div class="mainContent">
		<b-row id="topLogs" style="text-align:right; ">
			<b-col sm="4">

				
				<b-form-select
					v-model="selectedTarget" 
					:options="['modules', 'services', 'procedures']" 
					
				>
					
				</b-form-select>
				<span
					class="text-secondary"
				>
					<!-- Add Logs -->
					<!-- <font-awesome-icon  class=" configure" icon="plus"/> -->
					Logging type
				</span>
			</b-col>
			<b-col sm="8">
				<b-form-select
					v-model="selected" 
					:options="names[selectedTarget]" 
					:select-size="4"
					multiple
				>
					
				</b-form-select>
			</b-col>
		</b-row>
		<b-tabs 
			v-if="serviceStatuses"
	        v-model="tab" 
	        nav-wrapper-class="w-3" 
	        left 
        	style="" 
        >
			<b-tab  
				v-for="(entry, key) in serviceStatuses"
				v-bind:key="key"
				class=""
				>
				<template v-slot:title style="">
					<div >
						<span style=" font-size: 0.9em" class="text-sm-center">{{entry.name}}
							<span style="">
							<!-- <font-awesome-icon @click="jumpModule(key)" class="text-info configure" icon="external-link-alt"/> -->
							<font-awesome-icon @click="removeLog(key)" class="text-error configure" icon="times"/>
							</span>
						</span>
						
						
					</div>
				</template>
				<div v-if="selectedTarget !== 'procedures'">
					<LogWindow v-if="entry.logs" :info="entry.logs.info"></LogWindow>
				</div>			
				<div v-else> 
					<div v-for="(entry2, key) in entry.services"
						v-bind:key="key">{{entry2}}
						<LogWindow v-if="entry2.log" :info="entry2.log.info"></LogWindow>
					</div>
				</div>
			</b-tab>
		</b-tabs>
		

          
        
	</div>
</template>

<script>



import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow'
import FileService from "@/services/File-service.js"
 
import Multiselect from 'vue-multiselect'

export default {
	name: 'logdashboard',
	components:{
		Multiselect,
		LogWindow,
	},
	
	props: ['modules'],
	data(){
		return{
			serviceStatuses: [],
			selectedProcedures: [2],
			checking: false,
			installed: [],
			services: [],
			selectedTarget: 'services',
			names: {
				services: [],
				modules: [],
				procedures: []
			},
			selected: [],
			tab: 0,
		}
	},
	created(){
		
	},
	watch:{
		selected: function(newValue, oldValue){
			const $this = this
			if (this.interval){
				clearInterval(this.interval)
			}
			if (newValue.length >=1){
				this.interval = setInterval(()=>{
					console.log('interval', $this.selectedTarget)
					if ($this.selectedTarget == 'services'){
						FileService.getSelectServicesStatuses({
							items: newValue
						}).then((response)=>{
							$this.checking = false
							$this.serviceStatuses = response.data.data
						}).catch((err)=>{
							// $this.$logger.error(err)
							$this.checking = false
						})
					} else if ($this.selectedTarget == 'modules'){
						FileService.getSelectModulesStatuses({
							items: newValue
						}).then((response)=>{
							$this.checking = false
							$this.serviceStatuses = response.data.data
						}).catch((err)=>{
							// $this.$logger.error(err)
							$this.checking = false
						})
					} else {
						FileService.getSelectProceduresStatuses({
							items: newValue
						}).then((response)=>{
							$this.checking = false
							console.log($this.serviceStatuses)
							$this.serviceStatuses = response.data.data
						}).catch((err)=>{
							// $this.$logger.error(err)
							$this.checking = false
						})
					}
						
				}, 2500)
			} else {
				this.serviceStatuses = []
			}
		}
	},
	computed: {
	},
	async mounted(){
		const $this = this	
	
		$this.checking = true
			
		FileService.getAllServiceNames().then((response)=>{
			this.names.services = response.data.data
		})
		FileService.getAllProcedureNames().then((response)=>{
			this.names.procedures = response.data.data
		})
		FileService.getAllModuleNames().then((response)=>{
			this.names.modules = response.data.data
		})


	},

	methods: {
      removeLog(key){
		  this.selected.splice(key, 1)
		//   this.moduleStatuses.splice(key, 1)
	  },
	  async showModules(){
		const $this = this
		let services = await FileService.getAllWorkflowStatus()
		services = services.data.data
		let fullList = services.map((module, moduleIdx)=>{
			return module
		}) 
		
		let inputOptions = {}
		function makeOptions(fullList){
			let r = fullList.filter((eg)=>{
				return eg.status.running
			})
			r = r.map((service, index) => {
				
				return `<option value="${index}">${service.name}</option>`
				
			});
			return `<select>${r}</select>`
		}
		this.$swal.fire({
			title: 'Open Logs for Service',
			input: 'select',
			inputPlaceholder: 'Select service to log',
			inputLabel: "Label",
			showCancelButton: true,
			html: makeOptions(fullList),
			focusConfirm: false
		})

			// }
			// inputOptions= {
			// 	'Fruits': {
			// 		apples: 'Apples',
			// 		bananas: 'Bananas',
			// 		grapes: 'Grapes',
			// 		oranges: 'Oranges'
			// 	},
			// 	'Vegetables': {
			// 		potato: 'Potato',
			// 		broccoli: 'Broccoli',
			// 		carrot: { 
			// 			c: 'Carrot',
			// 			b: "Barrot",	
			// 		},

			// 	},
			// 	'icecream': 'Ice cream'
			// // }
		
		 
	  }
      
	}
};
</script>


