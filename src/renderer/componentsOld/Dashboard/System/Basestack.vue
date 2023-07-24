<template>
  <v-card dense>
    <v-card-title>Basestack</v-card-title>
    <v-card-subtitle>{{version}}</v-card-subtitle>
    <v-dialog
      v-model="dialog"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          color="light"
          icon-and-text
          class="pt-5 pb-5"
          v-bind="attrs"
          v-on="on"
        >
          <v-img   :src="require('@/assets/1-icon.svg')" 
            max-height="26"            
            contain 
          >
          </v-img>
          Check Release
        </v-btn>
      </template>
      <v-card>
        <v-card-title class="text-h5">
          Most up-to-date version information
        </v-card-title>
        <v-card-text style="width:100%; padding-top: 20px" class="logDiv">
          <h3>Release Notes</h3>
          <hr>
          <p v-html="releaseNotes.releaseNotes"></p>
        </v-card-text>
        <v-list dense>
      
          <v-list-item
            v-for="entry in fields_system"
            :key="entry.key"
            class="entry"
          >
              <v-list-item-content v-if="entry.key !== 'available_version'">
                <v-list-item-title v-text="entry.label "></v-list-item-title>
                <v-list-item-subtitle v-text="info_table[entry.key] ">
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-content v-else>
                <v-list-item-title v-text="entry.label "></v-list-item-title>
                <v-list-item-subtitle v-text="available_version">
                </v-list-item-subtitle>
              </v-list-item-content>
              
          </v-list-item>
      </v-list>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
              @click="checkForUpdates()"
              small icon-and-text  class=" ml-3"
            >
              <v-icon
                color="primary" class="mr-3 ml-3"
              >$recycle
              </v-icon>Check and Update Basestack
            </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-card-text v-if="releaseNotes.version !== version && releaseNotes.version > version">
      
      <v-divider class="mb-4 mt-1"></v-divider>
      <v-icon
        
        color="orange" class="mr-3 ml-3"
      >$exclamation-triangle
      </v-icon>Newer version available
    </v-card-text>
  
   
  </v-card>
</template>

<script>
  export default {
    props: ['resources'],
    data () {
      return {
        dialog: null,
        fields_system: [
          {
            key: 'basestack',
            label: 'Installed Version'
            },
            {
              key: 'available_version',
              label: 'Newest Available Version'
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
        releaseNotes: {},
        info_table: {
          basestack: process.env.version_basestack,
          electron: process.versions.electron,
          node: process.versions.node,
          os: require('os').platform(),
          vue: require('vue/package.json').version
        },
      }
    },
    mounted(){
      const $this = this;
      this.$electron.ipcRenderer.on('releaseNotes', (evt, message)=>{
        console.log(message)
        $this.releaseNotes = message
      })
      this.$electron.ipcRenderer.send("queryRelease", "")
      this.$electron.ipcRenderer.on('mainNotification', (evt, message)=>{
        this.$swal.fire({
                position: 'center',
                icon: message.icon,
                showConfirmButton:true,
                title:  (message.header ? message.header : ""),
                footer: (message.footer  ? message.footer: ""),
                html: ( message.message ? message.message : ""),
                didOpen: () => {
                  if (message.loading){
                    $this.$swal.showLoading()
                  }
            }
              })
      })
    },
    computed: {
      version() {
        return  process.env.version_basestack
      },
      available_version() {
        return  this.releaseNotes.version
      }
    },
    methods: {
      checkForUpdates(){
        this.$electron.ipcRenderer.send("checkUpdates", "")
      },
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

</style>