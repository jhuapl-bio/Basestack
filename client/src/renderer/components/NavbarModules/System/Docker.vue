<template>
    <div v-if="docker.running">
      <span class="text-center">Docker System</span>
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_docker"
        :items="[resources.docker]"
      >
      </b-table>
    </div>
    
</template>

<script>
  export default {
    props: ['resources', 'docker'],
    data () {
      return {
        fields_docker: [
          {
            key: 'operatingSystem',
            label: 'OS'
          },
          {
            key: 'dockerRootDir',
            label: 'Root Directory'
          },
          {
            key: 'kernelVersion',
            label: 'Kernel'
          },
          {
            key: 'containersRunning',
            label: 'Running Containers'
          },
          {
            key: 'driver',
            label: 'Driver'
          },
          {
            key: 'serverVersion',
            label: 'Version'
          },
        ]
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
      }
    }
  };
</script>

<style scoped>

</style>