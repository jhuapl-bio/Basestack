<template>
    <div>
        <button @click="showWorkStatusesPopover = !showWorkStatusesPopover" class="w-[60px] h-[60px] relative hover:scale-110 duration-500">
            <div class="absolute w-[60px] h-[60px] text-lg text-blue-900 grid place-items-center">
                <span class="">3</span>
            </div>
    
            <svg viewBox="0 0 100 100" fill="none" stroke-linecap="round">
                <circle class="stroke-7 stroke-blue-300" cx="50" cy="50" r="44" />
                <circle class="stroke-7 stroke-blue-900" cx="50" cy="50" r="44" transform="rotate(-90 50 50)" stroke-dashoffset="69.11" stroke-dasharray="276.46" />
            </svg>
        </button>

        <div class="absolute bottom-0 left-[130px]">
            <transition
                enter-active-class="transition-all"
                leave-active-class="transition-all"
                enter-class="-translate-x-full opacity-0"
                enter-to-class="translate-x-0 opacity-100"
                leave-class="translate-x-0 opacity-100"
                leave-to-class="-translate-x-full opacity-0"
            >
                <work-statuses-popover 
                    v-show="showWorkStatusesPopover" 
                    :workStatuses="workStatuses" 
                />
            </transition>
        </div>
    </div>
</template>

<script>
import WorkStatusesPopover from '../WorkStatus/WorkStatusesPopover.vue'
export default {
    components: { WorkStatusesPopover },
    emits: ['workStatusesButtonClick'],
    data(){
        return {
            showWorkStatusesPopover: false,
            workStatuses: [
                {progress: 100, label: 'Module', error: false, link: ''},
                {progress: 58, label: 'Consensus', error: true, link: ''},
                {progress: 38, label: 'Procedure', error: false, link: ''}
            ]
        }
    }
}
</script>