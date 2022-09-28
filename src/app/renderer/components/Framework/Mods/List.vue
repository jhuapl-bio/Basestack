<template>
  <v-layout id="list"  >
    <v-tooltip bottom v-if="length <= 0" >
        <template v-slot:activator="{ on }">
            <v-icon medium :if="length <= 0" class="mr-2" color="warning" v-on="on"  >$exclamation-triangle
            </v-icon>
        </template>
        List must be more than 1 entry
    </v-tooltip> 
    <v-card width="100%" flat tile >
        <v-card-actions>
            <v-data-table
                small 
                :headers="headers"
                :items="source"
                :items-per-page="6"
                :footer-props="{
                showFirstLastPage: true,
                    prevIcon: '$arrow-alt-circle-left',
                    nextIcon: '$arrow-alt-circle-right',
                    firstIcon: '$step-backward',
                    lastIcon: '$step-forward',
                }"
                class="elevation-1 "    
                                    
        >   
            <template v-slot:top>
                <v-toolbar   class=""
                >
                    
                    <!-- <template v-slot:extension class="mb-10"> -->
                        <v-toolbar-title>{{ ( title ? title : 'List Table' )  }}</v-toolbar-title>
                        <v-spacer></v-spacer>
                            <FileSelect 
                            :source="csvSource" 
                            :variable="csv"
                            :fullhint="'Import CSV File'"
                            @updateValue="importCsv($event)"
                        >
                            
                        </FileSelect>
                        <v-spacer></v-spacer> 
                        <v-dialog
                            v-model="dialog"
                            max-width="50%"
                            >
                            <template v-slot:activator="{ on, attrs }">
                                <v-btn
                                    color="primary"
                                    dark
                                    class="mb-2"
                                    v-bind="attrs"
                                    v-on="on"
                                    >
                                    New Item
                                </v-btn>
                                                            
                            </template>
                            <v-card>
                                <v-card-title>
                                <span class="text-h5">Row Item Add</span>
                                </v-card-title>
                                <v-card-text>
                                    <v-container>
                                        <v-list subheader
                                            two-line>
                                            <v-subheader>
                                                Samplesheet Configuration
                                            </v-subheader>
                                        <v-list-item v-for="head in headers.filter((f)=>{
                                            return f.value != 'actions'
                                        })" :key="head.value + head.index">
                                            <v-list-item-content>    
                                                <v-list-item-title class="justify-end"   v-if="head.value != 'actions'">Column Name: {{head.value}}</v-list-item-title> 
                                                <v-checkbox 
                                                    v-model="savedAll[head.value]"
                                                    on-icon="$check-square"
                                                    label="Change All Entries"
                                                    class="text-xs-center" 
                                                    off-icon="$square"
                                                    color="primary"
                                                >
                                                
                                                </v-checkbox>
                                                <FileSelect v-if="!custom[head.value] && discerntype(head.value).type.indexOf('file') > -1"
                                                :source="editedItem[head.value]"
                                                :variable="editedItem"
                                            
                                                @updateValue="updateValue($event, false, editedItem, head.value, head.value)"
                                                >
                                                    
                                                </FileSelect>
                                                <v-divider inset v-if="discerntype(head.value).element.length > 1"></v-divider>
                                                
                                                <Dir v-if="!custom[head.value] && ['directory', 'dir'].some(r=> discerntype(head.value).type.includes(r))"
                                                    :source="editedItem[head.value]"
                                                    :variable="editedItem"  
                                                    @updateValue="updateValue($event, false, editedItem, head.value, head.value)"
                                                    >
                                                        
                                                </Dir>
                                                <v-select v-else-if="!custom[head.value] && discerntype(head.value).type.indexOf('select') > -1"
                                                
                                                    v-model="editedItem[head.value]"
                                                    :items="variable.define_columns[head.value].options"
                                                >

                                                </v-select>
                                                
                                                <v-text-field v-else-if="!custom[head.value] && head.value !== 'actions' && discerntype(head.value).type.indexOf('file') == -1"
                                                    v-model="editedItem[head.value]" persistent-hint
                                                    :hint="`Value for column: ${head.text}`"
                                                ></v-text-field>
                                                <div v-if="discerntype(head.value).custom">
                                                    <FileSelect :key="`${custom[head.value]}-${head.value}`" v-if="custom[head.value] && discerntype(head.value).element.indexOf('file') > -1"
                                                    :source="editedItem[head.value]"
                                                    :variable="editedItem"
                                                    :label="head.value"
                                                    @updateValue="updateValue($event, false, editedItem, head.value, head.value)"
                                                    >
                                                        
                                                    </FileSelect>
                                                    
                                                    <Dir v-else-if="custom[head.value] && discerntype(head.value).element.indexOf('dir') > -1"
                                                        :source="editedItem[head.value]"
                                                        :label="head.value"
                                                        :variable="editedItem"
                                                        @updateValue="updateValue($event, false, editedItem, head.value, head.value)"
                                                        >
                                                            
                                                    </Dir>
                                                    <v-text-field v-else-if="custom[head.value] && discerntype(head.value).element == 'string'"
                                                        v-model="editedItem[head.value]" persistent-hint
                                                        :hint="`Value for column: ${head.text}`"
                                                    ></v-text-field>
                                                </div>

                                                </v-list-item-content>

                                                <v-list-item-action v-if="discerntype(head.value).custom">
                                                    <v-checkbox 
                                                        v-model="custom[head.value]"
                                                        on-icon="$check-square"
                                                        label="custom input"
                                                        class="text-xs-center" 
                                                        off-icon="$square"
                                                        color="primary"
                                                    >
                                                    
                                                    </v-checkbox>
                                                </v-list-item-action>
                                        </v-list-item>
                                        </v-list>
                                    </v-container>
                                </v-card-text>
                                <v-card-actions>
                                <v-spacer></v-spacer>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="close"
                                >
                                    Cancel
                                </v-btn>
                                <v-btn
                                    color="blue darken-1"
                                    text
                                    @click="save"
                                >
                                    Save
                                </v-btn>
                                </v-card-actions>
                            </v-card>

                        </v-dialog>
                    <!-- </template> -->

                    

                </v-toolbar>
            </template>
            <template v-slot:item.actions="{ item, index }">
                <v-icon
                    small
                    class="mr-2" color="light"
                    @click="editItem(item)"
                >
                    $edit
                </v-icon>
                <v-icon
                    small color="orange"
                    @click="deleteItem(item, index)"
                >
                    $minus
                </v-icon>
            </template>
            </v-data-table>

        </v-card-actions>

    </v-card> 
    
    </v-layout>
</template>
<script>

import draggable from 'vuedraggable'
const cloneDeep = require("lodash.clonedeep");
import FileSelect  from '@/components/Framework/Mods/FileSelect.vue' ;
import Dir from '@/components/Framework/Mods/Dir.vue';
import { readCsv } from '../../../../../shared/IO';
const path = require("path")   

export default {
    name: 'multi-select',
    components: {
        draggable,
        FileSelect,
        Dir
    },
    computed: {
        length(){
            return this.source.length
        },
        defaultItem(){
            let item = {}
            if (this.headers){
                this.headers.forEach((d)=>{
                    item[d] = null
                })
                
            }
            return item
        },
        headers(){
            if (this.defaultHeaders){
                return this.defaultHeaders
            }
            else if (this.source && this.variable.header){
                let tt = this.variable.header.map((d,i)=>{
                    return {
                        text: d,
                        value: d,
                        index: i,
                        sortable: true
                    }
                })
                return [{
                    text: "Actions",
                    value: "actions"
                }, ...tt ]
            } else {
                return []
            }
        }
    },
    watch: {
      dialog (val) {
        // val || this.close()
        if (this.variable && this.variable.define_columns){
            for (let [key,value] of Object.entries(this.variable.define_columns)){
                if (!this.editedItem[key]){
                    if (typeof value == 'object' && !this.custom[key]  )
                    {
                        if (Array.isArray( value.options) || Array.isArray( value )){
                            this.editedItem[key] =  value.options[0]
                        } 
                    } else {
                        if (typeof value == "string" || typeof value == 'boolean' || !value){
                            this.editedItem[key] = value
                        }
                    }
                }
            }

        }
      },
      defaultHeaders(newValue, oldValue){
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    //   source: {
        //   deep: true,
        //   handler(newValue){
        //       this.values = newValue
        //   }

    //   },
    },
    methods: {
        async importCsv(event){
            if (event){
                try{
                    let data = await readCsv(event, ",", true)
                    if (data){ 
                        if (this.variable.samplesheet && this.variable.samplesheet.define_columns){
                            data = data.map((d)=>{
                                for( let [key, val] of Object.entries(this.variable.samplesheet.define_columns)){
                                    if (d[key] &&  ['file', 'dir', 'directory'].indexOf(val.element)> -1 && !path.isAbsolute(d[key])){
                                        d[key] = path.join(path.dirname(event), d[key])
                                    }
                                }
                                return d
                            })
                            
                        }
                        this.$emit("updateValue", data);
                    } else {
                        this.$swal.fire({
                            position: 'center',
                            icon: 'error',
                            showConfirmButton:true,
                            title:  `Failed to read CSV`,
                            text: "Check headers and that the file is not empty or full of hidden characters"
                        })
                    }
                } catch (err){
                    this.logger.error(`${err},"failed to read csv"`)
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title:   `Failed to read CSV`,
                        text: err
                    })
                }

            }
        },  
        discerntype(value){
            let variable = this.variable
            let returnable = {
                type: ["string"], 
                element: ['string'],
                custom: false
            }
            if (variable.define_columns && variable.define_columns[value]){
                let defined = variable.define_columns[value]
                if (typeof defined == "object"){
                    returnable.custom = defined.custom
                    returnable.options = defined.options
                    returnable.element = ( defined.element ? defined.element : "string")
                    returnable.type = (defined.element ? defined.element : "string")
                    if (!Array.isArray(returnable.type)){
                        returnable.type = [returnable.type]
                    }
                    if (!Array.isArray(returnable.element)){
                        returnable.element = [returnable.element]
                    }
                    if (returnable.options){
                        returnable.type = "select"
                    }
                } 
            } 
            return returnable
        },  
        addDropFile(e,key) { 
            this.$set(this.editedItem, key, e.dataTransfer.files[0])
        },
        updateValue(value, option, variable, name, var_name){
            let src = value
            this.editedItem[name] = value
            this.$set(this.editedItem, name, value)
        },
        addDropFiles(e, key) {
            this.editedItem[key] = e.dataTransfer.files[0].path
            this.$set(this.editedItem, key, e.dataTransfer.files[0].path)
        },
        save () {
            const $this = this;
            this.editedItem.index = this.editedIndex
            let newItem = cloneDeep(this.editedItem)  
            for (let[key, value] of Object.entries(this.editedItem) ){
                if (value instanceof File ){
                    if (value.path == ""){
                        newItem[key] = value.name
                    } else {
                        newItem[key] = value.path
                    }
                }  
                if (this.savedAll[key]){
                    $this.source.map((d,i)=>{
                        $this.source[i][key]  = newItem[key]
                    })
                }
                if (newItem.index >-1){
                    $this.source[$this.editedIndex][key] = newItem[key]
                } 
                
            }
            if (this.editedIndex == -1){
                this.source.push(newItem)
            }
            this.close()
        },
        close () {
            this.dialog = false
            this.$nextTick(() => {
                this.editedItem = Object.assign({}, this.defaultItem)
                this.editedIndex = -1
            })
        },
        closeDelete () {
            this.dialogDelete = false
            this.$nextTick(() => {
            this.editedItem = Object.assign({}, this.defaultItem)
            this.editedIndex = -1
            })
        },
        check_defined(va){
            return this.variable.define_columns && this.variable.define_columns[va]
        },
        editItem (item) {
            this.editedIndex = this.source.indexOf(item)
            this.dialog = true
            console.log(item,"<<<<<", this.source, this.variable)
            // let newItem = cloneDeep(item)
            // for (let[name, value] of Object.entries(item) ){
            //     console.log(name)
            //     if (this.variable && this.variable.define_columns[name] && typeof value == 'string' && this.variable.define_columns && this.variable.define_columns[name] == 'file'){
            //         var file = new File([value], value, {
            //             type: "text/plain",
            //         });
            //         newItem[name] = file
            //     } 

            // }
            // this.editedItem = Object.assign({}, newItem)
            this.dialog = true
        },

        deleteItem (item, index) {
            this.editedIndex = this.source.splice(index, 1)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
        addManifestRow(index){
            let emptyRow  = {}
            let keys = this.variable.header
            keys.forEach((key)=>{
                emptyRow[key] = null
            })
            this.source.splice(index, 0, emptyRow)
        },
        rmManifestRow(index){
            this.source.splice(index, 1)
        },
        changeID(val, index, index2){
            this.$set(this.source[index], index2, val)
        },
        moveUpRow(index){
            const tmp =  this.source[index]
            this.$set(this.source, index ,this.source[index-1] )
            this.$set(this.source, index-1, tmp)
        },
    },
    props: ['source', 'status', 'service', "variable", "defaultHeaders", 'title'],
    data (){
        return {
            values: [],
            csv: {},
            csvSource: null,
            savedAll: {},
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            custom: {},
            mark: {},
            dialogDelete: false,
        }
    },
    mounted(){
    }, 

    
};
</script>

<style>
</style>