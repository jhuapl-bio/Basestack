<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<app-layout hasSidebar="true">
		<template #title>
            <h2 class="text-blue-900 markup-h1">
			    Your Basestack
            </h2>
		</template>

		<template #content>
            <div class="space-y-12">
                <recent-modules />
                <work-statuses :workStatuses="workStatuses" />
            </div>
			<!-- <LearnBasestack /> -->
		</template>

		<template #sidebar>
			<system-summary />
            <contact />
			<!-- <AplLogo /> -->
		</template>
	</app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout';
import Sys from '@/components/Dashboard/System/Sys'
import About from '@/components/Dashboard/DashboardDefaults/About'
import Library from '@/components/Dashboard/DashboardDefaults/Library'
import WorkStatuses from '../ui/WorkStatus/WorkStatuses.vue'
import SystemSummary from './System/SystemSummary.vue'
import Contact from './Contact.vue'
import RecentModules from './RecentModules.vue'

// import App from '../../App.vue';

 

export default {
	name: 'mainpage',
	components: {
        'app-layout': AppLayout,
        'work-statuses': WorkStatuses,
        'system-summary': SystemSummary,
        'recent-modules': RecentModules,
        'contact': Contact,
    },
	props: ['modules', 'defaults', "moduleIdx"],
	data(){
		return{
			status: {},
			system: {},
            workStatuses: [
                {
                    "progress": 100,
                    "label": "Module",
                    "error": false,
                    "link": ""
                },
                {
                    "progress": 58,
                    "label": "Consensus",
                    "error": true,
                    "link": ""
                },
                {
                    "progress": 38,
                    "label": "Procedure",
                    "error": false,
                    "link": ""
                }
            ],
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