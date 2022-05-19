<template>
  <v-card id="list-params"   v-if="items && items.length  > 0">
    <v-toolbar
        dark dense class="elevation-6" style="width: 100%"
    >
        <v-toolbar-title  >{{ ( title ? title : 'Inputs' )  }}</v-toolbar-title>
        
        <v-spacer>
        </v-spacer>
    </v-toolbar>
    <v-snackbar
      v-model="showErrors" :timeout="-1"
      left shaped top vertical 
    >
      There are one or more errors:
      <template v-slot:action="{ attrs }">
        <v-btn
          color="pink"
          text
          v-bind="attrs"
          @click="showErrors = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
    {{typeof items}}
    <v-list height="70vh" class="scroll fill-height fill-width"  two-line v-if="items&&items.length > 0">
        
        <v-list-item  v-for="(item, key) in items.filter((d)=>{
            return !d.hidden
        })"     
        class="elevation-6 "
        :key="`listVariables-${key}`">
            
            <v-list-item-content >
                <v-list-item-title v-text="item.label + '→${' + item.name  + '}' "></v-list-item-title>
                
                <v-list-item-subtitle class="text-wrap" v-if="item.hint">
                    {{item.hint}}
                </v-list-item-subtitle>
                
                <v-container v-if="item.options"    width="10px">
                    <v-select
                        v-model="item.optionValue" 
                        :disabled="item.output"
                        class="text-caption"
                        :hint="`Select an item`"
                        @input="setOption($event,key, item)"
                        :items="item.options" 
                        style="width: 200px"
                        label="Select"
                        item-text="name"
                        persistent-hint
                        return-object
                        single-line
                    >
                        
                    </v-select>
                    <component
                        :is="factory[item.optionValue.element]"
                        v-if="item.optionValue && item.optionValue.element !== 'render' && item.optionValue.element"
                        :disabled="item.optionValue.output"
                        :source="items[key].source"
                        :variable="item.optionValue"
                        :hidden="item.optionValue.hidden"
                        @updateValidity="updateValidity(data)"
                        @updateValue="updateValue($event, false, item, key, item.name)"
                        >
                    </component>
                    
                    
                </v-container>
                <v-container v-else>
                    <component
                        :is="factory[item.element]"
                        :disabled="item.output"
                        :source="item.source"
                        :variable="item"
                        :hidden="item.hidden"
                        @updateValidity="updateValidity(data)"
                        @updateValue="updateValue($event, false, item, key, item.name)"
                        >
                    </component>
                    
                    
                     
                                   
                </v-container>
                
                <v-alert class="text-caption" v-if="item && item.warning" 
                    dense 
                    text
                    border="left"
                    type="info"
                    elevation="2"
                
                >
                    <v-icon  small >$exclamation
                    </v-icon>
                    {{item.warning}}
                </v-alert> 
                
                    
            </v-list-item-content>
            <v-list-item-action class="">
                <v-list-item-action-text>
                    <Validation 
                        :item="item"
                        :validations="item.validations"
                        :value="item.source"
                    >
                    </Validation>
                    
                </v-list-item-action-text>
                
                <v-tooltip bottom v-if="(item.element == 'file' || item.element == 'dir') &&  ( item && item.source ) || (item && item.options && (item.option >= 0) && item.options[item.option].source )">
                    <template v-slot:activator="{ on }">
                        <v-icon small v-on="on"  @click="electronOpenDir(item, $event)" class="configure" color="primary">$archive
                        </v-icon>
                    </template>
                    {{  ( item.source ? item.source : item.options[item.option].source  )     }}
                </v-tooltip> 
                <v-tooltip bottom v-if="item.custom">
                    <template v-slot:activator="{ on }">
                        <v-icon v-on="on" @click="removeCustomVariable(item.name)" class="configure" small>$trash-alt
                        </v-icon>
                    </template>
                    Remove Custom Variable
                </v-tooltip>
                
            </v-list-item-action>
            
                 
        </v-list-item>
        
            

    </v-list>
    
  </v-card>
     

</template>
<script>
import Number from '@/components/Framework/Mods/Number.vue';
import String from '@/components/Framework/Mods/String.vue';
import Checkbox from '@/components/Framework/Mods/Checkbox.vue';
import Exists from '@/components/Framework/Mods/Exists.vue';
import File from '@/components/Framework/Mods/File.vue';
import MultiFile from '@/components/Framework/Mods/MultiFile.vue';
import Dir from '@/components/Framework/Mods/Dir.vue';
import List  from '@/components/Framework/Mods/List.vue';
import ConfigurationFile from '@/components/Framework/Mods/ConfigurationFile.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import Multiselect from 'vue-multiselect'
import {  reactive, computed } from '@vue/composition-api'
import Validation from '@/components/Framework/Mods/Validation.vue';


const path  = require("path")
export default {
	name: 'multi-select',
    components: {
        File,
        MultiFile,
        Validation,
        Number,
        Dir,
        String,
        Exists,
        Checkbox,
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
      v(newValue){
      },
      items: {
          deep:true,
          handler(newValue){
          }
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
	methods: {
        removeCustomVariable(variable){
            this.$emit("removeCustomVariable", variable)
        },
        setOption(event, index, item){            
            let idx = item.options.findIndex(data => data.name == event.name)
            item.option = idx
                if (typeof item.optionValue == 'string'){
                    item.source = item.optionValue
                } else {
                    item.source = item.optionValue.source
                    
                }
            this.$emit("updateValue", { src: item.source, option: false, variable: item.name }   )
        },
        electronOpenDir(key){
            const $this = this
            if (key.options ){
                key = key.options[key.option]
            }
            if (key.element == 'file' || !key.element){
                this.$electron.shell.openPath(path.dirname(key.source))
            } else {
                this.$electron.shell.openPath(key.source)
            }
		}, 
        
        updateValue(value, option, variable, name, var_name){
            let src = value
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
            showErrors: false,
            errors: {},
            dialog: false,
            shippingAddress: null,
            editedIndex: -1,
            editedItem: {},
            dialogDelete: false,
            intervalProgress: false,
            progressChecking: false,
            intervalChecking:false,
            factory: {

                'string': "String",
                "number": "Number",
                "checkbox": "Checkbox",
                "exists": "Exists",
                "file": "File",
                "files": "MultiFile",
                "render": "Render",
                "configuration-file": "ConfigurationFile",
                "json": "ConfigurationFile",
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
