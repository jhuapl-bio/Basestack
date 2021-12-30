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
            <font-awesome-icon :class="[ 'text-success' ]" 
                v-if="row.item.status == 1" 
                icon="check" 
            />
            <span v-else-if="running" 
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