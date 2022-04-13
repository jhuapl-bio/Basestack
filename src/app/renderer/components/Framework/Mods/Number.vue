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
    <v-text-field
        v-model="variable.target"
        type="number" disabled 
    > 
    </v-text-field>
    <!-- <v-tooltip bottom v-if="!$v.value.required">
        <template v-slot:activator="{ on }">
          <v-icon class="mt-5 ml-1" v-on="on" small color="warning lighten-1" >$exclamation-triangle
          </v-icon>
        </template>
        Valid File required
    </v-tooltip> -->
  </div>
</template>

<script>
// import { required, requiredIf, minLength, between, helpers } from 'vuelidate/lib/validators'
const optional = (optional) => (value) => {  return !optional && !value }

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