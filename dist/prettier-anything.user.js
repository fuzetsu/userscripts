// ==UserScript==
// @name        Prettier Anything
// @version     0.1.4
// @author      fuzetsu
// @description Apply prettier formatting to any text input
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*
// @namespace   prettier-anything
// @inject-into content
// @grant       GM_setClipboard
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_registerMenuCommand
// @require     https://cdn.jsdelivr.net/gh/kufii/My-UserScripts@00302ac8bd875599ed97df07b379b58f9b4932bd/libs/gm_config.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// ==UserScript==
// @name         Prettier Anything
// @namespace    prettier-anything
// @author       fuzetsu
// @version      0.1.4
// @description  Apply prettier formatting to any text input
// @match        *://*/*
// @inject-into  content
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.jsdelivr.net/gh/kufii/My-UserScripts@00302ac8bd875599ed97df07b379b58f9b4932bd/libs/gm_config.js
// ==/UserScript==

/* global prettier prettierPlugins GM_setClipboard GM_xmlhttpRequest GM_registerMenuCommand GM_config */


function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1, source; i < arguments.length; i++) { source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg), value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

var deps = ['https://unpkg.com/prettier@2/standalone.js', 'https://unpkg.com/prettier@2/parser-babel.js'],
    loadDep = function loadDep(url) {
  return new Promise(function (resolve, reject) {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      onload: function onload(res) {
        return resolve(res.responseText);
      },
      onerror: function onerror() {
        return reject(new Error("Failed to load ".concat(url)));
      }
    });
  });
},
    Config = GM_config([{
  key: 'prettierrc',
  label: 'Prettier Config',
  "default": '{}',
  type: 'text',
  multiline: true,
  resizable: true
}, {
  key: 'binding',
  label: 'Key Binding',
  type: 'keybinding',
  "default": {
    altKey: true,
    shiftKey: true,
    key: 'I'
  },
  requireModifier: true,
  requireKey: true
}, {
  key: 'copyBinding',
  label: 'Copy Key Binding',
  type: 'keybinding',
  "default": {
    ctrlKey: true,
    altKey: true,
    shiftKey: true,
    key: 'I'
  },
  requireModifier: true,
  requireKey: true
}]);

GM_registerMenuCommand('Prettier Anywhere Settings', function () {
  if (window.top === window.self) Config.setup();
});
var config = Config.load();

Config.onsave = function (cfg) {
  return config = cfg;
};

var p = function p() {
  var _console;

  return (_console = console).log.apply(_console, arguments), arguments.length <= 0 ? undefined : arguments[0];
},
    loaded = false,
    load = function load() {
  if (loaded) return;
  loaded = true;
  return Promise.all(deps.map(loadDep)).then(function (scripts) {
    return scripts.map(eval);
  }); // eslint-disable-line no-eval
},
    getSelection = function getSelection() {
  var elem = document.activeElement;

  if (['INPUT', 'TEXTAREA'].includes(elem.nodeName)) {
    return elem.value.slice(elem.selectionStart, elem.selectionEnd);
  } else if (elem.contentEditable) {
    if (!document.getSelection().toString()) return;
    document.execCommand('copy');
    return navigator.clipboard.readText();
  } else return document.getSelection().toString();
},
    insertText = function insertText(text) {
  var elem = document.activeElement;

  if (typeof InstallTrigger !== 'undefined' && ['INPUT', 'TEXTAREA'].includes(elem.nodeName)) {
    elem.value = elem.value.slice(0, elem.selectionStart) + text + elem.value.slice(elem.selectionEnd);
  } else {
    document.execCommand('insertText', false, text);
  }
},
    prettify = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(clip) {
    var code, loadStart, conf, formatted;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            code = getSelection();
            p('key combo HIT, selection = ', code, '; clip = ', clip);

            if (code) {
              _context.next = 4;
              break;
            }

            return _context.abrupt("return", p('no selection, so nothing to do'));

          case 4:
            p('--- PRETTIER START ---');
            p('Loading Prettier');
            loadStart = Date.now();
            _context.next = 9;
            return load();

          case 9:
            p('Loaded, delta = ', Date.now() - loadStart);
            conf = _objectSpread(_objectSpread({}, JSON.parse(config.prettierrc || '{}')), {}, {
              parser: 'babel',
              plugins: prettierPlugins
            });
            p('formatting using conf:', conf);
            formatted = prettier.format(code, conf);
            if (clip) GM_setClipboard(formatted);else insertText(formatted);
            document.getSelection().empty();
            p('BEFORE:\n', code);
            p('AFTER:\n', formatted);
            p('--- PRETTIER END ---');

          case 18:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function prettify(_x) {
    return _ref.apply(this, arguments);
  };
}(),
    keyBindingsMatch = function keyBindingsMatch(a, b) {
  return !a.ctrlKey === !b.ctrlKey && !a.altKey === !b.altKey && !a.shiftKey === !b.shiftKey && !a.metaKey === !b.metaKey && a.key.toUpperCase() === b.key.toUpperCase();
};

window.addEventListener('keydown', function (e) {
  if (keyBindingsMatch(e, config.binding)) {
    e.preventDefault();
    prettify();
  } else if (keyBindingsMatch(e, config.copyBinding)) {
    e.preventDefault();
    prettify(true);
  }
});
/******/ })()
;