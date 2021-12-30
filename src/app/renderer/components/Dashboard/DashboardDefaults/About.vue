<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <b-row id="about" >
	
  	<div class="box">
		<span class="no-border-entry" style=""
		> <font-awesome-icon class="" icon="phone" size="sm"  />
			Questions? Contact us
		</span> <hr>
		<div class="label-entry"><strong class="">Third Party Applications</strong><br></div>
  		<ul class="entry list_about">
  			<li><a class="center-y-img" style="font-size: 90%; color: black" href="" v-on:click="open('https://nextstrain.org/ncov/global',$event)">Nextstrain</a></li>
  			<li><a class="center-y-img" style="font-size: 90%; color: black" href="" v-on:click="open('https://github.com/artic-network/rampart',$event)">ARTIC Network</a></li>
  			<li><a class="center-y-img" style="font-size: 90%; color: black" href="" v-on:click="open('https://igv.org/',$event)">IGV</a></li>
  		</ul>	
		<hr>
		<div class="label-entry"><strong class="text-center">Basestack Developers</strong><br></div>
		<div class="entry list_about">
			<p style="font-size: 90%; color: black">Brian Merritt (brian.merritt@jhuapl.edu)</p>
		</div>

  	</div>
  </b-row>
</template>

<script>
export default {
	name: 'foot',
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