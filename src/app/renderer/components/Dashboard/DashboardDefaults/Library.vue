<template>

  <b-row id="library"  style="" >
    <h2>Library</h2>
    <b-col sm="4" v-for="module in modules_new" :key="module.name " >
        <div :id="module.name" @mouseenter="isHovered = module"  >
            <div :class="[ 'tabSide' ] " :style="{ 'justify-content': 'center' }" >
                <!-- <div class="tabSideItem" style="text-align:center; float: right" 
                    v-if="status[module.name] && status[module.name].status.fully_installed && status[module.name].status.version !== status[module.name].status.latest"
                >                
                    <span class="center-align-icon warn-icon" style="float:right" 
                        v-tooltip="{
                            content: 'This module is not up to date',
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                        }">
                        <span ><font-awesome-icon icon="exclamation" size="sm"/></span>
                    </span>
                </div> -->
                <div :class="[ 'tabSideItem' ]" style="text-align:center" v-if="module.status"
                >
                    <span class="tabIcon"
                        :style="{ 'justify-content': 'center' } " style="float:right" 
                        v-tooltip="{
                        content: module.config.tooltip,
                        placement: 'top',
                        classes: ['info'],
                        trigger: 'hover',
                        targetClasses: ['it-has-a-tooltip'],
                    }"
                    >
                        <font-awesome-icon class="configure success-icon" icon="check"/>
                    </span>
                </div>
                
                <div class="tabSideItem" style="text-align:center; float: right" v-else
                >
                    <span style=""
                    v-tooltip="{
                    content: 'Not installed',
                    placement: 'top',
                    classes: ['info'],
                    trigger: 'hover',
                    targetClasses: ['it-has-a-tooltip'],
                    }"
                    >
                        <font-awesome-icon class="configure warn-icon" icon="exclamation"/>
                    </span>
                </div>
                <div class="tabSideItem">
                    <span v-if="module.config " class="center-align-icon" style="float:right" 
                        v-tooltip="{
                        content: 'Pull Image ' + module.config.title,
                        placement: 'top',
                        classes: ['info'],
                        trigger: 'hover',
                        targetClasses: ['it-has-a-tooltip'],
                        }" 
                        v-on:click="buildModule(module.name)" 
                        >
                        <font-awesome-icon class="configure" icon="download" size="sm" />
                    </span>
                </div>
            </div>
        </div>
        <hr>
    </b-col>
    <b-col sm="12" class="tabSideItem">
        <div v-if="isHovered" style="text-align:center; "
            target="dind"
            >
            <b-table
                style="max-width: 100%"
                :items="isHovered.dependencies"
                :fields="fields"
                small
                responsive
            >
                <template  v-slot:cell(status.exists)="cell">
                    <font-awesome-icon :class="[cell.value ? 'center-align-icon success-icon' : 'center-align-icon warn-icon']" 
                    style="margin:auto; text-align:center" v-tooltip="{
                        content: [cell.value ? cell.value.version : '' ],
                        placement: 'top',
                        classes: ['info'],
                        trigger: 'hover',
                        targetClasses: ['it-has-a-tooltip'],
                        }"  :icon="(cell.value ? 'check' : 'times-circle'  )" size="sm" 
                    />
                </template>
                <template  v-slot:cell(status.building)="cell">
                     <b-spinner variant="info" v-if="cell.value" label="Downloading and/or decompressing" 
                    ></b-spinner>
                </template>
                <template  v-slot:cell(status.downloading)="cell">
                    <div v-if="cell.value"
                        style="display:flex; " 
                         >
                        <b-spinner variant="info" label="Downloading..." 
                        ></b-spinner>
                        <p class="table-text" >{{cell.item.status.progress}} %</p>
                    </div>
                </template>
                <template  v-slot:cell(status.latest)="cell">
                    <span 
                    :class="[cell.value == cell.item.version ? 'center-align-icon success-icon' : 'center-align-icon warn-icon']" 
                    style="margin:auto; text-align:center" v-tooltip="{
                            content: [cell.value == cell.item.version ? cell.value : 'Not latest version' ],
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                            }"  >
                            <font-awesome-icon :icon="(cell.value == cell.item.version ? 'check' : 'times-circle'  )" size="sm" />
                    </span> 
                </template>
                <template  v-slot:cell(status.error)="cell">
                    <span v-if="cell.value" 
                    :class="[ 'center-align-icon warn-icon']" 
                    style="margin:auto; text-align:center" v-tooltip="{
                            content: [cell.value ? cell.value : ''],
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                            }"  >
                            <font-awesome-icon :icon="'times-circle'" size="sm" /> 
                    </span>
                    <p v-else></p>

                </template>
                <template  v-slot:cell(target)="cell">
                    <p class="table-text" v-if="cell.item.label"  >
                        {{cell.item.label}}
                    </p>
                    <p class="table-text" v-else  >
                        {{cell.value}}
                    </p>
                </template>
                <template  v-slot:cell(build)="cell">
                     <b-button class="btn"  variant="info" 
                        style=""
                        @click="buildModuleDependency(isHovered.name, cell.index)">Build
                    </b-button>
                    <!-- <span 
                    style="margin:auto; text-align:center" v-tooltip="{
                            content: [cell.value ? 'Install' : 'Remove'],
                            placement: 'top',
                            classes: ['info'],
                            trigger: 'hover',
                            targetClasses: ['it-has-a-tooltip'],
                            }" v-on:click="buildDependency(module.name, cell)" >
                            <font-awesome-icon :icon="(cell.value ? 'check' : 'times-circle'  )" size="sm" />
                    </span>  -->
                </template>
            </b-table>
        </div>
    </b-col>
  </b-row>
</template>

<script>
    import FileService from '@/services/File-service.js'
	export default {
		name: 'library',	    
		data() {
			return {
                status: [],
                update: 0,
                isHovered: null,
                modules_new: [],
                fields: [
                    {
                        key: 'target',
                        label: 'Target',
                        class: "table-text"
                    },
                    {
                        key: 'type',
                        label: "Type",
                        sortable: false,
                        class: "table-text"
                    },
                    {
                        key: 'status.downloading',
                        label: 'Downloading'
                    },
                    {
                        key: 'status.exists',
                        label: 'Exists',
                        class:"table-text"
                    },
                    {
                        key: 'build',
                        label: 'Install'
                    },
                    {
                        key: 'status.latest',
                        label: 'Latest'
                    },
                    {
                        key: 'status.building',
                        label: 'Building'
                    },
                    {
                        key: 'status.error',
                        label: 'Errors'
                    }
                ],
			}
	  	},
		props: ['modules'],
		computed: {
		
		},
		
	    mounted(){
            setInterval(()=>{
                this.getStatus()
            },2000)    
	    },
	    watch: { 
	    },
		
	    methods: {
            async buildModule(name){
                FileService.buildModule({
                    module: name
                })
               .then((response)=>{
                    this.$swal({
                        title: "Image Pull process initiated",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                    })
                    
                }) 
            },
            async buildModuleDependency(name, index){
                FileService.buildModuleDependency({
                    module: name,
                    dependency:index,
                    overwrite: true
                })
               .then((response)=>{
                    this.$swal({
                        title: "Dependency install started",
                        text: "Please wait.. this may take some time",
                        icon: 'info',
                        showConfirmButton: true,
                        allowOutsideClick: true
                    });
                })
                .catch((err)=>{
                    console.error(err)
                    this.$swal.fire({
                        position: 'center',
                        icon: 'error',
                        showConfirmButton:true,
                        title: err.response.data.message
                        })
                    }) 
            },
            async getStatus(){
                const $this = this
                try{
                    let response = await FileService.getModules()
                    let status_obj = response.data.data
                    let reported_status_obj = {}
                    this.modules_new = []
                    this.modules_new = status_obj
                    this.update = this.update + 1
                    // status_obj.forEach((status)=>{
                    //     reported_status_obj[status.name] = {}
                    //     status.dependencies.forEach((dependency)=>{
                    //         reported_status_obj[status.name][dependency.name] = dependency
                    //     })

                    //     // // $this.$set($this.status, status.name, status)
                    //     let modules_identified = this.modules.filter((module)=>{
                    //          return module.name in reported_status_obj
                    //     })
                    //     modules_identified.forEach((module)=>{
                    //         module.dependencies.forEach((d)=>{
                    //             if (d.name in reported_status_obj[module.name]){
                    //                 d.status = reported_status_obj[module.name][d.name].status
                    //             }
                    //         })
                    //     })
                    // })
                    if (!this.isHovered){
                        this.isHovered = this.modules_new[1]
                    }
                    // console.log(this.modules.map((d)=>{
                    //     return d.dependencies
                    // }))
                } catch(err){
                    this.initial=false
                    console.error(`${err} error in getting status`)
                } finally {
                    this.intervalChecking = false
                }
            },
			
	    	
	    }
	};

</script>
<style>
#moduleconfig{
	width:100%;
}
</style>