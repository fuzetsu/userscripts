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


/**
 * waitForElems
 * @param {{
 *  sel: string;
 *  onmatch: (element: HTMLElement) => void,
 *  context?: HTMLElement;
 *  stop?: boolean;
 *  throttle?: number;
 * }} config
 */
function waitForElems(_ref) {
  var {
    sel: sel,
    onmatch: onmatch,
    context = document.body,
    stop = false,
    throttle = 300
  } = _ref,
      matched = new WeakSet(),
      lastCheck = 0,
      checkId,
      check = function check() {
    // throttle calls
    clearTimeout(checkId);
    var delta = Date.now() - lastCheck;

    if (delta < throttle) {
      checkId = setTimeout(check, throttle - delta);
      return;
    }

    lastCheck = Date.now(); // look for matches

    Array.from(context.querySelectorAll(sel), function (elem) {
      if (matched.has(elem)) return;
      matched.add(elem);
      onmatch(elem);
      if (stop) disconnect();
    });
  },
      observer = new MutationObserver(check),
      connect = function connect() {
    return observer.observe(context, {
      subtree: true,
      childList: true
    });
  },
      disconnect = function disconnect() {
    clearTimeout(checkId);
    observer.disconnect();
  };

  // start waiting
  connect(); // run initial check in case element is already on the page

  check();
  return {
    start: connect,
    stop: disconnect
  };
}
/**
 * waitForUrl
 * @param {RegExp | ((url: string) => boolean)} match
 * @param {(url: string) => void} onmatch
 * @param {boolean} stopLooking
 */


function waitForUrl(match, onmatch) {
  var stopLooking = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false,
      isMatch = typeof match === 'function' ? match : function (url) {
    return match.test(url);
  },
      lastUrl,
      check = function check() {
    var url = location.href;

    if (url !== lastUrl && isMatch(url)) {
      lastUrl = url;
      onmatch(url);
      if (stopLooking) stop();
    }
  },
      checkId,
      start = function start() {
    return checkId = setInterval(check, 300);
  },
      stop = function stop() {
    return clearInterval(checkId);
  };

  // start listening
  start(); // perform initial check since current url might be a match

  check();
  return {
    start: start,
    stop: stop
  };
}
/******/ })()
;