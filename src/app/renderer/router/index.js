import {createRouter, createWebHistory} from 'vue-router'
import Module from '@/components/Framework/Module'
import Dashboard from "@/views/Dashboard"
import Library from "@/views/Library"
import Logs from "@/views/Logs"
import System from "@/views/System"
import Tutorials from "@/views/Tutorials"

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'dashboard', 
            component: Dashboard
        },
        {
            path: '/library',
            name: 'library', 
            component: Library
        },
        {
            path: '/logs',
            name: 'logs', 
            component: Logs
        },
        {
            path: '/system',
            name: 'system', 
            component: System
        },
        {
            path: '/tutorials',
            name: 'tutorials', 
            component: Tutorials
        },
        // {
        //     path: '*',
        //     redirect: '/'
        // }
    ]
})

export default router 
