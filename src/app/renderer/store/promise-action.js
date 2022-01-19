
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import promiseIpc from 'electron-promise-ipc' // yarn add electron-promise-ipc
//https://github.com/vue-electron/vuex-electron/issues/23#issuecomment-470905854
const DISPATCH = 'promise-action-dispatch'

export default (options = {}) => store => {
  function renderer () {
    store.dispatchPromise = (type, payload) =>
      promiseIpc.send(DISPATCH, {
        type,
        payload
      })
  }

  function main (store) {
    promiseIpc.on(DISPATCH, ({ type, payload }) => {
      return store.dispatch(type, payload)
    })
  }

  return process.type === 'renderer'
    ? renderer()
    : main(store)
}