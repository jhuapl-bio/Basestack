<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="rampart">
    <b-form-group
      class="mb-0 formGroup"
    >
      <b-input-group-append >
          <b-table
              v-if="histories.length > 0"
              striped
              :fields="['RunDir', 'Protocol']"
              :items="[selectedHistory]"
            >
            <template  v-slot:cell(RunDir)>
              <multiselect 
                v-if="histories.length > 0"
                v-model="selectedHistory" 
                select-label="Selected Run" deselect-label="" track-by="name" label="name"  placeholder="Select Run Location"  :options="histories" :searchable="true" :preselect-first="true"  :allow-empty="false" >
              </multiselect>
            </template>
            <template  v-slot:cell(Protocol)="row" >
              <multiselect v-if="row.item.runDir" v-model="selectedHistory.protocolDir" select-label="Select Protocol Directory" deselect-label="" track-by="fullname" label="fullname" placeholder="Select protocol directory" :options="preload_protocolDirs" :searchable="false" :allow-empty="true">
              </multiselect>     
            </template>
            <template #head(RunDir)>
                <span  
                  style="text-align:center"  >
                  Run Dir
                  <font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
                  title="Bookmarked Runs (from Consensus)" />
                </span>
            </template>
            <template #head(Protocol)>
                <span  
                  style="text-align:center"  > Protocol
                  <font-awesome-icon class="help" icon="question-circle" v-b-tooltip.hover
                  title="Protocol load"  />
                </span>
            </template>
        </b-table>
      </b-input-group-append>
    </b-form-group>
    <div class="error" v-if="!$v.selectedHistory.protocolDir.required">Protocol Directory is required</div> 
    <b-row style="margin:auto; margin:0px; padding-left:0px">
      <b-col sm="12">
        <b-form-group
          >
          <b-input-group-append>
              <b-table
                v-if="selectedHistory.annotationsDir"
                class="table text-center" id="protocol_history_table" 
                :fields="['Name', 'Created', 'Protocol', 'Fastq', 'Remove']"
                :items="[selectedHistory]"
                :tbody-tr-class="'tableRow'"
                >
                <template  v-slot:cell(Name)="row">
                  <p>{{row.item.name}}</p>
                </template>
                <template  v-slot:cell(Created)="row">
                  <p>{{row.item.annotationsDir.created}}</p>
                </template>
                <template  v-slot:cell(Protocol)="row" v-if="selectedHistory.protocolDir">
                  <a :href="row.item.protocolDir.relativePath" @click.prevent="open(row.item.protocolDir.relativePath)">
                    <p style="color: #2b57b9">{{row.item.protocolDir.fullname}} (View)</p>
                  </a>
                </template>
                <template style="overflow-only" v-slot:cell(Fastq)="row">
                  <a :href="row.item.runDir.fastqDir.path" @click.prevent="open(row.item.runDir.fastqDir.path)">
                    <p style="color: #2b57b9">View Fastq Dir</p>
                  </a>
                </template>
                <template  v-slot:cell(Remove)>
                  <button class="btn tabButton" v-on:click="removeAnnotation(selectedHistory.annotationsDir)"><div   style="text-align:center"  > <span style="text-align:center; margin:auto" class="center-align-icon"><font-awesome-icon  icon="trash-alt" style="text-align:center; margin:auto"/></span></div></button>
                </template>
              </b-table>
            </b-input-group-append>
          </b-form-group>
        </b-col>
    </b-row>
    <b-row>
      <b-col sm="4">     
        <button class="btn tabButton" v-on:click="runRAMPART()" v-tooltip="{
            content: 'Output directories are based on fastq and protocol folders paths NOT i.e. not full run parameters',
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
            }" ><div class="in-line-Button" ><span><font-awesome-icon  icon="hourglass-start"/></span><span> Run Rampart</span></div></button>
            <span 
              v-if="modules.rampart.status.errors" 
              class="center-align-icon warn-icon" 
              style="float:right" v-tooltip="{
                    content: 'Error in module, check logs',
                    placement: 'top',
                    classes: ['info'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }">
                    <font-awesome-icon icon="times-circle" size="sm" />
            </span> 
      </b-col>
      <b-col sm="4">                    
        <button class="btn tabButton tabButton-stop"   v-on:click="cancelRAMPART()"><div class="in-line-Button" ><span><font-awesome-icon  icon="stop-circle"/></span><span> Stop Rampart</span></div></button>
      </b-col>
      <b-col sm="4">                     
        <button class="btn tabButton" v-on:click="forceRerender()"
          v-tooltip="{
            content: 'If Rampart does not appear given a success message, try to refresh here. If still no update, check Log Streams.',
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
            }"
        ><div class="in-line-Button" ><span><font-awesome-icon  icon="sync"/></span><span> Refresh</span></div></button>
      </b-col>
    </b-row>

    <p class="typo__p" v-if="submitStatus === 'ERROR'">Please choose a fastq (previous tab) and protocol folder</p>
    <object id ="rampartobj" :key="rampartoff" type="text/html" data="http://localhost:3000" style='position: relative; width:100%; overflow-y:auto; height:1000px'>
    </object>      
  </div>
</template>

<script>
  import FileService from '../../../services/File-service.js'
  import { required} from 'vuelidate/lib/validators'
  import path from "path"
  import Multiselect from 'vue-multiselect'

  export default {
    name: 'rampart',
    components: {Multiselect},
    props: ['modules', 'images', 'histories', 'selectedTag'],
    data() {
      return {
        submitStatus: null,

        fastqDir: null,
        name: null,
        reportDir: null,
        annotationsDir: null,
        rampartoff: 0,
        removeAnnotations: false,
        protocolDir:null,
        stagedProtocolDir: null,
        protocolFiles: null,
        preload_protocolDirs: [],
        toggleProtocolSelect: 'select',
        selectedHistory: {},
        selectedAnnotations: null,
        preload_annotationDirs: [],
        clearedStateObjValues: {annotation:null},

      }
    },
    validations: {
      selectedHistory: {
        protocolDir: {
          required
        }     
      }
    },
    watch: {

    },
    async mounted() {
      await this.fetchProtocols()
    },
    methods: {
      toggleAnnotationsRemoval(){
        this.removeAnnotations = !this.removeAnnotations
      },
      async removeAnnotation(entry){
        this.$swal({
              title: 'Are you sure you want to remove this annotation?',
              text: "You won't be able to revert this!",
              type: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#2b57b9',
              cancelButtonColor: '#a60139',
              confirmButtonText: 'Yes, remove it!'
            }).then((res) => {
              if (res.value) {
                FileService.removeAnnotation({
                  annotationDir: entry,
                  protocolDir: this.selectedHistory.protocolDir,
                  reportDir: this.selectedHistory.reportDir
                }).then((response)=>{
                  this.selectedHistory.annotationsDir = null
                  this.selectedHistory.protocolDir = null
                  this.stagedProtocolDir = null
                  this.updateData()
                }).catch((error)=>{
                  this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                    title:  error.response.data.message
                  })
                })
              }
          });
          

      },
      checkError(){
        if (this.selectedHistory.runDir.fastqDir && this.selectedHistory.protocolDir) {
          this.submitStatus = ""; 
        }
      },      
      open (link) {
        this.$emit("open", link)
      },
      forceRerender(){
        this.rampartoff +=1
      },
      updateData: function(){
        this.$emit('updateData', this.selectedHistory)
      },
      async setToggle(dir, dirValue, dispatch, dispatchValue){
        // this.data[dispatch] = dispatchValue
        this.updateData()
        dir = dirValue
      },
      async changeProtocolSelectType(value){
        if (value) {
          if(value.fullname=="Custom"){
            this.setToggle(this.protocolDir, {srcPath: null, relativePath:null, type: 'manual', fullname: "Custom", name: null}, 'protocolDir', {srcPath: null, relativePath:null, type: 'manual', fullname: "Custom", name: null})
            this.toggleProtocolSelect =  'manual'
          } else { 
            this.setToggle(this.protocolDir, value, 'protocolDir', value)
            this.toggleProtocolSelect =  'select'
          }
          this.$refs.protocol_file_text.innerHTML = null
        } else {
          this.protocolDir = null;
          this.updateData()
            this.toggleProtocolSelect = null
        }
        // this.resetCustom(false)
        this.checkError()
      },
      async fetchProtocols(){
          let data = await FileService.fetchProtocols().then((response)=>{
            this.preload_protocolDirs = response.data.data
            // this.preload_protocolDirs = []
            // if(response.data.data.length >=1){

            //   this.preload_protocolDirs = response.data.data.map((d)=>{
            //     return {value: d, key: d.fullname}
            //   })
            // }
            // this.protocolDir = this.preload_protocolDirs[0].value
            // this.preload_protocolDirs.push({fullpath: null, type: 'manual', fullname: "Custom", name: null})
          })
        
        },
      async cancelRAMPART(){
        // try{
          // this.$store.dispatchPRomise("PULSATE", {box: "logs", pulse: false, type: ""})}catch(err){console.error("error in pulse logs")}
        await FileService.cancelModule({module: 'rampart'}).then((response)=>{
            this.$swal.fire({
              position: 'center',
              icon: 'info',
              showConfirmButton:true,
              title:  response.data.message
            })
            this.forceRerender()     
          }).catch((err)=>{
            console.log(err.response.data)
              this.$swal.fire({
                position: 'center',
                icon: 'error',
                showConfirmButton:true,
                title:  err.response.data.message
              })             
          })
      },
      async runRAMPART() {
        this.checkError()
        if (this.$v.$invalid) {
          this.submitStatus = 'ERROR'
        } else {
          await FileService.startModule({
              runDir: this.selectedHistory.runDir,
              protocolDir: this.selectedHistory.protocolDir,
              removeAnnotations: this.removeAnnotations,
              reportDir: this.selectedHistory.reportDir,
              name: this.selectedHistory.name,
              annotationsDir: this.selectedHistory.annotationsDir,
              module: 'rampart',
              tag: this.images['jhuaplbio/basestack_consensus'].selectedTag
          }).then((response)=>{
            this.$swal.fire({
              position: 'center',
              icon: 'success',
              showConfirmButton:true,
              title:  response.data.message,
              text: ""
            })
            this.$set(this.selectedHistory, "annotationsDir", response.data.payload.annotationsDir)
            this.$set(this.selectedHistory, "protocolDir", response.data.payload.protocolDir)
            this.updateData()
            setTimeout(() => {
              this.forceRerender()
             },8000);  
          }).catch((err) => {
            // this.$store.dispatchPromise("PULSATE", {box: "rampart", pulse: true, type: "pulseError"}).catch(() => null);
            if (err.response.status === 409) {
              this.$swal.fire({
                position: 'center',
                icon: 'error',
                customClass: {
                  popup: 'errorSwal'
                },
                showConfirmButton:true,
                title:  (err.response.data.message.json? err.response.data.message.json.message : err.response.data.message)
              }) 
            } else {
              this.$swal.fire({
                position: 'center',
                icon: 'error',
                showConfirmButton:true,
                title:  (err.response.data.message.json? err.response.data.message.json.message : err.response.data.message)
              }) 
            }
          });  
        }
        
      }
    }
  };
</script>
<style>
.swal2-title {
  font-size: 13px !important;

}
#rampart{
  height:100%;
  overflow-x: hidden;
  overflow-y:auto;
}
#rampartObj{
  min-height: 75%;
  position: relative; 
  background: none; 
  border:0px solid #000;  
  width:100%; 
  overflow-y:auto; 
}
#protocol_history_table td::before{
  text-align: left !important;
  width: auto;
}
#protocol_history_table div{
  width:auto;
}
</style>