
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************


import Vue from 'vue'
import axios from 'axios'

import App from './App'
// import router from './router'
import store from './store'
// import { BootstrapVue } from 'bootstrap-vue'
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css';
import Vuex from 'vuex'


import Vuelidate from 'vuelidate'
import Multiselect from 'vue-multiselect'
import VTooltip from 'v-tooltip'
import  VueScrollTo from 'vue-scrollto'
import {Slide, Carousel } from 'vue-carousel';
const  { HalfCircleSpinner, AtomSpinner } = require('epic-spinners');
import path from "path"
import ToggleButton from 'vue-js-toggle-button'
import promiseIpc from 'electron-promise-ipc' // yarn add electron-promise-ipc
// import { BootstrapVueIcons } from 'bootstrap-vue'
// import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'
 

let config = process.env.logfile
let configError = process.env.errorfile
// let logger = require("../../shared/logger.js").logger(configError, config)

Vue.prototype.$eventHub = new Vue(); // Global event bus
// window.localStorage.clear()

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// Install BootstrapVue
// Vue.use(BootstrapVue)
Vue.use(VueSweetalert2)
Vue.use(Vuelidate)
Vue.use(ToggleButton)
Vue.use(Carousel);
Vue.use(Slide);
Vue.component('Carousel', Carousel)
Vue.component('Slide', Slide)
Vue.use(require('vue-moment'));
Vue.use(Multiselect)
Vue.use(Vuex)
// Vue.use(BootstrapVueIcons)
Vue.use(VTooltip, {
	defaultBoundariesElement: document.body
});

Vue.use(VueScrollTo);

[HalfCircleSpinner, AtomSpinner].forEach((x) => Vue.use(x));


// if (process.env.NODE_ENV === 'development') {
//   devtools.connect('localhost', process.env.rendererBasePort)
// }


// Vue.prototype.$logger = logger
import upperFirst from 'lodash/upperFirst'
import camelCase from 'lodash/camelCase'

const requireComponent = require.context(
  // The relative path of the components folder
  './components/Framework/Mods',
  // Whether or not to look in subfolders
  false,
  // The regular expression used to match base component filenames
  /Base[A-Z]\w+\.(vue)$/
)
 


requireComponent.keys().forEach(fileName => {
  // Get component config
  const componentConfig = requireComponent(fileName)

  // Get PascalCase name of component
  const componentName = upperFirst(
    camelCase(
      // Gets the file name regardless of folder depth
      fileName
        .split('/')
        .pop()
        .replace(/\.\w+$/, '')
    )
  )
  // Register component globally
  Vue.component(
    componentName,
    // Look for the component options on `.default`, which will
    // exist if the component was exported with `export default`,
    // otherwise fall back to module's root.
    componentConfig.default || componentConfig
  )
})

Vue.directive('pin', {
  bind: function (el, binding, vnode) {
      Object.entries(binding.value).forEach((d)=>{
        el[d[0]] = d[1]
      })
  }

})

import vuetify from '@/plugins/vuetify' // path to vuetify export
/* eslint-disable no-new */
new Vue({
  vuetify,
  components: { App,},
  // router,
  store,
  template: '<App/>'
}).$mount('#app')



