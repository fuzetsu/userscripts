'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _jquery = require('jquery');

var window = {};

// export for others scripts to use
// window.$ = $;
// window.jQuery = jQuery;
//重载类型方法
var caseInsensitiveProxyHandler = {
  has: function has(target, prop) {
    if ((typeof prop === 'undefined' ? 'undefined' : _typeof(prop)) === 'symbol') {
      return prop in target; // pass through; or 'return;' if you want to block pass through
    }
    prop = prop.toLowerCase();
    if (prop in target) return true;
    var keys = Object.keys(target);
    var i = keys.length;
    while (i--) {
      if (keys[i] && keys[i].toLowerCase() == prop) return true;
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
    var i = keys.length;
    while (i--) {
      if (keys[i] && keys[i].toLowerCase() == prop) return target[keys[i]];
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
var getPaddedComp = function getPaddedComp(comp) {
  return parseInt(comp) < 10 ? '0' + comp : comp;
},
    o = {
  "[y|Y]{4}": function yY4(date) {
    return date.getFullYear();
  }, // year
  "[y|Y]{2}": function yY2(date) {
    return date.getFullYear().toString().slice(2);
  }, // year
  "MM": function MM(date) {
    return getPaddedComp(date.getMonth() + 1);
  }, //month
  "M": function M(date) {
    return date.getMonth() + 1;
  }, //month
  "[d|D]{2}": function dD2(date) {
    return getPaddedComp(date.getDate());
  }, //day
  "[d|D]{1}": function dD1(date) {
    return date.getDate();
  }, //day
  "h{2}": function h2(date) {
    return getPaddedComp(date.getHours() > 12 ? date.getHours() % 12 : date.getHours());
  }, //hour
  "h{1}": function h1(date) {
    return date.getHours() > 12 ? date.getHours() % 12 : date.getHours();
  }, //hour
  "H{2}": function H2(date) {
    return getPaddedComp(date.getHours());
  }, //hour
  "H{1}": function H1(date) {
    return date.getHours();
  }, //hour
  "m{2}": function m2(date) {
    return getPaddedComp(date.getMinutes());
  }, //minute
  "m{1}": function m1(date) {
    return date.getMinutes();
  }, //minute
  "s+": function s(date) {
    return getPaddedComp(date.getSeconds());
  }, //second
  "f+": function f(date) {
    return getPaddedComp(date.getMilliseconds());
  }, //millisecond,
  "b+": function b(date) {
    return date.getHours() >= 12 ? 'PM' : 'AM';
  }
};
_jquery.$.extend(Date.prototype, {
  toString: function toString(format) {
    var formattedDate = format;
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(format)) {
        formattedDate = formattedDate.replace(RegExp.$1, o[k](this));
      }
    }
    return formattedDate;
  }
});
//删除数组中的空元素
_jquery.$.extend(Array.prototype, {
  clean: function clean() {
    var deleteValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

    for (var i = 0; i < this.length; i++) {
      if (this[i] == deleteValue) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  }
});
_jquery.$.extend(Number.prototype, {
  toString: function toString(num) {
    if (isNaN(num)) num = 2;
    return this.toFixed(num);
  }
});
_jquery.$.extend(String.prototype, {
  toFloat: function toFloat() {
    return parseFloat(this);
  },
  toInt: function toInt() {
    return parseInt(this);
  },
  startsWith: function startsWith(str) {
    return this.slice(0, str.length) == str;
  },
  endsWith: function endsWith(str) {
    return this.slice(-str.length) == str;
  },
  includes: function includes(str) {
    return this.indexOf(str) > -1;
  },
  replaceAll: function replaceAll(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  }
});
_jquery.$.extend(window, {
  parameters: function parameters(url) {
    // get query string from url (optional) or window
    var queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    var cachedkey = 'urlparameters' + queryString;
    var obj = (0, _jquery.$)(window).data(cachedkey);
    if (obj == undefined) {
      obj = new Proxy({}, PropertiesCaseInsensitive);
      (0, _jquery.$)(window).data(cachedkey, obj);
    } else return obj;
    // we'll store the parameters here
    // if query string exists
    if (queryString) {
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
      // split our query string into its component parts
      var arr = queryString.split('&');
      for (var i = 0; i < arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');
        // set parameter name and value (use 'true' if empty)
        var paramName = a[0];
        var paramValue = typeof a[1] === 'undefined' ? true : a[1];
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if (paramName.match(/\[(\d+)?\]$/)) {
          // create key if it doesn't exist
          var key = paramName.replace(/\[(\d+)?\]/, '');
          if (!obj[key]) obj[key] = [];
          // if it's an indexed array e.g. colors[2]
          if (paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            var index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if (!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if (obj[paramName] && typeof obj[paramName] === 'string') {
            // if property does exist and it's a string, convert it to an array
            obj[paramName] = [obj[paramName]];
            obj[paramName].push(paramValue);
          } else {
            // otherwise add the property
            obj[paramName].push(paramValue);
          }
        }
      }
    }
    return obj;
  }
});

function TestCaseInsensitive() {
  var Foo = '333';
  var wwww = 'wwww';
  var obj1 = { Foo: Foo, wwww: wwww };
  obj1['sSs'] = 'sssss';
  // alert(Proxy);
  //   var obj = new Proxy(obj1, caseInsensitiveProxyHandler);
  obj1.vvv = 'vvvvv';
  obj.oooo = 'ooooo';
  console.log('\n---------------------\n     ' + new Date() + '.\n     ' + obj.foo + '\n     ' + obj.VVV + '\n     ' + obj.OooO + '\n     ' + obj.OO + '\n  ');
}
TestCaseInsensitive();
//# sourceMappingURL=awesomejavascriptgists.js.map