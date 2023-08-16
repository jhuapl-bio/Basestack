<template>
    <v-switch  class="mb-0 pb-0"
      v-if="!$props.editMode"
      v-model="value" :dense="true"
    ></v-switch>
    <v-switch 
      v-else
      v-model="defaultValue"
    ></v-switch>
  </template>
  
  <script lang="ts">
  import { ref, watch, onMounted } from "vue";
  import { conditionalSets  } from '../../controllers/interpolate'

  export default {
    name: "Checkbox",
    emits: ["update"],
    props: {
      variable: {
        type: [Boolean, String, Number],
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
      const defaultValue = ref(props.default);
      const value = ref(props.params.default ? props.params.default : props.variable);
      
      watch(
        () => value.value,
        (newVal) => {
          emit("update",newVal);
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
  