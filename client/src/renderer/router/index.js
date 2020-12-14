import Vue from 'vue'
import Router from 'vue-router'
import Nextstrain from '@/components/NavbarModules/Nextstrain/Nextstrain'
import IGV from '@/components/NavbarModules/IGV/IGV'
import RAMPART from '@/components/NavbarModules/RAMPART/RAMPART'
import BasestackConsensus from "@/components/NavbarModules/BasestackConsensus/BasestackConsensus"
import ModuleInstall from "@/components/NavbarModules/ModuleInstall/ModuleInstall"
import Logs from "@/components/NavbarModules/Logs/Logs"
import About from "@/components/NavbarModules/About/About"
import Tutorial from "@/components/NavbarModules/Tutorial/Tutorial"

Vue.use(Router)

export default new Router({
  routes: [
    // {
    //   path: '/',
    //   name: 'basestack_consensus',
    //   component: require('@/components/NavbarModules/BasestackConsensus/BasestackConsensus').default,
    // },
     {
      path:'basestack_consensus',
      name:'Basestack_consensus',
      component: BasestackConsensus
    },
    // children: [
    {
      path:'nextstrain',
      name: 'nextstrain',
      component: Nextstrain
    },
    {
      path:'igv',
      name: 'igv',
      component: IGV
    },
    {
      path:'rampart',
      name:'rampart',
      component: RAMPART
    },
   // {
   //    path: '/',
   //    name: 'rampart',
   //    component: require('@/components/NavbarModules/RAMPART/RAMPART').default,
   //  },
    // {
    //   path:'logs',
    //   name:'logs',
    //   component: Logs
    // },
     {
      path:'/',
      name:'logs',
      component: require('@/components/NavbarModules/Logs/Logs').default
    },
    {
      name:'moduleinstall',
      path:'moduleinstall',
      component: ModuleInstall
    },
    // {
    //   name:'settings',
    //   path:'/',
    //   component: require('@/components/NavbarModules/Settings/Settings').default,
    // },
    {
      name:'about',
      path:'about',
      component: About
    },
    {
      name:'tutorial',
      path:'tutorial',
      component: Tutorial
    },
    // {
    //   name:'tutorial',
    //   path:'/',
    //   component:  require('@/components/NavbarModules/Tutorial/Tutorial').default
    // },
      // ]Tuttoria
    // },
    {
      path: '/',
      redirect: '/'
    }
  ]
})
