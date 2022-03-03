<template>
    <button 
        :class="`${actionClasses}`"
        class="inline-grid items-center grid-cols-3 font-semibold duration-300 divide-x-2 rounded-sm markup-h5 font-display"
    >
        <div :class="sizeClasses" class="col-span-2">
            {{label}}
        </div>

        <div :class="sizeClasses" class="flex items-center justify-center h-full leading-none">
            <!-- <font-awesome-icon :icon="['fas', 'plus']" /> @todo: get font awesome working -->
            +
        </div>
    </button>
</template>

<script>
export default {
    props: {
        label: {type: String},
        action: {type: String, default: 'primary'},
        size: {type: String, default: 'base'},
        icon: {type: String, default: 'false'}
    },
    computed: {
        actionClasses: (props) => {
            switch(props.action) {
                case 'secondary':
                    return 'bg-primary-blue-light text-primary-blue divide-primary-blue/50'
                case 'neutral':
                    return 'bg-gray-darkest text-white hover:bg-black divide-black'
                case 'accent':
                    return 'bg-white text-primary-blue border-2 rounded-sm border-primary-blue-light divide-primary-blue-light/30'
                case 'success':
                    return 'bg-secondary-darkgreen text-white divide-white/30'
                case 'danger':
                    return 'bg-secondary-red text-white divide-white/30'
                default: // primary
                    return 'bg-primary-blue text-white divide-white/25'
            }
        },

        sizeClasses: (props) => {
            switch(props.size) {
                case 'small':
                    return 'px-3 py-2'
                default:
                    return 'px-5 py-3'
            }
        }
    }
}
</script>
