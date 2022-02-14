import Vue from 'vue'
import Router from 'vue-router'

import Module from '@/components/Framework/Module'
import Dashboard from "@/components/Dashboard/Dashboard"

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
      name: 'main', 
      component: Dashboard
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
// router.replace({ path: '*', redirect: '/' })
export default router 
