// ==UserScript==
// @name        userscripts
// @version     0.0.1
// @description tampermonkey scripts
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


var _parseMeta = require("@libs/parseMeta.mjs"),
    p = function p() {
  return console.log(...arguments), arguments.length <= 0 ? undefined : arguments[0];
},
    test = 'Your awesome js code.',
    jquery = p,
    s = "\n    // ==UserScript==\n// @name        userscripts\n// @version     0.0.1\n// @description tampermonkey scripts\n// @homepage    https://github.com/niubilityfrontend/userscripts#readme\n// @supportURL  https://github.com/niubilityfrontend/userscripts/issues\n// @match       *://*/*\n// ==/UserScript==\n</CDATASection>";

p(_parseMeta["default"]);
var data = (0, _parseMeta["default"])(s);
p(data);
p(jquery);
/******/ })()
;