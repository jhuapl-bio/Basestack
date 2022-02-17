<template>
<!--
    <button
        type:
        -------
        default
        selector
        circle
        pill
        tag
        uncontained
        -------

        size:
        -------
        default
        small

        color:
        -------
        default (blue)
        black
    >Add Module</button>


-->
    <button 
        :class="`${color} ${size}`"
        class="inline-flex font-semibold rounded-sm font-display"
    >
        <span>
            <slot></slot>
        </span>

        <!-- <span v-if="icon">
            {{icon}}
        </span> -->
    </button>
</template>

<script>
export default {
    props: {
        'black': Boolean,
        'white': Boolean,
        'light': Boolean,
        'dark': Boolean,
        'small': Boolean,
    },
    data(props) {
        return {
            colorOptions: [
                {prop: props.black, classes: 'bg-black text-white'},
                {prop: props.white, classes: 'bg-white text-primary-blue-light border-primary-blue-white'},
                {prop: props.light, classes: 'bg-primary-blue-light text-white'},
                {prop: props.dark, classes: 'bg-primary-blue-dark text-white'},
            ]
        }
    },
    computed: {
        color: (props) => {
            let color = ''
            
            props.colorOptions.reduce((prev) => {
                if(prev && prev.prop === true)
                    color = prev.classes
            }) 
            
            return color ?? 'bg-primary-blue text-white'
        },

        size: (props) => {
            return props.small ? 'px-3 py-2' : 'px-5 py-3'
        }
    }

}
</script>
