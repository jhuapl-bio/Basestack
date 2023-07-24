<template>
    <div>
        {{ selectedChoice }}
    <v-select :items="module.choices"
        v-model="selectedChoice"
        class="mx-4"
        density="comfortable"
        clearable
        @change="console.log('change')"
        outlined

        item-title="label"
        :return-object="true"
    />
    
    <!-- Add a run button that makes a run method and uses window.electronapi to call the run in preload.ts -->
    <v-btn @click="run" class="mx-4" color="primary">Run</v-btn>
    <div v-if="selectedChoice">
      <p>Variables:</p>
      <v-list>
        <v-list-item v-for="variable in module.variables" :key="variable.key">
            <div class="input-wrapper">
                <span>{{variable.label ? variable.label : variable.key}}</span>
                <v-tooltip
                    v-if="moduleVariables[variable.key] 
                        && variable.element 
                        && ( variable.element == 'file'  || variable.element == 'string' || variable.element == 'files' ) 
                        && !variable.output" 
                    location="top" 
                >
                    <template #activator="{ on, attrs, props }">
                        <v-icon   class="clear-badge  lighten-4" color="gray"  @click="clearInput(variable.key)"  v-bind="props" v-on="on" size="x-small">mdi-close</v-icon>
                     </template>
                    <span>Clear Input</span>
                </v-tooltip>  
                <div v-if="variable.element === 'file'">
                    <v-text-field
                        :value="moduleVariables[variable.key]"
                        :label="moduleVariables[variable.key] ? moduleVariables[variable.key] : ''"                        
                        @click.prevent="!variable.output ? openFileDialog(variable.key) : ''"
                        @dragover.prevent
                        @dragleave.prevent  
                        :readonly="variable.output"
                        @change="!variable.output ? validateFile(variable.key, $event): ''; "
                        @drop.prevent="!variable.output ? onDrop(variable.key, $event): ''"
                        
                    />
                </div>
                <!-- assuming variable.options is an array of options 
                    select the first index automatically 
                -->
                <v-select v-else-if="variable.element === 'list'"
                    :items="variable.target"  
                    :value="moduleVariables[variable.key]"
                    @input="v => moduleVariables[variable.key] = v"
                    :label="variable.key"
                    outlined 
                    @change="handleNull(variable.key, $event)"
                    clearable
                />
                <!-- For some reason the string wont update and I cant make edits fix this -->

                <v-text-field v-else-if="variable.element === 'string'"  
                    v-model="moduleVariables[variable.key]"
                    @input="recordhistory(variable.key)"
                    >
                </v-text-field>
                
                <v-text-field v-else-if="variable.element === 'number'"  
                    :value="moduleVariables[variable.key]" 
                    :step="variable.step ? variable.step : 1" 
                    :min="variable.min ? variable.min : 0"
                    @input="v => moduleVariables[variable.key] = v" 
                    type="number">
                </v-text-field>
                <v-textarea 
                    v-else-if="variable.element === 'textarea'" 
                    :label="variable.key"  
                    :value="variable.value"
                />
                <v-text-field :disabled="variable.static" 
                    v-else-if="variable.element === 'static'" readonly 
                    :value="moduleVariables[variable.key]"
                    :label="moduleVariables[variable.key] ? moduleVariables[variable.key] : '' " 
                    
                />
                <span class="badge" v-if="!variable.output" :class="validationStates[variable.key] === true  ? 'green-badge' : 'orange-badge'"></span>
                <v-tooltip
                    v-if="variable.info" 
                    location="top"
                >
                    <template #activator="{ on, attrs, props }">
                        <v-icon class="info-badge" color="info"     v-bind="props" v-on="on" small>mdi-information-box</v-icon>
                     </template>
                    <span>{{  variable.info }}</span>
                </v-tooltip>
                
            </div>
            <v-alert  v-if="validationStates[variable.key] && validationStates[variable.key] !== true" 
                    type="warning"
                    variant="outlined"  
                    >
                    {{ validationStates[variable.key]  }}
            </v-alert>
  
          
        </v-list-item>
      </v-list>

      <p>Command:</p>
      <v-textarea v-model="selectedChoice.command" label="Command" />
    </div>
  </div>
  </template>


<style scoped>
.variable-item {
  position: relative;
}

.input-wrapper {
  position: relative;
}

.badge {
  position: absolute;
  top: 10px;
  right: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.green-badge {
  background-color: green;
}

.orange-badge {
  background-color: orange;
}

.info-badge {
  position: absolute;
  top: 10px;
  right: 20px;
  height: 10px;
}
.clear-badge {
  position: absolute;
  top: 25px;
  z-index: 999;
  left: 0px;
}
</style>

<script lang="ts">

import { ref, onMounted, watch, nextTick, reactive } from 'vue'
import { useVuelidate } from '@vuelidate/core'
import Swal from 'sweetalert2'
import path from "path"
import _ from 'lodash';

export default {
    props: {
        module: {
            type: Object,
            required: true, 
        },
        moduleIdx: {
            type: Number, 
            required: true
        }
    },
    setup(props) {
        const selectedChoice = ref(null)
        const originalChoice = ref(null)
        const text = ref(null)
        const validationStates = reactive({})
        let  moduleVariables = reactive({})
        const functions = {
            basename: window.electronAPI.basename,
            trim: window.electronAPI.trim,
            directory: window.electronAPI.directory,
            join: (...args) => args.slice(1).join(args[0]),

            // define other functions here...
        }
        const updateCommand = () =>{
            let command = resolveShorthand(originalChoice.value, {
                moduleVariables,
                selectedChoice: selectedChoice.value,
                functions: functions
            });
            console.log("cmd update", moduleVariables, command)
            selectedChoice.value.command = command._value.command
        }
        // // setup a way to console log any time the props.module is changed. This is an object and must be a deep watcher
        watch(() => props.moduleIdx, () => {
            reset()
            checkInitialize()
        }, { deep: true })


        watch(()=>selectedChoice, () => {
            reset()
            updateCommand()
        }, { deep: true })

        function checkInterpolation(variable) {
            let any = false
            if (typeof variable.target === 'string'  ) {
                let interpolatedValue = variable.target
                let match
                const regex = /%([^%]+)%/g
                let matcht = -1
                while ((match = regex.exec(interpolatedValue)) !== null) {
                    const expression = match[1]
                    matcht  = 0
                    const evaluated = evaluateExpression(expression)
                    any = true
                    if (evaluated){
                        interpolatedValue = interpolatedValue.replace(`%${expression}%`, evaluated)
                    } else {
                        any = false 
                        break
                    }
                }
                console.log(matcht, moduleVariables[variable.key],"<")
                if (matcht>=0){
                    if (!any){
                        updateVariables(variable, interpolatedValue);
                    }
                    else if (interpolatedValue !== moduleVariables[variable.key]) {
                        updateVariables(variable, interpolatedValue);
                    }
                } else {
                    updateVariables(variable, moduleVariables[variable.key]);
                }
            }
        }

        watch(moduleVariables, (oldVal: any, newVal: any) => {
            //get the index of the changed variable
            const idx = props.module.variables.findIndex((variable: any) => variable.key === Object.keys(newVal)[0])
            props.module.variables.forEach((variable, indx)=> {
                // add this change to the history, send it to main process to be saved
                checkInterpolation(variable)
                if (variable.element == 'file'){
                    validateFile(variable.key, moduleVariables[variable.key] )
                } else {
                    validateText(variable.key)
                }
            })
            updateCommand()
        }, { deep: true })
        
        const updateVariables = async (variable, interpolatedValue) => {
            await nextTick();
            moduleVariables[variable.key] = interpolatedValue;
            recordhistory(variable.key)
        };
        function interpolate(expr, context) {
            // const variablePattern = /%?([$@][\w.]+)%?/g;
            const variablePattern = /%((?:[$@][\w.[]+|[^%]+))%/g;
            const functionPattern = /%?([\w]+)\((.*?)\)%?/g;

            // Interpolate variable in the given string
            function interpolateVariable(str) {
                return str.replace(variablePattern, (match, variable) => {
                    const key = variable.slice(1);
                    if (key == 'db[0]'){
                        console.log(context.moduleVariables, ">", _.get(context.moduleVariables, key, ''))
                    }
                    switch (variable[0]) {
                        case '$': return _.get(context.moduleVariables, key, '');
                        case '@': return _.get(context.selectedChoice, key, '');
                        default: return '';
                    }
                });
            }

            function processFunctionCall(funcName, arg) {
                if (_.has(context.functions, funcName)) {
                    // Perform variable interpolation on the argument before invoking the function
                    const func = _.get(context.functions, funcName);
                    return func(...arg);
                } else {
                    return '';
                }
            }

            // First, replace variables
            let intermediate = interpolateVariable(expr);
            // console.log(intermediate,"<")
            // Then replace any function calls
            let returnable = intermediate.replace(functionPattern, (match, funcName, arg) => {
                let args = splitArguments(arg);
                return processFunctionCall(funcName, args);
            });

            return returnable;
        }

        function resolveShorthand(obj, context) {
            console.log(context,"<")
            let result = JSON.parse(JSON.stringify(obj)); // Create a deep clone of the original object
            // Deep iterate over object properties
            function iterate(obj) {
                for (let prop in obj) {
                    if (obj.hasOwnProperty(prop)) {
                        if (typeof obj[prop] === 'object') {
                            iterate(obj[prop]);
                        } else if (typeof obj[prop] === 'string') {
                            obj[prop] = interpolate(obj[prop], context);
                        }
                    }
                }
            }

            iterate(result);
            return result;
            
        }
        //run method called from the play button in teh vue elements that calls window.electronapi run method 
        //with the command from the selected choice parameters sent along to it 
        async function run() {
            let command = resolveShorthand(originalChoice.value, {
                moduleVariables,
                selectedChoice: selectedChoice.value,
                functions: functions
            });
            // console the name of the module, and the choice index
            window.electronAPI.runModule({
                key: props.module.name,
                ...command, 
                type: "module"           
            })
            

        }
        const evaluateExpression = (expression) => {
            const match = expression.match(/([^%(]+)\((.*)\)$/);
            if (match) {
                const funcName = match[1];
                let args = splitArguments(match[2]);
                if (functions[funcName]) {
                    args = args.map(arg => {
                        if (arg.match(/^[^%(]+\((.*)\)$/)) { // if arg is a function call, evaluate it
                            return evaluateExpression(arg);
                        } else if (arg.startsWith('$')) { // if arg is a variable reference, dereference it
                            const varName = arg.slice(1);
                            return moduleVariables[varName];
                        } else { // otherwise, arg is a literal
                            if (arg.startsWith("'") && arg.endsWith("'")) {
                                return arg.slice(1, -1);
                            }
                            return arg;
                        }
                    });
                    if (args && args.length>0 && args[0]){
                        return functions[funcName](...args);
                    } else {
                        return null
                    }
                }
            }
            return expression;
        };

        const splitArguments = (argString) => {
            const args = [];
            let parenCount = 0;
            let lastIdx = 0;
            argString = argString.replace(/["']/g, "")
            for (let i = 0; i < argString.length; i++) {
                if (argString[i] === '(') parenCount++;
                    else if (argString[i] === ')') parenCount--;
                if (argString[i] === ',' && parenCount === 0) {
                    args.push(argString.substring(lastIdx, i).trim());
                    lastIdx = i + 1;
                }
            }
            args.push(argString.substring(lastIdx).trim()); // add the last arg
            return args; 
        };
        const reset  = () =>{
            
            if (props.module.choices.length > 0) {
                if (!selectedChoice.value) {
                    selectedChoice.value = props.module.choices[0]
                }
                originalChoice.value = JSON.parse(JSON.stringify(selectedChoice)); // Clone and save the initial choice
            }
        }
        const checkInitialize = ()=> {
            if (props.module.choices.length > 0) {
                props.module.variables.forEach((variable: any) => {
                    moduleVariables[variable.key] = Array.isArray(variable.target) ? variable.target[0]  : variable.target
                    validationStates[variable.key] = null
                })
            }
        }

        onMounted(() => {
            // Initialize the selectedChoice
            Object.keys(moduleVariables).forEach(key => {
                delete moduleVariables[key]
            })
            reset()
            checkInitialize()
        })
         
        const filePaths = reactive({})
        const openFileDialog = async (key: string) => {
            window.electronAPI.selectFile() 
            window.electronAPI.sendFile((event: any, filePath: any) => {
                // Set the file path
                if (filePath) {
                    moduleVariables[key] = filePath
                    // recordhistory(key)
                    handleFileSelection(key, filePath)
                }
            })
            
        }

        const onDrop = (key: string, event: DragEvent) => {
            const filePath = event.dataTransfer?.files[0].path
            if (filePath) {
                moduleVariables[key] = filePath
                // recordhistory(key)
                handleFileSelection(key, filePath)
            }
        }
        const clearInput = (key: string) => {
            moduleVariables[key] = null
            // recordhistory(key)
        }
        const handleFileSelection = async (key: string, filePath: string) => {
            

            // Validate the file path
            window.electronAPI.requestCheckFileExists(filePath)
            window.electronAPI.sendExistsFile((event: any, exists: any) => {
                if (!exists) { 
                    Swal.fire({
                        icon: 'error',
                        title: 'File does not exist',
                        text: 'Please check the file path and try again.',
                    })
                    validationStates[key] = 'File does not exist'
                }
            })
            const variable = props.module.variables.find((v: any) => v.key === key)
            if (!variable.output){
                validateFile(key, filePath)
            }
        }
       
        const validateInput = (pattern: string | string[], check: string  ) => {
            let valid = null
            if (Array.isArray(pattern)) {
                for (let p of pattern) {
                    if (new RegExp(p).test(check)) {
                        valid = true
                        return valid
                    }
                }
            } else if (new RegExp(pattern).test(check)) {
                valid = true
                return valid
            }
            return `Invalid file type. The filename does not match the pattern: ${pattern}`
        }
        const validateText = (key: string) => {
            const variable = props.module.variables.find((v: any) => v.key === key)
            if (!variable.output){
                if (variable.pattern){
                    validationStates[key] =  validateInput(variable.pattern, moduleVariables[key])
                } else {
                    validationStates[key] = true
                }
            }
            
            return 
        }
        const handleNull = (key: string, value: any) => {
            if (key === null || value === undefined) {
                // The dropdown was cleared
                // Update moduleVariables[variable.key] as needed
                moduleVariables[key] = null// or any default value you prefer
            }
        }
        const updateText = (key: any, value: any) => {
            // if (key !== null && value !== undefined) {
            //     // The dropdown was cleared
            //     // Update moduleVariables[variable.key] as needed
            //     moduleVariables[key] = value// or any default value you prefer
            // }
        }
        window.electronAPI.getVariable((event, params:object) => {
            moduleVariables[params['variable']] = params['value']
        })
        const recordhistory = ( key:string  ) =>{
            window.electronAPI.recordHistory( 
                {
                    module: props.module.name,
                    variable: key,
                    type: 'variable',
                    value: moduleVariables[key]
                }
            )
        }
        const validateFile = async (key: string, file: string ) => {
            
            if (file) {
                
                const variable = props.module.variables.find((v: any) => v.key === key)
                let pattern = variable.pattern
                const fileName = file
                let exists = await window.electronAPI.exists(`${fileName}`)
                if (!exists){
                    
                    Swal.fire({
                        title: 'Invalid file, does not exist!',
                        text: `Please ensure that the file exists: ${fileName}`,
                        icon: 'warning',
                        confirmButtonText: 'Will do'
                    })
                    validationStates[key] = "File Does not exist"
                    
                    return 
                }
                if (pattern){
                    validationStates[key] = validateInput(pattern, fileName)
                } else {
                    validationStates[key] = true
                }
                if (validationStates[key] !== true){
                    Swal.fire({
                        title: 'Invalid file type',
                        text: 'Please upload a file that matches one of the specified patterns.',
                        icon: 'warning',
                        confirmButtonText: 'Okay'
                    })
                }
                
            } else {
                validationStates[key] == 'Empty'
            }
        }

        return { 
            choices: props.module.choices, 
            selectedChoice, 
            updateCommand,
            reset,
            checkInitialize,
            validateFile, 
            validationStates, 
            moduleVariables,
            openFileDialog, 
            filePaths, 
            clearInput,
            recordhistory,
            validateText,
            handleNull,
            onDrop, 
            run,
            updateText,
        }
    }
}
</script>