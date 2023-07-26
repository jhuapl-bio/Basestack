var { store } = require("./store.js");
const { spawn } = require("child_process")
const { bytesToSize } = require("./configurations")
import path from "path"


// Create an export function to format paths into bind mounts for a docker command like docker run... /path/to/host:/path/to/container
export function formatBindMounts(paths: object[]) {
    let bindMounts: string[] = []
    paths.filter((f:any)=>{ 
        return  f['type'] == 'file' || f['type'] == 'static-file' || f['type'] == 'directory' || f['type'] == 'static-file' || f['type'] == 'static-directory' || f['type'] == 'list-files' || f['type'] == 'list-directory'
    }).map((p:any) => {   
        // type=bind,source="$(pwd)"/target,target=/app
        // bindMounts.push(`type=bind,source=${path['value']},target=${path['value']}`)
        if (['file', 'static-file','list-files'].indexOf(p['type'])>-1){
            bindMounts.push(`${path.dirname(p['value'])}:${path.dirname(p['value'])}`)
        } else {
            bindMounts.push(`${p['value']}:${p['value']}`)
        }
    })
    return bindMounts
}



export function getImages() {
    let results = []
    return new Promise<any>((resolve, reject) => {
        const ls = spawn(`docker images `, { shell: true });

        ls.stdout.on('data', (data) => {
            // console.log(`stdout: ${data}`);
        });

        ls.stderr.on('data', (data) => {
            // console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            // console.log(`child process exited with code ${code}`);
            resolve(code == 0 ? true : false)
        });
    })
}
export async function installDockerImage(image: string) {
    return new Promise<Object>((resolve, reject) => {
        let logs = ''
        const ls = spawn(`docker pull ${image}`, { shell: true });
        resolve(ls)
    })
}

export async function checkImageExists(image: string) {
    return new Promise<any>((resolve, reject) => {
        let grabbed_data = ''
        const ls = spawn(`docker image inspect ${image}`, { shell: true });
        // const ls = spawn(`echo yes`, { shell: true });
        
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
                    let size = getImage.size 
                    resolve({
                        size: size,
                        installed: installed
                    })
                } 
                else {
                    resolve({
                        size: 0,
                        installed: false
                    })
                }

            } catch (err: any) {
                store.logger.error(`${err.message} error in parsing Docker get image ${image}`)
                reject(err)
            }
        });
        
    })
}



