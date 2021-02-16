'use strict'

const chalk = require('chalk')
const electron = require('electron')
const path = require('path')
const { say } = require('cfonts')
const { spawn } = require('child_process')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const webpackHotMiddleware = require('webpack-hot-middleware')
const mainConfig = require('./webpack.main.config')
const rendererConfig = require('./webpack.renderer.config')
const serverConfig = require('./webpack.server.config')

let electronProcess = null
let manualRestart = false
let hotMiddleware
let devClient = false
let serverPort = null
function logStats (proc, data) {
  let log = ''

  log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`)
  log += '\n\n'

  if (typeof data === 'object') {
    data.toString({
      colors: true,
      chunks: false
    }).split(/\r?\n/).forEach(line => {
      log += '  ' + line + '\n'
    })
  } else {
    log += `  ${data}\n`
  }

  log += '\n' + chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`) + '\n'

  console.log(log)
}



let rendererBasePort = 9080;
let serverBasePort = 5033;
process.env.PORT_SERVER = serverBasePort
process.env.rendererBasePort = rendererBasePort
function startRenderer (devClient) {
  return new Promise((resolve, reject) => {
    console.log("starting renderer dev-runner", process.env.SERVER_PORT)
    rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer)
    rendererConfig.mode = 'development'
    const compiler = webpack(rendererConfig)
    hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    })

    // compiler.hooks.compilation.tap('compilation', compilation => {
    //   compilation.hooks.watchRun.tapAsync('html-webpack-plugin-after-emit', (data, cb) => {
    //     hotMiddleware.publish({ action: 'reload' })
    //     cb()
    //   })
    // })

    compiler.hooks.done.tap('done', stats => {
      logStats('Renderer', stats)
    })
    let tries = 10;
    let ports_tried = [];
    let opened_server = false;
    const server = new WebpackDevServer(
      compiler,

      {
        contentBase: path.join(__dirname, '../*'),
        quiet: false,

        before (app, ctx) {
          app.use(hotMiddleware)
          ctx.middleware.waitUntilValid(async () => {
            let port = rendererBasePort
            let response; 
            resolve()
            // do {
            //     try {
            //         tries -=1;
            //         await startRendererServer(port);
            //         opened_server = true;
            //         resolve()
            //     } catch {
            //       opened_server = false;
            //       ports_tried.push(port)
            //       port = Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
            //     }
            // } while (!opened_server && tries > 0);
            // if (tries <= 0){
            //   reject(new Error(`Max Tries reached for rendering tried ports, exiting...`))
            //   // process.exit(1)
            // }
          })
        },
        watchOptions: {
          ignored: '**/.*' 
        },
        proxy: { 
          '/api': {
            target: `http://localhost:${process.env.PORT_SERVER}`, 
            logLevel:'info',
            secure: false,
            changeOrigin: true,
            pathRewrite: {
              '^/api': ''
            }
          }
        },

      }
    )
    
    


    async function startRendererServer (port) {
      return new Promise((resolve, reject) => {
        process.env.RENDER_PORT = port
        server.listen(port).on("error", (err)=>{
          reject(err)        
        }).on("listening", ()=>{
          resolve(`listening on port: ${port}`)
        })
      })
    }
    

  })
}
function startServer (devClient){
  return new Promise((resolve, reject) => {
    console.log("Starting server  dev-runner")
    // serverConfig.entry.server = path.join(__dirname, '../src/modules/index.server.js')
    serverConfig.mode = 'development'
    const compiler = webpack(serverConfig)
    
    
    compiler.hooks.done.tap('done', stats => {
      // logStats('Server', stats)
      console.log("done....................")
    })

    compiler.watch({}, (err, stats) => {
      logStats('Server', stats)
      if (err){
        console.error(err, "error in server compiler")
      }
      resolve()      
    })
  })
}

function startMain (devClient) {
  return new Promise((resolve, reject) => {
    console.log("Starting main  dev-runner")
    mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main)
    mainConfig.mode = 'development'
    process.env.devClient = devClient
    const compiler = webpack(mainConfig)
    hotMiddleware = webpackHotMiddleware(compiler, {
      log: false,
      heartbeat: 2500,
    })
    compiler.hooks.watchRun.tapAsync('watch-run', (compilation, done) => {
      logStats('Main', chalk.white.bold('compiling...'))
      hotMiddleware.publish({ action: 'compiling' })
      done()
    })

    compiler.watch({}, (err, stats) => {
      logStats('Main', stats)

      if (electronProcess && electronProcess.kill) {
        manualRestart = true
        process.kill(electronProcess.pid)
        electronProcess = null
        startElectron()

        setTimeout(() => {
          manualRestart = false
        }, 5000)
      }

      resolve()
    })
  })
}

function startElectron () {
  var args = [
    '--inspect=5858',
    path.join(__dirname, '../dist/electron/main.js')
  ]

  // detect yarn or npm and process commandline args accordingly
  if (process.env.npm_execpath.endsWith('yarn.js')) {
    args = args.concat(process.argv.slice(3))
  } else if (process.env.npm_execpath.endsWith('npm-cli.js')) {
    args = args.concat(process.argv.slice(2))
  }

  electronProcess = spawn(electron, args)
  
  electronProcess.stdout.on('data', data => {
    electronLog(data, 'blue')
  })
  electronProcess.stderr.on('data', data => {
    electronLog(data, 'red')
  })

  electronProcess.on('close', () => {
    if (!manualRestart) process.exit()
  })
}

function electronLog (data, color) {
  let log = ''
  data = data.toString().split(/\r?\n/)
  data.forEach(line => {
    log += `  ${line}\n`
  })
  if (/[0-9A-z]+/.test(log)) {
    console.log(
      chalk[color].bold('┏ Electron -------------------') +
      '\n\n' +
      log +
      chalk[color].bold('┗ ----------------------------') +
      '\n'
    )
  }
}

function greeting () {
  const cols = process.stdout.columns
  let text = ''

  if (cols > 104) text = 'electron-vue'
  else if (cols > 76) text = 'electron-|vue'
  else text = false

  if (text) {
    say(text, {
      colors: ['yellow'],
      font: 'simple3d',
      space: false
    })
  } else console.log(chalk.yellow.bold('\n  electron-vue'))
  console.log(chalk.blue('  getting ready...') + '\n')
}

function init () {
  greeting()
  if (process.argv.slice(2) =="client"){
    devClient = true
  }
  startServer(devClient).then((res)=>{
    startRenderer(devClient).then((res, rej) => {
      console.log(res, "res", rej, "rej")
      startMain(devClient).then(()=>{
        startElectron()      
      })
    })
  })
  .catch((err) => {
    console.error(err, "< ----error in rendering the app")
    process.exit(1)
  })
}

init()
