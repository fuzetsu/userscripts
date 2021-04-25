// ==UserScript==
// @name        YouTube History Management
// @version     1.1.0
// @author      fuzetsu
// @description Select and remove YouTube history items quickly
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://www.youtube.com/*
// @namespace   http://fuzetsu.com/YHM
// @grant       none
// @require     https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=141779
// @deprecated  true
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

/***/ "./src/youtube-history-management/youtube-history-management.user.js":
/*!***************************************************************************!*\
  !*** ./src/youtube-history-management/youtube-history-management.user.js ***!
  \***************************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         YouTube History Management\r\n// @namespace    http://fuzetsu.com/YHM\r\n// @version      1.1.0\r\n// @description  Select and remove YouTube history items quickly\r\n// @author       fuzetsu\r\n// @match        *://www.youtube.com/*\r\n// @grant        none\r\n// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=141779\r\n// @noframes\r\n// @deprecated   true\r\n// ==/UserScript==\r\n\r\nif (window.top !== window.self) return;\r\n\r\nvar deleteQueue = [],\r\n  items = [],\r\n  itemIdx = 0,\r\n  waitID = null,\r\n  EDIT_MODE = false,\r\n  SCRIPT_NAME = 'YouTube History Management',\r\n  SELECT_COLOR = 'orange',\r\n  TITLE_SELECTOR = '.yt-uix-tile-link',\r\n  DESC_SELECTOR = '.yt-lockup-description',\r\n  MENU_SELECTOR = '#browse-items-primary li > ul',\r\n  FEED_SELECTOR = '.yt-lockup-video';\r\n\r\nvar Util = {\r\n  log: function() {\r\n    var args = [].slice.call(arguments);\r\n    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color:navy');\r\n    console.log.apply(console, args);\r\n  },\r\n  q: function(query, context) {\r\n    return (context || document).querySelector(query);\r\n  },\r\n  qq: function(query, context) {\r\n    return [].slice.call((context || document).querySelectorAll(query));\r\n  },\r\n  _cbQueue: [],\r\n  _handleQueue: function() {\r\n    this._cbQueue.shift()();\r\n  },\r\n  queueCallback: function(callback) {\r\n    this._cbQueue.push(callback);\r\n    setTimeout(this._handleQueue.bind(this), 0);\r\n  }\r\n};\r\n\r\nfunction removeItem(item) {\r\n  // find \"remove from watch history\" button within history item\r\n  var btns = Util.qq('button', item);\r\n  btns.some(function(btn) {\r\n    // make sure we have the right button\r\n    if (btn.title.trim() === 'Remove from Watch history') {\r\n      Util.queueCallback(btn.click.bind(btn));\r\n      toggleSelected(item, false, true);\r\n      return true;\r\n    }\r\n  });\r\n}\r\n\r\nfunction toggleUntil(index, item) {\r\n  while (item && !item.dataset.yhmSelected) {\r\n    toggleSelected(item, true);\r\n    item = items[--index];\r\n  }\r\n}\r\n\r\nfunction toggleSelected(item, state, ignore) {\r\n  var title = Util.q(TITLE_SELECTOR, item),\r\n    desc = Util.q(DESC_SELECTOR, item);\r\n  if (state || !item.dataset.yhmSelected) {\r\n    if (!ignore) {\r\n      deleteQueue.push(item);\r\n    }\r\n    item.style.backgroundColor = SELECT_COLOR;\r\n    title && (title.style.backgroundColor = SELECT_COLOR);\r\n    desc && (desc.style.backgroundColor = SELECT_COLOR);\r\n    item.dataset.yhmSelected = 'yes';\r\n  }\r\n  else {\r\n    if (!ignore) {\r\n      deleteQueue.splice(deleteQueue.indexOf(item), 1);\r\n    }\r\n    item.style.backgroundColor = '';\r\n    title && (title.style.backgroundColor = '');\r\n    desc && (desc.style.backgroundColor = '');\r\n    item.dataset.yhmSelected = '';\r\n  }\r\n}\r\n\r\nfunction makeMenuButton(text, action) {\r\n  var btn = document.createElement('button'),\r\n    liContainer = document.createElement('li');\r\n  btn.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default';\r\n  btn.innerHTML = '<span class=\"yt-uix-button-content\">' + text + '</span>';\r\n  btn.addEventListener('click', action, false);\r\n  liContainer.appendChild(btn);\r\n  Util.q(MENU_SELECTOR).appendChild(liContainer);\r\n  return btn;\r\n}\r\n\r\nUtil.log('Started');\r\n\r\nwaitForUrl(/^http(s)?:\\/\\/www\\.youtube\\.com\\/feed\\/history/, function() {\r\n  var historyUrl = location.href;\r\n  Util.log('Entered history page, waiting for menu area to load');\r\n  waitForElems(MENU_SELECTOR, function() {\r\n    Util.log('Found menu area, creating and inserting buttons');\r\n    // Button that toggles between edit and standard modes\r\n    var btnEditHistory = makeMenuButton('Edit History', function(evt) {\r\n      if (this.textContent === 'Edit History') {\r\n        EDIT_MODE = true;\r\n        this.textContent = 'Stop Editing';\r\n        btnDeleteSelected.parentNode.style.display = '';\r\n      }\r\n      else {\r\n        EDIT_MODE = false;\r\n        this.textContent = 'Edit History';\r\n        // reset history selection\r\n        while (deleteQueue.length > 0) {\r\n          toggleSelected(deleteQueue.pop(), false, true);\r\n        }\r\n        btnDeleteSelected.parentNode.style.display = 'none';\r\n      }\r\n    });\r\n    // Button that deletes all selected items, only visible while editing\r\n    var btnDeleteSelected = makeMenuButton('Delete Selected', function(evt) {\r\n      var count = deleteQueue.length;\r\n      if (count < 1) return alert('Nothing selected, select at least one history item and try again.');\r\n      EDIT_MODE = false;\r\n      while (deleteQueue.length > 0) {\r\n        removeItem(deleteQueue.pop());\r\n      }\r\n      Util.queueCallback(function() {\r\n        EDIT_MODE = true;\r\n      });\r\n      alert('Deleted ' + count + ' history items.');\r\n    });\r\n    // hide the button pre-emptively\r\n    btnDeleteSelected.parentNode.style.display = 'none';\r\n\r\n    // watch DOM for new history items\r\n    waitID = waitForElems(FEED_SELECTOR, function(item) {\r\n      var index = itemIdx;\r\n      itemIdx += 1;\r\n      items.push(item);\r\n      // bind selecting event for history items\r\n      item.addEventListener('click', function(evt) {\r\n        if (EDIT_MODE) {\r\n          evt.preventDefault();\r\n          evt.stopPropagation();\r\n          if (evt.shiftKey) {\r\n            toggleUntil(index, item);\r\n          }\r\n          else {\r\n            toggleSelected(item);\r\n          }\r\n          window.getSelection().removeAllRanges();\r\n        }\r\n      }, false);\r\n    });\r\n  }, true);\r\n  waitForUrl(function(url) {\r\n    return url !== historyUrl;\r\n  }, function() {\r\n    clearInterval(waitID);\r\n    EDIT_MODE = false;\r\n    deleteQueue = [];\r\n    Util.log('Leaving history page, cleaning up listeners and references');\r\n  }, true);\r\n});\r\n\n\n//# sourceURL=webpack://userscripts/./src/youtube-history-management/youtube-history-management.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/youtube-history-management/youtube-history-management.user.js"]();
/******/ 	
/******/ })()
;