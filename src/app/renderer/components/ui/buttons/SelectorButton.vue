<template>
    <button :class="`button selector ${action}`">
        <div class="col-span-2">
            {{label}}
        </div>

        <div class="flex items-center justify-center h-full leading-none">
            <!-- <font-awesome-icon :icon="['fas', 'plus']" /> @todo: get font awesome working -->
            +
        </div>
    </button>
</template>

<script>
export default {
    props: {
        label: {type: String},
        action: {type: String, default: 'primary'},
        icon: {type: String, default: 'false'}
    },
}
</script>
