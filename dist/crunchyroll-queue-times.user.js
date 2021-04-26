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

/***/ "./src/crunchyroll-queue-times/crunchyroll-queue-times.user.js":
/*!*********************************************************************!*\
  !*** ./src/crunchyroll-queue-times/crunchyroll-queue-times.user.js ***!
  \*********************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name        Crunchyroll Queue Real Times\r\n// @namespace   http://www.fuzetsu.com/CRRT\r\n// @version     1.0.4\r\n// @description Display countdown until next episode in the Crunchyroll Queue page\r\n// @match       http://www.crunchyroll.com/home/queue\r\n// @copyright   2014+, fuzetsu\r\n// @deprecated  true\r\n// ==/UserScript==\r\n\r\nvar PREMIUM = 'rgb(255, 251, 223)',\r\n  REGULAR = 'rgb(232, 244, 248)',\r\n  COMING_SOON_IMG = 'http://static.ak.crunchyroll.com/i/coming_soon_beta_wide.jpg';\r\n\r\nvar SECOND = 1000,\r\n  MINUTE = SECOND * 60,\r\n  HOUR = MINUTE * 60,\r\n  DAY = HOUR * 24;\r\n\r\nvar CURYEAR = (new Date()).getFullYear();\r\n\r\nvar qq = function(q, c) {\r\n  return [].slice.call((c || document).querySelectorAll(q));\r\n};\r\n\r\nvar storeGet = function(key) {\r\n  if (typeof GM_getValue === \"undefined\") {\r\n    var value = localStorage.getItem(key);\r\n    if (value === \"true\" || value === \"false\") {\r\n      return (value === \"true\") ? true : false;\r\n    }\r\n    return value;\r\n  }\r\n  return GM_getValue(key);\r\n};\r\n\r\nvar storeSet = function(key, value) {\r\n  if (typeof GM_setValue === \"undefined\") {\r\n    return localStorage.setItem(key, value);\r\n  }\r\n  return GM_setValue(key, value);\r\n};\r\n\r\nvar storeDel = function(key) {\r\n  if (typeof GM_deleteValue === \"undefined\") {\r\n    return localStorage.removeItem(key);\r\n  }\r\n  return GM_deleteValue(key);\r\n};\r\n\r\nvar findEpByTitle = function(shows, title) {\r\n  var found;\r\n  shows.some(function(show) {\r\n    if (show.name.indexOf(title) === 0) {\r\n      found = show;\r\n      return true;\r\n    }\r\n  });\r\n  return found;\r\n};\r\n\r\nvar getTimes = function(total) {\r\n  var days = Math.floor(total / DAY);\r\n  total -= days * DAY;\r\n  var hours = Math.floor(total / HOUR);\r\n  total -= hours * HOUR;\r\n  var minutes = Math.floor(total / MINUTE);\r\n  total -= minutes * MINUTE;\r\n  var seconds = Math.floor(total / SECOND);\r\n  total -= seconds * SECOND;\r\n  return {\r\n    days: days,\r\n    hours: hours,\r\n    minutes: minutes,\r\n    seconds: seconds,\r\n    isDone: function() {\r\n      return days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0;\r\n    },\r\n    toTimeStr: function() {\r\n      return (this.days > 0 ? this.days + ' days ' : '') + (this.hours > 0 ? this.hours + ' hours ' : '') + (this.minutes > 0 ? this.minutes + ' minutes ' : '') + this.seconds + ' seconds';\r\n    }\r\n  };\r\n};\r\n\r\n// inserts a countdown to the release\r\nvar insertCountDown = function(loc, ep) {\r\n  var countDown = document.createElement('span');\r\n  var last = Date.now();\r\n  var totalTime = ep.date.valueOf() - last;\r\n  var tick = setInterval(function() {\r\n    var times = getTimes(totalTime);\r\n    if (times.isDone()) {\r\n      countDown.innerHTML = '<strong>A new episode has been released! Refresh the page to see it.</strong>';\r\n      return clearInterval(tick);\r\n    }\r\n    countDown.textContent = times.toTimeStr();\r\n    totalTime -= Date.now() - last;\r\n    last = Date.now();\r\n  }, 1000);\r\n  loc.innerHTML = '';\r\n  loc.appendChild(countDown);\r\n};\r\n\r\nvar extractDataFromScript = function(text) {\r\n  var obj = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1));\r\n  var dateStr = text.slice(text.lastIndexOf('}') + 4, text.lastIndexOf('\"'));\r\n  obj.date = new Date(dateStr.slice(0, -1) + \" \" + (dateStr.slice(-1) === 'a' ? 'am' : 'pm') + ' ' + CURYEAR);\r\n  return obj;\r\n};\r\n\r\nvar getLaunchCalendar = function(cb) {\r\n  var xhr = new XMLHttpRequest();\r\n  xhr.open('get', '/launchcalendar', true);\r\n  xhr.responseType = 'document';\r\n  xhr.onload = cb;\r\n  xhr.send();\r\n};\r\n\r\nvar main = function(userColor) {\r\n  console.log(userColor);\r\n  getLaunchCalendar(function(evt) {\r\n    var xhr = evt.target;\r\n    var animeData = [];\r\n    qq('td > div > script', xhr.response).forEach(function(script) {\r\n      if (script.previousSibling.previousSibling.style.backgroundColor !== userColor) return;\r\n      animeData.push(extractDataFromScript(script.textContent.trim()));\r\n    });\r\n    // find first date that is before now\r\n    var now = Date.now();\r\n    animeData = animeData.filter(function(anime) {\r\n      return anime.date.valueOf() >= now;\r\n    });\r\n    // add retrieved data to page\r\n    qq('.queue-wrapper').forEach(function(queueItem) {\r\n      if (qq('.episode-img img', queueItem)[0].src !== COMING_SOON_IMG) {\r\n        return;\r\n      }\r\n      var title = qq('.series-title', queueItem)[0].textContent;\r\n      var episode = findEpByTitle(animeData, title);\r\n      if (episode) {\r\n        insertCountDown(qq('.short-desc', queueItem)[0], episode);\r\n      }\r\n    });\r\n  });\r\n};\r\n\r\nvar user_premium = storeGet('CQRT_user_premium');\r\n\r\nif (user_premium === undefined) {\r\n  user_premium = true;\r\n}\r\n\r\n// register menu command\r\ntypeof GM_registerMenuCommand === 'function' && GM_registerMenuCommand('CR Queue countdown: show schedule for ' + (user_premium ? 'PREMIUM' : 'REGULAR') + ' users', function() {\r\n  storeSet('CQRT_user_premium', !user_premium);\r\n  window.location.reload();\r\n});\r\n\r\n// kick it off\r\nmain(user_premium && PREMIUM || REGULAR);\r\n\n\n//# sourceURL=webpack://userscripts/./src/crunchyroll-queue-times/crunchyroll-queue-times.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/crunchyroll-queue-times/crunchyroll-queue-times.user.js"]();
/******/ 	
/******/ })()
;