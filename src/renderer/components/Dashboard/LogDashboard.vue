<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<!-- <v-card  class="mx-5" style="margin-top: 5%; margin-right: 5%;"> -->
	<LogWindow  :env="env"></LogWindow> 
	<!-- </v-card> -->
</template>

<script lang="ts" >



import LogWindow from './LogWindow.vue'
 
import { defineComponent } from 'vue';

export default defineComponent({ 
	name: 'LogDashboard',
	components:{
		LogWindow,
	},
	computed:{
		
	},
	beforeDestroy(){
		// clearInterval(this.interval)
	},
	props: {
		logs: {
			type: Array,
			required: true
		},
		env: {
			type: Object, 
			required: true
		}
	},
	data: State => { // ADD
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
		console.log("logs")

	},

	methods: {
	  
      
	}
});
</script>


