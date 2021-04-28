// ==UserScript==
// @name        gm_config_toolbar
// @version     0.0.4
// @author      kufii
// @description greasyfork configuration toolbar on the script addins
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/kufii/My-UserScripts
// @match       *://*/*
// @namespace   https://github.com/niubilityfrontend
// @license     OSL-3.0
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = [], _n = true, _d = false, _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

// ==UserScript==
// @name         gm_config_toolbar
// @version      0.0.4
// @namespace    https://github.com/niubilityfrontend
// @description  greasyfork configuration toolbar on the script addins
// @author       kufii
// @license      OSL-3.0
// @supportURL   https://github.com/kufii/My-UserScripts
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// ==/UserScript==
(function () {
  "use strict";

  window.GM_config = function (settings) {
    var storage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "cfg",
        ret = null,
        prefix = "gm-config",
        addStyle = function addStyle() {
      var css = "\n\t\t\t\t.".concat(prefix, " {\n\t\t\t\t\tdisplay: grid;\n\t\t\t\t\talign-items: center;\n\t\t\t\t\tgrid-row-gap: 5px;\n\t\t\t\t\tgrid-column-gap: 10px;\n\t\t\t\t\tbackground-color: white;\n\t\t\t\t\tborder: 1px solid black;\n\t\t\t\t\tpadding: 5px;\n\t\t\t\t\tposition: fixed;\n\t\t\t\t\ttop: 0;\n\t\t\t\t\tright: 0;\n\t\t\t\t\tz-index: 2147483647;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " label {\n\t\t\t\t\tgrid-column: 1 / 2;\n\t\t\t\t\tcolor: black;\n\t\t\t\t\ttext-align: right;\n\t\t\t\t\tfont-size: small;\n\t\t\t\t\tfont-weight: bold;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " input,\n\t\t\t\t.").concat(prefix, " textarea,\n\t\t\t\t.").concat(prefix, " select {\n\t\t\t\t\tgrid-column: 2 / 4;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " .").concat(prefix, "-save {\n\t\t\t\t\tgrid-column: 2 / 3;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " .").concat(prefix, "-cancel {\n\t\t\t\t\tgrid-column: 3 / 4;\n\t\t\t\t}\n\t\t\t");

      if (typeof GM_addStyle === "undefined") {
        var style = document.createElement("style");
        style.textContent = css;
        document.head.appendChild(style);
      } else {
        GM_addStyle(css);
      }
    },
        load = function load() {
      var defaults = {};
      settings.forEach(function (_ref) {
        var key = _ref.key,
            def = _ref["default"];
        return defaults[key] = def;
      });
      var cfg = typeof GM_getValue !== "undefined" ? GM_getValue(storage) : localStorage.getItem(storage);
      if (!cfg) return defaults;
      cfg = JSON.parse(cfg);
      Object.entries(defaults).forEach(function (_ref2) {
        var _ref3 = _slicedToArray(_ref2, 2),
            key = _ref3[0],
            value = _ref3[1];

        if (typeof cfg[key] === "undefined") {
          cfg[key] = value;
        }
      });
      return cfg;
    },
        save = function save(cfg) {
      var data = JSON.stringify(cfg);
      typeof GM_setValue !== "undefined" ? GM_setValue(storage, data) : localStorage.setItem(storage, data);
    },
        setup = function setup() {
      var createContainer = function createContainer() {
        var form = document.createElement("form");
        form.classList.add(prefix);
        return form;
      },
          createTextbox = function createTextbox(name, value, placeholder, maxLength, multiline, resize) {
        var input = document.createElement(multiline ? "textarea" : "input");

        if (multiline) {
          input.style.resize = resize ? "vertical" : "none";
        } else {
          input.type = "text";
        }

        input.name = name;
        if (typeof value !== "undefined") input.value = value;
        if (placeholder) input.placeholder = placeholder;
        if (maxLength) input.maxLength = maxLength;
        return input;
      },
          createNumber = function createNumber(name, value, placeholder, min, max, step) {
        var input = createTextbox(name, value, placeholder);
        input.type = "number";
        if (typeof min !== "undefined") input.min = min;
        if (typeof max !== "undefined") input.max = max;
        if (typeof step !== "undefined") input.step = step;
        return input;
      },
          createSelect = function createSelect(name, options, value, showBlank) {
        var select = document.createElement("select");
        select.name = name;

        var createOption = function createOption(val) {
          var _val$value = val.value,
              value = _val$value === void 0 ? val : _val$value,
              _val$text = val.text,
              text = _val$text === void 0 ? val : _val$text,
              option = document.createElement("option");
          option.value = value;
          option.textContent = text;
          return option;
        };

        if (showBlank) {
          select.appendChild(createOption(""));
        }

        options.forEach(function (opt) {
          if (typeof opt.optgroup !== "undefined") {
            var optgroup = document.createElement("optgroup");
            optgroup.label = opt.optgroup;
            select.appendChild(optgroup);
            opt.values.forEach(function (value) {
              return optgroup.appendChild(createOption(value));
            });
          } else {
            select.appendChild(createOption(opt));
          }
        });
        select.value = value;
        return select;
      },
          createCheckbox = function createCheckbox(name, checked) {
        var checkbox = document.createElement("input");
        checkbox.id = "".concat(prefix, "-").concat(name);
        checkbox.type = "checkbox";
        checkbox.name = name;
        checkbox.checked = checked;
        return checkbox;
      },
          createButton = function createButton(text, onclick, classname) {
        var button = document.createElement("button");
        button.classList.add("".concat(prefix, "-").concat(classname));
        button.textContent = text;
        button.onclick = onclick;
        return button;
      },
          createLabel = function createLabel(label, htmlFor) {
        var lbl = document.createElement("label");
        if (htmlFor) lbl.htmlFor = htmlFor;
        lbl.textContent = label;
        return lbl;
      },
          init = function init(cfg) {
        var controls = {},
            div = createContainer();
        settings.filter(function (_ref4) {
          var type = _ref4.type;
          return type !== "hidden";
        }).forEach(function (setting) {
          var value = cfg[setting.key],
              control;

          if (setting.type === "text") {
            control = createTextbox(setting.key, value, setting.placeholder, setting.maxLength, setting.multiline, setting.resizable);
          } else if (setting.type === "number") {
            control = createNumber(setting.key, value, setting.placeholder, setting.min, setting.max, setting.step);
          } else if (setting.type === "dropdown") {
            control = createSelect(setting.key, setting.values, value, setting.showBlank);
          } else if (setting.type === "bool") {
            control = createCheckbox(setting.key, value);
          }

          div.appendChild(createLabel(setting.label, control.id));
          div.appendChild(control);
          controls[setting.key] = control;
          control.addEventListener(setting.type === "dropdown" ? "change" : "input", function () {
            if (ret.onchange) {
              var control = controls[setting.key],
                  _value = setting.type === "bool" ? control.checked : control.value;

              ret.onchange(setting.key, _value);
            }
          });
        });
        div.appendChild(createButton("Save", function () {
          settings.filter(function (_ref5) {
            var type = _ref5.type;
            return type !== "hidden";
          }).forEach(function (_ref6) {
            var key = _ref6.key,
                type = _ref6.type,
                control = controls[key];
            cfg[key] = type === "bool" ? control.checked : control.value;
          });
          save(cfg);

          if (ret.onsave) {
            ret.onsave(cfg);
          }

          div.remove();
        }, "save"));
        div.appendChild(createButton("Cancel", function () {
          if (ret.oncancel) {
            ret.oncancel(cfg);
          }

          div.remove();
        }, "cancel"));
        document.body.appendChild(div);
      };

      init(load());
    };

    addStyle();
    ret = {
      load: load,
      save: save,
      setup: setup
    };
    return ret;
  };
})();
/******/ })()
;