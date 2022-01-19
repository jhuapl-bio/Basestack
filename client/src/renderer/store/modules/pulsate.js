
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
const state = {
  rampart: {type: null, pulse: false},
  logs: {type: null, pulse: false},
  nextstrain: {type: null, pulse: false},
  artic_consensus: {type: null, pulse: false},

};

const actions = {
  PULSATE ({ commit }, nav) {
    return new Promise((resolve, reject)=>{
      commit('PULSATE', nav);
      resolve()
    })
  },
  clearAllPulse({commit}){
    commit("clearAllPulse")
  }
};
const getters = {
  PULSATE: (state) => (keyword) =>{
    return state[keyword]
  }
  
  
};
const mutations = {
  PULSATE (state, nav) {
    state[nav.box] = {type: nav.type, pulse: nav.pulse}
  },
  clearAllPulse(state,name){ //https://github.com/vuejs/vuex/issues/1118#issuecomment-356286218
    const s = state
    Object.keys(s).forEach(key => {
      // delete state[key]
      state[key] = s[key]
    })
    return
  }
};

export default {
  actions,
  state,
  mutations,
  getters
};