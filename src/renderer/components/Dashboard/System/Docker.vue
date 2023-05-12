<template>
      <v-list dense class="py-0; my-0">
        <v-alert type="error" icon="$times-circle" shaped
          text v-if="!docker ">Docker is not connected or installed
        </v-alert>
        <v-alert type="success" shaped icon="$check-circle"
          text v-else>Docker is running 
        </v-alert>
        <v-btn
          icon-and-text v-if="!docker || 1==1"
          color="primary"
          @click="installDocker()"
        >Install Docker
        </v-btn>
        <div v-if="docker && !mini">
          <v-list-item
            v-for="entry in fields_docker"
            :key="entry.key"
            class="entry"
          >
              <v-list-item-content v-if="docker">
                <v-list-item-title v-text="entry.label "></v-list-item-title>
                <v-list-item-subtitle v-if="entry.key == 'MemTotal'" v-text="convert_gb(docker[entry.key]  , 'B')"></v-list-item-subtitle>
                <v-list-item-subtitle v-else v-text="docker[entry.key]  " ></v-list-item-subtitle>
              </v-list-item-content>
          </v-list-item>
        </div>
          
        <v-text-field v-if="!mini"
          label="Docker Socket" 
          v-model="dockerSocket" dense
          persistent-hint solo
          hint="Adjust docker socket location, used in Linux Rootless Deployment"
        >
          <template v-slot:append-outer>
            <v-tooltip left  >
              <template v-slot:activator="{ on }">
                <v-icon  v-on="on"  class="configure" small @click="updateSocketSend()">$upload
                </v-icon>
              </template>
              Submit new socket designation
            </v-tooltip>
          </template>
        </v-text-field>
      </v-list>
      
    
</template>
<script>
  import FileService from '@/services/File-service.js'
  export default {
    props: ['serverStatus', "resources", "mini"],
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
            key: 'Socket',
            label: 'Socket'
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
        dockerSocket: null,
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
    watch: {
    },
    methods: {
      async installDocker(){
        this.$electron.ipcRenderer.send("downloadDocker", { platform: this.resources.os.platform, arch: this.resources.os.arch } )
        this.$electron.ipcRenderer.on('dockerDownloadStatus', (evt, message)=>{
          this.$swal.fire({
            position: 'center',
            icon: (message.type ? message.type : 'info'),
            showConfirmButton:true,
            title:  message.message,
            text:  message.info
          })

        })

      },
      async updateSocket(){
        FileService.updateSocket(this.dockerSocket).catch((err)=>{
          console.error(err)
          this.$swal.fire({
            position: 'center',
            icon: 'error',
            showConfirmButton:true,
            title:  err.response.data.message
          })
        })
      },
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
      async updateSocketSend(socket){
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