// ==UserScript==
// @name        Gfycat Redirect to Webm
// @version     1.0.1
// @author      fuzetsu
// @description Automatically redirects you to the webm source of a gif when you load a gfycat page
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://gfycat.com/*
// @namespace   http://fuzetsu/gfycat-redirect-webm
// @grant       none
// @deprecated  true
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

/***/ "./src/gfycat-redirect-to-webm/gfycat-redirect-to-webm.user.js":
/*!*********************************************************************!*\
  !*** ./src/gfycat-redirect-to-webm/gfycat-redirect-to-webm.user.js ***!
  \*********************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Gfycat Redirect to Webm\r\n// @namespace    http://fuzetsu/gfycat-redirect-webm\r\n// @version      1.0.1\r\n// @description  Automatically redirects you to the webm source of a gif when you load a gfycat page\r\n// @author       fuzetsu\r\n// @match        *://gfycat.com/*\r\n// @grant        none\r\n// @deprecated   true\r\n// ==/UserScript==\r\n\r\nvar xhr = new XMLHttpRequest();\r\nxhr.open('get', location.href + '.webm');\r\nxhr.responseType = 'document';\r\nxhr.onload = function() {\r\n  location.href = xhr.response.querySelector('#inner > h1 > a').href;\r\n}\r\nxhr.send();\n\n//# sourceURL=webpack://userscripts/./src/gfycat-redirect-to-webm/gfycat-redirect-to-webm.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/gfycat-redirect-to-webm/gfycat-redirect-to-webm.user.js"]();
/******/ 	
/******/ })()
;