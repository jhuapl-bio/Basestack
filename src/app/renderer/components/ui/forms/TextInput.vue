<template>
    <div class="relative">
        <input 
            v-bind="$attrs"
            :value="text"
            @input="$emit('update:text', '$event.target.value')"
            class="flex w-full px-4 py-2 border-2 focus:outline-none focus:border-blue-lighter font-body focus:bg-white bg-gray-light border-gray-dark text-gray-darkest placeholder:text-gray-darker"
        />
    </div>
    
</template>

<script>
export default {
    emits: ['update:text'],
    props: ['text'],
    computed: {
        value: () => {
            return this.text
        }
    }
}
</script>