<template>
  
  <v-card
    class="mx-5"
    style="min-height: 100vh"
  >
    
    <v-divider></v-divider>
    
    
  
  </v-card>

</template>

<script>
import ListParams  from '@/components/Framework/Mods/ListParams.vue';
import Render from "@/components/Framework/Mods/Render.vue"
export default {
    props: ['variables', 'service', 'status'],
    components:{
      ListParams,
      Render
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
        mini:false,
        drawer: true,
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