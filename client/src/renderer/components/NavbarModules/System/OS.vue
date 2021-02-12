<template>
  <div>
      <span class="text-center">Operating System</span>
      <!-- <h4>Operating System</h4> -->
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_docker"
        :items="[resources.os]"
      >
      </b-table>
    </div>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_docker: [
          {
            key: 'kernel',
            label: 'Kernel'
          },
          {
            key: 'platform',
            label: 'Platform'
          },
          {
            key: 'distro',
            label: 'Distro'
          },
          {
            key: 'release',
            label: 'Release'
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