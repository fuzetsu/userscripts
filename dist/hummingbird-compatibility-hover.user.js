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

/***/ "./src/hummingbird-compatibility-hover/hummingbird-compatibility-hover.user.js":
/*!*************************************************************************************!*\
  !*** ./src/hummingbird-compatibility-hover/hummingbird-compatibility-hover.user.js ***!
  \*************************************************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Hummingbird Compatibility Hover\r\n// @namespace    http://fuzetsu.com/hch\r\n// @version      1.0.4\r\n// @description  Shows hummingbird user compatibility rating at the bottom right of the screen when a user link is hovered over\r\n// @author       fuzetsu\r\n// @match        *://hummingbird.me/*\r\n// @match        *://forums.hummingbird.me/*\r\n// @grant        none\r\n// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?1\r\n// @deprecated   true\r\n// ==/UserScript==\r\n\r\nvar SCRIPT_NAME = 'Hummingbird Compatibility Hover';\r\nvar COMPAT_ID = 'hb-compat-area';\r\nvar LOAD_GIF = 'https://i.imgur.com/gX1lY9z.gif';\r\nvar DELAY_SEC = 0.75;\r\nvar CACHED = {};\r\n\r\nvar Util = {\r\n  log: function() {\r\n    var args = [].slice.call(arguments);\r\n    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');\r\n    console.log.apply(console, args);\r\n  },\r\n  q: function(query, context) {\r\n    return (context || document).querySelector(query);\r\n  },\r\n  qq: function(query, context) {\r\n    return [].slice.call((context || document).querySelectorAll(query));\r\n  },\r\n  getJSON: function(url, load, error) {\r\n    var xhr = new XMLHttpRequest();\r\n    xhr.open('get', url);\r\n    xhr.responseType = 'json';\r\n    xhr.onload = function() {\r\n      load(xhr.response);\r\n    };\r\n    xhr.onerror = error;\r\n    xhr.send();\r\n  },\r\n  _style: document.head.appendChild(document.createElement('style')),\r\n  addStyle: function(styles) {\r\n    var sel, css, obj;\r\n    var out = '';\r\n    for (sel in styles) {\r\n      obj = styles[sel];\r\n      out += sel + '{';\r\n      for (css in obj) {\r\n        out += css + ':' + obj[css] + ';';\r\n      }\r\n      out += '}';\r\n    }\r\n    this._style.textContent += out;\r\n  }\r\n};\r\n\r\nvar hb = {\r\n  getUserName: function(url) {\r\n    return url.match(/\\/users\\/([a-z0-9_]+)/i)[1];\r\n  }\r\n};\r\n\r\nvar App = {\r\n  userLinkRegex: /^https?:\\/\\/(forums\\.)?hummingbird\\.me\\/users\\/[^\\/]+\\/?(\\?.*)?$/,\r\n\r\n  styleUI: function() {\r\n    var style = {\r\n      '.hb-visible': {\r\n        'visibility': 'visible',\r\n        'opacity': 1,\r\n        'transition': 'opacity .5s linear'\r\n      },\r\n      '.hb-hidden': {\r\n        'visibility': 'hidden',\r\n        'opacity': 0,\r\n        'transition': 'visibility 0s .5s, opacity .5s linear'\r\n      },\r\n      '.hb-compat-percent': {\r\n        'font-size': '32px',\r\n        'font-weight': 'bold',\r\n        'margin': '5px 10px 10px 10px'\r\n      },\r\n      '.hb-compat-header': {\r\n        'font-size': '24px',\r\n        'margin': '20px 10px 10px 10px'\r\n      }\r\n    };\r\n    var id = '#' + COMPAT_ID;\r\n    style[id] = {\r\n      'font-family': '\"Helvetica Neue\", Helvetica, Arial, \"Lucida Grande\", sans-serif',\r\n      'position': 'fixed',\r\n      'background': 'white',\r\n      'text-align': 'center',\r\n      'box-shadow': '0px 0px 15px 0px rgba(0,0,0,0.75)',\r\n      'border-top-left-radius': '5px',\r\n      'max-width': '90%',\r\n      'bottom': '0',\r\n      'right': '0',\r\n      'z-index': '10000',\r\n      'line-height': '32px'\r\n    };\r\n    style[id + ' img'] = {\r\n      'margin': '20px 50px 20px 50px'\r\n    };\r\n    Util.addStyle(style);\r\n  },\r\n\r\n  getCompatArea: function() {\r\n    var compatArea = Util.q('#' + COMPAT_ID);\r\n\r\n    if (!compatArea) {\r\n      compatArea = document.createElement('div');\r\n      compatArea.id = COMPAT_ID;\r\n      compatArea.style.display = 'none';\r\n      document.body.appendChild(compatArea);\r\n    }\r\n\r\n    return compatArea;\r\n  },\r\n\r\n  getCompatHTML: function(compat) {\r\n    return '<h3 class=\"hb-compat-header\">Compatibility is ' + compat.phrase + '</h3><div class=\"hb-compat-percent\" style=\"color: ' + compat.color + '\">' + compat.percent + '</div>';\r\n  },\r\n\r\n  showCompat: function(me, them) {\r\n    if (me === them) return;\r\n    if (Util.q('.signup-cta')) return; // not signed in\r\n\r\n    var self = this;\r\n    var area = this.getCompatArea();\r\n\r\n    var cache = CACHED[me + '+' + them];\r\n    if (cache) {\r\n      area.innerHTML = self.getCompatHTML(cache);\r\n    } else {\r\n      area.innerHTML = '<img src=\"' + LOAD_GIF + '\" />';\r\n      Util.getJSON('https://hbird-cmp-node.herokuapp.com/compatibility/anime?user1=' + me + '&user2=' + them, function(compat) {\r\n        CACHED[me + '+' + them] = compat;\r\n        area.innerHTML = self.getCompatHTML(compat);\r\n      });\r\n    }\r\n    area.style.display = '';\r\n    setTimeout(function() {\r\n      area.className = 'hb-visible';\r\n    }, 0);\r\n  },\r\n\r\n  hideCompat: function() {\r\n    var area = this.getCompatArea();\r\n    area.className = 'hb-hidden';\r\n    setTimeout(function() {\r\n      area.style.display = 'none';\r\n    }, 500);\r\n  },\r\n\r\n  _timeout: null,\r\n  startHover: function(e) {\r\n    App._timeout = setTimeout(function() {\r\n      App._timeout = null;\r\n      App.showCompat(hb.getUserName(Util.q('.dropdown-menu > li > a, #current-user > a').href), hb.getUserName(e.target.href));\r\n    }, DELAY_SEC * 1000);\r\n  },\r\n  stopHover: function(e) {\r\n    clearInterval(App._timeout);\r\n    App.hideCompat();\r\n  },\r\n\r\n  start: function() {\r\n    var self = this;\r\n    Util.log('starting...');\r\n    self.styleUI();\r\n    waitForElems('a', function(link) {\r\n      if (self.userLinkRegex.test(link.href)) {\r\n        link.addEventListener('mouseenter', self.startHover);\r\n        link.addEventListener('mouseleave', self.stopHover);\r\n        link.addEventListener('click', self.stopHover);\r\n      }\r\n    });\r\n  }\r\n\r\n};\r\n\r\nApp.start();\r\n\n\n//# sourceURL=webpack://userscripts/./src/hummingbird-compatibility-hover/hummingbird-compatibility-hover.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/hummingbird-compatibility-hover/hummingbird-compatibility-hover.user.js"]();
/******/ 	
/******/ })()
;