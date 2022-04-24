
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Api from './Api.js'

let baseEndpoint = {
  get () {
    if (process.env.NODE_ENV == 'production'){
     return `http://localhost:${( process.env.PORT_SERVER ? process.env.PORT_SERVER : 5003)}`
    } else {
      //  return 'api'
      return `http://localhost:${( process.env.PORT_SERVER ? process.env.PORT_SERVER : 5003)}`
    }
  }
};


class FileService {
  pingServerPort(){ // USed
    return Api().get(`${baseEndpoint.get()}/server/ping`)    
  }
  updateCacheServiceVariable(params) { // Used
    return Api().post(`${baseEndpoint.get()}/session/cache/service/variable`, params)    
  }
  getDefaults(){ // USed
    return Api().get(`${baseEndpoint.get()}/defaults/get`)    
  }
  setRemoteModule(params){ // Used
    return Api().post(`${baseEndpoint.get()}/remote/set/modules`, params)    
  }
  saveRemoteModule(params){  //Used
    return Api().post(`${baseEndpoint.get()}/remote/save/modules`, params)    
  }
  getCatalog(){ // Used
    return Api().get(`${baseEndpoint.get()}/catalog/all/get`)    
  }
  getModules(param){ //Used
    return Api().get(`${baseEndpoint.get()}/modules/get/${param.catalog}`)    
  }
  getInstalledModules(){ // Used
    return Api().get(`${baseEndpoint.get()}/catalog/installed/get`) 
  }
  cancelBuild(params){ // Used
    return Api().post(`${baseEndpoint.get()}/module/build/cancel`, params)    
  }
  buildProcedure(params){ // Used
    return Api().post(`${baseEndpoint.get()}/procedure/build`, params)    
  }
  buildProcedureDependency(params){ // Used
    return Api().post(`${baseEndpoint.get()}/procedure/build/dependency`, params)    
  }
  
  getProcedures(params){ // used
    return Api().get(`${baseEndpoint.get()}/procedures/get/${params.catalog}/${params.module}/${params.token}`)    
  }
  getProcedureConfig(params){ // Used
    return Api().get(`${baseEndpoint.get()}/procedure/config/${params.catalog}/${params.module}/${params.procedure}`)    
  }
  getJobStatus(params){ // Used
    return Api().get(`${baseEndpoint.get()}/job/status/${params.catalog}/${params.module}/${params.procedure}`)    
  }
  startJob(params){ // Used
    return Api().post(`${baseEndpoint.get()}/job/start`, params)    
  }
  cancelJob(params){ // Used
    return Api().post(`${baseEndpoint.get()}/job/cancel`, params)    
  }
  getService(params){ // Used
    return Api().get(`${baseEndpoint.get()}/service/get/${params.catalog}/${params.module}/${params.procedure}/${params.service}/${params.token}` )    
  }
  getServiceStatus(params){ // Used
    return Api().get(`${baseEndpoint.get()}/status/get/service/${params.catalog}/${params.module}/${params.procedure}/${params.service}/${params.token}`)    
  }
  saveModuleText(params){ // Used
    return Api().post(`${baseEndpoint.get()}/module/save/text`, params)    
  }
  saveModuleFile(params){ // Used
    return Api().post(`${baseEndpoint.get()}/module/save/file`, params)    
  }
  getResources(){ // Used
    return Api().get(`${baseEndpoint.get()}/status/fetch`)    
  }
  getDockerStats(){ // Used
    return Api().get(`${baseEndpoint.get()}/docker/status/get`)    
  }
  getServerStatus(){ //used
    return Api().get(`${baseEndpoint.get()}/server/status/fetch`)    
  }
  cancelService(params) { // Used
    return Api().post(`${baseEndpoint.get()}/service/stop`, params)
  }
  cancelProcedureDependency(params){
    return Api().post(`${baseEndpoint.get()}/procedure/build/cancel/dependency`, params)    
  }
  fetchRemoteCatalog(target, name){ // Used
    return Api().get(`${baseEndpoint.get()}/remote/get/${target}/${name}`)
  }
  removeCatalog(params){  // Used
    return Api().post(`${baseEndpoint.get()}/catalog/remove`, params)
  }
  removeProcedureDependency(params){ // Used
    return Api().post(`${baseEndpoint.get()}/procedure/remove/dependency`, params)
  }
  fetchLogs(){ // Used
    return Api().get(`${baseEndpoint.get()}/log/system`)    
  }
  deleteOutputs(params){ //Used
    return Api().post(`${baseEndpoint.get()}/output/remove`, params)
  }
  pruneImages(){ // Used
    return Api().post(`${baseEndpoint.get()}/images/prune`)         
  }
  updateSocket(params){ // Used
    return Api().post(`${baseEndpoint.get()}/docker/socket`, params)   
  }         
  fetchDockerTags(params){ // used
    return Api().post(`${baseEndpoint.get()}/tags/fetch`, params)                    
  }
}
export default new FileService();