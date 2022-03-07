<template>
    <div 
        class="flex px-6 py-4 duration-500 border-2 rounded-lg border-gray hover:shadow-lg hover:shadow-gray" 
        :class="[isNotCompact ? 'flex-col' : 'flex-row space-x-4']"
    >
        <div class="flex items-center justify-between">
            <div class="rounded-lg bg-blue-extralight w-[37px] h-[37px] inline-flex justify-center items-center">
                <font-awesome-icon icon="cube" class="text-lg text-blue-darker" />
            </div>
            
            <div v-if="isNotCompact">
                <font-awesome-icon icon="ellipsis-v" class="text-lg text-gray-dark" />
            </div>
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
export default {
    props: ['moduleName', 'version', 'hasUpdateAvailable', 'description', 'compactView', 'link'],
    computed: {
        isNotCompact: (props) => {
            return !props.compactView
        }
    }
}
</script>
