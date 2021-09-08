<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->
<template>
  <div id="about" >
  	<div class="col-md-12 nopadcolumn">
  		<br>
  		<h3>Third Party Apps</h3>
  		<ul class="list_about">
  			<li><a class="center-y-img" href="" v-on:click="open('https://nextstrain.org/ncov/global',$event)">Nextstrain</a></li>
  			<li><a class="center-y-img" href="" v-on:click="open('https://github.com/artic-network/rampart',$event)">ARTIC Network/RAMPART</a></li>
  			<li><a class="center-y-img" href="" v-on:click="open('https://igv.org/',$event)">IGV</a></li>
  		</ul>	
  		<h2>Contact</h2>
  		<br>
  		<h3>Basestack Developers</h3>
  		<ul class="list_about">
  			<li>Brian Merritt (brian.merritt@jhuapl.edu)</li>
  			<li>Thomas Mehoke (Thomas.Mehoke@jhuapl.edu)</li>
  		</ul>

  	</div>
  </div>
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
#about h2, #about h3{
	text-align:center;

}
#about .list_about{
	padding-right:1em;
	text-align: center;
  list-style:none;
}
#about h3{
	font-size: 1.5em;
}

</style>