<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="file" >
      {{reference.reference}}
  	<b-form-file 
        aria-describedby="seq_file" 
        :value="reference.reference.src"
        @input="updateSrc('basestack_consensus', $event)"
        :directory = reference.config.directory
        :placeholder = reference.config.placeholder
        ref="seq"
        :file-name-formatter="formatNames"
        >
    </b-form-file>
  </div>
</template>

<script>
export default {
	name: 'file',
    data() {
        return {
            data: null,
            test: "placeholder"
        }
    },
    computed: {
        system() {
            return this.$store.getters.getSystem
        },
        meta() {
            return this.$store.getters.getMeta
        },
        status() {
            let status = this.$store.getters.getStatus
            return status
        },
        staged() {
            return this.$store.getters.getStaged
        }
    },
	methods: {
		formatNames(files) {
        	return files.length === 1 ? `${files[0].name} selected` : `${files.length} files selected`
      	},
        updateSrc(key, event){
            console.log(event)
            this.$store.dispatch("UPDATESTAGEDINPUT", {name: "basestack_consensus", value: { filename: event.name, filepath: event.path }, attr: '', target: 'pipelines'} )
        },
	},
    props: {
        reference: {
            required:true
        }
    },
    mounted(){
        console.log("mounted file", this.reference)
        
    }
    
};
</script>

<style>
</style>