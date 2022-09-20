<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-list>
    <v-list-item  v-for="key of Object.keys(check)" :key="key">
          <v-list-item-content>
            <v-list-item-title>
              {{key}}
            </v-list-item-title>
            <v-checkbox
              v-model="check[key][index]"  v-for="(permission, index) in check[key]" :key="`${key}-${index}`"
              :label="`${labels[index]}`"
              on-icon="$check-square"
              class="align-center justify-center text-xs-center mr-2" 
              off-icon="$square"
              color="primary"
            >
            </v-checkbox>      
          </v-list-item-content>
        </v-list-item>
        <v-btn
          color="primary"
          dark 
          @click="makeUsable(source, $event)"
        >
          Change Permissions
        </v-btn>
    </v-list>
</template>

<script>
export default {
	name: 'fileselect',
  data() {
      return {
          test: "placeholder",
          value: null,
          process:null,
          dialog: false,
          labels: ['read', 'write', 'execute'],
          check: {
            User: [1,1,1],
            Group: [1,0,1],
            Other: [1,0,1],
          },
          cached: false
      }
  },
  computed: {
    hint(){
      let hint = ""
      if (this.variable.target){
        hint =`${this.variable.target}`
      }
      return hint
    },
  },
	methods: {
    addDropFile(e) { 
      this.value = e.dataTransfer.files[0]; 
    },
    makeUsable(item, event){
        this.$electron.ipcRenderer.send("sudoPrompt", { item: item, perms: this.check } )
		}, 
    
    updateValidity(){
    }
    
    
    


	},
	props: ['source', 'variable'],
  mounted(){
    this.process = process.env
  },
  
  watch: {
  }
    
};
</script>

<style>
</style>