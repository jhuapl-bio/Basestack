<!--Mimic the style of the other vue fules like module and dependencies.vue but for history-->
<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
  <template>
    <div class="parent-div">
        <!-- Render the history as the array of objects that they are in a vue-card using vuetify-->
        <!-- The history is an array of objects, so we need to iterate through the array and render each object as a vue-card-->
        <!-- set the max height as well, and make it y scrollable -->
        <v-alert variant="tonal" type="info" color="deep-purple-accent-2" >
            <span class="font-weight-bold">History</span>
        </v-alert>
        <v-card 
            style="max-height: 90%; overflow-y: scroll;"
            class="mx-auto overflow-y-auto"
            outlined>
            <!-- Render each item as a short v list, with timestamp in the bottom right in small text, and a icon button that is clickable. Also, display the type, value, variable  if it exists, from the params attribute of each object item -->
           
            <v-timeline side="end">
                <v-timeline-item
                    @click="updateCurrentModule(item)" three-line v-for="item in history" :key="item" class="mx-auto"
                    :dot-color="item.params.type == 'variable' ? 'green' : 'purple-lighten-2'" 
                    fill-dot
                    size="small" :icon="item.params.type == 'variable' ? 'mdi-variable' : 'mdi-play'" 
                >
                    <v-list-item @click="updateCurrentModule(item)" three-line  class="mx-auto" >
                        <v-list-item-title class="headline mb-1">{{ typeSet(item.params.type) }} {{  item.params.default ? '(Default)' : '(Target)'  }}</v-list-item-title>
                        <v-list-item-subtitle>{{item.timestamp}}</v-list-item-subtitle>
                        <v-list-item-subtitle v-if="item.params.type == 'variable'">
                            {{item.params.variable}}: {{item.params.value != '' && item.params.value !== null ? item.params.value : "Empty Value" }}
                        </v-list-item-subtitle>
                    </v-list-item>
                </v-timeline-item>
            </v-timeline>
        </v-card>
       
    </div>
  </template>
<style scoped>
    .parent-div {
        height: 100%;  
    }
</style>  
<script lang="ts" >
import { h } from 'vue';
import { onMounted, toRaw } from 'vue';

// add imports here
import { ref, reactive } from 'vue';

  
  
export default {
    setup() {
        // add data here

        // add a data for the history
        // make it reactive with ref
        const history = ref([]);

        // do onmounted for starting out the history tab
        // do onmounted for starting out the history tab, start writing code
        onMounted(() => {
            
            setTimeout(()=>{
                requestHistory();
            }, 1000)
                window.electronAPI.sendHistory((event: any, histReq: Object[]) => {
                // the history in the vue component isn't updating appropraiately when history is assigned to comething else
                // so we need to use the .value method to update the history
                history.value = histReq;
            });
        });
        // add methods here
        // add a method for requesting history
        const requestHistory = () => {
            window.electronAPI.requestHistory();
        }
        const updateCurrentModule = (item: any) => {
            window.electronAPI.updateCurrentModule({
                ...toRaw(item.params)
            });
            
        }
        const typeSet = (type: string)=>{
            if (type == 'variable'){
                 return `Variable Change`
            } else if (type == 'run'){
                return `Run Queued`
            } else if (type == 'customModule'){
                return "Custom Module Load"
            } else {
                return type
            }
        }

         

        return { 
            requestHistory,
            updateCurrentModule,
            history,
            typeSet
        }
    }
}
</script>
  