/**
 This file instantiates the server opening for the user which then
 Facilitates backend commmunication with the Vue Frontend and filesystem or docker

/* eslint-disable */

console.log("starting server now")
let { open_server,close_server } = require("../modules/server/server.js")
open_server()