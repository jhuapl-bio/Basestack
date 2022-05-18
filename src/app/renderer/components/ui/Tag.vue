<template>
    <div class="inline-block px-2 py-1 text-white rounded-md markup-h6" :class="colorUtil">
        {{ text }}
    </div>
</template>

<script setup>
export default {
    props: ['color', 'text'],
    computed: {
        colorUtil: (props) => {
            switch(props.color) {
                case 'blue':
                    return 'bg-blue-1000'
                case 'blue-light':
                    return 'bg-blue-200 text-blue-1000'
                case 'green': 
                    return 'bg-green-100'
                case 'green-light':
                    return 'bg-[#d4f2dd] text-green-100' // in sketch it uses opacity. it switched to an actual color
                default:
                    return 'bg-black'
            }
        }
    }
}
</script>
