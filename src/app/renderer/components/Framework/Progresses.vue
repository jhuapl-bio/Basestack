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
  	<b-table
        v-if="progresses"
        small
        id="statuses_table"
        class="formGroup-input"
        :items="progresses"
        sticky-header="700px"						        
    >	
        <template  v-slot:cell(status)="row">
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

        </template>
        
    </b-table>
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
            test: "placeholder"
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