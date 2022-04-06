<!--
  - # **********************************************************************
  - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  - #
  - # All Rights Reserved.
  - # For any other permission, please contact the Legal Office at JHU/APL.
  - # **********************************************************************
  -->

<template>
    <main id="app" class="subpixel-antialiased bg-white font-body">
        <div v-if="(ready && running) || devMode" class="flex w-full">
        <!-- <MainPage
            v-bind:defaults="defaults"
            v-bind:modules="modules"
            v-bind:procedures="procedures"
            v-bind:services="services"
        /> -->
            
            <router-view />
        </div>

        <div v-else-if="!ready" class="absolute flex items-center justify-center w-screen h-screen bg-blue-900">
            <header class="px-24 py-12 space-y-2 border border-white rounded-lg">
                <h2 class="text-center text-white uppercase markup-h5">Welcome to Basestack</h2>
                <h3 class="text-center text-white markup-h2 animate-pulse">Initiating…</h3>
            </header>
        </div>

        <div v-else>   
            <app-layout hasSidebar="true">
                <template #title>
                    <h3 class="text-gray-800 markup-h3">Backend Server is not available</h3>
                </template>

                <template #sidebar>
                    <system-summary />
                    <contact />
                </template>
            </app-layout>
        </div>
    </main>
</template>

<script>
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
// import MainPage from '@/components/MainPage'
import FileService from '@/services/File-service.js'
import SystemSummary from './components/Dashboard/System/SystemSummary.vue'
import Contact from './components/Dashboard/Contact.vue'
import AppLayout from './components/AppLayout.vue'


const moment = require('moment');
const {dialog}=require("electron")
export default {
	name: 'client',
	components: {
        // MainPage,
        'app-layout': AppLayout,
        'system-summary': SystemSummary,
        'contact': Contact,
    },
    data(){
        return {
            devMode: true,
            ready:false,
            interval: null,
            modules: false,
            services: false,
            procedures: false,
            defaults: false,
            runningServer: false,
            running: false
        }
    },
	async mounted() {
        const $this = this;
        this.$electron.ipcRenderer.on('changePort', (evt, port)=>{
            console.log("changed port", port)
            process.env.PORT_SERVER = port
            $this.runningServer = false
            $this.createPingInterval()
        })

        this.createPingInterval()

        this.$electron.ipcRenderer.send('maiN')
        await this.$store.dispatch("UPDATEDEFAULTS", this.defaults)
        await this.$store.dispatch("UPDATEDEMODULES", this.modules)
        this.ready = true
	},
    methods: {
        clearAll(){
            this.modules = []
            this.services = []
            this.defaults = []
            this.procedures = []
            this.running = false
        },

        async createPingInterval(){
            console.log("create interval for ping", process.env.PORT_SERVER)
            const $this = this;
            if (this.interval){
                clearInterval(this.interval)
            }
            this.clearAll()
            this.runningServer = false
            this.interval = setInterval(async () => {
                if (this.runningServer){
                    clearInterval($this.interval)
                } else {
                    try {
                        let f = await $this.pingServerPort()
                        console.log(f)
                        if (f)
                        {
                        this.runningServer = true
                        await this.init()
                        }
                    } catch(err){
                        console.error("Could not get server status, check if it is running on port: ", process.env.PORT_SERVER)
                    }
                }
            }, 2000)
        },

        async pingServerPort() {
            return FileService.pingServerPort()
        },

        async init() {
            try {
                const $this = this
                let modules = await FileService.getModules()
                let defaults= await FileService.getDefaults()
                let procedures = await FileService.getProcedures()
                let services = await FileService.getServices()
                // let serverStatus = await FileService.getServerStatus()
                // let dockerStatus = await FileService.getDockerStatus()
                this.modules = modules.data.data
                this.defaults = defaults.data.data
                this.services = services.data.data
                this.procedures = procedures.data.data
                this.running = true
                return 
            } catch(err) {
                console.error(err, "Backend server is not running")
                this.running = false 
                this.ready = true
                this.$swal.fire({
                    position: 'center',
                    icon: 'error',
                    showConfirmButton:true,
                    title:  "Error in starting initialization",
                    text:  err.response.data.message
                }) 

                throw err
            } finally{
                this.ready = true
            }
        }
    }
};
</script>

