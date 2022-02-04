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
    <v-alert
      v-if="cached" dense
      color="blue lighten-3"
      icon="$question-circle"
      type="info"
    >
      This variable populated from cache
    </v-alert>
    
    
  </div>
</template>

<script>
export default {
	name: 'file',
  data() {
      return {
          test: "placeholder",
          value: null,
          cached: false
      }
  },
  computed: {
    
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
    },

	},
	props: ['source', 'variable'],
  mounted(){
    if (!this.value && typeof(this.source.source) == 'string'){
        var file = new File([this.source.source], this.source.source, {
          type: "text/plain",
        });
        this.value = file
        this.cached = true
      }
  },
  watch: {
        value(newValue, oldValue){
            
            if (newValue.path && newValue.path !== ""){
              this.$emit("updateValue", newValue.path )
              this.cached = false
            } else {
              this.$emit("updateValue", newValue.name)
            }
        },
        // source: {
        //   deep: true,
        //   handler(newValue, oldValue){
        //     this.cached = true
        //     console.log("source changed")
        //   }
        // }
    }
    
};
</script>

<style>
</style>