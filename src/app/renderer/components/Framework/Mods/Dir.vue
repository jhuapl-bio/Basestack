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
          :hint="hint" persistent-hint
          max-width="600"  
          style="" @drop.prevent="addDropFiles" @dragover.prevent >
            <v-btn
              @click="electronOpenDir()"
            > <v-icon
            small class="mr-2 "
            > $upload
            </v-icon>
            Select Folder or Drag here

            </v-btn>
            
            <v-icon  v-if="directory" class="text--caption configure ml-5" @click="directory = null" color="grey" small>$times-circle
            </v-icon>
            <v-dialog
              v-model="dialog"
              max-width="290" v-if="process && process.platform_os !== 'win' && directory "
            >
            <template v-slot:activator="{ on, attrs }">
                <v-icon @click="dialog=true"   v-bind="attrs" small v-on="on"  class="configure ml-3" color="primary">$level-up-alt
                </v-icon>
              </template>
              <Permissions
                :source="source"
              ></Permissions>
            </v-dialog>
            <v-tooltip bottom v-if="directory">
                    <template v-slot:activator="{ on }">
                        <v-icon small v-on="on"  @click="this.$electron.shell.openPath(directory)" class="configure" color="primary">$archive
                        </v-icon>
                    </template>
                    {{  directory    }}
            </v-tooltip>            
      </v-sheet>
      <small class="text-caption" v-if="directory">
        {{directory}}
      </small>
      
      
      
  </v-card>
</template>

<script>
const path = require("path")

import Permissions from "./Permissions.vue";

export default {
	name: 'file',
  data() {
      return {
          value: null,
          process:null,
          valueDir: null,
          directory: null,
          dialog: false,
          test: "placeholder",
      }
  },
  components: {
    Permissions
  },
  computed: {
      hint(){
      let hint = ""
      if (this.variable.target){
        hint =`${this.variable.target}`
      }
      console.log(hint)
      return hint
    },
  },
  
	methods: {
    addDropFiles(e) {
      this.value = Array.from(e.dataTransfer.files);
      this.directory = this.value[0].path
    },
    makeUsable(item, event){
        this.$electron.ipcRenderer.send("sudoPrompt", { item: item } )
		}, 
    formatNames(files) {
      return files.length === 1 ? `Selected` : `${files.length} files selected`
    },
    electronOpenDir(key){
        const $this = this
        this.$electron.ipcRenderer.on('getValue', (evt, message)=>{
            $this.directory = message
            console.log(evt, message)
        })
        this.$electron.ipcRenderer.send("openDirSelect", "")
		},
	},
	props: ['source', 'status', 'service', 'variable'],
  mounted(){
    this.process = process.env
    this.directory = this.source 
  },
  watch: {
        directory(newValue, oldValue){
            this.$emit("updateValue", newValue )
        },
        source(newValue){
          if (!newValue){
            this.directory = null
          }
        },
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