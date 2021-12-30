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
		<div id="topLogs" style="text-align:right; float: right">
			<!-- <span
			class="text-info"
			@click="showModules"
			>
				Add Logs
				<font-awesome-icon  class=" configure" icon="plus"/>
			</span> -->
			<!-- <multiselect 
				v-model="selected"
				select-label="" deselect-label="" 
				track-by="name" 
				label="name"
				placeholder="Select Service to Log" 
				:options="services" 
				:searchable="true" 
				:allow-empty="true" :preselect-first="false">
				<template slot="option" slot-scope="{ option }">
					<div>
						<font-awesome-icon icon="cog" size="sm"/>
						<span >{{option.name}}</span>
					</div>
				</template>
			</multiselect> -->
		</div>
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
							<font-awesome-icon @click="jumpModule(key)" class="text-info configure" icon="external-link-alt"/>
							<font-awesome-icon @click="removeLog(key)" class="text-error configure" icon="times"/>
							</span>
						</span>
						
						
					</div>
				</template>
				<div v-for="(entry2, key2) in entry.services" :key="key2">
					<LogWindow :info="entry2.log.info"></LogWindow>
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
			selected: null,
			tab: 0,
		}
	},
	created(){
		
	},
	watch:{
		
	},
	computed: {
	},
	async mounted(){
		const $this = this	
		// let services = await FileService.getAllProcedureStatus()
		// this.services = services.data.data
		// setInterval(()=>{
			$this.checking = true
			// let services = [[0,0,0]]
			FileService.getProceduresStatusSelect(this.selectedProcedures).then((response)=>{
				$this.checking = false
				$this.serviceStatuses = response.data.data
			}).catch((err)=>{
				$this.$logger.error(err)
				$this.checking = false
			})
		// }, 2000)


	},

	methods: {
      removeLog(key){
		  this.selectedProcedures.splice(key, 1)
		  this.moduleStatuses.splice(key, 1)
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


