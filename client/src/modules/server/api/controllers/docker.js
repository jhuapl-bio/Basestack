/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var Docker = require('dockerode');
const path = require("path")
var  { store }  = require("../store/global.js")
// var docker = new Docker();
let dockerObj;
 
export async function docker_init(params){
	let config = null
	const meta  = store.dockerConfig
	if (meta && meta.socketPath){
		config = meta
		dockerObj = new Docker(config); 
	} else {
		dockerObj = new Docker();
	}
	
	
	return dockerObj
} 

