<template>
  <b-table
    striped
    hover
    v-if="resources"
    class="text-center"
    :fields="fields_cpu"
    :items="[resources.cpu]"
  >  

  <template  v-slot:head(virtualization)="cell">
    <span  
      style="text-align:center" v-b-tooltip.hover.top 
        title="CPU's Support for Virtualization. Required for Docker. This may show disabled for Virtual Machines despite Docker still being runnable." >Virtualization
      <font-awesome-icon class="help" icon="question-circle"  />
    </span>
  </template>
  <template  v-slot:cell(virtualization)="cell">
      <span 
        :class="[cell.value ? 'center-align-icon success-icon' : 'center-align-icon warn-icon']" 
        style="margin:auto; text-align:center" v-tooltip="{
              content: (cell.value ? 'Supported' : 'Not Supported'),
              placement: 'top',
              classes: ['info'],
              trigger: 'hover',
              targetClasses: ['it-has-a-tooltip'],
              }">
              <font-awesome-icon :icon="cell.value ? 'check' : 'times-circle' " size="sm" />
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
