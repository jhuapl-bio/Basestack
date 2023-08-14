<template>
  <v-text-field  
       v-if="!$props.editMode"  
       v-model.number="value" 
       :step="(params.step ? params.step : 1)"
       :min="(params.min ? params.min : 1)"
       :max="(params.max ? params.max : 1)"
       type="number"
   >
   </v-text-field>
   <v-text-field  
       v-else 
       v-model.number="defaultValue"
       :step="(params.step ? params.step : 1)"
       :min="(params.min ? params.min : 1)"
       :max="(params.max ? params.max : 1)"
       type="number"
   >
   </v-text-field>
</template>

<script lang="ts">
import {  shallowRef, ref,  onMounted, watch } from "vue";

export default {
  name: "Num",
  emits: ["update"],
  props: {
    variable: {
      type: Number,
      default: 0,
    },
    choices: {
      type: Array, 
      required: false
    },
    params: {
      type: Object,
      required: true,
      default: () => { return {} }
    },
    default: {
      type: Number, 
      default: 0
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
      value,defaultValue,  
    };
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>
