<template>
    <!-- Write an example v-select -->
    <div class="container"  > 
        <div class="left" :style="{'height': containerHeight }" >
            <div v-if="selectedChoice">
                <v-list>

                    <NewVariable ></NewVariable>
                    <v-list-item v-for="[key, variable] in Object.entries(selectedChoice.variables)" :key="`${key}-listvar`"  >
                        <div class="input-wrapper " v-if="! variable['output']">
                            <v-tooltip 
                                v-if="variable['custom']" 
                                location="top"
                            >  
                                <template #activator="{ props }">
                                    <v-icon class="clear-badge  lighten-4" color="gray" @click="deleteVariable(key)"    v-bind="props"  size="x-small">mdi-minus</v-icon>
                                </template>
                                <span>Delete Variable</span>
                            </v-tooltip>
                            {{ variable['label'] ? variable['label'] : key }}
                            <component  
                                :is="components[variable['element']]" 
                                :data="variable['data']"
                                :params="variable"
                                :variable="moduleVariables[key]"
                                :default="selectedChoice.variables[key].target"
                                :editMode="editMode"
                                :choices="selectedChoice.variables[key].choices"
                                @update="changeVariable(key, $event,  false)"
                                
                            ></component>
                            <span class="badge" v-if="!variable['output']" :class="validationStates[key] === true  ? 'green-badge' : 'orange-badge'"></span>
                            <v-tooltip
                                v-if="variable['info']" 
                                location="bottom"
                            >
                                <template #activator="{  props }">
                                    <v-icon class="info-badge" color="info"     v-bind="props"  small>mdi-information-box</v-icon>
                                </template>
                                <span>{{  variable['info'] }}</span>
                            </v-tooltip>
                            
                        </div>
                        <v-alert  v-if="!editMode && validationStates[key] && validationStates[key] !== true" 
                                type="warning"
                                variant="outlined"  
                                >
                                {{ validationStates[key]  }}
                        </v-alert> 
            
                    
                    </v-list-item> 
                </v-list>
                
            </div>

        </div>
        <div class="right">
            <v-file-input type="file" ref="fileInputRef" @change="loadYaml" 
                :accept="['.yaml', '.YAML', '.yml']" 
                label="Insert Custom Module YAML"/>
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
                    <template #activator="{   props }">
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
                        <template #activator="{   props }">
                            <v-btn  icon @click="run" class="mx-4"  v-bind="props"  style="background: #3f51b5; color:white" >
                                <v-icon >mdi-play-circle-outline</v-icon>
                            </v-btn>
                        </template>
                        Run Pipeline
                    </v-tooltip>
                </template>
            </v-list-item>
            <!-- Print a progress linear bar in vuetify if the process is not null and process is running (attribute), otherwise dont show -->
            <v-progress-linear
                v-if="currentProcess && currentProcess.running"
                :indeterminate="true"
                color="purple">
            </v-progress-linear>
            <!-- If it is running, print out the last 2 lines of the currentProcess.logs list -->
            <v-alert  v-if="currentProcess" style="overflow-y:auto; max-height: 120px" variant="outlined" >
                <template #prepend>
                    <v-icon v-if="currentProcess && currentProcess.running" 
                        @click="showProcessDialog = true" class="me-2" 
                        color="info">mdi-information-outline
                    </v-icon>
                    <v-tooltip
                        v-else-if="currentProcess && !currentProcess.running "
                        top
                    >
                        <template #activator="{  props }">
                            <v-icon 
                                :color="currentProcess.code !=0 ? 'red-lighten-1' : 'green-lighten-2'"
                                :icon="currentProcess.code == 0 && !currentProcess.running ? 'mdi-check' : 'mdi-alert'"
                                variant="text"
                                v-bind="props" @click="showProcessDialog = true"
                            ></v-icon>
                        </template>
                        <span>{{ currentProcess.code == 0 ? "Completed with Success!" : 'Failed to complete' }}</span>
                        <br>
                        <span>Process exited with code {{ currentProcess.code }}</span>
                    </v-tooltip>
                </template>
                <pre v-for="(line, index) in slicedLogs"  v-bind:key="line" >{{ line }}</pre>
                
            </v-alert>
            <!-- If there was an error i.e. if the process code is not 0 then show a tooltip and icon -->
            <!-- Add a button that is a dialog that shows the process logs and error (attributes) -->
            <v-dialog v-if="currentProcess" v-model="showProcessDialog" max-width="800px">
                <v-card>
                    <v-card-title>
                        <span class="text-h5">Process Logs</span>
                    </v-card-title>
                    <v-card-text>
                        <v-textarea
                            v-model="currentProcess.logs"
                            readonly
                            rows="10"
                            class="mx-4"
                            style="width: 100%"
                        ></v-textarea>
                    </v-card-text>
                    <v-card-text>
                        <v-textarea v-if="currentProcess.error && currentProcess.error.length > 0"
                            v-model="currentProcess.error"
                            readonly
                            rows="10"
                            class="mx-4"
                            style="width: 100%"
                        ></v-textarea>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary"  @click="showProcessDialog = false">Close</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>
            
            <!-- Add a button that is a dialog that shows the process logs and error (attributes) -->
            <v-switch v-if="$props.env && $props.env.os == 'win32'" v-model="enableWsl" :label="enableWsl ? 'Run via WSL2' : 'Windows Native Command'" />
            <Requirements 
                :choiceIdx="selectedChoiceIndex" 
                v-if="selectedChoice && selectedChoice.requirements" 
                :requirements="selectedChoice.requirements">
            </Requirements>
            <Outputs
                :variables="outputVariables"
            >

            </Outputs>
            <div class="pl-5">
                <v-switch v-model="editMode" label="Edit Mode" />
                <p>Command:</p>
                <v-textarea  v-if="!editMode" v-model="command" label="Command" class="" />
                <v-textarea  v-else v-model="selectedChoice.command"  @input="updateBaseCommand" label="Base Command" /> 
            </div> 
            
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

.container {
    display: flex;
    overflow-y:auto
}
.left {
    flex: 1; /* 25% width */
    font-size: 0.8em; /* adjust as needed */
    max-height: 100%;
    overflow-y: auto;
}

.right {
    flex: 3; /* 75% width */
    overflow-y: scroll;
    max-height: 100%;
    overflow-y: auto;
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
import { ref, shallowRef, defineComponent,  toRaw, onMounted, watch, markRaw, reactive, computed } from 'vue'
import _ from 'lodash';
import { conditionalSets, resolveShorthand } from '../controllers/interpolate'
import NewVariable from './NewVariable.vue';
import String from './inputs/String.vue';
import Static from './inputs/Static.vue'
import File from './inputs/File.vue';
import List from './inputs/List.vue'
import Outputs from './Outputs.vue';
import Num from './inputs/Num.vue'
import Checkbox from './inputs/Checkbox.vue';
import Requirements from './Requirements.vue'
import Spreadsheet from './inputs/Spreadsheet.vue';
export default defineComponent({
    name: "Module", 
    props: {
        containerHeight: {
            required: false, 
            default: "200px"
        
        },
        module: {
            type: Object,
            required: true,
        },
        moduleIdx: {
            type: Number,
            required: true
        },
        env: {
            type: [Object, null],
            default: null
        }
    },
    components: {
        NewVariable: markRaw(NewVariable),
        String: markRaw(String),
        File: markRaw(File), 
        List: markRaw(List),
        Static: markRaw(Static),
        Spreadsheet: markRaw(Spreadsheet),
        Outputs: markRaw(Outputs),
        Num: markRaw(Num),
        Checkbox: markRaw(Checkbox),
        Requirements: markRaw(Requirements),
    },
    setup(props, {emit}) {
        const originalChoice = ref(null);
        let command = ref(null);
        let enableWsl = ref(false)
        let currentProcess = ref(null); // initialize oldCount
        const components = reactive({
            "file": File, 
            "string": String,
            "number": Num,
            "spreadsheet": Spreadsheet,
            "list": List,
            "list-directory": List,
            "list-file": List,
            "static": Static,
            "static-file": Static,
            "static-directory": Static,
            "checkbox": Checkbox, 
            // "files": Files,
            // "dir": Dir,
        })
        let dialogVariable = ref(null);
        const validationStates = reactive({});
        const selectedVariables = ref([])
        const showProcessDialog = ref(false)
        const selectedChoice = shallowRef(null);
        const moduleVariables = reactive({});
        const editMode = ref(false);
        const outputVariables = ref([])
        const selectedChoiceIndex = ref(null)
        const slicedLogs = computed(() => {
            return currentProcess.value.logs.slice(-3);
        })
        const formatVariables = (params: object, variables: any) => {
            // loop through the variables in variables, check if the value is null, if so, then set to empty string
            let formatted_variables = {}
            for (let [key, value] of Object.entries(variables)) {
                if (!value) {
                    formatted_variables[key] = ""
                }
                else {
                    formatted_variables[key] = value
                }
            }
            return formatted_variables
        }
        const updateCommand = () => {
            let formatted_variables = formatVariables(selectedChoice.value.variables, moduleVariables)
            let commandRef = resolveShorthand(selectedChoice.value, {
                ...formatted_variables
            });
            checkNewVariables()
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
        watch(() => enableWsl, (newValue, oldValue) => {
            // if enablewsl is true, then iterate through all files, directories, etc and convert C:, F:, E:, etc to /mnt/c, /mnt/f, /mnt/e, etc, the drive must be lowercase in /mnt/c from C:, and convert \ to /
            if (newValue.value){
                Object.keys(moduleVariables).forEach((key) => {
                    if (moduleVariables[key]) {
                        try {
                            moduleVariables[key] = moduleVariables[key].replace(/\\/g, "/")
                            moduleVariables[key] = moduleVariables[key].replace(/([A-Z]):/g, (match, p1) => `/mnt/${p1.toLowerCase()}`)
                        } catch (err) {
                            console.log(err)
                        }
                    }
                })
                updateCommand()
                let idxwsl = { key: "wsl", type: "executions" }
                let idx = selectedChoice.value.requirements ? selectedChoice.value.requirements.findIndex((f: any) => f.key == idxwsl.key) : -1
                if (idx == -1) {
                    selectedChoice.value.requirements = [idxwsl]
                } else {
                    selectedChoice.value.requirements[idx] = idxwsl
                }
            } else {
                Object.keys(moduleVariables).forEach((key) => {
                    if (moduleVariables[key]) {
                        try {
                            moduleVariables[key] = moduleVariables[key].replace(/\\/g, "/")
                            moduleVariables[key] = moduleVariables[key].replace(/\/mnt\/([a-z])/g, (match, p1) => `${p1.toUpperCase()}:`)
                        } catch (err) {
                            console.log(err)
                        }
                        
                    }
                })
                updateCommand()
                let idx = selectedChoice.value.requirements ? selectedChoice.value.requirements.findIndex((f: any) => f.key == 'wsl') : -1
                if (idx > -1) {
                    selectedChoice.value.requirements.splice(idx, 1)                  
                }
                
            }
            
            
        }, {deep:true})


        watch (() => editMode, (newValue, oldValue )=>{
            // validate all of the variables, iterate through them, check if file or not 
            if (!editMode.value){
                for (let  key of Object.keys(moduleVariables)){
                    let value = moduleVariables[key]
                    let idx = selectedChoice.value.variables[key]
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
            selectedChoice.value.variables = _.cloneDeep(props.module.variables)
            if (props.module.variables){
                let key: keyof typeof props.module.variables;
                for (key in props.module.variables) {
                    let variable = props.module.variables[key]
                    if (variable['output']){
                        variables.push({
                            ...variable,
                            value: moduleVariables[key]
                        })
                    }
                }
                
                outputVariables.value = variables
            }
        };
        const checkNewVariables = ()=>{
            if (selectedChoice.value.command) {
                // Match patterns like '%$...' or '$...' followed by whitespace or '%'
                const newMatches = selectedChoice.value.command.match(/(\$[\w]+)[%|\s]/g);
                // Remove '$' character from matched items
                const newMatchedItems = newMatches ? newMatches.map(match => match.slice(1, -1)) : [];
                // Compare the old matched items with the new ones
                if (JSON.stringify(newMatchedItems.sort()) !== JSON.stringify(oldMatchedItems.value.sort())) {
                    // Execute your logic for when the matched items change
                    newMatchedItems.forEach(newVariable => {
                        // get the index variable of selectedChoices.variables
                        let idx = selectedChoice.value.variables[newVariable['key']]
                        // if idx > -1 then it exists and ignore, otherwise add it to the selectedVariables with window.electronAPI.addedVariableRequest(newVariable)
                        if (idx == -1 ){
                            if (!oldMatchedItems.value.includes(newVariable) && idx == -1) {
                                 window.electronAPI.addedVariableRequest(newVariable)
                                // moduleVariables[newVariable] = null;
                                // recordhistory(newVariable, "variable");
                            }
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
        }
        //watch if the module changes via moduleIdx, if it does, then reset the selectedChoice
        watch(() => selectedChoice , (newValue, oldValue) => {
            let index = props.module.choices.findIndex((choice) => choice ===  newValue.value)
            selectedChoiceIndex.value = index
            
            setOutputVariables()
            checkNewVariables()
            updateSelectedChoiceIndex()
        }, {deep: true});

        
        
        watch(() => props.module, () => {
            selectedChoice.value = null;
            originalChoice.value = null; 
            command.value = "";
            // delete all of the keys in moduleVariables
            Object.keys(moduleVariables).forEach(key => {
                delete moduleVariables[key];
            });
            refresh();
        }, {deep: true});
        const pretty =  (value: string) => {
            try {
                return JSON.stringify(JSON.parse(value), null, 2);
            } catch {
                return value
            }
        }
        // make a reset feature that onmounted used and any time the module changes that resets things to the first choice from selectedChoice options 
        const refresh = () => {
            if (Object.keys(props.module).length >0  && props.module.choices.length > 0) {
                let moduleI = _.cloneDeep(props.module.choices[props.module.defaultchoice ? props.module.defaultchoice : 0])
                selectedChoice.value = moduleI
                selectedChoice.value.conditions = _.cloneDeep(props.module.conditions)
                selectedChoice.value.variables = _.cloneDeep(props.module.variables)


                originalChoice.value = _.cloneDeep(selectedChoice.value);
                
                command.value = selectedChoice.value.command
                if (selectedChoice.value.variables){
                    for (let [key, variable] of Object.entries(selectedChoice.value.variables)){
                        moduleVariables[key] = Array.isArray(variable['target']) ? variable['target'][0] : variable['target'];
                        validationStates[key] = null;
                        changeVariable(key, moduleVariables[key], true);
                    }
                   
                }
                updateCommand();
            }
        };
        // add getRun, which updates the variables and command
        window.electronAPI.getRun((event, res) => {
            Object.keys(res.value.variables).forEach(key => {
                // get index from variables
                moduleVariables[key] = res.value.variables[key]
                changeVariable(key, moduleVariables[key], true)

            })
            // update the command
            selectedChoice.value.command = res.choice.command
            originalChoice.value = _.cloneDeep(selectedChoice.value)
            command.value = selectedChoice.value.command
            updateCommand()
        });
        let runningProcess = -1
        const run = async () => {
            if (!selectedChoice.value)
                return;
            let commandr = toRaw(command.value);
            let vars = JSON.parse(JSON.stringify(moduleVariables))
            // iterate through vars, but attach the type of the variable from the selectedChoice.variables
            Object.keys(vars).map((key) => {
                let idx = selectedChoice.value.variables[key]
                if (idx ){
                    vars[key] = {
                        value: vars[key],
                        type: idx.element
                    }
                }
            })
            // check if all vlaidation states are okay, if not then return swal alert message 
            let validation = Object.values(validationStates).filter((f: any) => f !== true)
            // if (validation.length > 0){
            //     Swal.fire({
            //         title: "Invalid Variables",
            //         text: "Please check the variables and try again.",
            //         icon: "warning",
            //         confirmButtonText: "Okay"
            //     });
            //     return;
            // } else {
                runningProcess = await window.electronAPI.runModule({  
                    key: props.module.name,
                    label: props.module.title,
                    command: commandr,
                    params: vars,
                    outputs: toRaw(outputVariables.value),
                    'pre-execute' : toRaw(selectedChoice.value['pre-execute']),
                    env: selectedChoice.value.env,
                    wsl: enableWsl.value,
                    exec: selectedChoice.value.exec,
                    type: "module"
                });
                window.electronAPI.setSideTab(2)
                recordhistory(null, "run", null);
            // }

                

                
        };
        window.electronAPI.processStatus((event: any, process: Object) => {
            if (process['id'] == runningProcess){ 
                currentProcess.value = process
            }
        });
        window.electronAPI.addedVariable((event, varr)=>{
            let indx = selectedChoice.value.variables[varr.key]
            varr.custom = true
            if (indx) {
                selectedChoice.value.variables[varr.key] = varr
            }
            else {
                selectedChoice.value.variables[indx] = varr
            }
        })
        const deleteVariable = (key: string) => {
            let indx = selectedChoice.value.variables[key]
            if (indx){
                delete selectedChoice.value.variables[key]
                delete moduleVariables[key]
            }
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
                }
            });
        };
        
        const changeVariable = (variableKey, newValue, ignoreHistory: boolean | void) => {
            // Validation
            // find index of variable matches variable key from props.module.variables
            let varr = selectedChoice.value.variables[variableKey]
            let params = _.cloneDeep(selectedChoice.value)
            
            // // Update the variable
            // // Record History
            if (!ignoreHistory) {
                recordhistory(variableKey, "variable", newValue);
            }
            if (editMode.value){
                selectedChoice.value.variables[variableKey].target = newValue;
                varr.target = newValue
                
                let interpolatedValue = resolveShorthand(newValue, {
                    ...selectedChoice.value,
                    ...moduleVariables,
                });
                moduleVariables[variableKey] = interpolatedValue;
            } else {
                if (!selectedChoice.value.variables[variableKey].target){
                    selectedChoice.value.variables[variableKey] = newValue;
                }    
                if (varr.element == 'checkbox'){
                    moduleVariables[variableKey] = newValue ? varr.if : varr.else
                } else {
                    moduleVariables[variableKey] = newValue 
                }
                // let interpolatedValue = resolveShorthand(newValue, {
                //     ...selectedChoice.value,
                //     ...moduleVariables,
                // });
                
                
            }
 
            
            if (varr.element == "file") {
                validateFile(variableKey, moduleVariables[variableKey]);
            }
            else {
                validateText(variableKey);
            }
            


            // // Interpolation
            // let conditions = conditionalSets(params)
            // selectedChoice.value.command = conditions.command
            let variables_not = Object.keys(params.variables).filter((f: string) => {
                return f !== variableKey && params.variables[f]['output'];
            })
            
            variables_not.map((key: string)=>{
                let varr = params.variables[key]
                let interpolatedValue = resolveShorthand(varr.target, {
                    ...selectedChoice.value,
                    ...moduleVariables
                });
                moduleVariables[key] = interpolatedValue;
            })
            
            setOutputVariables()
            // // // Re-interpolate command
            updateCommand();
        };
        window.electronAPI.getVariable((event, params: object) => {
            editMode.value = params['default']
            // moduleVariables[params['variable']] = params['value']
            changeVariable(params['variable'], params['value'], true)
        });

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
            const variable = selectedChoice.value.variables[key]
            if (variable && !variable.output) {
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
                const variable = props.module.variables[key]
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
        const selectedItem = ref(null);
        const fileInputRef = ref(null)

        const loadYaml = () =>{
            let file = fileInputRef.value.files[0]
            emit('loadYaml', file)
        }
        return {
            slicedLogs,
            loadYaml,
            pretty, 
            choices: props.module.choices,
            selectedChoice,
            selectedItem,
            showProcessDialog,
            currentProcess,
            enableWsl,
            updateBaseCommand,
            selectedVariables,
            components,
            originalChoice,
            outputVariables,
            deleteVariable,
            fileInputRef,
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
})
</script>
