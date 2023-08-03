<template>
    <v-switch
      v-if="!$props.editMode"
      v-model="value"
    ></v-switch>
    <v-switch
      v-else
      v-model="defaultValue"
    ></v-switch>
  </template>
  
  <script lang="ts">
  import { ref, watch, onMounted } from "vue";
  
  export default {
    name: "Checkbox",
    emits: ["update"],
    props: {
      variable: {
        type: Boolean,
        default: false,
      },
      default: {
        type: Boolean,
        default: false,
      },
      editMode: {
        type: Boolean,
        default: false,
      },
      choices: {
        type: Array, 
        required: false
      },
      params: {
        type: Object,
        required: true,
        default: () => {
          return {};
        },
      },
      data: {
        type: Object,
        default: () => {
          return {};
        },
      },
    },
    setup(props, { emit }) {
      const value = ref(props.params.default);
      const defaultValue = ref(props.default);
  
      watch(
        () => props.variable,
        (newVal) => {
          value.value = newVal;
        },
        { deep: true }
      );
      watch(
        () => props.default,
        (newVal) => {
          defaultValue.value = newVal;
        },
        { deep: true }
      );
      watch(
        () => value.value,
        (newVal) => {
            console.log("newVal", newVal, props.params)
          if (newVal !== props.variable) {
            if (newVal){
                emit('update', props.params.if)
            } else {
                emit("update", props.params.ifnot ? props.params.ifnot : "");
            }
          }
        }
      );
      watch(
        () => defaultValue.value,
        (newVal) => {
          emit("update", newVal);
          if (newVal !== props.default) {
            emit("update", newVal);
          }
        }
      );
  
      onMounted(() => {});
  
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
  