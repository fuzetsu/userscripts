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
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/prettier-anything/prettier-anything.user.js":
/*!*********************************************************!*\
  !*** ./src/prettier-anything/prettier-anything.user.js ***!
  \*********************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Prettier Anything\r\n// @namespace    prettier-anything\r\n// @author       fuzetsu\r\n// @version      0.1.4\r\n// @description  Apply prettier formatting to any text input\r\n// @match        *://*/*\r\n// @inject-into  content\r\n// @grant        GM_setClipboard\r\n// @grant        GM_xmlhttpRequest\r\n// @grant        GM_getValue\r\n// @grant        GM_setValue\r\n// @grant        GM_registerMenuCommand\r\n// @require      https://cdn.jsdelivr.net/gh/kufii/My-UserScripts@00302ac8bd875599ed97df07b379b58f9b4932bd/libs/gm_config.js\r\n// ==/UserScript==\r\n/* global prettier prettierPlugins GM_setClipboard GM_xmlhttpRequest GM_registerMenuCommand GM_config */\r\n\r\n\r\n\r\nconst deps = [\r\n  'https://unpkg.com/prettier@2/standalone.js',\r\n  'https://unpkg.com/prettier@2/parser-babel.js'\r\n]\r\n\r\nconst loadDep = url =>\r\n  new Promise((resolve, reject) => {\r\n    GM_xmlhttpRequest({\r\n      method: 'GET',\r\n      url,\r\n      onload: res => resolve(res.responseText),\r\n      onerror: () => reject(new Error(`Failed to load ${url}`))\r\n    })\r\n  })\r\n\r\nconst Config = GM_config([\r\n  {\r\n    key: 'prettierrc',\r\n    label: 'Prettier Config',\r\n    default: '{}',\r\n    type: 'text',\r\n    multiline: true,\r\n    resizable: true\r\n  },\r\n  {\r\n    key: 'binding',\r\n    label: 'Key Binding',\r\n    type: 'keybinding',\r\n    default: { altKey: true, shiftKey: true, key: 'I' },\r\n    requireModifier: true,\r\n    requireKey: true\r\n  },\r\n  {\r\n    key: 'copyBinding',\r\n    label: 'Copy Key Binding',\r\n    type: 'keybinding',\r\n    default: { ctrlKey: true, altKey: true, shiftKey: true, key: 'I' },\r\n    requireModifier: true,\r\n    requireKey: true\r\n  }\r\n])\r\nGM_registerMenuCommand('Prettier Anywhere Settings', () => {\r\n  if (window.top === window.self) Config.setup()\r\n})\r\nlet config = Config.load()\r\nConfig.onsave = cfg => (config = cfg)\r\n\r\nconst p = (...args) => (console.log(...args), args[0])\r\n\r\nlet loaded = false\r\nconst load = () => {\r\n  if (loaded) return\r\n  loaded = true\r\n  return Promise.all(deps.map(loadDep)).then(scripts => scripts.map(eval)) // eslint-disable-line no-eval\r\n}\r\n\r\nconst getSelection = () => {\r\n  const elem = document.activeElement\r\n  if (['INPUT', 'TEXTAREA'].includes(elem.nodeName)) {\r\n    return elem.value.slice(elem.selectionStart, elem.selectionEnd)\r\n  } else if (elem.contentEditable) {\r\n    if (!document.getSelection().toString()) return\r\n    document.execCommand('copy')\r\n    return navigator.clipboard.readText()\r\n  } else return document.getSelection().toString()\r\n}\r\n\r\nconst insertText = text => {\r\n  const elem = document.activeElement\r\n  if (typeof InstallTrigger !== 'undefined' && ['INPUT', 'TEXTAREA'].includes(elem.nodeName)) {\r\n    elem.value =\r\n      elem.value.slice(0, elem.selectionStart) + text + elem.value.slice(elem.selectionEnd)\r\n  } else {\r\n    document.execCommand('insertText', false, text)\r\n  }\r\n}\r\n\r\nconst prettify = async clip => {\r\n  const code = getSelection()\r\n  p('key combo HIT, selection = ', code, '; clip = ', clip)\r\n  if (!code) return p('no selection, so nothing to do')\r\n  p('--- PRETTIER START ---')\r\n\r\n  p('Loading Prettier')\r\n  const loadStart = Date.now()\r\n  await load()\r\n  p('Loaded, delta = ', Date.now() - loadStart)\r\n\r\n  const conf = {\r\n    ...JSON.parse(config.prettierrc || '{}'),\r\n    parser: 'babel',\r\n    plugins: prettierPlugins\r\n  }\r\n  p('formatting using conf:', conf)\r\n\r\n  const formatted = prettier.format(code, conf)\r\n  if (clip) GM_setClipboard(formatted)\r\n  else insertText(formatted)\r\n\r\n  document.getSelection().empty()\r\n\r\n  p('BEFORE:\\n', code)\r\n  p('AFTER:\\n', formatted)\r\n  p('--- PRETTIER END ---')\r\n}\r\n\r\nconst keyBindingsMatch = (a, b) =>\r\n  !a.ctrlKey === !b.ctrlKey &&\r\n  !a.altKey === !b.altKey &&\r\n  !a.shiftKey === !b.shiftKey &&\r\n  !a.metaKey === !b.metaKey &&\r\n  a.key.toUpperCase() === b.key.toUpperCase()\r\n\r\nwindow.addEventListener('keydown', e => {\r\n  if (keyBindingsMatch(e, config.binding)) {\r\n    e.preventDefault()\r\n    prettify()\r\n  } else if (keyBindingsMatch(e, config.copyBinding)) {\r\n    e.preventDefault()\r\n    prettify(true)\r\n  }\r\n})\r\n\n\n//# sourceURL=webpack://userscripts/./src/prettier-anything/prettier-anything.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/prettier-anything/prettier-anything.user.js"]();
/******/ 	
/******/ })()
;