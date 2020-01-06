// ==UserScript==
// @name         jsProxyTestPropertiesCaseinsensitive
// @version      2019.12.20
// @namespace    https://github.com/niubilityfrontend
// @description
// @author       jimbo
// @license      OSL-3.0
// @supportURL   https://github.com/niubilityfrontend/
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
let jquery = require('jquery');
let $ = new jquery();
let PropertiesCaseInsensitiveProxyHandler = {
  has: function has(target, prop) {
    if(typeof prop === 'symbol') {
      return prop in target; // pass through; or 'return;' if you want to block pass through
    }
    prop = prop.toLowerCase();
    if(prop in target) return true;
    var keys = Object.keys(target);
    var i = keys.length - 1;
    while(i--) {
      if(keys[i].toLowerCase() == prop) return true;
    }
    return false;
  },
  get: function get(target, prop, receiver) {
    if(typeof prop === 'symbol') { return target[prop]; }
    prop = prop.toLowerCase();
    if(prop in target) return target[prop];
    var keys = Object.keys(target);
    var i = keys.length - 1;
    while(i--) {
      if(keys[i].toLowerCase() == prop) return target[keys[i]];
    }
    return undefined;
  },
  set: function set(target, prop, value) {
    if(typeof prop === 'symbol') {
      target[prop] = value;
    }
    target[prop.toLowerCase()] = value;
    return true;
  }
};
let getPaddedComp = comp => parseInt(comp) < 10 ? '0' + comp : comp,
  o = {
    "[y|Y]{4}": date => date.getFullYear(), // year
    "[y|Y]{2}": date => date.getFullYear().toString().slice(2), // year
    "MM": date => getPaddedComp(date.getMonth() + 1), //month
    "M": date => date.getMonth() + 1, //month
    "[d|D]{2}": date => getPaddedComp(date.getDate()), //day
    "[d|D]{1}": date => date.getDate(), //day
    "h{2}": date => getPaddedComp(
      (date.getHours() > 12) ? date.getHours() % 12 : date.getHours()), //hour
    "h{1}": date => (date.getHours() > 12) ? date.getHours() % 12 : date.getHours(), //hour
    "H{2}": date => getPaddedComp(date.getHours()), //hour
    "H{1}": date => date.getHours(), //hour
    "m{2}": date => getPaddedComp(date.getMinutes()), //minute
    "m{1}": date => date.getMinutes(), //minute
    "s+": date => getPaddedComp(date.getSeconds()), //second
    "f+": date => getPaddedComp(date.getMilliseconds()), //millisecond,
    "b+": date => (date.getHours() >= 12) ? 'PM' : 'AM'
  };
$.extend(Date.prototype, {
  toString: function(format) {
    let formattedDate = format;
    for(let k in o) {
      if(new RegExp("(" + k + ")").test(format)) {
        formattedDate = formattedDate.replace(RegExp.$1, o[k](this));
      }
    }
    return formattedDate;
  }
});

function myFunction() {
  var Foo = 'Fooo';
  var wwww = 'wwww';
  var obj1 = { Foo, wwww };
  obj1['sSs'] = 'sssss';
  // alert(Proxy);
  var obj = new Proxy(obj1, PropertiesCaseInsensitiveProxyHandler);
  obj1.vvv = 'vvvv';
  obj.oooo = 'ooooo';
  //  alert(obj);
  console.log(`
${new Date()}
${obj.foo}
${obj.VVV}
${obj.OooO}
${obj.OO}
  `);
  console.log('-----------------------')
  var formaters = [];
  var i = formaters.length;
  var dt = new Date();
  while(i--) {
    let f = formaters[i];
    console.log(`----------
      ${f}  =》 ${dt.toString(f)}
    `);
  }
}
myFunction();
