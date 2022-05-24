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
        <section class="space-y-2"></section>
      </div>
    </template>
  </app-layout>
</template>

<script>
import AppLayout from "../components/AppLayout";

// import App from '../../App.vue';

export default {
  name: "module",
  components: {
    "app-layout": AppLayout,
  },
  props: ["module"],
  data() {
    return {};
  },
};
</script>