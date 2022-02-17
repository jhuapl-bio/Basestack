<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="oxford_demo" >
	  <b-form-group>
		<span v-b-tooltip.hover.top 
			title="Start oxford_demo"
			v-if="!modules.oxford_demo.status.running"
			class="center-align-icon configure"
				@click="start_module()" > Start Module
			<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
		</span>
			
		<span v-b-tooltip.hover.top
			v-else 
			title="Cancel"
			class="center-align-icon configure"
				@click="cancel_module()" > Cancel Module
			<font-awesome-icon  icon="times" style="margin-left: 10px; margin-right: 10px"/>
		</span>
	</b-form-group>
	<b-row v-if="modules.oxford_demo && modules.oxford_demo.status && modules.oxford_demo.status.running">
		<object id ="mytaxObj" type="text/html" :data="`${modules.oxford_demo.config.base}:${modules.oxford_demo.config.port}`">
		</object>
	</b-row>
	<b-row v-else>
		<h4>oxford_demo isn't running</h4>
		<span v-b-tooltip.hover.top 
				title="Reload module ui, check logs if issues persist"
				class="center-align-icon configure"
  			 @click="start_module()" >
  			<font-awesome-icon  icon="sync" style="margin-left: 10px; margin-right: 10px"/>
  		</span>
	</b-row> 
  </div> 
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>

import FileService from '@/services/File-service.js'

export default {
	name: 'Oxford_Demo',
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
				module: 'oxford_demo',
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
				module: 'oxford_demo'
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
#oxford_demo{
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