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
            <font-awesome-icon :class="[ 'text-warning' ]" 
                v-else
                icon="stop-circle" 
            />
        </template>
        
    </b-table>
  </div>
</template>

<script>
export default {
	name: 'progresses',
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
	props: ['progresses'],
    mounted(){
    },
    watch: {
        
    }
    
};
</script>

<style>
</style>