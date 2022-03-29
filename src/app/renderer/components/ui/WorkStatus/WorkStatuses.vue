<template>
    <section>
        <header class="flex items-center mb-2 space-x-2">
            <font-awesome-icon icon="clock" class="text-gray-600" />
            <h5 class="markup-h5 text-gray-700">Work Statuses ({{numberOfStatuses}})</h5>
        </header>

        <div class="border border-gray-400 divide-y divide-gray-400">
            <work-status 
                v-for="(workStatus, index) in workStatuses"
                :key="index"
                :progress="workStatus.progress"
                :label="workStatus.label"
                :error="workStatus.error"
            />
        </div>
    </section>
</template>

<script>
import WorkStatus from './WorkStatus.vue'
export default {
    components: {'work-status': WorkStatus},
    props: ['workStatuses'],
    computed: {
        numberOfStatuses: (props) => props.workStatuses.length
    }
}
</script>