<template>
  <div id="list-params" >
    <v-data-table
        small 
        :headers="headers"
        :items="items" 
        v-if="items && items.length  > 0"
        dense
        :items-per-page="10"
        :footer-props="{
        showFirstLastPage: true,
            prevIcon: '$arrow-alt-circle-left',
            nextIcon: '$arrow-alt-circle-right',
            firstIcon: '$step-backward',
            lastIcon: '$step-forward',
        }"
        class="elevation-6 "					        
    >	
        <template v-slot:top>
            <v-toolbar
                dark dense 
            >
                <v-toolbar-title  >{{ ( title ? title : 'Inputs' )  }}</v-toolbar-title>
                
            </v-toolbar>
        </template>
        <template v-slot:item.label="{ item }">
            <v-tooltip  bottom>
                <template v-slot:activator="{ on }">
                        <v-icon v-if="item && item.hint " v-on="on" small >$question-circle
                        </v-icon>
                </template>
                {{item.hint}}
            </v-tooltip>
            {{item.label}}
            <v-btn icon color="primary" v-if=" ( item && item.source ) || (item && item.options && (item.option >= 0) && item.options[item.option].source )" @click="electronOpenDir(item, $event)">
                <v-icon small >$archive
                </v-icon>
            </v-btn>
            
        </template>
        
        <template v-slot:item.source="{ item,index }">
             <div v-if="item.options"  class="entry from-group">
                <v-select
                    v-model="item.optionValue" 
                    :disabled="item.output"
                    :hint="`Select an item`"
                    @input="setOption($event,index, item)"
                    :items="item.options" 
                    label="Select"
                    item-text="name"
                    persistent-hint
                    return-object
                    single-line
                >
                   
                </v-select>
                <component
                    :is="factory[item.optionValue.element]"
                    v-if="item.element !== 'render'"
                    :disabled="item.optionValue.output"
                    :source="item.optionValue"
                    :variable="item.optionValue"
                    :hidden="item.optionValue.hidden"
                    @updateValue="updateValue($event, false, item, index, item.name)"
                    >
                </component>
             </div>
            <div v-else >
                <component
                    :is="factory[item.element]"
                    v-if="item.element !== 'render'"
                    :disabled="item.output"
                    :source="item"
                    :variable="item"
                    :hidden="item.hidden"
                    @updateValue="updateValue($event, false, item, index, item.name)"
                    >
                </component>
                <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                        <v-btn icon-and-text v-on="on" class="mt-5 mb-5 ml-5 mr-5 configure" @click="open_link(item, $event)" color="info" large>
                            <v-icon align="end"  >$external-link-alt
                            </v-icon>
                            Click Me! 
                        </v-btn>
                    </template>
                    View Visualization in Browser. Ensure that the service is running first!
                </v-tooltip>  
            </div>
        </template>
        <template v-slot:item.bind="{ item }">
            <v-list  dense v-if="item.bind">
                <v-list-item
                >
                    <v-list-item-content>
                        <v-text-field
                            v-model="item.bind.from"
                            label="From" 
                        >
                        </v-text-field>
                    </v-list-item-content>
                </v-list-item>
                <v-list-item
                >
                    <v-list-item-content>
                        <v-text-field
                            v-model="item.bind.to"
                            label="To"
                        >
                        </v-text-field>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </template>
        <template v-slot:item.actions="{ item, index }">
            <div v-if="item.custom || !item.label">
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
            </div>
        </template>
       
        
    </v-data-table>
   
  </div>
</template>
<script>

import String from '@/components/Framework/Mods/String.vue';
import File from '@/components/Framework/Mods/File.vue';
import Dir from '@/components/Framework/Mods/Dir.vue';
import List  from '@/components/Framework/Mods/List.vue';
import ConfigurationFile from '@/components/Framework/Mods/ConfigurationFile.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import Multiselect from 'vue-multiselect'
const path  = require("path")
export default {
	name: 'multi-select',
    components: {
        File,
        Dir,
        String,
        Render,
        List,
        ConfigurationFile,
        Multiselect,
    },
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
            } else {
                return []
            }
        }
    },
    watch: {
      dialog (val) {
        val || this.close()
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
	methods: {
        setOption(event, index, item){            
            let idx = item.options.findIndex(data => data.name == event.name)
            item.option = idx
            if (!event.source){
                item.source = item.optionValue
            }
        },
        open_link (link, e) {
			e.stopPropagation()
			// this.$electron.shell.openExternal(this.getUrl(link.to))
            // console.log(this.$electron.dialog.open(this.getUrl(link.to)))
            window.open(this.getUrl(link), "browser", 'top=500,left=200,frame=true,nodeIntegration=no')
      	},
        electronOpenDir(key){
            const $this = this
            if (key.options ){
                key = key.options[key.option]
            }
            if (key.element == 'file'){
                this.$electron.shell.openPath(path.dirname(key.source))
            } else {
                this.$electron.shell.openPath(key.source)
            }
		}, 
        getUrl(link){ 
        //   let url  = `http://localhost:8080`
            let url  = `http://localhost:${link.bind.to}`
            if (link.suburl){
                url = url +link.suburl
            }
            return url
        },
        updateValue(value, option, variable, name, var_name){
            let src = value
            if (option){
                variable.option = src
            } else {
                variable.source  = src
            }
            this.intervalProgress = false
            this.$emit("updateValue", { src: src, option: option, variable: var_name }   )
        },
        save () {
            this.editedItem.index = this.editedIndex
            if (this.editedIndex > -1) {
                Object.assign(this.items[this.editedIndex], this.editedItem)
            } else {
                this.items.push(this.editedItem)
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
            this.editedIndex = this.items.indexOf(item)
            this.editedItem = Object.assign({}, item)
            this.dialog = true
        },

        deleteItem (item, index) {
            this.editedIndex = this.items.splice(index, 1)
            this.editedItem = Object.assign({}, item)
            this.dialogDelete = true
        },
		addManifestRow(index){
            let emptyRow  = {}
            let keys = this.defaultHeaders
            keys.forEach((key)=>{
                emptyRow[key] = null
            })
			this.items.splice(index, 0, emptyRow)
            // this.$set( this.values, this.values)
		},
		rmManifestRow(index){
			this.items.splice(index, 1)
		},
        changeID(val, index, index2){
			this.$set(this.items[index], index2, val)
		},
		moveUpRow(index){
			const tmp =  this.values[index]
			this.$set(this.items, index ,this.items[index-1] )
			this.$set(this.items, index-1, tmp)
		},
	},
    props: ['items', "defaultHeaders", 'title', "service", "job"],
    data (){
        return {
            values: [],
            dialog: false,
            editedIndex: -1,
            editedItem: {},
            dialogDelete: false,
            intervalProgress: false,
            progressChecking: false,
            intervalChecking:false,
            factory: {

                'string': "String",
                "file": "File",
                "render": "Render",
                "configuration-file": "ConfigurationFile",
                "dir": "Dir",
                "list": "List"

            },
        }
    },
    mounted(){
    }, 

    
};
</script>

<style>
</style>