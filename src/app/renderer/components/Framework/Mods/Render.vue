<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div  class="render ">
	<v-divider></v-divider>
	<v-btn small class="mb-4 mr-2" v-on:click="forceRerender()"
		> Refresh
		<v-icon class="ml-3" small >$sync</v-icon>
	</v-btn>
	<v-subheader>
		Ports exposed
	</v-subheader>
	<v-data-table
		small
		:headers="headers"
		:items="portbinds"
		:items-per-page="6"
		:footer-props="{
		showFirstLastPage: true,
			prevIcon: '$arrow-alt-circle-left',
			nextIcon: '$arrow-alt-circle-right',
			firstIcon: '$step-backward',
			lastIcon: '$step-forward',
		}"
		class="elevation-1"					        
        >	
		<template v-slot:item.from="{ item, index }">
			<v-text-field
				single-line v-if="Array.isArray(variable.source)"
				type="number" 
				v-model="variable.source[index]"  
				hint="Port Rendering for host"
			>
			</v-text-field>
			<v-text-field
				v-else
				single-line
				type="number" 
				v-model="variable.source"  
				hint="Port Rendering in pipeline"
			>
			</v-text-field>
		</template>
		<template v-slot:item.to="{ item, index }">
			<v-text-field
				v-if="Array.isArray(variable.target)"
				single-line
				type="number" disabled
				v-model="variable.target[index]"  
				hint="Port Rendering in pipeline"
			>
			</v-text-field>
			<v-text-field
				v-else
				single-line
				type="number" disabled
				v-model="variable.target"  
				hint="Port Rendering in pipeline"
			>
			</v-text-field>
		</template>
		<template v-slot:item.open="{ item, index }">
			<v-tooltip bottom >
				<template v-slot:activator="{ on }">
				<v-btn
					color="info"
					class="text-caption"
					@click="open_link(item, $event)" v-on="on" 
				>
					<v-icon class="mr-3" small color="primary lighten-2" >
						$external-link-alt
					</v-icon>
					Click Me</v-btn>
				</template>
				Open in Browser
			</v-tooltip>  
			
			<v-tooltip bottom >
				<template v-slot:activator="{ on }">
					<v-btn
						color="secondary"
						class="text-caption" v-on="on"
						@click="open_local_link(item, $event)"  
					>
						<v-icon class="mr-3" small color="primary lighten-2" >
							$external-link-alt
						</v-icon>
						Open Locally</v-btn>
				</template>
				View in Local Instance of the App
			</v-tooltip>
		</template>
	</v-data-table>
	<br>
	
	
  </div> 
  
</template>
<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>

<script>


export default {
	name: 'Render',
	components: {
	},
	props: ['source', 'variable', 'status', 'service'],
	data(){
		return {
			show: true,
			items: [
				{
				text: 'View in Browser',
					disabled: false,
					href: null,
				}
			],
			renderIndex: 0,
			headers: [
				{
					text: "Host Port",
					value: "from",
					sortable: false,
					align:"center"
				},
				{
					text: "Command Port",
					value: "to",
					sortable: false,
					align:"center"
				},
				{
					text: "Openable Port",
					value: "open",
					sortable: false,
					align:"center"
				},
			]
		}
	}, 
	async mounted(){
		// this.start_module()
	},
	computed: {
	  portbinds(){
		let portbinds = []
		let from = this.variable.source
		let to = this.variable.target
		if (Array.isArray(from) && Array.isArray(to)){
			from.forEach((p,i)=>{
				portbinds.push({from:p, to:to[i] })
			})
		} else if (Array.isArray(from) && !Array.isArray(to) ){
			from.forEach((p,i)=>{
				portbinds.push({from:p, to:to})
			})
		} else if (!Array.isArray(from) && Array.isArray(to) ){
			to.forEach((p,i)=>{
				portbinds.push({from: from, to: p })
			})
		}
		else {
			portbinds.push({from:from, to:to})
		}
		return portbinds
	  }
	},

	beforeDestroy(){
		// this.cancel_module()
    },
	methods: {
		forceRerender(){
			const $this =this
			$this.show = false
			setTimeout(()=>{
			$this.show = true
			},400)
		},
		openUrl(link){
			this.$electron.shell.openExternal(this.getUrl(link))
		},
		open_link (link, e) {
			e.stopPropagation()
			this.openUrl(link)
      	},
		open_local_link (link, e) {
          e.stopPropagation()
		  console.log(this.getUrl(link),link.from)
          window.open(this.getUrl(link), "browser", 'top=500,left=200,frame=true,nodeIntegration=no')
      	},
		getUrl(link){
			  let url 
			  if (Array.isArray(link.from)){
				url  = `http://localhost:${link.from[0]}`
			  } else {
				url  = `http://localhost:${link.from}`
			  }
			  if (this.variable.suburl){
				  url = url + this.variable.suburl
			  }
			  return url
		  }
	}
};
</script>

<style>
.render{
	height:100%;
	overflow-y:auto; 
	overflow-x:auto; 
    width: 100%;
}

.renderObj{
  min-height: 90vh;
  position: relative; 
  background: none; 
  width:100%; 
  height: 100%;
  overflow-y:auto; 
  overflow-x:auto; 
}

</style>