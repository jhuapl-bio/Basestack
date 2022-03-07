<template>
    <button :class="`button selector ${action}`">
        <div class="col-span-2">
            {{label}}
        </div>

        <div class="h-full">
            <font-awesome-icon :icon="icon" />
        </div>
    </button>
</template>

<script>
export default {
    props: {
        label: {type: String},
        action: {type: String, default: 'primary'},
        icon: {type: String, default: 'plus'}
    },
}
</script>
