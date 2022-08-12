<template>
  <v-layout id="list" >
        <v-tooltip bottom v-if="length <= 0" >
            <template v-slot:activator="{ on }">
                <v-icon medium :if="length <= 0" class="mr-2" color="warning" v-on="on"  >$exclamation-triangle
                </v-icon>
            </template>
            List must be more than 1 entry
        </v-tooltip>  
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
            class="elevation-1"					        
        >	
            <template v-slot:top>
                <v-toolbar
                    flat
                >
                    <v-toolbar-title>{{ ( title ? title : 'List Table' )  }}</v-toolbar-title>
                    <v-divider
                        class="mx-4"
                        inset
                        vertical
                    ></v-divider>
                    <v-spacer></v-spacer>
                    <v-dialog
                        v-model="dialog"
                        max-width="500px"
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
                                    <v-col
                                        cols="12"
                                    >
                                    
                                        <v-container v-for="head in headers" :key="head.value + head.index">
                                            <div @drop.prevent="addDropFile" @dragover.prevent  v-if="variable.define_columns && variable.define_columns[head.value] && head.value !== 'actions'">
                                                    <v-file-input 
                                                        v-model="editedItem[head.value]" 
                                                        :label="head.text" counter show-size overlap
                                                    >
                                                        <template v-slot:selection="{ text }">
                                                            <v-chip
                                                                small
                                                                label
                                                                color="primary"
                                                            >
                                                                {{ text }}
                                                            </v-chip>
                                                        </template>
                                                        <template v-slot:append-outer>
                                                            <v-icon  v-if="editedItem[head.value]" class="text--caption configure" @click="editedItem[head.value] = null" color="grey" small>$times-circle
                                                            </v-icon>
                                                        </template>
                                                    
                                                    </v-file-input>
                                                    <v-subheader v-if="editedItem[head.value]">{{editedItem[head.value].name}}</v-subheader>
                                            </div>
                                            <v-text-field v-else-if="head.value !== 'actions'"
                                                v-model="editedItem[head.value]"
                                                :label="head.text"
                                            ></v-text-field>
                                        </v-container>
                                        
                                    </v-col>
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
  </v-layout>
</template>
<script>

import draggable from 'vuedraggable'
const cloneDeep = require("lodash.clonedeep");

export default {
	name: 'multi-select',
    components: {
        draggable
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
        addDropFile(e) { 
            this.value = e.dataTransfer.files[0]; 
            console.log(e)
        },
        save () {
            const $this = this;
            this.editedItem.index = this.editedIndex
            let newItem = cloneDeep(this.editedItem)  
            if (this.editedIndex > -1) {
                for (let[key, value] of Object.entries(this.editedItem) ){
                    if (value instanceof File ){
                        if (value.path == ""){
                            newItem[key] = value.name
                        } else {
                            newItem[key] = value.path
                        }
                    }  
                    $this.source[$this.editedIndex][key] = newItem[key]
                }
                
            } else {
                this.source.push(this.editedItem)
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
            let newItem = cloneDeep(item)
            for (let[name, value] of Object.entries(item) ){
                if (this.variable.define_columns[name] && typeof value == 'string'){
                    var file = new File([value], value, {
                        type: "text/plain",
                    });
                    newItem[name] = file
                } 

            }
            this.editedItem = Object.assign({}, newItem)
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
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            dialogDelete: false,
        }
    },
    mounted(){
        console.log(this.variable,"<<<<in list ")
    }, 

    
};
</script>

<style>
</style>