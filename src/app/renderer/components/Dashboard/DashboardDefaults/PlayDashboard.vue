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
		<b-tabs 
	        v-model="tab" 
			v-if="defaultModule.options"
			content-class="mt-3"
        >
			<b-tab   v-for="(option, serviceIdx) in defaultModule.options" :title="option.title" :key="serviceIdx">
          		<component
					:is="option.component"
				>
				</component>
        	</b-tab>
		</b-tabs>
          
        
	</div>
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


