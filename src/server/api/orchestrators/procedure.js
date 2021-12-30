import e from 'express';
import { resolve } from 'path';
const cloneDeep = require("lodash.clonedeep");

/*
   - # **********************************************************************
   - # Copyright (C) 2020 Johns Hopkins University Applied Physics Laboratory
   - #
   - # All Rights Reserved.
   - # For any other permission, please contact the Legal Office at JHU/APL.
   - # **********************************************************************
  */
var Docker = require('dockerode');
const path = require("path")
var  { store }  = require("../../config/store/index.js")
const { readFile } = require("../controllers/IO.js")
const { list_module_statuses }  = require("../controllers/watcher.js")
const { check_container, getExternalSource } = require("../controllers/fetch.js")
const { Service }  = require("./service.js")
const { spawnLog, createLoggingObject } = require("../controllers/logger.js")
var logger = store.logger
// var docker = new Docker();
const fs = require("file-system")
let dockerObj;

export class Procedure {
	constructor(name, params){
		this.name = name
        this.params = params
        this.services_config = params.services
		this.container = null;
		this.cmd = null;
		this.options = {};
        this.services = {};
		this.streamObj = null;
		this.config = null;
        this.orchestrator = null;
        this.status =  {
            fully_installed: false
        }
        this.interval = {
            checking: false,
            interval: this.create_interval()
        }
	}





    async create_interval (){
        const $this = this
        let interval = setInterval(()=>{
            // if (!$this.interval.checking){
            //     $this.interval.checking = true
            //     $this.statusCheck().then((state)=>{
            //         $this.interval.checking = false
            //     }).catch((err)=>{
            //         logger.error("%s err in status check interval for %s",err, $this.name)
            //         $this.interval.checking = false
            //     })
            // }
        }, 2000)


        return interval

    }
    async define_services(){
        let promises = []
        this.services = {};
        const $this = this
        this.services_config.forEach((service)=>{
            if (service in store.services){
                $this.services[service] = store.services[service]
            }
        })

        let services = {}
        for( let [key, service] of Object.entries(this.services)){
            services[key] = {
                variables: service.config.variables
            }

        }
        if ($this.params.init){
            $this.start(services)
        }

        return
    }
    dependencyCheck(){
        let statuses = []
        for (let [key, service] of Object.entries(this.services)){
            if("status" in service){
                statuses.push(service.status)
            }
        }
        let fully_installed = statuses.every((d)=>{
            return d.fully_installed
        })
        this.status.fully_installed = fully_installed
        return statuses
    }
    async define(){
		const $this = this
        let service = this.services
        try{
            await this.define_services()
            // await $this.dependencyCheck()
            // let complete = $this.service.dependencies.every((dependency)=>{
            //     return dependency.status
            // })
            // $this.service.status = {
            //     running: false,
            //     errors: null,
            //     stream: []
            // }
            // await $this.setOptions()
            // $this.updateConfig()
            // if ($this.service.force_init){
            //     await $this.stop()
            // }

            // let state = await $this.statusCheck()
            // if (state.running){
            //     let err, stream = await state.container.logs({follow: true, stdout:true, stderr:true})
            //     $this.log = spawnLog(stream, $this.logger)
            //     $this.service.status.stream = $this.log
            // }
            // if ($this.service.init){
            //     if ($this.service.variables){
            //         await $this.check_then_start($this.service.variables)
            //     } else {
            //         await $this.check_then_start()
            //     }
            // }
            return
        } catch (err){
            logger.error(`%o error inerror in initializing service ${this.name}`, err)
            throw err
        }
        //Check if all dependencies are installed, if not return false

	}
    async statusCheck(){
		const $this = this;
		return new Promise(function(resolve,reject){
            let dependencies = $this.dependencyCheck()
            resolve(dependencies)
        })
	}

	// async statusCheck(){
	// 	const $this = this;
	// 	return new Promise(function(resolve,reject){
    //         (async ()=>{
    //             let status = await check_container($this.service.name)
    //             $this.service.status.running = status.running
    //             $this.service.status.exists = status.exists
    //             resolve(status)
    //         })().catch((err)=>{
    //             resolve(false)
    //         })
    //     })
	// }


    // async checkProgress(variables){
    //     const $this = this
    //     return new Promise(function(resolve,reject){
    //         let items = cloneDeep($this.service.progress)
    //         let progresses = []
    //         items.forEach((item)=>{
    //             let variable = $this.replaceVariables(item.source, variables)
    //             progresses.push(variable)
    //         })
    //         list_module_statuses(progresses).then((returned_data)=>{
    //             returned_data.map((d,i)=>{
    //                 items[i].status = d
    //             })
    //             resolve(items)
    //         }).catch((err)=>{
    //             reject(err)
    //         })
    //     })

    // }
    async stop(){
        const $this = this
        let promises = []
        for (let [key, service] of Object.entries(this.services)){
            if (service.status){
                promises.push(service.stop())
            }
        }
        let response = await Promise.allSettled(promises)
        return
    }
    async start(services){
        const $this = this
        if (!services){
            services = {}
            this.params.services.map((d)=>{
                services[d] = { }
            })
        }
        // return new Promise(function(resolve,reject){
            let promises = [];
            for (let [key, service ] of Object.entries(services)){
                let service_obj = $this.services[key]
                await service_obj.check_then_start(service, true)
                // promises.push(service_obj.check_then_start(service.variables, true))
            }
            // const serial = funcs =>
            //     promises.reduce((promise, func) =>
            //         promise.then(result => func().then(Array.prototype.concat.bind(result))), Promise.resolve([]))
            return
    }
    updateVariables(services){
        try{
            let variables  = []
            // let services_objs = this.services
            let linking = this.params.linking
            if (linking){
                linking.forEach((link)=>{
                    let serviceInput = services[link.input.service]
                    let serviceOutput = services[link.output.service]
                    let serviceConfigInput = this.services[link.input.service].config
                    let serviceConfigOutput = this.services[link.output.service].config
                    if (! serviceInput ||
                        serviceInput[link.input.target][link.input.variable].source == '' ||
                        !serviceInput[link.input.target][link.input.variable].source){
                        let targetAttr = serviceConfigOutput[link.output.target][link.output.variable]
                        let inner_variables = targetAttr.path.match(/(\${.+?\}){1}/g)
                        serviceInput = serviceConfigInput[link.input.target]
                        if (inner_variables && Array.isArray(inner_variables)){
                            inner_variables.forEach((vari)=>{
                                let id = vari.replace(/[\$\{\}]/g, "")
                                let val = serviceOutput.variables[id].source
                                serviceInput[link.input.variable].source = targetAttr.path.replaceAll(vari, val)

                            })
                        }
                        services[link.input.service] = { variables: serviceInput }
                    } else {
                        console.log(serviceInput.variables)

                    }
                })
            }
            console.log("____________")
            return  services
        } catch (err){
            logger.error(err)
            throw err
        }

    }
    // updateVariables(data){
    //     const $this = this
    //     try{
    //         let variables = [];
    //         if (!data || !this.service.variables || !Array.isArray(this.service.variables)){
    //             return
    //         }
    //         // let returned_option =
    //         variables = cloneDeep(this.service.variables )
    //         const keys = this.service.variables.map((d)=>{return d.name})
    //         data.forEach((value, key)=>{
    //             const index = keys.indexOf(value.name)
    //             if(index > -1){
    //                 let option = ( value.option ? value.option : 0)
    //                 if (value.source){
    //                     value.value = value.source
    //                 }
    //                 variables[index].option = option
    //                 if (variables[index].options){
    //                     if (!value.value){
    //                         if (value.options){
    //                             variables[index].options[option].source = value.options[option].source
    //                         }
    //                     } else {
    //                         variables[index].source = value.value
    //                         if (value.option){
    //                             variables[index].options[option].source = value.value
    //                         }
    //                     }

    //                 } else {
    //                     variables[index].source = ( value.value ? value.value : value )
    //                 }
    //             }


    //         })
    //         return variables
    //     } catch(err){
    //         logger.error("%o error in updating variables", err)
    //         throw err
    //     }
    // }








}
