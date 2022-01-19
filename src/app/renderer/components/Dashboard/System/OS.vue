<template>
  <v-list dense>
    <v-subheader>System</v-subheader>
      <v-list-item
        v-for="entry in fields_docker"
        :key="entry.key"
        class="entry"
      >
          <v-list-item-content>
            <v-list-item-title v-text="entry.label "></v-list-item-title>
            <v-list-item-subtitle v-text=" resources.os[entry.key]  "></v-list-item-subtitle>
          </v-list-item-content>
      </v-list-item>
    </v-list>
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