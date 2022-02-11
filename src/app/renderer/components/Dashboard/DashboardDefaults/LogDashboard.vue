<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-card class="mx-5" style="margin-top: 5%; margin-right: 5%;">
		<v-row id="topLogs" >
			<v-col sm="4" class="mx-0">

				
				<v-select
					v-model="selectedTarget" 
					:items="catalog" 
					:select-size="4"
					:menu-props="{ maxHeight: '400' }"
					label=  "Select Target"
					:hint="`Choose 1 or more ${selectedTarget}`"
				>
					
				</v-select>
				<span
					class="text-secondary"
				>
					<!-- Add Logs -->
					<!-- <font-awesome-icon  class=" configure" icon="plus"/> -->
					Logging type
				</span>
			</v-col>
			<v-col sm="8">
				<v-select
					v-model="selectedModule" 
					:items="selected" 
					:select-size="4"
					prepend-icon="$comment"
					:label=  "`Select ${selectedTarget}`"
					:hint="`Choose 1 or more ${selectedTarget}`"
					multiple
          			persistent-hint
				>
					<template v-slot:selection="{ item, index }">
						<v-chip v-if="index <= 2">
						<span>{{ item }}</span>
						</v-chip>
						<span
							v-if="index === 3"
							class="grey--text text-caption"
						>
						(+{{ selected.length - 3 }} others)
						</span>
					</template>
				</v-select>
			</v-col>
			<v-col sm="8">
				<v-select
					v-model="selected" 
					:items="selected" 
					:select-size="4"
					prepend-icon="$comment"
					:label=  "`Select ${selectedTarget}`"
					:hint="`Choose 1 or more ${selectedTarget}`"
					multiple
          			persistent-hint
				>
					<template v-slot:selection="{ item, index }">
						<v-chip v-if="index <= 2">
						<span>{{ item }}</span>
						</v-chip>
						<span
							v-if="index === 3"
							class="grey--text text-caption"
						>
						(+{{ selected.length - 3 }} others)
						</span>
					</template>
				</v-select>
			</v-col>
		</v-row>
		<v-tabs 
	        v-model="tab" 
			show-arrows
			next-icon="$arrow-alt-circle-right"
      		prev-icon="$arrow-alt-circle-left"
			v-if="serviceStatuses"
			icons-and-text class="p-0 m-0"
        >
			<v-tabs-slider color="teal lighten-3"></v-tabs-slider>

			<v-tab  
				v-for="(entry,key) in serviceStatuses"
				v-bind:key="entry.name" class=""
				>
				<span >{{entry.name}}</span>
				
				<v-tooltip bottom>
					<template v-slot:activator="{ on }">
						<!-- <v-btn right v-on="on" class="text-right"> -->
							<v-icon   v-on="on"   x-small @click="removeLog(key)">$times</v-icon>
						<!-- </v-btn> -->
					</template>
					Close Log 
				</v-tooltip>
				<!-- <v-icon x-small @click="jumpModule(key)">$book</v-icon> -->
				
			</v-tab>
		</v-tabs>
		<v-tabs-items v-model="tab">
			<v-tab-item v-for="(entry,key) in serviceStatuses"
				v-bind:key="entry.name"   >
					<v-card >            
						<div v-if="selectedTarget == 'services'">
							<LogWindow v-if="entry.logs" :info="entry.logs.info"></LogWindow>
						</div>			
						<div v-else-if="selectedTarget == 'procedures'"> 
							<div v-for="(entry2, key) in entry.services"
								v-bind:key="key">
								<LogWindow v-if="entry2.log" :info="entry2.log.info"></LogWindow>
								<hr>
							</div>
						</div>
						<div v-else> 
							<div v-for="(entry2, key) in entry.dependencies"
								v-bind:key="key">
								<LogWindow v-if="entry2.status && entry2.status.stream" :info="entry2.status.stream.info"></LogWindow>
								<hr>
							</div>
						</div>
						
					</v-card>
			</v-tab-item >
		</v-tabs-items>
	</v-card>
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
	computed:{
		statuses(){
			return this.serviceStatuses
		},
		selectedAll () {
        return this.selected.length === this.selected.length
		},
		selectedSome () {
			return this.selected.length > 0 && !this.selectedAll
		},
		icon () {
			if (this.selectedAll) return '$square-full'
			if (this.selectedSome) return '$square-full'
			return '$square-full'
      	},
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
		selectedTarget(){
			this.selected = []
		},
		selected: function(newValue, oldValue){
			const $this = this
			if (this.interval){
				clearInterval(this.interval)
				this.interval = null
			}
			this.serviceStatuses= []
			if (newValue.length >=1){
				this.interval = setInterval(()=>{
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
							// response.data.data.forEach((entry, i)=>{
							// 	$this.$set($this.serviceStatuses, i, entry)
							// })
						}).catch((err)=>{
							// $this.$logger.error(err)
							console.error(err)
							$this.checking = false
						})
					} else {
						FileService.getSelectProceduresStatuses({
							items: newValue
						}).then((response)=>{
							$this.checking = false
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
	async mounted(){
		const $this = this	
	
		$this.checking = true
			
		FileService.getAllServiceNames().then((response)=>{
			this.names.services = response.data.data
			this.selected = [response.data.data[0]]
		})
		FileService.getAllProcedureNames().then((response)=>{
			this.names.procedures = response.data.data
		})
		FileService.getAllModuleNames().then((response)=>{
			this.names.modules = response.data.data
		})


	},

	methods: {
	  jumpModule(key){
		  console.log(key,"<<<<")
	  },
	  toggle () {
        this.$nextTick(() => {
          if (this.selected) {
            this.selected = []
          } else {
            this.selected = this.names[this.selectedTarget].slice()
          }
        })
      },
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


