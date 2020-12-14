<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div class="row justify-content-center selection">
    <b-button v-b-toggle.collapse-3  class="sideButton" style="width: 100% !important">View System Specs</b-button>
    <b-collapse id="collapse-3" class="mt-2">
      <b-card>
        <div class="title">Information</div>
        <div class="items">
          <div class="item">
            <div class="name">Path:</div>
            <div class="value">{{ path }}</div>
          </div>
          <div class="item">
            <div class="name">Route Name:</div>
            <div class="value">{{ name }}</div>
          </div>
          <div class="item">
            <div class="name">Vue.js:</div>
            <div class="value">{{ vue }}</div>
          </div>
          <div class="item">
            <div class="name">Electron:</div>
            <div class="value">{{ electron }}</div>
          </div>
          <div class="item">
            <div class="name">Node:</div>
            <div class="value">{{ node }}</div>
          </div>
          <div class="item">
            <div class="name">Platform:</div>
            <div class="value">{{ platform }}</div>
          </div>
        </div>
    </b-card>
    </b-collapse>

  </div>
</template>

<script>
  export default {
    data () {
      return {
        electron: process.versions.electron,
        name: this.$route.name,
        node: process.versions.node,
        path: this.$route.path,
        platform: require('os').platform(),
        vue: require('vue/package.json').version
      }
    }
  };
</script>

<style scoped>
<<<<<<< HEAD


=======
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
>>>>>>> 9e7a1fb082d78b355babafb4489f9301f469f8f3
</style>
