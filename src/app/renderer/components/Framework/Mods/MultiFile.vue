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
          multiple   overlap counter :label="filenames ? filenames : null"
          
      > 
        <template v-slot:append-outer>
          <v-icon  v-if="value" class="text--caption configure" @click="value = null" color="grey" small>$times-circle
          </v-icon>
        </template>
         
      </v-file-input >
      
        
      
    
   
   
  	
    
  </v-container>
</template>

<script>
const path = require("path")  

export default {
	name: 'file',
  data() {
      return {
          test: "placeholder",
          value: [],
          filenames: null,
          cached: false
      }
  },
  computed: {
     
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files; 
    }
    
    
    


	},
	props: ['source', 'variable'],
  mounted(){
    if (this.value.length == 0 && Array.isArray(this.source)){
      var files = this.source.map((f,i)=>{
        return new File([f], f, {
          type: "text/plain",
        });
      })
      this.value = files
      this.filenames = this.source.join(", ")
    }
  },
  
  watch: {
        value(newValue, oldValue){
            if (newValue  ){
              let arr = Object.values(newValue)
              let fileslist = []
              this.$emit("updateValue",arr.map((f)=>{
                fileslist.push(path.basename(f.name))
                return f.path
              })  )
              this.filenames = fileslist.join(", ")
            }
        },
       
    }
    
};
</script>

<style>
</style>