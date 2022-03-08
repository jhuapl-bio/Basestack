<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
	<v-row  class="max-height: 10vh" >
		<v-col cols="6"  >
			<v-card >
				<v-img  
					contain
					width="100%" class="configure"
					height="100%"  @click="open_external('https://basestackwebsite.readthedocs.io/en/latest/index.html')"
					:src="require('@/assets/Basestack_multiple_landing.png')" fluid alt="JUHAPL">
				</v-img>
				<v-divider></v-divider>

				<About class=""></About>
				<v-divider></v-divider>
				<v-card>
				<br> 
				
				<v-input
					disabled
					label="Backend Port" class="pr-5 pl-5"
				>
				</v-input>
					<v-text-field class="pr-5 pl-5"
						hint="Only change if the default port (5003) is in use"
						label="Change the backend server port to connect to"
						v-model="port" type="number"
						min="1000" max="9999"
						append-icon="$caret-square-up"
						prepend-icon="$server"
						@click:append="changePort(port)"
						clearable shaped centered outlined
					>
					</v-text-field>
				</v-card>
			</v-card>
			
			
		</v-col>
		
		<v-col cols="6" >
			<Sys class=""
			/>
		</v-col>
	</v-row>
	
</template>

<script>



import Sys from '@/components/Dashboard/System/Sys'
import About from '@/components/Dashboard/DashboardDefaults/About'
import Library from '@/components/Dashboard/DashboardDefaults/Library'

import Docker from "@/components/Dashboard/System/Docker";
 

export default {
	name: 'mainpage',
	components:{
		Sys,
		Docker, 
		Library,
		About
	},
	
	props: ['modules', 'defaults', "moduleIdx"],
	data(){
		return{
			status: {},
			socket: null,
			system: {},
			port: ( process.env.PORT_SERVER ? process.env.PORT_SERVER : 5003),
		}
	},
	created(){
		
	},
	watch:{
		
	},
	computed: {
	  myProps() {
	    	return { 
	    		
	    	}
	  }
	},
	mounted(){
		const $this = this				
		
	},

	methods: {
      emitChange( data){
		   this.$emit("emitChange", data)
	  },
	  changePort(val){
        this.$electron.ipcRenderer.send("changePort", val)
      },
	  open_external(url){
		this.$electron.shell.openExternal(url)
	  },
      
	}
};
</script>

<style>
.sidebox{
	max-height: 95vh;
	overflow:auto
}
 
</style>
<style lang="css">
	@import '../../../static/css/style.css';
</style>
<style lang="css">
	@import '../../../static/css/myriadpro.css';
</style>
<style lang="css">
	@import '../../../static/css/revised_branding_banner.css';
</style>
<style>
	@import '../../../static/css/tooltip.css';
</style>