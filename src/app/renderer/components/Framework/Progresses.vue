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
    <v-subheader>Output Locations</v-subheader>
  	<v-data-table
        v-if="progresses && progresses.length > 0"
        small
        :headers="headers"
        :items="progresses"
        :items-per-page="5"
        class="elevation-1"					        
    >	
      
        <template v-slot:item.label="{ item }">
          <v-tooltip bottom>
            <template v-slot:activator="{ on }">
              <v-icon 
                v-on="on" class="configure" color="primary" @click="determineOpen(item)"
                x-small>$archive
              </v-icon>
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
        <template v-slot:item.status="{ item }">
            <v-icon 
                v-if="item.type == 'files'"
                small> {{item.status.complete}} / {{item.status.total}}
            </v-icon>
            <v-icon 
                v-else-if="item.status.total > item.status.complete" 
                small>
                $times-circle             

            </v-icon>
            <v-icon 
                v-else
                small> 
                {{item.status.complete}} / {{item.status.total}}
            </v-icon>
        </template>
       
        
    </v-data-table>
  </div>
</template>

<script>
import {HalfCircleSpinner} from 'epic-spinners'
const path = require("path")
export default {
	name: 'progresses',
    components: {
        HalfCircleSpinner
    },
    data() {
        return {
            value: null,
            test: "placeholder",
            
            headers: [
               {
                    text: 'Label',
                    align: 'start',
                    sortable: false,
                    value: 'label',
                },
                { text: 'Type', value: 'type' },
                { text: 'Status', value: 'status' },

            ]
        }
    },
    computed: {
        
    },
	methods: {
        determineOpen(item){
          if (item.openSelf){
            this.open(item.path)
          } else{
            this.open(path.dirname(item.path))
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
	props: ['progresses', 'running'],
    mounted(){
    },
    watch: {
        
    }
    
};
</script>

<style>
</style>