<template>
    <button class="inline-flex font-semibold duration-300 rounded-full font-display" >
        <span v-if="icon">
            {{icon}}
        </span>
    </button>
</template>

<script>
export default {
    props: ['icon'],
}
</script>