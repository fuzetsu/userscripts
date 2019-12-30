let window = {};
import { $, jQuery } from 'jquery';
// export for others scripts to use
// window.$ = $;
// window.jQuery = jQuery;
//重载类型方法
let caseInsensitiveProxyHandler = {
  has: function has(target, prop) {
    if(typeof prop === 'symbol') {
      return prop in target; // pass through; or 'return;' if you want to block pass through
    }
    prop = prop.toLowerCase();
    if(prop in target) return true;
    let keys = Object.keys(target);
    let i = keys.length;
    while(i--) {
      if(keys[i] && keys[i].toLowerCase() == prop) return true;
    }
    return false;
  },
  get: function get(target, prop, receiver) {
    if(typeof prop === 'symbol') { return target[prop]; }
    prop = prop.toLowerCase();
    if(prop in target) return target[prop];
    let keys = Object.keys(target);
    let i = keys.length;
    while(i--) {
      if(keys[i] && keys[i].toLowerCase() == prop) return target[keys[i]];
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
//删除数组中的空元素
$.extend(Array.prototype, {
  clean: function(deleteValue = "") {
    for(let i = 0; i < this.length; i++) {
      if(this[i] == deleteValue) {
        this.splice(i, 1);
        i--;
      }
    }
    return this;
  }
});
$.extend(Number.prototype, {
  toString: function(num) {
    if(isNaN(num)) num = 2;
    return this.toFixed(num);
  }
});
$.extend(String.prototype, {
  toFloat: function() {
    return parseFloat(this);
  },
  toInt: function() {
    return parseInt(this);
  },
  startsWith: function(str) {
    return this.slice(0, str.length) == str;
  },
  endsWith: function(str) {
    return this.slice(-str.length) == str;
  },
  includes: function(str) {
    return this.indexOf(str) > -1;
  },
  replaceAll: function(search, replacement) {
    let target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
  }
});
$.extend(window, {
  parameters: function(url) {
    // get query string from url (optional) or window
    let queryString = url ? url.split('?')[1] : window.location.search.slice(1);
    let cachedkey = 'urlparameters' + queryString;
    let obj = $(window).data(cachedkey);
    if(obj == undefined) {
      obj = new Proxy({}, PropertiesCaseInsensitive);
      $(window).data(cachedkey, obj);
    } else return obj;
    // we'll store the parameters here
    // if query string exists
    if(queryString) {
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];
      // split our query string into its component parts
      let arr = queryString.split('&');
      for(let i = 0; i < arr.length; i++) {
        // separate the keys and the values
        let a = arr[i].split('=');
        // set parameter name and value (use 'true' if empty)
        let paramName = a[0];
        let paramValue = typeof(a[1]) === 'undefined' ? true : a[1];
        // if the paramName ends with square brackets, e.g. colors[] or colors[2]
        if(paramName.match(/\[(\d+)?\]$/)) {
          // create key if it doesn't exist
          let key = paramName.replace(/\[(\d+)?\]/, '');
          if(!obj[key]) obj[key] = [];
          // if it's an indexed array e.g. colors[2]
          if(paramName.match(/\[\d+\]$/)) {
            // get the index value and add the entry at the appropriate position
            let index = /\[(\d+)\]/.exec(paramName)[1];
            obj[key][index] = paramValue;
          } else {
            // otherwise add the value to the end of the array
            obj[key].push(paramValue);
          }
        } else {
          // we're dealing with a string
          if(!obj[paramName]) {
            // if it doesn't exist, create property
            obj[paramName] = paramValue;
          } else if(obj[paramName] && typeof obj[paramName] === 'string') {
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
  var obj1 = { Foo, wwww };
  obj1['sSs'] = 'sssss';
  // alert(Proxy);
  //   var obj = new Proxy(obj1, caseInsensitiveProxyHandler);
  obj1.vvv = 'vvvvv';
  obj.oooo = 'ooooo';
  console.log(`
---------------------
     ${new Date()}.
     ${obj.foo}
     ${obj.VVV}
     ${obj.OooO}
     ${obj.OO}
  `);
}
TestCaseInsensitive();
