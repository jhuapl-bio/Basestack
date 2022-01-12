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
  	<v-data-table
        v-if="progresses"
        small
        :headers="headers"
        :items="progresses"
        :items-per-page="5"
        class="elevation-1"					        
    >	
        <template v-slot:item.status="{ item }">
            <v-icon 
                v-if="item.type == 'files'"
                small> {{item.status.complete}} / {{item.status.total}}
            </v-icon>
            <v-icon 
                v-else-if="item.status.total <= item.status.complete" 
                small>
                $times-circle
            </v-icon>
            <v-icon 
                v-else
                small>
                {{item.status.complete}} / {{item.status.total}}
            </v-icon>
        </template>
        <!-- <template  v-slot:cell(status)="row">
            <span v-if="row.item.type == 'files'" 
                style="margin:auto; text-align: center"
            >
               {{row.value.complete}}
            </span>	
            <font-awesome-icon :class="[ 'text-success' ]" 
                v-else-if="row.value.total <= row.value.complete" 
                icon="check" 
            />
            
            <span v-else-if="row.value.total > row.value.complete && running" 
                style="margin:auto; text-align: center"
            >
                <half-circle-spinner
                        :animation-duration="4000"
                        :size="10"
                        v-tooltip="{
                        placement: 'top',
                        classes: ['info'],
                        trigger: 'hover',
                        targetClasses: ['it-has-a-tooltip'],
                        }"
                        style="margin: auto"
                        :color="'#2b57b9'"
                    />

            </span>	
            <font-awesome-icon :class="[ 'text-warning' ]" 
                v-else
                icon="stop-circle" 
            />
        </template>
        <template  v-slot:cell(path)="cell">
            {{cell.value}}
            <font-awesome-icon class="configure"  @click="open(cell.value, $event)" icon="archive" size="sm"  />

        </template> -->
        
    </v-data-table>
  </div>
</template>

<script>
import {HalfCircleSpinner} from 'epic-spinners'

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
                    text: 'Path',
                    align: 'start',
                    sortable: false,
                    value: 'path',
                },
                { text: 'Type', value: 'type' },
                { text: 'Status', value: 'status' },

            ]
        }
    },
    computed: {
        
    },
	methods: {
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