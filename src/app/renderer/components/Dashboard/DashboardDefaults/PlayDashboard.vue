<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-tabs 
		v-model="tab" 
		show-arrows centered
		next-icon="$arrow-alt-circle-right"
		prev-icon="$arrow-alt-circle-left"
		icons-and-text 
		class=""
		color="blue-grey"
		slider-color="light"
	>
		<v-tab   v-for="(option, serviceIdx) in defaultModule.options" :title="option.title" :key="serviceIdx">
				{{option.title}}				
		</v-tab>
		<v-tab-item v-for="(option, serviceIdx) in defaultModule.options" :title="option.title" :key="serviceIdx">
			<component
				:is="option.component"
				style="" class="ml-4"
			>
			</component>	
		</v-tab-item>
	</v-tabs>
	 
</template>

<script>
import Nextstrain from "@/components/Dashboard/DashboardDefaults/Nextstrain"
import IGV from "@/components/Dashboard/DashboardDefaults/IGV"



 

export default {
	name: 'playdashboard',
	components:{
		IGV,
		Nextstrain
	},
	
	props: ['modules', 'defaults', 'defaultModule'],
	data(){
		return{
			status: {},
			system: {},
			tab:1
		}
	},
	created(){
		
	},
	watch:{
		
	},
	computed: {
	},
	mounted(){
		const $this = this				
		
	},

	methods: {
      
      
	}
};
</script>


