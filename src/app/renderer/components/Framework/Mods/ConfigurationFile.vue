<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="configuration-file" >  
    <v-badge left style="width: 92%" x-small color="orange">
        <template x-small v-slot:badge>
            <v-tooltip top >
                <template v-slot:activator="{ on }">
                    <v-icon   x-small v-on="on"  >$pencil-alt</v-icon>
                </template>
                Edit Me!    
            </v-tooltip>
        </template>
        <tree-view :data="source"  class=" mt-2 mb-3 pt-0  elevation-5 treeview " style="" @change-data="onChangeData"
                :options="{
                    maxDepth: 3, 
                    rootObjectKey: 'root',
                    modifiable: true,
                    limitRenderDepth: false
                }"
            >
        </tree-view>
    </v-badge>
    

  </div>
</template>

<script>
export default {
	name: 'configuration-file',
    data() {
        return {
            value: null,
            test: "placeholder"
        }
    },
    computed: {
        items(){
            return [
                {
                    id: 1,
                    name: 'Configuration File',
                    children: [
                        { ...this.value, id:1, name: "yes"}

                    ],
                    open: [1, 2],
                    search: null,
                    caseSensitive: false,
                }
            ]
        }
    },
	methods: {
        onChangeData(newValue){
            this.$emit("updateValue", newValue )
        }
	},
	props: ['source', 'status', 'service', 'variable'],
    mounted(){
        this.value = this.source
    },
    watch: {
        value: {
            deep: true,
            handler(newValue, oldValue){
                this.$emit("updateValue", newValue )
            }
        },
        source: {
            deep:true, 
            handler(newValue){
            }
        }
    }
    
};
</script>

<style>
    .tree-view-item-key {
        color: rgb(144, 0, 255);
    }
    .tree-view-item-value {
        color: rgb(81, 112, 106);
        overflow-x:hidden;
        width: 92%;
    }
    .treeview{
        padding-left: 2%;
        padding-right: 1%;
        padding-top: 2%;
        padding-bottom: 2%;
        overflow-x:hidden
    }
    .tree-view-item-value-string {
        overflow-x:hidden;
    }
    
</style>