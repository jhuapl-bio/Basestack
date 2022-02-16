<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-layout id="file" @drop.prevent="addDropFile" @dragover.prevent >
    <v-file-input 
        v-model="value"
        :label="(source.hint ? source.hint : '')" 
        show-size  
        counter
    > 
    </v-file-input >
    <v-tooltip bottom v-if="!$v.value.required">
        <template v-slot:activator="{ on }">
          <v-icon class="mt-5 ml-1" v-on="on" small color="warning lighten-1" >$exclamation-triangle
          </v-icon>
        </template>
        Valid File required
    </v-tooltip>
  	
    
  </v-layout>
</template>

<script>

import { required, requiredIf, minLength, between, helpers } from 'vuelidate/lib/validators'
const optional = (optional) => (value) => { console.log(optional,value,"fjsdfsdjflk"); return !optional && !value }
export default {
	name: 'file',
  data() {
      return {
          test: "placeholder",
          value: null,
          cached: false
      }
  },
  validations (){
    return{
        value: {
            required: requiredIf((value)=>{
              return value && !this.source.optional
            })
        },
    }
  },
  computed: {
    
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
    },
    
    


	},
	props: ['source', 'variable'],
  mounted(){
    if (!this.value && typeof(this.source.source) == 'string'){
        var file = new File([this.source.source], this.source.source, {
          type: "text/plain",
        });
        this.value = file
        this.cached = true
      }
  },
  watch: {
        value(newValue, oldValue){
            
            if (newValue.path && newValue.path !== ""){
              this.$emit("updateValue", newValue.path )
              this.cached = false
            } else {
              this.$emit("updateValue", newValue.name)
            }
        },
        // source: {
        //   deep: true,
        //   handler(newValue, oldValue){
        //     this.cached = true
        //     console.log("source changed")
        //   }
        // }
    }
    
};
</script>

<style>
</style>