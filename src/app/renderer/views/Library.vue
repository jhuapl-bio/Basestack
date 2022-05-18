<template>
	<app-layout>
		<template #title>
            <div class="flex items-center justify-between">
                <h2 class="text-blue-900 markup-h1">
                    Library
                </h2>

                <SearchModulesField />
            </div>
		</template>

		<template #content>
            <div class="space-y-8">
                <tabs>
                    <tab name="My Procedures" class="flex flex-col space-y-12">
                        <div class="px-6 py-4 bg-blue-100 rounded-lg">
                            <h4 class="mb-4 text-blue-900 markup-h4">My Procedures</h4>
                            <div class="flex items-center justify-between">
                                <p class="markup-body-sm">String together services across modules to create a custom procedure</p>
                                <button>Create Procedure</button>
                            </div>
                        </div>
                    </tab>

                    <tab name="My Modules" class="flex flex-col space-y-12">
                        <h4 class="text-blue-900 markup-h4">My Modules</h4>
                        
                        <section class="grid grid-cols-3 gap-4">
                            <module-library-card 
                                v-for="(module, index) in catalog.filter(module => module.status.installed)" :key="module.name" 
                                :moduleName="module.title"
                                :version="module.latest_version"
                                :description="module.tags.join(' | ')"
                                :hasUpdateAvailable="!module.status.latest_installed"
                            />
                        </section>
                    </tab>

                    <tab name="Browse All Modules" class="flex flex-col space-y-12">
                        <h4 class="text-blue-900 markup-h4">Browse All Modules</h4> <!-- @todo: this is tied to the active tab -->
            
                        <section class="grid grid-cols-3 gap-4">
                            <!-- @todo: temp made description a list of the module tags. figure out what the description will actually be -->
                            <module-library-card 
                                v-for="(module, index) in catalog" :key="module.name" 
                                :moduleName="module.title"
                                :version="module.latest_version"
                                :description="module.tags.join(' | ')"
                                :hasUpdateAvailable="!module.status.latest_installed"
                            />
                        </section>
                    </tab>
                </tabs>

                <!-- old library view attached here if you need to install/manage modules -->
                <section>
                    <library />
                </section>
            </div>
		</template>
	</app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout';
import Tabs from '../components/ui/Tabs.vue';
import ModuleLibraryCard from '../components/ui/ModuleLibraryCard.vue';
import Library from '../components/Dashboard/DashboardDefaults/Library.vue';
import FileService from '../services/File-service'
import Tab from '../components/ui/Tab.vue';
import SearchModulesField from '../components/ui/forms/SearchModulesField.vue'
export default {
	components: {
        'app-layout': AppLayout,
        'tabs': Tabs,
        'tab': Tab,
        ModuleLibraryCard,
        Library,
        SearchModulesField
    },
	data(){
		return {
            catalog: [],
            tabs: [
                {anchor: 'my-procedures', text: 'My Procedures'},
                {anchor: 'my-modules', text: 'My Modules'},
                {anchor: 'browse-all-modules', text: 'Browse All Modules'},
            ]
        }
	},
    mounted(){
        this.getStatus()

        setInterval(()=>{
            this.getStatus()
        }, 4000)    
    },

    methods: {
        async getStatus(){
            const $this = this
            try{
                let response = await FileService.getCatalog()
                let status_obj = response.data.data
                let reported_status_obj = {}
                this.modules_new = [] 
                this.catalog = response.data.data
                this.catalog.map((d,i)=>{
                    d.selected = d.modules[this.defaultModule]
                    if (!this.stored[d.name]){
                        this.stored[d.name] = d.modules[this.defaultModule]
                    }
                    d.idx = i
                    d.modules.map((f, y)=>{
                        f.idx = y
                        return f
                    })
                    return d
                })
                if (!this.isHovered.name){
                    this.isHovered = this.catalog[this.defaultModule]
                } else {
                    this.isHovered = this.catalog[this.isHovered.idx]
                }       
            } catch(err){
                this.initial=false
                console.error(`${err} error in getting status`)
            } finally {
                this.intervalChecking = false
                console.log(this.catalog)
            }
        }
    },
};
</script>