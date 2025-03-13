// ==UserScript==
// @name         Gfycat Redirect to Webm
// @namespace    fuz/gfycat-redirect-webm
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
xhr.onload = function() {
  location.href = xhr.response.querySelector('#inner > h1 > a').href;
}
xhr.send();
