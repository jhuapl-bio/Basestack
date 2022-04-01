import Vue from 'vue'
import Router from 'vue-router'

import Module from '@/components/Framework/Module'
import Dashboard from "@/views/Dashboard"
import Library from "@/views/Library"
import Logs from "@/views/Logs"
import System from "@/views/System"
import Tutorials from "@/views/Tutorials"

Vue.use(Router)

let router = new Router({
  routes: [
    // {
    //     path: '/catalog/:id', 
    //     component: Module,
    //     props: true
    // },
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
    {
      path: '*',
      redirect: '/'
    }
  ]
})
// router.replace({ path: '*', redirect: '/' })
export default router 
