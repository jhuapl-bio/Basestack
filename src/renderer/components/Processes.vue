<template>
    <v-card
        class="mx-auto"
    >
        <template v-slot:title>
            <v-alert variant="tonal" color="yellow-darken-4" >
                <span class="font-weight-bold">Processes</span>
            </v-alert>
        </template>
        <template v-slot:append>
            <v-btn variant="tonal" color="orange-darken-5"  @click="removeProcesses()">
                Clear
                <v-icon color="white-darken-1">
                    mdi-trash-can
                </v-icon>
            </v-btn>
        </template>

        <v-card-text>
            <v-autocomplete
                v-model="select"
                v-model:search="search"
                :items="processes" active
                v-if="processes.length > 0"
                class="mx-4"
                density="comfortable"
                clearable
                item-title="label"
                item-value="id"
                label="What process name?"
                style="max-width: 300px;"
            >
                <template v-slot:item="{ props, item }">
                    <v-list-item
                      v-bind="props"
                      :title="item.title"
                      :subtitle="item.value"
                    ></v-list-item>
                  </template>
        
            </v-autocomplete>
            <v-card v-for="entry in processes.filter((f)=>{
                return  select && select.length != 0   ? select == f['id'] : true
            }).reverse()"
                class="mx-auto"
            >
                <v-toolbar
                    color="rgba(0, 0, 0, 0)"
                >
                    <v-toolbar-title class="text--primary">
                        {{ entry['label'] }}
                    </v-toolbar-title>

                    <v-list-subheader class="text--primary">
                        {{ entry['id'] }}
                    </v-list-subheader>
                    <template v-slot:prepend    >
                        <v-icon color="grey-lighten-1">
                            {{ entry['icon'] }}
                        </v-icon>
                    </template>
                    <template v-slot:append>
                        <v-progress-circular :indeterminate="true" v-if="entry['running']" model-value="10"></v-progress-circular>
                        <v-icon
                            color="green-lighten-1"  v-else-if="!entry['running'] && entry['code'] == 0"
                            :icon="'mdi-check'"
                            variant="text"
                        ></v-icon>
                        <v-icon
                            color="red-lighten-1"  v-else-if="!entry['running'] && entry['code'] > 0"
                            :icon="entry['code'] == 0 && !entry['running'] ? 'mdi-check' : 'mdi-alert'"
                            variant="text"
                        ></v-icon>
                    </template>
                </v-toolbar>
                <v-card-text>
                    <v-list-subheader>
                        {{ entry['installation'] ? 'Installation' : 'Module' }}
                    </v-list-subheader>
                    <v-list-subheader v-if="entry['installation']">
                        Format: {{ entry['format'] ? entry['format'] : '' }}, 
                        Type: {{ entry['type_install'] ? entry['type_install'] : '' }}
                    </v-list-subheader>
                    <div class="text--primary">
                        <p v-if="entry['code'] > 0">
                            {{ entry['error'].join(" ") }}
                        </p>
                        <p v-else-if="entry['logs'].length > 0">
                            {{ entry['logs'][0] }}
                        </p>
                    </div>
                </v-card-text>
                <v-card-actions>
                    <v-btn  color="teal-accent-4"
                        @click="dialog=true; logsSelected = entry['logs']"
                    >
                        Logs
                    </v-btn>
                    <v-btn  color="blue-accent-4"
                    @click="dialogMore = true; moreInfo = entry"
                    >
                            
                        More
                    </v-btn>
                    <v-spacer></v-spacer>
                    <v-btn @click="restartProcess(entry['id'])"
                        color="blue-lighten-1"
                        icon="mdi-recycle"
                        variant="text"
                    ></v-btn>
                    <v-spacer></v-spacer>
                    <v-icon
                        color="orange-lighten-1"
                        :icon="'mdi-delete'"
                        variant="text" @click="removeProcess(entry['id'])"
                    ></v-icon>
                </v-card-actions>
            </v-card>
           
        </v-card-text>
        <v-dialog
            v-model=" dialog "
            width="auto" 
        >
            <v-card>
            <v-card-text >
                <div style="max-height: 200px; overflow-y:auto">
                    <pre v-for="( line, index ) in  logsSelected "  v-bind:key=" index " >{{ pretty(line) }}</pre>
                </div>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click=" dialog = false; logsSelected = [] ">Close</v-btn>
            </v-card-actions>
            </v-card>
        </v-dialog>
        <v-dialog
            v-model=" dialogMore "
            width="auto" 
        >
            <v-card>
            <v-card-text style="max-height: 600px; overflow-y: auto;" >
                <pre >{{ moreInfo }}</pre>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" block @click=" dialogMore = false; moreInfo=null ">Close</v-btn>
            </v-card-actions>
            </v-card>
        </v-dialog>
    </v-card>
</template>

<script lang="ts" >


interface State {
    processes: any[]
    dialog: boolean
    search: any
    select: any[]
    logsSelected: null | []
    dialogMore: boolean
    processesLogs: Object
    moreInfo: Object | null
}
import { defineComponent, reactive } from 'vue';

export default defineComponent({
    name: 'Processes',
    data: (): State => { // ADD
        return {
            dialog: false,
            dialogMore: false,
            select: [],
            search: null,
            logsSelected: null,
            moreInfo: null,
            processes: reactive([]),
            processesLogs: {}
        }
    },
    props: {
        env: Object
    },
    computed: {
       
    },
    watch: {
       
    },

    mounted() { // Code heavily influenced by https://github.com/nojaja/ElectronTerminal/
        setTimeout(() => {
            window.electronAPI.requestProcesses()

        }, 1000)
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
        window.electronAPI.removedProcess((event: any, id: String) => {
            let findindex = this.processes.findIndex(x => x.id == id)
            if (findindex != -1) {
                this.processes.splice(findindex,1)
            } 
        });
      
        
        window.electronAPI.processStatus((event: any, process: Object) => {
            let findindex = this.processes.findIndex(x => x.id == process['id'])
            if (findindex == -1) {
                this.processes.push(process)
            } else {
                this.processes[findindex] = process
            }
        });



    },

    beforeDestroy() {
    },
    methods: {
        removeProcesses() {
            this.processes.map((process: any) => {
                this.removeProcess(process['id'])
            })  
        },
        restartProcess(id: string) {
            window.electronAPI.restartProcess(id)
        },  
        removeProcess(id: string) {
            window.electronAPI.removeProcess(id)
        },
        pretty: function (value: string) {
            try {
                return JSON.stringify(JSON.parse(value), null, 2);
            } catch {
                return value
            }
        },
    }
})
</script>

