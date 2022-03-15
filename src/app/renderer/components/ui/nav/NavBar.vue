<template>
    <nav class="w-[123px] h-screen grid grid-cols-1 grid-rows-8 border-r border-l border-gray-light">

        <section class="row-span-1 h-[12.5%]">
            <dashboard-button />
        </section>
        

        <section class="flex flex-col items-start w-full overflow-y-auto duration-500 hide-scrollbar" :class="[showAllModules ? 'row-span-6 h-full' : 'row-span-3 h-[50%]']">
            <div ref="modulesContainer" class="w-full px-4 pt-6 hide-scrollbar" :class="[showAllModules ? 'overflow-y-auto' : 'overflow-y-hidden']">
                <div class="grid w-full grid-cols-1 gap-4 place-items-center">
                    <div v-for="(module, index) in activeModules" :key="index">
                        <module-button :moduleName="module.name" />
                    </div> 
                </div>
            </div>

            <button 
                @click="toggleShowingAllModules"
                class="flex items-center mx-auto mt-6 text-center markup-h6 text-gray-darker"
                :class="[showAllModules ? 'flex-col-reverse' : 'flex-col' ]"
            >
                <div>{{ showAllModules ? 'Show Less' : 'Show More' }}</div>
                <font-awesome-icon icon="chevron-down" class="text-lg duration-300" :class="{'rotate-180': showAllModules}" />
            </button>
        </section>

        <section class="mt-6 duration-500 origin-bottom border-t divide-y border-gray divide-gray" :class="[showAllModules ? 'opacity-0 scale-0 hidden' : 'opacity-100 row-span-3 scale-100']">
            <div v-for="(view, index) in views" :key="index" class="grid p-2 place-items-center">
                <view-button :viewName="view.name" :icon="view.icon" class="w-full" />
            </div>
        </section>

        <section class="row-span-1 mt-6 border-t border-gray h-[12.5%]">
            <button>3</button>
        </section>

    </nav>
</template>

<script>
import DashboardButton from './DashboardButton.vue'
import ModuleButton from './ModuleButton.vue'
import ViewButton from './ViewButton.vue'
export default {
    components: { DashboardButton, ModuleButton, ViewButton },
    data(){
        return {
            showAllModules: false,
            activeModules: [
                {name: "Alpha"},
                {name: "Bravo"},
                {name: "Charlie"},
                {name: "Delta"},
                {name: "Echo"},
                {name: "Foxtrot"},
                {name: "Golf"},
                {name: "Alpha"},
                {name: "Bravo"},
                {name: "Charlie"},
                {name: "Delta"},
                {name: "Echo"},
                {name: "Foxtrot"},
                {name: "Golf"},
            ],
            views: [
                {name: 'Library', 'icon': 'book'},
                {name: 'Learn', 'icon': 'chalkboard'},
                {name: 'Log', 'icon': 'terminal'},
                {name: 'System', 'icon': 'cog'},
            ]
        }
    },

    computed: {
        moduleContainerHeight: function() {
            return this.showAllModules
                ? '100%'
                : 3 * (100 / this.activeModules.length) + '%'
        },
    },

    methods: {
        toggleShowingAllModules () {
            if(this.showAllModules === true) {
                this.showAllModules = false
                this.$refs.modulesContainer.scrollTop = 0
                return
            }

            this.showAllModules = true;
        },
    }
}
</script>

<style scoped>
/* hide scrollbar but allow scrolling */
.hide-scrollbar {
  -ms-overflow-style: none; /* for Internet Explorer, Edge */
  scrollbar-width: none; /* for Firefox */
}

.hide-scrollbar::-webkit-scrollbar {
  display: none; /* for Chrome, Safari, and Opera */
}
</style>