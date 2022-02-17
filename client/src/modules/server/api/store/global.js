/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
const path = require("path")
var { meta }  = require("./index")



export var store = {
	dockers: {},
  factory: {},
  dockerConfig: null,
	dockerStreamObjs: {}, 
	watchIntervals: null,
	meta: meta,
  config: {}, 
  modules: {}, 
  images: {},
  dockerStatus: null,
	statusIntervals: {
    images: {},
    modules: {}
  }
}


