<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <v-card id="nextstrain">
    <v-btn class="btn tabButton" v-on:click="forceRerender()"
        v-tooltip="{
          content: 'If Rampart does not appear given a success message, try to refresh here. If still no update, check Log Streams.',
          placement: 'top',
          classes: ['info'],
          trigger: 'hover',
          targetClasses: ['it-has-a-tooltip'],
          }"
      > Refresh
        <v-icon class="ml-3" small >$sync</v-icon>
    </v-btn>
      <v-tabs 
        v-model="tab" 
        show-arrows centered
        next-icon="$arrow-alt-circle-right"
        prev-icon="$arrow-alt-circle-left"
        icons-and-text 
        class=""
        color="blue-grey"
        slider-color="light"
      >
        <v-tab   v-for="(option, serviceIdx) in options" :title="option.title" :key="serviceIdx">
            {{option.title}}				
            <v-icon @click="open(option.data)" class="mb-4" small color="primary">$external-link-alt</v-icon>
        </v-tab>
        
        <v-tab-item v-for="(option, serviceIdx) in options" :title="option.title" :key="serviceIdx">
          
            <v-row class=" mt-3 ml-2 mr-3 ">
              <object v-if="show" type="text/html"  :id="`nextstrainObj-${serviceIdx}`" class="renderObj p-0 m-0" :data="option.data"></object>
            </v-row>
        </v-tab-item>
      </v-tabs>
    
      
        
  </v-card>
</template>

<script>
  export default {
    name: 'nextstrain',
    props: ['data'],
    data(){
      return {
        fastqDir:null,
        tab:0,
        options: [
          {
            title: "Nextstrain Default",
            data: "https://nextstrain.org/ncov/global"
          },
          {
            title: "Nextstrain AKU",
            data: "https://nextstrain.org/community/AKU-CITRIC-Center-for-Bioinformatics/ncov/Pakistan"
          }
        ],
        show:true
      }
    },
    computed: {
    myProps() {
      const data= this.data
        return { 
          data
        }

      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      },
      forceRerender(ref){
        const $this =this
        $this.show = false
        setTimeout(()=>{
          $this.show = true
        },500)
      },
    },
  };
</script>
<style>
#nextstrain{
  overflow-y:auto;
  width: 100%;
}
#nextstrainObj{
  position: relative; 
  background: none; 
  width:100%; 
  overflow-y:auto; 
}
</style>
