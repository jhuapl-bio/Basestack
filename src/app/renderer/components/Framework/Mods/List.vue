<template>
  <div id="list" >
    <b-form-group
        label="List"
        label-align-sm="center"
        label-size="sm"
        id="manifest_label"
        label-for="filterInput"
        class="mb-0 formGroup"						           
        >
        <template slot="label" v-if="source.tooltip">
            <span v-b-tooltip.hover
                :title="source.tooltip" 
                style="text-align:center"  >
                <font-awesome-icon class="help" icon="question-circle"  />
            </span>
        </template>
       <div style="text-align:right">
            <!-- <b-form-input
                v-model="selectedHistory.runDir.manifest.filename"
                label="Filename"
                class="formGroup-input"
                type="text"
                required
                :state="selectedHistory.runDir.manifest.validation"
                placeholder="manifest.txt"
            ></b-form-input>
            <b-form-invalid-feedback 
                v-b-tooltip.hover
                title="You will need to create it manually on the left or make it directly within the run folder"
                :state="selectedHistory.runDir.manifest.validation">
                manifest.txt not found. 
            </b-form-invalid-feedback>
            <hr> -->
            <b-button v-on:click="addManifestRow(0)"  v-b-tooltip.hover
                title="Add a row to the list" 
                class="btn sideButton" >
                <span >
                    <font-awesome-icon icon="plus"/>
                </span>
            </b-button>

        </div>
        <b-input-group-append id="manifest"
        >	
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
                            <b-form-input
                                @input="changeID($event, index, col)"
                                class="formGroup-input"
                                :value="element[col]"
                                type="text"
                            ></b-form-input>

                        </td>
                        <b-button style="text-align:center; margin:auto; justify-content:center" v-on:click="rmManifestRow(index)"  class="" >
                            <span>
                                <font-awesome-icon  variant="error" icon="minus"/>
                            </span>
                        </b-button>
                    </tr>
                </draggable>
            </table>
            <!-- <draggable v-model="source.source" group="people" @start="drag=true" @end="drag=false">
                <div style="display:flex; width: 100%;  solid black 1px" v-for="(element, index) in source.source" :key="index">
                    <b-form-input
                        @input="changeID($event, index, 0)"
                        class="formGroup-input"
                        :value="element[col]"
                        v-for="col in Object.keys(element)"
                        :key="col"
                        type="text"
                    ></b-form-input>
                     <b-button v-on:click="rmManifestRow(index)"  class="btn cntrButton" >
                        <span>
                            <font-awesome-icon   icon="minus"/>
                        </span>
                    </b-button>
                </div>
            </draggable> -->
            <!-- <b-table
                show-empty
                small
                responsive
                id="manifest_table"
                class="formGroup-input"
                :fields="source.header"
                :items="source.source"
                sticky-header="250px"	
            > -->
                <!-- <template  v-slot:cell()="row"> -->
                    <!-- <b-form-input
                        v-model.trim="selectedHistory.runDir.manifest.entries[row.index].barcode"
                        label="barcode"
                        @input="changeBarcode($event, row.index)"
                        class="formGroup-input"
                        type="text"
                        :disabled="!isNew && !overrideManifest"
                        :state="stateValidationNull(row.item.barcode)"
                        placeholder="NB01"
                    ></b-form-input>									  -->
                <!-- </template> -->
                <!-- <template  v-slot:cell(id)="row">
                    <b-form-input
                        v-model.trim="selectedHistory.runDir.manifest.entries[row.index].id"
                        label="barcode"
                        @input="changeID($event, row.index)"
                        class="formGroup-input"
                        type="text"
                        :disabled="!isNew && !overrideManifest"
                        placeholder="MDHP-00057"
                        :state="stateManifestID(row.item.id)"							          
                    ></b-form-input>									 
                </template> -->
                <!-- <template  v-slot:cell(id)="row">
                     <b-form-input
                        @input="changeID($event, row.index, 0)"
                        class="formGroup-input"
                        :value="row.value"
                        type="text"
                    ></b-form-input> {{row}}
                    <b-row class="nopadcolumn">
                        <b-col sm="2">
                            <b-button v-on:click="addManifestRow(row.index)"  class="btn cntrButton" >
                                    <span>
                                        <font-awesome-icon   icon="plus"/>
                                    </span>
                            </b-button>
                        </b-col>
                        <b-col sm="2" v-if="source.source.length > 1">
                            <b-button v-on:click="rmManifestRow(row.index)"  class="btn cntrButton" >
                                <span>
                                    <font-awesome-icon   icon="minus"/>
                                </span>
                            </b-button>
                        </b-col>
                        <b-col sm="2" v-if="source.source.length > 1 && row.index > 0">
                            <b-button v-on:click="moveUpRow(row.index)"  class="btn cntrButton" >
                                <span>
                                    <font-awesome-icon   icon="angle-up"/>
                                </span>
                            </b-button>
                        </b-col>
                        <b-col sm="2" v-if="source.source.length > 1 && row.index < source.source.length-1">
                            <b-button v-on:click="moveDownRow(row.index)"  class="btn cntrButton" >
                                <span>
                                    <font-awesome-icon   icon="angle-down"/>
                                </span>
                            </b-button>
                        </b-col>
                    </b-row>
                </template>

                
            </b-table> -->
        </b-input-group-append>
        <!--
        <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.minLength">Specify one or more barcode</div>
        <div class="error" style="text-align:center" v-if="!$v.selectedHistory.runDir.manifest.entries.stateManifestID">
            <span  
                style="text-align:center"  >
                No NTC present
                <font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
                title="One Sample ID must have NTC (No Template Control)" />
            </span>
        </div>
         -->
    </b-form-group>
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