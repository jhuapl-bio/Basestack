<script setup>
import {onMounted, reactive, defineProps, computed} from 'vue'
import {RouterView} from 'vue-router'
import Dashboard from './views/Dashboard.vue'
import {useIpcRenderer} from '@vueuse/electron'
import FileService from '@/services/File-service.js'
import SystemSummary from './components/Dashboard/System/SystemSummary.vue'
import AppLayout from './components/AppLayout.vue'
// import Dashboard from './components/Dashboard/Dashboard.vue'

const ipcRenderer = useIpcRenderer()

const data = reactive({
    modules: [],
    procedures: {},
    defaultModule: {},
    tabProcedure: null,
    selected: 'defaults',
    tab: 0,
    mini: true,
    drawer: false,
    sel: 0,
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
    tabFind:0,
    status: {},
    system: {},
    isLoading: false,
    ready: false,
    interval: null,
    catalogInterval: null,
    services: false,
    defaults: [],
    runningServer: false,
    running: false
})

const version = computed(() =>  process.env.version_basestack)
const selectedPort = computed(() => process.env.PORT_SERVER)
const hideSlider = computed(() => data.select === 'procedures')
const filtered_installed_modules = computed(() => {
    return data.modules.filter(module => {
        return module && module.status
            ? module.status.fully_installed
            : false
    })
})

const selected_modules = computed(() => {
    return data.modules.map(module => module.modules[0])
})

const labels = computed(() => {
    return Object.keys(data.procedures)
})

onMounted(async () => {
    ipcRenderer.on('change-port', (event, port) => {
        process.env.PORT_SERVER = port
        data.runningServer = true
        createPingInterval()
    })

    try {
        await pingServerPort()
        await init()
        data.ready = true
        data.runningServer = true
    } catch (error) {
        console.error(error)
        data.ready = false
    } finally {
        createPingInterval()
        data.ready = true
    }
})

async function createPingInterval() {
    console.log(`Create interval for ping", ${process.env.PORT_SERVER}.`)
    data.runningServer = true
    data.ready = false
    data.interval = setInterval(async () => {
        if(data.runningServer) 
            clearInterval(data.interval)

        try {
            let ping = await pingServerPort()
            if(ping) init()
        } catch (error) {
            console.error(`Could not get server status, check if it is running on port: ${process.env.PORT_SERVER}.`)
            data.runningServer = false
        }
    }, 6000)
}

function pingServerPort() {
    return FileService.pingServerPort()
}

async function init() {
    try {
        let fileServiceDefaults = FileService.getDefaults()

        await getModules()
        
        if(data.moduleInterval) 
            clearInterval(data.moduleInterval)

        data.moduleInterval = setInterval(() => {
            getModules()
        }, 2000)

        // stores token or 'in development' prop in global state
        // @todo: setup global state (vuex or pinia)
        /*
        if (process.env.NODE_ENV == 'development') {
            data.$store.token = 'development'
        } else {
            let token = await FileService.createSession()
            data.$store.token = token.data.data
        }
        */

        data.defaults = fileServiceDefaults
        data.runningServer = true
    } catch (error) {
        console.error(error, "Backend server is not running")
        data.running = false
        data.ready = true
        // sweet alert fire
        // data.$swal.fire({
        //     position: 'center',
        //     icon: 'error',
        //     showConfirmButton:true,
        //     title:  "Error in starting initialization",
        //     text:  err.response.data.message
        // }) 
        throw error
    } finally {
        data.running = true // added this for dev.. since server is not working for me locally.
        data.ready = true
    }
}

async function getModules() {
    let installedModules = await FileService.getInstalledModules()

    data.catalog = installedModules.data.data
        .map((module, index) => {
            module.idx = index
            return module
        })
        .forEach((module, index) => {
            data.$set(data.catalog, index, module)
        })
}

function clearAll() {
    data.modules = []
    data.services = []
    data.defaults = []
    data.procedures = []
    data.running = false
}

</script>

<template>
    <main id="app" class="subpixel-antialiased bg-white font-body">
        <div v-if="data.ready && data.running" class="flex w-full">
        <!-- <MainPage
            v-bind:defaults="defaults"
            v-bind:modules="modules"
            v-bind:procedures="procedures"
            v-bind:services="services"
        /> -->
            
           <Dashboard />
            <!-- <RouterView /> -->
        </div>

        <div v-else-if="!data.ready" class="absolute flex items-center justify-center w-screen h-screen bg-blue-900">
            <header class="px-24 py-12 space-y-2 border border-white rounded-lg">
                <h2 class="text-center text-white uppercase markup-h5">Welcome to Basestack</h2>
                <h3 class="text-center text-white markup-h2 animate-pulse">Initiating…</h3>
            </header>
        </div>

        <div v-else>   
            <AppLayout hasSidebar="true">
                <template #title>
                    <h3 class="text-gray-800 markup-h3">Backend Server is not available</h3>
                </template>

                <template #sidebar>
                    <SystemSummary />
                </template>
            </AppLayout>
        </div>
    </main>
</template>