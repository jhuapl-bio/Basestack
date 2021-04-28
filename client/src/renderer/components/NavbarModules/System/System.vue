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
      <Docker v-if="resources && docker.stats" v-bind:resources="resources" v-bind:docker="docker"></Docker>
      <span  class="text-danger" v-if="!docker.running">Docker is not connected or installed</span>
      <span v-else>Docker is installed and running</span>
      <span class="center-align-icon;" style="text-align:center; cursor:pointer; margin:auto; float:right"
            v-tooltip="{
            content: 'Advanced Configuration(s)',
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
            }"
            @click="advanced = !advanced;"
          > Advanced
            <font-awesome-icon class="configure"   icon="cog" size="sm"  />
      </span>
      <hr>
      <b-row class="text-center" v-if="advanced">  
        <b-col sm="6">
          <b-form-input v-model="dockerSocket"  placeholder="">
          </b-form-input>
          <p v-if="docker.stats && docker.stats.host">Docker Host: {{docker.stats.host}}</p>

        </b-col>
        <b-col sm="6">
          <b-button  @click="updateSocket(); ">Update Socket</b-button>
          <br>
          <p>Current Socket Configuration: {{ docker.socket }}</p>
          <br>
        </b-col>
        <hr>
      </b-row>
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
        const $this = this;
        try{
          let response = await FileService.updateSocket({
            socket: this.dockerSocket
          })
          this.toast('b-toaster-top-right', {variant: 'info', message: `Changed to: ${$this.dockerSocket}`, title: 'Docker Socket Updated' } )
        } catch(err){
          console.error(err)
        }
        
      },
      toast(toaster, val){
        console.log(val)
        this.$emit('toast', toaster, val)
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