<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="file" @drop.prevent="addDropFile" @dragover.prevent >
  	<v-file-input 
        v-model="value"
        :hint="(source.hint ? source.hint : '')" 
    > 
    </v-file-input >
    
    
  </div>
</template>

<script>
export default {
	name: 'file',
    data() {
        return {
            value: null,
            test: "placeholder"
        }
    },
    computed: {
        
    },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
      console.log(this.value)
    }

	},
	props: ['source', 'status', 'service', "variable"],
  mounted(){
  },
  watch: {
        value(newValue, oldValue){
            this.$emit("updateValue", newValue.path )
        }
    }
    
};
</script>

<style>
</style>