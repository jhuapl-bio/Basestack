<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="progresses" >
    <v-subheader></v-subheader>
    <v-toolbar
      dark dense
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
    </v-toolbar>
    
  	<v-data-table
        v-if="progresses && progresses.length > 0"
        small
        :headers="defaultHeaders"
        :items="progresses"
        :items-per-page="5"
        class="elevation-1"					        
    >	
      
        <template v-slot:item.label="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-btn v-on="on" icon v-if="item.source" @click="determineOpen(item)">
                <v-icon 
                  class="" color="primary" 
                  small>$archive
                </v-icon>
              </v-btn>
              {{item.label}}
            </template>
            {{item.path}}
          </v-tooltip>
          <v-tooltip top>
            <template v-slot:activator="{ on }">
              <v-icon 
                v-on="on" class="configure" color="info" 
                x-small>$question-circle
              </v-icon>
            </template>
            {{item.hint}} 
          </v-tooltip>
            
        </template>
        <template v-slot:item.element="{ item }">
            <v-icon 
                v-if="item.type == 'files'"
                small> {{item.complete}} / {{item.total}}
            </v-icon>
            <v-icon 
                v-else-if="item.total > item.complete" 
                small>
                $times-circle             

            </v-icon>
            <v-icon 
                v-else
                small> 
                {{item.complete}} / {{item.total}}
            </v-icon>
        </template>
       
        
    </v-data-table>
  </div>
</template>

<script>
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'


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
        determineOpen(item){
          console.log(item)
          if (item.element != 'file'){
            if (typeof item.source =='string'){
              this.open(path.dirname(item.source))
            } else {
              this.open(path.dirname(item.source[0]))
            }
          } else{
            this.open(path.dirname(item.source))
          }
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
	props: ['defaultHeaders', 'progresses', 'status'],
    mounted(){
    },
    watch: {
        
    }
    
};
</script>

<style>
</style>