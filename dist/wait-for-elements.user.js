// ==UserScript==
// @name userscripts
// @version 0.0.1
// @description tampermonkey scripts
// @homepage https://github.com/niubilityfrontend/userscripts#readme
// @supportURL https://github.com/niubilityfrontend/userscripts/issues
// @match *://*/*
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

/***/ "./src/wait-for-elements/wait-for-elements.js":
/*!****************************************************!*\
  !*** ./src/wait-for-elements/wait-for-elements.js ***!
  \****************************************************/
/***/ (() => {

eval("/**\r\n * waitForElems\r\n * @param {{\r\n *  sel: string;\r\n *  onmatch: (element: HTMLElement) => void,\r\n *  context?: HTMLElement;\r\n *  stop?: boolean;\r\n *  throttle?: number;\r\n * }} config\r\n */\r\nfunction waitForElems({ sel, onmatch, context = document.body, stop = false, throttle = 300 }) {\r\n  const matched = new WeakSet()\r\n  let lastCheck = 0\r\n  let checkId\r\n\r\n  const check = () => {\r\n    // throttle calls\r\n    clearTimeout(checkId)\r\n    const delta = Date.now() - lastCheck\r\n    if (delta < throttle) {\r\n      checkId = setTimeout(check, throttle - delta)\r\n      return\r\n    }\r\n    lastCheck = Date.now()\r\n\r\n    // look for matches\r\n    Array.from(context.querySelectorAll(sel), elem => {\r\n      if (matched.has(elem)) return\r\n      matched.add(elem)\r\n      onmatch(elem)\r\n      if (stop) disconnect()\r\n    })\r\n  }\r\n\r\n  // observe DOM for changes\r\n  const observer = new MutationObserver(check)\r\n  const connect = () => observer.observe(context, { subtree: true, childList: true })\r\n  const disconnect = () => {\r\n    clearTimeout(checkId)\r\n    observer.disconnect()\r\n  }\r\n\r\n  // start waiting\r\n  connect()\r\n\r\n  // run initial check in case element is already on the page\r\n  check()\r\n\r\n  return { start: connect, stop: disconnect }\r\n}\r\n\r\n/**\r\n * waitForUrl\r\n * @param {RegExp | ((url: string) => boolean)} match\r\n * @param {(url: string) => void} onmatch\r\n * @param {boolean} stopLooking\r\n */\r\nfunction waitForUrl(match, onmatch, stopLooking = false) {\r\n  // url check supports custom fn or regex\r\n  const isMatch = typeof match === 'function' ? match : url => match.test(url)\r\n\r\n  // when popstate fires run check\r\n  let lastUrl\r\n  const check = () => {\r\n    const url = location.href\r\n    if (url !== lastUrl && isMatch(url)) {\r\n      lastUrl = url\r\n      onmatch(url)\r\n      if (stopLooking) stop()\r\n    }\r\n  }\r\n  let checkId\r\n  const start = () => (checkId = setInterval(check, 300))\r\n  const stop = () => clearInterval(checkId)\r\n\r\n  // start listening\r\n  start()\r\n\r\n  // perform initial check since current url might be a match\r\n  check()\r\n\r\n  return { start, stop }\r\n}\r\n\n\n//# sourceURL=webpack://userscripts/./src/wait-for-elements/wait-for-elements.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/wait-for-elements/wait-for-elements.js"]();
/******/ 	
/******/ })()
;