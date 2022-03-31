<template>
  <div id="list" >
    <!-- <v-tooltip >
        <template v-slot:activator="{ on }">
            <v-btn v-on:click="addManifestRow(0)"  v-on="on"
            class="pl-0 ml-0" small color="primary">
            <v-icon
                right class="mr-2"
                dark x-small
            >
                $plus
            </v-icon>Add
            </v-btn>
        </template>
        Add row to the list
    </v-tooltip> -->
    <v-data-table
        small
        :headers="headers"
        :items="source.source"
        :items-per-page="6"
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
                                    sm="6"
                                    md="4"

                                >
                                    <v-container v-for="head in headers" :key="head.value + head.index">
                                            <v-text-field v-if="head.value !== 'actions'"
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
                            color="blue-500 darken-1"
                            text
                            @click="close"
                        >
                            Cancel
                        </v-btn>
                        <v-btn
                            color="blue-500 darken-1"
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
                x-small
                class="mr-2" color="light"
                @click="editItem(item)"
            >
                $edit
            </v-icon>
            <v-icon
                x-small color="orange"
                @click="deleteItem(item, index)"
            >
                $minus
            </v-icon>
        </template>
       
        
    </v-data-table>
   
  </div>
</template>
<script>
export default {
	name: 'multi-select',
    computed: {
        
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
            else if (this.source && this.source.header){
                let tt = this.source.header.map((d,i)=>{
                    return {
                        text: d,
                        value: d,
                        index: i,
                        sortable: true
                    }
                })
                tt.push({
                    text: "Actions",
                    value: "actions"
                })
                return tt 
            } else {
                return []
            }
        }
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      defaultHeaders(newValue, oldValue){
          console.log(newValue)
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
      source: {
          deep: true,
          handler(newValue){
              console.log("source changed!!!!", newValue)
          }

      },
      values(newVal){
          console.log(newVal,)
          this.$emit("updateValue", newVal )
      }
    },
	methods: {
        save () {
            this.editedItem.index = this.editedIndex
            if (this.editedIndex > -1) {
                Object.assign(this.source.source[this.editedIndex], this.editedItem)
            } else {
                this.source.source.push(this.editedItem)
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
        editItem (item) {
            this.editedIndex = this.source.source.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item, index) {
            this.editedIndex = this.source.source.splice(index, 1)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
		addManifestRow(index){
            let emptyRow  = {}
            let keys = this.source.header
            keys.forEach((key)=>{
                emptyRow[key] = null
            })
			this.source.source.splice(index, 0, emptyRow)
            // this.$set( this.values, this.values)
		},
		rmManifestRow(index){
			this.source.source.splice(index, 1)
		},
        changeID(val, index, index2){
			this.$set(this.source.source[index], index2, val)
		},
		moveUpRow(index){
			const tmp =  this.source.source[index]
			this.$set(this.source.source, index ,this.source.source[index-1] )
			this.$set(this.source.source, index-1, tmp)
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
        console.log("mounted multiselect")
        console.log(this.defaultHeaders)
    }, 

    
};
</script>

<style>
</style>