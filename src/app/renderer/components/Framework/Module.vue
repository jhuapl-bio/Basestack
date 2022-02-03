<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  
    <v-card
      color="grey lighten-4"
      tile class="py-4"
    >
      <v-toolbar class="my-5 ">
        <!-- <v-app-bar-nav-icon v-if="selected.icon"><v-icon>{{ '$' + selected.icon }}</v-icon></v-app-bar-nav-icon> -->

        <v-toolbar-title>{{selected.title}}</v-toolbar-title>
        <!-- <v-subheader>{{selected.title}}</v-subheader> -->
        <v-spacer></v-spacer>
        <v-select
            v-model="selected"  v-if="selected"
            :items="modules"
            icon-color="primary"
            :hint="'Version select'"
            item-text="version"
            item-value="version"
            class="mx-auto pr-2"
            style="max-width: 35%;"
            @change="setProcedureDefault()"
            persistent-hint
            return-object
        >
          <template v-slot:prepend>
            <v-icon color="indigo">{{ ( selected.icon  ? '$'+selected.icon : '$cog' ) }}</v-icon>
          </template>
          <template v-slot:item="{ item }" >
            <v-list-item-avatar left>
              <v-icon  x-small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
            </v-list-item-avatar>
            
            <v-list-item-content outlined>
              <v-list-item-title >{{ item.version ? item.version : 'No Version Available' }}</v-list-item-title>
              <v-list-item-subtitle>
                <v-chip
                  x-small
                  v-for="(tag, tagKey) in item.tags" :key="tagKey" class="mr-1"
                >
                {{tag}}
                </v-chip>
              </v-list-item-subtitle>
              
            </v-list-item-content>
          </template>
        </v-select>
        <v-tooltip top class="mr-1" v-if="selected.custom">
          <template v-slot:activator="{ on }">
            <v-btn @click="rmCustomModule(selected)" v-on="on" icon small>
              <v-icon color="orange" x-small>
                $trash-alt
              </v-icon>
            </v-btn>
          </template>
          Remove Custom Procedure 
        </v-tooltip>
        <v-divider vertical ></v-divider>
        
      </v-toolbar>
       <v-spacer></v-spacer>
        
      
        <v-divider></v-divider>
            <component 
              :is="'Procedure'"
              v-if="selected.idx || selected.idx == 0"
              :module="module.name"
              class="fill-width fill-height"
              :moduleIdx="selected.idx"
            >            	
            </component>

    </v-card>

</template>

<script>

import LogWindow from '@/components/Dashboard/DashboardDefaults/LogWindow.vue';
import Procedure from "@/components/Framework/Procedure.vue"
import FileService from '@/services/File-service.js'
import {LoopingRhombusesSpinner, FulfillingBouncingCircleSpinner } from 'epic-spinners'
export default {
	name: 'module',
  components:{
    // Service,
    Procedure,
    LogWindow,
    LoopingRhombusesSpinner,
    FulfillingBouncingCircleSpinner,
  },
  beforeDestroy: function(){
    if (this.interval){
      try{
        clearInterval(this.interval)
      } catch(err){
        console.error(err)
      }
    }
  },
  methods: {
    setProcedure(event){
      this.procedure_selected_index = event
    },
    
    async rmCustomModule(selected){
      if (selected.custom){
        await FileService.rmModule({
          variant: this.selected_variant_index, 
          module: this.module.name
        }).then((response)=>{
          this.$swal.fire({
            position: 'center',
            icon: 'success',
            showConfirmButton:true,
            title:  response.data.message
          })
          this.count +=1

        }).catch((error)=>{
          console.error(error)
          this.$swal.fire({
            position: 'center',
            icon: 'error',
            showConfirmButton:true,
            title:  error.response.data.message
          })
        })
      }
    },
    setProcedureDefault(){
      // this.selectedProcedure = null
      // this.selectedProcedure = this.module.variants[this.selected_index].procedures[this.defaultProcedure]
      // this.procedure_selected_index = 0
      // console.log(this.selectedProcedure,"<<<<", this.selected_index)
    },
    runServiceIndividually(key, idx){
      // console.log(key)
      let ref  = this.$refs[key]
      ref[0].start_service()
      this.tabService = idx
    },
    cancelServiceIndividually(key){
      let ref  = this.$refs[key]
      ref[0].cancel_service()

    },
    async updateValue(event){
      // console.log(event)
      // let filtered = this.services.filter((service)=>{
      //   return service.name == event.name
      // })
      // let procedure = this.procedure
      // if (procedure.shared){
      //   procedure.shared.forEach((share)=>{
      //     if (share.output.service == event.name){
      //       let indexes = this.services.map((d)=>{return d.name}).indexOf(share.input.service)
      //       if (indexes > -1){
      //         let variables = this.services[indexes][share.input.target]
      //         console.log(share)
      //         let indexV = variables.map((variable)=>{ return variable.name}).indexOf(share.input.variable)
      //         if(indexV > -1){
      //           this.services[indexes][share.input.target][indexV].source = event.target
      //         }
      //       }
      //     }
      //   })
      // }
      
    },
    getStatus(serviceIdx){
      return this.statuses[serviceIdx] && this.statuses[serviceIdx].running
    },
		sendStatus(event){
      // this.status[event.service] = event.status.exists
      
    },
    async rm_procedure(procedureKey){
      await FileService.rmProcedure({
        procedure: procedureKey
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
  			this.count +=1

      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    async cancel_procedure(procedureKey){
      await FileService.cancelProcedure({
        procedure: procedureKey
      }).then((response)=>{
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
  			this.count +=1

      }).catch((error)=>{
        console.error(error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
        })
      })
    },
    async getStatus(){
      const $this = this
      try{
        let response = await FileService.getModules({
          catalog: this.module.name
        })
        this.modules = response.data.data.map((d,i)=>{
          d.idx  = i 
          return d
        })
        try{
          if (!this.selected.name){
            console.log(this.modules)
            this.selected = this.modules[this.selected_index]
          }
        } catch(err){
          console.error("Could not assign defaults in module, ", err)
        }
      } catch(err){
        this.initial=false
        console.error(`${err} error in getting status`)
      } finally {
        this.intervalChecking = false
      }
    },
    async start_procedure(name, services){
      this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  "Sent Procedure job to run..."
      })
      await FileService.startProcedure({
        procedure: name, 
        services: this.services
      }).then((response)=>{
			  this.count +=1
        this.$swal.fire({
          position: 'center',
          icon: 'success',
          showConfirmButton:true,
          title:  response.data.message
        })
      }).catch((error)=>{
        console.error("-----------------", error)
        this.$swal.fire({
          position: 'center',
          icon: 'error',
          showConfirmButton:true,
          title:  error.response.data.message
				})
      })
    },
    dependsFind(service){
      let returnVal = true
      if (service.depends){
        service.depends.forEach((item)=>{
          let type = item.type
          let target = item.id
          console.log(this.status)
          if (target in this.status.services){
            console.log(type, target)

          }

        })
      }
      return returnVal
    }
	},
  data(){
    return{
      drawer: true,
      mini: true,
      selectedProcedure: {},
      selected_index: 0,
      logdialog: false,
      selected: {},
      modules: [],
      factory: {

        'string': "String",
        "file": "File",
        "list": "List",
        "configuration-file": "ConfigurationFile", 
        "render": "Render"

      },

      interval: null,
      count:0,
      tab:0,
      defaultModule: 1,
      shared: [],
      status: {},
      tabService: 0,
    }
  },
  props: [ "module", "variant", "moduleIndex" ],
  watch: {
    module(newValue, oldValue){
      if (!this.selected && newValue){
        this.selected = newValue[this.defaultModule]
      }
    },

    // selected(newValue, oldValue){
    //   this.selectedProcedure = null
    //   let index  = this.modules.findIndex(data => data === this.selected)
    //   this.selected_index = index
    //   this.$emit("updateSelected", { variant: newValue, module: this.moduleIndex }   )
    //   this.selectedProcedure = this.modules[index].procedures[this.defaultProcedure]
    //   this.selectedProcedure = this.modules[index].procedures[this.defaultProcedure]
    //   this.procedure_selected_index = 0
    //   console.log(this.selectedProcedure, "<<", )
    // }
  },
  computed: {
    computed_services(){
      let values = []
      for (let [key, value] of Object.entries(this.services)){
        values.push(
          {
            text: (value.label ? value.label : key),
            disabled: false,
            href: '_blank',
          },
        )
      }
      return values
    },
    selected_variant_index(){
      if (this.module){
        let index  = this.modules.findIndex(data => data === this.selected)
        
        if (index == -1){
          return 0
        } else{
          return index
        }
      } else{
        return 0
      }
    },
    selected_procedure_index(){
      if (this.selected && this.selected.name){
        let index  = this.selected.procedures.findIndex(data => data === this.selectedProcedure)
        console.log(this.selectedProcedure, index)
        if (index == -1){
          return 0
        } else{
          return index
        }
      } else{
        return 0
      }
    },
    // selected(){
    //   if (this.selected_index || this.selected_index == 0){
    //     this.selectedProcedure = this.module.variants[this.selected_index].procedures[this.defaultProcedure]
    //     return this.module.variants[this.selected_index]
    //   } else {
    //     return {}
    //   }
    // }
  },
  mounted(){
    const $this = this;
    $this.getStatus()
    console.log(this.module)
    // this.interval = setInterval(()=>{
    //   $this.getStatus()
    // }, 3000)
  },
  
    
};
</script>

<style>
#framework{
}
.caro-bottom .v-icon {
  /* left: 10% !important; */
  background: "blue"
}


</style>