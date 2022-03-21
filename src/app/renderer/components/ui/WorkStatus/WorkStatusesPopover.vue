<template>
    <section>
        <div class="border border-gray-400 bg-white divide-y divide-gray-400 rounded-lg w-[260px]">
            <work-status-popover
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
import WorkStatusPopover from './WorkStatusPopover.vue'
export default {
    components: {'work-status-popover': WorkStatusPopover},
    props: ['workStatuses'],
    computed: {
        numberOfStatuses: (props) => props.workStatuses.length
    }
}
</script>