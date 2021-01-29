<template>
  <b-table
    striped
    hover
    v-if="resources"
    class="text-center"
    :fields="fields_cpu"
    :items="[resources.cpu]"
  >  
  <template  v-slot:cell(virtualization)="cell">
      <span 
        :class="[cell.value.virtualization ? 'center-align-icon success-icon' : 'center-align-icon warn-icon']" 
        style="margin:auto; text-align:center" v-tooltip="{
              content: (cell.value.virtualization ? 'Supported' : 'Not Supported'),
              placement: 'top',
              classes: ['info'],
              trigger: 'hover',
              targetClasses: ['it-has-a-tooltip'],
              }">
              <font-awesome-icon :icon="cell.value.virtualization ? 'check' : 'times-circle' " size="sm" />
      </span> 
  </template>

  </b-table>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_cpu:[
          {
            key: 'brand',
            label: 'CPU Brand'
          },
          {
            key: 'cores',
            label: 'Cores'
          },
          {
            key: 'physicalCores',
            label: 'Physical Cores'
          },
          {
            key: 'manufacturer',
            label: 'Manufacturer'
          },
          {
            key: 'virtualization',
            label: 'Virtualization Support'
          }
        ]
      }
    },
    mounted(){
    },
    methods: {

    }
  };
</script>
<style>
</style>
