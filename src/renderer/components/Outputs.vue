<template>
    <v-list> 
      <v-toolbar-title>Output{{ outputVariables.length > 1 ? '(s)' : '' }}</v-toolbar-title>
      <v-list-item v-for="(variable, index) in outputVariables" :key="index">
        <template v-slot:title>
            {{  variable['label'] ? variable['label'] : variable['key'] }} 
        </template>
        <template v-slot:subtitle>
            {{  variable['pattern'] ? variable['pattern'] : 'No pattern' }} 
        </template>
        <template v-slot:append> 
            <v-tooltip v-if="variable['element'] == 'static-file' || variable['element'] == 'static-directory'">
                <template v-slot:activator="{ props }"> 
                    <v-icon @click="openPath(variable['value'], variable['element'])" color="blue" class="mr-2" v-bind="props">mdi-folder
                    </v-icon>
                </template> 
                Open Path: {{ variable['value'] }}
            </v-tooltip>
            <!-- Make a text field for the size, not a tooltip, just v-text -->
            <span v-if="variable['size']" label="Size" readonly>{{  variable['size'] }}</span>
            <!-- If the variable does not exists, tooltip with icon that is mdi-close and hover infor on errorText attr -->
            <v-tooltip v-else-if="variable['error']">
                <template v-slot:activator="{ props }"> 
                    <v-icon color="red" class="mr-2" v-bind="props">mdi-close
                    </v-icon>
                </template> 
                {{ variable['errorText'] }}
            </v-tooltip>
          

        </template>
      </v-list-item>
    </v-list>
  </template>
  
  <script lang="ts">
  import { validate } from "vee-validate";
import {  shallowRef, defineComponent, watch } from "vue";
  
  export default defineComponent({
    props: {
      variables: {
        type: Array, 
        default: () => [],
      },
    },
    setup(props) {
        const outputVariables = shallowRef(props.variables)

        const openPath = (link: string, type: string | null) => {
            try {
                type == 'static-directory' ? window.electronAPI.openDir(link) : window.electronAPI.openDir(link)
            } catch (err) {
                console.log(err)
            }
        }
        window.electronAPI.outputStatus((event: any, status: any) => {
          let indx = outputVariables.value.findIndex((x: any) => x.key == status.key)
          if (indx != -1) {
            outputVariables.value[indx] = status
          } else {
            // outputVariables.value.push(status)
          }
        })
        watch(() => props.variables, async (newVal, oldVal) => {
            outputVariables.value = newVal
            validate(newVal)
        })
        const validate = async (outputs)=>{
            outputs.map(async (filepath:any)=>{
              try {
                if (filepath['element'] == 'static-file' || filepath['element'] == 'static-directory'){
                  let exists = await window.electronAPI.exists(filepath['value']);
                  if (!exists){
                    filepath['error'] = true
                    filepath['errorText'] = 'File does not exist'
                  } else {
                    filepath['error'] = false
                    filepath['errorText'] = ''
                    filepath['size'] = exists.size
                  }
                }
              } catch (err) {
                filepath['error'] = true
                filepath['errorText'] =  'File does not exist'
                filepath['size'] = 0 
              } 

            })
            
        }

        return {
            outputVariables,
            openPath,
        };
    },
  });
  </script>