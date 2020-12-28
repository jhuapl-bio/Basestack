<template>
  <b-row>
    <b-col sm="12">
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_system"
        :items="[info_table]"
      >
      </b-table>
      <Docker v-if="resources" v-bind:resources="resources" v-bind:docker="docker"></Docker>
      <span  class="text-danger" v-if="!docker.running">Docker is not connected or installed</span>
      <span v-else>Docker is installed and running</span>
      <hr>
      <CPU v-if="resources" v-bind:resources="resources"></CPU>
      <Memory v-if="resources" v-bind:resources="resources"></Memory>
      <Disk v-if="resources" v-bind:resources="resources"></Disk>
      <OS v-if="resources" v-bind:resources="resources"></OS>
      

      <!-- </b-form-text> -->

    </b-col>
  </b-row>
</template>

<script>
  import CPU from "@/components/NavbarModules/System/CPU";
  import Disk from "@/components/NavbarModules/System/Disk";
  import Memory from "@/components/NavbarModules/System/Memory";
  import Docker from "@/components/NavbarModules/System/Docker";
  import OS from "@/components/NavbarModules/System/OS";
  import FileService from '@/services/File-service.js'
  export default {
    props: ['resources', 'docker'],
    components: {
      CPU,
      Memory,
      Disk,
      Docker,
      OS
    },
    data () {
      return {
        dockerSocket: '',
        fields_system: [
          {
            key: 'basestack',
            label: 'Basestack'
          },
          {
            key: 'electron',
            label: 'Electron'
          },
          {
            key: 'node',
            label: 'Node'
          },
          {
            key: 'os',
            label: 'OS Platform',
          },
          {
            key: 'vue',
            label: 'Vue',
          }
        ],
        info_table: {
          basestack: process.env.version_basestack,
          electron: process.versions.electron,
          node: process.versions.node,
          os: require('os').platform(),
          vue: require('vue/package.json').version
        },
      }
    },
    mounted(){
    },
    methods: {
    }
  };
</script>

<style scoped>
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
</style>