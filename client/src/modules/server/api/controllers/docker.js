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
	const meta  = store.userData
	console.log(meta.docker, "-----")
	if (meta && meta.docker.socket){
		config = {socketPath: meta.docker.socket}
	}
	dockerObj = new Docker(config);
	return 
} 
export var docker = dockerObj 
