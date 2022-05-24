<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <app-layout :hasSidebar="true">
    <template #title>
      <h2 class="text-blue-900 markup-h1">Your Basestack</h2>
    </template>

    <template #content>
      <div class="space-y-12">
        <recent-modules />
        <work-statuses :workStatuses="workStatuses" />

        <section class="space-y-2">
          <div
            class="
              w-full
              min-h-[290px]
              p-12
              bg-blue-200
              text-blue-800
              rounded-xl
            "
          >
            <h3 class="mb-24 markup-h2">What can Basestack do?</h3>
            <router-link to="/tutorials">
              <regular-button action="accent" label="View Demo" />
            </router-link>
          </div>

          <div
            class="
              w-full
              min-h-[290px]
              p-12
              bg-green-100/25
              text-green-200
              rounded-xl
            "
          >
            <h3 class="mb-24 markup-h2">Learn to use Basestack</h3>
            <router-link to="/tutorials">
              <regular-button action="accent" label="View Demo" />
            </router-link>
          </div>
        </section>
      </div>
      <!-- <LearnBasestack /> -->
    </template>

    <template #sidebar>
      <div class="flex flex-col h-full space-y-8">
        <system-summary />
        <contact />
        <apl-logo />
      </div>
    </template>
  </app-layout>
</template>

<script>
import AppLayout from "../components/AppLayout";
import WorkStatuses from "../components/ui/WorkStatus/WorkStatuses.vue";
import SystemSummaryContainer from "../components/Dashboard/System/SystemSummaryContainer.vue";
import Contact from "../components/Dashboard/Contact.vue";
import AplLogo from "../components/Dashboard/AplLogo.vue";
import RecentModules from "../components/Dashboard/RecentModules.vue";
import RegularButton from "../components/ui/buttons/RegularButton.vue";

// import App from '../../App.vue';

export default {
  name: "mainpage",
  components: {
    "app-layout": AppLayout,
    "work-statuses": WorkStatuses,
    "system-summary": SystemSummaryContainer,
    "recent-modules": RecentModules,
    "regular-button": RegularButton,
    contact: Contact,
    "apl-logo": AplLogo,
  },
  props: ["modules", "defaults", "moduleIdx"],
  data() {
    return {
      status: {},
      system: {},
      workStatuses: [
        {
          progress: 100,
          label: "Module",
          error: false,
          link: "",
        },
        {
          progress: 58,
          label: "Consensus",
          error: true,
          link: "",
        },
        {
          progress: 38,
          label: "Procedure",
          error: false,
          link: "",
        },
      ],
    };
  },
  mounted() {
    const $this = this;
  },
  methods: {
    emitChange(data) {
      this.$emit("emitChange", data);
    },
  },
};
</script>