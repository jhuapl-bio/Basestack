<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div class="render" >
	<v-row v-if="status.exists && status.exists.running">
		<object type="text/html" class="renderObj" :data="getUrl()"></object>
	</v-row>
  </div> 
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>

import FileService from '@/services/File-service.js'

export default {
	name: 'Render',
	components: {
	},
	props: ['source', 'status', 'service'],
	data(){
		return {
				
		}
	}, 
	async mounted(){
		// this.start_module()
	},
	computed: {
	  
	},

	beforeDestroy(){
		// this.cancel_module()
    },
	methods: {
		open_link (link,e) {
			e.stopPropagation()
			this.$emit("open", link)
      	},
		  getUrl(){
			  let url  = `http://localhost:${this.source.to}`
			  if (this.source.suburl){
				  url = url + this.source.suburl
			  }
			  return url
		  }
	}
};
</script>

<style>
.render{
	height:100%;
    overflow-y:auto;
    width: 100%;
}

.renderObj{
  min-height: 90vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}

</style>