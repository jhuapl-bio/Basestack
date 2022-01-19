const { store } = require('../store/global')
const {logger}  = require('../controllers/logger')
const { writeFile, readFile, ammendJSON } = require("../controllers/IO.js")
const {  checkFileExist } = require("../controllers/validate.js")
const path = require("path")
export class Tutorial{
	constructor(){
		this.docker_module = store.config.images["basestack_tutorial"] 
		this.basePath = path.join(store.meta.resourcePath, "tutorials")
	}
	async build(data) {
		return new Promise(function(resolve,reject){
			let options = {
				name: "basestack_tutorial",
				user: store.meta.uid.toString() + ":"+store.meta.gid.toString(),
				"ExposedPorts": {
		            "8098/tcp": {}
		        },
			    "HostConfig": {
				    "AutoRemove": true,
			        "Binds": [
			        ],	
			        "PortBindings": {
					    "8098/tcp": [
				            {
				                "HostPort": "8098"
				            }
				        ]
		            },
			    },
		        "Volumes": {
		        }

			};	

			
			let command = [  ]
			resolve({options: options, command: command })
		})
	}
	async timestampAdd(params){
		try{
			const basePath = this.basePath
			let metaFile = path.join(store.meta.userMeta)
			// let videoMeta = await checkFileExist(metaFile)
			let metaContent;
			metaContent = JSON.parse(await readFile(metaFile,false))
			metaContent = metaContent.modules.basestack_tutorial
			if (!metaContent.bookmark){
				metaContent.bookmark = {}
				await ammendJSON({
					value: {},
					file: metaFile,
					attribute: "modules.basestack_tutorial.bookmark"
				}).catch((err)=>{
					logger.error(err)
					throw err
				})
			}
			const section = params.section
			let arrSorted = []
			if(metaContent.bookmark[section.key]){
				let arr = metaContent.bookmark[section.key]
				let index = arr.map(e => e.title).indexOf(params.title);
				if (index != -1){
					throw new Error("There is a custom timestamp for this video with that name. Try a new one please")
				}
				arr.push({title: params.title, time: params.time, type:"custom"})
				arrSorted = arr.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
			} else {
				arrSorted = [{title: params.title, time: params.time, type: 'custom' }]
			}
			await ammendJSON({
				value: arrSorted,
				file: metaFile,
				attribute: "modules.basestack_tutorial.bookmark." + section.key
			}).catch((err)=>{
				logger.error(err)
				throw err
			})
			return {title: params.title, time: params.time, type:"custom"}
		} catch(err){
			logger.error(err)
			throw err
		}
	}
	async removeTimestamp(params){
		const basePath = this.basePath
		let metaFile = path.join(store.meta.userMeta)
		// let videoMeta = await checkFileExist(metaFile)
		let metaContent;
		metaContent = JSON.parse(await readFile(metaFile,false))
		metaContent = metaContent.modules.basestack_tutorial
		const section = params.section
		let arrSorted=[];
		if(metaContent.bookmark[section.key]){
			let chapters = metaContent.bookmark[section.key]
			let index = chapters.map(e => e.title).indexOf(params.title);
			if (index == -1){
				throw new Error("There is no timestamp for this module section with that description. Try a new one please")
			}
			index > -1 ? chapters.splice(index, 1) : '';
			arrSorted = chapters.sort((a, b) => parseFloat(a.time) - parseFloat(b.time));
		} 
		await ammendJSON({
			value: arrSorted,
			file: metaFile,
			attribute: "modules.basestack_tutorial.bookmark." + section.key
		}).catch((err)=>{
			logger.error(err)
			throw err
		})
		return arrSorted
	}

}