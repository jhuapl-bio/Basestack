<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="logs" ref="logs" v-if="info">
    <span class="center-align-icon configure"  
        style="float:right" 
        v-tooltip="{
            content: (scroll ? 'Autoscroll Enabled' : 'Autoscroll Disabled'),
            placement: 'top',
            classes: ['info'],
            trigger: 'hover',
            targetClasses: ['it-has-a-tooltip'],
        }" @click="scroll=!scroll">
            <font-awesome-icon :icon="(scroll ? 'comment' : 'comment-slash')" size="sm"/>
    </span>	
    <v-btn
        icon-and-text
        color="primary" small
        @click="open(link)"
    ><v-icon
        x-small
    >$external-link-alt
    </v-icon>
    Open Log Folder
    </v-btn>
    <div class="logWindow" >
        <div v-if="info" class="logDiv" style="max-height: 400px; overflow-y:auto; ">
            <code >
                <p v-for="(line, index) in info"  v-bind:key="index">{{ line }}</p>
            </code>
        </div>
    </div> 
  </div> 
</template>

<script>
export default {
	name: 'logs',
	computed: {
	
	},
	data(){
		return {
			systemLog: [],
			scroll: true,
            link: null,
            element: { pause: null }
		}
	},
    props: ['info',' link'],
  watch: {
  },
	methods:{
		open (link) {
          try{        
            this.$electron.ipcRenderer.send("openLogs")
          } catch(err){ 
            this.$swal.fire({ 
              position: 'center',
              icon: 'error',
              showConfirmButton:true,
                      title:  "Could not open the path: "+link
            })
          }
        },
		
	},
	updated: function(){
		this.$nextTick(()=>{
            this.scroll ? this.$el.querySelector('.logDiv').scrollTop = this.$el.querySelector('.logDiv').scrollHeight : ''
		})
	},
	mounted() {
    },
	beforeDestroy: function() {
        
    }
};
</script>

<style>
#logs{
}




</style>

