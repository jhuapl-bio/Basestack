<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="dir" >
  	<!-- <b-form-file 
        ref="seq_dir" 
        :id="'seq_dir'" 
        aria-describedby="seq_dir" 
        v-model="valueDir"
        directory
        webkitdirectory
        :no-traverse="false"
        :multiple="true"
        @change="electronOpenDir"
        :placeholder="'Choose a folder'"
        drop-placeholder="Drop folder here..."
        :file-name-formatter="formatNames"
        >
    </b-form-file> -->
    <b-button
        @click="electronOpenDir('data')"
    > Select Folder
    </b-button><p v-if="value">{{value}}</p>
  </div>
</template>

<script>
export default {
	name: 'file',
    data() {
        return {
            value: null,
            valueDir: null,
            test: "placeholder"
        }
    },
    computed: {
        
    },
	methods: {
        formatNames(files) {
        	return files.length === 1 ? `${files[0].name} selected` : `${files.length} files selected`
      	},
        electronOpenDir(key){
            const $this = this
            this.$electron.ipcRenderer.on('getValue', (evt, message)=>{
                $this.value = message
            })
            this.$electron.ipcRenderer.send("openDirSelect", "")
		},
	},
	props: ['source', 'status', 'service'],
  mounted(){
  },
  watch: {
        value(newValue, oldValue){
            console.log(newValue)
            this.$emit("updateValue", newValue)
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