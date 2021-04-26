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

/***/ "./src/youtube-playlist-search/youtube-playlist-search.user.js":
/*!*********************************************************************!*\
  !*** ./src/youtube-playlist-search/youtube-playlist-search.user.js ***!
  \*********************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         YouTube Playlist Search\r\n// @namespace    http://www.fuzetsu.com/YPS\r\n// @version      1.1.3\r\n// @description  Allows you to quickly search through youtube playlists\r\n// @match        https://www.youtube.com/*\r\n// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js\r\n// @copyright    2014+, fuzetsu\r\n// @grant        none\r\n// ==/UserScript==\r\n\r\nconst SCRIPT_NAME = 'YouTube Playlist Search';\r\nconst ITEM_SELECTOR = '#contents > ytd-playlist-video-renderer,ytd-grid-video-renderer';\r\nconst ITEM_PROGRESS_SELECTOR = ITEM_SELECTOR + ' #progress';\r\nconst TEXT_SELECTOR = '#meta';\r\nconst OFFSET_AREA_SELECTOR = '#masthead-container';\r\n\r\nconst util = {\r\n  log: (...args) => console.log(`%c${SCRIPT_NAME}`, 'font-weight: bold;color: hotpink;', ...args),\r\n  q: (query, context) => (context || document).querySelector(query),\r\n  qq: (query, context) => Array.from((context || document).querySelectorAll(query)),\r\n  debounce: (cb, ms) => {\r\n    let id;\r\n    return (...args) => {\r\n      clearTimeout(id);\r\n      id = setTimeout(() => cb(...args), ms);\r\n    };\r\n  },\r\n  makeElem: (tag, attrs) => {\r\n    const elem = document.createElement(tag);\r\n    Object.entries(attrs).forEach(([attr, val]) => !['style'].includes(attr) && attr in elem ? elem[attr] = val : elem.setAttribute(attr, val));\r\n    return elem;\r\n  }\r\n};\r\n\r\nconst yps = {\r\n  _items: [],\r\n  hideWatched: false,\r\n  render: () => {\r\n    const commonStyles = [\r\n      'position: fixed',\r\n      `top: ${util.q(OFFSET_AREA_SELECTOR).clientHeight}px`,\r\n      'z-index: 9000',\r\n      'padding: 5px 8px',\r\n      'border: 1px solid #999',\r\n      'font-size: medium',\r\n      'color: var(--yt-primary-text-color)',\r\n      'margin: 0',\r\n      'box-sizing: border-box',\r\n      'background: var(--yt-main-app-background-tmp)'\r\n    ];\r\n    const txtSearch = util.makeElem('input', {\r\n      type: 'text',\r\n      placeholder: 'filter - start with ^ for inverse search',\r\n      style: [\r\n        ...commonStyles,\r\n        'right: 0',\r\n        'width: 300px'\r\n      ].join(';'),\r\n      onkeyup: util.debounce(e => resultCount.render(...yps.search(e.target.value)), 200)\r\n    });\r\n    const resultCount = util.makeElem('span', {\r\n      style: [\r\n        ...commonStyles,\r\n        'right: 300px'\r\n      ].join(';'),\r\n      textContent: '-'\r\n    });\r\n    resultCount.render = (x, y, invert) => resultCount.childNodes[0].textContent = `Showing ${x} of ${y} ${invert ? '(NOT)' : ''} | Hide Watched `;\r\n    const toggleWatched = util.makeElem('input', {\r\n      type: 'checkbox',\r\n      value: yps.hideWatched,\r\n      onchange: () => (yps.hideWatched = toggleWatched.checked, resultCount.render(...yps.search(txtSearch.value)))\r\n    });\r\n    resultCount.appendChild(toggleWatched);\r\n    [txtSearch, resultCount].forEach(elem => document.body.appendChild(elem));\r\n    return { txtSearch, resultCount };\r\n  },\r\n  search: (query = '') => {\r\n    const invert = query.startsWith('^');\r\n    if(invert) query = query.slice(1);\r\n    query = query.toLowerCase().trim().split(' ').map(q => q.trim()).filter(q => !!q);\r\n    const count = yps._items\r\n      .map(item => {\r\n        const hideBecauseWatched = yps.hideWatched && item.watched;\r\n        let hide = hideBecauseWatched || !query[invert ? 'some' : 'every'](q => item.name.includes(q));\r\n        if(invert && !hideBecauseWatched) hide = !hide;\r\n        item.elem.style.display = hide ? 'none' : '';\r\n        return hide;\r\n      })\r\n      .filter(hide => !hide).length;\r\n    return [count, yps._items.length, invert];\r\n  },\r\n  start: () => {\r\n    util.log('Starting... waiting for playlist');\r\n    waitForUrl(/^https:\\/\\/www\\.youtube\\.com\\/(playlist\\?list=|(user|channel)\\/[^\\/]+\\/videos|feed\\/subscriptions).*/, () => {\r\n      util.log('Reached playlist, adding search box');\r\n      const playlistUrl = location.href;\r\n      const { txtSearch, resultCount } = yps.render();\r\n      const refresh = util.debounce(() => resultCount.render(...yps.search(txtSearch.value)), 50);\r\n      const itemWait = waitForElems({\r\n        sel: ITEM_SELECTOR, \r\n        onmatch: elem => {\r\n          yps._items.push({\r\n            elem,\r\n            name: util.q(TEXT_SELECTOR, elem).textContent.toLowerCase(),\r\n            watched: false\r\n          });\r\n          refresh();\r\n        }\r\n      });\r\n      const progressWait = waitForElems({\r\n        sel: ITEM_PROGRESS_SELECTOR, \r\n        onmatch: prog => {\r\n          const watched = parseInt(prog.style.width) > 50;\r\n          if(!watched) return;\r\n          const itemElem = prog.closest(ITEM_SELECTOR);\r\n          const found = yps._items.find(item => item.elem === itemElem);\r\n          if(!found) return console.log('error, unable to find item parent', prog, itemElem, found);\r\n          found.watched = watched;\r\n          if(yps.hideWatched && watched) refresh();\r\n        }\r\n      });\r\n      const urlWaitId = waitForUrl(url => url !== playlistUrl, () => {\r\n        util.log('leaving playlist, cleaning up');\r\n        [progressWait, itemWait, urlWaitId].forEach(wait => wait.stop && wait.stop() || clearInterval(wait));\r\n        [txtSearch, resultCount].forEach(elem => elem.remove());\r\n        yps._items = [];\r\n      }, true);\r\n    });\r\n  }\r\n};\r\n\r\nyps.start();\r\n\n\n//# sourceURL=webpack://userscripts/./src/youtube-playlist-search/youtube-playlist-search.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/youtube-playlist-search/youtube-playlist-search.user.js"]();
/******/ 	
/******/ })()
;