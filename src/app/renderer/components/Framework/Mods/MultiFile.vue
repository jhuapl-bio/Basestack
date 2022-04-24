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
          multiple
          overlap
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
          value: [],
          cached: false
      }
  },
  computed: {
    
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files; 
      console.log(this.value)
    }
    
    
    


	},
	props: ['source', 'variable'],
  mounted(){
   
  },
  
  watch: {
        value(newValue, oldValue){
          console.log(newValue, typeof newValue,"new value multifile")
            if (newValue  ){
              let arr = Object.values(newValue)
              this.$emit("updateValue",arr.map((f)=>{
                return f.path
              })  )
            }
            console.log(this.value)
        },
       
    }
    
};
</script>

<style>
</style>