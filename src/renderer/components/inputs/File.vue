<template>
    <div class="input-wrapper">
        <div v-if="!editMode">
            <v-text-field :disabled="editMode"
                v-model="value"
                @dragover.prevent
                :label="defaultValue ? defaultValue : 'Drag and Drop File Here'"
                @dragleave.prevent  
                @click.prevent="openFileDialog()"
                @drop.prevent="onDrop($event)"
                
                />
        </div>
      
    </div>
    
   </template>
   
   <script lang="ts">
   import { ref, onMounted, watch } from "vue";
   
   export default {
     name: "String",
     props: {
      params: {
        type: Object,
        required: true,
        default: () => { return {} }
      },
      data: {
        type: Object,
        default: () => { return {} }
      },
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
             emit("update", newVal);
             if (newVal != props.default){
                 emit("update", newVal);
             }
          }) 
          const openFileDialog = async () => {
            let filePath = await window['electronAPI'].selectFile();
            if (filePath) {
              // handleFileSelection(key, filePath);
              emit("update", filePath);

            }
       
        };
        const clearInput = (key: string) => {
            props.editMode  ? defaultValue.value = '' : value.value = ''
        };
        const onDrop = ( event: DragEvent) => {
            const filePath = event.dataTransfer?.files[0]['path'];
            emit("update", filePath)
        };
         
         onMounted(() => {
         });
   
       return {
         value,
         defaultValue,
         openFileDialog, 
         clearInput,
         onDrop
       };
     },
   };
   </script>
   
   <style scoped>
   /* Add your styles here */
   </style>
   