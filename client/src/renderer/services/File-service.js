
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Api from './Api'
const port_server = process.env.PORT_SERVER
class FileService {
  init(){
    return Api().post(`/api/init/start`)    
  }
  cancelModule(params) {
    return Api().post(`/api/modules/cancel`, params)
  }
  openMinKNOW(){
  	return Api().get(`/api/openMinKNOW`)
  }
  startModule(params){
    return Api().post(`/api/modules/start`, params)
  }
  watchConsensus(params){
    return Api().post(`/api/consensus/watch`, params)
  }
  initWatcher(params){
    return Api().post(`/api/consensus/startWatch`, params)
  }
  logRampart(params){
    return Api().get(`/api/rampart/log`, params)
  }
  logServer(){
    return Api().get(`/api/system/log`)
  }
  logArticConsensus(params){
    return Api().get(`/api/artic_consensus/log`, params)
  }
  fetchLog(params){
    return Api().get(`/api/log/` + params.name +`/`+params.type)    
  }
  fetchPrimers(){
    return Api().get(`/api/primers/fetch`)
  }
  fetchProtocols(){
    return Api().get(`/api/protocols/fetch`)
  }
  fetchHistories(){
    return Api().get(`/api/histories/fetch`)
  }
  fetchAnnotations(){
    return Api().get(`/api/annotations/fetch`)
  }
  bookmarkSelections(params){
    return Api().post(`/api/bookmark/add`, params)
  }
  timestampAdd(params){
    return Api().post(`/api/timestamp/add`, params)
  }
  removeBookmark(params){
    return Api().post(`/api/bookmark/remove`, params)
  }
  removeTimestamp(params){
    return Api().post(`/api/timestamp/remove`, params)
  }
  removeAnnotation(params){
     return Api().post(`/api/annotation/remove`, params)
  }
  fetchVideos(){
     return Api().get(`/api/videos/fetch`)
  }
  fetchVideosMeta(){
    return Api().get(`/api/videos/fetchMeta`)
  }
  loadImages(params){
    return Api().post(`/api/install/images`+params.config.type, params)    
  }
  removeImages(imageName){
    return Api().post(`/api/install/removeImages/`, {imageName: imageName})    
  }
  logImageInstall(params){
    return Api().get(`/api/install/imageInstallLogs/` +  params.imageName)    
  }
  cancelInstallImage(imageName){
    return Api().post(`/api/install/cancelInstallImage`, {imageName: imageName})        
  }
  pruneImages(){
    return Api().post(`/api/install/pruneImages`)        
  }
  validateRunDirContents(runDir){
    return Api().post(`/api/validate/validateRunDirContents`, runDir)        
  }
  moduleStatus(params){
    return Api().post(`/api/consensus/status`, params)        
  }
  checkImageStatus(params){
    return Api().post(`/api/images/status`, params)        
  }
  fetchVideo(params){
    return Api().post(`/api/videos/fetch`, params)            
  }
  getModules(){
    return Api().get(`/api/status/fetch`)                
  }
  fetchMeta(){
    return Api().get(`/api/meta/fetch`)                
  }
  updateSocket(params){
    return Api().post(`/api/docker/socket`, params)   
  }         
  fetchDockerTags(params){
    return Api().post(`/api/tags/fetch`, params)                    
  }
  selectTag(params){
    return Api().post(`/api/tags/select`, params)  
  }

}
export default new FileService();