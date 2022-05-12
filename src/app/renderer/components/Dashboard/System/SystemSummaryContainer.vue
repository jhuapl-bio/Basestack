<template>
    <SystemSummary :resources="resources"/>
</template>

<script>
import SystemSummary from './SystemSummary.vue';
import FileService from '@/services/File-service';

/**
 * Displays System Summary information. Makes use of DataLabel components to display system data.
 */
export default {
  name: "SystemSummaryContainer",
  components: {
    SystemSummary,
  },
  data () {
    return {
      server: null,
      // mapping out empty objects prevents `TypeError: Cannot read property '...' of undefined`
      resources: {
        cpu: {},
        disk: {},
        mem: {},
        os: {},
        system: {}
      },
      port: process.env.PORT_SERVER,
      checkingResources: false,
    }
  },
  methods: {
    getResources() {
      FileService.getResources().then((status)=>{
        this.resources= status.data.data.resources
        this.checkingResources = false
      }).catch((err)=>{
        this.checkingResources = false
      })
    },
  },
  mounted(){
    FileService.getServerStatus().then((status)=>{
      this.server = status.data.message
    })
    this.getResources()
    setInterval(()=>{
      if (!this.checkingResources){
        this.checkingResources = true
        this.getResources()
      }
    }, 3000)
  },
};
</script>