
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
import { getField, updateField } from 'vuex-map-fields'


function getDefaultState(){
  return {
    meta: {},
    system: {},
    status: {},
    staged: {
      images:{},
      modules:{},
      pipelines:{},
    },

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
  UPDATEMETA({ commit }, meta){
    return new Promise((resolve, reject)=>{
      commit('META', meta)
      resolve()
    })
  },
  UPDATESTATUS({ commit}, status){
    return new Promise((resolve, reject)=>{
      commit('STATUS', status)
      resolve()
    })
  },
  UPDATESYSTEM({ commit}, system){
    return new Promise((resolve, reject)=>{
      commit('SYSTEM', system)
      resolve()
    })
  },
  UPDATESTAGEDTARGET ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('STAGEDTARGET', obj)
      commit('STAGED', state.staged)
      resolve()
    })
  },
  UPDATESTAGEDDEPENDENCY ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('STAGEDDEPENDENCY', obj)
      commit('STAGED', state.staged)
      resolve()
    })
  },
  UPDATESTAGED ({ commit }, obj) {
    return new Promise((resolve, reject)=>{
      commit('STAGED', obj)
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
  META (state, meta){
    state.meta = meta
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
  getSystem: state => state.system,
  getMeta: state => state.meta,
  getStatus: state => state.status,
  getStaged: state => state.staged
}

export default {
  state,
  getters,
  actions,
  mutations
};
