<template>

  <div id="moduleconfig"  style="" v-if="staged">
   <label style="text-align:center" class="typo__label">Installation Type</label>
   	<div style="display:flex">
		<v-form-select :value="staged.installation.type"  :options="['offline', 'online']" >
		</v-form-select>
		
	</div>
	<div v-if="staged.installation.type =='offline'">
    	<v-form-file 
             :ref="'docker_archive'+staged.name" 
             :id="'docker_archive'+staged.name" 
             aria-describedby="seq_file" 
             :value="staged.src"
             style="max-width: 100%"
             placeholder="Drag/choose docker image (offline)"
             drop-placeholder="Drop .tar.gz file here"
             >
        </v-form-file> 
    </div> 
    <div v-if="staged.installation.type =='online' && staged.installation.dependencies">
		<div v-for="(resource, index) in staged.installation.dependencies"  :key="resource.name">
    		<div v-if="resource.type =='file'">
    			<label style="text-align:center" class="typo__label">{{resource.name}}</label>
		        <font-awesome-icon class="help" icon="question-circle"  v-if="resource.tooltip" v-v-tooltip.hover.top 
		        	:title="resource.tooltip"/>
    			<v-form-file 
	                 :value="resource.src"
					 @input="updateSrc(index, $event)"
	                 style="max-width: 100%"
	                 :placeholder="resource.name"
	                 drop-placeholder="Place File here"
	                 >
	            </v-form-file> 
    		</div>
    	</div>
    </div>
    <div v-if="!staged.installed">
    	<span>Estimated Size: {{staged.estimated_size}} GB</span>
    </div>
    <div v-if="staged.installed && staged.inspect">
    	<span>Installed Size: {{convert_gb(staged.inspect.Size, 'B')}} GB</span>
    </div>
  </div>
</template>

<script>
	export default {
		name: 'moduleconfig',	    
		data() {
			return {
			}
	  	},
		props: ['imageName'],
		computed: {
			staged: {
				get() {
					return this.$store.getters.getStaged.images[this.imageName]
				},
				set ( value ) {
					this.$store.dispatch("UPDATESTAGEDTARGET", {target: 'images', name: this.imageName, value: this.staged})
				}
			},
		},
		
	    mounted(){
	    },
	    watch: { 
	    },
		
	    methods: {
			updateSrc(key, event){
				console.log(event)
				this.$store.dispatch("UPDATESTAGEDDEPENDENCY", {name: this.imageName, value: { filename: event.name, filepath: event.path }, index: key, target: 'images'} )
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
<style>
#moduleconfig{
	width:100%;
}
</style>