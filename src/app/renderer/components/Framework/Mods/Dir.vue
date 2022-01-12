<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="dir" class="wv-50 p-1" @drop.prevent="addDropFiles" @dragover.prevent >
    <div >
        <v-file-input 
          label="Directory input"
          v-model="directory"
          src=""
          directory
          variant="secondary"
          style="cursor:pointer"
        >
        </v-file-input>
        <p  style="word-wrap: anywhere;" class="entry-label" v-if="value" >{{value}} </p>
    </div>
  </div>
</template>

<script>
export default {
	name: 'file',
    data() {
        return {
            value: null,
            valueDir: null,
            directory: null,
            test: "placeholder"
        }
    },
    computed: {
        
    },
	methods: {
    addDropFiles(e) {
      this.value = Array.from(e.dataTransfer.files);
      console.log(this.value)
    },
    formatNames(files) {
      console.log(files)
      return files.length === 1 ? `Selected` : `${files.length} files selected`
    },
    electronOpenDir(key){
        const $this = this
        this.$electron.ipcRenderer.on('getValue', (evt, message)=>{
            $this.value = message
        })
        this.$electron.ipcRenderer.send("openDirSelect", "")
		},
	},
	props: ['source', 'status', 'service', 'variable'],
  mounted(){
  },
  watch: {
        value(newValue, oldValue){
            this.$emit("updateValue", newValue )
        },
        directory(newValue, oldValue){
            if (newValue){
              this.value  = newValue.path.replace(newValue.name, "")
            }
        },
        valueDir(newValue, oldValue){
            console.log(newValue)
            if (newValue && newValue.length > 0){   
    			if (newValue.length == 1){
    				newValue = newValue[0]
    			}		
	    		const flat  = newValue.flat(2) //flatten up to 2 directories down
                console.log(flat)
    		 	// this.changeRunDir(flat, 'dir')
    		} 
        }
    }
    
};
</script>

<style>
</style>