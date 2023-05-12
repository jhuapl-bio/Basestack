import PQueue from 'p-queue';
var { store } = require("./store.js");




export class Queue {
    queue: PQueue
    queueList: PQueue[]
    queueSizeInterval: any
    queueLengthInterval: boolean
    constructor() {
        this.queueList = []
        this.queue = this.enableQueue()
        this.queueLengthInterval = false
        const $this = this
    }

    cleanup() {
        const $this = this
        try {
            // for (let key of Object.keys(this.samples)) {
            //     store.logger.info(`${key}, cleaning up sample`)
            //     // $this.samples[key].cleanup()
            // }
        } catch (err) {
            store.logger.error(`${err} error in cleanup`)
        }
        try {
            clearInterval(this.queueSizeInterval)
        } catch (err) {
            store.logger.error(`${err} removing interval`)
        }
    }
    cancel(index, sample) {
        const $this = this
        try {
            // if (!index && this.samples[sample]) {
            //     let s = this.samples[sample]
            //     $this.samples[sample].paused = true
            //     Object.keys(s.queueRecords).map((f) => {
            //         if (s.queueRecords[f].controller) {
            //             s.queueRecords[f].controller.abort()
            //         }
            //     })
            // } else {
                // if (index >= 0 && this.samples[sample]) {
                //     if (this.samples[sample] && this.samples[sample].queueRecords[index]) {
                //         this.samples[sample].queueRecords[index].controller.abort()
                //     }
                // }
            // }
        } catch (Err) {
            store.logger.error(`${Err} error in canceling job(s)`)
            throw Err
        }
    }
    createInterval() {
        const $this = this
        if ($this.queueSizeInterval) {
            try {
                clearInterval($this.queueSizeInterval)
            } catch (err) {
                store.logger.error(`${err} could not destroy queue length interval, skipping`)
            }
        }
        this.queueSizeInterval = setInterval(() => {
            if ($this.queueLengthInterval) {
                // $this.ws.emit("queueLength", { data: $this.queue.size + 1 })
            } else {
            }
        }, 1000)
    }
    enableQueue() {
        const $this = this
        const queue = new PQueue({ concurrency: 1 });


        queue.on("active", (f) => {
            try {
                $this.queueLengthInterval = true
            } catch (err) {
                store.logger.error(`${err} error in sending status of add in queue`)
            }
        });
        (async () => {
            await queue.onEmpty();
            console.log('7. Queue is empty');
        })();
     
        queue.on("idle", () => {
            store.logger.info("Idle queue, all jobs completed")
            $this.queueLengthInterval = false
            try {
                // this.ws.emit("anyRunning", { status: false })
            } catch (err) {
                store.logger.error(`${err} error in sending status of running in queue`)
            }
        });

        // queue.on('completed', function (result) {
        //     store.logger.info(`task completed ${result}`)
        // })
        return queue



    }
    resume(val) {
        try {
            
            this.queue.start()

            // this.ws.emit("paused", { message: false })
        } catch (err) {
            store.logger.error(`${err} error in resuming the job(s)`)
            // this.ws.emit("error", { message: err })
        }
    }
    async rerun(index, sample) {
        try {
            
            const $this = this
            this.queue.start()
            // this.ws.emit("paused", { message: false })
           

        } catch (err) {
            store.logger.error(`${err} error in rerunning the job(s)`)
            // this.ws.emit("error", { message: err })

        }
    }
    pause(val) {
        try {
            store.logger.info(`Pausing the queue for all running samples`)
            this.queue.pause()
            // this.ws.emit("paused", { message: true })
        } catch (err) {
            store.logger.error(`${err} error in pausing the job(s)`)
            // this.ws.emit("error", { message: err })
        }
    }
   



}