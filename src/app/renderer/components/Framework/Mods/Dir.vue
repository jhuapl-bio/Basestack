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
    <v-layout  style="border: 1px solid grey">
        <v-btn
            @click="electronOpenDir('data')"
            color="light"
            disabled
            
            variant="secondary"
            append-icon="$archive"
            x-small
            class="mt-5 mb-5"
            style="cursor:pointer"
        >Drag Folder here 
          <v-icon
           small class="ml-2"
          > $archive
          </v-icon>
        </v-btn>
        <br><br>
        <v-spacer></v-spacer>
        <v-subheader  style="word-wrap: anywhere;" class="entry-label" v-if="directory" >{{directory}} </v-subheader>
        <v-tooltip bottom v-if="!$v.directory.required">
          <template v-slot:activator="{ on }">
            <v-icon class=" " v-on="on" small color="warning lighten-1" >$exclamation-triangle
            </v-icon>
          </template>
          Valid Directory required
      </v-tooltip>
    </v-layout>
   
    
  </div>
</template>

<script>
const path = require("path")

import { required, requiredIf, minLength, between } from 'vuelidate/lib/validators'

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
  validations (){
    return{
        directory: {
            required: requiredIf((value)=>{
              return value && !this.source.optional
            })
        },
    }
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