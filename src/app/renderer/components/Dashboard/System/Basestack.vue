<template>
  <div style="display:flex">
     
    <div 
    v-for="entry in fields_system"
    :key="entry.key"
    class="entry"
    >
        <p style="font-size: 90%; color:grey; margin: 0px" v-if="info_table[entry.key]">{{ entry.label }}</p>
        <p style="font-size: 90%; color: black"> {{  info_table[entry.key]  }}</p>
    </div>
    <div style=" display:flex;  font-size: 50%">
      <span style="" class="success-icon">System Up to Date<font-awesome-icon class="success-icon" icon="check"/></span>
      
    </div>
  </div>
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