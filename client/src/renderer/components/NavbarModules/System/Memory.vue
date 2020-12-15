<template>
    <b-table
      striped
      hover
      class="text-center"
      :fields="fields_mem"
      :items="[resources.mem]"
    >
    <template  v-slot:cell(total)="row">
      {{convert_gb(row.item.total, 'B')}}
    </template>
    <template  v-slot:cell(active)="row">
      {{convert_gb(row.item.active, 'B')}}
    </template>
    <template  v-slot:cell(available)="row">
      <span v-if="row.item.available < 1000000000" class="center-align-icon warn-icon" style="margin:auto; text-align:center" >
        <font-awesome-icon v-tooltip="{
        content: 'Low available memory detected (<1GB), some pipelines or installs may fail',
        placement: 'top',
        classes: ['warning'],
        trigger: 'hover',
        targetClasses: ['it-has-a-tooltip'],
        }" class="warn-icon" icon="exclamation"  size="sm" />
        {{convert_gb(row.item.available, 'B')}}
      </span>
      <p v-else >{{convert_gb(row.item.available, 'B')}}</p>
    </template>
    </b-table>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        fields_mem: [
          {
            key: 'total',
            label: 'Total Mem (GB)'
          },
          {
            key: 'active',
            label: 'Using Mem (GB)'
          },
          {
            key: 'available',
            label: 'Available Mem (GB)'
          }
        ]
      }
    },
    mounted(){
    },
    methods: {
      convert_gb(size, val){
        if (val =='MB'){
          return size / 1000 
        } else {
          return (size / 1000000000).toFixed(2)
        }
      }
    }
  };
</script>

<style scoped>

</style>