<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  	<v-card class="mx-2 mt-3" >
        <!-- <v-select
            :items="options" 
            label="Type of Customizable Entry (Service, Module, Procedure)" 
            v-model="selected_option"
            
        >
        </v-select> -->

        <v-select 
            :items="types"
            v-model="selected_type" class="mx-4 mt-3"
            label="Type of Custom Generator (Text, File.yml)"
        >
        </v-select>

        <v-select
            v-if="selected_type == 'text'"
            :items="textTypes"
            v-model="textType"
            :label="`Create Custom Module from ${selected_type}`"
            
        >
        </v-select>
        <v-textarea
            v-model="text"
            rows="8"
            clearable
            clear-icon="$times-circle"
            v-if="selected_type == 'text'"
        
        >
        </v-textarea>
        <div v-else @drop.prevent="addDropFile" @dragover.prevent>
            <v-file-input
                v-model="file" 
                label="Input Custom YAML or JSON file"
                
            >
            </v-file-input>
        </div>
        <v-btn
            class="btn " color="primary"
            @click="save()" 
        > Save Input
        </v-btn>
  	</v-card>
</template>

<script>
import FileService from '@/services/File-service.js'
const YAML = require("js-yaml") 
export default {
	name: 'customgenerator',
     
    data(){
        return {
            types: ['text', 'file'],
            text:null,
            file: null, 
            textType: 'YAML',
            textTypes: ['YAML', 'JSON'],
            selected_type: 'file'

        }
    },
	methods: {
        addDropFile(e) { 
            this.file = e.dataTransfer.files[0]; 
        },
        async save(){
            try{
                if (this.selected_type == 'text'){
                    let text;
                    if (this.textType == 'YAML'){
                        text = YAML.load(this.text)
                    } else{
                        text = JSON.load(this.text)
                    }
                    console.log(this.textType, this.text)
                    await FileService.saveModuleText({
                        source: this.text,
                        type: this.textType
                    })
                } else {
                    await FileService.saveModuleFile({source: this.file.path})
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