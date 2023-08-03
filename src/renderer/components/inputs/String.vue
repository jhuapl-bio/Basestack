<template>
   <v-text-field  
        v-if="!$props.editMode"
        v-model="value" 
    >
    </v-text-field>
    <v-text-field  
        v-else 
        v-model="defaultValue"
    >
    </v-text-field>
  </template>
  
  <script lang="ts">
  import {  shallowRef, ref,  onMounted, watch } from "vue";
  
  export default {
    name: "String",
    emits: ["update"],
    props: {
      variable: {
        type: String,
        default: "",
      },
      choices: {
        type: Array, 
        required: false
      },
      default: {
        type: String, 
        default: ""
      },
      params: {
        type: Object,
        required: true,
        default: () => { return {} }
      },
      editMode: {
        type: Boolean, 
        default: false
      },
      data: {
        type: Object,
        default: () => { return {} }
      },
      
    },
    setup(props, { emit }) {
        const value = ref(props.variable);
        const defaultValue = ref(props.default)
       
        
        watch(() => props.variable,  (newVal, oldVal)=>{
            value.value = newVal
         }, {deep:true})
         watch(() => props.default,  (newVal, oldVal)=>{
            defaultValue.value = newVal
         }, {deep:true})
         watch(() => value.value,  (newVal, oldVal)=>{
            if (value.value != props.variable){
                emit("update", newVal);
            }
        })
         watch(() => defaultValue.value,  (newVal, oldVal)=>{
            emit("update", newVal);
            if (newVal != props.default){
                emit("update", newVal);
            }
         }) 
        
        onMounted(() => {
        });
  
      return {
        value,defaultValue
      };
    },
  };
  </script>
  
  <style scoped>
  /* Add your styles here */
  </style>
  