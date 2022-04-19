<template>
	<app-layout hasSidebar="true">
		<template #title>
            <h2 class="text-blue-900 markup-h1">
			    System
            </h2>
		</template>

		<template #content>
            
		</template>

        <template #sidebar>
            
		</template>
	</app-layout>
</template>

<script>
import AppLayout from '@/components/AppLayout';
export default {
	components: {
        'app-layout': AppLayout,
    },
	props: [],
	data(){
		return {}
	},
};
</script>