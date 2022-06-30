<template>
    <div class="flex flex-col card hoverable">
        <div class="flex items-center justify-between">

            <div class="flex items-start space-x-4">
                
                <div class="rounded-lg bg-blue-100 w-[37px] h-[37px] inline-flex justify-center items-center">
                    <font-awesome-icon icon="cube" class="text-lg text-blue-700" />
                </div>

                <div class="flex flex-col space-y-1">
                    <h2 class="leading-none text-gray-700 markup-h4 strong">{{moduleName}}</h2>

                    <div class="flex space-x-4">
                        <span class="text-gray-600 markup-label-sm">{{`V${version}`}}</span>
                        <span v-if="hasUpdateAvailable" class="font-medium text-blue-900 markup-label-sm">
                            Update Available
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="flex items-center">
                <tag color="green-light">New</tag>
                <circle-button icon="ellipsis-v" class="uncontained" />
            </div>
        </div>

        <div>
        
            <p class="mt-2 text-left text-gray-800 markup-body-sm">
                {{description}}
            </p>

            
            <a :href="link" class="font-bold text-blue-900 markup-body-sm">Read more</a>
        </div>
    </div>
</template>

<script>
import CircleButton from './buttons/CircleButton.vue'
import Tag from './Tag.vue'
export default {
    components: {'circle-button': CircleButton, 'tag': Tag},
    props: ['moduleName', 'version', 'hasUpdateAvailable', 'description', 'link'],
}
</script>
