// ==UserScript==
// @name        YouTube Playlist Time
// @version     1.2.11
// @description Shows the total time it would take to watch all the videos in a YouTube playlist
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       https://www.youtube.com/*
// @namespace   http://www.fuzetsu.com/WLFT
// @require     https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @copyright   2014+, fuzetsu
// @grant       none
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

/***/ "./src/youtube-playlist-time/youtube-playlist-time.user.js":
/*!*****************************************************************!*\
  !*** ./src/youtube-playlist-time/youtube-playlist-time.user.js ***!
  \*****************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         YouTube Playlist Time\r\n// @namespace    http://www.fuzetsu.com/WLFT\r\n// @version      1.2.11\r\n// @description  Shows the total time it would take to watch all the videos in a YouTube playlist\r\n// @match        https://www.youtube.com/*\r\n// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465\r\n// @copyright    2014+, fuzetsu\r\n// @grant        none\r\n// ==/UserScript==\r\n\r\nvar SCRIPT_NAME = 'YouTube Playlist Time';\r\nvar HOLDER_SELECTOR = '#stats';\r\nvar TIMESTAMP_SELECTOR = 'ytd-browse:not([hidden]) .ytd-thumbnail-overlay-time-status-renderer';\r\nvar EL_ID = 'us-total-time';\r\nvar EL_TYPE = 'yt-formatted-string';\r\nvar EL_CLASS = 'style-scope ytd-playlist-sidebar-primary-info-renderer';\r\n\r\nvar util = {\r\n  log: function () {\r\n    var args = [].slice.call(arguments);\r\n    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');\r\n    console.log.apply(console, args);\r\n  },\r\n  q: function(query, context) {\r\n    return (context || document).querySelector(query);\r\n  },\r\n  qq: function(query, context) {\r\n    return [].slice.call((context || document).querySelectorAll(query));\r\n  },\r\n  bindEvt: function(target, events) {\r\n    events.forEach(function(evt) {\r\n      target.addEventListener(evt[0], evt[1]);\r\n    });\r\n  },\r\n  unbindEvt: function(target, events) {\r\n    events.forEach(function(evt) {\r\n      target.removeEventListener(evt[0], evt[1]);\r\n    });\r\n  },\r\n  throttle: function(callback, limit) {\r\n    var wait = false;\r\n    return function() {\r\n      if (!wait) {\r\n        callback.apply(this, arguments);\r\n        wait = true;\r\n        setTimeout(function() {\r\n          wait = false;\r\n        }, limit);\r\n      }\r\n    };\r\n  }\r\n};\r\n\r\n// converts a timestring to seconds\r\nvar calcTimeString = function(str) {\r\n  return str.split(':').reverse().reduce(function(last, cur, idx) {\r\n    cur = parseInt(cur, 10);\r\n    switch(idx) {\r\n      case 0: // seconds\r\n        return last + cur;\r\n      case 1: // minutes\r\n        return last + cur * 60;\r\n      case 2: // hours\r\n        return last + cur * 60 * 60;\r\n      default:\r\n        return 0;\r\n    }\r\n  }, 0);\r\n};\r\n\r\n// pads an integer with zeroes\r\nvar padTime = function(time) {\r\n  return (\"0\" + time).slice(-2);\r\n};\r\n\r\n// calculates the total amount of time necessary to watch all the videos in the playlist and outputs the result\r\nvar setTime = function(seconds) {\r\n  var loc = getTimeLoc();\r\n  var hours = Math.floor(seconds / 60 / 60);\r\n  seconds = seconds % (60 * 60);\r\n  var minutes = Math.floor(seconds / 60);\r\n  seconds = seconds % 60;\r\n  loc.innerHTML = (((hours || '') && hours + ' hours ') + ((minutes || '') && minutes + ' minutes ') + ((seconds || '') && seconds + ' seconds')).trim();\r\n};\r\n\r\nvar getTimeLoc = function() {\r\n  var loc = util.q('#' + EL_ID);\r\n  if(!loc) {\r\n    loc = util.q(HOLDER_SELECTOR).appendChild(document.createElement(EL_TYPE));\r\n    loc.id = EL_ID;\r\n    loc.className = EL_CLASS;\r\n  }\r\n  return loc;\r\n};\r\n\r\nvar timeLocExists = function() {\r\n  return !!util.q('#' + EL_ID);\r\n};\r\n\r\nvar lastLength = 0;\r\nvar calcTotalTime = function(force) {\r\n  var timestamps = util.qq(TIMESTAMP_SELECTOR);\r\n  if(!force && timestamps.length === lastLength && timeLocExists()) return;\r\n  lastLength = timestamps.length;\r\n  var totalSeconds = timestamps.reduce(function(total, ts) {\r\n    return total + calcTimeString(ts.textContent.trim());\r\n  }, 0);\r\n  setTime(totalSeconds);\r\n};\r\n\r\nvar events = [\r\n  ['mousemove', util.throttle(calcTotalTime.bind(null, false), 500)]\r\n];\r\n\r\nutil.log('Started, waiting for playlist');\r\n\r\nwaitForUrl(/^https:\\/\\/www\\.youtube\\.com\\/playlist\\?list=.+/, function() {\r\n  var playlistUrl = location.href;\r\n  var urlWaitId, oid;\r\n  var seconds = 0;\r\n  util.log('Reached playlist, waiting for display area to load');\r\n  waitForElems({\r\n    sel: HOLDER_SELECTOR,\r\n    stop: true,\r\n    onmatch: function(holder) {\r\n      clearTimeout(oid);\r\n      util.log('display area loaded, calculating time.');\r\n      oid = setTimeout(function() {\r\n        util.bindEvt(window, events);\r\n        calcTotalTime(true);\r\n         urlWaitId = waitForUrl(function(url) {\r\n           return url !== playlistUrl;\r\n         }, function() {\r\n           util.log('Leaving playlist, removing listeners');\r\n           util.unbindEvt(window, events);\r\n           var loc = getTimeLoc();\r\n           if(loc) loc.remove();\r\n         }, true);\r\n      }, 500);\r\n    }\r\n  });\r\n});\r\n\n\n//# sourceURL=webpack://userscripts/./src/youtube-playlist-time/youtube-playlist-time.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/youtube-playlist-time/youtube-playlist-time.user.js"]();
/******/ 	
/******/ })()
;