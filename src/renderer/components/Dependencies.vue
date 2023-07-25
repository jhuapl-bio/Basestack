<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
    <div
        class="mx-auto"
        style="height: 80vh; overflow-y: auto;"
    >
        <v-toolbar>
            <v-toolbar-title class="text-h6">
                Installations
            </v-toolbar-title>
            <template v-slot:append>
                <v-icon>
                    mdi-download-circle
                </v-icon>
            </template>
        </v-toolbar>
        <v-list lines="two">
            <v-list-item  dense v-for="[key, dep] in Object.entries(deps)"
                class="mx-auto"
            >
                <v-toolbar
                    color="rgba(0, 0, 0, 0)"
                >
                    <v-toolbar-title>
                        {{ key.charAt(0).toUpperCase() + key.slice(1) }}
                    </v-toolbar-title>
                    <template v-slot:append>
                        <v-icon size="x-large" color="grey-lighten-1">
                            {{ key == 'executions'  ? 'mdi-cpu-64-bit' : (key == 'images' ? 'mdi-docker' : 'mdi-folder' ) }}
                        </v-icon>
                    </template>
                </v-toolbar>
                <v-divider></v-divider>
                <v-card   v-for="(dependency, index) in dep" >
                    <v-toolbar
                        color="rgba(0, 0, 0, 0)" 
                    >
                        <v-toolbar-title class="text--primary">
                            {{ dependency['label'] }}
                        </v-toolbar-title>
                        <template v-slot:prepend>
                            <v-avatar  :color="dependency['color'] ? dependency['color'] : 'grey-lighten-1'">
                                <v-icon color="white">{{ dependency['icon'] ? dependency['icon'] : "mdi-folder" }}</v-icon>
                            </v-avatar> 
                        </template>
                        <template v-slot:append>
                            <v-progress-circular :indeterminate="true" v-if="getProcess(key, index)" model-value="10"></v-progress-circular>
                            <v-tooltip v-else>
                                <template v-slot:activator="{ props }">
                                    <v-icon  class="ml-2" v-bind="props" :color="dependency['status']['exists'] ? 'green' : 'yellow-darken-2'" :icon="dependency['status']['exists'] ? 'mdi-check-all' : 'mdi-cancel'" :key="`${dependency['status']}`">
                                    </v-icon>
                                </template>
                                <span>{{ dependency['status']['exists'] ? 'One or more option exists in your environemnt' : 'No option exists in your environment' }}</span>
                            </v-tooltip>
                        </template>
                    </v-toolbar> 
                    
                    <v-card-text class="ml-0 pl-0 pt-0 mt-0 mb-0 pb-0">
                        <v-list dense lines="three" class="ml-0 pl-0 pt-0 pb-0">
                            <Dep v-for="( choice, choiceIdx) in dependency['choices']"
                                :key="`${choiceIdx}-choices-${choice['target']}`"
                                :kt="key"
                                :choiceIdx="choiceIdx"
                                :index="index" 
                                v-bind:choice="choice"
 
                            ></Dep>
                        </v-list>
                       
                    </v-card-text>
                </v-card>
            </v-list-item>
        </v-list>
       
        
    </div>
</template>

<script lang="ts" >
import { defineComponent, reactive } from 'vue';
import path from 'path'
import Dep from './Dep.vue'

interface State {
    deps: any
    dialog: boolean
    processes: any[],
    selectedDependency: any,
    processesMap: Object,
    dialogInfo: boolean
    dialogDependency: boolean
    infoSelected: Object | null
}

export default defineComponent({
    name: 'Dependencies',
    components: {
        Dep,
    },
    computed: {
        
    },
    data: (): State => { // ADD
        return {
            deps: {},
            dialog: false,
            processes: reactive([]),
            processesMap: {},
            infoSelected: null,
            dialogDependency: false,
            dialogInfo: false,
            selectedDependency: null
        }
    },
    props: {
        env: {
            type: Object, 
            required: true
        }
    },
    watch: {
        processes(newVal) {
        }
    },
  

    mounted() {
        window.electronAPI.getDependencies((event: any, deps: any) => {
            this.deps = deps
        });
       
        window.electronAPI.processStatus((event: any, process: Object) => {
            let findindex = this.processes.findIndex(x => x.id == process['id'])
            if (findindex == -1)
            {
                this.processes.push(process)
            } else {
                this.processes[findindex] = process
            }
        });
        window.electronAPI.removedProcess((event: any, id: String) => {
            let findindex = this.processes.findIndex(x => x.id == id)
            if (findindex != -1) {
                this.processes.splice(findindex, 1)
            }
        });
        window.electronAPI.getProcesses((event: any, processes: any[]) => {
            processes.map((process: any) => {
                let findindex = this.processes.findIndex(x => x.id == process['id'])
                if (findindex == -1) {
                    this.processes.push(process)
                } else {
                    this.processes[findindex] = process
                }
                this.processesLogs[process['id']] = process['logs']
            })
        });

        // window.electronAPI.dependencyStatus((event: any, params: any) => {
        //     console.log(params)
        //     let findindex = this.processes.findIndex(x => x.id == params['id'])
        //     if (findindex == -1) {
        //         this.deps[params['status']['type']][params['index']]['processes'] = [params['id']]
        //     } else {
        //         this.deps[params['status']['type']][params['index']]['processes'].push(params['id'])
        //     }
        // });
        window.electronAPI.requestDependencies()
    },
    emits: {
    },
    methods: {
        openPath(link: string, type: string | null) {
            try {
                type == 'directory' ? window.electronAPI.openDir(link) : window.electronAPI.openDir(link)
            } catch (err) {
                console.log(err)
            }
        },
        getInstallSubtitle(format: string | void) {
            if (format == 'get') {
                return "Download"
            } else if (format == 'pull') {
                return "Pull Image"
            } else if (format == 'download' || format == 'fetch') {
                return "Download"
            } else if (format == 'command') {
                return "Run"
            } else {
                return ""
            }
        },
        getInstalltitle(title: string | void) {
            if (title ) {
                return  title.charAt(0).toUpperCase() + title.slice(1);
            } else {
                return "Unknown Type"
            }
        },
        getProcess(type: string, index: number) {
            let dependency = this.deps[type][index]
            if (dependency.processes) {
                let any = dependency.processes.some((id: string) => {
                    let idxs = this.processes.reduce(function (a, e, i) {
                    if (e.id === id && e.running)
                        a.push(i);
                    return a;
                    }, []);
                    return idxs.length > 0
                })
                return any
            } else {
                return  false
            }
        },
        getProcessChoice(type: string, index: number, choice: number) {
            let processidx = this.processes.findIndex(x=> x['running'] && x['choice'] == choice && x['index'] == index && x['type'] == type)
            return processidx > -1
        }, 
        formatBytes(bytes: number, decimals: number) { //https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
            if (!+ bytes) return '0 Bytes'
            const k = 1024
            const dm = decimals < 0 ? 0 : decimals
            const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
        },
        installDependency(dep: Number, choice: Number, type: String) {
            window.electronAPI.installDependency({
                index: dep,
                type: type,
                choice: choice,
                dependency: true,
                installation: true
            })
        }
    }
})
</script>

<style>
</style>
