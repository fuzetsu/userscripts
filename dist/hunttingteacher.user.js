// ==UserScript==
// @name        find best teacher on 51talk.com(old)
// @version     2021.4.14002
// @author      jimbo
// @description 辅助选老师-排序显示，经验值计算|好评率|显示年龄|列表显示所有教师
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/hunttingteacheron51talk
// @match       *://www.51talk.com/ReserveNew/index*
// @match       *://www.51talk.com/TeacherNew/*
// @match       *://www.51talk.com/user/*
// @namespace   https://github.com/niubilityfrontend
// @license     OSL-3.0
// @updateURL   https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @installURL  https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @downloadURL https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @grant       GM_xmlhttpRequest
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_listValues
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// @require     https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.5.0.min.js
// @require     https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js
// @require     https://raw.githubusercontent.com/niubilityfrontend/pace/v1.2.4/pace.min.js
// @require     https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/i18n/grid.locale-cn.js
// @require     https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/jquery.jqgrid.min.js
// @require     https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// @require     https://raw.githubusercontent.com/niubilityfrontend/userscripts/master/libs/gm_config.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


// ==UserScript==
// @name find best teacher on 51talk.com(old)
// @version 2021.4.14002
// @namespace https://github.com/niubilityfrontend
// @description 辅助选老师-排序显示，经验值计算|好评率|显示年龄|列表显示所有教师
// @author jimbo
// @license OSL-3.0
// @supportURL https://github.com/niubilityfrontend/hunttingteacheron51talk
// @updateURL https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @installURL https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @downloadURL https://github.com/niubilityfrontend/userscripts/raw/master/hunttingteacheron51talk/hunttingteacher.user.js
// @match *://www.51talk.com/ReserveNew/index*
// @match *://www.51talk.com/TeacherNew/*
// @match *://www.51talk.com/user/*
// @grant GM_xmlhttpRequest
// @grant GM_getValue
// @grant GM_setValue
// @grant GM_listValues
// @grant GM_deleteValue
// @grant GM_registerMenuCommand
// @require https://ajax.aspnetcdn.com/ajax/jQuery/jquery-3.5.0.min.js
// @require https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js
// @require https://raw.githubusercontent.com/niubilityfrontend/pace/v1.2.4/pace.min.js
// @require https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/i18n/grid.locale-cn.js
// @require https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/jquery.jqgrid.min.js
// @require https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// @require https://raw.githubusercontent.com/niubilityfrontend/userscripts/master/libs/gm_config.js
//
// ==/UserScript==
(function () {
  "use strict"; ///extend method parameters of window, get parameter's value with key case-insensitive

  (function ($) {
    var PropertiesCaseInsensitive = {
      has: function has(target, prop) {
        if (typeof prop === "symbol") {
          return prop in target; // pass through; or 'return;' if you want to block pass through
        }

        prop = prop.toLowerCase();
        if (prop in target) return true;
        var keys = Object.keys(target),
            i = keys.length;

        while (i--) {
          if (keys[i] && keys[i].toLowerCase() == prop) return true;
        }

        return false;
      },
      get: function get(target, prop, receiver) {
        if (typeof prop === "symbol") {
          return target[prop];
        }

        prop = prop.toLowerCase();
        if (prop in target) return target[prop];
        var keys = Object.keys(target),
            i = keys.length;

        while (i--) {
          if (keys[i] && keys[i].toLowerCase() == prop) return target[keys[i]];
        }

        return undefined;
      },
      set: function set(target, prop, value) {
        if (typeof prop === "symbol") {
          target[prop] = value;
        }

        target[prop.toLowerCase()] = value;
        return true;
      }
    };
    $.extend(window, {
      parameters: function parameters(url) {
        // get query string from url (optional) or window
        var queryString = url ? url.split("?")[1] : window.location.search.slice(1),
            cachedkey = "urlparameters" + queryString,
            obj = $(window).data(cachedkey);

        if (obj == undefined) {
          obj = new Proxy({}, PropertiesCaseInsensitive);
          $(window).data(cachedkey, obj);
        } else return obj; // we'll store the parameters here
        // if query string exists


        if (queryString) {
          // stuff after # is not part of query string, so get rid of it
          queryString = queryString.split("#")[0]; // split our query string into its component parts

          var arr = queryString.split("&");

          for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split("="),
                paramName = a[0],
                paramValue = typeof a[1] === "undefined" ? true : a[1]; // set parameter name and value (use 'true' if empty)

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
              // create key if it doesn't exist
              var key = paramName.replace(/\[(\d+)?\]/, "");
              if (!obj[key]) obj[key] = []; // if it's an indexed array e.g. colors[2]

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
              } else if (obj[paramName] && typeof obj[paramName] === "string") {
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
  })($); ///date to string with formater


  (function ($) {
    var getPaddedComp = function getPaddedComp(comp) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      if (len < 1) len = 1;
      comp = "" + comp;
      var paddedLen = len - ("" + comp).length;

      if (paddedLen > 0) {
        return [...Array(paddedLen).fill("0"), ...comp].join("");
      } else return comp;
    },
        o = {
      "[y|Y]{4}": function yY4(date) {
        return date.getFullYear();
      },
      // year
      "[y|Y]{2}": function yY2(date) {
        return date.getFullYear().toString().slice(2);
      },
      // year
      MM: function MM(date) {
        return getPaddedComp(date.getMonth() + 1);
      },
      //month
      M: function M(date) {
        return date.getMonth() + 1;
      },
      //month
      "[d|D]{2}": function dD2(date) {
        return getPaddedComp(date.getDate());
      },
      //day
      "[d|D]{1}": function dD1(date) {
        return date.getDate();
      },
      //day
      "h{2}": function h2(date) {
        return getPaddedComp(date.getHours() > 12 ? date.getHours() % 12 : date.getHours());
      },
      //hour
      "h{1}": function h1(date) {
        return date.getHours() > 12 ? date.getHours() % 12 : date.getHours();
      },
      //hour
      "H{2}": function H2(date) {
        return getPaddedComp(date.getHours());
      },
      //hour
      "H{1}": function H1(date) {
        return date.getHours();
      },
      //hour
      "m{2}": function m2(date) {
        return getPaddedComp(date.getMinutes());
      },
      //minute
      "m{1}": function m1(date) {
        return date.getMinutes();
      },
      //minute
      "s+": function s(date) {
        return getPaddedComp(date.getSeconds());
      },
      //second
      "f+": function f(date) {
        return getPaddedComp(date.getMilliseconds(), 3);
      },
      //millisecond,
      "f{1}": function f1(date) {
        return getPaddedComp(date.getMilliseconds(), 0);
      },
      //millisecond,
      "b+": function b(date) {
        return date.getHours() >= 12 ? "PM" : "AM";
      }
    };

    $.extend(Date.prototype, {
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
  })($); //扩展基本类型方法 array.clean(val), Number.toString(len),String.toFloat, String.toInt,String.startsWtih,String.endsWith, ** String.replaceAll区别育默认的string.replace


  (function ($) {
    $.extend(Array.prototype, {
      clean: function clean() {
        for (var deleteValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "", i = 0; i < this.length; i++) {
          if (this[i] == deleteValue) {
            this.splice(i, 1);
            i--;
          }
        }

        return this;
      }
    });
    $.extend(Number.prototype, {
      toString: function toString(num) {
        if (isNaN(num)) num = 2;
        return this.toFixed(num);
      }
    });
    $.extend(String.prototype, {
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
        return target.replace(new RegExp(search, "g"), replacement);
      }
    });
  })($);

  var config = GM_config([{
    key: "pagecount",
    label: "最大页数 (自动获取时)",
    "default": 20,
    type: "dropdown",
    values: [0, 5, 10, 20, 50, 1e3]
  }, {
    key: "newBatcherKeyHours",
    label: "批次更新间隔（小时），0为每次更新",
    "default": 24,
    type: "dropdown",
    values: [0, 1, 2, 3, 5, 10, 24, 168, 168e3]
  }, {
    key: "markRankRed",
    label: "突出前N名教师的名次",
    "default": 100,
    type: "dropdown",
    values: [5, 10, 30, 50, 120, 500, 3e3, 5e3, 10080]
  }, {
    key: "version",
    type: "hidden",
    "default": 1
  }]),
      conf = config.load();

  config.onsave = function (cfg) {
    conf = cfg;
    $("#autogetnextpage").text("自动获取" + getAutoNextPagesCount() + "页");
  };

  GM_registerMenuCommand("设置", config.setup); //*://www.51talk.com/ReserveNew/index*
  //https://www.51talk.com/TeacherNew/info/t26501111
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=all&has_msg=1
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=good&has_msg=1
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=bad&has_msg=1
  //https://www.51talk.com/user/study_center_zx
  //https://www.51talk.com/user/study_center_zy
  //https://www.51talk.com/user/study_center_xx

  var url = window.location.href.toLocaleLowerCase(),
      settings = {
    url: url,
    tid: url.match(/(t\d+)/g),
    pagecount: conf.pagecount,
    isDetailPage: url.includes("teachernew"),
    isListPage: url.includes("reservenew"),
    isCoursePage: url.includes("study_center")
  };

  function gettid() {
    return settings.tid;
  }
  /**
   * 提交运算函数到 document 的 fx 队列
   */


  var submit = function submit(fun) {
    var queue = $.queue(document, "fx", fun);

    if (queue[0] == "inprogress") {
      return;
    }

    $.dequeue(document);
  };

  function getorAddSession(key, func) {
    if (!(key in sessionStorage)) {
      var data = typeof func == "function" ? func(key) : func;
      sessionStorage.setItem(key, data);
      return data;
    }

    return sessionStorage.getItem(key);
  }

  Pace.Options = {
    ajax: false,
    // disabled
    document: false,
    // disabled
    eventLag: false,
    // disabled
    elements: {
      selectors: ["#filterdialog"]
    }
  };

  function sleep(delay) {
    var start = Date.now();

    while (Date.now() - start < delay) {
      continue;
    }
  }

  var asc = function asc(a, b) {
    var av = $(a).attr("indicator"),
        bv = $(b).attr("indicator");
    if (!av || !bv) return 0;
    return $(a).attr("indicator").toFloat() > $(b).attr("indicator").toFloat() ? 1 : -1;
  },
      desc = function desc(a, b) {
    var av = $(a).attr("indicator"),
        bv = $(b).attr("indicator");
    if (!av || !bv) return 0;
    return $(a).attr("indicator").toFloat() > $(b).attr("indicator").toFloat() ? -1 : 1;
  },
      sortByIndicator = function sortByIndicator(sortBy) {
    var sortEle = $(".s-t-content.f-cb .item").sort(sortBy);
    $(".s-t-content.f-cb").empty().append(sortEle);
  };

  function getBatchNumber() {
    if (conf.newBatcherKeyHours <= 0) return Date.now();
    return parseInt(Date.now() / conf.newBatcherKeyHours / 36e5) * conf.newBatcherKeyHours * 36e5;
  }

  function getLeftPageCount() {
    var pages = Number($(".s-t-page>.next-page:first").prev().text()),
        curr = Number($(".s-t-page>.active:first").text());
    if (pages) return pages - curr;else return 0;
  }

  function getAutoNextPagesCount() {
    var pages = getLeftPageCount();
    if (settings.pagecount > pages) return pages;else return settings.pagecount;
  } //     $("head").append(`
  //     <link href="https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/css/ui.jqgrid.min.css" rel="stylesheet" type="text/css">
  //     <link href="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">
  //   `);


  $("head").append("<style type=\"text/css\">\n.search-teachers .s-t-list .item-time-list {margin-top:315px;}\n.search-teachers .s-t-list .item { height: 679px; }\n.search-teachers .s-t-list .s-t-content { margin-right: 0px;}\n.search-teachers { width: 100%; }\n.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}\n.search-teachers .s-t-list .item { height: auto; margin-right: 5px; margin-bottom: 5px; }\n.pace {\n  -webkit-pointer-events: none;\n  pointer-events: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n}\n.pace-inactive {\n  display: none;\n}\n.ui-tabs .ui-tabs-panel{padding:.5em 0.2em;}\n.ui-dialog .ui-dialog-content { padding: .5em 0.2em;}\n.pace .pace-progress {\n  background: #29d;\n  position: fixed;\n  z-index: 2000;\n  top: 0;\n  right: 100%;\n  width: 100%;\n  height: 2px;\n}\n.search-teachers .s-t-top .s-t-days .s-t-days-list li {\n  float: left;\n  width: 118px;\n  height: 34px;\n  line-height: 34px;\n  margin-right: 5px;\n  margin-bottom: 5px;\n}\n.search-teachers .s-t-top .s-t-top-details {\n  padding: 2px 0 2px 30px;\n}\n.search-teachers .s-t-top .s-t-top-right {\n  height: auto;\n}\n.search-teachers .s-t-top .s-t-top-left .condition-item {\n  margin-bottom: 2px;\n}\n.s-t-page { padding-top: 2px;}\n\n/*!\n * jqGrid 4.15.5-pre - free jqGrid: https://github.com/free-jqgrid/jqGrid \n * Date: 2018-08-12\n */.ui-jqgrid{position:relative;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box;-ms-touch-action:none;touch-action:manipulation}.ui-jqgrid div{line-height:normal}.ui-jqgrid table{border-collapse:separate;border-spacing:0;border-width:0;border-style:none}.ui-jqgrid table td{padding:0}.ui-jqgrid>.ui-jqgrid-view{position:relative;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;left:0;top:0;padding:0;font-size:11px}.ui-jqgrid>.ui-jqgrid-view *,.ui-jqgrid>.ui-jqgrid-view :after,.ui-jqgrid>.ui-jqgrid-view :before{-webkit-box-sizing:inherit;-moz-box-sizing:inherit;box-sizing:inherit}.ui-jqdialog .ui-jqdialog-titlebar,.ui-jqgrid .ui-jqgrid-errorbar,.ui-jqgrid .ui-jqgrid-titlebar{padding:.3em .3em .3em .3em;position:relative;font-size:12px;border-left:0 none;border-right:0 none;border-top:0 none}.ui-jqgrid-errorbar{max-height:100px;margin-bottom:0;overflow:auto}.ui-jqgrid .ui-jqgrid-caption,.ui-jqgrid .ui-jqgrid-errorbar-ltr{text-align:left}.ui-jqgrid .ui-jqgrid-caption-rtl,.ui-jqgrid .ui-jqgrid-errorbar-rtl{text-align:right}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close{vertical-align:middle;text-align:center;text-decoration:none;position:absolute;top:50%;width:1.4em;line-height:1.5em;font-size:12px;margin:-.7em 0 0 0;padding:.2em;border:1px solid transparent;height:1.4em;cursor:pointer;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-ms-touch-action:manipulation;touch-action:manipulation;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ui-jqgrid-jquery-ui .ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close{margin:-8px 0 0 0}.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-titlebar-close{right:.1em}.ui-jqgrid .ui-jqgrid-caption-rtl .ui-jqgrid-titlebar-close{left:.1em}.ui-jqdialog .ui-jqdialog-titlebar-ltr .ui-jqdialog-titlebar-close{right:.3em}.ui-jqdialog .ui-jqdialog-titlebar-rtl .ui-jqdialog-titlebar-close{left:.3em}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close{-ms-border-radius:.5em;border-radius:.5em}.ui-jqdialog .ui-jqdialog-titlebar-ltr .ui-jqdialog-title,.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-title,.ui-jqgrid .ui-jqgrid-errorbar-ltr .ui-jqgrid-error{position:relative;left:.1em}.ui-jqdialog .ui-jqdialog-titlebar-rtl .ui-jqdialog-title,.ui-jqgrid .ui-jqgrid-caption-rtl .ui-jqgrid-title,.ui-jqgrid .ui-jqgrid-errorbar-rtl .ui-jqgrid-error{position:relative;right:.1em}.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span{margin-top:0;margin-left:0}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close span,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span{display:block}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close span.ui-icon,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span.ui-icon{position:relative;top:-2px}.ui-jqdialog-titlebar-ltr .ui-jqdialog-titlebar-close span.ui-icon,.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-titlebar-close span.ui-icon{right:3.5px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.ui-icon{margin-top:-1px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.fa,.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{font-size:14px;margin-top:-2px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>.svg-inline--fa{font-size:14px;display:block;margin-top:-.125em;margin-left:-.125em}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.fa{margin-left:-1px}.ui-jqdialog-titlebar-close>.svg-inline--fa{display:block;margin-left:.0625em;margin-top:-.0625em}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{margin-left:-2px}.ui-jqdialog-titlebar .ui-jqdialog-titlebar-close>span{margin-top:-1px}.ui-jqdialog-titlebar .ui-jqdialog-titlebar-close>span.glyphicon{margin-top:-.05em;margin-left:-.05em}.ui-jqdialog .ui-resizable-handle>.ui-icon{right:-1px;bottom:-1px}.ui-jqdialog .ui-resizable-handle>.fa{font-size:12px;right:-2px;position:relative}.ui-jqdialog .ui-resizable-handle>.svg-inline--fa{font-size:12px;right:-1px;position:relative}.ui-jqdialog .ui-resizable-handle>.glyphicon{font-size:12px;right:-1px;bottom:-2.8px}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-hdiv{position:relative;margin:0;padding:0;overflow:hidden;border-left:0 none;border-top:0 none;border-right:0 none;height:auto}.ui-jqgrid .ui-jqgrid-hbox{float:left;padding-right:20px}.ui-jqgrid .ui-jqgrid-htable{table-layout:fixed;margin:0}.ui-jqgrid .ui-jqgrid-htable th{height:auto;padding:0 2px 0 2px}.ui-jqgrid-htable>thead>.jqg-first-row-header>th{padding-top:0;padding-bottom:0;border-bottom:0 none;border-top:0 none}.ui-jqgrid .ui-jqgrid-htable th.jqgh_cbox{padding:0}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels th div{overflow:hidden;position:relative;height:auto;margin:2px 2px}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels>th.jqgh_cbox{vertical-align:middle}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels .jqgh_cbox>div{text-align:center;vertical-align:baseline;margin:0}.ui-jqgrid .ui-jqgrid-labels th.ui-th-column,.ui-jqgrid .ui-jqgrid-legacy-subgrid .ui-th-subgrid,.ui-jqgrid-labels .ui-th-column-header{overflow:hidden;white-space:nowrap;text-align:center}.ui-jqgrid-labels .ui-th-column-header{vertical-align:middle;height:auto;vertical-align:middle;border-top:0 none}.ui-jqgrid .ui-jqgrid-labels th.ui-th-column{position:relative;vertical-align:middle;border-top:0 none;border-bottom:0 none}.ui-jqgrid .ui-jqgrid-htable th.ui-th-ltr,.ui-th-ltr{border-left:0 none}.ui-jqgrid .ui-jqgrid-htable th.ui-th-rtl,.ui-th-rtl{border-right:0 none}.ui-first-th-ltr{border-right:1px solid}.ui-first-th-rtl{border-left:1px solid}.ui-jqgrid .ui-th-div-ie{white-space:nowrap;zoom:1;height:17px}.ui-jqgrid .ui-th-column>.jqgh_cbox{margin:3px 0}.ui-jqgrid .ui-th-column .cbox{margin:.1em;cursor:pointer;text-align:center;vertical-align:middle}.ui-jqgrid.ui-jqgrid-bootstrap .ui-th-column .cbox{height:18px;width:18px}.ui-jqgrid .ui-th-column .ui-th-div-ie>.cbox{margin-left:-1px;margin-right:-1px}.ui-jqgrid .ui-jqgrid-labels>.ui-th-column>.ui-jqgrid-resize{top:0;height:100%;width:.3em;position:absolute;cursor:col-resize;-webkit-touch-callout:none;-ms-user-select:none;-moz-user-select:-moz-none;-webkit-user-select:none;user-select:none;display:inline;overflow:hidden}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels th div.ui-jqgrid-rotate{-webkit-transform:translateX(-50%) translateY(0) rotate(-90deg);-moz-transform:translateX(-50%) translateY(0) (-90deg);-o-transform:translateX(-50%) translateY(0) rotate(-90deg);-ms-transform:translateX(-50%) translateY(0) rotate(-90deg);transform:translateX(-50%) translateY(0) rotate(-90deg);transform-origin:center center;margin:0;left:50%}.ui-jqgrid .ui-grid-ico-sort{overflow:hidden;position:absolute;display:inline}.ui-grid-ico-sort{cursor:pointer}.ui-state-disabled.ui-grid-ico-sort{cursor:pointer!important}.ui-jqgrid .s-ico{position:relative;width:.87em;height:1.125em;display:inline-block;vertical-align:middle;margin:0 .1em}.ui-jqgrid .s-ico>.ui-grid-ico-sort{display:block;position:relative}.ui-jqgrid .s-ico>.ui-grid-ico-sort.ui-icon{width:12px;margin-top:0}.ui-jqgrid .s-ico>.ui-icon-asc.ui-icon{top:-6px}.ui-jqgrid .s-ico>.ui-icon-desc.ui-icon{top:-16px}.ui-jqgrid .s-ico>.ui-icon-triangle-1-s{background-position:-65px -16px}.ui-jqgrid .s-ico>.ui-icon.ui-sort-ltr{margin-left:-3px}.ui-jqgrid .s-ico>.ui-icon.ui-sort-rtl{margin-right:0}.ui-jqgrid-sortable>.ui-jqgrid-sort-order{position:relative;left:-.1em;top:0;font-size:75%;vertical-align:super}.ui-jqgrid .ui-th-column>div{cursor:default}.ui-jqgrid .ui-th-column>div.ui-jqgrid-sortable{cursor:pointer}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar{border-top-width:1px;border-top-style:solid}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar .ui-th-column{border-top-width:1px;border-top-style:solid}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar input{margin:1px 0 0 0}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar select{margin:1px 0 0 0}.ui-jqgrid .ui-jqgrid-bdiv{min-height:1px;position:relative;margin:0;padding:0;overflow:auto;text-align:left}.ui-jqgrid .ui-jqgrid-btable{table-layout:fixed;margin:0;outline-style:none;height:1px}.ui-jqgrid tr.jqgroup,.ui-jqgrid tr.jqgrow{outline-style:none}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td,.ui-jqgrid tr.ui-subgrid>td,.ui-jqgrid tr.ui-subtblcell>td{overflow:hidden;white-space:pre;vertical-align:middle;text-align:center;height:22px;border-top:0 none;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqfoot>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgroup>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgrow>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.ui-subgrid>td{border-bottom-color:inherit}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td{padding:0 2px 0 2px}.ui-jqgrid tr.ui-subgrid>td{padding:0}.ui-jqgrid tr.jqgfirstrow>td{padding:0 2px 0 2px;border-top:0 none;border-left:0 none;height:0;border-right-width:1px;border-right-style:solid;border-bottom:0 none}.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgfirstrow>td{border-right-color:inherit}.ui-jqgrid tr.jqgfirstrow>td.td_cbox{padding:0}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td{font-weight:400}.ui-jqgrid tr.jqfoot>td{font-weight:700}.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-ltr>td{text-align:left;border-left-width:0;border-left-style:none;border-right-width:1px;border-right-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-ltr>td{border-color:inherit}.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-rtl>td{text-align:right;border-right-width:0;border-right-style:none;border-left-width:1px;border-left-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-rtl>td{border-color:inherit}.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{padding:0 2px 0 2px;margin:0;border-width:0;border-style:none}.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{border-bottom-color:inherit}.ui-jqgrid .jqgrow>td.td_cbox{padding:0;text-align:center;vertical-align:middle}.ui-jqgrid .jqgrow>td.ui-sgcollapsed{text-align:center;vertical-align:middle}.ui-jqgrid tr.jqgrow>td.td_cbox{padding:0}.ui-jqgrid .jqgrow>td>.cbox{height:14px;width:14px;cursor:pointer;text-align:center;vertical-align:middle}.ui-jqgrid>.ui-jqgrid-resize-mark,body>.ui-jqgrid-resize-mark{width:0;left:0;cursor:col-resize;-webkit-touch-callout:none;-ms-user-select:none;-moz-user-select:-moz-none;-webkit-user-select:none;user-select:none;position:absolute;top:0;overflow:hidden;display:none;border-left-width:1px;border-right-width:1px;z-index:99999}span.ui-jqgrid-cell-wrapper{margin:0!important;padding:0!important}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-sdiv{position:relative;margin:0;padding:0;overflow:hidden;border-left:0 none;border-top:0 none;border-right:0 none}.ui-jqgrid .ui-jqgrid-ftable{table-layout:fixed;margin-bottom:0}.ui-jqgrid tr.footrow td{font-weight:700;overflow:hidden;white-space:nowrap;height:21px;padding:0 2px 0 2px;border-top-width:1px;border-top-style:solid;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow td{border-top-color:inherit;border-bottom-color:inherit}.ui-jqgrid tr.footrow-ltr td{text-align:left;border-left-width:0;border-left-style:none;border-right-width:1px;border-right-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow-ltr td{border-color:inherit}.ui-jqgrid tr.footrow-rtl td{text-align:right;border-left-width:1px;border-left-style:solid;border-right-width:0;border-right-style:none}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow-rtl td{border-color:inherit}.ui-jqgrid>.ui-jqgrid-pager{border:0 none;margin:0;padding:0;position:relative;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;height:auto;min-height:22px;overflow:hidden;font-size:11px}.ui-jqgrid>.ui-jqgrid-pager *,.ui-jqgrid>.ui-jqgrid-pager :after,.ui-jqgrid>.ui-jqgrid-pager :before{-webkit-box-sizing:inherit;-moz-box-sizing:inherit;box-sizing:inherit}.ui-jqgrid .ui-jqgrid-pager .ui-pager-control,.ui-jqgrid .ui-jqgrid-toppager .ui-pager-control{position:relative;border-left:0;border-bottom:0;border-top:0}.ui-pager-control .ui-jqgrid-pg-left{text-align:left}.ui-pager-control .ui-jqgrid-pg-center{text-align:center;white-space:pre}.ui-pager-control .ui-jqgrid-pg-right{text-align:right}.ui-jqgrid .ui-pg-table{position:relative;padding:0;width:auto;margin:0}.jqgrow .ui-jqgrid-actions{background:inherit;border-style:none}.ui-jqgrid .ui-pg-button:not(.ui-state-hover),.ui-jqgrid-jquery-ui .jqgrow .ui-jqgrid-actions .ui-pg-div:not(.ui-state-hover){border:1px solid transparent}.ui-pager-control .ui-pg-table{border-color:inherit}.jqgrow .ui-jqgrid-actions .ui-pg-div.ui-state-hover,.jqgrow .ui-jqgrid-actions .ui-pg-div:focus,.jqgrow .ui-jqgrid-actions .ui-pg-div:hover,.ui-jqgrid .ui-pg-button.ui-state-hover,.ui-jqgrid .ui-pg-button:focus,.ui-jqgrid .ui-pg-button:hover{border-style:solid;border-color:inherit}.ui-jqgrid .ui-pg-table td{font-weight:400;vertical-align:middle;padding:1px}.ui-jqgrid .ui-pager-control .ui-pg-button{display:inline-block;height:auto}.ui-jqgrid .ui-pg-button span{display:block;margin:1px;float:left}.ui-jqgrid .ui-pg-table .ui-pg-input,.ui-jqgrid .ui-pg-table .ui-pg-selbox{height:auto;width:auto;margin:0;line-height:inherit}select.form-control.ui-pg-selbox:not([size]):not([multiple]){height:auto}.ui-jqgrid .ui-pg-table .ui-pg-selbox{display:block;padding:1px}.ui-jqgrid .ui-separator{height:12px;border-left:1px solid #ccc;border-right:1px solid #ccc;margin:-1px;float:right}.ui-jqgrid .ui-paging-info{font-weight:400;height:auto;margin:0 .2em 0 .2em;display:inline}.ui-jqgrid .ui-jqgrid-pager .ui-pg-div{padding:1px 0;float:left;position:relative}.ui-jqgrid .ui-jqgrid-pager .ui-pg-button{cursor:pointer}.ui-jqgrid .ui-jqgrid-pager .ui-pg-div span.ui-icon{float:left;margin:0 2px}.ui-jqgrid td input,.ui-jqgrid td select,.ui-jqgrid td textarea{margin:0}.ui-jqgrid td textarea{width:auto;height:auto}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-toppager{border-left:0 none;border-right:0 none;border-top:0 none;margin:0;padding:0;position:relative;height:auto;min-height:22px;overflow:hidden}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-div{padding:1px 0;float:left;position:relative}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-button{cursor:pointer}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-div span.ui-icon{float:left;margin:0 2px}.ui-jqgrid .ui-pg-table .ui-pg-button{margin:2px;vertical-align:middle}.ui-jqgrid .navtable .ui-pg-div span.ui-pg-button-text{padding-left:.2em;padding-right:.2em}.ui-pg-button.ui-state-hover>.ui-pg-div>.ui-pg-button-text,.ui-pg-button:hover>.ui-pg-div>.ui-pg-button-text{font-weight:400}.ui-jqgrid .ui-pg-div{text-align:center;vertical-align:middle;display:inline-block}.ui-jqgrid .navtable .ui-pg-div>span.ui-pg-button-icon-over-text{margin-left:auto;margin-right:auto;float:none}.subgrid-data>.tablediv>.ui-jqgrid{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}.subgrid-data>.tablediv>.ui-jqgrid>.ui-jqgrid-view{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}.ui-jqgrid .ui-jqgrid-btable .jqgrow>.ui-sgcollapsed{text-align:center;vertical-align:middle}.ui-jqgrid .ui-jqgrid-btable .ui-sgcollapsed span{display:inline-block}.ui-jqgrid .ui-subgrid{margin:0;padding:0;width:100%}.sgbutton{cursor:pointer}.ui-jqgrid .ui-subgrid table{table-layout:fixed}.ui-jqgrid .ui-subgrid tr.ui-subtblcell td{height:18px;border-top:0 none;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-subgrid tr.ui-subtblcell td{border-bottom-color:inherit}.ui-jqgrid .ui-th-subgrid{height:20px}.ui-jqgrid .ui-row-ltr.ui-subgrid>.subgrid-cell>span{float:right}.ui-jqgrid .ui-row-rtl.ui-subgrid>.subgrid-cell>span{float:left}.ui-jqgrid>.loading{position:absolute;top:45%;left:45%;width:auto;z-index:101;padding:6px;margin:5px;text-align:center;font-weight:700;display:none;border-width:2px;font-size:11px}.ui-jqgrid .jqgrid-overlay{display:none;z-index:100}* .jqgrid-overlay iframe{position:absolute;top:0;left:0;z-index:-1}.ui-jqgrid>.ui-jqgrid-view>.ui-userdata{border-left:0 none;border-right:0 none;height:21px;overflow:hidden}.ui-jqgrid .ui-jqdialog{font-size:11px}.ui-jqdialog{display:none;width:300px;position:absolute;font-size:11px;overflow:visible}.ui-jqdialog.ui-jqgrid-jquery-ui{padding:.2em}.ui-jqgrid-bootstrap.modal{right:auto;left:auto}.ui-jqgrid-bootstrap.modal>.modal-dialog{max-width:none}.ui-jqdialog .ui-jqdialog-content,.ui-jqdialog-content{border:0;padding:.3em .2em;background:0 0;height:auto}.ui-jqdialog .ui-jqconfirm{padding:.4em 1em;border-width:3px;position:absolute;bottom:10px;right:10px;overflow:visible;display:none;height:80px;width:220px;text-align:center}.ui-jqdialog>.ui-resizable-se,.ui-jqgrid>.ui-resizable-se{bottom:-3px;right:-3px}.ui-jqdialog-content .FormGrid{margin:0}.ui-jqdialog-content .EditTable{width:100%;margin-bottom:0}.ui-jqdialog-content .DelTable{width:100%;margin-bottom:0}.EditTable td input,.EditTable td select,.EditTable td textarea{margin:0}.EditTable td textarea{width:auto;height:auto}.ui-jqdialog-content td.EditButton{border-top:0 none;border-left:0 none;border-right:0 none;padding:5px 0}.ui-jqdialog-content td.EditButton-ltr{text-align:right}.ui-jqdialog-content td.EditButton-rtl{text-align:left}.ui-jqdialog-content td.navButton{text-align:left;border-left:0 none;border-top:0 none;border-right:0 none;padding:5px 0}.ui-jqdialog-content td.navButton-ltr{text-align:left}.ui-jqdialog-content td.navButton-ltr>.fm-button{float:left}.ui-jqdialog-content td.navButton-rtl{text-align:right}.ui-jqdialog-content td.navButton-rtl>.fm-button{float:right}.ui-jqdialog-content .FormElement{width:100%;box-sizing:border-box}.ui-jqdialog-content input.FormElement,.ui-jqdialog-content select.FormElement{padding:.3em}.ui-jqdialog-content .data-line{padding-top:.1em;border:0 none}.ui-jqdialog-content .CaptionTD{vertical-align:middle;border:0 none;padding:2px;white-space:nowrap}.ui-jqdialog-content .DataTD{padding:2px;border-width:0;border-style:none;vertical-align:top}.ui-jqgrid-jquery-ui.ui-jqdialog .form-view-data>span{border-width:1px;border-style:solid;border-color:inherit;border-radius:3px;display:block;padding:.2em}.ui-jqgrid-jquery-ui.ui-jqdialog .form-view-label>label{font-weight:700}.ui-jqgrid-bootstrap.ui-jqdialog .ui-jqdialog-content .form-view-data>span{height:100%;width:auto}.ui-jqdialog .fm-button{display:inline-block;padding:.4em .5em;text-decoration:none;cursor:pointer;position:relative;text-align:center;zoom:1}.ui-jqdialog.ui-jqgrid-bootstrap .navButton .fm-button{padding:.375em .75em;margin-left:.125em}.ui-jqdialog .fm-button>span{display:inline-block;vertical-align:middle}.ui-jqdialog .fm-button .fm-button-text{padding:0 .2em}.ui-jqdialog .EditButton-ltr .fm-button-icon-left .fm-button-icon{margin-right:.2em}.ui-jqdialog .EditButton-ltr .fm-button-icon-right .fm-button-icon{margin-left:.2em}.ui-jqdialog .EditButton-rtl .fm-button-icon-right .fm-button-icon{margin-right:.2em}.ui-jqdialog .EditButton-rtl .fm-button-icon-left .fm-button-icon{margin-left:.2em}.delmsg{padding:.5em}.ui-jqgrid .selected-row,.ui-jqgrid .selected-row td{font-style:normal;border-left:0 none}.ui-jqgrid .jqgrow .ui-jqgrid-actions{display:inline-block;vertical-align:middle;margin:0}.jqgrow .ui-jqgrid-actions .ui-pg-div{cursor:pointer;float:left;margin:0 1px}.ui-jqgrid .tree-wrap{display:inline-block;vertical-align:middle;white-space:nowrap;overflow:hidden}.ui-jqgrid .treeclick{cursor:pointer;display:inline-block;vertical-align:middle;width:18px;overflow:hidden}.ui-jqgrid .ui-jqgrid-bdiv .jqgroup .tree-wrap{text-align:center;padding-left:.1em}.ui-jqgrid .ui-jqgrid-bdiv .jqgroup .tree-wrap.glyphicon{margin-top:-.18em}* iframe.jqm{position:absolute;top:0;left:0;z-index:-1}.ui-jqgrid-dnd tr td{border-right-width:1px;border-right-color:inherit;border-right-style:solid;height:20px}.ui-jqgrid .ui-jqgrid-caption-rtl{text-align:right}.ui-jqgrid .ui-jqgrid-hbox-rtl{float:right;padding-left:20px}.ui-jqgrid .ui-jqgrid-resize-ltr{right:0;margin:0}.ui-jqgrid .ui-jqgrid-resize-rtl{left:0;margin:0}.ui-jqgrid .ui-sort-rtl{left:0}.ui-jqgrid .cell-wrapper,.ui-jqgrid .cell-wrapperleaf{display:inline-block;vertical-align:middle}.ui-jqgrid .ui-ellipsis{-moz-text-overflow:ellipsis;text-overflow:ellipsis}.ui-search-menu{position:absolute;padding:.2em}.ui-search-menu.ui-menu .ui-jqgrid-menu-item{list-style-image:none;padding-right:0;padding-left:0}.ui-search-menu.ui-menu .ui-jqgrid-menu-item a{text-decoration:none;display:block}.ui-search-toolbar>.ui-th-column>div{position:relative;height:auto;overflow:hidden}.ui-search-toolbar .ui-search-table{padding:0;border:0 none;height:20px;width:100%}.table-hover .ui-search-table tbody tr:hover{background-color:inherit}.ui-jqgrid .ui-jqgrid-htable .ui-search-toolbar th{padding:0 .1em}.ui-search-toolbar .ui-search-table .ui-search-oper{width:20px;text-align:center}.ui-search-toolbar .ui-th-column .ui-search-table .ui-search-input{padding:0 .1em}.ui-search-input input[type=text]{width:100%}a.clearsearchclass,a.g-menu-item,a.soptclass{text-decoration:none;cursor:pointer}.ui-search-menu .ui-jqgrid-menu-item .g-menu-item{padding:.2em}.ui-menu-jqueryui .ui-jqgrid-menu-item .g-menu-item:not(.ui-state-hover){border:1px solid transparent}.ui-menu-jqueryui .ui-jqgrid-menu-item .g-menu-item:hover{font-weight:400}.ui-search-oper{padding:0}.ui-search-clear{text-align:center;padding:0}.ui-search-clear .clearsearchclass,.ui-search-oper .soptclass{padding:.1em;line-height:1em}.ui-jqgrid-jquery-ui .ui-search-clear .clearsearchclass:not(.ui-state-hover),.ui-jqgrid-jquery-ui .ui-search-oper .soptclass:not(.ui-state-hover){border:1px solid transparent}.ui-search-clear .clearsearchclass span{position:relative}.ui-search-input{text-align:center}.ui-jqgrid .ui-search-table .ui-search-input>input[type=text],.ui-jqgrid .ui-search-table .ui-search-input>select{display:block;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}.ui-jqgrid>.ui-jqgrid-view button,.ui-jqgrid>.ui-jqgrid-view input,.ui-jqgrid>.ui-jqgrid-view select,.ui-jqgrid>.ui-jqgrid-view textarea{font-size:inherit;text-align:inherit}.ui-jqgrid .s-ico>.ui-grid-ico-sort.glyphicon{font-size:10px}.ui-jqgrid .s-ico>.ui-icon-asc.glyphicon{margin-top:-.23em}.ui-jqgrid .s-ico>.ui-icon-desc.glyphicon{margin-top:-.34em}.ui-jqgrid .s-ico>.ui-grid-ico-sort.fa{width:.63em}.ui-jqgrid .s-ico>.ui-icon-asc.fa{line-height:.81em;top:.07em}.ui-jqgrid .s-ico>.ui-icon-desc.fa{line-height:.81em;top:-.81em}.ui-jqgrid .s-ico>.ui-icon-asc.fa.ui-sort-ltr,.ui-jqgrid .s-ico>.ui-icon-desc.fa.ui-sort-ltr{left:0}.ui-jqgrid .s-ico>.ui-icon-asc.fa.ui-sort-rtl,.ui-jqgrid .s-ico>.ui-icon-desc.fa.ui-sort-rtl{right:0}.ui-jqgrid .s-ico>.ui-state-disabled.fa{padding:0}.ui-jqgrid .s-ico>.svg-inline--fa.fa-sort-down{margin-top:-1.05em}.jqgrow .ui-pg-div>span.fa{font-weight:400;font-size:12px;vertical-align:baseline;background:0 0;border:0 none}.ui-subgrid>.subgrid-cell span.fa{font-weight:400;font-size:12px;text-indent:0;background:0 0;border:0 none;margin-bottom:4px}.jqgrow>.ui-sgcollapsed span.fa{font-weight:400;font-size:12px;text-indent:0;background:0 0;border:0 none;margin:0}.ui-jqgrid .ui-resizable-se.fa{-webkit-filter:alpha(opacity=40);-moz-filter:alpha(opacity=40);-o-filter:alpha(opacity=40);-ms-opacity:.4;opacity:.4;background:0 0;border-style:none;right:-3px;font-weight:400}.ui-jqgrid-ltr .ui-resizable-se.fa{right:-3px;bottom:0}.ui-jqgrid-rtl .ui-resizable-se.fa{left:0;bottom:1px}.jqContextMenu .ui-menu .ui-jqgrid-menu-item a.ui-state-hover{font-weight:400;margin:-1px}.jqContextMenu .ui-menu .ui-jqgrid-menu-item.ui-state-hover{font-weight:400;margin:-1px}.jqContextMenu .ui-menu-icons>.ui-jqgrid-menu-item{font-size:11px}.ui-jqgrid-showHideColumnMenu .ui-jqgrid-menu-item:hover{font-weight:400}.ui-jqgrid-disablePointerEvents{pointer-events:none}.ui-jqgrid.ui-jqgrid-bootstrap{border:1px solid #ddd;-ms-border-radius:6px;border-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-jqgrid-toppager{border-bottom-left-radius:0;border-bottom-right-radius:0}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-userdata{background-color:#f0f0f0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-hdiv,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-legacy-subgrid>thead{background-color:#e5e5e5}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-jqgrid-sdiv td{background-color:#f9f9f9}.ui-jqdialog.ui-jqgrid-bootstrap>.modal-dialog{margin-top:0}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar .ui-jqdialog-title,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-errorbar .ui-jqgrid-error,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-titlebar .ui-jqgrid-title{font-size:16px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager .btn,.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view .btn{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager .fa,.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view .fa{font-size:14px}.ui-jqdialog.ui-jqgrid-bootstrap{font-size:14px}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content .CaptionTD{padding:.5em}.ui-jqgrid.ui-jqgrid-bootstrap .frozen-bdiv.ui-jqgrid-bdiv .ui-jqgrid-btable{background-color:#fff}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqfoot>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgroup>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow>td{padding:.2em .3em}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td{padding:0 .3em}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td.td_cbox,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow>td.td_cbox{padding:0}.ui-jqgrid.ui-jqgrid-bootstrap .jqgrow>td>.cbox{height:18px;width:18px;display:inline-block;vertical-align:middle;text-align:center}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-btable td.jqgrid-rownum{padding:.2em .3em}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-caption{background-color:#cacaca;-ms-border-top-left-radius:6px;border-top-left-radius:6px;-ms-border-top-right-radius:6px;border-top-right-radius:6px}.modal-backdrop.jqgrid-overlay{-ms-opacity:.35;opacity:.35;-webkit-filter:Alpha(Opacity=35);-moz-filter:Alpha(Opacity=35);-o-filter:Alpha(Opacity=35);filter:Alpha(Opacity=35)}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content{border:0;padding:.3em .2em;background:#fff;height:auto}.ui-jqdialog.ui-jqgrid-bootstrap .modal-dialog{width:auto}.ui-jqdialog.ui-widget{overflow:hidden}.ui-jqdialog .ui-resizable-handle{cursor:se-resize;position:absolute;-ms-touch-action:none;touch-action:none}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content{overflow:hidden}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content>.ui-resizable-handle.fa{bottom:1px;right:1px;height:12px;width:12px}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content>.ui-resizable-handle.glyphicon{right:-.4em}.ui-jqgrid.ui-jqgrid-bootstrap .disabled{opacity:.35;filter:Alpha(Opacity=35)}.ui-jqgrid-bootstrap.ui-jqgrid-resize-mark{border:1px solid #aaa;background-color:#ccc;color:#222;font-weight:700}.ui-jqgrid .jqgfirstrow{border-bottom:0 none;border-top:0 none;height:0}.ui-jqgrid.ui-jqgrid-bootstrap .jqgfirstrow td{border-bottom:0 none;border-top:0 none}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pg-table .ui-pg-button.ui-state-disabled:hover{margin:0}.ui-jqgrid.ui-jqgrid-bootstrap .navtable .ui-pg-button.ui-state-disabled:hover{margin:0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pg-table .ui-pg-button{margin:.2em 0;padding:.2em 0;border-radius:.4em}.ui-search-input .form-control:not([size]):not([multiple]){height:auto;min-height:18px}.ui-search-input input[type=text]{padding:0}.ui-search-input input[type=text].form-control{padding:0 .3em}.ui-search-input select.form-control{padding:0}.ui-search-input input[type=checkbox].form-control{width:auto;margin-left:auto;margin-right:auto;border-radius:0;background:0 transparent}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn{padding:0;margin:0;box-shadow:none}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn:not(:first-child){margin-left:.125em}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn.ui-inline-save{margin-left:0}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow .sgbutton-div .sgbutton.btn{padding:0;cursor:pointer;border:1px solid transparent;margin:-.3em -.3em}.ui-jqgrid.ui-jqgrid-bootstrap .sgbutton-div .sgbutton.btn:focus,.ui-jqgrid.ui-jqgrid-bootstrap .sgbutton-div .sgbutton.btn:hover{border:1px solid #333}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content{border-top-left-radius:0;border-top-right-radius:0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pager-control .ui-pg-input{display:inline-block;font-size:12px;padding:.3em}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-bootstrap-corner-top{border-top-left-radius:6px;border-top-right-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-bootstrap-corner-bottom{border-bottom-left-radius:6px;border-bottom-right-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pager-control .ui-pg-selbox{font-size:12px;padding:0}.ui-jqdialog.ui-jqgrid-bootstrap .FormData .CaptionTD{font-size:14px}.FormData .DataTD{vertical-align:middle}.FormData .DataTD input[type=checkbox]{width:auto;vertical-align:middle}.ui-jqdialog.ui-jqgrid-bootstrap .FormData .DataTD input.form-control[type=checkbox]{width:2.193em;height:2.193em}.DelTable .delmsg{padding:.2em}.queryresult{margin-bottom:.5em;padding:.25em}.group.modal-content tr td{padding:.2em .1em}.searchFilter .form-control{padding:.1em}.searchFilter .form-control:not([size]):not([multiple]){height:2em}.searchFilter .btn{margin-left:.125em;padding:.2em .375em}.ui-jqgrid .searchFilter table.group td{padding:1px}.ui-jqgrid .searchFilter table{border-spacing:2px}.ui-jqdialog.ui-jqgrid-bootstrap .modal-header .close{margin-top:-.7em}.ui-jqdialog .glyphicon,.ui-jqgrid .glyphicon{font-size:12px;top:auto}.ui-jqdialog.ui-jqgrid-bootstrap .glyphicon,.ui-jqgrid.ui-jqgrid-bootstrap .glyphicon{font-size:14px;top:auto;height:1em;width:1.28em}.ui-jqgrid .ui-pg-button span.glyphicon{display:inline-block;text-align:center;vertical-align:middle}.ui-jqgrid-actions .glyphicon{padding:.1em}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{margin-top:-.125em;margin-left:-.275em}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close>span.glyphicon{margin-top:-.1em;margin-left:-.28em}.tree-wrap>.treeclick{line-height:1}.tree-wrap>.treeclick.glyphicon{margin-top:-.2em;font-size:12px}.subgrid-data .ui-jqgrid-bootstrap .ui-jqgrid-bdiv .ui-jqgrid-btable,.subgrid-data .ui-jqgrid-bootstrap .ui-jqgrid-hdiv .ui-jqgrid-htable{background-color:transparent}.subgrid-data .ui-jqgrid-legacy-subgrid{margin:0}\n/*# sourceMappingURL=ui.jqgrid.min.css.map */\n\n/*! jQuery UI - v1.12.1 - 2016-09-14\n* http://jqueryui.com\n* Includes: core.css, accordion.css, autocomplete.css, menu.css, button.css, controlgroup.css, checkboxradio.css, datepicker.css, dialog.css, draggable.css, resizable.css, progressbar.css, selectable.css, selectmenu.css, slider.css, sortable.css, spinner.css, tabs.css, tooltip.css, theme.css\n* To view and modify this theme, visit http://jqueryui.com/themeroller/?ffDefault=Arial%2CHelvetica%2Csans-serif&fsDefault=1em&fwDefault=normal&cornerRadius=3px&bgColorHeader=e9e9e9&bgTextureHeader=flat&borderColorHeader=dddddd&fcHeader=333333&iconColorHeader=444444&bgColorContent=ffffff&bgTextureContent=flat&borderColorContent=dddddd&fcContent=333333&iconColorContent=444444&bgColorDefault=f6f6f6&bgTextureDefault=flat&borderColorDefault=c5c5c5&fcDefault=454545&iconColorDefault=777777&bgColorHover=ededed&bgTextureHover=flat&borderColorHover=cccccc&fcHover=2b2b2b&iconColorHover=555555&bgColorActive=007fff&bgTextureActive=flat&borderColorActive=003eff&fcActive=ffffff&iconColorActive=ffffff&bgColorHighlight=fffa90&bgTextureHighlight=flat&borderColorHighlight=dad55e&fcHighlight=777620&iconColorHighlight=777620&bgColorError=fddfdf&bgTextureError=flat&borderColorError=f1a899&fcError=5f3f3f&iconColorError=cc0000&bgColorOverlay=aaaaaa&bgTextureOverlay=flat&bgImgOpacityOverlay=0&opacityOverlay=30&bgColorShadow=666666&bgTextureShadow=flat&bgImgOpacityShadow=0&opacityShadow=30&thicknessShadow=5px&offsetTopShadow=0px&offsetLeftShadow=0px&cornerRadiusShadow=8px\n* Copyright jQuery Foundation and other contributors; Licensed MIT */\n\n/* Layout helpers\n----------------------------------*/\n.ui-helper-hidden {\n\tdisplay: none;\n}\n.ui-helper-hidden-accessible {\n\tborder: 0;\n\tclip: rect(0 0 0 0);\n\theight: 1px;\n\tmargin: -1px;\n\toverflow: hidden;\n\tpadding: 0;\n\tposition: absolute;\n\twidth: 1px;\n}\n.ui-helper-reset {\n\tmargin: 0;\n\tpadding: 0;\n\tborder: 0;\n\toutline: 0;\n\tline-height: 1.3;\n\ttext-decoration: none;\n\tfont-size: 100%;\n\tlist-style: none;\n}\n.ui-helper-clearfix:before,\n.ui-helper-clearfix:after {\n\tcontent: \"\";\n\tdisplay: table;\n\tborder-collapse: collapse;\n}\n.ui-helper-clearfix:after {\n\tclear: both;\n}\n.ui-helper-zfix {\n\twidth: 100%;\n\theight: 100%;\n\ttop: 0;\n\tleft: 0;\n\tposition: absolute;\n\topacity: 0;\n\tfilter:Alpha(Opacity=0); /* support: IE8 */\n}\n\n.ui-front {\n\tz-index: 100;\n}\n\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-disabled {\n\tcursor: default !important;\n\tpointer-events: none;\n}\n\n\n/* Icons\n----------------------------------*/\n.ui-icon {\n\tdisplay: inline-block;\n\tvertical-align: middle;\n\tmargin-top: -.25em;\n\tposition: relative;\n\ttext-indent: -99999px;\n\toverflow: hidden;\n\tbackground-repeat: no-repeat;\n}\n\n.ui-widget-icon-block {\n\tleft: 50%;\n\tmargin-left: -8px;\n\tdisplay: block;\n}\n\n/* Misc visuals\n----------------------------------*/\n\n/* Overlays */\n.ui-widget-overlay {\n\tposition: fixed;\n\ttop: 0;\n\tleft: 0;\n\twidth: 100%;\n\theight: 100%;\n}\n.ui-accordion .ui-accordion-header {\n\tdisplay: block;\n\tcursor: pointer;\n\tposition: relative;\n\tmargin: 2px 0 0 0;\n\tpadding: .5em .5em .5em .7em;\n\tfont-size: 100%;\n}\n.ui-accordion .ui-accordion-content {\n\tpadding: 1em 2.2em;\n\tborder-top: 0;\n\toverflow: auto;\n}\n.ui-autocomplete {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tcursor: default;\n}\n.ui-menu {\n\tlist-style: none;\n\tpadding: 0;\n\tmargin: 0;\n\tdisplay: block;\n\toutline: 0;\n}\n.ui-menu .ui-menu {\n\tposition: absolute;\n}\n.ui-menu .ui-menu-item {\n\tmargin: 0;\n\tcursor: pointer;\n\t/* support: IE10, see #8844 */\n\tlist-style-image: url(\"data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7\");\n}\n.ui-menu .ui-menu-item-wrapper {\n\tposition: relative;\n\tpadding: 3px 1em 3px .4em;\n}\n.ui-menu .ui-menu-divider {\n\tmargin: 5px 0;\n\theight: 0;\n\tfont-size: 0;\n\tline-height: 0;\n\tborder-width: 1px 0 0 0;\n}\n.ui-menu .ui-state-focus,\n.ui-menu .ui-state-active {\n\tmargin: -1px;\n}\n\n/* icon support */\n.ui-menu-icons {\n\tposition: relative;\n}\n.ui-menu-icons .ui-menu-item-wrapper {\n\tpadding-left: 2em;\n}\n\n/* left-aligned */\n.ui-menu .ui-icon {\n\tposition: absolute;\n\ttop: 0;\n\tbottom: 0;\n\tleft: .2em;\n\tmargin: auto 0;\n}\n\n/* right-aligned */\n.ui-menu .ui-menu-icon {\n\tleft: auto;\n\tright: 0;\n}\n.ui-button {\n\tpadding: .4em 1em;\n\tdisplay: inline-block;\n\tposition: relative;\n\tline-height: normal;\n\tmargin-right: .1em;\n\tcursor: pointer;\n\tvertical-align: middle;\n\ttext-align: center;\n\t-webkit-user-select: none;\n\t-moz-user-select: none;\n\t-ms-user-select: none;\n\tuser-select: none;\n\n\t/* Support: IE <= 11 */\n\toverflow: visible;\n}\n\n.ui-button,\n.ui-button:link,\n.ui-button:visited,\n.ui-button:hover,\n.ui-button:active {\n\ttext-decoration: none;\n}\n\n/* to make room for the icon, a width needs to be set here */\n.ui-button-icon-only {\n\twidth: 2em;\n\tbox-sizing: border-box;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n}\n\n/* no icon support for input elements */\ninput.ui-button.ui-button-icon-only {\n\ttext-indent: 0;\n}\n\n/* button icon element(s) */\n.ui-button-icon-only .ui-icon {\n\tposition: absolute;\n\ttop: 50%;\n\tleft: 50%;\n\tmargin-top: -8px;\n\tmargin-left: -8px;\n}\n\n.ui-button.ui-icon-notext .ui-icon {\n\tpadding: 0;\n\twidth: 2.1em;\n\theight: 2.1em;\n\ttext-indent: -9999px;\n\twhite-space: nowrap;\n\n}\n\ninput.ui-button.ui-icon-notext .ui-icon {\n\twidth: auto;\n\theight: auto;\n\ttext-indent: 0;\n\twhite-space: normal;\n\tpadding: .4em 1em;\n}\n\n/* workarounds */\n/* Support: Firefox 5 - 40 */\ninput.ui-button::-moz-focus-inner,\nbutton.ui-button::-moz-focus-inner {\n\tborder: 0;\n\tpadding: 0;\n}\n.ui-controlgroup {\n\tvertical-align: middle;\n\tdisplay: inline-block;\n}\n.ui-controlgroup > .ui-controlgroup-item {\n\tfloat: left;\n\tmargin-left: 0;\n\tmargin-right: 0;\n}\n.ui-controlgroup > .ui-controlgroup-item:focus,\n.ui-controlgroup > .ui-controlgroup-item.ui-visual-focus {\n\tz-index: 9999;\n}\n.ui-controlgroup-vertical > .ui-controlgroup-item {\n\tdisplay: block;\n\tfloat: none;\n\twidth: 100%;\n\tmargin-top: 0;\n\tmargin-bottom: 0;\n\ttext-align: left;\n}\n.ui-controlgroup-vertical .ui-controlgroup-item {\n\tbox-sizing: border-box;\n}\n.ui-controlgroup .ui-controlgroup-label {\n\tpadding: .4em 1em;\n}\n.ui-controlgroup .ui-controlgroup-label span {\n\tfont-size: 80%;\n}\n.ui-controlgroup-horizontal .ui-controlgroup-label + .ui-controlgroup-item {\n\tborder-left: none;\n}\n.ui-controlgroup-vertical .ui-controlgroup-label + .ui-controlgroup-item {\n\tborder-top: none;\n}\n.ui-controlgroup-horizontal .ui-controlgroup-label.ui-widget-content {\n\tborder-right: none;\n}\n.ui-controlgroup-vertical .ui-controlgroup-label.ui-widget-content {\n\tborder-bottom: none;\n}\n\n/* Spinner specific style fixes */\n.ui-controlgroup-vertical .ui-spinner-input {\n\n\t/* Support: IE8 only, Android < 4.4 only */\n\twidth: 75%;\n\twidth: calc( 100% - 2.4em );\n}\n.ui-controlgroup-vertical .ui-spinner .ui-spinner-up {\n\tborder-top-style: solid;\n}\n\n.ui-checkboxradio-label .ui-icon-background {\n\tbox-shadow: inset 1px 1px 1px #ccc;\n\tborder-radius: .12em;\n\tborder: none;\n}\n.ui-checkboxradio-radio-label .ui-icon-background {\n\twidth: 16px;\n\theight: 16px;\n\tborder-radius: 1em;\n\toverflow: visible;\n\tborder: none;\n}\n.ui-checkboxradio-radio-label.ui-checkboxradio-checked .ui-icon,\n.ui-checkboxradio-radio-label.ui-checkboxradio-checked:hover .ui-icon {\n\tbackground-image: none;\n\twidth: 8px;\n\theight: 8px;\n\tborder-width: 4px;\n\tborder-style: solid;\n}\n.ui-checkboxradio-disabled {\n\tpointer-events: none;\n}\n.ui-datepicker {\n\twidth: 17em;\n\tpadding: .2em .2em 0;\n\tdisplay: none;\n}\n.ui-datepicker .ui-datepicker-header {\n\tposition: relative;\n\tpadding: .2em 0;\n}\n.ui-datepicker .ui-datepicker-prev,\n.ui-datepicker .ui-datepicker-next {\n\tposition: absolute;\n\ttop: 2px;\n\twidth: 1.8em;\n\theight: 1.8em;\n}\n.ui-datepicker .ui-datepicker-prev-hover,\n.ui-datepicker .ui-datepicker-next-hover {\n\ttop: 1px;\n}\n.ui-datepicker .ui-datepicker-prev {\n\tleft: 2px;\n}\n.ui-datepicker .ui-datepicker-next {\n\tright: 2px;\n}\n.ui-datepicker .ui-datepicker-prev-hover {\n\tleft: 1px;\n}\n.ui-datepicker .ui-datepicker-next-hover {\n\tright: 1px;\n}\n.ui-datepicker .ui-datepicker-prev span,\n.ui-datepicker .ui-datepicker-next span {\n\tdisplay: block;\n\tposition: absolute;\n\tleft: 50%;\n\tmargin-left: -8px;\n\ttop: 50%;\n\tmargin-top: -8px;\n}\n.ui-datepicker .ui-datepicker-title {\n\tmargin: 0 2.3em;\n\tline-height: 1.8em;\n\ttext-align: center;\n}\n.ui-datepicker .ui-datepicker-title select {\n\tfont-size: 1em;\n\tmargin: 1px 0;\n}\n.ui-datepicker select.ui-datepicker-month,\n.ui-datepicker select.ui-datepicker-year {\n\twidth: 45%;\n}\n.ui-datepicker table {\n\twidth: 100%;\n\tfont-size: .9em;\n\tborder-collapse: collapse;\n\tmargin: 0 0 .4em;\n}\n.ui-datepicker th {\n\tpadding: .7em .3em;\n\ttext-align: center;\n\tfont-weight: bold;\n\tborder: 0;\n}\n.ui-datepicker td {\n\tborder: 0;\n\tpadding: 1px;\n}\n.ui-datepicker td span,\n.ui-datepicker td a {\n\tdisplay: block;\n\tpadding: .2em;\n\ttext-align: right;\n\ttext-decoration: none;\n}\n.ui-datepicker .ui-datepicker-buttonpane {\n\tbackground-image: none;\n\tmargin: .7em 0 0 0;\n\tpadding: 0 .2em;\n\tborder-left: 0;\n\tborder-right: 0;\n\tborder-bottom: 0;\n}\n.ui-datepicker .ui-datepicker-buttonpane button {\n\tfloat: right;\n\tmargin: .5em .2em .4em;\n\tcursor: pointer;\n\tpadding: .2em .6em .3em .6em;\n\twidth: auto;\n\toverflow: visible;\n}\n.ui-datepicker .ui-datepicker-buttonpane button.ui-datepicker-current {\n\tfloat: left;\n}\n\n/* with multiple calendars */\n.ui-datepicker.ui-datepicker-multi {\n\twidth: auto;\n}\n.ui-datepicker-multi .ui-datepicker-group {\n\tfloat: left;\n}\n.ui-datepicker-multi .ui-datepicker-group table {\n\twidth: 95%;\n\tmargin: 0 auto .4em;\n}\n.ui-datepicker-multi-2 .ui-datepicker-group {\n\twidth: 50%;\n}\n.ui-datepicker-multi-3 .ui-datepicker-group {\n\twidth: 33.3%;\n}\n.ui-datepicker-multi-4 .ui-datepicker-group {\n\twidth: 25%;\n}\n.ui-datepicker-multi .ui-datepicker-group-last .ui-datepicker-header,\n.ui-datepicker-multi .ui-datepicker-group-middle .ui-datepicker-header {\n\tborder-left-width: 0;\n}\n.ui-datepicker-multi .ui-datepicker-buttonpane {\n\tclear: left;\n}\n.ui-datepicker-row-break {\n\tclear: both;\n\twidth: 100%;\n\tfont-size: 0;\n}\n\n/* RTL support */\n.ui-datepicker-rtl {\n\tdirection: rtl;\n}\n.ui-datepicker-rtl .ui-datepicker-prev {\n\tright: 2px;\n\tleft: auto;\n}\n.ui-datepicker-rtl .ui-datepicker-next {\n\tleft: 2px;\n\tright: auto;\n}\n.ui-datepicker-rtl .ui-datepicker-prev:hover {\n\tright: 1px;\n\tleft: auto;\n}\n.ui-datepicker-rtl .ui-datepicker-next:hover {\n\tleft: 1px;\n\tright: auto;\n}\n.ui-datepicker-rtl .ui-datepicker-buttonpane {\n\tclear: right;\n}\n.ui-datepicker-rtl .ui-datepicker-buttonpane button {\n\tfloat: left;\n}\n.ui-datepicker-rtl .ui-datepicker-buttonpane button.ui-datepicker-current,\n.ui-datepicker-rtl .ui-datepicker-group {\n\tfloat: right;\n}\n.ui-datepicker-rtl .ui-datepicker-group-last .ui-datepicker-header,\n.ui-datepicker-rtl .ui-datepicker-group-middle .ui-datepicker-header {\n\tborder-right-width: 0;\n\tborder-left-width: 1px;\n}\n\n/* Icons */\n.ui-datepicker .ui-icon {\n\tdisplay: block;\n\ttext-indent: -99999px;\n\toverflow: hidden;\n\tbackground-repeat: no-repeat;\n\tleft: .5em;\n\ttop: .3em;\n}\n.ui-dialog {\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tpadding: .2em;\n\toutline: 0;\n}\n.ui-dialog .ui-dialog-titlebar {\n\tpadding: .4em 1em;\n\tposition: relative;\n}\n.ui-dialog .ui-dialog-title {\n\tfloat: left;\n\tmargin: .1em 0;\n\twhite-space: nowrap;\n\twidth: 90%;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n.ui-dialog .ui-dialog-titlebar-close {\n\tposition: absolute;\n\tright: .3em;\n\ttop: 50%;\n\twidth: 20px;\n\tmargin: -10px 0 0 0;\n\tpadding: 1px;\n\theight: 20px;\n}\n.ui-dialog .ui-dialog-content {\n\tposition: relative;\n\tborder: 0;\n\tpadding: .5em 1em;\n\tbackground: none;\n\toverflow: auto;\n}\n.ui-dialog .ui-dialog-buttonpane {\n\ttext-align: left;\n\tborder-width: 1px 0 0 0;\n\tbackground-image: none;\n\tmargin-top: .5em;\n\tpadding: .3em 1em .5em .4em;\n}\n.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset {\n\tfloat: right;\n}\n.ui-dialog .ui-dialog-buttonpane button {\n\tmargin: .5em .4em .5em 0;\n\tcursor: pointer;\n}\n.ui-dialog .ui-resizable-n {\n\theight: 2px;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-e {\n\twidth: 2px;\n\tright: 0;\n}\n.ui-dialog .ui-resizable-s {\n\theight: 2px;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-w {\n\twidth: 2px;\n\tleft: 0;\n}\n.ui-dialog .ui-resizable-se,\n.ui-dialog .ui-resizable-sw,\n.ui-dialog .ui-resizable-ne,\n.ui-dialog .ui-resizable-nw {\n\twidth: 7px;\n\theight: 7px;\n}\n.ui-dialog .ui-resizable-se {\n\tright: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-sw {\n\tleft: 0;\n\tbottom: 0;\n}\n.ui-dialog .ui-resizable-ne {\n\tright: 0;\n\ttop: 0;\n}\n.ui-dialog .ui-resizable-nw {\n\tleft: 0;\n\ttop: 0;\n}\n.ui-draggable .ui-dialog-titlebar {\n\tcursor: move;\n}\n.ui-draggable-handle {\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-resizable {\n\tposition: relative;\n}\n.ui-resizable-handle {\n\tposition: absolute;\n\tfont-size: 0.1px;\n\tdisplay: block;\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-resizable-disabled .ui-resizable-handle,\n.ui-resizable-autohide .ui-resizable-handle {\n\tdisplay: none;\n}\n.ui-resizable-n {\n\tcursor: n-resize;\n\theight: 7px;\n\twidth: 100%;\n\ttop: -5px;\n\tleft: 0;\n}\n.ui-resizable-s {\n\tcursor: s-resize;\n\theight: 7px;\n\twidth: 100%;\n\tbottom: -5px;\n\tleft: 0;\n}\n.ui-resizable-e {\n\tcursor: e-resize;\n\twidth: 7px;\n\tright: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-w {\n\tcursor: w-resize;\n\twidth: 7px;\n\tleft: -5px;\n\ttop: 0;\n\theight: 100%;\n}\n.ui-resizable-se {\n\tcursor: se-resize;\n\twidth: 12px;\n\theight: 12px;\n\tright: 1px;\n\tbottom: 1px;\n}\n.ui-resizable-sw {\n\tcursor: sw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\tbottom: -5px;\n}\n.ui-resizable-nw {\n\tcursor: nw-resize;\n\twidth: 9px;\n\theight: 9px;\n\tleft: -5px;\n\ttop: -5px;\n}\n.ui-resizable-ne {\n\tcursor: ne-resize;\n\twidth: 9px;\n\theight: 9px;\n\tright: -5px;\n\ttop: -5px;\n}\n.ui-progressbar {\n\theight: 2em;\n\ttext-align: left;\n\toverflow: hidden;\n}\n.ui-progressbar .ui-progressbar-value {\n\tmargin: -1px;\n\theight: 100%;\n}\n.ui-progressbar .ui-progressbar-overlay {\n\tbackground: url(\"data:image/gif;base64,R0lGODlhKAAoAIABAAAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAQABACwAAAAAKAAoAAACkYwNqXrdC52DS06a7MFZI+4FHBCKoDeWKXqymPqGqxvJrXZbMx7Ttc+w9XgU2FB3lOyQRWET2IFGiU9m1frDVpxZZc6bfHwv4c1YXP6k1Vdy292Fb6UkuvFtXpvWSzA+HycXJHUXiGYIiMg2R6W459gnWGfHNdjIqDWVqemH2ekpObkpOlppWUqZiqr6edqqWQAAIfkECQEAAQAsAAAAACgAKAAAApSMgZnGfaqcg1E2uuzDmmHUBR8Qil95hiPKqWn3aqtLsS18y7G1SzNeowWBENtQd+T1JktP05nzPTdJZlR6vUxNWWjV+vUWhWNkWFwxl9VpZRedYcflIOLafaa28XdsH/ynlcc1uPVDZxQIR0K25+cICCmoqCe5mGhZOfeYSUh5yJcJyrkZWWpaR8doJ2o4NYq62lAAACH5BAkBAAEALAAAAAAoACgAAAKVDI4Yy22ZnINRNqosw0Bv7i1gyHUkFj7oSaWlu3ovC8GxNso5fluz3qLVhBVeT/Lz7ZTHyxL5dDalQWPVOsQWtRnuwXaFTj9jVVh8pma9JjZ4zYSj5ZOyma7uuolffh+IR5aW97cHuBUXKGKXlKjn+DiHWMcYJah4N0lYCMlJOXipGRr5qdgoSTrqWSq6WFl2ypoaUAAAIfkECQEAAQAsAAAAACgAKAAAApaEb6HLgd/iO7FNWtcFWe+ufODGjRfoiJ2akShbueb0wtI50zm02pbvwfWEMWBQ1zKGlLIhskiEPm9R6vRXxV4ZzWT2yHOGpWMyorblKlNp8HmHEb/lCXjcW7bmtXP8Xt229OVWR1fod2eWqNfHuMjXCPkIGNileOiImVmCOEmoSfn3yXlJWmoHGhqp6ilYuWYpmTqKUgAAIfkECQEAAQAsAAAAACgAKAAAApiEH6kb58biQ3FNWtMFWW3eNVcojuFGfqnZqSebuS06w5V80/X02pKe8zFwP6EFWOT1lDFk8rGERh1TTNOocQ61Hm4Xm2VexUHpzjymViHrFbiELsefVrn6XKfnt2Q9G/+Xdie499XHd2g4h7ioOGhXGJboGAnXSBnoBwKYyfioubZJ2Hn0RuRZaflZOil56Zp6iioKSXpUAAAh+QQJAQABACwAAAAAKAAoAAACkoQRqRvnxuI7kU1a1UU5bd5tnSeOZXhmn5lWK3qNTWvRdQxP8qvaC+/yaYQzXO7BMvaUEmJRd3TsiMAgswmNYrSgZdYrTX6tSHGZO73ezuAw2uxuQ+BbeZfMxsexY35+/Qe4J1inV0g4x3WHuMhIl2jXOKT2Q+VU5fgoSUI52VfZyfkJGkha6jmY+aaYdirq+lQAACH5BAkBAAEALAAAAAAoACgAAAKWBIKpYe0L3YNKToqswUlvznigd4wiR4KhZrKt9Upqip61i9E3vMvxRdHlbEFiEXfk9YARYxOZZD6VQ2pUunBmtRXo1Lf8hMVVcNl8JafV38aM2/Fu5V16Bn63r6xt97j09+MXSFi4BniGFae3hzbH9+hYBzkpuUh5aZmHuanZOZgIuvbGiNeomCnaxxap2upaCZsq+1kAACH5BAkBAAEALAAAAAAoACgAAAKXjI8By5zf4kOxTVrXNVlv1X0d8IGZGKLnNpYtm8Lr9cqVeuOSvfOW79D9aDHizNhDJidFZhNydEahOaDH6nomtJjp1tutKoNWkvA6JqfRVLHU/QUfau9l2x7G54d1fl995xcIGAdXqMfBNadoYrhH+Mg2KBlpVpbluCiXmMnZ2Sh4GBqJ+ckIOqqJ6LmKSllZmsoq6wpQAAAh+QQJAQABACwAAAAAKAAoAAAClYx/oLvoxuJDkU1a1YUZbJ59nSd2ZXhWqbRa2/gF8Gu2DY3iqs7yrq+xBYEkYvFSM8aSSObE+ZgRl1BHFZNr7pRCavZ5BW2142hY3AN/zWtsmf12p9XxxFl2lpLn1rseztfXZjdIWIf2s5dItwjYKBgo9yg5pHgzJXTEeGlZuenpyPmpGQoKOWkYmSpaSnqKileI2FAAACH5BAkBAAEALAAAAAAoACgAAAKVjB+gu+jG4kORTVrVhRlsnn2dJ3ZleFaptFrb+CXmO9OozeL5VfP99HvAWhpiUdcwkpBH3825AwYdU8xTqlLGhtCosArKMpvfa1mMRae9VvWZfeB2XfPkeLmm18lUcBj+p5dnN8jXZ3YIGEhYuOUn45aoCDkp16hl5IjYJvjWKcnoGQpqyPlpOhr3aElaqrq56Bq7VAAAOw==\");\n\theight: 100%;\n\tfilter: alpha(opacity=25); /* support: IE8 */\n\topacity: 0.25;\n}\n.ui-progressbar-indeterminate .ui-progressbar-value {\n\tbackground-image: none;\n}\n.ui-selectable {\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-selectable-helper {\n\tposition: absolute;\n\tz-index: 100;\n\tborder: 1px dotted black;\n}\n.ui-selectmenu-menu {\n\tpadding: 0;\n\tmargin: 0;\n\tposition: absolute;\n\ttop: 0;\n\tleft: 0;\n\tdisplay: none;\n}\n.ui-selectmenu-menu .ui-menu {\n\toverflow: auto;\n\toverflow-x: hidden;\n\tpadding-bottom: 1px;\n}\n.ui-selectmenu-menu .ui-menu .ui-selectmenu-optgroup {\n\tfont-size: 1em;\n\tfont-weight: bold;\n\tline-height: 1.5;\n\tpadding: 2px 0.4em;\n\tmargin: 0.5em 0 0 0;\n\theight: auto;\n\tborder: 0;\n}\n.ui-selectmenu-open {\n\tdisplay: block;\n}\n.ui-selectmenu-text {\n\tdisplay: block;\n\tmargin-right: 20px;\n\toverflow: hidden;\n\ttext-overflow: ellipsis;\n}\n.ui-selectmenu-button.ui-button {\n\ttext-align: left;\n\twhite-space: nowrap;\n\twidth: 14em;\n}\n.ui-selectmenu-icon.ui-icon {\n\tfloat: right;\n\tmargin-top: 0;\n}\n.ui-slider {\n\tposition: relative;\n\ttext-align: left;\n}\n.ui-slider .ui-slider-handle {\n\tposition: absolute;\n\tz-index: 2;\n\twidth: 1.2em;\n\theight: 1.2em;\n\tcursor: default;\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-slider .ui-slider-range {\n\tposition: absolute;\n\tz-index: 1;\n\tfont-size: .7em;\n\tdisplay: block;\n\tborder: 0;\n\tbackground-position: 0 0;\n}\n\n/* support: IE8 - See #6727 */\n.ui-slider.ui-state-disabled .ui-slider-handle,\n.ui-slider.ui-state-disabled .ui-slider-range {\n\tfilter: inherit;\n}\n\n.ui-slider-horizontal {\n\theight: .8em;\n}\n.ui-slider-horizontal .ui-slider-handle {\n\ttop: -.3em;\n\tmargin-left: -.6em;\n}\n.ui-slider-horizontal .ui-slider-range {\n\ttop: 0;\n\theight: 100%;\n}\n.ui-slider-horizontal .ui-slider-range-min {\n\tleft: 0;\n}\n.ui-slider-horizontal .ui-slider-range-max {\n\tright: 0;\n}\n\n.ui-slider-vertical {\n\twidth: .8em;\n\theight: 100px;\n}\n.ui-slider-vertical .ui-slider-handle {\n\tleft: -.3em;\n\tmargin-left: 0;\n\tmargin-bottom: -.6em;\n}\n.ui-slider-vertical .ui-slider-range {\n\tleft: 0;\n\twidth: 100%;\n}\n.ui-slider-vertical .ui-slider-range-min {\n\tbottom: 0;\n}\n.ui-slider-vertical .ui-slider-range-max {\n\ttop: 0;\n}\n.ui-sortable-handle {\n\t-ms-touch-action: none;\n\ttouch-action: none;\n}\n.ui-spinner {\n\tposition: relative;\n\tdisplay: inline-block;\n\toverflow: hidden;\n\tpadding: 0;\n\tvertical-align: middle;\n}\n.ui-spinner-input {\n\tborder: none;\n\tbackground: none;\n\tcolor: inherit;\n\tpadding: .222em 0;\n\tmargin: .2em 0;\n\tvertical-align: middle;\n\tmargin-left: .4em;\n\tmargin-right: 2em;\n}\n.ui-spinner-button {\n\twidth: 1.6em;\n\theight: 50%;\n\tfont-size: .5em;\n\tpadding: 0;\n\tmargin: 0;\n\ttext-align: center;\n\tposition: absolute;\n\tcursor: default;\n\tdisplay: block;\n\toverflow: hidden;\n\tright: 0;\n}\n/* more specificity required here to override default borders */\n.ui-spinner a.ui-spinner-button {\n\tborder-top-style: none;\n\tborder-bottom-style: none;\n\tborder-right-style: none;\n}\n.ui-spinner-up {\n\ttop: 0;\n}\n.ui-spinner-down {\n\tbottom: 0;\n}\n.ui-tabs {\n\tposition: relative;/* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear as \"fixed\") */\n\tpadding: .2em;\n}\n.ui-tabs .ui-tabs-nav {\n\tmargin: 0;\n\tpadding: .2em .2em 0;\n}\n.ui-tabs .ui-tabs-nav li {\n\tlist-style: none;\n\tfloat: left;\n\tposition: relative;\n\ttop: 0;\n\tmargin: 1px .2em 0 0;\n\tborder-bottom-width: 0;\n\tpadding: 0;\n\twhite-space: nowrap;\n}\n.ui-tabs .ui-tabs-nav .ui-tabs-anchor {\n\tfloat: left;\n\tpadding: .5em 1em;\n\ttext-decoration: none;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active {\n\tmargin-bottom: -1px;\n\tpadding-bottom: 1px;\n}\n.ui-tabs .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-state-disabled .ui-tabs-anchor,\n.ui-tabs .ui-tabs-nav li.ui-tabs-loading .ui-tabs-anchor {\n\tcursor: text;\n}\n.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor {\n\tcursor: pointer;\n}\n.ui-tabs .ui-tabs-panel {\n\tdisplay: block;\n\tborder-width: 0;\n\tpadding: 1em 1.4em;\n\tbackground: none;\n}\n.ui-tooltip {\n\tpadding: 8px;\n\tposition: absolute;\n\tz-index: 9999;\n\tmax-width: 300px;\n}\nbody .ui-tooltip {\n\tborder-width: 2px;\n}\n/* Component containers\n----------------------------------*/\n.ui-widget {\n\tfont-family: Arial,Helvetica,sans-serif;\n\tfont-size: 1em;\n}\n.ui-widget .ui-widget {\n\tfont-size: 1em;\n}\n.ui-widget input,\n.ui-widget select,\n.ui-widget textarea,\n.ui-widget button {\n\tfont-family: Arial,Helvetica,sans-serif;\n\tfont-size: 1em;\n}\n.ui-widget.ui-widget-content {\n\tborder: 1px solid #c5c5c5;\n}\n.ui-widget-content {\n\tborder: 1px solid #dddddd;\n\tbackground: #ffffff;\n\tcolor: #333333;\n}\n.ui-widget-content a {\n\tcolor: #333333;\n}\n.ui-widget-header {\n\tborder: 1px solid #dddddd;\n\tbackground: #e9e9e9;\n\tcolor: #333333;\n\tfont-weight: bold;\n}\n.ui-widget-header a {\n\tcolor: #333333;\n}\n\n/* Interaction states\n----------------------------------*/\n.ui-state-default,\n.ui-widget-content .ui-state-default,\n.ui-widget-header .ui-state-default,\n.ui-button,\n\n/* We use html here because we need a greater specificity to make sure disabled\nworks properly when clicked or hovered */\nhtml .ui-button.ui-state-disabled:hover,\nhtml .ui-button.ui-state-disabled:active {\n\tborder: 1px solid #c5c5c5;\n\tbackground: #f6f6f6;\n\tfont-weight: normal;\n\tcolor: #454545;\n}\n.ui-state-default a,\n.ui-state-default a:link,\n.ui-state-default a:visited,\na.ui-button,\na:link.ui-button,\na:visited.ui-button,\n.ui-button {\n\tcolor: #454545;\n\ttext-decoration: none;\n}\n.ui-state-hover,\n.ui-widget-content .ui-state-hover,\n.ui-widget-header .ui-state-hover,\n.ui-state-focus,\n.ui-widget-content .ui-state-focus,\n.ui-widget-header .ui-state-focus,\n.ui-button:hover,\n.ui-button:focus {\n\tborder: 1px solid #cccccc;\n\tbackground: #ededed;\n\tfont-weight: normal;\n\tcolor: #2b2b2b;\n}\n.ui-state-hover a,\n.ui-state-hover a:hover,\n.ui-state-hover a:link,\n.ui-state-hover a:visited,\n.ui-state-focus a,\n.ui-state-focus a:hover,\n.ui-state-focus a:link,\n.ui-state-focus a:visited,\na.ui-button:hover,\na.ui-button:focus {\n\tcolor: #2b2b2b;\n\ttext-decoration: none;\n}\n\n.ui-visual-focus {\n\tbox-shadow: 0 0 3px 1px rgb(94, 158, 214);\n}\n.ui-state-active,\n.ui-widget-content .ui-state-active,\n.ui-widget-header .ui-state-active,\na.ui-button:active,\n.ui-button:active,\n.ui-button.ui-state-active:hover {\n\tborder: 1px solid #003eff;\n\tbackground: #007fff;\n\tfont-weight: normal;\n\tcolor: #ffffff;\n}\n.ui-icon-background,\n.ui-state-active .ui-icon-background {\n\tborder: #003eff;\n\tbackground-color: #ffffff;\n}\n.ui-state-active a,\n.ui-state-active a:link,\n.ui-state-active a:visited {\n\tcolor: #ffffff;\n\ttext-decoration: none;\n}\n\n/* Interaction Cues\n----------------------------------*/\n.ui-state-highlight,\n.ui-widget-content .ui-state-highlight,\n.ui-widget-header .ui-state-highlight {\n\tborder: 1px solid #dad55e;\n\tbackground: #fffa90;\n\tcolor: #777620;\n}\n.ui-state-checked {\n\tborder: 1px solid #dad55e;\n\tbackground: #fffa90;\n}\n.ui-state-highlight a,\n.ui-widget-content .ui-state-highlight a,\n.ui-widget-header .ui-state-highlight a {\n\tcolor: #777620;\n}\n.ui-state-error,\n.ui-widget-content .ui-state-error,\n.ui-widget-header .ui-state-error {\n\tborder: 1px solid #f1a899;\n\tbackground: #fddfdf;\n\tcolor: #5f3f3f;\n}\n.ui-state-error a,\n.ui-widget-content .ui-state-error a,\n.ui-widget-header .ui-state-error a {\n\tcolor: #5f3f3f;\n}\n.ui-state-error-text,\n.ui-widget-content .ui-state-error-text,\n.ui-widget-header .ui-state-error-text {\n\tcolor: #5f3f3f;\n}\n.ui-priority-primary,\n.ui-widget-content .ui-priority-primary,\n.ui-widget-header .ui-priority-primary {\n\tfont-weight: bold;\n}\n.ui-priority-secondary,\n.ui-widget-content .ui-priority-secondary,\n.ui-widget-header .ui-priority-secondary {\n\topacity: .7;\n\tfilter:Alpha(Opacity=70); /* support: IE8 */\n\tfont-weight: normal;\n}\n.ui-state-disabled,\n.ui-widget-content .ui-state-disabled,\n.ui-widget-header .ui-state-disabled {\n\topacity: .35;\n\tfilter:Alpha(Opacity=35); /* support: IE8 */\n\tbackground-image: none;\n}\n.ui-state-disabled .ui-icon {\n\tfilter:Alpha(Opacity=35); /* support: IE8 - See #6059 */\n}\n\n/* Icons\n----------------------------------*/\n\n/* states and images */\n.ui-icon {\n\twidth: 16px;\n\theight: 16px;\n}\n.ui-icon,\n.ui-widget-content .ui-icon {\n\tbackground-image: url(\"images/ui-icons_444444_256x240.png\");\n}\n.ui-widget-header .ui-icon {\n\tbackground-image: url(\"images/ui-icons_444444_256x240.png\");\n}\n.ui-state-hover .ui-icon,\n.ui-state-focus .ui-icon,\n.ui-button:hover .ui-icon,\n.ui-button:focus .ui-icon {\n\tbackground-image: url(\"images/ui-icons_555555_256x240.png\");\n}\n.ui-state-active .ui-icon,\n.ui-button:active .ui-icon {\n\tbackground-image: url(\"images/ui-icons_ffffff_256x240.png\");\n}\n.ui-state-highlight .ui-icon,\n.ui-button .ui-state-highlight.ui-icon {\n\tbackground-image: url(\"images/ui-icons_777620_256x240.png\");\n}\n.ui-state-error .ui-icon,\n.ui-state-error-text .ui-icon {\n\tbackground-image: url(\"images/ui-icons_cc0000_256x240.png\");\n}\n.ui-button .ui-icon {\n\tbackground-image: url(\"images/ui-icons_777777_256x240.png\");\n}\n\n/* positioning */\n.ui-icon-blank { background-position: 16px 16px; }\n.ui-icon-caret-1-n { background-position: 0 0; }\n.ui-icon-caret-1-ne { background-position: -16px 0; }\n.ui-icon-caret-1-e { background-position: -32px 0; }\n.ui-icon-caret-1-se { background-position: -48px 0; }\n.ui-icon-caret-1-s { background-position: -65px 0; }\n.ui-icon-caret-1-sw { background-position: -80px 0; }\n.ui-icon-caret-1-w { background-position: -96px 0; }\n.ui-icon-caret-1-nw { background-position: -112px 0; }\n.ui-icon-caret-2-n-s { background-position: -128px 0; }\n.ui-icon-caret-2-e-w { background-position: -144px 0; }\n.ui-icon-triangle-1-n { background-position: 0 -16px; }\n.ui-icon-triangle-1-ne { background-position: -16px -16px; }\n.ui-icon-triangle-1-e { background-position: -32px -16px; }\n.ui-icon-triangle-1-se { background-position: -48px -16px; }\n.ui-icon-triangle-1-s { background-position: -65px -16px; }\n.ui-icon-triangle-1-sw { background-position: -80px -16px; }\n.ui-icon-triangle-1-w { background-position: -96px -16px; }\n.ui-icon-triangle-1-nw { background-position: -112px -16px; }\n.ui-icon-triangle-2-n-s { background-position: -128px -16px; }\n.ui-icon-triangle-2-e-w { background-position: -144px -16px; }\n.ui-icon-arrow-1-n { background-position: 0 -32px; }\n.ui-icon-arrow-1-ne { background-position: -16px -32px; }\n.ui-icon-arrow-1-e { background-position: -32px -32px; }\n.ui-icon-arrow-1-se { background-position: -48px -32px; }\n.ui-icon-arrow-1-s { background-position: -65px -32px; }\n.ui-icon-arrow-1-sw { background-position: -80px -32px; }\n.ui-icon-arrow-1-w { background-position: -96px -32px; }\n.ui-icon-arrow-1-nw { background-position: -112px -32px; }\n.ui-icon-arrow-2-n-s { background-position: -128px -32px; }\n.ui-icon-arrow-2-ne-sw { background-position: -144px -32px; }\n.ui-icon-arrow-2-e-w { background-position: -160px -32px; }\n.ui-icon-arrow-2-se-nw { background-position: -176px -32px; }\n.ui-icon-arrowstop-1-n { background-position: -192px -32px; }\n.ui-icon-arrowstop-1-e { background-position: -208px -32px; }\n.ui-icon-arrowstop-1-s { background-position: -224px -32px; }\n.ui-icon-arrowstop-1-w { background-position: -240px -32px; }\n.ui-icon-arrowthick-1-n { background-position: 1px -48px; }\n.ui-icon-arrowthick-1-ne { background-position: -16px -48px; }\n.ui-icon-arrowthick-1-e { background-position: -32px -48px; }\n.ui-icon-arrowthick-1-se { background-position: -48px -48px; }\n.ui-icon-arrowthick-1-s { background-position: -64px -48px; }\n.ui-icon-arrowthick-1-sw { background-position: -80px -48px; }\n.ui-icon-arrowthick-1-w { background-position: -96px -48px; }\n.ui-icon-arrowthick-1-nw { background-position: -112px -48px; }\n.ui-icon-arrowthick-2-n-s { background-position: -128px -48px; }\n.ui-icon-arrowthick-2-ne-sw { background-position: -144px -48px; }\n.ui-icon-arrowthick-2-e-w { background-position: -160px -48px; }\n.ui-icon-arrowthick-2-se-nw { background-position: -176px -48px; }\n.ui-icon-arrowthickstop-1-n { background-position: -192px -48px; }\n.ui-icon-arrowthickstop-1-e { background-position: -208px -48px; }\n.ui-icon-arrowthickstop-1-s { background-position: -224px -48px; }\n.ui-icon-arrowthickstop-1-w { background-position: -240px -48px; }\n.ui-icon-arrowreturnthick-1-w { background-position: 0 -64px; }\n.ui-icon-arrowreturnthick-1-n { background-position: -16px -64px; }\n.ui-icon-arrowreturnthick-1-e { background-position: -32px -64px; }\n.ui-icon-arrowreturnthick-1-s { background-position: -48px -64px; }\n.ui-icon-arrowreturn-1-w { background-position: -64px -64px; }\n.ui-icon-arrowreturn-1-n { background-position: -80px -64px; }\n.ui-icon-arrowreturn-1-e { background-position: -96px -64px; }\n.ui-icon-arrowreturn-1-s { background-position: -112px -64px; }\n.ui-icon-arrowrefresh-1-w { background-position: -128px -64px; }\n.ui-icon-arrowrefresh-1-n { background-position: -144px -64px; }\n.ui-icon-arrowrefresh-1-e { background-position: -160px -64px; }\n.ui-icon-arrowrefresh-1-s { background-position: -176px -64px; }\n.ui-icon-arrow-4 { background-position: 0 -80px; }\n.ui-icon-arrow-4-diag { background-position: -16px -80px; }\n.ui-icon-extlink { background-position: -32px -80px; }\n.ui-icon-newwin { background-position: -48px -80px; }\n.ui-icon-refresh { background-position: -64px -80px; }\n.ui-icon-shuffle { background-position: -80px -80px; }\n.ui-icon-transfer-e-w { background-position: -96px -80px; }\n.ui-icon-transferthick-e-w { background-position: -112px -80px; }\n.ui-icon-folder-collapsed { background-position: 0 -96px; }\n.ui-icon-folder-open { background-position: -16px -96px; }\n.ui-icon-document { background-position: -32px -96px; }\n.ui-icon-document-b { background-position: -48px -96px; }\n.ui-icon-note { background-position: -64px -96px; }\n.ui-icon-mail-closed { background-position: -80px -96px; }\n.ui-icon-mail-open { background-position: -96px -96px; }\n.ui-icon-suitcase { background-position: -112px -96px; }\n.ui-icon-comment { background-position: -128px -96px; }\n.ui-icon-person { background-position: -144px -96px; }\n.ui-icon-print { background-position: -160px -96px; }\n.ui-icon-trash { background-position: -176px -96px; }\n.ui-icon-locked { background-position: -192px -96px; }\n.ui-icon-unlocked { background-position: -208px -96px; }\n.ui-icon-bookmark { background-position: -224px -96px; }\n.ui-icon-tag { background-position: -240px -96px; }\n.ui-icon-home { background-position: 0 -112px; }\n.ui-icon-flag { background-position: -16px -112px; }\n.ui-icon-calendar { background-position: -32px -112px; }\n.ui-icon-cart { background-position: -48px -112px; }\n.ui-icon-pencil { background-position: -64px -112px; }\n.ui-icon-clock { background-position: -80px -112px; }\n.ui-icon-disk { background-position: -96px -112px; }\n.ui-icon-calculator { background-position: -112px -112px; }\n.ui-icon-zoomin { background-position: -128px -112px; }\n.ui-icon-zoomout { background-position: -144px -112px; }\n.ui-icon-search { background-position: -160px -112px; }\n.ui-icon-wrench { background-position: -176px -112px; }\n.ui-icon-gear { background-position: -192px -112px; }\n.ui-icon-heart { background-position: -208px -112px; }\n.ui-icon-star { background-position: -224px -112px; }\n.ui-icon-link { background-position: -240px -112px; }\n.ui-icon-cancel { background-position: 0 -128px; }\n.ui-icon-plus { background-position: -16px -128px; }\n.ui-icon-plusthick { background-position: -32px -128px; }\n.ui-icon-minus { background-position: -48px -128px; }\n.ui-icon-minusthick { background-position: -64px -128px; }\n.ui-icon-close { background-position: -80px -128px; }\n.ui-icon-closethick { background-position: -96px -128px; }\n.ui-icon-key { background-position: -112px -128px; }\n.ui-icon-lightbulb { background-position: -128px -128px; }\n.ui-icon-scissors { background-position: -144px -128px; }\n.ui-icon-clipboard { background-position: -160px -128px; }\n.ui-icon-copy { background-position: -176px -128px; }\n.ui-icon-contact { background-position: -192px -128px; }\n.ui-icon-image { background-position: -208px -128px; }\n.ui-icon-video { background-position: -224px -128px; }\n.ui-icon-script { background-position: -240px -128px; }\n.ui-icon-alert { background-position: 0 -144px; }\n.ui-icon-info { background-position: -16px -144px; }\n.ui-icon-notice { background-position: -32px -144px; }\n.ui-icon-help { background-position: -48px -144px; }\n.ui-icon-check { background-position: -64px -144px; }\n.ui-icon-bullet { background-position: -80px -144px; }\n.ui-icon-radio-on { background-position: -96px -144px; }\n.ui-icon-radio-off { background-position: -112px -144px; }\n.ui-icon-pin-w { background-position: -128px -144px; }\n.ui-icon-pin-s { background-position: -144px -144px; }\n.ui-icon-play { background-position: 0 -160px; }\n.ui-icon-pause { background-position: -16px -160px; }\n.ui-icon-seek-next { background-position: -32px -160px; }\n.ui-icon-seek-prev { background-position: -48px -160px; }\n.ui-icon-seek-end { background-position: -64px -160px; }\n.ui-icon-seek-start { background-position: -80px -160px; }\n/* ui-icon-seek-first is deprecated, use ui-icon-seek-start instead */\n.ui-icon-seek-first { background-position: -80px -160px; }\n.ui-icon-stop { background-position: -96px -160px; }\n.ui-icon-eject { background-position: -112px -160px; }\n.ui-icon-volume-off { background-position: -128px -160px; }\n.ui-icon-volume-on { background-position: -144px -160px; }\n.ui-icon-power { background-position: 0 -176px; }\n.ui-icon-signal-diag { background-position: -16px -176px; }\n.ui-icon-signal { background-position: -32px -176px; }\n.ui-icon-battery-0 { background-position: -48px -176px; }\n.ui-icon-battery-1 { background-position: -64px -176px; }\n.ui-icon-battery-2 { background-position: -80px -176px; }\n.ui-icon-battery-3 { background-position: -96px -176px; }\n.ui-icon-circle-plus { background-position: 0 -192px; }\n.ui-icon-circle-minus { background-position: -16px -192px; }\n.ui-icon-circle-close { background-position: -32px -192px; }\n.ui-icon-circle-triangle-e { background-position: -48px -192px; }\n.ui-icon-circle-triangle-s { background-position: -64px -192px; }\n.ui-icon-circle-triangle-w { background-position: -80px -192px; }\n.ui-icon-circle-triangle-n { background-position: -96px -192px; }\n.ui-icon-circle-arrow-e { background-position: -112px -192px; }\n.ui-icon-circle-arrow-s { background-position: -128px -192px; }\n.ui-icon-circle-arrow-w { background-position: -144px -192px; }\n.ui-icon-circle-arrow-n { background-position: -160px -192px; }\n.ui-icon-circle-zoomin { background-position: -176px -192px; }\n.ui-icon-circle-zoomout { background-position: -192px -192px; }\n.ui-icon-circle-check { background-position: -208px -192px; }\n.ui-icon-circlesmall-plus { background-position: 0 -208px; }\n.ui-icon-circlesmall-minus { background-position: -16px -208px; }\n.ui-icon-circlesmall-close { background-position: -32px -208px; }\n.ui-icon-squaresmall-plus { background-position: -48px -208px; }\n.ui-icon-squaresmall-minus { background-position: -64px -208px; }\n.ui-icon-squaresmall-close { background-position: -80px -208px; }\n.ui-icon-grip-dotted-vertical { background-position: 0 -224px; }\n.ui-icon-grip-dotted-horizontal { background-position: -16px -224px; }\n.ui-icon-grip-solid-vertical { background-position: -32px -224px; }\n.ui-icon-grip-solid-horizontal { background-position: -48px -224px; }\n.ui-icon-gripsmall-diagonal-se { background-position: -64px -224px; }\n.ui-icon-grip-diagonal-se { background-position: -80px -224px; }\n\n\n/* Misc visuals\n----------------------------------*/\n\n/* Corner radius */\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-left,\n.ui-corner-tl {\n\tborder-top-left-radius: 3px;\n}\n.ui-corner-all,\n.ui-corner-top,\n.ui-corner-right,\n.ui-corner-tr {\n\tborder-top-right-radius: 3px;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-left,\n.ui-corner-bl {\n\tborder-bottom-left-radius: 3px;\n}\n.ui-corner-all,\n.ui-corner-bottom,\n.ui-corner-right,\n.ui-corner-br {\n\tborder-bottom-right-radius: 3px;\n}\n\n/* Overlays */\n.ui-widget-overlay {\n\tbackground: #aaaaaa;\n\topacity: .3;\n\tfilter: Alpha(Opacity=30); /* support: IE8 */\n}\n.ui-widget-shadow {\n\t-webkit-box-shadow: 0px 0px 5px #666666;\n\tbox-shadow: 0px 0px 5px #666666;\n}\n\n</style>");
  var maxrate = 0,
      minrate = 99999,
      maxlabel = 0,
      minlabel = 9999999,
      maxfc = 0,
      minfc = 999999,
      maxage = 0,
      minage = 99999,
      configExprMilliseconds = 36e5 * GM_getValue("tinfoexprhours", 168),
      num = /[0-9]*/g;

  function updateTeacherinfoToUI(jqel, tinfo) {
    if (tinfo.label > maxlabel) maxlabel = tinfo.label;
    if (tinfo.label < minlabel) minlabel = tinfo.label;
    if (tinfo.favoritesCount > maxfc) maxfc = tinfo.favoritesCount;
    if (tinfo.favoritesCount < minfc) minfc = tinfo.favoritesCount;
    if (tinfo.thumbupRate > maxrate) maxrate = tinfo.thumbupRate;
    if (tinfo.thumbupRate < minrate) minrate = tinfo.thumbupRate;
    if (tinfo.age > maxage) maxage = tinfo.age ? tinfo.age : 100;
    if (tinfo.age < minage) minage = tinfo.age ? tinfo.age : 0;
    jqel.attr("teacherinfo", JSON.stringify(tinfo));
    jqel.find(".teacher-name").html(jqel.find(".teacher-name").html() + "<br /><label title='\u8BC4\u8BBA\u6807\u7B7E\u6570\u91CF'>".concat(tinfo.label, "</label>|<label title='\u597D\u8BC4\u7387'>").concat(tinfo.thumbupRate, "%</label>\n            | <label title='\u6536\u85CF\u6570\u91CF'>").concat(tinfo.favoritesCount, " </label> ")); // jqel.find(".teacher-age").html(jqel.find(".teacher-age").html() + " | <label title='收藏数量'>" + tinfo.favoritesCount + "</label>");

    jqel.attr("indicator", tinfo.indicator);
  }

  function executeFilters(uifilters) {
    var tcount = 0,
        hidecount = 0;
    $.each($(".item"), function (i, item) {
      var node = $(item),
          tinfojson = node.attr("teacherinfo");

      if (!tinfojson) {
        return true;
      }

      var tinfo = JSON.parse(tinfojson),
          ret = true;
      if (!isNaN(tinfo.thumbupRate)) ret = tinfo.thumbupRate >= uifilters.rate1 && tinfo.thumbupRate <= uifilters.rate2;
      if (!isNaN(tinfo.label)) ret = tinfo.label >= uifilters.l1 && tinfo.label <= uifilters.l2 && ret;
      if (!isNaN(tinfo.age)) tinfo.age >= uifilters.age1 && tinfo.age <= uifilters.age2 && ret;
      if (!isNaN(tinfo.favoritesCount)) tinfo.favoritesCount >= uifilters.fc1 && tinfo.favoritesCount <= uifilters.fc2 && ret;

      if (ret) {
        if (node.is(":hidden")) {
          //如果node是隐藏的则显示node元素，否则隐藏
          node.show();
          node.animate({
            left: "+=50"
          }, 3500).animate({
            left: "-=50"
          }, 3500);
        } else {//nothing todo
        }

        tcount++;
      } else {
        node.css("color", "white").hide();
        hidecount++;
      }
    });
    $("#tcount").text(tcount);
    $("#thidecount").text(hidecount);
  }

  function getUiFilters() {
    var l1 = $("#tlabelslider").slider("values", 0),
        l2 = $("#tlabelslider").slider("values", 1),
        rate1 = $("#thumbupRateslider").slider("values", 0),
        rate2 = $("#thumbupRateslider").slider("values", 1),
        age1 = $("#tAgeSlider").slider("values", 0),
        age2 = $("#tAgeSlider").slider("values", 1),
        fc1 = $("#fcSlider").slider("values", 0),
        fc2 = $("#fcSlider").slider("values", 1);
    return {
      l1: l1,
      l2: l2,
      rate1: rate1,
      rate2: rate2,
      age1: age1,
      age2: age2,
      fc1: fc1,
      fc2: fc2
    };
  }

  function getinfokey() {
    return "tinfo-" + gettid();
  }

  if (settings.isListPage) {
    $(".item-top-cont").prop("innerHTML", function (i, val) {
      return val.replaceAll("<!--", "").replaceAll("-->", "");
    }); // 自动获取时,显示停止按钮

    submit(function (next) {
      var totalPages = Number($(".s-t-page>a:eq(-2)").text()),
          curPageId = window.parameters().pageID ? window.parameters().pageID : 1,
          remainPages = totalPages - curPageId,
          autonextpagecount = GM_getValue("autonextpagecount", 1);

      if (autonextpagecount > 0 && $(".s-t-page>.next-page").length > 0) {
        var dialog = $("<div id=\"dialog-confirm\" title=\"\u662F\u5426\u505C\u6B62\u81EA\u52A8\u641C\u7D22\u8001\u5E08?\">\n<p><span class=\"ui-icon ui-icon-alert\" style=\"float:left; margin:12px 12px 20px 0;\"></span>\n<b>\u6B63\u5728\u6839\u636E\u60A8\u7684\u9009\u62E9\u81EA\u52A8\u83B7\u53D6\u6559\u5E08\u4FE1\u606F</b><br><br>\n\u5269\u4F59".concat(sessionStorage.getItem("selectedTimeSlotsRemain"), "/").concat(sessionStorage.getItem("selectedTimeSlotsTotal"), "\u4E2A\u65F6\u6BB5\uFF0C<br><br>\n\u5F53\u524D\u65F6\u6BB5\u7EA6").concat(totalPages * 28, "\u4E2A\u6559\u5E08\uFF0C\u83B7\u53D6\u7B2C").concat(curPageId, "/").concat(totalPages, "\u9875\uFF0C\u8FDB\u5EA6").concat(Math.floor(curPageId / totalPages * 100), "%,<br>\n\n</p>\n</div>"));
        dialog.appendTo("body");
        dialog.dialog({
          resizable: false,
          height: "auto",
          width: 400,
          modal: false,
          buttons: {
            立即停止: function 立即停止() {
              sessionStorage.setItem("selectedTimeSlots", "");
              GM_setValue("autonextpagecount", 0);
              $(this).dialog("close");
            } // [`取后${(remainPages*0.25).toFixed(0)}页`]: function() {
            // sessionStorage.setItem('selectedTimeSlots', '');
            // GM_setValue('autonextpagecount', (remainPages * 0.25).toFixed(0));
            // $(this).dialog("close");
            // },
            // [`取后${(remainPages*0.5).toFixed(0)}页`]: function() {
            // sessionStorage.setItem('selectedTimeSlots', '');
            // GM_setValue('autonextpagecount', (remainPages * 0.5).toFixed(0));
            // $(this).dialog("close");
            // },
            // [`取后${(remainPages*0.75).toFixed(0)}页`]: function() {
            // sessionStorage.setItem('selectedTimeSlots', '');
            // GM_setValue('autonextpagecount', (remainPages * 0.75).toFixed(0));
            // $(this).dialog("close");
            // },

          }
        });
      }

      next();
    });

    function getTeacherInfoInList(jqel) {
      var age = 0,
          label = function () {
        var j_len = jqel.find(".label").text().match(num).clean("").length,
            l = 0;

        for (var j = 0; j < j_len; j++) {
          l += Number(jqel.find(".label").text().match(num).clean("")[j]);
        }

        return l;
      }(),
          name = jqel.find(".teacher-name").text(),
          type = $(".s-t-top-list .li-active").text(),
          effectivetime = getBatchNumber();

      if (type == "收藏外教") {
        var isfavorite = true;
        return {
          age: age,
          label: label,
          name: name,
          effectivetime: effectivetime,
          isfavorite: isfavorite
        };
      } else return {
        age: age,
        label: label,
        name: name,
        effectivetime: effectivetime,
        type: type
      };
    } //获取列表中数据


    $(".item").each(function (index, el) {
      submit(function (next) {
        Pace.track(function () {
          var jqel = $(el),
              tid = jqel.find(".teacher-details-link a").attr("href").replace("https://www.51talk.com/TeacherNew/info/", "").replace("http://www.51talk.com/TeacherNew/info/", ""),
              tinfokey = "tinfo-" + tid,
              teacherlistinfo = getTeacherInfoInList(jqel),
              tinfo = GM_getValue(tinfokey);

          if (tinfo) {
            var now = Date.now();

            if (!tinfo.expire) {
              tinfo.expire = new Date(1970, 1, 1).getTime();
            }

            tinfo = $.extend(tinfo, teacherlistinfo);
            GM_setValue(tinfokey, tinfo);

            if (now - tinfo.expire < configExprMilliseconds) {
              updateTeacherinfoToUI(jqel, tinfo);
              next();
              return true;
            }
          } // ajax 请求一定要包含在一个函数中


          var start = Date.now();
          $.ajax({
            url: window.location.protocol + "//www.51talk.com/TeacherNew/teacherComment?tid=" + tid + "&type=bad&has_msg=1",
            type: "GET",
            dateType: "html",
            success: function success(r) {
              var jqr = $(r);

              if (jqr.find(".teacher-name-tit").length > 0) {
                var tempitem = jqr.find(".teacher-name-tit")[0];
                tempitem.innerHTML = tempitem.innerHTML.replace("<!--", "").replace("-->", "");
              }

              if (jqr.find(".evaluate-content-left span").length >= 3) {
                var thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]),
                    thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]),
                    favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]),
                    isfavorite = jqr.find(".go-search.cancel-collection").length > 0,
                    agesstr = jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean(""),
                    tage = Number(agesstr[1]),
                    age = Number(agesstr[0]),
                    slevel = jqr.find(".sui-students").text();
                jqr.remove();
                var tinfo = {
                  slevel: slevel,
                  tage: tage,
                  age: age,
                  thumbup: thumbup,
                  thumbdown: thumbdown,
                  thumbupRate: 100,
                  favoritesCount: favoritesCount,
                  isfavorite: isfavorite,
                  expire: Date.now()
                };
                tinfo = $.extend(tinfo, teacherlistinfo);
                tinfo.thumbupRate = calcThumbRate(tinfo);
                tinfo.indicator = calcIndicator(tinfo);
                GM_setValue(tinfokey, tinfo);
                updateTeacherinfoToUI(jqel, tinfo);
              } else {
                console.log("Teacher s detail info getting error:" + JSON.stringify(jqel) + ",error info:" + r);
              }
            },
            error: function error(data) {
              console.log("xhr error when getting teacher " + JSON.stringify(jqel) + ",error msg:" + JSON.stringify(data));
            }
          }).always(function () {
            while (Date.now() - start < 600) {
              continue;
            }

            next();
          });
        });
      });
    });
    submit(function (next) {
      //翻页
      var autonextpagecount = GM_getValue("autonextpagecount", 0);

      if (autonextpagecount > 0) {
        GM_setValue("autonextpagecount", autonextpagecount - 1);

        if ($(".s-t-page>.next-page").length == 0) {
          GM_setValue("autonextpagecount", 0);
          if (isStopShowboxAndAutoGetNextTimeTeachers()) return;
        } else {
          $(".s-t-page .next-page")[0].click();
          return false;
        }
      } else {
        if (isStopShowboxAndAutoGetNextTimeTeachers()) return;
      }

      next();
    });
  }

  function calcIndicator(tinfo) {
    return Math.ceil(tinfo.label * tinfo.thumbupRate / 100) + tinfo.favoritesCount;
  }

  function calcThumbRate(tinfo) {
    var all = tinfo.thumbdown + tinfo.thumbup;
    if (all < 1) all = 1;
    return ((tinfo.thumbup + 1e-5) / all).toFixed(2) * 100;
  }

  function isStopShowboxAndAutoGetNextTimeTeachers() {
    var str = sessionStorage.getItem("selectedTimeSlots");
    if (!str) return false;
    var selectedTimeSlots = JSON.parse(str),
        cur = selectedTimeSlots.shift();

    if (cur) {
      GM_setValue("autonextpagecount", 500);
      sessionStorage.setItem("selectedTimeSlots", JSON.stringify(selectedTimeSlots));
      sessionStorage.setItem("selectedTimeSlotsRemain", selectedTimeSlots.length);
      $('form[name="searchform"]>input[name="selectTime"]').val(cur);
      $('form[name="searchform"]>input[name="pageID"]').val(1);
      $(".go-search").trigger("click");
      return true;
    }

    return false;
  }

  if (settings.isDetailPage) {
    function processTeacherDetailPage(jqr) {
      jqr.find(".teacher-name-tit").prop("innerHTML", function (i, val) {
        return val.replaceAll("<!--", "").replaceAll("-->", "");
      });
      var tinfo = GM_getValue(getinfokey(), {});

      tinfo.label = function () {
        var l = 0;
        $.each(jqr.find(".t-d-label").text().match(num).clean(""), function (i, val) {
          l += Number(val);
        });
        return l;
      }(); //if never set expire then


      if (!tinfo.expire) tinfo.expire = Date.now();

      if (window.location.href.toLocaleLowerCase().includes("teachercomment")) {
        tinfo.thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]);
        tinfo.thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]);
        tinfo.thumbupRate = calcThumbRate(tinfo);
        tinfo.slevel = jqr.find(".sui-students").text();
        tinfo.expire = Date.now();
      }

      tinfo.favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]);
      tinfo.isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
      tinfo.name = jqr.find(".t-name").text().trim(); //无法获取type
      //tinfo.type = $('.s-t-top-list .li-active').text().trim();

      var agesstr = jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("");
      tinfo.tage = Number(agesstr[1]);
      tinfo.age = Number(agesstr[0]);
      tinfo.effectivetime = getBatchNumber();
      tinfo.indicator = calcIndicator(tinfo);
      GM_setValue(getinfokey(), tinfo);
      jqr.find(".teacher-name-tit").prop("innerHTML", function (i, val) {
        return "".concat(val, "\n    <span class=\"age age-line\"><label title='\u6307\u6807'>").concat(tinfo.indicator, "</label></span>\n    <span class=\"age age-line\"><label title='\u597D\u8BC4\u7387'>").concat(tinfo.thumbupRate, "%</label></span>\n    <span class=\"age age-line\"><label title='\u88AB\u8D5E\u6570\u91CF'>").concat(tinfo.thumbup, "</label></span>\n    <span class=\"age age-line\"><label title='\u88AB\u8E29\u6570\u91CF'>").concat(tinfo.thumbdown, "</label></span>\n    <span class=\"age age-line\"><label title='\u8BC4\u8BBA\u6807\u7B7E\u6570\u91CF'>").concat(tinfo.label, "</label></span>\n      <span class=\"age age-line\"><label title='\u5728\u540C\u7C7B\u522B\u6559\u5E08\u4E2D\u7684\u6392\u540D'><span id=\"teacherRank\"></span></label></span>\n    ");
      });
    }

    submit(function (next) {
      processTeacherDetailPage($(document));
      next();
    });
  }

  function addCheckbox(val, lbl, group) {
    var container = $("#timesmutipulecheck"),
        inputs = container.find("input"),
        id = inputs.length + 1;
    $("<input />", {
      type: "checkbox",
      id: "cb" + id,
      value: val,
      name: group
    }).appendTo(container);
    $("<label />", {
      "for": "cb" + id,
      text: lbl ? lbl : val
    }).appendTo(container);
  }

  if (settings.isListPage || settings.isDetailPage) {
    //构建插件信息
    submit(function (next) {
      try {
        var _config = GM_getValue("filterconfig", {
          l1: 300,
          l2: maxlabel,
          rate1: 97,
          rate2: maxrate,
          age1: minage,
          age2: maxage
        }),
            buttons = "";

        if (settings.isListPage) {
          buttons = "\n            <div id='buttons' style='text-align: center'>\n            <button id='asc' title='\u5F53\u524D\u4E3A\u964D\u5E8F\uFF0C\u70B9\u51FB\u540E\u6309\u5347\u5E8F\u6392\u5217'>\u5347\u5E8F</button>\n            <button id='desc' title='\u5F53\u524D\u4E3A\u5347\u5E8F\uFF0C\u70B9\u51FB\u8FDB\u884C\u964D\u5E8F\u6392\u5217' style='display:none;'>\u964D\u5E8F</button>&nbsp;\n            <input id='tinfoexprhours' title='\u7F13\u5B58\u8FC7\u671F\u65F6\u95F4\uFF08\u5C0F\u65F6\uFF09'>&nbsp;\n            <button title='\u6E05\u7A7A\u7F13\u5B58\uFF0C\u5E76\u91CD\u65B0\u641C\u7D22'>\u6E05\u9664\u7F13\u5B58</button>&nbsp;\n            <a>\u62A5\u544ABUG</a>&nbsp;\n            <a>\u5E2E\u52A9</a>&nbsp;\n          </div>\n          <div id='buttons1' style='text-align: center;'>\n            <div id='timesmutipulecheck'></div>\n            <button>\u53CD\u9009\u65F6\u95F4\u6BB5</button>&nbsp;\n            <button id='autogettodaysteachers' title='\u81EA\u52A8\u83B7\u53D6\u4E0A\u8FF0\u9009\u62E9\u65F6\u6BB5\u7684\u5168\u90E8\u6559\u5E08\u5E76\u7F13\u5B58'>\u83B7\u53D6\u9009\u5B9A\u65F6\u6BB5\u8001\u5E08</button>&nbsp;\n          </div>";
        }

        $("body").append("<div id='filterdialog' title='Teacher Filter'>\n      <div id='tabs'>\n        <div>\n          <ul>\n            <li><a href=\"#tabs-1\">Search Teachers</a></li>\n            <li><a href=\"#tabs-2\">Sorted Teachers</a></li>\n          </ul>\n          <br />\n            ".concat(buttons, "\n        </div>\n        <div id=\"tabs-1\">\n          \u5F53\u524D\u53EF\u9009<span id='tcount' ></span>\u4F4D,\u88AB\u6298\u53E0<span id='thidecount' ></span>\u4F4D\u3002<br />\n          \u6709\u6548\u7ECF\u9A8C\u503C <span id='_tLabelCount' ></span><br /><div id='tlabelslider'></div>\n          \u6536\u85CF\u6570 <span id='_tfc' ></span><br /><div id='fcSlider'></div>\n          \u597D\u8BC4\u7387 <span id='_thumbupRate'></span><br /><div id='thumbupRateslider'></div>\n          \u5E74\u9F84 <span id='_tAge' ></span><br /><div id='tAgeSlider'></div>\n        </div>\n        <div id=\"tabs-2\">\n          <table id=\"teachertab\"></table>\n          <div id=\"pager5\"></div>\n        </div>\n      </div>\n    </div>"));
        $("body").append("<div id='teachlistdialog' style='display:none;'></div>");
        $("body").append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。

        $("#tlabelslider").slider({
          range: true,
          min: minlabel - 1,
          max: maxlabel,
          values: [_config.l1 < minlabel - 1 ? minlabel - 1 : _config.l1, maxlabel],
          slide: function slide(event, ui) {
            $("#_tLabelCount").html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on("slidestop", function (event, ui) {
          var l1 = $("#tlabelslider").slider("values", 0),
              l2 = $("#tlabelslider").slider("values", 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue("filterconfig", uifilters);
          filterconfig.l1 = l1;
          filterconfig.l2 = l2;
          GM_setValue("filterconfig", filterconfig);
          executeFilters(uifilters);
        });
        $("#fcSlider").slider({
          range: true,
          min: minfc,
          max: maxfc,
          values: [_config.fc1 < minfc ? minfc : _config.fc1, maxfc],
          slide: function slide(event, ui) {
            $("#_tfc").html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on("slidestop", function (event, ui) {
          var fc1 = $("#fcSlider").slider("values", 0),
              fc2 = $("#fcSlider").slider("values", 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue("filterconfig", uifilters);
          filterconfig.fc1 = fc1;
          filterconfig.fc2 = fc2;
          GM_setValue("filterconfig", filterconfig);
          executeFilters(uifilters);
        });
        $("#thumbupRateslider").slider({
          range: true,
          min: minrate,
          max: maxrate,
          values: [_config.rate1 < minrate ? minrate : _config.rate1, maxrate],
          slide: function slide(_event, ui) {
            $("#_thumbupRate").html(ui.values[0] + "% - " + ui.values[1] + "%");
          }
        }).on("slidestop", function (event, ui) {
          var rate1 = $("#thumbupRateslider").slider("values", 0),
              rate2 = $("#thumbupRateslider").slider("values", 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue("filterconfig", uifilters);
          filterconfig.rate1 = rate1;
          filterconfig.rate2 = rate2;
          GM_setValue("filterconfig", filterconfig);
          executeFilters(uifilters);
        });
        $("#tAgeSlider").slider({
          range: true,
          min: minage,
          max: maxage,
          values: [_config.age1 < minage ? minage : _config.age1, _config.age2 > maxage ? maxage : _config.age2],
          slide: function slide(event, ui) {
            $("#_tAge").html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on("slidestop", function (event, ui) {
          var age1 = $("#tAgeSlider").slider("values", 0),
              age2 = $("#tAgeSlider").slider("values", 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue("filterconfig", uifilters);
          filterconfig.age1 = age1;
          filterconfig.age2 = age2;
          console.log("log2 ".concat(age1, "  ").concat(age2));
          GM_setValue("filterconfig", filterconfig);
          executeFilters(uifilters);
        });
        $("#buttons>button,#buttons>input,#buttons>a") //升序
        .eq(0).button({
          icon: "ui-icon-arrowthick-1-n",
          showLabel: true
        }).click(function () {
          $("#desc").show();
          $(this).hide();
          sortByIndicator(asc);
        }).end() //降序
        .eq(1).button({
          icon: "ui-icon-arrowthick-1-s",
          showLabel: true
        }).click(function () {
          $("#asc").show();
          $(this).hide();
          sortByIndicator(desc);
        }).end() // 缓存过期时间（小时）
        .eq(2).spinner({
          min: 0,
          spin: function spin(event, ui) {
            GM_setValue("tinfoexprhours", ui.value);
          }
        }).css({
          width: "45px"
        }).val(GM_getValue("tinfoexprhours", configExprMilliseconds / 36e5)).end() //清空缓存
        .eq(3).button({
          icon: "uiicon-trash",
          showLabel: true
        }).click(function () {
          var keys = GM_listValues();
          $.each(keys, function (i, item) {
            var title = "\u6B63\u5728\u5220\u9664\u7B2C".concat(i, "\u4E2A\u6559\u5E08\u7F13\u5B58");
            submit(function (next) {
              try {
                $("title").html(title);
                GM_deleteValue(item);
              } finally {
                next();
              }
            });
          });
          $(".go-search").click();
        }).end() //submit suggestion
        .eq(4).button({
          icon: "ui-icon-comment",
          showLabel: true
        }).prop("href", "https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title=").prop("target", "_blank").end() //系统帮助
        .eq(5).button({
          icon: "ui-icon-help",
          showLabel: true
        }).prop("href", "https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk").prop("target", "_blank").end();
        $("#buttons1>button") //反选时间段
        .eq(0).button({
          icon: "ui-icon-seek-next",
          showLabel: true
        }).click(function () {
          $("#timesmutipulecheck>input").each(function (i, item) {
            $(item).prop("checked", !$(item).is(":checked")).change();
          });
        }).end() // 获取选定时段老师
        .eq(1).button({
          icon: "ui-icon-seek-next",
          showLabel: true
        }).click(function () {
          var selectedTimeSlots = [];
          $("#timesmutipulecheck>input").each(function (i, item) {
            if ($(item).is(":checked")) {
              selectedTimeSlots.push($(item).val());
            }
          });
          sessionStorage.setItem("selectedTimeSlots", JSON.stringify(selectedTimeSlots));
          sessionStorage.setItem("selectedTimeSlotsTotal", selectedTimeSlots.length);
          isStopShowboxAndAutoGetNextTimeTeachers();
        }).end(); //初始化时间选择按钮

        $("div.condition-type:eq(0)>ul.condition-type-time>li").each(function (i, item) {
          addCheckbox($(item).attr("data-val"), $(item).text());
        });
        var timesstr = sessionStorage.getItem("selectedTimeSlots"),
            selectedTimeSlots = [];

        if (timesstr) {
          selectedTimeSlots = JSON.parse(timesstr);

          if (selectedTimeSlots.length > 0) {
            var i = selectedTimeSlots.length;

            while (i--) {
              $("#timesmutipulecheck>input[value='" + selectedTimeSlots[i] + "']").attr("checked", true);
            }
          } else {
            $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr("checked", true);
          }
        } else {
          $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr("checked", true);
        }

        $("#timesmutipulecheck").find("input").checkboxradio({
          icon: false
        });

        function getCatchedTeachers() {
          var teachers = [];
          $.each(GM_listValues(), function (i, item) {
            if (item.startsWith("tinfo-")) {
              var t = GM_getValue(item);
              t.tid = item.slice(6, item.length);
              teachers.push(t);
            }
          });
          var indexs = {};
          teachers = teachers.sort(function (t1, t2) {
            if (t1.indicator == t2.indicator) return t1.favoritesCount > t2.favoritesCount ? -1 : 1;
            return t1.indicator > t2.indicator ? -1 : 1;
          }).map(function (val, idx) {
            if (isNaN(indexs[val.type])) {
              indexs[val.type] = 1;
            } else {
              indexs[val.type] += 1;
            }

            var t = $.extend(val, {
              // 'slevel': slevel,
              tage: Number(val.tage),
              thumbup: Number(val.thumbup),
              thumbdown: Number(val.thumbdown),
              thumbupRate: Number(val.thumbupRate),
              indicator: Number(val.indicator),
              //'favoritesCount': val.favoritesCount,
              //'isfavorite': val.isfavorite,
              //'expire': Date.now(),
              rank: indexs[val.type]
            }); //GM_setValue("tinfo-"+t.tid,t);

            return t;
          });
          return teachers;
        }

        $("#tabs").tabs({
          active: "#tabs-2",
          activate: function activate(event, ui) {
            if (ui.newPanel.attr("id") != "tabs-2") return;
            var teachers = getCatchedTeachers();
            $("#teachertab") //searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
            .jqGrid({
              data: teachers,
              datatype: "local",
              height: 240,
              colNames: ["查", "类型", "排名", "Name", "爱", "分", "标", "率%", "收藏数", "学", "教龄", "好", "差", "龄", "更新"],
              colModel: [//
              {
                name: "effectivetime",
                index: "effectivetime",
                width: 45,
                sorttype: "float",
                align: "right",
                searchoptions: {
                  sopt: ["cn"]
                },
                formatter: function formatter(value, options, rData) {
                  var date = new Date(Number(value));

                  if (date instanceof Date && !isNaN(date.valueOf())) {
                    return date.toString("MMddHHmm");
                  }

                  return value;
                }
              }, //
              {
                name: "type",
                index: "type",
                width: 55,
                sorttype: "string",
                align: "left",
                searchoptions: {
                  sopt: ["cn"],
                  defaultValue: $(".s-t-top-list .li-active").text() == "收藏外教" ? "" : $(".s-t-top-list .li-active").text()
                },
                formatter: function formatter(value, options, rData) {
                  if (value) return value;else return "na";
                }
              }, //
              {
                name: "rank",
                index: "rank",
                width: 40,
                sorttype: "float",
                align: "right",
                searchoptions: {
                  sopt: ["le"]
                }
              }, //
              {
                name: "name",
                index: "name",
                width: 125,
                sorttype: "string",
                formatter: function formatter(value, options, rData) {
                  return "<a href='http://www.51talk.com/TeacherNew/info/" + rData["tid"] + "' target='_blank' style='color:blue'>" + (!!value ? value : rData["tid"]) + "</a>";
                }
              }, //
              {
                name: "isfavorite",
                index: "isfavorite",
                width: 39,
                sorttype: "string",
                align: "left",
                searchoptions: {
                  sopt: ["cn"]
                },
                formatter: function formatter(value, options, rData) {
                  if (value) return "收藏";else return "";
                }
              }, //
              {
                name: "indicator",
                index: "indicator",
                width: 50,
                sorttype: "float",
                align: "right",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "label",
                index: "label",
                width: 45,
                align: "right",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "thumbupRate",
                index: "thumbupRate",
                width: 35,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "favoritesCount",
                index: "favoritesCount",
                width: 35,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "slevel",
                index: "slevel",
                width: 85,
                sorttype: "string",
                align: "left",
                searchoptions: {
                  sopt: ["cn", "nc"]
                }
              }, //
              {
                name: "tage",
                index: "tage",
                width: 25,
                sorttype: "float",
                align: "right",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "thumbup",
                index: "thumbup",
                width: 45,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ["ge"]
                }
              }, //
              {
                name: "thumbdown",
                index: "thumbdown",
                width: 30,
                sorttype: "float",
                align: "right"
              }, //
              {
                name: "age",
                index: "age",
                width: 30,
                sorttype: "float",
                align: "right",
                searchoptions: {
                  sopt: ["le", "ge", "eq"]
                }
              }, //
              {
                name: "expire",
                index: "expire",
                width: 35,
                sorttype: "Date",
                align: "right",
                searchoptions: {
                  sopt: ["cn"]
                },
                formatter: function formatter(value, options, rData) {
                  if (value) {
                    var d = Date.now() - value;

                    if (d < 1e3 * 60) {
                      return "刚刚";
                    } else if (d < 1e3 * 60 * 60) {
                      return (d / 6e4).toFixed(0) + "分";
                    } else if (d < 1e3 * 60 * 60 * 24) {
                      return (d / 36e5).toFixed(0) + "时";
                    } else {
                      return (d / 864e5).toFixed(0) + "天";
                    }

                    return d;
                  } else return "na";
                }
              }],
              multiselect: false,
              rowNum: 10,
              rowList: [5, 10, 20, 30],
              pager: "#pager5",
              sortname: "effectivetime desc,indicator desc",
              viewrecords: true,
              multiSort: true,
              sortorder: "desc",
              grouping: false,
              shrinkToFit: false,
              responsive: true,
              del: true //refresh: true,
              //autowidth: true,
              //width: 732
              //caption: "",,

            }).jqGrid("filterToolbar", {
              searchOperators: true
            })[0].triggerToolbar();

            if (settings.isListPage) {
              $.each($(".item"), function (i, item) {
                var jqel = $(item),
                    tid = jqel.find(".teacher-details-link a").attr("href").replace("https://www.51talk.com/TeacherNew/info/", "").replace("http://www.51talk.com/TeacherNew/info/", ""),
                    t = teachers.find(function (currentValue, index, arr) {
                  return currentValue.tid == tid;
                }),
                    lb = jqel.find(".teacher-name>label:eq(3)");
                if (lb.length == 0) jqel.find(".teacher-name").html("".concat(jqel.find(".teacher-name").html(), "| ").concat(getRankHtml(t)));else lb.replaceWith(getRankHtml(t));
              });
            }

            if (settings.isDetailPage) {
              var t = teachers.find(function (currentValue, index, arr) {
                return currentValue.tid == gettid();
              });
              $("#teacherRank").html(getRankHtml(t));
            }
          }
        });
        var uifilters = getUiFilters();
        executeFilters(uifilters);
        $("#_tAge").html(uifilters.age1 + " - " + uifilters.age2);
        $("#_tLabelCount").html(uifilters.l1 + " - " + uifilters.l2);
        $("#_tfc").html(uifilters.fc1 + " - " + uifilters.fc2 + "");
        $("#_thumbupRate").html(uifilters.rate1 + "% - " + uifilters.rate2 + "%");
      } catch (ex) {
        console.log(ex + "");
        throw ex;
      } finally {
        next();
      }
    });

    function getRankHtml(t) {
      if (t) {
        var colorif = "";

        if (t.rank <= conf.markRankRed) {
          colorif = "style = 'color:red'";
        }

        return "<label title='\u5728\u540C\u7C7B\u522B\u6559\u5E08\u4E2D\u7684\u6392\u540D' ".concat(colorif, "> ").concat(t.rank, "\u540D</label>");
      }
    } //弹出信息框


    submit(function (next) {
      $(".s-t-list").before($(".s-t-page").prop("outerHTML"));
      $("#tabs>div:first").append($(".s-t-page").prop("outerHTML"));
      sortByIndicator(desc);
      $("#tabs").tabs("option", "active", 1);

      if (settings.isDetailPage) {
        $("#tabs").tabs("option", "disabled", [0]);
      }

      $("#filterdialog").dialog({
        width: "850"
      });
      $("#filterdialog").parent().scrollFix();
      $("#filterdialog").dialog("open");
      next();
    });
  }

  if (settings.isCoursePage) {
    submit(function (next) {
      $(".course_lock").removeClass("course_lock").addClass("course_unlock");
      $("img.course_mask").removeClass("course_mask").attr("src", "");
      next();
    });
  }

  (function (x) {
    return x;
  });
})();
/******/ })()
;