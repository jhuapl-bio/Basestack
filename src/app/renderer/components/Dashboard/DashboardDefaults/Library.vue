<template>
    <v-row   style="">
        <v-card height="70vh" style="width: 100%" class="overflow fill-height fill-width">
          <v-list three-line>
            <template v-for="item in Object.values(latestLibrary)">
              <v-divider :key="`${item.name}-key`"></v-divider>

              <v-list-item
                :key="item.title"
              >
                <v-list-item-avatar left >
                  <v-tooltip  top  >
                        <template v-slot:activator="{ on }">
                            <v-icon medium v-on="on" @click="importModule(item.name)" class="" color="primary">$download</v-icon>
                        </template>
                        Import module for offline use
                    </v-tooltip>
                </v-list-item-avatar>

                <v-list-item-content>
                    <v-list-item-title>
                        <v-icon  small>{{ ( item.icon  ? '$' + item.icon : 'cog' ) }}</v-icon>
                        {{item.title}}
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-if="item.url" v-on="on" small color="indigo "  v-on:click="open_external(item.url)" style="text-align:right" class="configure ml-2 ">$home</v-icon>
                            </template>
                            View Home
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-if="importedLibrary[item.name]" v-on="on" small color="goldenrod "  v-on:click="jump(item.name)" style="text-align:right" class="configure ml-2">$play-circle</v-icon>
                            </template>
                            Jump to Module
                        </v-tooltip>
                        <v-tooltip top class=""  v-if="importedLibrary[item.name]" >
                            <template v-slot:activator="{ on }">
                            <v-btn @click="removeModule(item.name)" v-on="on" icon >
                                <v-icon color="orange" small class="configure ml-2">
                                $trash-alt
                                </v-icon>
                            </v-btn>
                            </template>
                            Remove module from imported library 
                        </v-tooltip>
                        <v-tooltip bottom>
                            <template v-slot:activator="{ on }">
                                <v-icon v-on="on" small color="indigo "  v-on:click="fetchRemoteCatalog(item.name)" style="text-align:right" class="configure ml-2">$external-link-alt</v-icon>
                            </template>
                            Fetch Versions for Module
                        </v-tooltip>
                        
                    </v-list-item-title>
                    
                    <div>
                        <v-list-item-subtitle class="mb-2" v-html="item.description"></v-list-item-subtitle>
                        <v-chip
                            small label
                            v-for="(tag, tagKey) in item.tags" :key="`${tag}${tagKey}`" class="mr-1"
                        >
                        {{tag}}
                        </v-chip>
                    </div>
                </v-list-item-content>
                <v-list-item-action>
                    <v-divider></v-divider>
                    
                    <v-alert
                        type="success" icon="$check-circle"  v-if="'latest' == latestImported(item.name, item.version)"
                    >Latest version imported</v-alert>
                    <v-alert
                        type="warning" icon="$exclamation"  v-else-if="'notlatest' == latestImported(item.name, item.version)"
                    >Newer version available</v-alert>
                    <v-chip v-else label medium>Latest Version: {{item.version}}</v-chip>
                    <div v-if="importedLibrary[item.name]">
                        <span v-if="importedLibrary[item.name]">Installed Versions</span>
                        <v-chip
                            small label
                            v-for="choice in uniqueVersions(item.name)" :key="`${choice}-${item.name}`" class="mr-1"
                        >
                            {{choice}}
                            
                        </v-chip>
                    </div>
                </v-list-item-action>
              </v-list-item>
            </template>
          </v-list>
        
        </v-card>
    </v-row>
</template>

<script>
    const path = require("path")
    import FileService from '@/services/File-service.js'
	export default {
		name: 'library',	 
        components: {
        },
		data() {
			return {
                remotelocation: (process.env.NODE_ENV == "development" ? "stagedModules" : "modules" )
                
			}
	  	},
        beforeDestroy(){
            if(this.interval){
                clearInterval(this.interval)
            }
        },
		props: ['latestLibrary', 'importedLibrary'],
		computed: {
            
		},
		
	    mounted(){
            const $this = this
           
	    },
	    watch: { 
	    },
		
	    methods: {
            importModule(name){
                this.$emit("importModule", {name:name, jump:false })
            },
            uniqueVersions(name){
                let versions=this.importedLibrary[name].choices.map((f)=>{
                    return f.version ? f.version : 0
                })
                return [ ... new Set(versions)]
            },
            async fetchRemoteCatalog(name){
                const $this = this
                let location = this.remotelocation
                FileService.fetchRemoteCatalog(location, name).catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                }) 
            },
            jump(name){
                this.$emit("jumpTo", name)
            },
            async removeModule(name){
                this.$swal({
                    title: 'Are you sure you want to remove this library?',
                    text: "All dependencies will remain, but the ",
                    type: 'warning',
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: `Remove module & dependencies`,
                    denyButtonText: `Remove from Imports`,
                }).then((res) => {
                    if (res.value !='cancel' && res.isConfirmed){
                        FileService.removeModule({
                            catalog: name,
                            dependencies: true,
                        }).then((response)=>{
                            this.$swal.fire({
                                position: 'center',
                                icon: 'success',
                                showConfirmButton:true,
                                title:  response.data.message
                            })
                        })
                        .catch((err)=>{
                            console.error(err)
                            this.$swal.fire({
                                position: 'center',
                                icon: 'error',
                                showConfirmButton:true,
                                title:  error.response.data.message
                            })
                        }) 
                    }
                    else if (res.value !='cancel' && res.isDenied){
                        FileService.removeModule({
                            catalog: name,
                        }).then((response)=>{
                            this.$swal.fire({
                                position: 'center',
                                icon: 'success',
                                showConfirmButton:true,
                                title:  response.data.message
                            })
                        })
                        .catch((err)=>{
                            console.error(err)
                            this.$swal.fire({
                                position: 'center',
                                icon: 'error',
                                showConfirmButton:true,
                                title:  error.response.data.message
                            })
                        }) 
                        
                    }
                }) 
            },
            open_external(url){
			    this.$electron.shell.openExternal(url)
            },
            latestImported(name, version){
                if (name && this.importedLibrary[name] && this.importedLibrary[name].latest.version == version){
                    return 'latest'
                } else if (name && this.importedLibrary[name] && this.importedLibrary[name].latest.version < version){
                    return 'notlatest'
                } 
                else {
                    return false
                }
            },
            open (link) {
                try{        
                    this.$electron.shell.openPath(link)
                } catch(err){
                    this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                            title:  "Could not open the path: "+link
                    })
                }
            },
            openDir(loc, format){
                if (format == 'file'){
                    this.open(path.dirname(loc))
                } else {
                    this.open(path.dirname(loc))
                }
            },
	    }
	};

</script>
<style>
#moduleconfig{
	width:100%;
}
</style>