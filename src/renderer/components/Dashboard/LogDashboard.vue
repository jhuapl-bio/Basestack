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
	<div class="mx-auto" style="overflow-y: auto;" :max-height="panelHeight">
		<!-- <LogWindow  :env="env"></LogWindow>  -->
	</div>
	
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
		},
		panelHeight: Number
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
		this.$emit("initialLoadCall")

	},

	methods: {
	  
      
	}
});
</script>


