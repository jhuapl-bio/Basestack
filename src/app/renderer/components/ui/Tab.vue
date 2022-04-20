<template>
    <section :id="id" v-show="isActive">
        <slot></slot>
    </section>
</template>

<script>
import slugify from "slugify"
export default {
    name: 'Tab',

    props: {
        name: {required: true, type: [Number, String]},
        selected: {default: false}
    },
    data(){
        return {
            isActive: false
        }
    },
    mounted(){
        console.log(this, this.isActive, this.selected)
        this.isActive = this.selected
    },
    computed: {
        id: (props) => {
            return slugify(props.name)
        }
    }
}
</script>
