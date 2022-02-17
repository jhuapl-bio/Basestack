<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="mytax" >
	  <b-form-group>
		<span v-b-tooltip.hover.top 
			title="Start Mytax"
			v-if="!modules.basestack_mytax.status.running"
			class="center-align-icon configure"
				@click="start_module()" > Start Module
			<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
		</span>
			
		<span v-b-tooltip.hover.top
			v-else 
			title="Cancel Mytax Sync"
			class="center-align-icon configure"
				@click="cancel_module()" > Cancel Module
			<font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
		</span>
	</b-form-group>
	<b-row v-if="modules.basestack_mytax && modules.basestack_mytax.status && modules.basestack_mytax.status.running">
		<object id ="mytaxObj" type="text/html" :data="`${modules.basestack_mytax.config.base}:${modules.basestack_mytax.config.port}`">
		</object>
	</b-row>
	 
  </div> 
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>

import FileService from '@/services/File-service.js'

export default {
	name: 'Mytax',
	components: {
	},
	props: ['modules', 'images', 'selectedTag'],
	data(){
		return {
				
		}
	}, 
	async mounted(){
		console.log("start module")
		this.start_module()
	},
	computed: {
	  
	},

	beforeDestroy(){
		this.cancel_module()
    },
	methods: {
		open_link (link,e) {
			e.stopPropagation()
			this.$emit("open", link)
      	},
		async start_module(){
      		await FileService.startModule({
				module: 'basestack_mytax',
      			submodule: 'basestack_mytax',
      		}).then((response)=>{
				this.count +=1
        	}).catch((error)=>{
		        console.error("-----------------", error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
      	},
      	async cancel_module(){
      		await FileService.cancelModule({
				module: 'basestack_mytax'
        	}).then((response)=>{
        		this.$swal.fire({
					position: 'center',
					icon: 'success',
					showConfirmButton:true,
	                title:  response.data.message
				})

        	}).catch((error)=>{
        		console.error(error)
        		this.$swal.fire({
					position: 'center',
					icon: 'error',
					showConfirmButton:true,
	                title:  error.response.data.message
				})
        	})
      	},
	}
};
</script>

<style>
#mytax{
	height:100%;
    overflow-y:auto;
    width: 100%;
}

#mytaxObj{
  min-height: 90vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}

</style>