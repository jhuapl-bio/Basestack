<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-card  class="mx-5" style="margin-top: 5%; margin-right: 5%;">
		<v-row id="topLogs" >
			<LogWindow v-if="logs" :info="logs" :link="link"></LogWindow>
		</v-row>
	</v-card>
</template>

<script>



import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow'
import FileService from "@/services/File-service.js"
 

export default {
	name: 'logdashboard',
	components:{
		LogWindow,
	},
	computed:{
		
	},
	beforeDestroy(){
		// clearInterval(this.interval)
	},
	props: ['logs'],
	data(){
		return{
			link: null,
		}
	},
	created(){ 
		
	},
	watch:{
		
	},
	async mounted(){
		const $this = this	
	
		$this.checking = false


	},

	methods: {
	  
      
	}
};
</script>


