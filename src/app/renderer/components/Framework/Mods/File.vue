<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-container id="file"   @drop.prevent="addDropFile" @dragover.prevent >
      <v-file-input 
          v-model="value"  class="fill-width"
          :hint="hint" persistent-hint
          show-size  overlap
          counter 
      > 
        <template v-slot:append-outer>
          <v-icon  v-if="value" class="text--caption configure" @click="value = null" color="grey" small>$times-circle
          </v-icon>
        </template>
      </v-file-input >
  
    
      
        
      
    
   
   
  	
    
  </v-container>
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
    hint(){
      let hint = ""
      if (this.variable.target){
        hint =`${this.variable.target}`
      }
      return hint
    },
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
    },
    
    updateValidity(){
    }
    
    
    


	},
	props: ['source', 'variable'],
  mounted(){
    if (!this.value && typeof(this.source) == 'string'){
      var file = new File([this.source], this.source, {
        type: "text/plain",
      });
      this.value = file
      this.cached = true
    }
  },
  
  watch: {
        value(newValue, oldValue){
            if (!newValue){
              this.$emit("updateValue", newValue  )
            }
            else if (newValue.path && newValue.path !== ""){
              this.$emit("updateValue", newValue.path  )
              this.cached = false
            } else {
              this.$emit("updateValue",  newValue.name  )
            }
        },
       
    }
    
};
</script>

<style>
</style>