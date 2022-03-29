<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-layout id="file" @change="v$.value.$touch" @drop.prevent="addDropFile" @dragover.prevent >
    <v-list dense>
      <v-list-item>
        <v-file-input 
            v-model="value" outlined class="fill-width"
            @change="v$.value.$touch"
            :label="(source.hint ? source.hint : 'Input File')" 
            show-size  
            counter dense
        > 
          <template v-slot:append-outer>
            <v-icon  v-if="value" class="text--caption configure" @click="value = null" color="grey" x-small>$times-circle
            </v-icon>
          </template>
        </v-file-input >
      </v-list-item>
      <!-- <p
        v-for="error of v$.$errors"
        :key="error.$uid"
      >
        <small >Value is {{ error.$validator }}.</small>
      </p> -->
        <!-- <v-list-item v-for="error of v$.$errors"
        :key="error.$uid">
          <v-list-item-icon>
             <v-icon small  class="" color="warning">$exclamation-triangle
              </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            Value is {{ error.$validator }}
          </v-list-item-content>
        </v-list-item> -->
        
    </v-list>
      
    
   
   
  	
    
  </v-layout>
</template>

<script>
import useVuelidate from '@vuelidate/core'
// const in_column = (value) => (v) => {
//     let returnable = true
//     if (value.validations){
//         value.validations.forEach((validation)=>{
//             if (validation.type == 'contains'){
//                 if (validation.target.type == 'column'){
//                     console.log(validation)
//                     let source = value.source.map((f)=>{
//                         return f[validation.target.location]
//                     })
//                     let index = source.indexOf(validation.target.value)
//                     if (index <= -1){
//                         returnable = false
//                     }
//                 } else {
//                     let index = value.source.includes(validation.target.value)
//                     if (index <= -1){
//                         returnable = false
//                     }
//                 }
//             } else {
//                 returnable = true
//             }
//         })
//         return returnable
//     } else {
//         return true
//     }
// }
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
  computed: {
    
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
    },
    
    


	},
	props: ['source', 'variable'],
  mounted(){
    this.v$.value.$touch()
    if (!this.value && typeof(this.source.source) == 'string'){
        var file = new File([this.source.source], this.source.source, {
          type: "text/plain",
        });
        this.value = file
        this.cached = true
      }
  },
  validations () {
    return {
      value: { 
        required, 
        // in_column: in_column( this.source ),
        $autoDirty: false, 
        $lazy:false 
      },
    }
  },
  setup: () => ({ v$: useVuelidate() }),
  watch: {
        value(newValue, oldValue){
            if (!newValue){
              this.$emit("updateValue", newValue )
            }
            else if (newValue.path && newValue.path !== ""){
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