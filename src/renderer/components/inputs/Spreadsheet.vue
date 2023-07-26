<template>
  <div>
     <div  >
        <v-text-field  
            v-model="spreadsheetValue"
            @dragover.prevent
            :label="'Drag and Drop File Here'"
            @dragleave.prevent  
            @click.prevent="openFileDialog()"
            @drop.prevent="onDrop($event)"
          
            />
    </div>
    <!-- PRovide large header text that says Samplesheet entries -->
    <v-list-item-title>Samplesheet Entries</v-list-item-title>
    <v-expansion-panels accordion>
        <v-expansion-panel v-for="(item, i) in tableData" :key="`${i}--expansion`">
          <v-expansion-panel-title>
            {{ item.sample }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div v-for="(value, key) in headers" >
              <!-- Make each element value editable according to their type in the defined headers variabe -->
                <v-list-item-title class="font-weight-bold">{{ value.label }}: {{ item[value.key] }}</v-list-item-title>
                <!-- if value.type is string then make a vuetify text filed that edits tabledata enttry directly. if choices is present, then make it a dropdown rather than text field that can only be one of the options in choices array -->
                <v-select v-if="value.type == 'string' && value.choices" v-model="item[value.key]" :items="value.choices" :label="value.label" />
                <v-text-field v-else-if="value.type == 'string'" v-model="item[value.key]" :label="value.label" />
                <!-- if the value.type is boolean than v-switch -->
                <v-switch v-else-if="value.type == 'boolean'" v-model="item[value.key]" :label="value.label" />
                <!-- If the value.type is directory then make it a field that lets you select directory only -->
                <!-- <v-file-input v-else-if="value.type == 'directory'" v-model="item[value.key]" :label="value.label" /> -->
                <!--  if the value.type is file, then make it a file the same way we have in file.vue with ondrop and filedialog and such -->
                <v-text-field  
                  v-model="item[value.key]" v-else-if="value.type == 'file'"
                  @dragover.prevent
                  :label="'Drag and Drop File Here'"
                  @dragleave.prevent  
                  @click.prevent="openFileDialogEntry(value.key, i)"
                  @drop.prevent="onDropEntry($event, value.key, i)"
              
                  />
                <v-list-item-subtitle v-if="value.optional" class="font-weight-bold">Optional</v-list-item-subtitle>
              
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-divider></v-divider>
      </v-expansion-panels>
  </div>
</template>
<script lang="ts">
import { ref, reactive, toRefs, watch } from 'vue';
 
export default {
  name: 'Spreadsheet',
  props: {
    variable: {
      type: String,
      default: '',
    },
    data: {
      type: Object,
      default: () => { return {} }
    },
    default: {
      type: String, 
      default: ''
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
  setup(props : any, { emit }: any){
    const dialog = ref(false)
    const editedIndex = ref(-1)
    const editedItem = reactive({})
    const spreadsheetValue = ref(null)
    const active = ref(null);
    const toggle = (item) => {
      active.value = active.value === item ? null : item;
    };

    watch(() => props.data, (newVal, oldVal) => {
      headers.value = newVal
    }, { deep: true })

 
    const tableData = ref([
      {
        barcode: "FALSE",
        fastq_1: "C:\\Users\\bmerr\\Desktop\\test data\\nf-core-taxtriage-main\\examples\\data\\ERR6913102_1.fastq.gz",
        fastq_2: "C:\\Users\\bmerr\\Desktop\\test-data\\nf-core-taxtriage-main\\examples\\data\\ERR6913102_2.fastq.gz",
        from: false,
        platform: "ILLUMINA",
        sample: "ERR6913102",
        sequencing_summary: false, 
        single_end: "FALSE",
        "trim ": false
      },
      
    ])
    const headers = reactive(props.data)
    const openFileDialogEntry = async (key: any, i: number) => {
      let filePath = await window['electronAPI'].selectFile(true)
      tableData.value[i][key] = filePath
    }
    const onDropEntry = (event: DragEvent, key: any, i:number) => {
      const filePath = event.dataTransfer?.files[0]['path'];
      tableData.value[i][key] = filePath
    };
    const openFileDialog = async () => {
      let filePath = await window['electronAPI'].selectFile(true);
      spreadsheetValue.value = filePath
      emit('update', filePath)
      let fdata = []
      let tabledata = await window.electronAPI.requestFileData(filePath)
      // convert raw text of a csv to a json object, first row is header. Skipp all empty rows until first non empty row whihc is header
      let lines = tabledata.split('\n')
      let header = lines[0].split(',')
      let data = []
      for (let i = 1; i < lines.length; i++){
        let line = lines[i].split(',')
        if (line.length == header.length){
          let obj = {}
          for (let j = 0; j < header.length; j++){
            obj[header[j]] = line[j]
          }
          data.push(obj)
        }
      }
      tableData.value = data
      
    }
    
    const clearInput = (key: string) => {
      spreadsheetValue.value = '' 
      emit('update', '')
    };
    const onDrop = (event: DragEvent) => {
      const filePath = event.dataTransfer?.files[0]['path'];
      spreadsheetValue.value = filePath
      emit('update', filePath)
    };
    // const close = () => {
    //   dialog.value = false
    //   setTimeout(() => {
    //     editedItem['value'] = Object.assign({}, defaultItem)
    //     editedIndex.value = -1
    //   }, 300)
    // }

    // const save = () => {
    //   if (editedIndex.value > -1) {
    //     Object.assign(tableData[editedIndex.value], editedItem)
    //   } else {
    //     // tableData.push(Object.assign({}, editedItem))
    //   }
    //   close()
    // }

    return {
      ...toRefs(editedItem),
      dialog,
      editedIndex,
      spreadsheetValue,
      onDrop,
      clearInput,
      tableData,
      headers,
      active, toggle,
      openFileDialog, onDropEntry,
      openFileDialogEntry
    }
  },
}
</script>
