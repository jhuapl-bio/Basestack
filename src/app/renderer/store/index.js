
//   // - # **********************************************************************
//   // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
//   // - #
//   // - # All Rights Reserved.
//   // - # For any other permission, please contact the Legal Office at JHU/APL.
//   // - # **********************************************************************
  
// import Vue from 'vue'
// import Vuex from 'vuex'

// import { createPersistedState, createSharedMutations } from 'vuex-electron'
// // import createPromiseAction from './promise-action'
// import modules from './modules'

// Vue.use(Vuex)


// // let plugins = []
// let plugins = [createSharedMutations()]
// export default new Vuex.Store({
//   modules,
//   plugins: plugins,
//   state: {
//   },
//   strict: process.env.NODE_ENV !== 'production'
// })
const cloneDeep = require("lodash.clonedeep");

import Vue from "vue"
import Vuex from "vuex"
import { createPersistedState, createSharedMutations } from "vuex-electron"
import nestedProperty from "nested-property"
let config = process.env.logfile
let configError = process.env.errorfile
import createLogger from 'vuex/dist/logger';

// let logger = require("../../../shared/logger.js").logger(configError, config)
// const logger = createLogger({
//   collapsed: false, // auto-expand logged mutations
//   filter (mutation, stateBefore, stateAfter) {
//     // returns `true` if a mutation should be logged
//     // `mutation` is a `{ type, payload }`
//     return mutation.type !== "aBlocklistedMutation"
//   },
//   actionFilter (action, state) {
//     // same as `filter` but for actions
//     // `action` is a `{ type, payload }`
//     return action.type !== "aBlocklistedAction"
//   },
//   transformer (state) {
//     // transform the state before logging it.
//     // for example return only a specific sub-tree
//     return state.subTree
//   },
//   mutationTransformer (mutation) {
//     // mutations are logged in the format of `{ type, payload }`
//     // we can format it any way we want.
//     return mutation.type
//   },
//   actionTransformer (action) {
//     // Same as mutationTransformer but for actions
//     return action.type
//   },
//   logActions: true, // Log Actions
//   logMutations: true, // Log mutations
//   logger: console, // implementation of the `console` API, default `console`
// })

Vue.use(Vuex)
function getDefaultState(){
  return {
    meta: {},
    amount: 0,
    defaults: [],
    modules:[],
    system: {},
    status: {},
    watcher: null,
    catalog: {
  
    },
    configs: {

    },
    staged: {
      images:{},
      modules:{},
      pipelines:{},
    },
  }
  
}
export default new Vuex.Store({
  state: getDefaultState(),

  actions: {
    CREATE_PROCEDURE ({ commit }, params) {
      
      commit("CREATE_PROCEDURE", params)
      
    },
    SAVE_PROCEDURE_DEFAULT ({ commit }, params) {
      
      commit("SAVE_PROCEDURE_DEFAULT", params)
      
    },
    
    UPDATE_VARIABLE ({ commit }, params) {
      commit("UPDATE_VARIABLE", params)
    },
    UPDATE_AMOUNT ({ commit }, params) {
      commit("UPDATE_AMOUNT", params)
    },
    setLogger ({ commit }, logger) {
      commit("setLogger", logger)
    },
    clearAll({commit}){
      return new Promise((resolve, reject)=>{
        commit("clearAll")
        resolve()
      })      
    },
    clearCatalog ({commit}, params){
      commit("clearCatalog", params)     
    }
  },

  mutations: {
    CREATE_PROCEDURE (state, meta){
      let found = nestedProperty.get(state,`catalog.${meta.catalog}.procedures.${meta.procedure}`);
      nestedProperty.set(state,`catalog.${meta.catalog}.procedures.${meta.procedure}`, cloneDeep(meta.obj))
      
    },
    SAVE_PROCEDURE_DEFAULT (state, meta){
      nestedProperty.set(state,`configs.${meta.catalog}.procedures.${meta.procedure}`, cloneDeep(meta.config))
      
    },
    UPDATE_AMOUNT (state, variable){
      state.amount++ 
    },
    UPDATE_VARIABLE (state, variable){
      nestedProperty.set(state,`catalog.${variable.catalog}.procedures.${variable.procedure}.variables.${variable.name}.source`, variable.source)
    },
    // SET_WATCHER (state, watcher){
    //   nestedProperty.set(state,`catalog.${watcher.catalog}.modules.${watcher.module}.procedures.${watcher.procedure}.watcher`, watcher.watcher)
    // },
    setLogger (state, logger){
      state.logger = logger 
    },
    clearCatalog (state, params){
      try{
        delete state.catalog[params.catalog].procedures[params.procedure] 
      } catch(err){
        console.error(err)
      }
    },
    clearAll(state,name){ //https://github.com/vuejs/vuex/issues/1118#issuecomment-356286218
      const s = getDefaultState()
      Object.keys(s).forEach(key => {
        delete state[key]
        state[key] = s[key]
      })
    }
  },
  getters:{
    getProcedures: state => state.catalog,
    getCatalog: state => state.catalog,
    getProcedure: (state) => (params) =>{
      return nestedProperty.get(state,`catalog.${params.catalog}.modules.${params.module}.procedures.${params.procedure}`);
    }
  },

  plugins: [ createLogger({}), createPersistedState()],
  strict: process.env.NODE_ENV !== "production"
})