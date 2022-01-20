
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************

// Import Vue
import Vue from 'vue'
// import router from './router'
import Vuex from 'vuex'
import store from './store'
import axios from 'axios'

// Bootstrap Vue Wrapper
import { BootstrapVue } from 'bootstrap-vue'
import { BootstrapVueIcons } from 'bootstrap-vue'
import 'bootstrap-vue/dist/bootstrap-vue-icons.min.css'

// VueSweetAlert - used for modals/dialogs/popups/toasts
import VueSweetalert2 from 'vue-sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css';

// Forms + Form Validation
import Vuelidate from 'vuelidate'
import Multiselect from 'vue-multiselect'
import ToggleButton from 'vue-js-toggle-button'

// Font Awesome Icons
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faDownload, faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, faExclamation, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle} from '@fortawesome/free-solid-svg-icons'

// Vuetify
import Vuetify from 'vuetify'
import 'vuetify/dist/vuetify.min.css'

// Additional Vue Libraries
import VTooltip from 'v-tooltip'
import VueScrollTo from 'vue-scrollto'
import {Slide, Carousel } from 'vue-carousel';

// Promise-flavored IPC calls in Electron [yarn add electron-promise-ipc]
import promiseIpc from 'electron-promise-ipc' 

// Spinners 
const  { HalfCircleSpinner, AtomSpinner } = require('epic-spinners');

// Functions
import path from "path"

// Entry Points
import './main.css';
import App from './App'

 
Vue.use(Vuetify)

let config = process.env.logfile
let configError = process.env.errorfile
// let logger = require("../../shared/logger.js").logger(configError, config)

// Install desired font awesome icons + define icon component
library.add( faDownload, faBinoculars, faChartPie, faHighlighter, faAnchor, faExternalLinkAlt, faBook, faHandshakeSlash, faSlash, faPhone, faUnlockAlt, faCheckCircle, faUserLock, faArrowAltCircleDown, faHome, faCircleNotch, faExclamation, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench,faAngleUp, faCheck, faTimesCircle, faAngleDown, faPlus, faMinus, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree,faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle)
Vue.component('font-awesome-icon', FontAwesomeIcon)

// Global event bus
Vue.prototype.$eventHub = new Vue(); 

// window.localStorage.clear()

if (!process.env.IS_WEB) {
  Vue.use(require('vue-electron'))
}


Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
Vue.use(BootstrapVue)
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
Vue.use(BootstrapVueIcons)
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


// Register all vue files in 
// `/src/app/renderer/components/Framework/Mods` as global vue components
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


/* eslint-disable no-new */
new Vue({
  components: { App },
  // router,
  store,
  template: '<App/>'
}).$mount('#app')



