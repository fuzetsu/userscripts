'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

// ==UserScript==
// @name         jsProxyTestPropertiesCaseinsensive
// @version      2019.12.20
// @namespace    https://github.com/niubilityfrontend
// @description
// @author       jimbo
// @license      OSL-3.0
// @supportURL   https://github.com/niubilityfrontend/hunttingteacheron51talk
// @match        *:*/*
// @match        *127.0.0.1*:*/*
// @match        *localhost*:*/*
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/pace/1.0.2/pace.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/i18n/grid.locale-cn.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/jquery.jqgrid.min.js
// @require      https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// @require      https://greasyfork.org/scripts/389774-gm-config-toolbar/code/gm_config_toolbar.js?version=730739
// ==/UserScript==
//'use strict';
var PropertiesCaseInsensitive = {
  has: function has(target, prop) {
    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'symbol') {
      return prop in target; // pass through; or 'return;' if you want to block pass through
    }
    prop = prop.toLowerCase();
    if (prop in target) return true;
    var keys = Object.keys(target);
    var i = keys.length - 1;
    while (i--) {
      if (keys[i].toLowerCase() == prop) return true;
    }
    return false;
  },
  get: function get(target, prop, receiver) {
    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'symbol') {
      return target[prop];
    }
    prop = prop.toLowerCase();
    if (prop in target) return target[prop];
    var keys = Object.keys(target);
    var i = keys.length - 1;
    while (i--) {
      if (keys[i].toLowerCase() == prop) return target[keys[i]];
    }
    return undefined;
  },
  set: function set(target, prop, value) {
    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'symbol') {
      target[prop] = value;
    }
    target[prop.toLowerCase()] = value;
    return true;
  }
};

function myFunction() {
  var Foo = '333';
  var wwww = 'wwww';
  var obj1 = { Foo: Foo, wwww: wwww };
  obj1['sSs'] = 'sssss';
  // alert(Proxy);
  var obj = new Proxy(obj1, PropertiesCaseInsensitive);
  obj1.vvv = 'vvvvv';
  obj.oooo = 'ooooo';
  //  alert(obj);
  console.log(' ' + new Date() + '.<br> ' + obj.foo + ' <br>\n   ' + obj.VVV + ' <br>\n    ' + obj.OooO + ' <br>\n     ' + obj.OO + ' <br>\n\n\n  ');
}
myFunction();
//# sourceMappingURL=jsProxyTestPropertiesCaseinsensive.user.js.map