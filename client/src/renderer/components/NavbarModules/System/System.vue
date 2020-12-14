<template>
  <b-row>
    <b-col sm="12">
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_system"
        :items="[info_table]"
      >
      </b-table>
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_mem"
        :items="[resources.mem]"
      >
      <template  v-slot:cell(total)="row">
        <p>{{convert_gb(row.item.total, 'B')}}</p>
      </template>
      <template  v-slot:cell(active)="row">
        <p>{{convert_gb(row.item.active, 'B')}}</p>
      </template>
      <template  v-slot:cell(available)="row">
        <p>{{convert_gb(row.item.available, 'B')}}</p>
      </template>
      </b-table>
      <b-table
        striped
        hover
        class="text-center"
        :fields="fields_cpu"
        :items="[resources.cpu]"
      >

      </b-table>
      <b-table
        striped
        hover
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
      </b-table>

      <!-- <b-form-text class="text-center" disabled> -->
      <div class="text-center">  
        <span v-if="!docker">Docker is not running or installed</span>
        <span v-else>Docker is installed and running</span>
      </div>
      <!-- </b-form-text> -->

    </b-col>
  </b-row>
</template>

<script>
  export default {
    props: ['resources', 'docker'],
    data () {
      return {
        fields_system: [
          {
            key: 'basestack',
            label: 'Basestack'
          },
          {
            key: 'electron',
            label: 'Electron'
          },
          {
            key: 'node',
            label: 'Node'
          },
          {
            key: 'os',
            label: 'OS Platform',
          },
          {
            key: 'vue',
            label: 'Vue',
          }
        ],
        info_table: {
          basestack: process.env.version_basestack,
          electron: process.versions.electron,
          node: process.versions.node,
          os: require('os').platform(),
          vue: require('vue/package.json').version
        },
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
            key: 'manufacturer',
            label: 'Manufacturer'
          }
        ],
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
        ],
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