

<template>
    <!-- Prevent default on submit of form  -->
    <v-dialog v-model="dialog" max-width="600px">
        <v-card>
            <v-card-title>
            <span class="text-h5">Add a new variable</span>
            </v-card-title>
        <v-card-text>
            <v-form @submit.prevent="onSubmit" class="px-4">
                <v-text-field v-bind="key" label="Key" />
                <v-text-field v-bind="label" label="Label" />
                <v-text-field v-bind="target" label="Target" />
                <v-switch v-bind="output" label="Output?" />
                <v-switch v-bind="required" label="Required" />
                <v-select :items="['string', 'number', 'list', 'file', 'files', 'static', 'checkbox']"  clearable v-bind="element" label="Element" />
                <v-btn color="primary" type="submit"> Submit </v-btn>
                <v-btn color="outline" class="ml-4" @click="resetForm()"> Reset </v-btn>
            </v-form>
        </v-card-text>
        
        </v-card>
    </v-dialog>
    <v-tooltip  
        top
    >
        <template #activator="{ on, attrs, props }">
            <!-- Set the icon to the right side -->

            <v-icon   style="float:right" color="red-lighten-1" v-bind="props"  class="" @click="dialog = true">mdi-plus</v-icon>
        </template>
        Add a new variable
    </v-tooltip>
</template>
  

<script lang="ts">
    import { useForm, useField } from 'vee-validate';
    import * as yup from 'yup';

    import { onMounted, ref, watch as W } from 'vue';
import { watch } from 'original-fs';

    export default {
        
        setup(props) {
            const dialog = ref(false)
            const schema = yup.object({
                key: yup.string()
                .required()
                .label('Key'),
                label: yup.string()
                // .required()
                .label('Label/Title'),
                target: yup.string()
                // .required()
                ,
                element: yup
                    .string()
                    .required()
                    .oneOf(['string', 'number', 'list', 'file', 'files', 'static', 'checkbox'])
                    .label('Element type'),
                output: yup
                    .boolean()
                    .label('Output?')
                    .oneOf([true, false], 'Is it an output file?'),
                required: yup
                    .boolean()
                    .label('Required?')
                    .oneOf([true, false], 'Is it required to have a value or not?'),
            });

            const { defineComponentBinds, handleSubmit, resetForm, setFieldValue } = useForm({
                validationSchema: schema,
                
            });
            
            // Refer to the docs for how to make advanced validation behaviors with dynamic configs
            // TODO: Add link
            const vuetifyConfig = (state) => {
                return {
                    props: {
                        'error-messages': state.errors,
                        'modelValue': state.value,
                    },
                };
            }
            //add variable to using window.electron and module reads it
            const addVariable = (obj: object) => {
                window.electronAPI.addVariable(obj)
            }
            
            
            // Object.keys(schema['keys']).map((key: string)=>{

            // })
            
            const required =   defineComponentBinds('required', vuetifyConfig)
            const key = defineComponentBinds('key', vuetifyConfig)
            const label = defineComponentBinds('label', vuetifyConfig)
            const target=defineComponentBinds('target', vuetifyConfig)
            const output = defineComponentBinds('output', vuetifyConfig)
            const element = defineComponentBinds('element', vuetifyConfig)
            const onSubmit = handleSubmit((values) => {
                addVariable(values)
            });
            window.electronAPI.addedVariableRequestReturn(async (event: any, varname: string | null) =>{
                // dialog.value=true
                // setFieldValue('key', varname)
                
            })
                
            onMounted(() => {
                // Initialize the elements
            });
            return { 
                onSubmit, 
                dialog,
                resetForm,
                handleSubmit,
                key, label, required, output, element, target
            }
        }
    }
</script>
