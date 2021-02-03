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
      <CPU v-if="resources" v-bind:resources="resources"></CPU>
      <Memory v-if="resources" v-bind:resources="resources"></Memory>
      <Disk v-if="resources" v-bind:resources="resources"></Disk>
      <span class="center-align-icon;" style="text-align:center; cursor:pointer; margin:auto; float:right"
            v-tooltip="{
            content: 'Advanced Configuration(s)',
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
            }"
            @click="advanced = !advanced"
          > Advanced
            <font-awesome-icon class="configure"   icon="cog" size="sm"  />
      </span>
      <span v-if="!docker.status">Docker is not running or installed</span>
      <span v-else>Docker is installed and running</span>
      <hr>
      <b-row class="text-center" v-if="advanced">  
        <b-col sm="6">
          <b-form-input v-model="dockerSocket"  placeholder="">
          </b-form-input>
        </b-col>
        <b-col sm="6">
          <b-button  @click="updateSocket()">Update Socket</b-button>
          <br>
          <span>Current Socket Configuration: {{ docker.socket }}</span>
        </b-col>
        <hr>
      </b-row>
      <!-- </b-form-text> -->

    </b-col>
  </b-row>
</template>

<script>
  import CPU from "@/components/NavbarModules/System/CPU";
  import Disk from "@/components/NavbarModules/System/Disk";
  import Memory from "@/components/NavbarModules/System/Memory";
  import FileService from '@/services/File-service.js'
  export default {
    props: ['resources', 'docker'],
    components: {
      CPU,
      Memory,
      Disk
    },
    data () {
      return {
        dockerSocket: '',
        advanced: false,
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
      async updateSocket(socket){
        
        try{
          let response = await FileService.updateSocket({
            socket: this.dockerSocket
          })
          console.log(response)
        } catch(err){
          console.error(err)
        }
        
      }
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