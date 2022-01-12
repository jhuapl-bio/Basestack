<template>
  <div id="list" >
       <div style="text-align:right">
            <v-btn v-on:click="addManifestRow(0)"  v-v-tooltip.hover
                title="Add a row to the list" 
                class="btn sideButton" >
                <span >
                    <font-awesome-icon icon="plus"/>
                </span>
            </v-btn>
        </div>
        <table class="table table-striped" style="text-align:center">
            <thead class="thead-dark">
                <th v-for="(head, index) in source.header" :key="index" scope="col">
                    {{head}}
                </th>
            </thead>
            <draggable v-model="source.source" tag="tbody">
                <tr v-for="(element, index) in source.source" :key="index">
                    <td v-for="col in Object.keys(element)"
                        :key="col"
                    >
                        <v-input
                            @input="changeID($event, index, col)"
                            class="formGroup-input"
                            hint="Input element"
                            :value="element[col]"
                            type="text"
                        ></v-input>

                    </td>
                    <v-btn style="text-align:center; margin:auto; justify-content:center" v-on:click="rmManifestRow(index)"  class="" >
                        <span>
                            <font-awesome-icon  variant="error" icon="minus"/>
                        </span>
                    </v-btn>
                </tr>
            </draggable>
        </table>
        <!--
        <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.minLength">Specify one or more barcode</div>
        <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.stateManifestID">
            <span  
                style="text-align:center"  >
                No NTC present
                <font-awesome-icon class="help" icon="question-circle" v-v-tooltip.hover
                title="One Sample ID must have NTC (No Template Control)" />
            </span>
        </div>
         -->
  </div>
</template>
<script>

import draggable from 'vuedraggable'


export default {
	name: 'multi-select',
    components: {
        draggable
    },
	methods: {
		addManifestRow(index){
            console.log(this.source,"<<<")
            let emptyRow  = {}
            let keys = this.source.header
            keys.forEach((key)=>{
                emptyRow[key] = null
            })
			this.source.source.splice(index, 0, emptyRow)
            // this.$set( this.values, this.values)
		},
		rmManifestRow(index){
			this.source.source.splice(index, 1)
		},
        changeID(val, index, index2){
			this.$set(this.source.source[index], index2, val)
		},
		moveUpRow(index){
			const tmp =  this.values[index]
			this.$set(this.source.source, index ,this.source.source[index-1] )
			this.$set(this.source.source, index-1, tmp)
		},
	},
    props: ['source', 'status', 'service', "variable"],
    data (){
        return {
            values: [],
        }
    },
    mounted(){
        console.log("mounted multiselect")
    }, 

    
};
</script>

<style>
</style>