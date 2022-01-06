<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<b-row class="mainContent">
		<b-col sm="7" style="background: white; overflow-y:auto">
			<div style="width:100%; ">
				<b-img style="" :src="require('@/assets/Basestack_multiple_landing.png')" fluid alt="JUHAPL"></b-img>
			</div>
		</b-col>

		<b-col sm="5">
			<!-- <b-row><a href="#" @click="emitChange( {target: 'tab', value: -1})   ">All System Details</a>
			</b-row> -->
			<b-row>
				<Sys class="sidebox"
				/>
				<About class="sidebox"></About>
			</b-row>
			
				
		
		
		</b-col>
          
        
	</b-row>
</template>

<script>



import Sys from '@/components/Dashboard/System/Sys'
import About from '@/components/Dashboard/DashboardDefaults/About'
import Library from '@/components/Dashboard/DashboardDefaults/Library'

 

export default {
	name: 'mainpage',
	components:{
		Sys,
		Library,
		About
	},
	
	props: ['modules', 'defaults', "moduleIdx"],
	data(){
		return{
			status: {},
			system: {},
		}
	},
	created(){
		
	},
	watch:{
		
	},
	computed: {
	  myProps() {
	    	return { 
	    		
	    	}
	  }
	},
	mounted(){
		const $this = this				
		
	},

	methods: {
      emitChange( data){
		   this.$emit("emitChange", data)
	  }
      
	}
};
</script>

<style>
.sidebox{
	max-height: 95vh;
	overflow:auto
}
 
</style>
<style lang="css">
	@import '../../../static/css/style.css';
</style>
<style lang="css">
	@import '../../../static/css/myriadpro.css';
</style>
<style lang="css">
	@import '../../../static/css/revised_branding_banner.css';
</style>
<style>
	@import '../../../static/css/tooltip.css';
</style>