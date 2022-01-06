<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="customgenerator" style="text-align:center" >
	
  	<div style="text-align:center; margin:auto; width:100%" >
        <b-form-group
            label="Type of Customizable Entry (Service, Module, Procedure)"            
            label-align-sm="center"
            label-size="sm"
            id="manifest_label"
            label-for="filterInput"
            class="mb-0 formGroup"						           
        > 
            <b-form-select
                :options="options" 
                v-model="selected_option"
                
            >
            </b-form-select>
        </b-form-group>
        <b-form-group
            label="Type of Custom Generator (Text, File.yml)"
            label-align-sm="center"
            label-size="sm"
            id="manifest_label"
            label-for="filterInput"
        > 
            <b-form-select
                :options="types"
                v-model="selected_type"
                
            >
            </b-form-select>
        </b-form-group>
        <b-form-group
            :label="`Create Custom ${selected_option} from ${selected_type}`"
            label-align-sm="center"
            label-size="sm"
            id="manifest_label"
            label-for="filterInput"
            class="mb-0 formGroup"						           
        >
            <b-form-select
                v-if="selected_type == 'text'"
                :options="textTypes"
                v-model="textType"
                
            >
            </b-form-select>
            <b-form-textarea
                v-model="text"
                rows="8"
                v-if="selected_type == 'text'"
            
            >
            </b-form-textarea>
            
            <b-form-file
                v-model="file"
                v-else
            >
            </b-form-file>
            <b-button
                class="btn sideButton"
                @click="save()"
            > Save Input
            </b-button>
        </b-form-group>
  	</div>
  </div >
</template>

<script>
import FileService from '@/services/File-service.js'
const YAML = require("yaml") 
export default {
	name: 'customgenerator',
     
    data(){
        return {
            options: ['Module', 'Procedure', 'Service'],
            selected_option: 'Procedure',
            types: ['text', 'file'],
            text:null,
            file: null, 
            textType: 'YAML',
            textTypes: ['YAML', 'JSON'],
            selected_type: 'file'

        }
    },
	methods: {
        async save(){
            try{
                if (this.selected_type == 'text'){
                    let text;
                    console.log(this.text)
                    if (this.textType == 'YAML'){
                        text = YAML.parse(this.text)
                    } else{
                        text = JSON.parse(this.text)
                    }
                    if (this.selected_option == 'Procedure'){ 
                        await FileService.saveProcedureText({
                           source: this.text,
                           type: this.textType

                        })
                    } else if (this.selected_option == 'Service'){
                       await FileService.saveServiceText({
                           type: this.textType,
                           source: this.text
                        })

                    } else{
                       await FileService.saveModuleText({
                           source: this.text,
                           type: this.textType
                        })
                        
                    }

                } else {
                    if (this.selected_option == 'Procedure'){
                       await FileService.saveProcedureFile({source: this.file.path})
                    } else if (this.selected_option == 'Service'){
                       await  FileService.saveServiceFile({source: this.file.path})
                    } else{
                        await FileService.saveModuleFile({source: this.file.path})
                    }
                }
            } catch(error){
                this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                    title:  "Could not parse text properly",
                    text: error
                })
            } finally {
                this.$swal({
                    title: "Saved Custom Configuration",
                    icon: 'success',
                    showConfirmButton: true,
                    allowOutsideClick: true
                });
            }
        },
		open (link,e) {
			e.stopPropagation()
        	this.$electron.shell.openExternal(link)
      	}
	}
};
</script>

<style>


</style>