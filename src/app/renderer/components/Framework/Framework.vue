<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="framework" v-if="meta">
    <div v-for="(value, index) in meta.Modules[moduleName].pipelines" :key="index">
      <div v-for="(component, index2) in value.components" :key="index2">
          <component
            :is="component.element"
            :reference="value.components[index2]"
            >
          </component>
      </div>
      
    </div>
  </div>
</template>

<script>

import File from '@/components/Framework/File'

export default {
	name: 'framework',
  components:{
    File
  },
  methods: {
		
	},
  data(){
    return{
      factory: {}
    }
  },
  props: {
    moduleName: {
      type: String,
      required: true
    },
  },
  computed: {
    system() {
      return this.$store.getters.getSystem
    },
    meta() {
      return this.$store.getters.getMeta
    },
    status() {
      let status = this.$store.getters.getStatus
      return status
    },
    staged() {
      return this.$store.getters.getStaged
    }
  },
  mounted(){
      console.log("mounted component")


  }
    
};
</script>

<style>
</style>