<template>
    Static 
    <v-text-field  
         v-if="!$props.editMode"
         v-model="value" :disabled="false"
     >
     </v-text-field>
     <v-text-field  
         v-else  :disabled="false"
         v-model="defaultValue"
     >
     </v-text-field>

   </template>
   
   <script lang="ts">
   import { shallowRef, onMounted, watch } from "vue";
   
   export default {
     name: "Static",
     emits: ["update"],
     props: {
      variable: {
        type: String,
        default: "",
      },
      default: {
        type: String, 
        default: ""
      },
      editMode: {
        type: Boolean, 
        default: false
      },
      choices: {
        type: Array, 
        required: false
      },
      data: {
        type: Object,
        default: () => { return {} }
      },
      params: {
        type: Object,
        required: true,
        default: () => { return {} }
      },
     },
     setup(props, { emit }) {
         const value = shallowRef(props.variable);
         const defaultValue = shallowRef(props.default)         
         onMounted(() => {
         });
         watch(() => props.variable,  (newVal, oldVal)=>{
            value.value = newVal
         })
         watch(() => props.default,  (newVal, oldVal)=>{
            defaultValue.value = newVal
         })
         watch(() => defaultValue.value,  (newVal, oldVal)=>{
            if (newVal != props.default){
                emit("update", newVal);
            }
         }) 
   
       return {
         value,defaultValue
       };
     },
   };
   </script>
   
   <style scoped>
   /* Add your styles here */
   </style>
   