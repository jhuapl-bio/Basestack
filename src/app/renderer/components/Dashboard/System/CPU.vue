<template>
  <v-list dense>
    <v-subheader>Processor</v-subheader>
    <v-list-item
       v-for="entry in fields_cpu"
        :key="entry.key"
        class="entry"
    >
        <v-list-item-content>
          <v-list-item-title v-text="entry.label "></v-list-item-title>
          <v-list-item-subtitle v-text="(resources.cpu[entry.key]) "></v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
  </v-list>
  
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
    },
    methods: {

    }
  };
</script>
<style>
</style>
