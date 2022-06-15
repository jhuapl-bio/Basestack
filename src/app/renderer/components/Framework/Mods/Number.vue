<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="number" > 
  	<v-text-field
        v-model="value"
        type="number" 
        :hint="(variable.hint ? variable.hint : '' )"
    >
    </v-text-field>
    
  </div>
</template>

<script>

export default {
	name: 'number',
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
	props: ['source', 'status', 'service', 'variable'],
    mounted(){
        this.value = this.source
    },
    watch: {
        value(newValue, oldValue){
            this.$emit("updateValue", newValue )
        },
        source(newValue){
          if (!newValue){
            this.value = null
          } 
        }
    }
    
};
</script>

<style>
</style>