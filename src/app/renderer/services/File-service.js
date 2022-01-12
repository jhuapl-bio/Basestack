
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Api from './Api.js'

// let baseEndpoint
let baseEndpoint = {
  get () {
    if (process.env.NODE_ENV == 'production'){
     return `http://localhost:${process.env.PORT_SERVER}`
    } else {
      //  return 'api'
      return `http://localhost:${process.env.PORT_SERVER}`
    }
  }
};
// if (process.env.NODE_ENV == 'production'){
//   baseEndpoint=  `http://localhost:${process.env.PORT_SERVER}`
// } else {
//   baseEndpoint = `http://localhost:${process.env.PORT_SERVER}`
//   // baseEndpoint = 'api'
// }

class FileService {
  pingServerPort(){
    return Api().get(`${baseEndpoint.get()}/server/ping`)    
  }
  getDefaults(){
    return Api().get(`${baseEndpoint.get()}/defaults/get`)    
  }
  getModules(){
    return Api().get(`${baseEndpoint.get()}/modules/get`)    
  }
  buildModule(params){
    return Api().post(`${baseEndpoint.get()}/module/build`, params)    
  }
  deleteModule(params){
    return Api().post(`${baseEndpoint.get()}/module/remove`, params)    
  }
  readDepVariable(params){
    return Api().post(`${baseEndpoint.get()}/variable/read`, params)    
  }
  buildModuleDependency(params){
    return Api().post(`${baseEndpoint.get()}/module/build/dependency`, params)    
  }
  getServices(){
    return Api().get(`${baseEndpoint.get()}/services/get`)    
  }
  getProcedures(){
    return Api().get(`${baseEndpoint.get()}/procedures/get`)    
  }
  getModulesStatus(){
    return Api().get(`${baseEndpoint.get()}/modules/get/status`)    
  }
  getServiceStatus(params){
    return Api().post(`${baseEndpoint.get()}/service/status`, params)    
  }
  getAllServiceStatus(){
    return Api().get(`${baseEndpoint.get()}/services/status`)    
  }
  getAllServiceNames(){
    return Api().get(`${baseEndpoint.get()}/services/names`)    
  }
  getAllProcedureNames(){
    return Api().get(`${baseEndpoint.get()}/procedures/names`)    
  }
  getAllModuleNames(){
    return Api().get(`${baseEndpoint.get()}/modules/names`)    
  }
  getService(name){
    return Api().get(`${baseEndpoint.get()}/service/get/${name}` )    
  }
  getProceduresStatus(params){
    return Api().get(`${baseEndpoint.get()}/procedures/status`, params)    
  }
  getStatusProceduresSelect(params){
    return Api().post(`${baseEndpoint.get()}/procedures/status/select`, params)    
  }
  getStatusProcedure(name){
    return Api().get(`${baseEndpoint.get()}/procedure/status/${name}` )    
  }
  getSelectProceduresStatuses(params){
    return Api().post(`${baseEndpoint.get()}/procedures/status/select`, params)    
  }
  getSelectModulesStatuses(params){
    return Api().post(`${baseEndpoint.get()}/modules/status/select`, params)    
  }
  getSelectServicesStatuses(params){
    return Api().post(`${baseEndpoint.get()}/services/status/select`, params)    
  }
  getServiceProgress(params){
    return Api().post(`${baseEndpoint.get()}/service/progress`, params)    
  }
  saveServiceText(params){
    return Api().post(`${baseEndpoint.get()}/service/save/text`, params)    
  }
  saveProcedureText(params){
    return Api().post(`${baseEndpoint.get()}/procedure/save/text`, params)    
  }
  saveModuleText(params){
    return Api().post(`${baseEndpoint.get()}/module/save/text`, params)    
  }
  saveProcedureFile(params){
    return Api().post(`${baseEndpoint.get()}/procedure/save/file`, params)    
  }
  saveServiceFile(params){
    return Api().post(`${baseEndpoint.get()}/service/save/file`, params)    
  }
  saveModuleFile(params){
    return Api().post(`${baseEndpoint.get()}/module/save/file`, params)    
  }
  getDockerStatus(){
    return Api().get(`${baseEndpoint.get()}/docker/status/fetch`)    
  }
  getResources(){
    return Api().get(`${baseEndpoint.get()}/status/fetch`)    
  }
  getDockerStats(){
    return Api().get(`${baseEndpoint.get()}/docker/status/get`)    
  }
  getServerStatus(){
    return Api().get(`${baseEndpoint.get()}/server/status/fetch`)    
  }
  cancelProcedure(params) {
    return Api().post(`${baseEndpoint.get()}/procedure/stop`, params)
  }
  cancelService(params) {
    return Api().post(`${baseEndpoint.get()}/service/stop`, params)
  }
  rmService(params) {
    return Api().post(`${baseEndpoint.get()}/service/custom/remove`, params)
  }
  rmProcedure(params) {
    return Api().post(`${baseEndpoint.get()}/procedure/custom/remove`, params)
  }
  rmModule(params) {
    return Api().post(`${baseEndpoint.get()}/module/custom/remove`, params)
  }
  startService(params){
    return Api().post(`${baseEndpoint.get()}/service/run`, params)
  }
  startProcedure(params){
    return Api().post(`${baseEndpoint.get()}/procedure/run`, params)
  }
  openMinKNOW(){
  	return Api().get(`${baseEndpoint.get()}/openMinKNOW`)
  }
  watchConsensus(params){
    return Api().post(`${baseEndpoint.get()}/consensus/watch`, params)
  }
  initWatcher(params){
    return Api().post(`${baseEndpoint.get()}/consensus/startWatch`, params)
  }
  logRampart(params){
    return Api().get(`${baseEndpoint.get()}/rampart/log`, params)
  }
  logServer(){
    return Api().get(`${baseEndpoint.get()}/system/log`)
  }
  logArticConsensus(params){
    return Api().get(`${baseEndpoint.get()}/artic_consensus/log`, params)
  }
  fetchLog(params){
    return Api().get(`${baseEndpoint.get()}/log/` + params.name +`/`+params.type)    
  }
  fetchPrimers(){
    return Api().get(`${baseEndpoint.get()}/primers/fetch`)
  }
  fetchProtocols(){
    return Api().get(`${baseEndpoint.get()}/protocols/fetch`)
  }
  fetchHistories(){
    return Api().get(`${baseEndpoint.get()}/histories/fetch`)
  }
  fetchAnnotations(){
    return Api().get(`${baseEndpoint.get()}/annotations/fetch`)
  }
  bookmarkSelections(params){
    return Api().post(`${baseEndpoint.get()}/bookmark/add`, params)
  }
  timestampAdd(params){
    return Api().post(`${baseEndpoint.get()}/timestamp/add`, params)
  }
  removeBookmark(params){
    return Api().post(`${baseEndpoint.get()}/bookmark/remove`, params)
  }
  removeTimestamp(params){
    return Api().post(`${baseEndpoint.get()}/timestamp/remove`, params)
  }
  removeAnnotation(params){
     return Api().post(`${baseEndpoint.get()}/annotation/remove`, params)
  }
  fetchVideos(){
     return Api().get(`${baseEndpoint.get()}/videos/fetch`)
  }
  fetchVideosMeta(){
    return Api().get(`${baseEndpoint.get()}/videos/fetchMeta`)
  }
  loadImages(params){
    return Api().post(`${baseEndpoint.get()}/install/images`+params.config.type, params)    
  }
  removeImages(imageName){
    return Api().post(`${baseEndpoint.get()}/install/removeImages/`, {imageName: imageName})    
  }
  logImageInstall(params){
    return Api().get(`${baseEndpoint.get()}/install/imageInstallLogs/` +  params.imageName)    
  }
  cancelInstallImage(imageName){
    return Api().post(`${baseEndpoint.get()}/install/cancelInstallImage`, {imageName: imageName})        
  }
  pruneImages(){
    return Api().post(`${baseEndpoint.get()}/install/pruneImages`)        
  }
  validateRunDirContents(params){
    return Api().post(`${baseEndpoint.get()}/validate/validateRunDirContents`, params)        
  }
  moduleStatus(params){
    return Api().post(`${baseEndpoint.get()}/consensus/status`, params)        
  }
  checkImageStatus(params){
    return Api().post(`${baseEndpoint.get()}/images/status`, params)        
  }
  fetchVideo(params){
    return Api().post(`${baseEndpoint.get()}/videos/fetch`, params)            
  }
  fetchMeta(){
    return Api().get(`${baseEndpoint.get()}/meta/fetch`)                
  }
  fetchStatus(params){
    return Api().post(`${baseEndpoint.get()}/status/modules/fetch`, params)
  }
  updateSocket(params){
    return Api().post(`${baseEndpoint.get()}/docker/socket`, params)   
  }         
  selectTag(params){
    return Api().post(`${baseEndpoint.get()}/tags/select`, params)  
  }
  addSelection(params){
    return Api().post(`${baseEndpoint.get()}/selections/add`, params)  
  }
  rmSelection(params){
    return Api().post(`${baseEndpoint.get()}/selections/rm`, params)  
  }
  fetchDockerTags(params){
    return Api().post("http://localhost:5003/tags/fetch", params)                    
  }
}
export default new FileService();