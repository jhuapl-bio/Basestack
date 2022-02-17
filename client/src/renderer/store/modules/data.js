
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
function getDefaultState(){
  return {
    consensus_params: {
      name: null,
      fastqFolder: null,
      primerFolder: null,
      reportFolder: null,
      newState: true
    },
    rampart_params:{
      protocolFolder: null,
      annotationsFolder: {},
      fastqFolder: null,
    },
    history: null 
  }
}
const state = getDefaultState()

const actions = {
  FASTQ_FOLDER ({ commit }, name) {
    return new Promise((resolve, reject)=>{
      commit('FASTQ_FOLDER', name);
      resolve()
    })
  },
  CONSENSUS_FOLDER ({ commit }, name) {
    return new Promise((resolve, reject)=>{
      commit('CONSENSUS_FOLDER', name);
      resolve()
    })
  },
  PRIMER_FOLDER ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('PRIMER_FOLDER', obj);
      resolve()
    })
  },
  PROTOCOL_FOLDER ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('PROTOCOL_FOLDER', obj);
      resolve()
    })
  },
  ANNOTATIONS_FOLDER ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('ANNOTATIONS_FOLDER', obj);
      resolve()
    })
  },
  REPORT_FOLDER ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('REPORT_FOLDER', obj)
      resolve()
    })
  },
  NEW_FOLDER ({ commit }, name) {
    return new Promise((resolve, reject)=>{
      commit('NEW_FOLDER', name);
      resolve()
    })
  },
  NEW_NAME({ commit }, name) {
    return new Promise((resolve, reject)=>{
      commit('NEW_NAME', name);
      resolve()
    })
  },
  HISTORY({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('HISTORY', obj)
      resolve()
    })
  },
  clearAll({commit}){
    return new Promise((resolve, reject)=>{
      commit("clearAll")
      resolve()
    })      
  }
};

const mutations = {
  FASTQ_FOLDER (state, name) {
    state.consensus_params.fastqFolder = name
    state.rampart_params.fastqFolder = name
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

export default {
  state,
  actions,
  mutations
};
