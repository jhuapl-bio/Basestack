<template>
    <label class="flex flex-col w-full p-4 space-y-2">
        <div class="flex justify-between">
            <div class="flex items-center space-x-2">
                <font-awesome-icon
                    :icon="status.icon"
                    class="duration-200"
                    :class="{
                        'text-blue-900 animate-spin': status.value === 'active',
                        'text-green-100': status.value === 'complete',
                        'text-red': status.value === 'error',
                    }" 
                />

                <h5 class="text-gray-700 markup-h5 strong">
                    {{label}}
                </h5>

                <div class="text-gray-600 font-display">
                    ({{progress}}%)
                </div>

                <font-awesome-icon 
                    icon="info-circle" 
                    class="text-blue-500" 
                />
            </div>

            <div>
                <uncontained-button label="View Module" icon="chevron-right" />
            </div>
        </div>

        <div 
            class="relative w-full h-2 overflow-hidden rounded-full" 
            :class="[error ? 'bg-red/10' : 'bg-gray-500']"
        >
            <div
                class="relative top-0 left-0 h-full duration-500"
                :style="{width: progress + '%'}"
                :class="{
                    'bg-blue-900 animate-pulse': status.value === 'active',
                    'bg-green-100': status.value === 'complete',
                }"
            />
        </div>
    </label>
</template>

<script>
import UncontainedButton from '../buttons/UncontainedButton.vue'
export default {
    components: {'uncontained-button': UncontainedButton},
    props: ['label', 'progress', 'link', 'error'],
    computed: {
        status: (props) => {
            if(props.error === true)
                return {value: 'error', icon: 'exclamation-triangle'}

            return props.progress === 100 
                ? {value: 'complete', icon: 'check'}
                : {value: 'active', icon: 'spinner'}
        },
    }
}
</script>
