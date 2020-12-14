
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'
import { BootstrapVue } from 'bootstrap-vue'
import VueSweetalert2 from 'vue-sweetalert2'
import Vuelidate from 'vuelidate'
import Multiselect from 'vue-multiselect'
import VTooltip from 'v-tooltip'
import  VueScrollTo from 'vue-scrollto'
import {Slide, Carousel } from 'vue-carousel';
import { library } from '@fortawesome/fontawesome-svg-core'
import { faHome, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench, faPlus, faMinus, faAngleUp, faCheck, faTimesCircle, faAngleDown, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree, faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle} from '@fortawesome/free-solid-svg-icons'
const  { HalfCircleSpinner, AtomSpinner } = require('epic-spinners');
import path from "path"
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import ToggleButton from 'vue-js-toggle-button'
import promiseIpc from 'electron-promise-ipc' // yarn add electron-promise-ipc
library.add( faHome, faVideo, faTimes, faQuestionCircle, faComment, faCommentSlash, faLevelUpAlt, faPlayCircle, faDna, faArchive, faSave, faWrench,faAngleUp, faCheck, faTimesCircle, faAngleDown, faPlus, faMinus, faChalkboard, faTrashAlt, faCog, faGlobe, faViruses, faBookOpen, faTree,faHourglassStart, faStopCircle, faSync, faAddressCard, faBars, faMinusCircle)
 
Vue.component('font-awesome-icon', FontAwesomeIcon)
Vue.prototype.$eventHub = new Vue(); // Global event bus
// window.localStorage.clear()

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
// Install BootstrapVue
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
Vue.use(VTooltip, {
	defaultBoundariesElement: document.body
});
Vue.use(VueScrollTo);

[HalfCircleSpinner, AtomSpinner].forEach((x) => Vue.use(x));

/* eslint-disable no-new */
new Vue({
  components: { App },
  router,
  store,
  template: '<App/>'
}).$mount('#app')
