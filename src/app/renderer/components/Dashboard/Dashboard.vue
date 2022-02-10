<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<AppLayout hasSidebar="true">
		<template #title>
			Your Basestack
		</template>

		<template #content>
			<!-- <RecentModules /> -->
			<!-- <WorkStatuses /> -->
			<!-- <LearnBasestack /> -->
		</template>

		<template #sidebar>
			<!-- <SystemSummary /> -->
			<!-- <ContactUs /> -->
			<!-- <AplLogo /> -->
		</template>
	</AppLayout>
</template>

<script>



import Sys from '@/components/Dashboard/System/Sys'
import About from '@/components/Dashboard/DashboardDefaults/About'
import Library from '@/components/Dashboard/DashboardDefaults/Library'
import AppLayout from '@/components/AppLayout';
// import App from '../../App.vue';

 

export default {
	name: 'mainpage',
	components:{
    Sys,
    Library,
    About,
    // App,
	AppLayout,
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

<!-- <style>
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
</style> -->