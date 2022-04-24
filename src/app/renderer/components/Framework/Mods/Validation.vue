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
      <v-tooltip bottom v-if="item.optional || (item.optionValue && item.optionValue.optional)" >
            <template v-slot:activator="{ on }">
                <v-icon small  v-on="on" class="configure" color="grey">$slash
                </v-icon>
            </template>
            Optional Input
        </v-tooltip>
        
        <v-tooltip bottom v-else-if="( !v$.$errors || v$.$errors.length == 0 ) && ( item.source || (item.optionValue && !item.optionValue.element ) )">
            <template v-slot:activator="{ on }">
                <v-icon  v-on="on" small    class="configure" color="green">$check-circle
                </v-icon>
            </template>
            Valid input {{item.source}}
        </v-tooltip>
        <v-tooltip bottom v-else-if="( v$.$errors && v$.$errors.length > 0 )  "  >
            <template v-slot:activator="{ on }">
                <v-icon small   v-on="on" class="mr-1" color="warning">$exclamation-triangle
                </v-icon>
                <span class="my-1">Error</span>
            </template>
            <p v-for="error of v$.$errors"
            :key="error.$uid" class="text-caption" >
            {{error.$message}}
            </p>
        </v-tooltip>
        
  </div>
</template>

<script>

import { in_column } from "@/controllers/validation.js"
import useVuelidate from '@vuelidate/core'
import {  requiredIf,  helpers } from '@vuelidate/validators'

export default {
	name: 'validation',
    data() {
        return {
            test: "placeholder",
            errors: {},
            in_column: in_column,
        }
    },
    computed: {
        validations_error(){
            if (this.validations && this.validations.length > 0 ){
                let errors = ''
                this.validations.map((f)=>{
                    let returned = in_column(this.source)
                    if (f.error){
                        errors = `${errors} ${f.error}`
                    }
                })
                return ( errors != '' ? errors : null )
            } else {
                return false
            }
        },
    },
	methods: {
	
	},
    validations () {
        return {
            value: { 
                required: helpers.withMessage('This field cannot be empty', requiredIf((v)=>{
                    let item = this.item;
                    if (item.options){
                        
                        if (item.optional){
                            return false
                        } else {
                            return true
                        }
                    } else {
                        if (item.optional){
                            return false
                        } else {
                            return true
                        }
                    }
                    
                })),
                in_column: helpers.withAsync(
                    helpers.withMessage(( this.validations_error ? this.validations_error : 'Input must be correct, see hints or documentation' ), in_column( this.item ))
                ),
            },
        }
    },
    setup: () => ({ v$: useVuelidate() }),
	props: [ 'validations', 'value' ,'item' ],
    mounted(){
        this.v$.value.$touch()
    },
    watch: {
        value(newValue){
            this.v$.value.$touch()
            
        }
    }
    
};
</script>

<style>
</style>