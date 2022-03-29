<template>
    <section>
        <header class="flex items-center mb-2 space-x-2">
            <h5 class="text-gray-700 markup-h5">Recent Modules</h5>
        </header>

        <div class="flex space-x-4">
            <!-- ['moduleName', 'version', 'hasUpdateAvailable', 'description', 'compactView', 'link'], -->
            <module-library-card moduleName="Concensus" class="flex-1" />
            <module-library-card moduleName="Module Title" class="flex-1" />
            <module-library-card moduleName="Procedure Title" class="flex-1" />
        </div>
    </section>
</template>

<script>
import ModuleLibraryCard from '../ui/ModuleLibraryCard.vue';
export default {
    components: {'module-library-card': ModuleLibraryCard}
}
</script>