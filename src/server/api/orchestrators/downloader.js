const { store }  = require("../../config/store/index.js")
var Client = require('ftp');
const clone = require('git-clone');
const tar = require("tar")
import { logger } from "../controllers/logger.js";
const { writeFolder, checkExists, decompress_file } = require("../controllers/IO.js")
const http = require("http")
const https = require("https")
const fs  = require("fs")
import  path  from "path"
const { spawnLog } = require("../controllers/logger.js")

export  class Downloader {  
    constructor(config){         
        let target = config.target
        this.target = target
        this.status = { 
            downloading: false, 
            decompressing: false, 
            error: null, 
            stream: null,
            building:false,
        }
        this.config = config.source
        this.decompress = config.decompress
        this.url = config.source.url
        this.received_bytes = 0
        this.total_bytes = 0
        this.writer = 0
        this.stream = null
        this.logs  = null
        this.dirpath = path.dirname(target)
        this.p = path.resolve(config.source.target)
        this.timeout = 1000
        this.seen = {
            start: 0,  
            end: .020
        }
        this.downloaded = 0
        this.timeout_wrapper = function( req ) {
            return function() {
                req.abort();
            };
        };
    }   
   
    close(){
        const $this = this;
        this.status.downloading = false
        this.status.building = false
        if (this.stream){
            if ($this.config.protocol == 'ftp'){
                this.stream.end()
                this.stream.destroy()
            } else if ($this.config.protocol == 'http'){
                this.stream.destroy()
            } 
        }
        return
    }
    async decompress_target(dependency){
        return new Promise ((resolve,reject)=>{
            const $this = this
            checkExists(this.config.target).then((exists)=>{
                if (!exists.exists || exists || exists && $this.decompress.overwrite_idx){
                    decompress_file($this.decompress.source, path.dirname($this.target)).then(()=>{
                        resolve()
                    }).catch((err) =>{
                        store.logger.error("Error in decompressing file: %o %o", $this.decompress.source, err)
                        reject(err)
                    } )                                       
                } else {
                    store.logger.info(`Skipping dependency decompression: ${$this.target} due to it existing`)
                    
                    reject(new Error(`Skipping dependency decompression: ${$this.target} due to it existing`))
                }
            }).catch((Err)=>{
                reject(Err)
            })
        })
            
    }
    async download(){
        await writeFolder(this.dirpath)
        const $this = this;
        this.writer = fs.createWriteStream(this.p)
        $this.logs = spawnLog(this.writer, $this.logger)
        if (!this.config.protocol){
            this.config.protocol = 'http'
        }
        $this.status.downloading=true
        $this.status.building=true
        if (this.config.protocol == 'http' || this.config.protocol == 'https'){
            
            this.http_download().then((resp)=>{
                if (this.decompress){
                    $this.decompress_target().then((f)=>{
                        console.log("decompressed!")
                        $this.downloading=false
                        $this.status.building=false
                    }).catch((err)=>{
                        store.logger.error("Error in decompressng %o", err)
                    }) 
                } else {
                    console.log("Done!")
                    $this.downloading=false
                    $this.status.building=false
                }
            }).catch((err)=>{
                store.logger.error("Err %o", err)
                $this.downloading=false
                $this.status.building=false
            })
            

        } else if (this.config.protocol == 'ftp'){
            this.ftp_download().then((resp)=>{
                if (this.decompress){
                    $this.decompress_target().then((f)=>{
                        $this.downloading=false
                        $this.status.building=false
                    })
                } else {
                    $this.downloading=false
                    $this.status.building=false
                }
            }).catch((err)=>{
                store.logger.error("Err %o", err)
                $this.downloading=false
                $this.status.building=false
            })

        } else if (this.config.type == 'git'){
            this.git_download()
        }
        console.log("downloaded!")
        return {
            status: $this.writer.status,
            logs: $this.logs,
            downloading: $this.downloading,
            building: $this.status.building
        }
    }
    ftp_download(){
        return new Promise((resolve,reject)=>{
            var c = new Client();   
            const $this = this;
            c.on('ready', function(err, stream) {
            
                if (err){
                    logger.error(err)
                    reject(err)
                }
                c.size($this.config.path, (err, len)=>{
                    if (err) { 
                        store.logger.error("Error in getting item: %s", $this.url)
                        reject(err)
                    }
                    c.get($this.config.path, function(err, stream) {
                        if (err) { 
                            store.logger.error("Error in getting item: %s", $this.config.path)
                            reject(err)
                        } 
                        $this.stream = stream
                        
                        $this.stream.on('close', function() { 
                            $this.stream.end(); 
                        });
                        $this.stream.on('end', function() { 
                            $this.stream.destroy(); 
                            $this.downloading=false
                            $this.status.building=false
                            resolve()
                        });
                        $this.stream.on("data", (buffer)=>{
                            var segmentLength = buffer.length;
                            $this.downloaded += segmentLength; 
                            if ( $this.downloaded/len >= $this.seen.start && $this.downloaded/len <= $this.seen.end){
                                $this.percent= (100 * $this.downloaded/len ).toFixed(0)
                                store.logger.info("Downloading " + $this.percent + "% " + $this.downloaded + " bytes to " + $this.target )
                                $this.seen.start =  .02 + $this.downloaded/len
                                $this.seen.end =  $this.seen.end + .02 
                                $this.writer.status = $this.percent
                                $this.progress = $this.percent
                            } 
                        }) 
                        $this.stream.on('destroy', function () {
                            c.end()
                            $this.writer.destroy() 
                        })
                        $this.stream.on('end', function () {
                            c.end()
                            $this.writer.destroy()
                        })
                        $this.stream.on('close', function () {
                            $this.writer.status = 100	
                            $this.progress = 100		
                            $this.writer.destroy()
                            c.end()
                        })
                        $this.stream.on('error', function (err) {
                            store.logger.error(`Got error on ftp get: %o`, err);
                            c.end() 
                            $this.writer.destroy()
                        });
                        $this.writer.on("close", ()=>{
                            console.log("ending writing of stream...")
                            c.end()
                            c.destroy()
                        })
                        $this.stream.pipe($this.writer)
                    });
                })
                    
            });
            c.on('error',(err)=>{
                logger.error(err)
                reject(err)
            });
            c.on('close',(err)=>{
                logger.info(`${err}, closed ftp protocol get`)
                c.destroy()
            });
            c.on('end',(err)=>{
                logger.info(`${err}, ended ftp protocol get`)
                c.destroy()
            });
            
            c.connect({ 
                host: $this.config.url,
                user: $this.config.user,
                password: $this.config.password
            })
        })
            
        
       
    }
    http_download(){
        return new Promise((resolve, reject)=>{
            const $this = this;
            let url = $this.config.url
            store.logger.info("http(s) protocol called to get file %s", url)
            logger.info(`${url} to ${$this.dirpath}`)
            let fnct = https
            if (url.startsWith("http:")){
                fnct  = http
            }  
            let request = fnct.get(url).on("response", (response)=>{
                var len = parseInt(response.headers['content-length'], 10);
                response.on("close", (err)=>{
                    logger.error("err %o", err)
                    try{
                        resolve()
                        response.destroy()
                    } catch(Err){
                        logger.error(Err)
                    }
                })
                $this.stream = response
                response.on('data', function(chunk) {
                    if(chunk){
                        $this.downloaded += chunk.length;
                        if ( $this.downloaded/len >= $this.seen.start && $this.downloaded/len <= $this.seen.end){
                            $this.percent= (100 * $this.downloaded/len ).toFixed(0)
                            store.logger.info("Downloading " + $this.percent + "% " + $this.downloaded + " bytes to " + $this.config.target )
                            $this.seen.start =  .02 + $this.downloaded/len   
                            $this.seen.end =  $this.seen.end + .02  
                            $this.writer.status = $this.percent
                            $this.progress = $this.percent
                        } 
                    }

                    
                    // reset timeout 
                    clearTimeout( timeoutId );  
                    timeoutId = setTimeout( fn, $this.timeout );  
                }).on('destroy', function () { 
                    $this.writer.destroy() 
                }).on('end', function () {
                    $this.writer.status = 100	
                    $this.progress = 100		
                    $this.writer.destroy()
                }).on('error', function (err) {
                    store.logger.error(`Got error on http get: %o`, err);
                    clearTimeout( timeoutId );
                    $this.writer.destroy()
                });
                response.pipe($this.writer)  
                // generate timeout handler
                var fn = $this.timeout_wrapper( request );

                // set initial timeout
                var timeoutId = setTimeout( fn, $this.timeout );
                $this.writer.on("close", ()=>{
                    if (typeof request.end === "function") { 
                        request.end()
                    }
                }).on("error", (err)=>{
                    store.logger.error("err %o", err)
                    reject(err)
                })			
                $this.writer.obj = response			
            })
            request.on('error', (e) => {
                store.logger.error(`Got error: ${e.message}`);
                reject(e)
            });
        })
        
    }
    git_download(){
        store.logger.info("git protocol called to get file")
        const $this = this;
        clone($this.config.url, $this.dirpath, {}, (err, stream)=>{ 
            $this.stream = stream
        })
        return 
    }
    
    
    
}