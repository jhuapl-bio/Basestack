/*  
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var Docker = require('dockerode');

var docker = new Docker();
docker = new Docker({socketPath: '/run/user/1000/docker.sock'});

export default docker
