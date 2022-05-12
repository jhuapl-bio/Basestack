<template>
    <div>
        <nav>
            <ul role="tablist" class="flex items-center space-x-6 border-b border-gray-600">
                <li v-for="(tab, index) in tabs" :key="index" role="presentation">
                    <button 
                        @click="selectTab(tab)" role="tab" :href="tab.anchor"
                        class="markup-h5 -mb-[1px] pb-4 duration-300 border-b-3 hover:text-blue-900 hover:border-blue-900 outline-none"
                        :class="[tab.isActive ? 'text-blue-900 border-blue-900': 'text-black border-transparent']"
                    >
                        {{tab.name}}
                    </button>
                </li>
            </ul>
        </nav>

        <div class="mt-8">
            <slot></slot>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Tabs',

    data(){
        return {
            tabs: []
        }
    },

    created(){
        this.tabs = this.$children
    },

    mounted() {
        let preSelectedTab = this.tabs.findIndex(tab => tab.selected === true)
        if(preSelectedTab === -1) {
            this.tabs[0].isActive = true
        }
    },

    methods: {
        selectTab(selectedTab) {
            this.tabs.forEach((tab) => {
                tab.isActive = tab.name === selectedTab.name
            })
        }
    }
}
</script>
