<template>
    <div 
        class="flex card hoverable"
        :class="[isNotCompact ? 'flex-col' : 'flex-row space-x-4']"
    >
        <div class="flex items-center justify-between">
            <div class="rounded-lg bg-blue-100 w-[37px] h-[37px] inline-flex justify-center items-center">
                <font-awesome-icon icon="cube" class="text-lg text-blue-700" />
            </div>
            
            <circle-button v-if="isNotCompact" icon="ellipsis-v" class="uncontained" />
        </div>

        <div>
            <h2 class="text-gray-700 markup-h4 strong" :class="{'mt-4': isNotCompact}">{{moduleName}}</h2>

            <div v-if="isNotCompact" class="flex items-center justify-start space-x-2">
                <span class="text-gray-600 markup-label-sm">{{`V${version}`}}</span>

                <span 
                    v-if="hasUpdateAvailable" 
                    class="font-medium text-blue-900 markup-label-sm"
                >
                    Update Available
                </span>
            </div>

            <p class="text-left text-gray-800 markup-body-sm" :class="{'mt-2': isNotCompact }">
                {{description}}
            </p>
            <a v-if="isNotCompact" :href="link" class="font-bold text-blue-900 markup-body-sm">Read more</a>
        </div>
    </div>
</template>

<script>
import CircleButton from './buttons/CircleButton.vue'
export default {
    components: {'circle-button': CircleButton},
    props: ['moduleName', 'version', 'hasUpdateAvailable', 'description', 'compactView', 'link'],
    computed: {
        isNotCompact: (props) => {
            return !props.compactView
        }
    }
}
</script>
