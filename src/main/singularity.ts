
export async function checSingularityInstanceExists(sif: string) {
    return new Promise<Object>((resolve, reject) => {
        let grabbed_data = ''
        const ls = spawn(`singularity instance list ${sif}`, { shell: true });

        ls.stdout.on('data', (data) => {
            grabbed_data += `${data}`
        });

        ls.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        ls.on('close', (code) => {
            try {
                let getInstance: any = JSON.parse(grabbed_data)[0]
                console.log(getInstance)
                resolve({exists: true})

            } catch (err: any) {
                reject(err)
            }
        });

    })
}
