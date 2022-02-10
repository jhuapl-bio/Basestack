<template>
    <section class="flex flex-grow w-full">
        <article class="flex-grow min-w-[783px] h-screen">
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
        
        <aside v-if="hasSidebar" class="w-[509px] h-screen px-8 bg-white border-l border-gray-dark">
            <slot name="sidebar" />
        </aside> 
    </section>
</template>

<script>
export default {
    props: ['moduleSearch', 'hasSidebar'],
}
</script>