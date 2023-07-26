<template>
    <v-list-item  class="ml-0 pl-0 pt-0 pb-0" >
       <template v-slot:subtitle>
            {{  getInstallSubtitle(choice['type_install']) }} {{ choice['type_install'] == "command" ? `Platforms: ${choice['platform']}` : '' }}
            <span v-if="status['info'] && status['info']['size'] > 0" class="text--secondary">
                <v-spacer></v-spacer>
                {{ formatBytes(status['info']['size'], 2) }}
            </span >
        </template>
        <template v-slot:title>
                {{ getInstalltitle(choice['format']) }}
        </template>
         
        <template v-slot:append>
            <v-tooltip v-if="choice['format'] == 'file' || choice['format'] == 'directory' || choice['format'] == 'singularity'">
                <template v-slot:activator="{ props }"> 
                    <v-icon @click="openPath(choice['target'], choice['format'])" color="blue" class="mr-2" v-bind="props">mdi-folder
                    </v-icon>
                </template> 
                Open Path: {{ choice['target'] }}
            </v-tooltip>
            <v-btn icon size="small" dense
                @click="installDependency"
                variant="tonal" color="blue"
            >
                <v-icon  :icon="'mdi-download'"></v-icon>
            </v-btn>
            
        </template>
        <template v-slot:prepend>
            <v-btn
                color="grey-lighten-1"
                icon="mdi-information" @click="dialogInfo=true; infoSelected = choice"
                variant="text"
            ></v-btn>
            <v-progress-circular :indeterminate=" true " v-if="process['running']" model-value="10"></v-progress-circular>
            <v-tooltip v-else>
                <template v-slot:activator=" { props } ">
                    <v-icon  class="ml-2" v-bind=" props " :color=" status['exists'] ? 'green' : 'yellow-darken-2' " :icon=" status['exists'] ? 'mdi-check-all' : 'mdi-cancel' " :key=" `${status}` ">
                    </v-icon>
                </template> 
                <span v-if="choice['format'] == 'command'">{{ status['exists'] ? 'Binary Exists in your environment' : 'Binary does not exist in your environment' }}</span>
                <span v-else-if="choice['format'] == 'docker'">{{ status['exists'] ? 'Exists in your environment' : 'Does not exist, check Docker is running as well' }}</span>
                <span v-else>{{ status['exists'] ? 'Exists' : 'Does not exist' }}</span>
            </v-tooltip> 
            
            </template> 
        <v-divider ></v-divider>  
    </v-list-item>
    <v-dialog
        v-model=" dialogInfo "
        width="auto" 
    >
        <v-card  style="overflow:auto; ">
            <pre>{{ infoSelected }}</pre>
            <v-card-actions>
                <v-btn color="primary"  @click=" dialogInfo = false; infoSelected = null ">Close</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog> 
</template>
   
   <script lang="ts">
   import { ref, onMounted, watch, reactive,  computed, toRaw} from "vue";
   
   export default {
     name: "Dep", 
     props: {
        choice: { 
         type: [Object, Array, Number],
         default: () => { return {} }
       },
       kt: {
            type: String,
            default: "",
       },
       choiceIdx: {
         type: Number, 
         default: ""
       },
       index: {
         type: Number, 
         default: false
       }
       
     },
     setup(props, { emit }) {
         const dialogInfo  = ref(null)
         const infoSelected = ref(null)
        const process = reactive({})
        const status = ref({})
        onMounted(() => {
            
        });
        const formatBytes = (bytes: number, decimals: number) => { //https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
            if (!+ bytes) return '0 Bytes'
            const k = 1024
            const dm = decimals < 0 ? 0 : decimals
            const sizes = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']

            const i = Math.floor(Math.log(bytes) / Math.log(k))

            return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
        }
        setInterval(async ()=>{
            let yy = await window.electronAPI.requestDepStatus({
                index: props.index,
                type: props.kt,
                choice: toRaw(props.choiceIdx),
            })
            status.value = yy
            
        },2000)
        
       
        const installDependency = (dep: Number, choice: Number, type: String) => {
            window.electronAPI.installDependency({
                index: props.index,
                type: props.kt,
                choice: toRaw(props.choiceIdx),
                dependency: true,
                installation: true
            })
            window.electronAPI.setSideTab(2)
        }
        const openPath = (link: string, type: string | null) => {
            try {
                type == 'directory' ? window.electronAPI.openDir(link) : window.electronAPI.openDir(link)
            } catch (err) {
                console.log(err)
            }
        }
        const getInstallSubtitle = (format: string | void) => {
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
        }
        window.electronAPI.getProcesses((event: any, processes: any[]) => {
         });
       
        
        window.electronAPI.processStatus((event: any, proc: any) => {
            if (proc.index == props.index && proc.type == props.kt && proc.choice == props.choiceIdx ) {
                process['running'] = proc.running
            }
            
        });
        const getProcessByIdx = computed(() => {
            window.electronAPI.getProcessByIdx({
                type: props.kt,
                index: props.index, 
                choice: props.choiceIdx
            })
            return false
        })
        const getInstalltitle = (title: string | void) => {
            if (title ) {
                return  title.charAt(0).toUpperCase() + title.slice(1);
            } else {
                return "Unknown Type"
            }
        } 
   
       return {
         getInstallSubtitle, getInstalltitle, openPath,
         formatBytes, infoSelected, getProcessByIdx, status,
         dialogInfo, installDependency, process
       };
     },
   };
   </script>
   
   <style scoped>
   /* Add your styles here */
   </style>
   