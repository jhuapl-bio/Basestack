<template>
    <!-- <Button type="pill"> -->
    <component :is="button">
    </component>
</template>

<script>
export default {
    props: {
        type: {type: String, default: 'regular'},
    },
    computed: {
        button: (props) => {
            switch(props.type) {
                case 'selector':
                    return 'SelectorButton'
                case 'pill':
                    return 'PillButton'
                case 'circle':
                    return 'CircleButton'
                case 'small':
                    return 'SmallButton'
                default:
                    return 'RegularButton'
            }
        }
    }
}
</script>