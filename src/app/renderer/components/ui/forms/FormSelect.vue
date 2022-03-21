<template>
    <select class="px-3 py-2 border-2 border-gray-400 rounded focus:outline-none text-blue-extradark focus:border-blue-light" @change="$emit('update:options', '$event.target.value')">
        <option>Choose an option</option>
        <option>Option 1</option>
        <option>Option 2</option>
        <option>Option 3</option>
    </select>
</template>

<script>
export default {
    props: ['options'],
    emits: ['update:options']
}
</script>
