
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Api from './Api.js'
let baseEndpoint;
if (process.env.NODE_ENV == 'production'){
  baseEndpoint = `http://localhost:${process.env.PORT_SERVER}`
} else {
  baseEndpoint = 'api'
}
class FileService {
  getDefaults(){
    return Api().get(`${baseEndpoint}/defaults/get`)    
  }
  getModules(){
    return Api().get(`${baseEndpoint}/modules/get`)    
  }
  buildModule(params){
    return Api().post(`${baseEndpoint}/module/build`, params)    
  }
  buildModuleDependency(params){
    return Api().post(`${baseEndpoint}/module/build/dependency`, params)    
  }
  getServices(){
    return Api().get(`${baseEndpoint}/services/get`)    
  }
  getProcedures(){
    return Api().get(`${baseEndpoint}/procedures/get`)    
  }
  getModulesStatus(){
    return Api().get(`${baseEndpoint}/modules/get/status`)    
  }
  getServiceStatus(params){
    return Api().get(`${baseEndpoint}/service/status/${params.service}`)    
  }
  getAllServiceStatus(){
    return Api().get(`${baseEndpoint}/services/status`)    
  }
  getProceduresStatus(params){
    return Api().get(`${baseEndpoint}/procedures/status`, params)    
  }
  getProceduresStatusSelect(params){
    return Api().post(`${baseEndpoint}/procedures/status/select`, params)    
  }
  getServiceProgress(params){
    return Api().post(`${baseEndpoint}/service/progress`, params)    
  }
  getDockerStatus(){
    return Api().get(`${baseEndpoint}/docker/status/fetch`)    
  }
  getResources(){
    return Api().get(`${baseEndpoint}/status/fetch`)    
  }
  getServerStatus(){
    return Api().get(`${baseEndpoint}/server/status/fetch`)    
  }
  cancelProcedure(params) {
    return Api().post(`${baseEndpoint}/procedure/stop`, params)
  }
  cancelService(params) {
    return Api().post(`${baseEndpoint}/service/stop`, params)
  }
  startService(params){
    return Api().post(`${baseEndpoint}/service/run`, params)
  }
  startProcedure(params){
    return Api().post(`${baseEndpoint}/procedure/run`, params)
  }
  openMinKNOW(){
  	return Api().get(`${baseEndpoint}/openMinKNOW`)
  }
  watchConsensus(params){
    return Api().post(`${baseEndpoint}/consensus/watch`, params)
  }
  initWatcher(params){
    return Api().post(`${baseEndpoint}/consensus/startWatch`, params)
  }
  logRampart(params){
    return Api().get(`${baseEndpoint}/rampart/log`, params)
  }
  logServer(){
    return Api().get(`${baseEndpoint}/system/log`)
  }
  logArticConsensus(params){
    return Api().get(`${baseEndpoint}/artic_consensus/log`, params)
  }
  fetchLog(params){
    return Api().get(`${baseEndpoint}/log/` + params.name +`/`+params.type)    
  }
  fetchPrimers(){
    return Api().get(`${baseEndpoint}/primers/fetch`)
  }
  fetchProtocols(){
    return Api().get(`${baseEndpoint}/protocols/fetch`)
  }
  fetchHistories(){
    return Api().get(`${baseEndpoint}/histories/fetch`)
  }
  fetchAnnotations(){
    return Api().get(`${baseEndpoint}/annotations/fetch`)
  }
  bookmarkSelections(params){
    return Api().post(`${baseEndpoint}/bookmark/add`, params)
  }
  timestampAdd(params){
    return Api().post(`${baseEndpoint}/timestamp/add`, params)
  }
  removeBookmark(params){
    return Api().post(`${baseEndpoint}/bookmark/remove`, params)
  }
  removeTimestamp(params){
    return Api().post(`${baseEndpoint}/timestamp/remove`, params)
  }
  removeAnnotation(params){
     return Api().post(`${baseEndpoint}/annotation/remove`, params)
  }
  fetchVideos(){
     return Api().get(`${baseEndpoint}/videos/fetch`)
  }
  fetchVideosMeta(){
    return Api().get(`${baseEndpoint}/videos/fetchMeta`)
  }
  loadImages(params){
    return Api().post(`${baseEndpoint}/install/images`+params.config.type, params)    
  }
  removeImages(imageName){
    return Api().post(`${baseEndpoint}/install/removeImages/`, {imageName: imageName})    
  }
  logImageInstall(params){
    return Api().get(`${baseEndpoint}/install/imageInstallLogs/` +  params.imageName)    
  }
  cancelInstallImage(imageName){
    return Api().post(`${baseEndpoint}/install/cancelInstallImage`, {imageName: imageName})        
  }
  pruneImages(){
    return Api().post(`${baseEndpoint}/install/pruneImages`)        
  }
  validateRunDirContents(params){
    return Api().post(`${baseEndpoint}/validate/validateRunDirContents`, params)        
  }
  moduleStatus(params){
    return Api().post(`${baseEndpoint}/consensus/status`, params)        
  }
  checkImageStatus(params){
    return Api().post(`${baseEndpoint}/images/status`, params)        
  }
  fetchVideo(params){
    return Api().post(`${baseEndpoint}/videos/fetch`, params)            
  }
  fetchMeta(){
    return Api().get(`${baseEndpoint}/meta/fetch`)                
  }
  fetchStatus(params){
    return Api().post(`${baseEndpoint}/status/modules/fetch`, params)
  }
  updateSocket(params){
    return Api().post(`${baseEndpoint}/docker/socket`, params)   
  }         
  selectTag(params){
    return Api().post(`${baseEndpoint}/tags/select`, params)  
  }
  addSelection(params){
    return Api().post(`${baseEndpoint}/selections/add`, params)  
  }
  rmSelection(params){
    return Api().post(`${baseEndpoint}/selections/rm`, params)  
  }
  fetchDockerTags(params){
    return Api().post("http://localhost:5003/tags/fetch", params)                    
  }
}
export default new FileService();