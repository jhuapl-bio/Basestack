<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="logs" ref="logs" v-if="status && status.modules">
	<span class="center-align-icon configure"  
		style="float:right" 
		v-tooltip="{
			content: 'Continue Logging',
			placement: 'top',
			classes: ['info'],
			trigger: 'hover',
			targetClasses: ['it-has-a-tooltip'],
		}" @click="scroll=!scroll">
			<font-awesome-icon :icon="(scroll ? 'comment' : 'comment-slash')" size="sm"/>
	</span>	
	<div class="logWindow" v-for="key in Object.keys(status.modules)" :key="key">
		<!-- <div v-if="status.modules[key]" >
			<div class="logWindow" v-for="[key2, element2] in Object.entries(meta.modules[key])" :key="key2">
				<div class="topline"  >
					<h3 style="vertical-align: center; text-anchor:middle;">{{element2.title}}</h3 >
				</div>
				<div  v-if="status.modules" class="logDiv" style="max-height: 200px; overflow-y:auto; ">
					<code >
						<p v-for="(line, index) in status.modules[key].stream" v-bind:key="`lineDockerLog-${index}`">{{ line }}</p>
					</code>
				</div>
			</div> 
		</div>  -->
	</div>
	<!-- <div class="logWindow">
		<div class="topline"  >
			<h3 style="vertical-align: center; text-anchor:middle;">System</h3 >
		</div>
		<div  v-if="status.pipelines" class="logDiv" style="max-height: 200px; overflow-y:auto; ">
			<code >
				<p v-for="(line, index) in systemLog" v-bind:key="`lineDockerLog-${index}`">{{ line }}</p>
			</code>
		</div>
	</div>	 -->
  </div> 
</template>

<script>
import FileService from "@/services/File-service.js"
export default {
	name: 'logs',
	computed: {
	// ...mapGetters({staged: 'getStaged'})
		status: {
			get() {
				return this.$store.getters.getStatus
			}
		},
		meta: {
			get(){
				return this.$store.getters.getMeta
			}
		}
	},
	data(){
		return {
			systemLog: [],
			scroll: true
		}
	},
	methods:{
		
		
	},
	updated: function(){
		// this.$nextTick(()=>{
		// 	for (let i = 0; i < this.logs.length > 0; i+=1){
		// 		const element = this.logs[i]
		// 		!element.pause ? this.$el.querySelector('#logService'+element.name).scrollTop = this.$el.querySelector('#logService'+element.name).scrollHeight : ''
		// 	}
		// 	// 'log'+element.name
		// })
	},
	mounted() {
		
		setInterval((d)=>{
		// 	FileService.fetchLog({name: 'server', type: 'system'}).then((message)=>{
		// 		this.systemLog = message.data.data
		// 		let p = this.$refs.logs.querySelectorAll(".logDiv")
		// 		if (this.scroll && p && p.length > 0){
		// 			p.forEach((element)=>{
		// 				element.scrollTop =  element.scrollHeight
		// 			})
		// 		}
		// 	})
			// console.log(this.status)
			
		}, 2000)
	},
	beforeDestroy: function() {
        
    }
};
</script>

<style>
#logs{
}




</style>

