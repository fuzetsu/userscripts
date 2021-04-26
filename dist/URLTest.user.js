// ==UserScript==
// @name URLTest
// @version 2019.12.20
// @author jimbo
// @description tampermonkey scripts
// @homepage https://github.com/niubilityfrontend/userscripts#readme
// @supportURL https://github.com/niubilityfrontend/hunttingteacheron51talk
// @match *:*/*
// @match *127.0.0.1*:*/*
// @match *localhost*:*/*
// @namespace https://github.com/niubilityfrontend
// @license OSL-3.0
// @grant GM_xmlhttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant GM_deleteValue
// @grant GM_registerMenuCommand
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/pace/1.0.2/pace.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/i18n/grid.locale-cn.js
// @require https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/jquery.jqgrid.min.js
// @require https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// @require https://greasyfork.org/scripts/389774-gm-config-toolbar/code/gm_config_toolbar.js?version=730739
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

/***/ "./src/javascriptSnippets/URLTest.user.js":
/*!************************************************!*\
  !*** ./src/javascriptSnippets/URLTest.user.js ***!
  \************************************************/
/***/ (() => {

eval("\r\n\r\n// ==UserScript==\r\n// @name         URLTest\r\n// @version      2019.12.20\r\n// @namespace    https://github.com/niubilityfrontend\r\n// @description\r\n// @author       jimbo\r\n// @license      OSL-3.0\r\n// @supportURL   https://github.com/niubilityfrontend/hunttingteacheron51talk\r\n// @match        *:*/*\r\n// @match        *127.0.0.1*:*/*\r\n// @match        *localhost*:*/*\r\n// @grant        GM_xmlhttpRequest\r\n// @grant        GM_getValue\r\n// @grant        GM_setValue\r\n// @grant        GM_listValues\r\n// @grant        GM_deleteValue\r\n// @grant        GM_registerMenuCommand\r\n// @require      http://code.jquery.com/jquery-3.4.1.min.js\r\n// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js\r\n// @require      https://cdnjs.cloudflare.com/ajax/libs/pace/1.0.2/pace.min.js\r\n// @require      https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/i18n/grid.locale-cn.js\r\n// @require      https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/jquery.jqgrid.min.js\r\n// @require      https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657\r\n// @require      https://greasyfork.org/scripts/389774-gm-config-toolbar/code/gm_config_toolbar.js?version=730739\r\n// ==/UserScript==\r\n//\r\nfunction myFunction() {\r\n  var uri = \"https://www.w3schools.com/jsref/tryit.asp?Filename=tryjsref_decodeuri&color[0]=red&color[1]=green&selection=1&selection=2&selection=3#testhashzhong中文\",\r\n      enc = encodeURI(uri),\r\n      dec = decodeURI(enc),\r\n      params = new URL(uri).searchParams,\r\n      res = \"Encoded URI: \" + enc + \"<br>\" + \"Decoded URI: \" + dec + \"<br> JSON\" + JSON.stringify(params);\r\n  $(\"<div></div>\").appendTo('body').html(res);\r\n  params.forEach(function (val, k, arr) {\r\n    console.log(\"\".concat(val, \" \").concat(k, \" \"));\r\n  });\r\n}\r\n\r\nmyFunction();\r\n$('#timesmutipulecheck').find(\"input\").checkboxradio({\r\n  icon: false\r\n});\r\n$(\"#btns\").eq(0).button({\r\n  icon: 'ui-icon-seek-next',\r\n  showLabel: true\r\n}).click(function () {\r\n  $('#timesmutipulecheck>input').each(function (i, item) {\r\n    $(item).prop(\"checked\", !$(item).is(\":checked\")).change(); //checkboxradio 修改值后，必须调用change才会引发UI更新\r\n  });\r\n}).end();\r\n\r\nfunction test() {\r\n  for (var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : \"hello\", {\r\n    a: a,\r\n    b: b\r\n  } = arguments.length > 1 ? arguments[1] : undefined, _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {\r\n    args[_key - 2] = arguments[_key];\r\n  }\r\n\r\n  console.log(x, a, b, args);\r\n}\n\n//# sourceURL=webpack://userscripts/./src/javascriptSnippets/URLTest.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/javascriptSnippets/URLTest.user.js"]();
/******/ 	
/******/ })()
;