const { greeting, startServer } = require("./dev-modules.js")

let devClient = false

function init () {
  greeting()
  if (process.argv.slice(2) =="client"){
    devClient = true
  }
  startServer(devClient).then((res)=>{
    
  })
  .catch((err) => {
    console.error(err, "< ----error in rendering the app")
    process.exit(1)
  })
}

init()