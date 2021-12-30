<template>
  <b-row>
    <div class="label-entry" ><strong class="text-center">System</strong><br></div>
    <div 
      v-for="entry in fields_docker"
      :key="entry.key"
      class="entry"
    >
        <p class="entry-label" v-if="resources.os[entry.key]">{{ entry.label }}</p>
        <p class="entry-description"> {{ resources.os[entry.key] }}</p>
    </div>
  </b-row>
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