<template>
    <button class="inline-flex items-center justify-center button circle">
        <font-awesome-icon :icon="icon" class="text-lg" />
    </button>
</template>

<script>
export default {
    props: {
        icon: {
            type: String,
            default: 'plus'
        }
    },
}
</script>