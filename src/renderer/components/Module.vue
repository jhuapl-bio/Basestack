<template>
    <div>
    <!-- Write an example v-select -->
  
        
    <v-select 
        :items="module.choices"
        v-model="selectedChoice"
        class="mx-4"
        density="comfortable"
        clearable
        outlined
        :key="`${selectedChoice}-ff`"
        item-title="label"
        :return-object="true"
    /> 
    <Requirements 
        :choiceIdx="selectedChoiceIndex" 
        v-if="selectedChoice && selectedChoice.requirements" 
        :requirements="selectedChoice.requirements">
    </Requirements>
    <Outputs
        :variables="outputVariables"
    >

    </Outputs>
    <v-list-item class="pb-3">
        <v-tooltip
            top
        >
            <template #activator="{  props }">
                <v-btn  icon @click="saveModuleCustom"    v-bind="props"  
                >
                    <v-icon>mdi-content-save</v-icon>
                </v-btn>
            </template>
            <span>Register Module</span>
        </v-tooltip>
        <v-tooltip
            top
        >
            <template #activator="{ on, attrs, props }">
                <v-btn icon @click="exportYAML" class="mx-4" color="primary"   v-bind="props"  > 
                    <v-icon>mdi-file-export-outline</v-icon>
                </v-btn>
            </template>
            <span>Export Module to a file</span>
        </v-tooltip>
        


        <template v-slot:append>
            <v-tooltip
                top
            >
                <template #activator="{ on, attrs, props }">
                    <v-btn  icon @click="run" class="mx-4"  v-bind="props"  color="purple-lighten-2" >
                        <v-icon >mdi-play-circle-outline</v-icon>
                    </v-btn>
                </template>
                Run Pipeline
            </v-tooltip>
        </template>
    </v-list-item>
    <v-divider></v-divider> 
    <!-- Add a run button that makes a run method and uses window.electronapi to call the run in preload.ts -->
    <!-- Add an export button that exports all the changes I've made in the selectedChoice/moduleVariables/command-->
    

    <div v-if="selectedChoice">
      <v-list>

        <NewVariable ></NewVariable>
        <v-list-item v-for="(variable,idx) in selectedVariables" :key="`${variable.key}-listvar`">
            <div class="input-wrapper">
                <v-tooltip
                    v-if="variable.custom" 
                    location="top"
                >  
                    <template #activator="{ on, attrs, props }">
                        <v-icon class="clear-badge  lighten-4" color="gray" @click="deleteVariable(variable.key)"    v-bind="props"  size="x-small">mdi-minus</v-icon>
                     </template>
                    <span>Delete Variable</span>
                </v-tooltip>
                <span>{{variable.label ? variable.label : variable.key}}</span>
                <component  
                    :is="components[variable.element]" 
                    :variable="moduleVariables[variable.key]"
                    :default="selectedVariables[idx].target"
                    :editMode="editMode"
                    :choices="selectedVariables[idx].choices"
                    @update="changeVariable(variable.key, $event,  false)"
                    
                ></component>
                <span class="badge" v-if="!variable.output" :class="validationStates[variable.key] === true  ? 'green-badge' : 'orange-badge'"></span>
                <v-tooltip
                    v-if="variable.info" 
                    location="top"
                >
                    <template #activator="{ on, attrs, props }">
                        <v-icon class="info-badge" color="info"     v-bind="props"  small>mdi-information-box</v-icon>
                     </template>
                    <span>{{  variable.info }}</span>
                </v-tooltip>
                
            </div>
            <v-alert  v-if="!editMode && validationStates[variable.key] && validationStates[variable.key] !== true" 
                    type="warning"
                    variant="outlined"  
                    >
                    {{ validationStates[variable.key]  }}
            </v-alert> 
  
          
        </v-list-item> 
      </v-list>
       <v-switch v-model="editMode" label="Edit Mode" />
      <p>Command:</p>
      <v-textarea  v-if="!editMode" v-model="command" label="Command" />
      <v-textarea  v-else v-model="selectedChoice.command" @input="updateBaseCommand" label="Base Command" /> 
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
import Swal from 'sweetalert2'
import { ref, shallowRef, toRaw, onMounted, watch, markRaw, reactive, computed } from 'vue'
import _ from 'lodash';
import resolveShorthand  from '../controllers/interpolate'
import NewVariable from './NewVariable.vue';
import * as yaml from 'js-yaml';
import String from './inputs/String.vue';
import Static from './inputs/Static.vue'
import File from './inputs/File.vue';
import List from './inputs/List.vue'
import Outputs from './Outputs.vue';
import Requirements from './Requirements.vue'
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
    components: {
        NewVariable,
        String: markRaw(String),
        File: markRaw(File), 
        List: markRaw(List),
        Static: markRaw(Static),
        Outputs,
        Requirements
    },
    setup(props) {
        const originalChoice = ref(null);
        let command = ref(null);
        const components = reactive({
            "file": File, 
            "string": String,
            // "number": Number,
            "list": List,
            "list-directory": List,
            "list-file": List,
            "static": Static,
            "static-file": Static,
            "static-directory": Static,
            // "checkbox": Checkbox, 
            // "files": Files,
            // "dir": Dir,
        })
        const fileInputRef = ref(null);
        let dialogVariable = ref(null);
        const validationStates = reactive({});
        const selectedVariables = ref([])
        const selectedChoice = shallowRef(null);
        const moduleVariables = reactive({});
        const editMode = ref(false);
        const outputVariables = ref([])
        const selectedChoiceIndex = ref(null)
      
        const updateCommand = () => {
            let commandRef = resolveShorthand(selectedChoice.value, {
                ...moduleVariables
            });
            command.value = commandRef.command;
        };
        const updateBaseCommand = () => {
            command.value = selectedChoice.value.command;
            updateCommand()
        };
        
      
        const recordhistory = (key: string, type: string | null, value: any ) => {
            if (!type || type == "variable") {
                window.electronAPI.recordHistory({
                    module: props.module.name,
                    variable: key,
                    default: editMode.value,
                    type: "variable",
                    value: value
                });
            }
            else if (type == "run") {
                window.electronAPI.recordHistory({
                    module: props.module.name,
                    type: "run",
                    value: {
                        variables: toRaw(moduleVariables),
                        choice: toRaw(selectedChoice.value)
                    }
                });
            }
        };
        const updateSelectedChoiceIndex = () => {
            selectedChoiceIndex.value = props.module.choices.findIndex(
                (choice) => choice ===  selectedChoice.value
            );
        }
        let oldMatchedItems = ref([]); // initialize oldMatchedItems
        watch (() => editMode, (newValue, oldValue )=>{
            // validate all of the variables, iterate through them, check if file or not 
            if (!editMode.value){
                for (let  key of Object.keys(moduleVariables)){
                    let value = moduleVariables[key]
                    let idx  = selectedVariables.value.find((variable: any) => variable.key == key)
                    if (idx){
                        if (idx.element  == "file"){
                            validateFile(key, value)
                        }
                        else {
                            validateText(key)
                        }
                    }
                }
            }
        }, {deep: true})
        const setOutputVariables = () => {
            let variables = []
            selectedVariables.value = _.cloneDeep(props.module.variables)
            if (props.module.variables){
                props.module.variables.forEach((variable: any) => {
                    if (variable.output){
                        console.log(moduleVariables[variable.key])
                        variables.push({
                            ...variable,
                            value: moduleVariables[variable.key]
                        })
                    }
                });
                outputVariables.value = variables
            }
        };
        //watch if the module changes via moduleIdx, if it does, then reset the selectedChoice
        watch(() => selectedChoice , (newValue, oldValue) => {
            let index = props.module.choices.findIndex((choice) => choice ===  newValue.value)
            selectedChoiceIndex.value = index
            setOutputVariables()
            
            if (selectedChoice.value.command) {
                // Match patterns like '%$...' or '$...' followed by whitespace or '%'
                const newMatches = newValue.value.command.match(/(\$[\w]+)[%|\s]/g);
                // Remove '$' character from matched items
                const newMatchedItems = newMatches ? newMatches.map(match => match.slice(1, -1)) : [];

                // Compare the old matched items with the new ones
                if (JSON.stringify(newMatchedItems.sort()) !== JSON.stringify(oldMatchedItems.value.sort())) {
                    // Execute your logic for when the matched items change
                    newMatchedItems.forEach(newVariable => {
                        if (!oldMatchedItems.value.includes(newVariable)) {
                            window.electronAPI.addedVariableRequest(newVariable)
                            moduleVariables[newVariable] = null;
                            // recordhistory(newVariable, "variable");
                        }
                    });
                    
                    oldMatchedItems.value.forEach(oldVariable => {
                        if (!newMatchedItems.includes(oldVariable)) {
                            delete moduleVariables[oldVariable];
                            // recordhistory(oldVariable, "variable");
                        }
                    });
                    
                    // Update oldMatchedItems
                    oldMatchedItems.value = newMatchedItems;
                }
            }
            updateSelectedChoiceIndex()
        }, {deep: true});

        
        
        watch(() => props.module, () => {
            selectedChoice.value = null;
            console.log("new props modules", props.module.variables)
            originalChoice.value = null; 
            command.value = "";
            // delete all of the keys in moduleVariables
            Object.keys(moduleVariables).forEach(key => {
                delete moduleVariables[key];
            });
            refresh();
        }, {deep: true});
        // make a reset feature that onmounted used and any time the module changes that resets things to the first choice from selectedChoice options 
        const refresh = () => {
            // console.log(props.module.choices)
            if (Object.keys(props.module).length >0  && props.module.choices.length > 0) {
                selectedChoice.value = props.module.choices[props.module.defaultchoice ? props.module.defaultchoice : 0];
                originalChoice.value = _.cloneDeep(selectedChoice.value);
                selectedVariables.value = _.cloneDeep(props.module.variables)
                command.value = selectedChoice.value.command
                if (selectedVariables.value){
                    for (let [key, variable] of Object.entries(selectedVariables.value)){
                        moduleVariables[key] = Array.isArray(variable) ? variable[0] : variable;
                        validationStates[key] = null;
                    }
                }
                updateCommand();
            }
        };
        // add getRun, which updates the variables and command
        window.electronAPI.getRun((event, res) => {
            Object.keys(res.value.variables).forEach(key => {
                // get index from variables
                // let idx = props.module.variables.findIndex((variable: any) => variable.key == key)
                moduleVariables[key] = res.value.variables[key]
                changeVariable(key, moduleVariables[key], true)

            })
            // update the command
            selectedChoice.value.command = res.choice.command
            originalChoice.value = _.cloneDeep(selectedChoice.value)
            command.value = selectedChoice.value.command
            updateCommand()
        });
        const run = async () => {
            if (!selectedChoice.value)
                return;
            let commandr = toRaw(command.value);
            let vars = JSON.parse(JSON.stringify(moduleVariables))
            // iterate through vars, but attach the type of the variable from the selectedChoice.variables
            Object.keys(vars).map((key) => {
                let idx = selectedVariables.value.findIndex((variable: any) => variable.key == key)
                if (idx !== -1){
                    vars[key] = {
                        value: vars[key],
                        type: selectedVariables.value[idx].element
                    }
                }
            })
            let processid = await window.electronAPI.runModule({  
                key: props.module.name,
                command: commandr,
                params: vars,
                outputs: toRaw(outputVariables.value),
                'pre-execute' : toRaw(selectedChoice.value['pre-execute']),
                env: selectedChoice.value.env,
                exec: selectedChoice.value.exec,
                type: "module"
            });
            window.electronAPI.setSideTab(2)
            recordhistory(null, "run", null);
        };
        window.electronAPI.addedVariable((event, varr)=>{
            let indx = selectedVariables.value.findIndex((variable: any) => variable.key == varr.key)
            varr.custom = true
            if (indx == -1) {
                selectedVariables.value.push(varr)
            }
            else {
                selectedVariables.value[indx] = varr
            }
            // changeVariable(varr.key, varr.value, false);
        })
        const deleteVariable = (key: string) => {
            let indx = selectedVariables.value.findIndex((variable: any) => variable.key == key)
            selectedVariables.value.splice(indx, 1)
            delete moduleVariables[key]
            // recordhistory(key, "variable");
        };
        // add an export to YAML feature 
        // open file dialog to save the file at with electron
        const exportYAML = () => {
            let val = selectedChoice["value"];
            let obj = {
                ...props.module,
                variables: moduleVariables,
                choices: [val],
                defaultchoice: 0
            };
            window.electronAPI.saveFile(JSON.stringify(obj, null, 4), "yaml");
        };
       
        
        const handleFileSelection = async (key: string, filePath: string) => {
            // Validate the file path
            window.electronAPI.requestCheckFileExists(filePath);
            window.electronAPI.sendExistsFile((event: any, exists: any) => {
                if (!exists) {
                    Swal.fire({
                        icon: "error",
                        title: "File does not exist",
                        text: "Please check the file path and try again.",
                    });
                    validationStates[key] = "File does not exist";
                }
                else {
                    moduleVariables[key] = filePath;
                    // changeVariable(key, filePath, false);
                }
            });
        };
        
        const changeVariable = (variableKey, newValue, ignoreHistory: boolean | void) => {
            // Validation
            // find index of variable matches variable key from props.module.variables
            const variableIndex = selectedVariables.value.findIndex((v: any) => v.key === variableKey);
            let varr = selectedVariables.value[variableIndex]
            // // Update the variable
            // // Record History
            if (!ignoreHistory) {
                recordhistory(variableKey, "variable", newValue);
            }
            if (editMode.value){
                selectedVariables.value[variableIndex].target = newValue;
                varr.target = newValue
                let interpolatedValue = resolveShorthand(varr, {
                    ...moduleVariables
                });
                moduleVariables[varr.key] = interpolatedValue.target;
            } else {
                if (!selectedVariables.value[variableIndex].target){
                    selectedVariables.value[variableIndex].target = newValue;
                }
                moduleVariables[variableKey] = newValue;
            }
            if (varr.element == "file") {
                validateFile(variableKey, moduleVariables[variableKey]);
            }
            else {
                validateText(variableKey);
            }
            
            // // Interpolation
            selectedVariables.value.filter((f: object) => {
                return f["key"] !== variableKey;
            }).forEach((variable, indx) => {
                // add this change to the history, send it to main process to be saved
                let interpolatedValue = resolveShorthand(variable, {
                    ...moduleVariables
                });
                moduleVariables[variable.key] = interpolatedValue.target;
            });
            setOutputVariables()
            
            



            // // Re-interpolate command
            updateCommand();
        };
        window.electronAPI.getVariable((event, params: object) => {
            editMode.value = params['default']
            // moduleVariables[params['variable']] = params['value']
            changeVariable(params['variable'], params['value'], true)
        });
        let oldCount = ref(0); // initialize oldCount

        watch(() => command, (newValue, oldValue) => {
            if (!editMode.value)
                return;
            if (newValue !== oldValue) {
                
                updateCommand();
            }
        });
        const validateInput = (pattern: string | string[], check: string) => {
            let valid = null;
            if (Array.isArray(pattern)) {
                for (let p of pattern) {
                    if (new RegExp(p).test(check)) {
                        valid = true;
                        return valid;
                    }
                }
            }
            else if (new RegExp(pattern).test(check)) {
                valid = true;
                return valid;
            }
            return `Invalid input type. The input does not match the pattern: ${pattern}`;
        };
        const validateText = (key: string) => {
            const variable = props.module.variables.find((v: any) => v.key === key);
            if (!variable.output) {
                if (variable.pattern) {
                    validationStates[key] =   validateInput(variable.pattern, moduleVariables[key])  
                }
                else {
                    validationStates[key] = true;
                }
            }
            return;
        };
        const validateFile = async (key: string, file: string) => {
            if (file) {
                handleFileSelection(key, file )
                const variable = props.module.variables.find((v: any) => v.key === key);
                let pattern = variable.pattern;
                const fileName = file;
                let exists = await window.electronAPI.exists(`${fileName}`);
                if (!exists) {
                    Swal.fire({
                        title: "Invalid file, does not exist!",
                        text: `Please ensure that the file exists: ${fileName}`,
                        icon: "warning",
                        confirmButtonText: "Will do"
                    });
                    validationStates[key] = "File Does not exist";
                    return;
                }
                if (pattern) {
                    validationStates[key] = validateInput(pattern, fileName);
                }
                else {
                    validationStates[key] = true;
                }
                if (validationStates[key] !== true) {
                    Swal.fire({
                        title: "Invalid file type",
                        text: "Please upload a file that matches one of the specified patterns.",
                        icon: "warning",
                        confirmButtonText: "Okay"
                    });
                }
            }
            else {
                validationStates[key] == "Empty";
            }
        };
        const saveModuleCustom  = async () =>{
            let obj = {
                ...props.module,
                variables: Object.values(moduleVariables).map((f:any)=>{ return toRaw(f)}),
                choices: [toRaw(selectedChoice.value)],
                defaultchoice: 0
            };
            // Use swal to send a prompt to add a key, and then save the file with that key with saveFileBackendDefault from window.electronApi
            // show a review of the entire object as an interactive tree that is editable
            // add a swal fire that show sthe entire contents of obj




            Swal.fire({
                title: 'Enter a name for the module',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Save',
                showLoaderOnConfirm: true,
                preConfirm: async (name) => {
                    // check if the name is an already existing module name, if so then send a warning and dont submit the save. If name in moduleNames, then send a warning and dont submit the save
                    // check the module name from props.module.name
                    if (name in props.module ){
                        Swal.showValidationMessage(
                            `Module name already exists`
                        )
                    } else if (!name || name == ''){
                        Swal.showValidationMessage(
                            `Module name cannot be empty`
                        )
                    }
                    else {
                        try{
                            let result = await  window.electronAPI.saveFileBackendDefault(
                                JSON.stringify(toRaw(obj), null, 4), 
                                "yaml", 
                                name,
                                'customModule'
                            );
                        } catch (err){
                            Swal.showValidationMessage(
                                `${err}`
                            )
                        }
                    }
                    
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: `Module Saved`,
                        text: `Module saved as ${result.value}`,
                        icon: 'success',
                        confirmButtonText: 'Okay'
                    })
                }
            })
           
        }

        onMounted(async () => {
            // Initialize the selectedChoice
            refresh();
            // window.electronAPI.addedVariableRequest()
        });
        const items = ref(['Item 1', 'Item 2', 'Item 3']);
        const selectedItem = ref(null);
        return {
            choices: props.module.choices,
            selectedChoice,
            items, selectedItem,
            updateBaseCommand,
            selectedVariables,
            components,
            originalChoice,
            outputVariables,
            deleteVariable,
            saveModuleCustom,
            command,
            dialogVariable,
            run,
            changeVariable,
            exportYAML,
            editMode,
            selectedChoiceIndex,
            updateSelectedChoiceIndex,
            validationStates,
            recordhistory,
            moduleVariables,
            updateCommand,
        };
    },
}
</script>