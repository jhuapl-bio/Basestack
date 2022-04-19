<template>
	<app-layout>
		<template #title>
            <h2 class="text-blue-900 markup-h1">
			    Library
            </h2>
		</template>

		<template #content>
            <div class="space-y-8">
                <tabs :tabs="tabs" />

                <h3>My Modules</h3> <!-- @todo: this is tied to the active tab -->
                
                <section class="grid grid-cols-3 gap-4">
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                    <module-library-card />
                </section>
            </div>
		</template>
	</app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout';
import Tabs from '../components/ui/Tabs.vue';
import ModuleLibraryCard from '../components/ui/ModuleLibraryCard.vue';
export default {
	components: {
        'app-layout': AppLayout,
        'tabs': Tabs,
ModuleLibraryCard,
    },
	props: [],
	data(){
		return {
            tabs: [
                {anchor: 'my-procedures', text: 'My Procedures'},
                {anchor: 'my-modules', text: 'My Modules'},
                {anchor: 'browse-all-modules', text: 'Browse All Modules'},
            ]
        }
	},
};
</script>