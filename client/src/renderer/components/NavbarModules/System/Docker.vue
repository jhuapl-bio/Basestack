<template>
    
    <b-row>
      <b-col :sm="(advanced ? '6' : '12')" v-if="docker && docker.running">
        <b-table
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
        </b-table>      
      </b-col>
      <b-col sm="6" v-if="advanced">
        <b-table
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
                <b-button  class="defaultButton"
                  v-tooltip="{
                    content: 'Estimate Docker Rootless Socket',
                    placement: 'top',
                    classes: ['info'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  v-if="docker.xdg_runtime_dir" @click="dockerSocket = `${docker.xdg_runtime_dir}/docker.sock`;  updateSocket();">Rootless
                </b-button>
                <b-button class="warnButton "
                  v-tooltip="{
                    content: 'Use Default Socket',
                    placement: 'top',
                    classes: ['warning'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  @click="dockerSocket = null; updateSocket();">Default
                </b-button>
                <b-button class="tabButton"
                  v-tooltip="{
                    content: 'Update with input docker socket string',
                    placement: 'top',
                    classes: ['warning'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                  @click="updateSocket();">Update
                </b-button>
              </div>
          </template>
          <template  v-slot:cell(socket_field)>
              <b-form-input v-model="dockerSocket"  placeholder="">
              </b-form-input>
              
          </template>
          <template  v-slot:cell(current_socket)>
              <p v-if="docker.socket">{{ docker.socket }}</p>
          </template>


        </b-table>
      </b-col>
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
      </span>
    </b-row>
    
</template>
<script>
  import FileService from '@/services/File-service.js'
  export default {
    props: ['resources', 'docker'],
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
            key: 'Images',
            label: 'Images'
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
        dockerSocket: '',
        advanced: true,
      }
    },
    mounted(){
    },
    methods: {
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
          this.toast('b-toaster-top-right', {variant: 'info', message: (this.dockerSocket ? `Changed to ${$this.dockerSocket}` : "Changed to Default endpoint"), title: 'Docker Socket Updated' } )
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