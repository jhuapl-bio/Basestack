<template>
    <button 
        :class="`${actionClasses} ${sizeClasses}`"
        class="inline-flex font-semibold duration-300 rounded-sm font-display"
    >
        <span v-if="label">
            {{label}}
        </span>

        <span v-if="icon">
            {{icon}}
        </span>
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
                    return 'bg-primary-blue-light text-primary-blue'
                case 'neutral':
                    return 'bg-gray-darkest text-white hover:bg-black'
                case 'accent':
                    return 'bg-white text-primary-blue border-2 rounded-sm border-primary-blue-light'
                case 'success':
                    return 'bg-secondary-darkgreen text-white'
                case 'danger':
                    return 'bg-secondary-red text-white'
                default: // primary
                    return 'bg-primary-blue text-white'
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
