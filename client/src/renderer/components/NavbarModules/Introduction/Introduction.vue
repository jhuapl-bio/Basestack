<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="installhelp">
    <b-row>
      <b-col sm="12">
        <div class="col-sm mt-12 mt-sm-0" >
          <carousel :perPage="perPage" :navigationEnabled="false" direction="down">
            <slide>
              <div class="text-center">
                <h2 >Welcome to Basestack!</h2>
                <div style="width:100%; background:#1d3a7b;">
                  <b-img style="" :src="require('../../../assets/icon_256x256.png')" fluid alt="JUHAPL"></b-img>
                </div>
                <span class="center-align-icon; " >Need Help installing Basestack? Please swipe right for more information
                  <font-awesome-icon    icon="question-circle" size="sm"  />
                </span>
                <b-table
                  class="text-center"
                  :fields="releaseNotificationFields"
                  :items="[releaseNotes]"
                  :sticky-header="true"
                >
                  <template  v-slot:cell(current_version)>
                  <p>{{current_version}}</p>
                  </template>
                  <template  v-slot:cell(version)="row">
                    
                    <span class="center-align-icon;"
                        > 
                          <semipolar-spinner
                                v-if="row.item.version ==  0" 
                                :animation-duration="4000"
                                :size="20"
                                v-tooltip="{
                                  content: 'Fetching...',
                                  placement: 'top',
                                  classes: ['info'],
                                  trigger: 'hover',
                                  targetClasses: ['it-has-a-tooltip'],
                                }"
                                style="margin: auto"
                                :color="'#2b57b9'"
                           />
                          <font-awesome-icon class="center-align-icon text-warning"  v-else-if="row.item.version == -1"
                            v-tooltip="{
                                content: 'Could not fetch available version, please check internet configurations',
                                placement: 'top',
                                classes: ['info'],
                                trigger: 'hover',
                                targetClasses: ['it-has-a-tooltip'],
                            }" 
                            icon="exclamation" size="sm"  ></font-awesome-icon>
                          <p v-else>{{ row.item.version }}</p>
                    </span> 
                  </template>
                  <template  v-slot:cell(checkUpdates)>
                    <span class="center-align-icon;"
                            v-tooltip="{
                              content: 'If changelog not showing or a new update might be available, select this',
                              placement: 'top',
                              classes: ['info'],
                              trigger: 'hover',
                              targetClasses: ['it-has-a-tooltip'],
                              }"
                          >
                            <font-awesome-icon class="configure"  @click="checkUpdates()" icon="circle-notch" size="sm"  />
                      </span> 
                  </template>
                  <template  v-slot:cell(feature_tracker)>
                    <span class="center-align-icon;"
                            v-tooltip="{
                              content: 'Open GitHub to see all issues and upcoming features or requests for Basestack',
                              placement: 'top',
                              classes: ['info'],
                              trigger: 'hover',
                              targetClasses: ['it-has-a-tooltip'],
                              }"
                          >
                            <font-awesome-icon class="configure"  @click="open_link('https://github.com/jhuapl-bio/Basestack/issues', $event)" icon="archive" size="sm"  />
                      </span> 
                  </template>
                </b-table>
                <div style="width:100%; padding-top: 20px" class="logDiv">
                  <h3>Release Notes</h3>
                  <hr>
                  <p v-html="releaseNotes.releaseNotes"></p>
                </div>
              </div>
            </slide>
            <slide class="text-center">
              <h3 >Install Docker</h3>
              <video preload="auto" ref="videoRef" type="video/mp4" :src="docker_install" id="video-container" style="width: 100% !important; max-height:40vh; vertical-align: top" controls ></video>
              <p>Watch a brief overview of how to install Docker</p>
              <p>
                More information can be found on proper installation procedures at:
                <a class="center-y-img" href="" v-on:click="open_link('https://github.com/jhuapl-bio/Basestack#basestack',$event)">GitHub</a>
              </p>
              <p>
                Next, install modules by selecting that option in the left-hand tab or by continuing to the right
              </p>
            </slide>
            <slide>
                <p>
                  Here you can view all of your installed modules within Docker
              </p>
              <ModuleInstall
                @updateImages="updateImages"
                class="contentDiv"
                v-bind:images="images"
                v-bind:docker="docker"
                v-bind:modules="modules"
                v-bind:resources="resources"
                >
              </ModuleInstall>
            </slide>
            <slide>
                <div class="text-center" style="height: 100%; overflow-y:auto">
                  <h3>
                    Available Modules
                  </h3>
                  <b-list-group v-for="[key, entry] of Object.entries(modules)" :key="key">
                    <b-list-group-item>{{entry.title}}</b-list-group-item>
                  </b-list-group>
                </div>
            </slide>
          </carousel>
        </div>
      </b-col>
    </b-row>
  </div>
</template>

<script>
  import ModuleInstall from "@/components/NavbarModules/ModuleInstall/ModuleInstall"
  import { SemipolarSpinner  } from 'epic-spinners'
  export default {
    name: 'installhelp',
    props: ['modules', 'images', 'docker', 'resources'],
    components: {
      ModuleInstall,
      SemipolarSpinner
    },
    data(){
      return {
        activeBtn:1,
        perPage: 1,
        releaseNotes: {},
        current_version: process.env.version_basestack,
        help:false,
        releaseNotificationFields: [
          {
            key: 'version',
            label: 'Available Version'
          },
          {
            key: 'current_version',
            label: 'Installed Version'
          },
          {
            key: 'releaseDate',
            label: 'Release Date'
          },
          {
            key:'checkUpdates',
            label: 'Check Updates'
          },
          {
            key: 'feature_tracker',
            label: 'Feature Tracker'
          }
        ]
      }
    },
    methods: {
      open_link (link,e) {
      e.stopPropagation()
        this.$electron.shell.openExternal(link)
      },
      updateImages(val){
        this.$emit("updateImages", val)
      },
      checkUpdates(){
        this.$electron.ipcRenderer.send("checkUpdates", "")
      }
    },
    mounted(){
      const $this = this;
      this.$electron.ipcRenderer.on('releaseNotes', (evt, message)=>{
        console.log(message)
        $this.releaseNotes = message
      })
      this.$electron.ipcRenderer.send("queryRelease", "")
    },
    computed: {
      docker_install(){
        return require('../../../assets/tutorials/mp4/7.1-docker-install.mp4')
      }
    }
  };
</script> 

<style>

#installhelp{
  overflow-x:hidden;
  height:100%;
  /*background:#1d3a7b;*/
  /*color:#fff;*/
  margin: 5px;
}


</style>
