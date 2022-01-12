<template>
      <v-list dense>
        <v-alert type="error"  v-if="!docker ">Docker is not connected or installed </v-alert>
        <v-alert type="success" v-else>Docker is running </v-alert>
          <v-list-item
            v-if="docker"
            v-for="entry in fields_docker"
            :key="entry.key"
            class="entry"
          >
              <v-list-item-content>
                <v-list-item-title v-text="entry.label "></v-list-item-title>
                <v-list-item-subtitle v-if="entry.key == 'MemTotal'" v-text="convert_gb(docker[entry.key]  , 'B')"></v-list-item-subtitle>
                <v-list-item-subtitle v-else v-text="docker[entry.key]  " ></v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
        </v-list>
      <!-- <v-col :cols="(advanced ? '12' : '12')" v-if="docker && docker.running">
        <v-table
          striped
          hover
          stacked
          responsive
          style="overflow-wrap: anywhere;"
          class="text-center"
          :fields="fields_docker"
          :items="[docker.stats]"
        >
        <template  v-slot:cell(MemTotal)="row">
          {{convert_gb(row.item.MemTotal, 'B')}}
        </template>
        </v-table>      
      </v-col>
      <v-col cols="12" v-if="advanced">
        <v-table
          striped
          hover
          responsive
          stacked
          style="overflow-wrap: normal;"
          class="text-center"
          :fields="fields_setup_docker"
          :items="[docker]"
        >
          <template  v-slot:cell(socket_field_button)>
            <div style="display:flex; text-align:center">
                <v-button  class="defaultButton"
                  v-tooltip="{
                    content: 'Estimate Docker Rootless Socket',
                    placement: 'top',
                    classes: ['info'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  v-if="docker.xdg_runtime_dir" @click="dockerSocket = `${docker.xdg_runtime_dir}/docker.sock`;  updateSocket();">Rootless
                </v-button>
                <v-button class="warnButton "
                  v-tooltip="{
                    content: 'Use Default Socket',
                    placement: 'top',
                    classes: ['warning'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  @click="dockerSocket = null; updateSocket();">Default
                </v-button>
                <v-button class="tabButton"
                  v-tooltip="{
                    content: 'Update with input docker socket string',
                    placement: 'top',
                    classes: ['warning'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  @click="updateSocket();">Update
                </v-button>
              </div>
          </template>
          <template  v-slot:cell(socket_field)>
              <v-form-input v-model="dockerSocket"  placeholder="">
              </v-form-input>
              
          </template>
          <template  v-slot:cell(current_socket)>
              <p v-if="docker.socket">{{ docker.socket }}</p>
          </template>


        </v-table>
      </v-col>
      <span class="center-align-icon;" style="text-align:center; cursor:pointer; margin:auto; float:right"
            v-tooltip="{
            content: 'Change Socket Endpoint for Rootful/Rootless',
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
            }"
            @click="advanced = !advanced;"
          > {{ ( advanced ? 'Hide Advanced' : 'Advanced' ) }}
            <font-awesome-icon class="configure"   icon="cog" size="sm"  />
      </span> -->
    
</template>
<script>
  import FileService from '@/services/File-service.js'
  export default {
    props: ['serverStatus'],
    beforeDestroy: function(){
      if (this.intervalDocker){
        try{
          clearInterval(this.intervalDocker)
        } catch(err){
          console.error(err)
        }
      }
    },
    data () {
      return {
        fields_docker: [
          {
            key: 'ServerVersion',
            label: "Version"
          },
          {
            key: 'KernelVersion',
            label: 'Kernel'
          },
          {
            key: 'Driver',
            label: 'Driver'
          },
          {
            key: 'ContainersRunning',
            label: 'Running Containers'
          },
          {
            key: 'DockerRootDir',
            label: 'Data'
          },
          {
            key: 'MemTotal',
            label: 'MemAvailable (GB)'
          }
        ],
        intervalDocker: null,
        fields_setup_docker: [
          {
            key: 'xdg_runtime_dir',
            label: 'Runtime'
          },
          {
            key: 'current_socket',
            label: 'Current Socket'
          },
          {
            key: 'socket_field',
            label: 'Input Socket Field'
          },
          {
            key: 'socket_field_button',
            label: ''
          }

        ],
        port: null,
        dockerSocket: '',
        advanced: true,
        docker : {},
        checkingDocker: false,
      }
    },
    mounted(){
      const $this = this;
      this.getDockerStats()
      this.intervalDocker = setInterval(()=>{
        if (!$this.checkingDocker){
          $this.checkingDocker = true
          $this.getDockerStats()
        }
      }, 3000)
    },
    methods: {
      async getDockerStats(){
        const $this = this
        FileService.getDockerStats().then((status)=>{
          $this.docker = status.data.data
          $this.checkingDocker= false
          return 
        }).catch((err)=>{
          $this.checkingDocker = false
          $this.docker = null
        })
      },
      
      
      convert_gb(size, val){
        if (val =='MB'){
          return size / 1000 
        } else {
          return (size / 1000000000).toFixed(2)
        }
      },
      async updateSocket(socket){
        const $this = this;
        try{
          let response = await FileService.updateSocket({
            socket: this.dockerSocket
          })
          this.toast('v-toaster-top-right', {variant: 'info', message: (this.dockerSocket ? `Changed to ${$this.dockerSocket}` : "Changed to Default endpoint"), title: 'Docker Socket Updated' } )
        } catch(err){
          console.error(err)
        }
        
      },
      toast(toaster, val){
        this.$emit('toast', toaster, val)
      }
    }
  };
</script>

<style scoped>

</style>