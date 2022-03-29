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
			<!-- <ContactUs /> -->
			<!-- <AplLogo /> -->
		</template>
	</app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout';
import WorkStatuses from '@/components/ui/WorkStatus/WorkStatuses.vue'
import SystemSummary from '@/components/Dashboard/System/SystemSummary.vue'
import RecentModules from '@/components/Dashboard/RecentModules.vue'

// import App from '../../App.vue';

 

export default {
	name: 'mainpage',
	components: {
        'app-layout': AppLayout,
        'work-statuses': WorkStatuses,
        'system-summary': SystemSummary,
        'recent-modules': RecentModules,
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