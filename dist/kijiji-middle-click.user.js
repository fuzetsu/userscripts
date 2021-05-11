// ==UserScript==
// @name        Kijiji Middle Click
// @version     1.1
// @author      fuzetsu
// @description make link middle clicking work on kijiji
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://www.kijiji.ca/*
// @namespace   kijiji-middle-click
// @grant       none
// @require     https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @deprecated  true
// ==/UserScript==

/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// ==UserScript==
// @name         Kijiji Middle Click
// @namespace    kijiji-middle-click
// @version      1.1
// @description  make link middle clicking work on kijiji
// @author       fuzetsu
// @match        *://www.kijiji.ca/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @deprecated   true
// ==/UserScript==
(function () {
  'use strict';

  var allowMiddleClick = function allowMiddleClick(evt) {
    if (evt.button === 1) evt.stopPropagation();
  };

  waitForElems({
    sel: 'a',
    onmatch: function onmatch(a) {
      a.onclick = allowMiddleClick;
    }
  });
})();
/******/ })()
;