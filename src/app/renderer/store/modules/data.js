
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
import nestedProperty from "nested-property"
let config = process.env.logfile
let configError = process.env.errorfile

let logger = require("../../../../shared/logger.js").logger(configError, config)

function getDefaultState(){
  return {
    meta: {},
    defaults: [],
    modules:[],
    system: {},
    status: {},
    catalog: {
    },
    staged: {
      images:{},
      modules:{},
      pipelines:{},
    },

  }
}
const state = getDefaultState()

const actions = {
  UPDATE_PROCEDURE ({ commit }, params) {
    logger.info("yes.......................................")
    commit("UPDATE_PROCEDURE", params)
    // return new Promise((resolve, reject)=>{
    //   commit('UPDATE_PROCEDURE', params);
    //   resolve(params)
    // })
  },
  setLogger ({ commit }, logger) {
    commit("setLogger", logger)
    // return new Promise((resolve, reject)=>{
    //   commit('UPDATE_PROCEDURE', params);
    //   resolve(params)
    // })
  },
  clearAll({commit}){
    return new Promise((resolve, reject)=>{
      commit("clearAll")
      resolve()
    })      
  }
};

const mutations = {
  UPDATE_PROCEDURE (state, meta){
    state.logger.info("yes")
    // nestedProperty.set(`state.catalog.${meta.catalog}.modules.${meta.module}.procedures${meta.procedure}`, meta)
    state.catalog = {new:1}
  },
  setLogger (state, logger){
    state.logger = logger
  },
  SYSTEM (state, system){
    state.system = system
  },
  STATUS (state, status){
    state.status = status
  },
  STAGEDTARGET (state, obj) {
    state.staged[obj.target][obj.name] = obj.value
    
  },
  STAGED (state, obj) {
    state.staged = obj
  },
  STAGEDDEPENDENCY (state, obj) {
    state.staged[obj.target][obj.name].installation.dependencies[obj.index].srcFormat = obj.value    
  },
  STAGEDINPUT (state, obj){
    state.staged[obj.target][obj.name][obj.attr].src = obj.value
  },
  PRIMER_FOLDER (state, obj) {
    state.consensus_params.primerFolder = obj
  },
  PROTOCOL_FOLDER (state, obj) {
    state.consensus_params.protocolFolder = obj
  },
  ANNOTATIONS_FOLDER (state, obj) {
    state.consensus_params.annotationsFolder = obj
  },
  REPORT_FOLDER (state, obj) {
    state.rampart_params.reportFolder = obj
  },
  NEW_FOLDER (state, name) {
    state.consensus_params.newState = name
  },
  NEW_NAME(state, name){
    state.consensus_params.name = name
  },
  HISTORY(state, obj){
    state.history = obj
  },
  clearAll(state,name){ //https://github.com/vuejs/vuex/issues/1118#issuecomment-356286218
    const s = getDefaultState()
    Object.keys(s).forEach(key => {
      // delete state[key]
      state[key] =   s[key]
    })
  }
};

const getters = {
  getProcedures: state => state.catalog,
  getCatalog: state => state.catalog,
}

export default {
  state,
  getters,
  actions,
  mutations
};
