<template>
  <section class="flex w-full">
    <app-menu :installedModules="installedModules" />

    <article
      class="
        grow
        min-w-[783px]
        space-y-12
        overflow-y-auto
        w-auto
        h-screen
        py-4
        px-24
      "
    >
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

    <aside
      v-if="hasSidebar"
      class="min-w-[509px] h-screen py-4 px-8 bg-white border-l border-gray-600"
    >
      <slot name="sidebar" />
    </aside>
  </section>
</template>



<script>
import AppMenu from "./AppMenu.vue";
import FileService from "../services/File-service";

export default {
  components: { "app-menu": AppMenu },
  props: ["moduleSearch", "hasSidebar"],
  data() {
    return {
      catalog: [],
    };
  },
  computed: {
    installedModules() {
      return this.catalog.filter((module) => module.status.installed);
    },
  },
  mounted() {
    this.getStatus();

    // used to ensure AppMenu is up to date with installed modules
    // setInterval(() => {
    //   this.getStatus();
    // }, 4000);
  },
  methods: {
    async getStatus() {
      try {
        let response = await FileService.getCatalog();
        this.catalog = response.data.data;
      } catch (err) {
        console.error(`${err} error in getting status`);
      } finally {
        console.log(this.catalog);
      }
    },
  },
};
</script>