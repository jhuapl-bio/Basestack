<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-layout id="exists" class="mt-2 " > 
  	
  </v-layout> 
</template>

<script>
import { required, requiredIf, minLength, between } from 'vuelidate/lib/validators'

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
    validations (){
        return{
            value: {
                required: requiredIf((value)=>{
                    return value && !this.variable.optional
                })
            },
        }
    }, 
    watch: {
        source: {
            deep: true,
            handler(newValue){
                this.value = newValue.source
                this.$set(this, 'value', newValue.source)
            }
        }
    },
	props: ['source', 'status', 'service', 'variable'],
    mounted(){
        this.value = this.source
    },
    
    
};
</script>

<style>
</style>