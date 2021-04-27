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

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


// ==UserScript==
// @name         Gfycat Redirect to Webm
// @namespace    http://fuzetsu/gfycat-redirect-webm
// @version      1.0.1
// @description  Automatically redirects you to the webm source of a gif when you load a gfycat page
// @author       fuzetsu
// @match        *://gfycat.com/*
// @grant        none
// @deprecated   true
// ==/UserScript==
var xhr = new XMLHttpRequest();
xhr.open('get', location.href + '.webm');
xhr.responseType = 'document';

xhr.onload = function () {
  location.href = xhr.response.querySelector('#inner > h1 > a').href;
};

xhr.send();
/******/ })()
;