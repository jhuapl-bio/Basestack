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
        <!-- <v-file-input 
          :label="( directory ? directory : 'Directory input')"
          v-model="directory"
          multiple
          variant="secondary"
          style="cursor:pointer"
        >
        </v-file-input>
        < -->
        <v-btn
            @click="electronOpenDir('data')"
            color="light"
            
            variant="secondary"
            append-icon="$archive"
            x-small
            style="cursor:pointer"
        >Select Folder 
          <v-icon
            x-small class="ml-2"
          > $archive
          </v-icon>
        </v-btn>
        <br><br>
        <v-spacer></v-spacer>
        <v-subheader  style="word-wrap: anywhere;" class="entry-label" v-if="directory" >{{directory}} </v-subheader>
    </div>
  </div>
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
            test: "placeholder"
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
      console.log(files)
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
                console.log(flat)
    		 	// this.changeRunDir(flat, 'dir')
    		} 
        }
    }
    
};
</script>

<style>
</style>