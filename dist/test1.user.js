// ==UserScript==
// @name userscripts
// @version 0.0.1
// @description tampermonkey scripts
// @homepage https://github.com/niubilityfrontend/userscripts#readme
// @supportURL https://github.com/niubilityfrontend/userscripts/issues
// @match *://*/*
// ==/UserScript==

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./libs/parseMeta.mjs":
/*!****************************!*\
  !*** ./libs/parseMeta.mjs ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   \"default\": () => (/* binding */ parseMeta)\n/* harmony export */ });\nfunction parseMeta(script) {\r\n    return script\r\n        .slice(script.indexOf('==UserScript=='), script.indexOf('==/UserScript=='))\r\n        .split('\\n')\r\n        .map(line => line.match(/^\\s*[\\/]{2,}\\s*@(\\S+)\\s+(.+)/i))\r\n        .filter(match => !!match)\r\n        .reduce((result, [, key, value]) => {\r\n            if (Object.keys(result).includes(key)) {\r\n                if (Array.isArray(result[key])) {\r\n                    result[key].push(value);\r\n                } else {\r\n                    result[key] = [result[key], value];\r\n                }\r\n            } else {\r\n                result[key] = value;\r\n            }\r\n            return result;\r\n        }, {});\r\n}\n\n//# sourceURL=webpack://userscripts/./libs/parseMeta.mjs?");

/***/ }),

/***/ "./src/test/test1.mjs":
/*!****************************!*\
  !*** ./src/test/test1.mjs ***!
  \****************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _libs_parseMeta_mjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../../libs/parseMeta.mjs */ \"./libs/parseMeta.mjs\");\n\r\n\r\n\r\nconst p = ()=>{};//(...args) => (console.log(...args), args[0]);\r\n\r\np((0,_libs_parseMeta_mjs__WEBPACK_IMPORTED_MODULE_0__.default)(''));\n\n//# sourceURL=webpack://userscripts/./src/test/test1.mjs?");

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
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/test/test1.mjs");
/******/ 	
/******/ })()
;