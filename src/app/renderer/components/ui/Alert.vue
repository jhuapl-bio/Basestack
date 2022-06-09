<template>
    <div class="markup-h6 font-normal text-left flex items-center justify-start rounded-sm" :class="classes.background">
        <font-awesome-icon :icon="icon" class="text-sm mr-2" :class="classes.icon" />
        <span :class="classes.message">{{message}}</span>
    </div>
</template>

<script>
export default {
    props: ['type', 'message', 'fill'],
    computed: {
        icon: (props) => {
            switch(props.type) {
                case 'success':
                    return 'check-circle'
                case 'warning':
                case 'error':
                    return 'exclamation-triangle'
                default:
                    return ''
            }
        },

        classes: (props) => {

            // alerts w/ background colors
            if(props.fill) {
                switch(props.type) {
                    case 'success':
                        return {
                            background: 'bg-gray-200 px-6 py-3',
                            icon: 'text-green',
                            message: 'text-gray-800'
                        }
                    case 'warning':
                        return {
                            background: 'bg-orange-100 px-6 py-3',
                            icon: 'text-orange',
                            message: 'text-orange-900'
                        }
                    case 'error':
                        return {
                            background: 'bg-red-100 px-6 py-3',
                            icon: 'text-red',
                            message: 'text-red-900'
                        }
                    default:
                         return {
                            background: 'bg-gray-200 px-6 py-3',
                            icon: 'text-gray-500',
                            message: 'text-gray-800'
                        }
                }
            }

            // alerts w/o background color (only the icon changes)
            const noFillIconColor = () => {
                switch(props.type) {
                    case 'success':
                        return 'text-green'
                    case 'warning':
                        return 'text-orange'
                    case 'error':
                        return 'text-red'
                    default:
                        return 'text-blue'
                }
            }
            
            return {
                background: 'py-2',
                message: 'text-gray-700',
                icon: noFillIconColor()
            }
        }
    },
}
</script>
