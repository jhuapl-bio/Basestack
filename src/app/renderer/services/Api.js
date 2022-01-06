
  // - # **********************************************************************
  // - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
  // - #
  // - # All Rights Reserved.
  // - # For any other permission, please contact the Legal Office at JHU/APL.
  // - # **********************************************************************
  
import axios from 'axios'
import { get } from '../../../server/api/controllers/IO'
const HttpsProxyAgent = require("https-proxy-agent")
const httpsAgent = new HttpsProxyAgent({
	"/api": { 
    host: 'localhost',
	  port: {
      get(){
        return process.env.PORT_SERVER
      }
    }
  }
})
export default() => {
  return axios.create({httpsAgent})
}
