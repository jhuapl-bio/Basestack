
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import Api from './Api'

class FileService {
  init(){
    return Api().post('http://localhost:5003/init/start')    
  }
  cancelModule(params) {
    return Api().post('http://localhost:5003/modules/cancel', params)
  }
  openMinKNOW(){
  	return Api().get("http://localhost:5003/openMinKNOW")
  }
  startModule(params){
    return Api().post("http://localhost:5003/modules/start", params)
  }
  watchConsensus(params){
    return Api().post("http://localhost:5003/consensus/watch", params)
  }
  initWatcher(params){
    return Api().post("http://localhost:5003/consensus/startWatch", params)
  }
  logRampart(params){
    return Api().get("http://localhost:5003/rampart/log", params)
  }
  logServer(){
    return Api().get("http://localhost:5003/system/log")
  }
  logArticConsensus(params){
    return Api().get("http://localhost:5003/artic_consensus/log", params)
  }
  fetchLog(params){
    return Api().get("http://localhost:5003/log/" + params.name +"/"+params.type)    
  }
  fetchPrimers(){
    return Api().get("http://localhost:5003/primers/fetch")
  }
  fetchProtocols(){
    return Api().get("http://localhost:5003/protocols/fetch")
  }
  fetchHistories(){
    return Api().get("http://localhost:5003/histories/fetch")
  }
  fetchAnnotations(){
    return Api().get("http://localhost:5003/annotations/fetch")
  }
  bookmarkSelections(params){
    return Api().post("http://localhost:5003/bookmark/add", params)
  }
  timestampAdd(params){
    return Api().post("http://localhost:5003/timestamp/add", params)
  }
  removeBookmark(params){
    return Api().post("http://localhost:5003/bookmark/remove", params)
  }
  removeTimestamp(params){
    return Api().post("http://localhost:5003/timestamp/remove", params)
  }
  removeAnnotation(params){
     return Api().post("http://localhost:5003/annotation/remove", params)
  }
  fetchVideos(){
     return Api().get("http://localhost:5003/videos/fetch")
  }
  fetchVideosMeta(){
    return Api().get("http://localhost:5003/videos/fetchMeta")
  }
  loadImages(params){
    return Api().post("http://localhost:5003/install/images"+params.config.type, params)    
  }
  removeImages(imageName){
    return Api().post("http://localhost:5003/install/removeImages/", {imageName: imageName})    
  }
  logImageInstall(params){
    return Api().get("http://localhost:5003/install/imageInstallLogs/" +  params.imageName)    
  }
  cancelInstallImage(imageName){
    return Api().post("http://localhost:5003/install/cancelInstallImage", {imageName: imageName})        
  }
  pruneImages(){
    return Api().post("http://localhost:5003/install/pruneImages")        
  }
  validateRunDirContents(runDir){
    return Api().post("http://localhost:5003/validate/validateRunDirContents", runDir)        
  }
  moduleStatus(params){
    return Api().post("http://localhost:5003/consensus/status", params)        
  }
  checkImageStatus(params){
    return Api().post("http://localhost:5003/images/status", params)        
  }
  fetchVideo(params){
    return Api().post("http://localhost:5003/videos/fetch", params)            
  }
  getModules(){
    return Api().get("http://localhost:5003/status/fetch")                
  }
  fetchMeta(){
    return Api().get("http://localhost:5003/meta/fetch")                
  }

}
export default new FileService();