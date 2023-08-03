<template>
    <div class="input-wrapper">
        <v-select 
            :items="$props.choices"  
            v-model="value"
            :label="'List'"
            outlined 
            clearable
        />
        
    </div>
    
   </template>
   
   <script lang="ts">
   import { ref, onMounted, watch } from "vue";
   
   export default {
     name: "List",
     props: {
       variable: {
         type: String,
         default: "",
       },
       choices: {
            type: Array,
            default: [],
            required: true
       },
       default: {
         type: String, 
         default: ""
       },
       data: {
         type: Object,
         default: () => { return {} }
       },
       editMode: {
         type: Boolean, 
         default: false
       },
       params: {
          type: Object,
          required: true,
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
          })
          watch(() => value.value,  (newVal, oldVal)=>{
             if (value.value != props.variable){
                 emit("update", newVal);
             }
         })
          watch(() => defaultValue.value,  (newVal, oldVal)=>{
            console.log("default val changed")
            //  emit("update", newVal);
            //  if (newVal != props.default){
            //      emit("update", newVal);
            //  }
          }) 
          
         
         onMounted(() => {
         });
   
       return {
         value,
         defaultValue,
       };
     },
   };
   </script>
   
   <style scoped>
   /* Add your styles here */
   </style>
   