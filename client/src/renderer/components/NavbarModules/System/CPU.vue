<template>
  <b-table
    striped
    hover
    v-if="resources"
    class="text-center"
    :fields="fields_cpu"
    :items="[resources.cpu]"
  >  

  </b-table>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_cpu:[
          {
            key: 'brand',
            label: 'CPU Brand'
          },
          {
            key: 'cores',
            label: 'Cores'
          },
          {
            key: 'physicalCores',
            label: 'Physical Cores'
          },
          {
            key: 'manufacturer',
            label: 'Manufacturer'
          },
          {
            key: 'virtualization',
            label: 'Virtualization Support'
          }
        ]
      }
    },
    mounted(){
      const $this = this
      setInterval(()=>{
        console.log($this.resources)
      },2000)
    },
    methods: {

    }
  };
</script>
<style>
</style>
