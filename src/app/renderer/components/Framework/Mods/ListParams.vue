<template>
  <div id="list-params" >
    <v-data-table
        small
        :headers="headers"
        :items="items"
        :items-per-page="6"
        class="elevation-6"					        
    >	
        <template v-slot:top>
            <v-toolbar
                flat
            >
                <v-subheader>{{ ( title ? title : 'List Table' )  }}</v-subheader>
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
        <template v-slot:item.source="{ item, index }">
             <div v-if="item.options"  class="entry from-group">
                <!-- <multiselect 
                    v-model="item.option" 
                    :options="item.options.map((d,i)=>{ return i})" 
                    :searchable="false" 
                    @input="updateValue($event, true, item, index)"
                    :preselect-first="true"
                    :close-on-select="true" 
                    :allow-empty="false"
                    :show-labels="false" 
                    style="overflow-wrap:anywhere"
                    placeholder="Pick a db">
                        <template slot="singleLabel" 
                            slot-scope="{ option }">{{ item.options[option].name ? item.options[option].name : item.options[option] }}
                        </template>
                        <template slot="option" 
                            slot-scope="{ option }">{{ item.options[option].name ? item.options[option].name : item.options[option] }}
                        </template>
                </multiselect> -->
                <v-select
                    v-model="item.option"
                    :hint="`Select an item`"
                    @input="updateValue($event, true, item, index)"
                    :items="item.options.map((d,i)=>{ return i})" 
                    label="Select"
                    persistent-hint
                    return-object
                    single-line
                >
                    <template v-slot:item="{ item }"
                        >{{  items[index].options[item].name ? items[index].options[item].name : item.options[option] }}
                    </template>
                    <template v-slot:selection="{ item}"
                        >{{  items[index].options[item].name ? items[index].options[item].name : item.options[option] }}
                    </template>
                </v-select>
             </div>
            <div v-else  class="entry from-group">
                <component
                    :is="factory[item.element]"
                    v-if="item.element !== 'render'"
                    :source="item"
                    :variable="item"
                    :hidden="item.hidden"
                    @updateValue="updateValue($event, false, item, index)"
                    >
                </component>
                <v-tooltip bottom v-else>
                    <template v-slot:activator="{ on }">
                    <v-icon align="end" v-on="on" class="configure" @click="open_link(item, $event)" color="info" x-small>$external-link-alt
                    </v-icon>
                    </template>
                    View in Browser
                </v-tooltip>  
            </div>
        </template>
        <template v-slot:item.bind="{ item, index }">
            <v-list  dense v-if="item.bind">
                <v-list-item
                >
                    <!-- <v-list-item-icon>
                        <v-icon x-small>$chevron-left</v-icon>
                    </v-list-item-icon> -->
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
                    <!-- <v-list-item-icon>
                        <v-icon x-small>$chevron-right</v-icon>
                    </v-list-item-icon> -->
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
      defaultHeaders(newValue, oldValue){
          console.log(newValue)
      },
      dialogDelete (val) {
        val || this.closeDelete()
      },
    },
	methods: {
        open_link (link, e) {
			e.stopPropagation()
			// this.$electron.shell.openExternal(this.getUrl(link.to))
            // console.log(this.$electron.dialog.open(this.getUrl(link.to)))
            window.open(this.getUrl(link), "browser", 'top=500,left=200,frame=true,nodeIntegration=no')
      	},
        getUrl(link){
        //   let url  = `http://localhost:8080`
            let url  = `http://localhost:${link.bind.to}`
            if (link.suburl){
                url = url +link.suburl
            }
            return url
        },
        updateValue(value, option, variable, name){
            let src = value
            console.log(value, option, variable)
            if (option){
                variable.option = src
            } else {
                variable.source  = src
            }
            const $this = this
            // try{
            //   FileService.updateCacheServiceVariable({
            //     service: this.name,
            //     token: (process.env.NODE_ENV == 'development' ? 'development' : this.$store.token),
            //     value: value, 
            //     target: (option  ? "option" : "source"),
            //     variable: name,
            //   })
            // } catch(err){
            //   console.error(err,"<<<<< error in caching update")
            // }
            try{
            let promises = []
            if (this.items){
                let reads = []
                for (let [key, f] of Object.entries($this.items)){
                if (f.read){
                    reads.push(f)
                }
                }
                if (variable && reads.length > 0){
                reads.forEach((variable)=>{
                    FileService.readDepVariable({
                    value: variable.read,
                    variable: variable, 
                    variables: $this.items
                    }).then((response)=>{
                    let data = response.data.data
                    if (variable.depends){
                        let key = variable.depends_key
                        variable.depends.map((d)=>{
                        data.forEach((row)=>{
                            if (row[key] == d){
                            if ($this.items[row[key]].option || $this.items[row[key]].option  == 0){
                                let index = $this.items[row[key]].options.map((e)=>{
                                return e 
                                }).indexOf(row.configuration)
                                $this.items[row[key]].option = index
                            } else {
                                $this.items[row[key]].source = row.configuration
                            }
                            }
                        })
                        })
                    }
                    variable.source = response.data.data
                    }).catch((err)=>{
                    console.log(err)
                    })
                    
                })
                }
            }
            
            } catch(err){
            // $this.logger.error(err)
            console.error(err)
            }

            if (!this.intervalProgress){
                try{
                    this.intervalProgress = true 
                    if ($this.service.progress){
                    if ($this.intervalProgress){
                        try{
                        clearInterval($this.intervalProgress)
                        } catch(err){
                        console.error(err)
                        }
                    }
                    if  ($this.progresses.filter((d)=>{return d != 1}).length > 1 ){
                        clearInterval($this.intervalProgress)
                    } 
                    else {
                        $this.progressChecking = false
                        $this.getServiceProgress()
                        $this.intervalProgress = setInterval(()=>{
                        if (!$this.progressChecking){
                            $this.getServiceProgress()
                        }
                        }, 3000)
                    }
                    }
                }
                catch (err){
                    console.error(err)
                } finally{
                    this.intervalProgress = false
                    this.$emit("updateValue", { src: src, name: $this.name, target: value }   )
                }
            }
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
            console.log(this.items,"<<<<<", item, index)
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
    props: ['items', "defaultHeaders", 'title', "service"],
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