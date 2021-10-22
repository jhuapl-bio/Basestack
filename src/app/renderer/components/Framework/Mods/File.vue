<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="file" >
  	<b-form-file 
        v-model="value"
    >
    </b-form-file>
  </div>
</template>

<script>
export default {
	name: 'file',
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
	props: ['source', 'status', 'service'],
  mounted(){
  },
  watch: {
        value(newValue, oldValue){
            console.log(newValue)
            this.$emit("updateValue", newValue.path)
        }
    }
    
};
</script>

<style>
</style>