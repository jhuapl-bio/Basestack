<template>
  <v-card id="list-params"   v-if="items && items.length  > 0">
    <v-toolbar
        dark dense class="elevation-6" style="width: 100%"
    >
        <v-toolbar-title  >{{ ( title ? title : 'Inputs' )  }}</v-toolbar-title>
        <v-spacer>
        </v-spacer>
        <!-- <v-app-bar-nav-icon dense v-if="$v.items.$invalid" > 
            <v-btn small  dense @mouseover="showErrors = true"  @mouseout="showErrors = false">
                <v-icon color="red" small >$exclamation
                </v-icon>
            </v-btn>
                
        </v-app-bar-nav-icon> -->
    </v-toolbar>
    <v-snackbar
      v-model="showErrors" :timeout="-1"
      left shaped top vertical 
    >
      There are one or more errors:
      <div v-for="(v, index) in $v.items.$each" :key="`iter-${index}`">
        <small v-if="!v.source.required">Value for {{v.$model.label}} is required.</small>
        <small v-if="!v.in_column">Value for {{v.$model.label}} is not valid, check hints.</small>
      </div>
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
    <v-list height="70vh" class="scroll fill-height fill-width"  two-line >
        <v-list-item  v-for="(item, key) in items.filter((d)=>{
            return !d.hidden
        })"     
        class="elevation-6 mx-0 my-0 pb-0"
        :key="`listVariables-${key}`">
            <v-list-item-content >
                <v-list-item-title v-text="item.label"></v-list-item-title>
                <v-list-item-subtitle class="text-wrap" v-if="item.hint">
                    {{item.hint}}
                </v-list-item-subtitle>
                <v-alert class="text-caption"  
                    dense  dark type="error"
                    elevation="2" v-if="!in_column(item)"
                    text
                >
                    Invalid input
                </v-alert>
                <v-layout v-if="item.options"    width="1px">
                    <v-select
                        v-model="item.optionValue" 
                        :disabled="item.output"
                        class="text-caption"
                        :hint="`Select an item`"
                        @input="setOption($event,key, item)"
                        :items="item.options" 
                        style="width: 40px"
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
                        :source="item.optionValue"
                        :variable="item.optionValue"
                        :hidden="item.optionValue.hidden"
                        @updateValue="updateValue($event, false, item, key, item.name)"
                        >
                    </component>
                    
                    
                </v-layout>
                <v-layout v-else>
                    <component
                        :is="factory[item.element]"
                        :disabled="item.output"
                        :source="item"
                        :variable="item"
                        :hidden="item.hidden"
                        @updateValue="updateValue($event, false, item, key, item.name)"
                        >
                    </component>
                    
                    
                     
                                   
                </v-layout>
                
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
                    {{ ( item.optional || (item.optionValue && item.optionValue.optional) ? 'Optional ' : "Required " )  }}{{item.element}}

                    <v-tooltip bottom v-if="item.optional || (item.optionValue && item.optionValue.optional)" >
                        <template v-slot:activator="{ on }">
                            <v-icon small  v-on="on" class="" color="grey">$slash
                            </v-icon>
                        </template>
                        Optional Input
                    </v-tooltip>
                    
                    <v-tooltip bottom v-else-if="item.source || (item.optionValue && !item.optionValue.element  )">
                        <template v-slot:activator="{ on }">
                            <v-icon  v-on="on" small    class="" color="green">$check-circle
                            </v-icon>
                        </template>
                        Value exists 
                    </v-tooltip>
                    
                    <v-tooltip bottom v-else-if="( !item.source ) && !( item.optional) "  >
                        <template v-slot:activator="{ on }">
                            <v-icon small  v-on="on" class="" color="warning">$exclamation-triangle
                            </v-icon>
                        </template>
                        Must input value {{item.source}}
                    </v-tooltip>
                    
                </v-list-item-action-text>
                
                <v-tooltip bottom v-if="(item.element == 'file' || item.element == 'dir') &&  ( item && item.source ) || (item && item.options && (item.option >= 0) && item.options[item.option].source )">
                    <template v-slot:activator="{ on }">
                        <v-icon small v-on="on"  @click="electronOpenDir(item, $event)" class="configure" color="primary">$archive
                        </v-icon>
                    </template>
                    {{  ( item.source ? item.source : item.options[item.option].source  )     }}
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
import Dir from '@/components/Framework/Mods/Dir.vue';
import List  from '@/components/Framework/Mods/List.vue';
import ConfigurationFile from '@/components/Framework/Mods/ConfigurationFile.vue';
import Render from '@/components/Framework/Mods/Render.vue';
import Multiselect from 'vue-multiselect'
import {  reactive, computed } from '@vue/composition-api'

import useVuelidate from '@vuelidate/core'
import { required, email, requiredIf, minLength, between, helpers } from '@vuelidate/validators'
const optional = (optional) => (value) => {  console.log(optional, ",",value); return !optional && !value }
const in_column  = (value) => {
    let returnable = true
    if (value.validations){
        value.validations.forEach((validation)=>{
            if (validation.type == 'contains'){
                if (validation.target.type == 'column'){
                    console.log(validation)
                    let source = value.source.map((f)=>{
                        return f[validation.target.location]
                    })
                    let index = source.indexOf(validation.target.value)
                    if (index <= -1){
                        returnable = false
                    }
                } else {
                    let index = value.source.includes(validation.target.value)
                    if (index <= -1){
                        returnable = false
                    }
                }
            } else {
                returnable = true
            }
        })
        return returnable
    } else {
        return true
    }
}


const path  = require("path")
export default {
	name: 'multi-select',
    components: {
        File,
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
    setup: () => ({ $v: useVuelidate() }),
    validations (){      
        return{
            items: {
                required,
                // $each: {
                //     source: {
                //         in_column: in_column,
                //         required: requiredIf((value)=>{
                //             if (value.options){
                //                 if (value.optional){
                //                     return !true
                //                 } else {
                //                     let optionValue = value.optionValue
                //                     return !(value.option >= 0 && optionValue.source)
                //                 }
                //             } else {
                //                 if (value.optional){
                //                     return !true
                //                 } else {
                //                     if (!value.source){
                //                         console.log("exists")
                //                     }
                //                     return !value.source 
                //                 }
                //             }
                            
                //         })
                //     }
                // }
            }
        }
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
          console.log("newvalue", newValue)
      },
      items: {
          deep:true,
          handler(newValue){
              console.log("Items", newValue)
          }
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
	methods: {
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
            if (key.element == 'file'){
                this.$electron.shell.openPath(path.dirname(key.source))
            } else {
                this.$electron.shell.openPath(key.source)
            }
		}, 
        
        updateValue(value, option, variable, name, var_name){
            let src = value
            if (option){
                variable.option = src
                this.$set(variable, 'option', src)
            } else {
                variable.source  = src
                this.$set(variable, 'source', src)
            }
            this.$set(this.items, name, variable)
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
            firstName: '',
            lastName: '',
            contact: {
                email: ''
            },
            showErrors: false,
            dialog: false,
            shippingAddress: null,
            editedIndex: -1,
            in_column: in_column,
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

 <!-- <v-card height="70vh" class="scroll fill-height fill-width ">
    <v-expansion-panels dense multiple v-model="panel" >
        <v-expansion-panel  dense v-for="(item, key) in items.filter((d)=>{
            return !d.hidden
        })"     
        class="elevation-6 "
        :key="`listVariables-${key}`" >
                <v-expansion-panel-header >
                    <template v-slot:actions>
                        <v-icon small color="grey">
                        $chevron-up
                        </v-icon>
                    </template>
                    <v-card class="mr-4">
                        <v-card-title class="m">
                            {{item.label}}
                        </v-card-title>
                        <v-card-subtitle class="">
                            
                            {{ ( item.optional ? 'Optional ' : "Required " )  }}{{item.element}}
                            <v-tooltip bottom v-if="item.source || ( item.optionValue && item.optionValue.source)">
                                <template v-slot:activator="{ on }">
                                    <v-icon  v-on="on" small    class="" color="green">$check-circle
                                    </v-icon>
                                </template>
                                Value exists
                            </v-tooltip>
                            <v-tooltip bottom v-else-if="(!item.source || ( item.optionValue && !item.optionValue.source) ) && !( item.optional) "  >
                                <template v-slot:activator="{ on }">
                                    <v-icon small  v-on="on" class="" color="warning">$exclamation-triangle
                                    </v-icon>
                                </template>
                                Must input value
                            </v-tooltip>
                            <v-tooltip bottom v-if="(item.element == 'file' || item.element == 'dir') &&  ( item && item.source ) || (item && item.options && (item.option >= 0) && item.options[item.option].source )">
                                <template v-slot:activator="{ on }">
                                    <v-icon small v-on="on"  @click="electronOpenDir(item, $event)" class="configure" color="primary">$archive
                                    </v-icon>
                                </template>
                                {{  ( item.source ? item.source : item.options[item.option].source  )     }}
                            </v-tooltip> 
                        </v-card-subtitle>
                    </v-card>
                    
                    
                    
                    
                </v-expansion-panel-header>
                <v-expansion-panel-content dense>
                    <v-layout class=" mx-3" v-if="item.options"    width="10px">
                       
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
                                :source="item.options[item.option]"
                                :variable="item.optionValue"
                                :hidden="item.optionValue.hidden"
                                @updateValue="updateValue($event, false, item, key, item.name)"
                                >
                            </component>
                            
                            
                        </v-layout>
                        <v-layout class="mx-3" v-else>
                           
                            <component
                                :is="factory[item.element]"
                                v-if="item.element !== 'render'"
                                :disabled="item.output"
                                :source="item"
                                :variable="item"
                                :hidden="item.hidden"
                                @updateValue="updateValue($event, false, item, key, item.name)"
                                >
                            </component>
                            
                            <v-tooltip bottom v-else>
                                <template v-slot:activator="{ on }">
                                    <v-btn icon-and-text v-on="on" class="configure mt-5 mb-5 mr-5 ml-5" @click="open_link(item, $event)" color="info" large>
                                        <v-icon align="end"  >$external-link-alt
                                        </v-icon>
                                        Click Me! 
                                    </v-btn>
                                </template>
                                View Visualization in Browser. Ensure that the service is running first!
                            </v-tooltip>  
                                        
                        </v-layout>
                            
                    
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
                </v-expansion-panel-content>
            
                 
        </v-expansion-panel>
            

    </v-expansion-panels>
    </v-card> -->
