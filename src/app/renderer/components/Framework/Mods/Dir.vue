<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card >
      
      <v-sheet  elevation="1" 
          height="50"
          max-width="600" class="px-8 pt-4"
          style="" @drop.prevent="addDropFiles" @dragover.prevent >
            
            <v-icon
            small class="mr-2 "
            > $upload
            </v-icon>
            Drag Folder here
            <v-icon  v-if="directory" class="text--caption configure ml-5" @click="directory = null" color="grey" small>$times-circle
            </v-icon>
           
      </v-sheet>
      
      <small class="text-caption" v-if="directory">
        {{directory}}
        
      </small>
      
      
      
  </v-card>
</template>

<script>
const path = require("path")


export default {
	name: 'file',
  data() {
      return {
          value: null,
          valueDir: null,
          directory: null,
          test: "placeholder",
      }
  },
  computed: {
      
  },
  
	methods: {
    addDropFiles(e) {
      this.value = Array.from(e.dataTransfer.files);
      this.directory = this.value[0].path
    },
    formatNames(files) {
      return files.length === 1 ? `Selected` : `${files.length} files selected`
    },
    electronOpenDir(key){
        const $this = this
        this.$electron.ipcRenderer.on('getValue', (evt, message)=>{
            $this.directory = message
            $this.source.source = message
            console.log($this.source,"changed dir")
        })
        this.$electron.ipcRenderer.send("openDirSelect", "")
		},
	},
	props: ['source', 'status', 'service', 'variable'],
  mounted(){
    this.directory = this.source.source 
  },
  watch: {
        directory(newValue, oldValue){
            this.$emit("updateValue", newValue )
        },
        // directory(newValue, oldValue){
        //     if (newValue){
        //       this.value  = newValue.path.replace(newValue.name, "")
        //     }
        // },
        valueDir(newValue, oldValue){
            if (newValue && newValue.length > 0){   
    			if (newValue.length == 1){
    				newValue = newValue[0]
    			}		
	    		const flat  = newValue.flat(2) //flatten up to 2 directories down
    		} 
        }
    }
    
};
</script>

<style>
</style>