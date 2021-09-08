/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./config/meta.yaml":
/*!**************************!*\
  !*** ./config/meta.yaml ***!
  \**************************/
/***/ ((module) => {

module.exports = JSON.parse('{"system":{"logs":{"path":"${dataPath}/logs"}},"images":{"jhuaplbio/basestack_consensus":{"title":"Consensus","name":"jhuaplbio/basestack_consensus","config":{"private":false,"tags":[],"type":"online","installation":{"location":"jhuaplbio/basestack_consensus"},"estimated_size":10.6},"dependencies":null,"resources":{"barcoding":{"items":["barcode_arrs_16s.cfg","barcode_arrs_dual_nb24_pcr96.cfg","barcode_arrs_lwb.cfg","barcode_arrs_nb12.cfg","barcode_arrs_nb24.cfg","barcode_arrs_nb96.cfg","barcode_arrs_pcr12.cfg","barcode_arrs_pcr96.cfg","barcode_arrs_rab.cfg","barcode_arrs_rbk096.cfg","barcode_arrs_rbk4.cfg","barcode_arrs_rbk.cfg","barcode_arrs_rlb.cfg","barcode_arrs_vmk2.cfg","barcode_arrs_vmk.cfg","configuration.cfg","configuration_dual.cfg"]},"basecalling\\"":{"items":["dna_r10.3_450bps_fast.cfg","dna_r10.3_450bps_fast_prom.cfg","dna_r10.3_450bps_hac.cfg","dna_r10.3_450bps_hac_prom.cfg","dna_r10_450bps_fast.cfg","dna_r10_450bps_hac.cfg","dna_r9.4.1_450bps_fast.cfg","dna_r9.4.1_450bps_fast_prom.cfg","dna_r9.4.1_450bps_hac.cfg","dna_r9.4.1_450bps_hac_prom.cfg","dna_r9.4.1_450bps_hac_prom_fw205.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac_prom.cfg","dna_r9.5_450bps_1d2_raw.cfg","dna_r9.5_450bps.cfg","rna_r9.4.1_70bps_fast.cfg","rna_r9.4.1_70bps_fast_prom.cfg","rna_r9.4.1_70bps_hac.cfg","rna_r9.4.1_70bps_hac_prom.cfg"]},"primers":{"items":["nCoV-2019/V3","nCoV-2019/V2","nCoV-2019/V1"]}}},"basestack_tutorial":{"title":"Workshop Tutorials","name":"basestack_tutorial","config":{"private":true,"tags":[],"type":"online","dependencies":[{"name":"AWS Key File","default":"new_user_credentials.csv","key":"aws_key","required":true,"type":"file","src":null,"srcFormat":null,"cmd":{"type":"copy","top":"/src/aws_key.csv"},"tooltip":"new_user_credential.tsv file provided in the google drive for workshop attendees"}],"installation":{"srcFiles":["Dockerfile","express.js"],"location":"${resourcePath}/basestack_tutorial/installation","resourcesPath":"${writePath}/basestack_tutorial/resources"}}},"jhuaplbio/basestack_mytax":{"title":"Mytax","name":"jhuaplbio/basestack_mytax","config":{"private":false,"tags":[],"type":"online","installation":{"location":"jhuaplbio/basestack_mytax"},"estimated_size":9.5},"dependencies":null}},"modules":{"introduction":{"name":"introduction","icon":"home","title":"Home","component":"Introduction","module":false,"tooltip":null,"image":null},"moduleinstall":{"name":"moduleinstall","icon":"cog","title":"Install Modules","component":"ModuleInstall","module":false,"tooltip":"Install or Modify Modules as Docker Images","image":null},"basestack_consensus":{"name":"basestack_consensus","title":"Consensus","icon":"dna","component":"BasestackConsensus","module":true,"objectname":"BasestackConsensus","objectfile":"modules/consensus","tooltip":"Generate consensus sequences and receive a report","image":"jhuaplbio/basestack_consensus","config":null,"pipelines":[{"basestack_consensus":null,"title":"Consensus (Artic)","inputs":[{"run":{"type":"dir","element":"dir-input","src":null,"save-config":null}},{"fastq_folder":{"type":"dir","element":"multi-select","derived":{"type":"dir","element":"dir-input","src":null,"save-config":null},"save-config":null}},{"sequencing_summary":{"type":"file","element":"text","required":true,"checks":["exists"]}},{"drift_correction":{"type":"file","element":"text","required":true,"checks":["exists"]}},{"throughput":{"type":"file","element":"text","required":true,"checks":["exists"]}},{"run_config":null,"type":"file","derived":{"type":"dir","element":"dir-input","src":null,"save-config":null},"content":{"items":{"header":false,"delim":"tab","type":"dynamic"}}},{"run_config":null,"type":"file","derived":{"type":"dir","element":"dir-input","src":null,"save-config":null},"path":null,"content":{"primers":{"type":"string","element":"multi-select","required":true,"default":["dna_r10.3_450bps_fast.cfg","dna_r10.3_450bps_fast_prom.cfg","dna_r10.3_450bps_hac.cfg","dna_r10.3_450bps_hac_prom.cfg","dna_r10_450bps_fast.cfg","dna_r10_450bps_hac.cfg","dna_r9.4.1_450bps_fast.cfg","dna_r9.4.1_450bps_fast_prom.cfg","dna_r9.4.1_450bps_hac.cfg","dna_r9.4.1_450bps_hac_prom.cfg","dna_r9.4.1_450bps_hac_prom_fw205.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac_prom.cfg","dna_r9.5_450bps_1d2_raw.cfg","dna_r9.5_450bps.cfg","rna_r9.4.1_70bps_fast.cfg","rna_r9.4.1_70bps_fast_prom.cfg","rna_r9.4.1_70bps_hac.cfg","rna_r9.4.1_70bps_hac_prom.cfg"],"custom-config":{"custom":true,"save-config":{},"docker-cmd-passthrough":{"type":"bind","location":"/opt/basestack_consensus/code/ont-guppy-cpu/data/"},"type":"file","checks":["exists"]}},"barcoding":{"type":"string","element":"select","required":true,"default":["dna_r10.3_450bps_fast.cfg","dna_r10.3_450bps_fast_prom.cfg","dna_r10.3_450bps_hac.cfg","dna_r10.3_450bps_hac_prom.cfg","dna_r10_450bps_fast.cfg","dna_r10_450bps_hac.cfg","dna_r9.4.1_450bps_fast.cfg","dna_r9.4.1_450bps_fast_prom.cfg","dna_r9.4.1_450bps_hac.cfg","dna_r9.4.1_450bps_hac_prom.cfg","dna_r9.4.1_450bps_hac_prom_fw205.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac_prom.cfg","dna_r9.5_450bps_1d2_raw.cfg","dna_r9.5_450bps.cfg","rna_r9.4.1_70bps_fast.cfg","rna_r9.4.1_70bps_fast_prom.cfg","rna_r9.4.1_70bps_hac.cfg","rna_r9.4.1_70bps_hac_prom.cfg"],"custom-config":{"custom":true,"save-config":null,"docker-cmd-passthrough":{"type":"bind","location":"/opt/basestack_consensus/code/ont-guppy-cpu/data/barcoding/"},"type":"file","checks":["exists"]}},"basecalling":{"type":"string","element":"select","required":true,"default":["dna_r10.3_450bps_fast.cfg","dna_r10.3_450bps_fast_prom.cfg","dna_r10.3_450bps_hac.cfg","dna_r10.3_450bps_hac_prom.cfg","dna_r10_450bps_fast.cfg","dna_r10_450bps_hac.cfg","dna_r9.4.1_450bps_fast.cfg","dna_r9.4.1_450bps_fast_prom.cfg","dna_r9.4.1_450bps_hac.cfg","dna_r9.4.1_450bps_hac_prom.cfg","dna_r9.4.1_450bps_hac_prom_fw205.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac.cfg","dna_r9.4.1_450bps_modbases_dam-dcm-cpg_hac_prom.cfg","dna_r9.5_450bps_1d2_raw.cfg","dna_r9.5_450bps.cfg","rna_r9.4.1_70bps_fast.cfg","rna_r9.4.1_70bps_fast_prom.cfg","rna_r9.4.1_70bps_hac.cfg","rna_r9.4.1_70bps_hac_prom.cfg"],"custom-config":{"custom":true,"save-config":{},"docker-cmd-passthrough":{"type":"bind","location":"/opt/basestack_consensus/code/ont-guppy-cpu/data/"},"type":"file","checks":["exists"]}}},"custom-config":{"header":false,"type":"static","delim":"tab"}}],"config":{"HostConfig":{"AutoRemove":true,"Binds":[[{"type":"dir","element":"dir-input","src":null,"save-config":null},"/tmp/consensus/reports"],[{"type":"dir","element":"multi-select","derived":{"type":"dir","element":"dir-input","src":null,"save-config":null},"save-config":null},"/opt/basestack_consensus/sequencing_runs/example-run"],[null,"/opt/basestack_consensus/sequencing_runs/example-run/fastq_pass"],[null,"/opt/basestack_consensus/sequencing_runs/example-run/artic-pipeline"]]}},"cmd":["bash","-c","echo Starting consensus pipeline..."],"components":[{"element":"File","size":6,"config":{"directory":true,"webkitdirectory":true,"no-traverse":false,"multiple":true,"placeholder":"Choose Run Folder"},"reference":{"type":"dir","element":"dir-input","src":null,"save-config":null}}]}]},"igv":{"name":"igv","icon":"globe","title":"IGV","component":"IGV","module":false,"tooltip":"View the externally hosted (internet required) page from Integrative Genomics Viewer","image":null},"nextstrain":{"name":"nextstrain","icon":"tree","title":"Nextstrain","component":"Nextstrain","module":false,"tooltip":"Compare mutations on Nextstrain (internet access required)","image":null},"logs":{"name":"logs","icon":"book-open","title":"Log Streams","component":"Logs","module":false,"tooltip":"View currently running logs of processes"},"about":{"name":"about","icon":"address-card","title":"Contact","component":"About","module":false,"tooltip":"","image":null},"system":{"name":"system","icon":"cog","title":"System","component":"System","module":false,"tooltip":"View your system information including available space, Docker status and more","image":null}}}');

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module doesn't tell about it's top-level declarations so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./config/meta.yaml");
/******/ 	
/******/ })()
;