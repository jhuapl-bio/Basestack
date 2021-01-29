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
    },
    methods: {

    }
  };
</script>
<style>
</style>
