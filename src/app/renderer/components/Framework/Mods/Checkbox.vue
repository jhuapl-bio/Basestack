<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="checkbox" > 
  	<v-checkbox
        v-model="value"
        :label="(variable.hint ? variable.hint : '' )"
        on-icon="$check-square"
        class="align-center justify-center text-xs-center" 
        off-icon="$square"
        color="primary"
    >
    </v-checkbox>
  </div>
</template>

<script>
export default {
	name: 'string',
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
        }
    }
    
};
</script>

<style>
</style>