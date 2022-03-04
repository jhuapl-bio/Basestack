<template>
    <button :class="`button small bg-white text-blue-extradark hover:bg-blue-extralight`">
        <div v-if="label">
            {{label}}
        </div>

        <div v-if="icon">
            {{icon}}
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
