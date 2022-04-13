<template>
    <section class="flex flex-grow w-full">
        <app-menu />
        
        <article class="flex-grow min-w-[783px] space-y-12 overflow-y-auto w-auto h-screen py-4 px-24">
            <header>
                <slot name="title" />

                <!-- <form v-if="moduleSearch" action=""> -->
                    <!-- <ModuleSearch /> -->
                <!-- </form> -->
            </header>

            <section>
                <slot name="content" />
            </section>
        </article>
        
        <aside v-if="hasSidebar" class="min-w-[509px] h-screen py-4 px-8 bg-white border-l border-gray-600">
            <slot name="sidebar" />
        </aside> 
    </section>
</template>



<script>
import AppMenu from './AppMenu.vue'
export default {
    components: {'app-menu': AppMenu},
    props: ['moduleSearch', 'hasSidebar'],
}
</script>