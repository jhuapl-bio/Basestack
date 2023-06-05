

const fs = require("fs")
var { store } = require("./store.js");
import path from "path"
import { mkdirp } from 'mkdirp'
const axios = require("axios")
import https from 'https'
const agent = new https.Agent({
    rejectUnauthorized: false
});
const { glob } = require('glob')

const targz = require('targz');
const rimraf = require("rimraf");
import getSize  from 'get-folder-size'
const extract = require('extract-zip')

const gunzip = require('gunzip-file'); 
const { parseConfigVariables } = require("./definitions")
 



export const formatBuffer = function (data) {
    return data.toString().replace(/\u?([\0\1])(\w{1})?/g, '')
} 

export async function decompress_file(file, outpath) {
    return new Promise<void>((resolve, reject) => {
        const ext = path.extname(file)
        if (ext == '.tgz' || file.endsWith('tar.gz')) {
            store.logger.info("Decompress file .tgz: %s to: %s", file, outpath)
            targz.decompress({
                src: file,
                dest: outpath
            }, function (err, stream) {
                if (err) {
                    store.logger.error("%o error decompressing at location", err)
                    reject(err)
                } else {
                    store.logger.info("Decompressed .tgz file: %s ", file)
                    resolve()
                }
            });
        } else if (ext == 'zip' || ext == '.zip' || file.endsWith(".zip")) {
            store.logger.info("Decompress file .zip: %s to: %s", file, outpath)
            extract(file, { dir: outpath }, (err, stream) => {
                if (err) {
                    store.logger.error(err)
                    reject(err)
                } else {
                    store.logger.info("Decompressed .zip file: %s ", file)
                    resolve()
                }
            }).catch((err) => {
                store.logger.error("Not able to unzip file")
                reject(err)

            })

        } else if (ext == '.gzip' || file.endsWith(".gz")) {
            store.logger.info("Decompress file .gz: %s to: %s", file, outpath)
            gunzip(file, path.join(outpath, path.parse(file).name), (err, stream) => {
                if (err) {
                    store.logger.error(err)
                    reject(err)
                } else {
                    store.logger.info("Decompressed .gz file: %s ", file)
                    resolve()
                }
            })
        } else {
            store.logger.error("Not proper format: tgz or .tar.gz ")
            // reject()
            reject("Not proper format: tgz or .tar.gz")
        }
    })


}	

export async function checkExists(location, globSet) {
    return new Promise <any>((resolve, reject) => {
        if (!globSet) {
            fs.stat(location, async function (err, exists) {

                if (err) {
                    resolve(
                        { location: location, size: 0, exists: false }
                    )
                }
                else if (exists) {
                    let size = 0
                    if (exists.isDirectory()) {
                        getSize(location, (err, size) => {
                            if (!err) {
                                resolve(
                                    { location: location, size: size, exists: true }
                                )
                            } else {
                                resolve(
                                    { location: location, size: 0, exists: false }
                                )
                            }
                        })
                        
                            
                    } else {
                        if (exists.size) {
                            size = exists.size
                        }
                        resolve(
                            { location: location, size: size, exists: true }
                        )
                    }

                } else {
                    resolve({
                        location: null,
                        size: 0,
                        exists: null
                    })
                }
            })
        } else {
       
            
        }

    })
}

// export async function removeFile(filepath, type, silentExists) {
//     return new Promise((resolve, reject) => {
//         fs.exists(filepath, function (exists) {
//             if (exists) {
//                 if (!type) {
//                     type = "file"
//                 }
//                 if (type == "file") {
//                     fs.unlink(filepath, (err) => {
//                         if (err) {
//                             reject(err)
//                         }
//                         resolve("Removed file: " + filepath)
//                     })
//                 } else {
//                     rimraf(path.join(filepath), (err) => {
//                         if (err) {
//                             store.logger.error("%s %o", "error in folderpath", err)
//                             reject(err)
//                         }
//                         resolve("Removed folder: " + filepath)
//                     })
//                 }
//             } else {
//                 silentExists ? resolve("File doesn't exist, silent exit") : reject(`Path Doesnt exist ${filepath}`)
//             }
//         })

//     })
// }
export async function writeFolder(directory) {
    return new Promise<void>((resolve, reject) => {
        mkdirp(directory).then((response) => {
            resolve()
        }).catch((errmkdrir) => {
            console.log(directory)
            store.logger.error(errmkdrir);
            reject(errmkdrir)
        })
    })
}

export function bytesToSize(bytes: number) {
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes == 0) return 0;
    var i: number= Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat(Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i])
}


export const getFiles = async (filepath: string): Promise<string[]> => {
    return new Promise<string[]>((resolve,reject) => {
        fs.readdir(filepath, (err, items) => {
            if (err) {
                store.logger.error(err)
                reject(err)
            } else { 
                resolve(items.map((d) => { return path.join(filepath, d) }))
            }
        })
    });
};

export const  readFile = async (filepath: string, split: boolean): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filepath, (err, data) => {
            if (err) {
                store.logger.error("%s %s %s", "Error in reading the file: ", filepath, err)
                reject(err)
            } else {
                resolve(split ? data.toString().split("\n") : data.toString())
            }
        });
    })
}  
export async function itemType(filepath: string) {
    return new Promise((resolve, reject) => {
        fs.lstat(filepath, (err, stats) => {
            if (err) {
                store.logger.error(err);
                reject(err);
            }
            else {
                resolve({ name: path.basename(filepath), path: filepath, directory: stats.isDirectory() })
            }
        });
    })
}


export async function getFolders(filepath) {
    return new Promise((resolve, reject) => {
        fs.readdir(filepath, (err, items) => {
            if (err) {
                store.logger.error(err)
                reject(err)
            } else {
                let folder_checks: any[] = [];
                for (let i = 0; i < items.length; i++) {
                    let element = items[i]
                    folder_checks.push(itemType(path.join(filepath, items[i])))
                }
                Promise.all(folder_checks).then((response) => {
                    resolve(response.filter((d) => { return d.directory }))
                }).catch((err) => {
                    store.logger.error(err)
                    resolve([])
                })
            }
        })

    })
}
export async function import_cfgs(module: string, type: string) {
    try {
        let promises_files: any[] = [];
        let promises_folders  : any[] = [];
        let files_marked: any[] = [];
        // if (module.format == 'single') {
        //     promises_files.push(readFile(module.path, false))
        //     files_marked.push(module.path)
        // } else if (module.format == 'files') {
            promises_folders.push(getFiles(module))
        // } else {
        // promises_folders.push(getFolders(module))
        // }
        if (promises_folders.length > 0) {
            let results = await Promise.allSettled(promises_folders)
            results.forEach((result: any, i) => {
                let inner_file_read = []
                result.value.forEach((filepath: string) => {
                    try {
                    //     if (module.format == 'dir') {
                    //         promises_files.push(readFile(path.join(dir.path, module.filename), false))
                    //         files_marked.push(path.join(dir.path, module.filename))
                    //     } else {
                        promises_files.push(readFile(filepath, false))
 
                        files_marked.push((filepath))
                    //     }
                    } catch (err) {
                        console.error(err)
                    }
                })
            })
        }
        let results = await Promise.allSettled(promises_files)
        let return_data: any[]=[]
        results.forEach((result, i) => {
            if (result.status == 'fulfilled') {
                let config: any;
                try {

                    config = parseConfigVariables(result.value, store.system)
                    if (files_marked[i]) {
                        config.path = files_marked[i]
                    }
                    config.id = `${config.path}-${config.version}-${config.imported}-${config.removable}-${config.name}-${config.remote}`
                    if (config) {
                        return_data.push(config)
                    }

                } catch (err_2) {
                    store.logger.error(`______Init YAML/JSON ERROR for ${result.value}___________`)
                    store.logger.error(err_2)

                    store.logger.error("_________________________")
                }

            }
        })
        if (type !== 'docker') {
            return_data.forEach((data, i) => {
                if (Array.isArray(data)) {
                    data.forEach((d) => {
                        d.path = files_marked[i]
                    })
                } else if (typeof data == 'object') {
                    data.path = files_marked[i]

                }
            })
        }
        return return_data
    } catch (err) {
        store.logger.error("%o could not import configurations", err)
        throw err
    }
}