<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <!-- <v-card id="about" > -->
  	<v-list dense>
		<v-list-item
		>
			<v-list-item-icon>
				<span style="info-icon" ><font-awesome-icon class="" icon="envelope"/></span>
			</v-list-item-icon>
			<v-list-item-content>
				<v-list-item-title v-text="'Questions? Contact here'"></v-list-item-title>
				<v-list-item-subtitle style="font-size: 90%;">Brian Merritt (brian.merritt@jhuapl.edu)</v-list-item-subtitle>
			</v-list-item-content>
			
		</v-list-item>
		
		<v-subheader>Third Party Applications</v-subheader>
		<v-list-item
			v-for="entry in third_parties"
			:key="entry.name"
			class="entry"
		>
			<v-list-item-content>
				<v-list-item-subtitle >
					<a class="center-y-img" style="font-size: 90%;" href="" v-on:click="open(entry.url,$event)">{{entry.name}}
					</a>
				</v-list-item-subtitle>
				 <!-- <v-list-item-subtitle v-text=""v-on:click="open(entry.url,$event)" v-text="'Location'" ></v-list-item-subtitle> -->
			</v-list-item-content>
		</v-list-item>
	</v-list>
	
</template>

<script>
export default {
	name: 'foot',
	data(){
		return {
			third_parties: [
				{
					name: "Nextstrain",
					url: "https://nextstrain.org/ncov/global"
				},
				{
					name: "Artic Network",
					url: "https://github.com/artic-network/rampart"
				},
				{
					name: "IGV",
					url: "https://igv.org/"
				}
			]
		}
	},
	methods: {
		
		open (link,e) {
			e.stopPropagation()
        	this.$electron.shell.openExternal(link)
      	}
	}
};
</script>

<style>
#about{
	overflow-y:auto;
}

#about .list_about{
	padding-right:1em;
  list-style:none;
}
#about h3{
	font-size: 1.5em;
}

</style>