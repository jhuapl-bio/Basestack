<template>
  <v-list dense>
    <v-subheader>Memory</v-subheader>
    <v-list-item
       v-for="entry in fields_mem"
        :key="entry.key"
        class="entry"
    >
        <v-list-item-content>
          <v-list-item-title v-text="entry.label "></v-list-item-title>
          <v-list-item-subtitle v-text="convert_gb(resources.mem[entry.key]) "></v-list-item-subtitle>
        </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_mem: [
          {
            key: 'total',
            label: 'Total Mem (GB)'
          },
          {
            key: 'active',
            label: 'Using Mem (GB)'
          },
          {
            key: 'available',
            label: 'Available Mem (GB)'
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