<template>
  <b-row>
    <div class="label-entry" ><strong class="text-center">Processor</strong><br></div>
    <!-- <b-col sm="12" style=""> -->
      <div 
        v-for="entry in fields_cpu"
        :key="entry.key"
        class="entry"
      >

          <p  class="entry-label" v-if="resources.cpu[entry.key]">{{ entry.label }}</p>
          <p class="entry-description"> {{ resources.cpu[entry.key] }}</p>
      </div>
    <!-- <b-form> -->
        <!-- <b-form-group
          label="Virtualization"
          v-for="[entry, key] in Object.entries(resources.cpu)"
          :key="key"
          label-for="input-1"
          v-b-tooltip.hover.top 
          title="CPU's Support for Virtualization. Required for Docker. This may show disabled for Virtual Machines despite Docker still being runnable." 
        >
        </b-form-group> -->
    <!-- </b-form> -->
    <!-- <b-table
      striped
      hover
      v-if="resources"
      class="text-center"
      :fields="fields_cpu"
      :items="[resources.cpu]"
    >  
    
    <template  v-slot:head(virtualization)>
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

    </b-table> -->
    <!-- </b-col> -->
  </b-row>
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
