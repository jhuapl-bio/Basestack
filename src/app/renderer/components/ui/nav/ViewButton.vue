<template>
    <!-- <button class="flex items-center bg-white button small text-blue-extradark hover:bg-blue-extralight"> -->
    <button class="inline-flex flex-col items-center justify-center space-y-1.5 p-2 bg-white group button small text-blue-extradark hover:bg-blue-extralight duration-500 font-medium uppercase markup-label">
            <font-awesome-icon :icon="icon" class="inline-block text-[25px]" />
            <div class="leading-none">
               {{viewName}}
            </div>
    </button>
</template>

<script>
export default {
    props: ['viewName', 'link', 'icon'],
}
</script>
