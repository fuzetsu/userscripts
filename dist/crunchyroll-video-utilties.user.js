// ==UserScript==
// @name Crunchyroll Video Utilities
// @version 1.0.5
// @description seek video with hotkeys and set default quality
// @homepage https://github.com/niubilityfrontend/userscripts#readme
// @supportURL https://github.com/niubilityfrontend/userscripts/issues
// @match https://static.crunchyroll.com/*/player.html
// @match https://www.crunchyroll.com/*
// @namespace fuzetsu/csdvqn
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @require https://gitcdn.xyz/cdn/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require https://gitcdn.xyz/cdn/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
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

/***/ "./src/crunchyroll-video-utilities/crunchyroll-video-utilties.user.js":
/*!****************************************************************************!*\
  !*** ./src/crunchyroll-video-utilities/crunchyroll-video-utilties.user.js ***!
  \****************************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name Crunchyroll Video Utilities\r\n// @version 1.0.5\r\n// @namespace fuzetsu/csdvqn\r\n// @description seek video with hotkeys and set default quality\r\n// @match https://static.crunchyroll.com/*/player.html\r\n// @match https://www.crunchyroll.com/*\r\n// @grant GM_registerMenuCommand\r\n// @grant GM_getValue\r\n// @grant GM_setValue\r\n// @require https://gitcdn.xyz/cdn/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js\r\n// @require https://gitcdn.xyz/cdn/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js\r\n// ==/UserScript==\r\n/* globals unsafeWindow, GM_config, GM_registerMenuCommand, waitForElems */\r\nconst sep = '~~@~~'\r\nconst domain = 'https://www.crunchyroll.com'\r\nconst CSS = {\r\n  quality: '.qualityMenuItemSelector',\r\n  settings: '.settingsMenuButton,#settingsControl',\r\n  playerBox: '#showmedia_video_player'\r\n}\r\n\r\n// use publicly exposed Player.js object to control video player\r\nconst vilosPlayer = () => unsafeWindow.VILOS_PLAYERJS\r\n\r\nconst qq = (q, c) => Array.from((c || document).querySelectorAll(q))\r\nconst q = (q, c) => (c || document).querySelector(q)\r\n\r\nconst config = GM_config([\r\n  {\r\n    key: 'quality',\r\n    label: 'Quality',\r\n    type: 'dropdown',\r\n    values: ['auto', 360, 480, 720, 1080],\r\n    default: 'auto'\r\n  }\r\n])\r\n\r\nlet cfg = config.load()\r\n\r\nconfig.onsave = newCfg => {\r\n  cfg = newCfg\r\n  player.setQuality(cfg.quality)\r\n}\r\n\r\nconst p = (...args) => (console.log(...args), args[0])\r\n\r\nlet isFullscreen = false\r\n\r\nconst player = {\r\n  setQuality: quality => {\r\n    const btn =\r\n      quality !== 'auto'\r\n        ? qq(CSS.quality)\r\n            .slice(2)\r\n            .find(item => quality >= parseInt(item.textContent))\r\n        : qq(CSS.quality)[2]\r\n    if (btn) {\r\n      // this causes the menu to open\r\n      btn.click()\r\n      // so close it after a short delay\r\n      setTimeout(player.toggleSettings, 200, false)\r\n    }\r\n  },\r\n  fillTab: () => {\r\n    const playerBox = q(CSS.playerBox)\r\n    if (!playerBox) return p('playerbox not found')\r\n    isFullscreen = !isFullscreen\r\n    if (!isFullscreen) return playerBox.removeAttribute('style')\r\n    Object.assign(playerBox.style, {\r\n      position: 'fixed',\r\n      zIndex: 1000,\r\n      top: 0,\r\n      bottom: 0,\r\n      left: 0,\r\n      right: 0,\r\n      width: '100%',\r\n      height: '100%'\r\n    })\r\n  },\r\n  nextEp: (back = false) =>\r\n    q('.collection-carousel-media-link-current')\r\n      .parentElement[back ? 'previousElementSibling' : 'nextElementSibling'].querySelector('a')\r\n      .click(),\r\n  prevEp: () => player.nextEp(true),\r\n  skip: sec => vilosPlayer().getCurrentTime(curTime => vilosPlayer().setCurrentTime(curTime + sec)),\r\n  volumeUp: (val = 10) => vilosPlayer().getVolume(curVol => vilosPlayer().setVolume(curVol + val)),\r\n  volumeDown: (val = -10) => player.volumeUp(val),\r\n  toggleSettings: makeVisible => {\r\n    const btn = q(CSS.settings)\r\n    if (typeof makeVisible === 'boolean') {\r\n      const isVisible = p(!!btn.offSetParent, '=== isVisible')\r\n      if (makeVisible === isVisible) return\r\n    }\r\n    btn.click()\r\n  }\r\n}\r\n\r\nconst seekKeys = {\r\n  l: 85,\r\n  b: -85,\r\n  '}': 30,\r\n  '{': -30,\r\n  ']': 15,\r\n  '[': -15\r\n}\r\n\r\nconst handleKey = key =>\r\n  key === 'n'\r\n    ? player.nextEp()\r\n    : key === 'p'\r\n    ? player.prevEp()\r\n    : key === 'j'\r\n    ? player.volumeDown()\r\n    : key === 'k'\r\n    ? player.volumeUp()\r\n    : key === 'w'\r\n    ? player.fillTab()\r\n    : key in seekKeys\r\n    ? player.skip(seekKeys[key])\r\n    : null\r\n\r\nconst isPlayerFrame = location.href.includes('static.crunchyroll.com')\r\n\r\n/**\r\n * Keyboard events from within the player frame dont bubble up to main page where the player.js\r\n * object and the video links live, so use postMessage to send the keypresses there\r\n **/\r\nconst pass = ['INPUT', 'TEXTAREA', 'SELECT']\r\nwindow.addEventListener(\r\n  'keydown',\r\n  isPlayerFrame\r\n    ? e => window.parent.postMessage(sep + e.key, domain)\r\n    : e => pass.includes(document.activeElement.nodeName) || handleKey(e.key)\r\n)\r\n\r\nif (isPlayerFrame) {\r\n  // can only set quality from the player frame since the button is in its dom\r\n  waitForElems({\r\n    stop: true,\r\n    sel: CSS.quality + '.selected',\r\n    onmatch: elem => {\r\n      if (elem.textContent.toLowerCase().includes(cfg.quality))\r\n        return p('configured default already selected')\r\n      player.setQuality(cfg.quality)\r\n    }\r\n  })\r\n} else {\r\n  // handle forwarded keyboard from player frame\r\n  window.addEventListener(\r\n    'message',\r\n    ({ data }) => data.startsWith(sep) && handleKey(data.slice(sep.length))\r\n  )\r\n}\r\n\r\nGM_registerMenuCommand('Crunchyroll Video Utilities - Config', config.setup)\r\n\n\n//# sourceURL=webpack://userscripts/./src/crunchyroll-video-utilities/crunchyroll-video-utilties.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/crunchyroll-video-utilities/crunchyroll-video-utilties.user.js"]();
/******/ 	
/******/ })()
;