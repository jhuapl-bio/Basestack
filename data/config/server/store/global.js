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
  ...system,
	dockers: {},
  factory: {},
  dockerConfig: null,
	dockerStreamObjs: {},
	watchIntervals: null,
  meta: null,
  modules: [],
  default: [],
  status: {
    images: {},
    modules:{},
    pipelines: {}
  },
  orchestrator: null,
  dind: null,
  workflows: {},
  statusIntervals: {
    pipelines: {},
    images: {},
    modules: {}
  },
  images: {},
  dockerStatus: null
}


