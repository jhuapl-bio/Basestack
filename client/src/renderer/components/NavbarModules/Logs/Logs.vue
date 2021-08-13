<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="logs" >
	<div class="logWindow" v-for="element in logs" :key="element.name">
		<div class="topline"  >
			<h3 style="vertical-align: center; text-anchor:middle;">{{element.title}}</h3 >
			<div class="centerToggle">
				<span v-if="element.pause" class="center-align-icon configure" style="padding-right: 10px;" v-tooltip="{
		            content: 'Continue Logging',
		            placement: 'top',
		            classes: ['info'],
		            trigger: 'hover',
		            targetClasses: ['it-has-a-tooltip'],
		            }" @click="element.pause = !element.pause">
	            		<font-awesome-icon icon="comment-slash" size="sm" />
	               </span>
	               <span v-else  style="padding-right: 10px;" class="center-align-icon configure" v-tooltip="{
		            content: 'Pause Logging',
		            placement: 'top',
		            classes: ['info'],
		            trigger: 'hover',
		            targetClasses: ['it-has-a-tooltip'],
		            }" @click="element.pause = !element.pause">
	            		<font-awesome-icon icon="comment" size="sm" />
	            </span>
	            <span v-if="element.tooltip"  class="center-align-icon" 
	            	v-tooltip="{
				        content: element.tooltip,
				        placement: 'top',
				        classes: ['warning'],
				        trigger: 'hover',
				        targetClasses: ['it-has-a-tooltip'],
				    }" >
            		<font-awesome-icon 
            			style="height:100%" 
            			
            			class="help" 	
            			icon="question-circle" 
					/>
				</span>
	        </div>
		</div>
		<div :id="'logService'+element.name" class="logDiv">
			<code >
				<p v-for="(line, index) in element.log" v-bind:key="`lineArticConsensus-${index}`"> {{ line }}</p>
			</code>
		</div>
	</div>	
  </div>
</template>

<script>
import FileService from "@/services/File-service.js"
export default {
	name: 'logs',
	props: ['modules', 'images'],
	data(){
		return {
			artic_consensusLog: null,
			rampartLog: null,
			serverLog: null,
			serverPause: null,
			serverInterval: null,
			articConsensusPause: false,
			rampartPause: false,
			RampartInterval: null,
			ArticConsensusInterval: null,
			logs: [
				{
					name: 'basestack_consensus',
					title: "Artic/Basestack Consensus",
					tooltip: null,
					log: [],
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							const $this = this
							if(!(this.pause)){
								FileService.fetchLog({name: 'basestack_consensus', type: 'container'}).then((message)=>{
									if (message.data.status != 201){
										this.log = message.data.data
									}
								}).catch((err)=>{
									console.log(err, "error in log artic consensus")
									this.pause = true
								})
							}
						}, 1000)
					},
				},
				{
					name: 'rampart',
					tooltip: null,
					title: "RAMPART",
					log: [],
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							if(!(this.pause)){
								FileService.fetchLog({name: 'rampart', type: 'container'}).then((message)=>{
									if (message.data.status != 201){
										this.log = message.data.data
									}
								}).catch((err)=>{
									this.pause = true
								})
							}
						}, 1000)
					},
				},
				{
					name: 'mytax_report',
					tooltip: null,
					title: "MyTaxReport",
					log: [],
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							if(!(this.pause)){
								FileService.fetchLog({name: 'basestack_mytax_report', type: 'container'}).then((message)=>{
									if (message.data.status != 201){
										this.log = message.data.data
									}
								}).catch((err)=>{
									this.pause = true
								})
							}
						}, 1000)
					},
				},
				{
					name: 'pavian',
					tooltip: null,
					title: "Pavian",
					log: [],
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							if(!(this.pause)){
								FileService.fetchLog({name: 'pavian', type: 'container'}).then((message)=>{
									if (message.data.status != 201){
										this.log = message.data.data
									}
								}).catch((err)=>{
									this.pause = true
								})
							}
						}, 1000)
					},
				},
				{
					name: 'tutorial',
					title: "Tutorial",
					log: [],
					tooltip: 'Workshop Tutorial Videos',
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							if(!(this.pause)){
								FileService.fetchLog({name: 'basestack_tutorial', type: 'container'}).then((message)=>{
									this.log = message.data.data
								})
							}
						}, 2000)
					}
				},
				{
					name: 'server',
					title: "Server",
					log: [],
					tooltip: 'Basestack system-wide logging',
					pause: false,
					interval:null,
					async startLog(){
						this.interval = setInterval(()=>{
							if(!(this.pause)){
								FileService.fetchLog({name: 'server', type: 'system'}).then((message)=>{
									this.log = message.data.data
								})
							}
						}, 2000)
					}
				}

			]
		}
	},
	methods:{
		
		
	},
	updated: function(){
		this.$nextTick(()=>{
			for (let i = 0; i < this.logs.length > 0; i+=1){
				const element = this.logs[i]
				!element.pause ? this.$el.querySelector('#logService'+element.name).scrollTop = this.$el.querySelector('#logService'+element.name).scrollHeight : ''
			}
			// 'log'+element.name
		})
	},
	mounted() {
		for (let i = 0; i < this.logs.length; i++){
			this.logs[i].startLog()
		}
	},
	beforeDestroy: function() {
        clearInterval(this.ArticConsensusInterval)
        clearInterval(this.RampartInterval)
        clearInterval(this.serverInterval)
    }
};
</script>

<style>
#logs{
}




</style>

