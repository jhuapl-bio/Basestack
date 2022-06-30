<template>
    <div class="inline-block px-2 py-1 rounded-md markup-h6" :class="colorUtil">
        <slot />
    </div>
</template>

<script>
export default {
    props: ['color'],
    computed: {
        colorUtil: (props) => {
            switch(props.color) {
                case 'gray':
                    return 'bg-gray-300 text-gray-700'
                case 'blue':
                    return 'bg-blue-1000 text-white'
                case 'blue-light':
                    return 'bg-blue-200 text-blue-1000'
                case 'green': 
                    return 'bg-green text-white'
                case 'green-light':
                    return 'bg-green-100 text-green'
                case 'orange':
                    return 'bg-orange-100 text-orange-900'
                default:
                    return 'bg-black text-white'
            }
        }
    }
}
</script>
