<template>
  <v-list dense>
    <v-subheader>Basestack</v-subheader>
      <v-list-item
        v-for="entry in fields_system"
        :key="entry.key"
        class="entry"
      >
          
          <v-list-item-content>
            <v-list-item-title v-text="entry.label "></v-list-item-title>
            <v-list-item-subtitle v-text="info_table[entry.key] ">
            </v-list-item-subtitle>
            
          </v-list-item-content>
          <v-list-item-icon>
            <span style="" class="success-icon"><font-awesome-icon class="success-icon" icon="check"/></span>
          </v-list-item-icon>
      </v-list-item>
  </v-list>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_system: [
          {
            key: 'basestack',
            label: 'Installed Version'
            },
            // {
            //   key: 'electron',
            //   label: 'Electron'
            // },
            // {
            //   key: 'node',
            //   label: 'Node'
            // },
            // {
            //   key: 'os',
            //   label: 'OS Platform',
            // },
            // {
            //   key: 'vue',
            //   label: 'Vue',
            // }
        ],
        info_table: {
          basestack: process.env.version_basestack,
          electron: process.versions.electron,
          node: process.versions.node,
          os: require('os').platform(),
          vue: require('vue/package.json').version
        },
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