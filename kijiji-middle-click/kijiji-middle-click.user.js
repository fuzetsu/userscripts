// ==UserScript==
// @name         Kijiji Middle Click
// @namespace    kijiji-middle-click
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        *://www.kijiji.ca/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// ==/UserScript==

(function() {
  'use strict';
  var allowMiddleClick = function(evt) {
    if(evt.button === 1) evt.stopPropagation();
  };
  waitForElems({
    sel: 'a',
    onmatch: function(a) {
      a.onclick = allowMiddleClick;
    }
  });
})();
