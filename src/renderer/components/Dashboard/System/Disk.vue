<template>
    <v-row>
      <div class="label-entry"><strong class="text-center">Disk</strong><br></div>
      <div
        v-for="disk in resources.disk"
        :key="disk.fs"
        class="outer-entry"
      >
      <strong class="outer-entry-right">{{ disk.fs }}</strong><br>
      <div v-for="entry in fields_disk" 
          :key="entry.key"
        >
          <p  class="entry-label" >{{ entry.label }}</p>
          <p  class="entry-description"> {{ ( disk[entry.key] ?   ( entry.convert ?  convert_gb(disk[entry.key], 'B')  :  disk[entry.key]  ) : 'None' )   }}</p>
      </div>
      <hr>
      </div>
  </v-row>
</template>

<script>
  export default {
    props: ['resources', 'hoverElement'],
    data () {
      return {
        fields_disk: [
          {
            key: 'mount',
            label: 'Mount'
          },
          {
            key: 'use',
            label: '% Used',
          },
          {
            key: 'used',
            label: 'Used (GB)',
            convert: true,
          },
          {
            key: 'available',
            label: 'Available',
            convert: true,
          },
          {
            key: 'size',
            label: 'Size (GB)',
            convert: true,
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
  .rowClass {
    height: 10px;
  }
</style>