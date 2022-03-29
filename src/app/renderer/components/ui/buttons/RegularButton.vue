<template>
    <button :class="`button ${action} ${size}`">
        <div class="flex items-center space-x-2">
            <span>{{label}}</span>
            <font-awesome-icon v-if="icon" :icon="icon" />
        </div>
    </button>
</template>

<script>
export default {
    props: {
        label: {type: String},
        action: {type: String, default: 'primary'},
        size: {type: String, default: ''},
        icon: {type: String}
    },
}
</script>
