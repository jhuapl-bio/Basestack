process.env.NODE_ENV = 'development';

const Vite = require('vite');
const ChildProcess = require('child_process');
const Path = require('path');
const Chalk = require('chalk');
const Chokidar = require('chokidar');
const Electron = require('electron');
const compileNeatley = require('./neatleycompile.js');

const compileTs = require('./compile.js');
const FileSystem = require('fs');
const { EOL } = require('os');

let viteServer = null;
let electronProcess = null;
let electronProcessLocker = false;
let rendererPort = 0;


async function watchGrammar(){
  let paths_to_watch = [Path.join(__dirname, "..", "src", "grammar")]
  Chokidar.watch(paths_to_watch, {
  }).on('change', async (path) => { 
    try{
      await compileNeatley(Path.join(__dirname, "..", "src", "grammar", "grammar.ne"), Path.join(__dirname, "..", "src", "main", "grammar", "grammar.js"));
      console.log(Chalk.blueBright(`[neatley grammar] `) + `Change in ${path}. reloading... 🚀`);
    } catch (err){ 

      console.log(Chalk.redBright(`[neatley grammar] `) + `error in neatley compiling 🚀`);

    }
  }); 
}

async function startRenderer() {
  viteServer = await Vite.createServer({
    configFile: Path.join(__dirname, '..', 'vite.config.js'),
    mode: 'development',
  });

  return viteServer.listen();
}

async function startElectron() {
  if (electronProcess) { // single instance lock
    return;
  }
  

  try {
    let today = new Date()
    let time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":;;;;;;;;;;;;;;;;";
    console.log(Chalk.greenBright(time));

    await compileTs(Path.join(__dirname, '..', 'src', 'main'));
    const end = new Date()
    time = end.getHours() + ":" + end.getMinutes() + ":" + end.getSeconds() + ":;;;;;;;;;;;;;;;;";
    console.log()
    console.log(Chalk.greenBright(time));

  } catch (err){
    console.log(Chalk.redBright('Could not start Electron because of the above typescript error(s).'));
    console.log(err);
    electronProcessLocker = false;
    return;
  }

  const args = [
    Path.join(__dirname, '..', 'build', 'main', 'main', 'main.js'),
    rendererPort,
  ];
  electronProcess = ChildProcess.spawn(Electron, args);
  electronProcessLocker = false;

  electronProcess.stdout.on('data', data => {
    if (data == EOL) {
      return;
    }

    process.stdout.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
  });

  electronProcess.stderr.on('data', data =>
    process.stderr.write(Chalk.blueBright(`[electron] `) + Chalk.white(data.toString()))
  );

  electronProcess.on('exit', () => stop());
}

async function restartElectron() {
  if (electronProcess) {
    electronProcess.removeAllListeners('exit');
    electronProcess.kill();
    electronProcess = null;
  }

  if (!electronProcessLocker) {
    electronProcessLocker = true;
    await startElectron();
  }
}

function copyStaticFiles() {
  copy('static');
}

/*
The working dir of Electron is build/main instead of src/main because of TS.
tsc does not copy static files, so copy them over manually for dev server.
*/
function copy(path) {
  FileSystem.cpSync(
    Path.join(__dirname, '..', 'src', 'main', path),
    Path.join(__dirname, '..', 'build', 'main', path),
    { recursive: true }
  );
}

function stop() {
  viteServer.close();
  process.exit();
}

async function start() {
  console.log(`${Chalk.greenBright('=======================================')}`);
  console.log(`${Chalk.greenBright('Starting Electron + Vite Dev Server...')}`);
  console.log(`${Chalk.greenBright('=======================================')}`);
  await compileNeatley(Path.join(__dirname, "..", "src", "grammar", "grammar.ne"), Path.join(__dirname, "..", "src", "main", "grammar", "grammar.js"))

  const devServer = await startRenderer();
  rendererPort = devServer.config.server.port;
  copyStaticFiles();
  startElectron();
  try{
    watchGrammar()
  } catch (err){ 
    console.log(Chalk.redBright('Could not compile neatley grammar typescript error(s).'));
  }

  const paths_to_watch = [Path.join(__dirname, '..', 'src', 'main'), Path.join(__dirname,  '..', 'data', 'config', 'server', 'config')];
  Chokidar.watch(paths_to_watch, {
    // ignored: Path.join(__dirname, '..', 'src', 'main', 'grammar', "*")
  }).on('change', (path) => {  
    if (path.startsWith(Path.join('static', '/'))) {
      copy(path);
    }

    restartElectron();
  }); 
}


try{
  start()
} catch (err){
  console.log(Chalk.redBright('Could not start electron typescript error(s).'));
}
