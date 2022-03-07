<template>
    <div 
        class="flex card hoverable"
        :class="[isNotCompact ? 'flex-col' : 'flex-row space-x-4']"
    >
        <div class="flex items-center justify-between">
            <div class="rounded-lg bg-blue-extralight w-[37px] h-[37px] inline-flex justify-center items-center">
                <font-awesome-icon icon="cube" class="text-lg text-blue-darker" />
            </div>
            
            <circle-button v-if="isNotCompact" icon="ellipsis-v" class="uncontained" />
        </div>

        <div>
            <h2 class="markup-h4 strong text-gray-darkest" :class="{'mt-4': isNotCompact}">{{moduleName}}</h2>

            <div v-if="isNotCompact" class="flex items-center justify-start space-x-2">
                <span class="markup-label-sm text-gray-darker">{{`V${version}`}}</span>

                <span 
                    v-if="hasUpdateAvailable" 
                    class="font-medium markup-label-sm text-blue-extradark"
                >
                    Update Available
                </span>
            </div>

            <p class="text-left markup-body-sm text-gray-extradark" :class="{'mt-2': isNotCompact }">
                {{description}}
            </p>
            <a v-if="isNotCompact" :href="link" class="font-bold markup-body-sm text-blue-extradark">Read more</a>
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
