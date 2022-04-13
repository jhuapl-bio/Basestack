<template>
	<AppLayout hasSidebar="true">
		<template #title>
            <h2 class="text-blue-900 markup-h1">
			    Your Basestack
            </h2>
		</template>

		<template #content>
            <div class="space-y-12">
                <RecentModules />
                <WorkStatuses :workStatuses="workStatuses" />

                <section class="space-y-2">
                    <div class="w-full min-h-[290px] p-12 bg-blue-200 text-blue-800 rounded-xl">
                        <h3 class="mb-24 markup-h2">What can Basestack do?</h3>
                        <!-- <router-link to="/tutorials"> -->
                            <regular-button action="accent" label="View Demo" />
                        <!-- </router-link> -->
                    </div>

                    <div class="w-full min-h-[290px] p-12 bg-green-100/25 text-green-200 rounded-xl">
                        <h3 class="mb-24 markup-h2">Learn to use Basestack</h3>
                        <!-- <router-link to="/tutorials"> -->
                            <regular-button action="accent" label="View Demo" />
                        <!-- </router-link> -->
                    </div>
                </section>

            </div>
			<!-- <LearnBasestack /> -->
		</template>

		<template #sidebar>
			<system-summary />
			<!-- <ContactUs /> -->
			<!-- <AplLogo /> -->
		</template>
	</AppLayout>
</template>

<script setup>
import {defineProps, reactive} from 'vue'
import AppLayout from '@/components/AppLayout';
import WorkStatuses from '@/components/ui/WorkStatus/WorkStatuses.vue'
import SystemSummary from '@/components/Dashboard/System/SystemSummary.vue'
import RecentModules from '@/components/Dashboard/RecentModules.vue'
import RegularButton from '../components/ui/buttons/RegularButton.vue';

const props = defineProps(['modules', 'defaults', 'modulesIdx'])
const status = reactive({})
const system = reactive({})
const workStatuses = reactive([
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
])
</script>