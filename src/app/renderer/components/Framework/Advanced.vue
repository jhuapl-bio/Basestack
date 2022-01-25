<template>
  <v-card
    class="mx-auto"
    tile
  >
  <ListParams
    :items="additionals"
    :defaultHeaders="headers"
    :service="service"
    :title="'Inputs and Variables'"
  >
  </ListParams>
    
  
  </v-card>

</template>

<script>
import ListParams  from '@/components/Framework/Mods/ListParams.vue';
import FileService from '@/services/File-service.js'

export default {
    props: ['variables', 'service'],
    components:{
      ListParams,
    },
    beforeDestroy: function(){
      if (this.interval){
        try{
          clearInterval(this.interval)
        } catch(err){
          console.error(err)
        }
      }
      if (this.intervalProgress){
        try{
          clearInterval(this.intervalProgress)
        } catch(err){
          console.error(err)
        }
      }
    },
    data () {
      return { 
        
        selectedItem: 0,
        additionals: [

        ],
        headers: [
          {
            text: "Actions",
            value: "actions",
            sortable: true
          },
          {
            text: "Param",
            value: "label",
            sortable: true
          },
          {
            text: "Bind",
            value: "bind",
            sortable: true
          },
          {
            text: "Source",
            value: "source",
            sortable: true
          },
          {
            text: "Target",
            value: "target",
            sortable: true
          }
        ]
        
      }
    },
    mounted(){
    },
    watch:{
      variables(newValue, oldValue){
        console.log(newValue)
        for (let [key, value ] of Object.entries(newValue)){
          this.additionals.push(value)
        }
      }
    },
    methods: {
      
      


    },

    computed: {
      additionals_formatted(){

        console.log(this.additionals)
        return
      }

    }
  };
</script>

<style scoped>

</style>