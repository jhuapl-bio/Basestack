var { store } = require("./store.js");
const { spawn } = require("child_process")
const { bytesToSize } = require("./configurations")


export function getImages() {
    let results = []
    const ls = spawn(`docker image inspect `, { shell: true });

    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    ls.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });
}
export async function installDockerImage(image: string) {
    return new Promise<Object>((resolve, reject) => {
        let logs = ''
        const ls = spawn(`docker pull ${image}`, { shell: true });
        resolve(ls)
    })
}

export async function checkImageExists(image: string) {
    return new Promise<Object>((resolve, reject) => {
        let grabbed_data = ''
        const ls = spawn(`docker image inspect ${image}`, { shell: true });

        ls.stdout.on('data', (data) => {
            grabbed_data += `${data}`                
        });

        ls.stderr.on('data', (data) => {
            // console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => { 
            try {
                let getImage: any = JSON.parse(grabbed_data)[0]
                let installed;
                if (getImage) {                    
                    installed = getImage.RepoTags.length > 0 ? getImage.RepoTags[0] : null
                    let results: Object = {
                        size: Number = getImage.Size,
                        installed: String  = installed
                    }
                    resolve(results)
                } else {
                    resolve({
                        size: 0,
                        installed: false
                    })
                }

            } catch (err: any) {
                // store.logger.error(`${err.message} error in parsing Docker get image ${image}`)
                reject(err)
            }
        });
        
    })
}



