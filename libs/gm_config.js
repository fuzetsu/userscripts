"use strict";

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
  'use strict';

  window.GM_config = function (settings) {
    let storage = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'cfg';
    let ret = null;
    const prefix = 'gm-config';

    const addStyle = function addStyle() {
      const css = "\n\t\t\t\t.".concat(prefix, " {\n\t\t\t\t\tdisplay: grid;\n\t\t\t\t\talign-items: center;\n\t\t\t\t\tgrid-row-gap: 5px;\n\t\t\t\t\tgrid-column-gap: 10px;\n\t\t\t\t\tbackground-color: white;\n\t\t\t\t\tborder: 1px solid black;\n\t\t\t\t\tpadding: 5px;\n\t\t\t\t\tposition: fixed;\n\t\t\t\t\ttop: 0;\n\t\t\t\t\tright: 0;\n\t\t\t\t\tz-index: 2147483647;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " label {\n\t\t\t\t\tgrid-column: 1 / 2;\n\t\t\t\t\tcolor: black;\n\t\t\t\t\ttext-align: right;\n\t\t\t\t\tfont-size: small;\n\t\t\t\t\tfont-weight: bold;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " input,\n\t\t\t\t.").concat(prefix, " textarea,\n\t\t\t\t.").concat(prefix, " select {\n\t\t\t\t\tgrid-column: 2 / 4;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " .").concat(prefix, "-save {\n\t\t\t\t\tgrid-column: 2 / 3;\n\t\t\t\t}\n\n\t\t\t\t.").concat(prefix, " .").concat(prefix, "-cancel {\n\t\t\t\t\tgrid-column: 3 / 4;\n\t\t\t\t}\n\t\t\t");

      if (typeof GM_addStyle === 'undefined') {
        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
      } else {
        GM_addStyle(css);
      }
    };

    const load = function load() {
      const defaults = {};
      settings.forEach(function (_ref) {
        let {
          key,
          default: def
        } = _ref;
        return defaults[key] = def;
      });
      let cfg = typeof GM_getValue !== 'undefined' ? GM_getValue(storage) : localStorage.getItem(storage);
      if (!cfg) return defaults;
      cfg = JSON.parse(cfg);
      Object.entries(defaults).forEach(function (_ref2) {
        let [key, value] = _ref2;

        if (typeof cfg[key] === 'undefined') {
          cfg[key] = value;
        }
      });
      return cfg;
    };

    const save = function save(cfg) {
      const data = JSON.stringify(cfg);
      typeof GM_setValue !== 'undefined' ? GM_setValue(storage, data) : localStorage.setItem(storage, data);
    };

    const setup = function setup() {
      const createContainer = function createContainer() {
        const form = document.createElement('form');
        form.classList.add(prefix);
        return form;
      };

      const createTextbox = function createTextbox(name, value, placeholder, maxLength, multiline, resize) {
        const input = document.createElement(multiline ? 'textarea' : 'input');

        if (multiline) {
          input.style.resize = resize ? 'vertical' : 'none';
        } else {
          input.type = 'text';
        }

        input.name = name;
        if (typeof value !== 'undefined') input.value = value;
        if (placeholder) input.placeholder = placeholder;
        if (maxLength) input.maxLength = maxLength;
        return input;
      };

      const createNumber = function createNumber(name, value, placeholder, min, max, step) {
        const input = createTextbox(name, value, placeholder);
        input.type = 'number';
        if (typeof min !== 'undefined') input.min = min;
        if (typeof max !== 'undefined') input.max = max;
        if (typeof step !== 'undefined') input.step = step;
        return input;
      };

      const createSelect = function createSelect(name, options, value, showBlank) {
        const select = document.createElement('select');
        select.name = name;

        const createOption = function createOption(val) {
          const {
            value = val,
            text = val
          } = val;
          const option = document.createElement('option');
          option.value = value;
          option.textContent = text;
          return option;
        };

        if (showBlank) {
          select.appendChild(createOption(''));
        }

        options.forEach(function (opt) {
          if (typeof opt.optgroup !== 'undefined') {
            const optgroup = document.createElement('optgroup');
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
      };

      const createCheckbox = function createCheckbox(name, checked) {
        const checkbox = document.createElement('input');
        checkbox.id = "".concat(prefix, "-").concat(name);
        checkbox.type = 'checkbox';
        checkbox.name = name;
        checkbox.checked = checked;
        return checkbox;
      };

      const createButton = function createButton(text, onclick, classname) {
        const button = document.createElement('button');
        button.classList.add("".concat(prefix, "-").concat(classname));
        button.textContent = text;
        button.onclick = onclick;
        return button;
      };

      const createLabel = function createLabel(label, htmlFor) {
        const lbl = document.createElement('label');
        if (htmlFor) lbl.htmlFor = htmlFor;
        lbl.textContent = label;
        return lbl;
      };

      const init = function init(cfg) {
        const controls = {};
        const div = createContainer();
        settings.filter(function (_ref3) {
          let {
            type
          } = _ref3;
          return type !== 'hidden';
        }).forEach(function (setting) {
          const value = cfg[setting.key];
          let control;

          if (setting.type === 'text') {
            control = createTextbox(setting.key, value, setting.placeholder, setting.maxLength, setting.multiline, setting.resizable);
          } else if (setting.type === 'number') {
            control = createNumber(setting.key, value, setting.placeholder, setting.min, setting.max, setting.step);
          } else if (setting.type === 'dropdown') {
            control = createSelect(setting.key, setting.values, value, setting.showBlank);
          } else if (setting.type === 'bool') {
            control = createCheckbox(setting.key, value);
          }

          div.appendChild(createLabel(setting.label, control.id));
          div.appendChild(control);
          controls[setting.key] = control;
          control.addEventListener(setting.type === 'dropdown' ? 'change' : 'input', function () {
            if (ret.onchange) {
              const control = controls[setting.key];
              const value = setting.type === 'bool' ? control.checked : control.value;
              ret.onchange(setting.key, value);
            }
          });
        });
        div.appendChild(createButton('Save', function () {
          settings.filter(function (_ref4) {
            let {
              type
            } = _ref4;
            return type !== 'hidden';
          }).forEach(function (_ref5) {
            let {
              key,
              type
            } = _ref5;
            const control = controls[key];
            cfg[key] = type === 'bool' ? control.checked : control.value;
          });
          save(cfg);

          if (ret.onsave) {
            ret.onsave(cfg);
          }

          div.remove();
        }, 'save'));
        div.appendChild(createButton('Cancel', function () {
          if (ret.oncancel) {
            ret.oncancel(cfg);
          }

          div.remove();
        }, 'cancel'));
        document.body.appendChild(div);
      };

      init(load());
    };

    addStyle();
    ret = {
      load,
      save,
      setup
    };
    return ret;
  };
})();