<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->

<script>



import Module from '@/components/Framework/Module'
import Dashboard from "@/components/Dashboard/Dashboard"
import LogDashboard from "@/components/Dashboard/DashboardDefaults/LogDashboard"
import CustomGenerator from "@/components/Dashboard/DashboardDefaults/CustomGenerator"
import PlayDashboard from "@/components/Dashboard/DashboardDefaults/PlayDashboard"
import Sys from "@/components/Dashboard/System/Sys"
import Library from '@/components/Dashboard/DashboardDefaults/Library'
import {FulfillingBouncingCircleSpinner } from 'epic-spinners'
import FileService from '@/services/File-service.js'

export default {
	name: 'mainpage',
	components:{
		Module,
		Dashboard,
		Library,
		LogDashboard,
		CustomGenerator,
		PlayDashboard,
		Sys,
		FulfillingBouncingCircleSpinner
	},
	
	props: [ 'defaults' ],
	data(){
		return{
			tab:0,
			mini:true,
			version: process.env.version_basestack,
			drawer:false,
			tabProcedure: 0,
			sel: 0,
			selected: 'procedures',
			colorList: [
				"rgb(70, 240,240",
				"rgb(128,0,0",
				"rgb(128,128,0",
				"rgb(255,165,0",
				"rgb(255,255,0",
				"rgb(0,128,0",
				"rgb(128,0,128",
				"rgb(255,0,255",
				"rgb(255,0,0",
				"rgb(0,255,0",
				"rgb(0,128,128",
				"rgb(0,255,255",
				"rgb(0,0,255",
				"rgb(0,0,128",
			],
			modulesInner: [],
			collapsed: false,
			isHovered: -1,
			catalog: [],
			indexLabel: null,
			index: 0,
			modules: [],
			tabFind:0,
			status: {},
			procedures: {},
			system: {},
			isLoading: false,
		}
	},
	created(){
		
	},
	watch:{
		// indexLabel(newValue, oldValue){
		// 	let index = 0
		// 	if (newValue ){
		// 		this.tab = this.labels.indexOf(newValue) + 1;
		// 	}
	  	// },
		
		
	},
	computed: {
	  hideSlider(){
		  if (this.selected == 'procedures'){
			  return false
		  } else {
			  return true
		  }
	  },
	  filtered_installed_modules(){
		  return this.modules.filter((d)=>{
			  if (d && d.status){
			  	return d.status.fully_installed
			  } else{
				  return false
			  }
		  })
	  },
	  selected_modules(){
		  return this.modules.map((d)=>{
			  return d.variants[0]
		  })
	  },
	  labels(){
		  let i = 0;
		  let labels = Object.keys(this.procedures)
		  return labels
	  }
	},
	async mounted(){
		const $this = this	
		let catalog = await FileService.getInstalledModules()
		this.catalog = catalog.data.data
					
	},

	methods: {
		renderIcon(entry){
			return this.$vuetify.icons.home
		},
		updateSelected(event, value){

			this.modules[event.module].icon = event.variant.icon
			this.modules[event.module].title = event.variant.title
			this.modules[event.module].hint = event.variant.hint

		},
		open_external(url){
			this.$electron.shell.openExternal(url)
		},
		setTab(indx, key){
			this.selected = key
			this.tab = indx
		},
		setTabProcedureNew(key){
			let index = this.modules.map((d)=>{return d.name}).indexOf(key)
			this.tab = index
			this.selected = 'procedures'
		},
		filter (item, queryText, itemText) {
			let items = []
			if (item.title){
				items.push(item.title.toLocaleLowerCase())
			}
			if (item.tags && Array.isArray(item.tags)){
				item.tags.forEach((d)=>{
					items.push(d.toLocaleLowerCase())
				})
			}
			if (item.name){
				items.push(item.name.toLocaleLowerCase())
			}
			let found = items.some((d)=>{
				return d.toLocaleLowerCase().indexOf(queryText) > -1
			})
			return found
    
		},
		emitChange(value){
			this[value.target] = value.value
	    },
		hovered(event, entry){
			entry.hovered = event
			return event
		},
		getColor(key, opacity){
			const $this = this;
			// var randomElement = this.colorList[Math.floor(Math.random()*this.colorList.length)];

			if (!(this.colorList.length % key+1)){
				return `${ this.colorList[0] }, ${opacity})`
			} else {
				let color = `${this.colorList[this.colorList.length % key+1]}, ${opacity})`
				return color
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
	  async componentImport(component){
		//   let componentImport = require(`@/components/NavbarModules/${component}/${component}`)
		  
		//   this.component(component)
	  },
	  toggleCollapseParent(){
      	this.data.collapsed = !this.collapsed
      },
      toggleCollapse(){
        this.collapsed = !this.collapsed;
        this.$emit('toggleCollapseParent', this.collapsed)
      },
      
	}
};
</script>

<style>
#mainpage2{
	position:absolute;
}

.v-carousel__item{
	width: 100% !important;
	height: 1000px !important;
	overflow-y:auto;
}
  #emblem{
    height: 8%;
    padding-top: 20px;
    margin-bottom:5px;
    padding-bottom: 5px;
    fill:none;
    background:white;
  }
  .shrunkButtonImg{
    /* max-width: 100%;
    max-height: 100%; */
    display:none;
  }
  .ButtonImg{
    /* max-height:100%; max-width:100%; */
 }
.fa-icon {
  vertical-align: middle !important;
}

 
 
</style>
<style lang="css">
	@import '../../static/css/style.css';

</style>
<style lang="css">
	@import '../../static/css/myriadpro.css';
</style>
<style lang="css">
	@import '../../static/css/revised_branding_banner.css';
</style>
<style>
	@import '../../static/css/tooltip.css';
</style>
<style scoped>
.nav-drawer{
  display: flex;
  flex-direction: column; 
}
.procedure-list{
  height:100%;
  overflow-y:auto
}
</style>