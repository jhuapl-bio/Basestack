<template>
    <button class="flex items-center bg-white button small text-blue-extradark hover:bg-blue-extralight">
        <div v-if="label">
            {{label}}
        </div>

        <div v-if="icon">
            <font-awesome-icon :icon="icon" />
        </div>
    </button>
</template>

<script>
export default {
    props: {
        label: {type: String},
        icon: {type: String, default: 'false'}
    },
}
</script>
