<template>
    <fieldset>
        <legend class="markup-label-lg mb-4">{{legend}}</legend>
        
        <div class="flex flex-col space-y-2">
            <slot />
        </div>
    </fieldset>
</template>

<script>
export default {
    props: ['legend']
}
</script>
