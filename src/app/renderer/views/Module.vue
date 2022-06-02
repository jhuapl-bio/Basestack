<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <app-layout :hasSidebar="false">
    <template #title>
      <h2 class="text-blue-900 markup-h1">Your Basestack</h2>
    </template>

    <template #content>
      <div class="space-y-12">
        <section class="space-y-2">
          <!-- <module> </module> -->
        </section>
      </div>
    </template>
  </app-layout>
</template>

<script>
import AppLayout from "../components/AppLayout";
import Module from "../components/Framework/Module.vue";

// import App from '../../App.vue';

export default {
  name: "module",
  components: {
    "app-layout": AppLayout,
    module: Module,
  },
  props: ["module"],
  data() {
    return {};
  },
  mounted() {
    console.log(this.module);
  },
  methods: {
    // async getStatus() {
    //   const $this = this;
    //   try {
    //     let response = await FileService.getModules({
    //       catalog: this.module.name,
    //     });
    //     this.modules = response.data.data.map((d, i) => {
    //       d.idx = i;
    //       return d;
    //     });
    //     try {
    //       if (!this.selected.name) {
    //         this.selected = this.modules[this.selected_index];
    //       }
    //       if (!this.selectedProcedure.name) {
    //         this.selectedProcedure =
    //           this.selected.procedures[this.selected_index];
    //       }
    //     } catch (err) {
    //       console.error("Could not assign defaults in module, ", err);
    //     }
    //   } catch (err) {
    //     this.initial = false;
    //     console.error(`${err} error in getting status`);
    //   } finally {
    //     this.intervalChecking = false;
    //   }
    // },
  },
};
</script>