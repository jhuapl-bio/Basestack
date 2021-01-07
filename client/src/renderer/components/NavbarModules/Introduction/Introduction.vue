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
                            <font-awesome-icon class="configure"  @click="checkUpdates()" icon="cog" size="sm"  />
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
            </slide>
            <slide>
              <p>
                More information can be found on proper installation procedures at:
              </p>
                <ul>
                  <li>
                    <a class="center-y-img" href="" v-on:click="open_link('https://github.com/Merritt-Brian/Basestack',$event)">GitHub</a>
                  </li>
                  <li>
                    <a class="center-y-img" href="" v-on:click="open_link('https://drive.google.com/drive/u/0/folders/1ad2U3zBTHXfly3_ybLUxJBarvHXCPS2Z',$event)">Google Drive</a>
                  </li>
                </ul>
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
  export default {
    name: 'installhelp',
    props: ['modules', 'images', 'docker', 'resources'],
    components: {
      ModuleInstall,
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
