<template>
    <div class="px-6 py-4 border-2 rounded-lg border-gray">
        <div class="flex items-center justify-between">
            <div class="rounded-lg bg-blue-extralight w-[37px] h-[37px] inline-flex justify-center items-center">
                <font-awesome-icon icon="cube" class="text-lg text-blue-darker" />
            </div>
            
            <div>
                <font-awesome-icon icon="ellipsis-v" class="text-lg text-gray-dark" />
            </div>
        </div>

        <h2 class="mt-4 markup-h4 strong text-gray-darkest">Module Name</h2>

        <div class="flex items-center justify-start space-x-2">
            <span class="markup-label-sm text-gray-darker">V2.356</span>
            <span class="font-medium markup-label-sm text-blue-extradark">Update Available</span>
        </div>

        <p class="mt-2 text-left markup-body-sm text-gray-extradark">
            Mauris vestibulu, lorem a aliquet imperdiet turpis mi vehicula turpi, quis…
        </p>
        <a href="" class="font-bold markup-body-sm text-blue-extradark">Read more</a>
    </div>
</template>

<script>
export default {
    props: ['moduleName', 'version', 'hasUpdateAvailable', 'description', 'compactView']
}
</script>
