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
          counter :solo="type =='solo' ? true : false"
      > 
        <template v-slot:append-outer>
          <v-icon  v-if="value" class="text--caption configure mr-3" @click="value = null" color="grey" small>$times-circle
          </v-icon>
          <v-divider vertical></v-divider>
          
        </template>
      </v-file-input >
      <!-- <v-dialog class="justify-end align-right"
            v-model="dialog" 
            v-if="process && !process.system.isWin && source"
            max-width="290"
        >
            
            <template v-slot:activator="{ on, attrs }">
            <p class="ml-3" style="font-size:70%">Permissions</p>
            <v-icon @click="dialog=true"   v-bind="attrs" small v-on="on"  class="configure ml-3" color="primary">$level-up-alt
            </v-icon>
            </template>
            <Permissions
            :source="source"
            ></Permissions>
        </v-dialog>
       -->
  
    
      
        
      
    
   
   
  	
    
  </v-container>
</template>

<script>
import Permissions from "./Permissions.vue";
export default {
    name: "fileselect",
    data() {
        return {
            test: "placeholder",
            value: null,
            process: null,
            dialog: false,
            cached: false
        };
    },
    computed: {
        hint() {
            let hint = "";
            if (!this.fullhint && this.variable.target) {
                hint = `${this.variable.target}`;
            } else {
                hint = this.fullhint
            }
            return hint;
        },
    },
    methods: {
        addDropFile(e) {
            this.value = e.dataTransfer.files[0];
        },
        
        updateValidity() {
        }
    },
    props: ["source", "variable", 'fullhint', 'type'],
    mounted() {
        this.process = process.env;
        if (!this.value && typeof (this.source) == "string") {
            var file = new File([this.source], this.source, {
                type: "text/plain",
            });
            this.value = file;
            this.cached = true;
        }
    },
    watch: {
        value(newValue, oldValue) {
            if (!newValue) {
                this.$emit("updateValue", newValue);
            }
            else if (newValue.path && newValue.path !== "") {
                this.$emit("updateValue", newValue.path);
                this.cached = false;
            }
            else {
                this.$emit("updateValue", newValue.name);
            }
        },
    },
    components: { Permissions }
};
</script>

<style>
</style>