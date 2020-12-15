<template>
  <b-table
    class="text-center"
    :fields="fields_disk"
    :items="resources.disk"
  >
    <template  v-slot:cell(used)="row">
    <p>{{convert_gb(row.item.used, 'B')}}</p>
    </template>
    <template  v-slot:cell(size)="row">
      <p>{{convert_gb(row.item.size, 'B')}}</p>
    </template>
    <template  v-slot:cell(available)="row">
      <span  v-if="hoverElement && hoverElement.estimated_size > convert_gb(row.item.size - row.item.used, 'B')" class="center-align-icon warn-icon"> 
          <font-awesome-icon icon="exclamation" size="sm" />
          {{convert_gb(row.item.size - row.item.used, 'B')}}
      </span>
      <p v-else> {{convert_gb(row.item.size - row.item.used, 'B')}}</p>
    </template>
  </b-table>
</template>

<script>
  export default {
    props: ['resources', 'hoverElement'],
    data () {
      return {
        fields_disk: [
          {
            key: 'fs',
            label: 'Partition'
          },
          {
            key: 'mount',
            label: 'Mount'
          },
          {
            key: 'use',
            label: '% Used'
          },
          {
            key: 'used',
            label: 'Used (GB)'
          },
          {
            key: 'available',
            label: 'Available'
          },
          {
            key: 'size',
            label: 'Size (GB)'
          },
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
  .title {
    color: #888;
    font-size: 18px;
    font-weight: initial;
    letter-spacing: .25px;
    margin-top: 10px;
  }

  .items { margin-top: 8px; }

  .item {
    display: flex;
    margin-bottom: 6px;
  }

  .item .name {
    color: #6a6a6a;
    margin-right: 6px;
  }

  .item .value {
    color: #35495e;
    font-weight: bold;
  }
</style>