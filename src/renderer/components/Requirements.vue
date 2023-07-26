<template>
   <v-list dense outlined>
      <v-list-item v-for="(dependency, index) in dependencies" :key="index">
        <v-list-item-title>{{ dependency.key }}</v-list-item-title>
        <Dep
            :choice="dependency.choices[dependency.choiceidx]"
            :kt="dependency.type"
            :choiceIdx="dependency.choiceidx"
            :index="dependency.idx"
        ></Dep>
        <v-divider></v-divider>
    </v-list-item>
    </v-list>
  </template>
  
  <script lang="ts">
    import { ref, watch as ws, onMounted, toRaw } from 'vue';
    import Dependencies from './Dependencies.vue'
    import Dep from './Dep.vue'
    export default {
        name: 'Requirements',
        props: {
            requirements: {
                type: Array,
                required: true
            },
            choiceIdx: {
                type: Number,
                required: true
            },
        },
        components: {
            Dependencies,
            Dep
        },
        setup(props, { emit }) {
        const dependencies = ref([]);
        
        
        ws(props.requirements, (newVal: any) => {
                window.electronAPI.requestDependenciesInfo(toRaw(newVal))
        }, {deep:true})

        window.electronAPI.sendRequirementInfo((event: any, data: any) => {
            dependencies.value = data
        })
            
        onMounted(async () => {
            window.electronAPI.requestDependenciesInfo(toRaw(props.requirements))
            window.electronAPI.getDependenciesStatus((event: any, data: any) => {
                // check if the dependency is in list of dependneices with key as index, if not push else update
                let found = false
                dependencies.value.forEach((dependency, index) => {
                    if (dependency.key == data.key){
                        found = true
                        dependencies.value[index] = data
                    }
                })
                if (!found){
                    dependencies.value.push(data)
                }
            })
            
    
        });
    
        return { dependencies  };
    }
}
  </script>
  