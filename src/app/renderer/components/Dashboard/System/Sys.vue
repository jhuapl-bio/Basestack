<template>

  <v-card v-if="server" max-height="1px" >     
    <div v-for="entry  in  components " :key="entry" class="entry">
      <component :is="entry" v-if="resources" v-bind:docker="resources.docker" v-bind:resources="resources"></component><hr>
    </div>
  </v-card>
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
    beforeDestroy: function(){
      if (this.interval){
        try{
          clearInterval(this.interval)
        } catch(err){
          console.error(err)
        }
      }
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
        system: null,
        server: null,
        docker: null,
        resources: null,
        intervalDocker:null,
        interval: null,
        port: process.env.PORT_SERVER,
        components: [
          'Basestack',
          'Docker',
          'Memory',
          'CPU',
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
      this.interval = setInterval(()=>{
        if (!$this.checkingResources){
          $this.checkingResources = true
          $this.getResources()
        }
      }, 3000)
      
        
    },
    methods: {
      
      
      async getResources(){
        const $this = this
        FileService.getResources().then((status)=>{
          $this.resources= status.data.data.resources
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