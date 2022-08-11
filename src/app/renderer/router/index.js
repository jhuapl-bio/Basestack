import Vue from 'vue'
import Router from 'vue-router'

import Module from '@/components/Framework/Module'
import Dashboard from "@/components/Dashboard/Dashboard"

Vue.use(Router)

let router = new Router({
  routes: [
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
export default router 
