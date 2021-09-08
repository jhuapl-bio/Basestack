
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Vue from 'vue'
import Vuex from 'vuex'

import { createPersistedState, createSharedMutations } from 'vuex-electron'
// import createPromiseAction from './promise-action'
import modules from './modules'

Vue.use(Vuex)


// let plugins = []
let plugins = [createSharedMutations()]
export default new Vuex.Store({
  modules,
  plugins: plugins,
  state: {
  },
  strict: process.env.NODE_ENV !== 'production'
})
