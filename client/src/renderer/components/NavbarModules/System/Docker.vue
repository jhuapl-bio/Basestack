<template>
    <div v-if="docker">
      <span class="text-center">Docker System</span>
      <b-table
        striped
        hover
        responsive
        style="overflow-wrap: normal;"
        class="text-center"
        :fields="fields_docker"
        :items="[docker.stats]"
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
          }
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