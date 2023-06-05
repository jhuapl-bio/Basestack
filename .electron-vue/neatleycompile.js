const ChildProcess = require('child_process');
const Chalk = require('chalk');
const path = require("path")
function compileNeatley(input, output) {
    return new Promise((resolve, reject) => {
        process.stdout.write(Chalk.greenBright(`./node_modules/nearley/bin/nearleyc.js ${input} -o ${output}\n `))
        const nprocess = ChildProcess.exec(`./node_modules/nearley/bin/nearleyc.js ${input} -o ${output} `, {
            cwd: path.join(__dirname, "..")
        });
        nprocess.stdout.on('error', data =>
            process.stdout.write(Chalk.redBright(`[neatleyc.js] `) + Chalk.white(data.toString()))
        );

        nprocess.stdout.on('data', data =>
            process.stdout.write(Chalk.yellowBright(`[neatleyc.js] `) + Chalk.white(data.toString()))
        );

        nprocess.on('exit', exitCode => {
            console.log(exitCode, "exit code for neatley")
            if (exitCode > 0) {
                reject(exitCode);
            } else {
                resolve();
            }
        });
    });
}

module.exports = compileNeatley;