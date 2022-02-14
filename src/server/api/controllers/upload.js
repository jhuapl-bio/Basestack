import path from "path"
const { store }  = require("../../config/store/index.js")
var logger  = store.logger
const fs  = require("fs")
const multer  = require('multer');
const {checkFolderExists } = require("./validate.js")
const { writeFolder} = require("./IO.js")
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const p = path.join(`${store.system.dataPath}`, `/uploads/`, req.params.module)
      // checkFolderExists(p).then((exists)=>{
      //     if (!exists){
      //       writeFolder(p).then((response)=>{
      //           cb(null, p)
      //       }).catch((err)=>{
      //           cb(err)
      //       })
      //     } else {
      //         cb(null, p)
      //     }
      //   }).catch((err)=>{
      //       cb(err)
      //   })
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname
      cb(null, req.params.module + '-' + uniqueSuffix)
    }
  })

let upload = multer({ storage: storage });

export var upload_file = async function(data){
    return new Promise(function(resolve,reject){
       
    })
}
export default upload 