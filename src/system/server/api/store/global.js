/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var { system }  = require("./index")



export var store = {
	dockers: {},
  factory: {},
  dockerConfig: null,
	dockerStreamObjs: {},
	watchIntervals: null,
	system: system,
  meta: null,
  modules: {},
  status: {
    images: {},
    modules:{},
    pipelines: {}
  },
  workflows: {},
  statusIntervals: {
    pipelines: {},
    images: {},
    modules: {}
  },
  images: {},
  dockerStatus: null
}


