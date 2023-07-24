<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  
  <v-row>
    <v-col sm="12">
      <v-card>
        <v-card-title>
          Customize
        </v-card-title>
        <v-card-text>
          <v-btn
            @click="addCustomElement"

          > Add Custom Element
          </v-btn>
          <v-select
            :items="elements"
            v-model="element"
            hint="Select element type to add"
            item-value="value"
            item-text="label"
            persistent-hint
            return-object
            single-line
          >
            

          </v-select>
          <v-select
            :items="binds"
            v-model="staged.bind"
            hint="Bind type within Docker container"
            v-if="element.value == 'file' || element.value == 'dir'"
            persistent-hint solo placeholder="Bind direct path or directory or path (for files)"
            single-line
          >
            

          </v-select>
          <v-text-field
            v-model="staged.target"
            hint="Target inside the Docker Container"
            persistent-hint single-line
          >
          </v-text-field>
          <v-text-field
            v-model="staged.source"
            hint="Source value outside the Docker Container"
            persistent-hint single-line
          >
          </v-text-field>
         
          <v-text-field
            v-model="staged.name"
            hint="Key of variable, set differently than other keys"
            persistent-hint 
          >
          </v-text-field>
          <v-text-field
            v-model="staged.label"
            hint="Name of variable"
            persistent-hint 
          >
          </v-text-field>
          <v-text-field
            v-model="staged.hint"
            hint="Hint of variable"
            persistent-hint 
          >
          </v-text-field>
          
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<script>

import FileService from '@/services/File-service.js'
export default {
	name: 'customize',
  components:{
  },
  data(){
    return {
      elements: [
        {
          label: "String", 
          value: "string"
        },
        {
          label: "File", 
          value: "file"
        },
        {
          label: "Directory", 
          value: "dir"
        },
        {
          label: "Number", 
          value: "number"
        }
      ],
      element: {
        label: "String", 
        value: "string"
      },
      binds: ['self', 'directory'],
      staged: {
        element: "string", 
        target: null,
        name: null,
        source: null,
        cmd: null,
        custom:true
      }
    }
  },
  methods:{
    addCustomElement(){
      this.staged.element = this.element.value
      this.staged.custom = true
      console.log("add custom element", this.staged)
      this.$emit("addCustomElement", this.staged)
    }
  },
  mounted(){
    const $this = this;
    console.log("customize mounted")
  },
  
    
};
</script>
