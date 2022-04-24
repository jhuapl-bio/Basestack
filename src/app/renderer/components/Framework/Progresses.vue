<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card id="progresses" >
    <v-toolbar
      dark dense class="elevation-6" style="width: 100%"
    >
      <v-toolbar-title>Output Locations</v-toolbar-title>
      <v-spacer></v-spacer>
      <div v-if="status && status.running" >
        <looping-rhombuses-spinner 
          :animation-duration="3000"
            :size="20" class="mr-2"
            :color="'white'"
        >
        </looping-rhombuses-spinner>
      </div>
      <v-spacer>
      </v-spacer>
      <v-btn icon-and-text color="orange darken-2" v-if="progresses && progresses.length > 0" @click="deleteOutputs()">
        <v-icon
          small
        > $trash-alt
        </v-icon>
        Delete Outputs
      </v-btn>
    </v-toolbar>
  	<v-data-table
        v-if="progresses && progresses.length > 0"
        small
        :headers="defaultHeaders"
        :items="progresses"
        :items-per-page="5"
        class="elevation-1"					        
    >	
        <template v-slot:item.access="{ item }">
            <v-tooltip bottom v-if="item.element == 'render'">
                <template v-slot:activator="{ on }">
                    <v-btn icon-and-text v-on="on" class="configure mt-5 mb-5 mr-5 ml-5" @click="open_link(item, $event)" color="info" medium>
                        <v-icon   >$external-link-alt
                        </v-icon>
                        Click Me! 
                    </v-btn>
                </template>
                View Visualization in Browser. Ensure that the service is running first!
            </v-tooltip> 
            <v-tooltip bottom v-if="item.source"> 
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon  @click="determineOpen(item)">
                  <v-icon 
                    class="" color="primary" 
                    medium>$archive
                  </v-icon>
                </v-btn>
                
              </template>
              {{item.source}}
            </v-tooltip>
            <v-tooltip bottom v-if="item.openSelf && item.source">
              <template v-slot:activator="{ on }">
                <v-btn v-on="on" icon  @click="determineOpen(item, true)">
                  <v-icon 
                    class="" color="primary" 
                    medium>$file
                  </v-icon>
                </v-btn>
              </template>
              {{item.source}}
            </v-tooltip>
        </template>
        <template v-slot:item.label="{ item }">
          {{item.label}}
          <v-tooltip top v-if="item.hint">
            <template v-slot:activator="{ on }">
              <v-icon 
                v-on="on" class="configure" color="info" 
                x-small>$question-circle
              </v-icon>
            </template>
            {{item.hint}} 
          </v-tooltip>
            
        </template>
        <template v-slot:item.remove="{ item, index }">
            <v-icon 
                @click="deleteOutputs(index)"
                v-if="(item.source && !Array.isArray(item.source)) || (Array.isArray(item.source) && item.source.length > 0)"
                small> $trash-alt
            </v-icon>
        </template>
        <template v-slot:item.element="{ item }">
            <v-icon 
                v-if="item.type == 'files'"
                small> {{item.complete}} {{ ( item.total ? ` / ${item.total}` : '' ) }}
            </v-icon>
            <v-icon 
                v-else-if="item.total > item.complete" 
                small>
                $times-circle             

            </v-icon>
            <v-icon 
                v-else
                small> 
                {{item.complete}} {{ ( item.total ? ` / ${1}` : '' ) }}
            </v-icon>
        </template>
       
        
    </v-data-table>
  </v-card>
</template>

<script>
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
import FileService from '@/services/File-service.js'


const path = require("path")
export default {
	name: 'progresses',
    components: {
        LoopingRhombusesSpinner
    },
    data() {
        return {
            value: null,
            test: "placeholder", 
            
           
        }
    },
    computed: {
        
    },
	methods: {
        open_link (link, e) {
          e.stopPropagation()
          window.open(this.getUrl(link), "browser", 'top=500,left=200,frame=true,nodeIntegration=no')
      	},
        getUrl(link){ 
            let url  = `http://localhost:${link.bind.to}`
            if (link.suburl){
                url = url +link.suburl
            }
            return url
        },
        determineOpen(item, self){
          if (item.element != 'file'){
            if (typeof item.source =='string'){
                this.$electron.shell.openPath(path.dirname(item.source))
            } else {
              if (item.path){
                this.$electron.shell.openPath(item.path)
              } else {
                this.$electron.shell.openPath(path.dirname(item.source[0]))
              }
            }
          } else{
            if (self){
              this.$electron.shell.openPath(item.source)
            } else {
              this.$electron.shell.openPath(path.dirname(item.source))
            }
          }
        },
        deleteOutputs(outputs){
          FileService.deleteOutputs({
              idx: outputs,
              catalog: this.catalog,
              module: this.module, 
              procedure: this.procedure
          }).then((response2)=>{
              this.$swal({
                  title: "Deletion of outputs completed!",
                  icon: 'success',
                  showConfirmButton: true,
                  allowOutsideClick: true
              });
              this.stagedRemote = null
          }).catch((err)=>{
              this.$swal.fire({
                  position: 'center',
                  icon: 'error',
                  showConfirmButton:true,
                  title: err.response.data.message
              })
          }) 
        },
        open (link) {
          try{        
            this.$electron.shell.openPath(link)
          } catch(err){ 
            this.$swal.fire({ 
              position: 'center',
              icon: 'error',
              showConfirmButton:true,
                      title:  "Could not open the path: "+link
            })
          }
        },
	},
	props: ['defaultHeaders', 'progresses', 'status', 'catalog', 'module', 'procedure'],
    mounted(){
    },
    watch: {
    }
    
};
</script>

<style>
</style>