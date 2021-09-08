<template>

  <b-row >
    <b-col sm="12" v-if="system.docker">
      <b-table
        v-if="system"
        striped
        hover
        class="text-center"
        :fields="fields_system"
        :items="[info_table]"
      >
      </b-table>
      <Docker v-if="system.resources" v-bind:resources="system.resources" v-bind:docker="system.docker"></Docker>
      <span  class="text-danger" v-if="!system.docker.running">Docker is not connected or installed</span>
      <span v-else>Docker is installed and running</span>
      <hr>
      <CPU v-if="system.resources" v-bind:resources="system.resources"></CPU>
      <Memory v-if="system.resources" v-bind:resources="system.resources"></Memory>
      <Disk v-if="system.resources" v-bind:resources="system.resources"></Disk>
      <OS v-if="system.resources" v-bind:resources="system.resources"></OS>

    </b-col>
  </b-row>
</template>

<script>
  import CPU from "@/components/NavbarModules/System/CPU";
  import Disk from "@/components/NavbarModules/System/Disk";
  import Memory from "@/components/NavbarModules/System/Memory";
  import Docker from "@/components/NavbarModules/System/Docker";
  import OS from "@/components/NavbarModules/System/OS";
  export default {
    components: {
      CPU,
      Memory,
      Disk,
      Docker,
      OS
    },
    computed: {
      system() {
        return this.$store.getters.getSystem
      }
    },
    
    data () {
      return {
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