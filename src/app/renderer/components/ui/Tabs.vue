<template>
    <!-- https://inclusive-components.design/tabbed-interfaces/ -->
    <nav>
        <ul role="tablist" class="flex items-center space-x-6 border-b border-gray-600">
            <li v-for="(tab, index) in tabs" :key="index" role="presentation">
                <a :href="tab.anchor" class="block -mb-[1px] pb-4  text-black duration-300 border-transparent hover:text-blue-900 hover:border-blue-900 border-b-3" role="tab">
                    {{tab.text}}
                </a>
            </li>
        </ul>
    </nav>
</template>

<script>
export default {
    props: ['tabs'] // [{anchor: string, text: string}]
}
</script>
