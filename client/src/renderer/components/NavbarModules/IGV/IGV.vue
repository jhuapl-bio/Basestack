<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="IGV">
      <object type="text/html" data="https://igv.org/app/" id="igvObj" >
      </object>      
  </div>
</template>

<script>
  

  export default {
    name: 'IGV',
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  };
</script>
<style>
#IGV{
  height:100%;
  overflow-y:hidden;
  width: 100% !important;
}
#igvObj{
  min-height: 90vh;
  position: relative; 
  background: none; 
  /*border:1px solid #000;  */
  width:100%; 
  height: 100%;
  overflow-y:auto; 
}
</style>
