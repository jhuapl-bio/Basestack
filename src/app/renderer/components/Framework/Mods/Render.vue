<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div  class="render ">
	<v-divider></v-divider>
	<v-btn small class="mb-4 mr-2" v-on:click="forceRerender()"
		> Refresh
		<v-icon class="ml-3" small >$sync</v-icon>
	</v-btn>
	<v-tooltip bottom >
		<template v-slot:activator="{ on }">
		<v-icon align="end" v-on="on" class="configure" @click="open_link('', $event)" color="info" x-small>$external-link-alt
		</v-icon>
		</template>
		View in Browser
	</v-tooltip>  
	<v-divider></v-divider>
	<v-row v-if="show && status.exists && status.exists.running" class="">
		<!-- <object type="text/html"  class="renderObj ml-4 mr-2" :data="getUrl()"></object> -->
		<object type="text/html"  class="renderObj ml-4 mr-2" :data="getUrl()"></object>
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
			show: true,
			items: [
				{
				text: 'View in Browser',
					disabled: false,
					href: null,
				}
			],
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
		forceRerender(){
			const $this =this
			$this.show = false
			setTimeout(()=>{
			$this.show = true
			},400)
		},
		openUrl(){
			this.$electron.shell.openExternal(this.getUrl())
		},
		open_link (link, e) {
			e.stopPropagation()
			this.openUrl()
      	},
		getUrl(){
			//   let url  = `http://localhost:8080`
			  let url  = `http://localhost:${this.source.bind.to}`
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
	overflow-x:auto; 
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
  overflow-x:auto; 
}

</style>