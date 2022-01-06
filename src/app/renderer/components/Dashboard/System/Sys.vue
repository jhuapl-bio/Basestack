<template>

  <b-row >
    
    <div v-if="server" class="box">
      <span class="no-border-entry" style=""
      > <font-awesome-icon class="" icon="cog" size="sm"  />
        System Summary
      </span> 
      
      <div v-for="entry  in  components " :key="entry" class="entry">
        <!-- <Docker v-if="resources" v-bind:resources="resources" v-bind:docker="resources.docker"></Docker> -->
        <component :is="entry" v-if="resources" v-bind:resources="resources"></component><hr>
      </div>
      <hr>
      <span  class="text-danger align-center" v-if="!docker || !docker.running">Docker is not connected or installed</span>
      <span v-else>Docker is installed and running</span>
    </div>
    <div  class="box">
      <span class="no-border-entry" style=""
        >
          Update Server Port
        </span> 
        <b-form-input
          min="1000"
          max="9999"
          number
          v-model="port"
        
        >
        </b-form-input>
        <b-button 
          class="sideButton btn"
          @click="changePort(port)"
        >Update
        </b-button>
    </div>
  </b-row>
</template>

<script>
  import CPU from "@/components/Dashboard/System/CPU";
  import Disk from "@/components/Dashboard/System/Disk";
  import Memory from "@/components/Dashboard/System/Memory";
  import Docker from "@/components/Dashboard/System/Docker";
  import Basestack from "@/components/Dashboard/System/Basestack";
  import OS from "@/components/Dashboard/System/OS";
  import FileService from '@/services/File-service';
  export default {
    components: {
      CPU,
      Memory,
      Disk,
      Docker,
      OS,
      Basestack
    },
    computed: {
      
    },
    
    data () {
      return {
        system: null,
        server: null,
        docker: null,
        resources: null,
        port: process.env.PORT_SERVER,
        components: [
          'Basestack',
          'CPU',
          'Memory',
          'OS',
        ],
        checkingResources: false,
         

        
      }
    },
    async mounted(){
      const $this = this
      FileService.getServerStatus().then((status)=>{
        $this.server = status.data.message
      })
      $this.getResources()
      setInterval(()=>{
        if (!$this.checkingResources){
          $this.checkingResources = true
          $this.getResources()
        }
      }, 3000)
        
    },
    methods: {
      changePort(val){
        this.$electron.ipcRenderer.send("changePort", val)
        // this.$electron.ipcRenderer.on('changePort', (evt, port)=>{
        //   console.log("change port")
        //   process.env.PORT_SERVER = port
        // })
      },
      async getResources(){
        const $this = this
        FileService.getResources().then((status)=>{
          $this.resources= status.data.data.resources
          $this.docker = status.data.data.docker
          $this.checkingResources = false
          return 
        }).catch((err)=>{
          // $this.$logger.error(err)
          $this.checkingResources = false

        })
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