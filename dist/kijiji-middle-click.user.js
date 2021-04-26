// ==UserScript==
// @name        userscripts
// @version     0.0.1
// @description tampermonkey scripts
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*
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

/***/ "./src/kijiji-middle-click/kijiji-middle-click.user.js":
/*!*************************************************************!*\
  !*** ./src/kijiji-middle-click/kijiji-middle-click.user.js ***!
  \*************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Kijiji Middle Click\r\n// @namespace    kijiji-middle-click\r\n// @version      1.1\r\n// @description  make link middle clicking work on kijiji\r\n// @author       fuzetsu\r\n// @match        *://www.kijiji.ca/*\r\n// @grant        none\r\n// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465\r\n// @deprecated   true\r\n// ==/UserScript==\r\n\r\n(function() {\r\n  'use strict';\r\n  var allowMiddleClick = function(evt) {\r\n    if(evt.button === 1) evt.stopPropagation();\r\n  };\r\n  waitForElems({\r\n    sel: 'a',\r\n    onmatch: function(a) {\r\n      a.onclick = allowMiddleClick;\r\n    }\r\n  });\r\n})();\r\n\n\n//# sourceURL=webpack://userscripts/./src/kijiji-middle-click/kijiji-middle-click.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/kijiji-middle-click/kijiji-middle-click.user.js"]();
/******/ 	
/******/ })()
;