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
        :label="(source.hint ? source.hint : '')" 
        show-size
        counter
    > 
    </v-file-input >
    
    
  </div>
</template>

<script>
export default {
	name: 'file',
  data() {
      return {
          test: "placeholder",
          value: null
      }
  },
  computed: {
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
      console.log(this.value)
    },

	},
	props: ['source', 'status', 'service', "variable"],
  mounted(){
    if (!this.value && typeof(this.source.source) == 'string'){
        var file = new File([this.source.source], this.source.source, {
          type: "text/plain",
        });
        this.value = file
      }
  },
  watch: {
        value(newValue, oldValue){
            this.$emit("updateValue", newValue.path )
        },
        source: {
          deep: true,
          handler(newValue, oldValue){
            if (typeof(newValue) == 'string'){
              var file = new File([source.source], source.source, {
                type: "text/plain",
              });
              this.value = file
            }
          }
        }
    }
    
};
</script>

<style>
</style>