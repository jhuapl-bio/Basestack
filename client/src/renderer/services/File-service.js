
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
  init(){
    console.log(baseEndpoint)
    return Api().post(`${baseEndpoint}/init/start`)    
  }
  cancelModule(params) {
    return Api().post(`${baseEndpoint}/modules/cancel`, params)
  }
  openMinKNOW(){
  	return Api().get(`${baseEndpoint}/openMinKNOW`)
  }
  startModule(params){
    return Api().post(`${baseEndpoint}/modules/start`, params)
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
  validateRunDirContents(runDir){
    return Api().post(`${baseEndpoint}/validate/validateRunDirContents`, runDir)        
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
  getModules(){
    return Api().get(`${baseEndpoint}/status/fetch`)                
  }
  fetchMeta(){
    return Api().get(`${baseEndpoint}/meta/fetch`)                
  }
  updateSocket(params){
    return Api().post(`${baseEndpoint}/docker/socket`, params)   
  }         
  fetchDockerTags(params){
    return Api().post(`${baseEndpoint}/tags/fetch`, params)                    
  }
  selectTag(params){
    return Api().post(`${baseEndpoint}/tags/select`, params)  
  }
  addSelection(params){
    return Api().post(`${baseEndpoint}/selections/add`, params)  
  }

}
export default new FileService();