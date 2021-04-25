// ==UserScript==
// @name        Format JSON
// @version     0.0.2
// @author      fuzetsu
// @description Automatically prettify JSON responses
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*.json
// @namespace   format-json
// @grant       GM_setClipboard
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
/******/ 	var __webpack_modules__ = ({

/***/ "./src/format-json/format-json.user.js":
/*!*********************************************!*\
  !*** ./src/format-json/format-json.user.js ***!
  \*********************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Format JSON\r\n// @namespace    format-json\r\n// @author       fuzetsu\r\n// @version      0.0.2\r\n// @description  Automatically prettify JSON responses\r\n// @match        *://*/*.json\r\n// @grant        GM_setClipboard\r\n// ==/UserScript==\r\nconst json = JSON.parse(document.body.textContent)\r\nconst formatted = JSON.stringify(json, null, 2)\r\ndocument.body.innerHTML =\r\n  '<code><pre style=\"white-space:pre-wrap;word-break:break-word\" id=\"jsonArea\"></pre></code>'\r\ndocument.getElementById('jsonArea').textContent = formatted\r\n\n\n//# sourceURL=webpack://userscripts/./src/format-json/format-json.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/format-json/format-json.user.js"]();
/******/ 	
/******/ })()
;