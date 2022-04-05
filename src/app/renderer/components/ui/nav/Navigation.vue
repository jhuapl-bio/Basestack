<template>
    <aside>
        <section>
            <module-button />
        </section>

        <section>
            <view-button />
        </section>

        <section>
            <div v-if="hasModulesRunning">
                <!-- <compact-work-statuses -->
            </div>

            <div v-else>
                <!-- basestack logo -->
            </div>
        </section>
    </aside>
</template>

<script>

export default {
    data(){
        return {
            modules: []
        }
    },
}
</script>
