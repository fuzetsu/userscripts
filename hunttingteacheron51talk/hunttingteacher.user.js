"use strict";

// ==UserScript==
// @name 51talk选择最好最合适的老师-经验-好评率-年龄-收藏数
// @version 2020.7.1001
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
// @require http://code.jquery.com/jquery-3.4.1.min.js
// @require https://code.jquery.com/ui/1.12.1/jquery-ui.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/pace/1.0.2/pace.min.js
// @require https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/i18n/grid.locale-cn.js
// @require https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/jquery.jqgrid.min.js
// @require https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// @require      https://gitcdn.link/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// ==/UserScript==
(function () {
  'use strict'; //重载类型方法

  (function () {
    var PropertiesCaseInsensitive = {
      has: function has(target, prop) {
        if (typeof prop === 'symbol') {
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
        if (typeof prop === 'symbol') {
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
        if (typeof prop === 'symbol') {
          target[prop] = value;
        }

        target[prop.toLowerCase()] = value;
        return true;
      }
    },
        getPaddedComp = function getPaddedComp(comp) {
      var len = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
      if (len < 1) len = 1;
      var paddedLen = len - ('' + comp).length,
          ret = "";
      if (paddedLen > 0) while (paddedLen--) {
        ret = ret.concat("0");
      }
      return ret.concat(comp);
    },
        o = {
      '[y|Y]{4}': function yY4(date) {
        return date.getFullYear();
      },
      // year
      '[y|Y]{2}': function yY2(date) {
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
      '[d|D]{2}': function dD2(date) {
        return getPaddedComp(date.getDate());
      },
      //day
      '[d|D]{1}': function dD1(date) {
        return date.getDate();
      },
      //day
      'h{2}': function h2(date) {
        return getPaddedComp(date.getHours() > 12 ? date.getHours() % 12 : date.getHours());
      },
      //hour
      'h{1}': function h1(date) {
        return date.getHours() > 12 ? date.getHours() % 12 : date.getHours();
      },
      //hour
      'H{2}': function H2(date) {
        return getPaddedComp(date.getHours());
      },
      //hour
      'H{1}': function H1(date) {
        return date.getHours();
      },
      //hour
      'm{2}': function m2(date) {
        return getPaddedComp(date.getMinutes());
      },
      //minute
      'm{1}': function m1(date) {
        return date.getMinutes();
      },
      //minute
      's+': function s(date) {
        return getPaddedComp(date.getSeconds());
      },
      //second
      'f+': function f(date) {
        return getPaddedComp(date.getMilliseconds());
      },
      //millisecond,
      'b+': function b(date) {
        return date.getHours() >= 12 ? 'PM' : 'AM';
      }
    };

    $.extend(Date.prototype, {
      toString: function toString(format) {
        var formattedDate = format;

        for (var k in o) {
          if (new RegExp('(' + k + ')').test(format)) {
            formattedDate = formattedDate.replace(RegExp.$1, o[k](this));
          }
        }

        return formattedDate;
      }
    }); //删除数组中的空元素

    $.extend(Array.prototype, {
      clean: function clean() {
        for (var deleteValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '', i = 0; i < this.length; i++) {
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
        return target.replace(new RegExp(search, 'g'), replacement);
      }
    });
    $.extend(window, {
      parameters: function parameters(url) {
        // get query string from url (optional) or window
        var queryString = url ? url.split('?')[1] : window.location.search.slice(1),
            cachedkey = 'urlparameters' + queryString,
            obj = $(window).data(cachedkey);

        if (obj == undefined) {
          obj = new Proxy({}, PropertiesCaseInsensitive);
          $(window).data(cachedkey, obj);
        } else return obj; // we'll store the parameters here
        // if query string exists


        if (queryString) {
          // stuff after # is not part of query string, so get rid of it
          queryString = queryString.split('#')[0]; // split our query string into its component parts

          var arr = queryString.split('&');

          for (var i = 0; i < arr.length; i++) {
            // separate the keys and the values
            var a = arr[i].split('='),
                paramName = a[0],
                paramValue = typeof a[1] === 'undefined' ? true : a[1]; // set parameter name and value (use 'true' if empty)

            // if the paramName ends with square brackets, e.g. colors[] or colors[2]
            if (paramName.match(/\[(\d+)?\]$/)) {
              // create key if it doesn't exist
              var key = paramName.replace(/\[(\d+)?\]/, '');
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
  })();

  var config = GM_config([{
    key: 'pagecount',
    label: '最大页数 (自动获取时)',
    "default": 20,
    type: 'dropdown',
    values: [0, 5, 10, 20, 50, 1e3]
  }, {
    key: 'newBatcherKeyHours',
    label: '批次更新间隔（小时），0为每次更新',
    "default": 24,
    type: 'dropdown',
    values: [0, 1, 2, 3, 5, 10, 24, 168, 168e3]
  }, {
    key: 'markRankRed',
    label: '突出前N名教师的名次',
    "default": 100,
    type: 'dropdown',
    values: [5, 10, 30, 50, 120, 500, 3e3, 5e3, 10080]
  }, {
    key: 'version',
    type: 'hidden',
    "default": 1
  }]),
      conf = config.load();

  config.onsave = function (cfg) {
    conf = cfg;
    $('#autogetnextpage').text('自动获取' + getAutoNextPagesCount() + '页');
  };

  GM_registerMenuCommand('设置', config.setup); //*://www.51talk.com/ReserveNew/index*
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
    isDetailPage: url.includes('teachernew'),
    isListPage: url.includes('reservenew'),
    isCoursePage: url.includes('study_center')
  };

  function gettid() {
    return settings.tid;
  }
  /**
   * 提交运算函数到 document 的 fx 队列
   */


  var submit = function submit(fun) {
    var queue = $.queue(document, 'fx', fun);

    if (queue[0] == 'inprogress') {
      return;
    }

    $.dequeue(document);
  };

  function getorAddSession(key, func) {
    if (!(key in sessionStorage)) {
      var data = typeof func == 'function' ? func(key) : func;
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
      selectors: ['#filterdialog']
    }
  };

  function sleep(delay) {
    var start = new Date().getTime();

    while (new Date().getTime() - start < delay) {
      continue;
    }
  }

  var asc = function asc(a, b) {
    var av = $(a).attr('indicator'),
        bv = $(b).attr('indicator');
    if (!av || !bv) return 0;
    return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? 1 : -1;
  },
      desc = function desc(a, b) {
    var av = $(a).attr('indicator'),
        bv = $(b).attr('indicator');
    if (!av || !bv) return 0;
    return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? -1 : 1;
  },
      sortByIndicator = function sortByIndicator(sortBy) {
    var sortEle = $('.s-t-content.f-cb .item').sort(sortBy);
    $('.s-t-content.f-cb').empty().append(sortEle);
  };

  function getBatchNumber() {
    if (conf.newBatcherKeyHours <= 0) return new Date().getTime();
    return parseInt(new Date().getTime() / conf.newBatcherKeyHours / 36e5);
  }

  function getLeftPageCount() {
    var pages = Number($('.s-t-page>.next-page:first').prev().text()),
        curr = Number($('.s-t-page>.active:first').text());
    if (pages) return pages - curr;else return 0;
  }

  function getAutoNextPagesCount() {
    var pages = getLeftPageCount();
    if (settings.pagecount > pages) return pages;else return settings.pagecount;
  }

  $('head').append("<link href=\"https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css\" rel=\"stylesheet\" type=\"text/css\">\n  <link href=\"https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/css/ui.jqgrid.min.css\" rel=\"stylesheet\" type=\"text/css\">");
  $('head').append("<style type=\"text/css\">\n.search-teachers .s-t-list .item-time-list {margin-top:315px;}\n.search-teachers .s-t-list .item { height: 679px; }\n.search-teachers .s-t-list .s-t-content { margin-right: 0px;}\n.search-teachers { width: 100%; }\n.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}\n.search-teachers .s-t-list .item { height: auto; margin-right: 5px; margin-bottom: 5px; }\n.pace {\n  -webkit-pointer-events: none;\n  pointer-events: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n}\n.pace-inactive {\n  display: none;\n}\n.ui-tabs .ui-tabs-panel{padding:.5em 0.2em;}\n.ui-dialog .ui-dialog-content { padding: .5em 0.2em;}\n.pace .pace-progress {\n  background: #29d;\n  position: fixed;\n  z-index: 2000;\n  top: 0;\n  right: 100%;\n  width: 100%;\n  height: 2px;\n}\n.search-teachers .s-t-top .s-t-days .s-t-days-list li {\n  float: left;\n  width: 118px;\n  height: 34px;\n  line-height: 34px;\n  margin-right: 5px;\n  margin-bottom: 5px;\n}\n.search-teachers .s-t-top .s-t-top-details {\n  padding: 2px 0 2px 30px;\n}\n.search-teachers .s-t-top .s-t-top-right {\n  height: auto;\n}\n.search-teachers .s-t-top .s-t-top-left .condition-item {\n  margin-bottom: 2px;\n}\n.s-t-page { padding-top: 2px;}\n</style>");
  var maxrate = 0,
      minrate = 99999,
      maxlabel = 0,
      minlabel = 9999999,
      maxfc = 0,
      minfc = 999999,
      maxage = 0,
      minage = 99999,
      configExprMilliseconds = 36e5 * GM_getValue('tinfoexprhours', 168),
      num = /[0-9]*/g;

  function updateTeacherinfoToUI(jqel, tinfo) {
    if (tinfo.label > maxlabel) maxlabel = tinfo.label;
    if (tinfo.label < minlabel) minlabel = tinfo.label;
    if (tinfo.favoritesCount > maxfc) maxfc = tinfo.favoritesCount;
    if (tinfo.favoritesCount < minfc) minfc = tinfo.favoritesCount;
    if (tinfo.thumbupRate > maxrate) maxrate = tinfo.thumbupRate;
    if (tinfo.thumbupRate < minrate) minrate = tinfo.thumbupRate;
    if (tinfo.age > maxage) maxage = tinfo.age;
    if (tinfo.age < minage) minage = tinfo.age;
    jqel.attr('teacherinfo', JSON.stringify(tinfo));
    jqel.find('.teacher-name').html(jqel.find('.teacher-name').html() + "<br /><label title='\u8BC4\u8BBA\u6807\u7B7E\u6570\u91CF'>".concat(tinfo.label, "</label>|<label title='\u597D\u8BC4\u7387'>").concat(tinfo.thumbupRate, "%</label>"));
    jqel.find('.teacher-age').html(jqel.find('.teacher-age').html() + " | <label title='收藏数量'>" + tinfo.favoritesCount + '</label>');
    jqel.attr('indicator', tinfo.indicator);
  }

  function executeFilters(uifilters) {
    var tcount = 0,
        hidecount = 0;
    $.each($('.item'), function (i, item) {
      var node = $(item),
          tinfojson = node.attr('teacherinfo');

      if (!tinfojson) {
        return true;
      }

      var tinfo = JSON.parse(tinfojson);

      if (tinfo.thumbupRate >= uifilters.rate1 && tinfo.thumbupRate <= uifilters.rate2 && tinfo.label >= uifilters.l1 && tinfo.label <= uifilters.l2 && tinfo.age >= uifilters.age1 && tinfo.age <= uifilters.age2 && tinfo.favoritesCount >= uifilters.fc1 && tinfo.favoritesCount <= uifilters.fc2) {
        if (node.is(':hidden')) {
          //如果node是隐藏的则显示node元素，否则隐藏
          node.show();
          node.animate({
            left: '+=50'
          }, 3500).animate({
            left: '-=50'
          }, 3500);
        } else {//nothing todo
        }

        tcount++;
      } else {
        node.css('color', 'white').hide();
        hidecount++;
      }
    });
    $('#tcount').text(tcount);
    $('#thidecount').text(hidecount);
  }

  function getUiFilters() {
    var l1 = $('#tlabelslider').slider('values', 0),
        l2 = $('#tlabelslider').slider('values', 1),
        rate1 = $('#thumbupRateslider').slider('values', 0),
        rate2 = $('#thumbupRateslider').slider('values', 1),
        age1 = $('#tAgeSlider').slider('values', 0),
        age2 = $('#tAgeSlider').slider('values', 1),
        fc1 = $('#fcSlider').slider('values', 0),
        fc2 = $('#fcSlider').slider('values', 1);
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
    return 'tinfo-' + gettid();
  }

  if (settings.isListPage) {
    $('.item-top-cont').prop('innerHTML', function (i, val) {
      return val.replaceAll('<!--', '').replaceAll('-->', '');
    }); // 自动获取时,显示停止按钮

    submit(function (next) {
      var totalPages = Number($('.s-t-page>a:eq(-2)').text()),
          curPageId = window.parameters().pageID ? window.parameters().pageID : 1,
          remainPages = totalPages - curPageId,
          autonextpagecount = GM_getValue('autonextpagecount', 1);

      if (autonextpagecount > 0 && $('.s-t-page>.next-page').length > 0) {
        var dialog = $("<div id=\"dialog-confirm\" title=\"\u662F\u5426\u505C\u6B62\u81EA\u52A8\u641C\u7D22\u8001\u5E08?\">\n<p><span class=\"ui-icon ui-icon-alert\" style=\"float:left; margin:12px 12px 20px 0;\"></span>\n<b>\u6B63\u5728\u6839\u636E\u60A8\u7684\u9009\u62E9\u81EA\u52A8\u83B7\u53D6\u6559\u5E08\u4FE1\u606F</b><br><br>\n\u5269\u4F59".concat(sessionStorage.getItem('selectedTimeSlotsRemain'), "/").concat(sessionStorage.getItem('selectedTimeSlotsTotal'), "\u4E2A\u65F6\u6BB5\uFF0C<br><br>\n\u5F53\u524D\u65F6\u6BB5\u7EA6").concat(totalPages * 28, "\u4E2A\u6559\u5E08\uFF0C\u83B7\u53D6\u7B2C").concat(curPageId, "/").concat(totalPages, "\u9875\uFF0C\u8FDB\u5EA6").concat(Math.floor(curPageId / totalPages * 100), "%,<br>\n\n</p>\n</div>"));
        dialog.appendTo('body');
        dialog.dialog({
          resizable: false,
          height: 'auto',
          width: 400,
          modal: false,
          buttons: {
            立即停止: function _() {
              sessionStorage.setItem('selectedTimeSlots', '');
              GM_setValue('autonextpagecount', 0);
              $(this).dialog('close');
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
      var age = Number(jqel.find('.teacher-age').text().match(num).clean('')[0]),
          label = function () {
        var j_len = jqel.find('.label').text().match(num).clean('').length,
            l = 0;

        for (var j = 0; j < j_len; j++) {
          l += Number(jqel.find('.label').text().match(num).clean('')[j]);
        }

        return l;
      }(),
          name = jqel.find('.teacher-name').text(),
          type = $('.s-t-top-list .li-active').text(),
          effectivetime = getBatchNumber();

      if (type == '收藏外教') {
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


    $('.item').each(function (index, el) {
      submit(function (next) {
        Pace.track(function () {
          var jqel = $(el),
              tid = jqel.find('.teacher-details-link a').attr('href').replace('https://www.51talk.com/TeacherNew/info/', '').replace('http://www.51talk.com/TeacherNew/info/', ''),
              tinfokey = 'tinfo-' + tid,
              teacherlistinfo = getTeacherInfoInList(jqel),
              tinfo = GM_getValue(tinfokey);

          if (tinfo) {
            var now = new Date().getTime();

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


          var start = new Date().getTime();
          $.ajax({
            url: window.location.protocol + '//www.51talk.com/TeacherNew/teacherComment?tid=' + tid + '&type=bad&has_msg=1',
            type: 'GET',
            dateType: 'html',
            success: function success(r) {
              var jqr = $(r);

              if (jqr.find('.teacher-name-tit').length > 0) {
                var tempitem = jqr.find('.teacher-name-tit')[0];
                tempitem.innerHTML = tempitem.innerHTML.replace('<!--', '').replace('-->', '');
              }

              if (jqr.find('.evaluate-content-left span').length >= 3) {
                var thumbup = Number(jqr.find('.evaluate-content-left span:eq(1)').text().match(num).clean('')[0]),
                    thumbdown = Number(jqr.find('.evaluate-content-left span:eq(2)').text().match(num).clean('')[0]),
                    thumbupRate = ((thumbup + 1e-5) / (thumbdown + thumbup)).toFixed(2) * 100,
                    favoritesCount = Number(jqr.find('.clear-search').text().match(num).clean('')[0]),
                    isfavorite = jqr.find('.go-search.cancel-collection').length > 0,
                    tage = Number(jqr.find('.teacher-name-tit > .age.age-line').text().match(num).clean('')[0]),
                    slevel = jqr.find('.sui-students').text();
                jqr.remove();
                var tinfo = {
                  slevel: slevel,
                  tage: tage,
                  thumbup: thumbup,
                  thumbdown: thumbdown,
                  thumbupRate: thumbupRate,
                  favoritesCount: favoritesCount,
                  isfavorite: isfavorite,
                  expire: new Date().getTime()
                };
                tinfo = $.extend(tinfo, teacherlistinfo);
                tinfo.indicator = calcIndicator(tinfo);
                GM_setValue(tinfokey, tinfo);
                updateTeacherinfoToUI(jqel, tinfo);
              } else {
                console.log('Teacher s detail info getting error:' + JSON.stringify(jqel) + ',error info:' + r);
              }
            },
            error: function error(data) {
              console.log('xhr error when getting teacher ' + JSON.stringify(jqel) + ',error msg:' + JSON.stringify(data));
            }
          }).always(function () {
            while (new Date().getTime() - start < 600) {
              continue;
            }

            next();
          });
        });
      });
    });
    submit(function (next) {
      //翻页
      var autonextpagecount = GM_getValue('autonextpagecount', 0);

      if (autonextpagecount > 0) {
        GM_setValue('autonextpagecount', autonextpagecount - 1);

        if ($('.s-t-page>.next-page').length == 0) {
          GM_setValue('autonextpagecount', 0);
          if (isStopShowboxAndAutoGetNextTimeTeachers()) return;
        } else {
          $('.s-t-page .next-page')[0].click();
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

  function isStopShowboxAndAutoGetNextTimeTeachers() {
    var str = sessionStorage.getItem('selectedTimeSlots');
    if (!str) return false;
    var selectedTimeSlots = JSON.parse(str),
        cur = selectedTimeSlots.shift();

    if (cur) {
      GM_setValue('autonextpagecount', 500);
      sessionStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots));
      sessionStorage.setItem('selectedTimeSlotsRemain', selectedTimeSlots.length);
      $('form[name="searchform"]>input[name="selectTime"]').val(cur);
      $('form[name="searchform"]>input[name="pageID"]').val(1);
      $('.go-search').click();
      return true;
    }

    return false;
  }

  if (settings.isDetailPage) {
    function processTeacherDetailPage(jqr) {
      jqr.find('.teacher-name-tit').prop('innerHTML', function (i, val) {
        return val.replaceAll('<!--', '').replaceAll('-->', '');
      });
      var tinfo = GM_getValue(getinfokey(), {});

      tinfo.label = function () {
        var l = 0;
        $.each(jqr.find('.t-d-label').text().match(num).clean(''), function (i, val) {
          l += Number(val);
        });
        return l;
      }();

      if (window.location.href.toLocaleLowerCase().includes('teachercomment')) {
        tinfo.thumbup = Number(jqr.find('.evaluate-content-left span:eq(1)').text().match(num).clean('')[0]);
        tinfo.thumbdown = Number(jqr.find('.evaluate-content-left span:eq(2)').text().match(num).clean('')[0]);
        tinfo.thumbupRate = ((tinfo.thumbup + 1e-5) / (tinfo.thumbdown + tinfo.thumbup)).toFixed(2) * 100;
        tinfo.slevel = jqr.find('.sui-students').text();
        tinfo.expire = new Date().getTime();
      }

      tinfo.favoritesCount = Number(jqr.find('.clear-search').text().match(num).clean('')[0]);
      tinfo.isfavorite = jqr.find('.go-search.cancel-collection').length > 0;
      tinfo.age = Number(jqr.find('.age.age-line:eq(0)').text().match(num).clean('')[0]);
      tinfo.name = jqr.find('.t-name').text().trim(); //无法获取type
      //tinfo.type = $('.s-t-top-list .li-active').text().trim();

      tinfo.tage = Number(jqr.find('.teacher-name-tit > .age.age-line:eq(1)').text().match(num).clean('')[0]);
      tinfo.effectivetime = getBatchNumber();
      tinfo.indicator = calcIndicator(tinfo);
      GM_setValue(getinfokey(), tinfo);
      jqr.find('.teacher-name-tit').prop('innerHTML', function (i, val) {
        return "".concat(val, "\n    <span class=\"age age-line\"><label title='\u6307\u6807'>").concat(tinfo.indicator, "</label></span>\n    <span class=\"age age-line\"><label title='\u597D\u8BC4\u7387'>").concat(tinfo.thumbupRate, "%</label></span>\n    <span class=\"age age-line\"><label title='\u88AB\u8D5E\u6570\u91CF'>").concat(tinfo.thumbup, "</label></span>\n    <span class=\"age age-line\"><label title='\u88AB\u8E29\u6570\u91CF'>").concat(tinfo.thumbdown, "</label></span>\n    <span class=\"age age-line\"><label title='\u8BC4\u8BBA\u6807\u7B7E\u6570\u91CF'>").concat(tinfo.label, "</label></span>\n      <span class=\"age age-line\"><label title='\u5728\u540C\u7C7B\u522B\u6559\u5E08\u4E2D\u7684\u6392\u540D'><span id=\"teacherRank\"></span></label></span>\n    ");
      });
    }

    submit(function (next) {
      processTeacherDetailPage($(document));
      next();
    });
  }

  function addCheckbox(val, lbl, group) {
    var container = $('#timesmutipulecheck'),
        inputs = container.find('input'),
        id = inputs.length + 1;
    $('<input />', {
      type: 'checkbox',
      id: 'cb' + id,
      value: val,
      name: group
    }).appendTo(container);
    $('<label />', {
      "for": 'cb' + id,
      text: lbl ? lbl : val
    }).appendTo(container);
  }

  if (settings.isListPage || settings.isDetailPage) {
    //构建插件信息
    submit(function (next) {
      try {
        var _config = GM_getValue('filterconfig', {
          l1: 300,
          l2: maxlabel,
          rate1: 97,
          rate2: maxrate,
          age1: minage,
          age2: maxage
        }),
            buttons = '';

        if (settings.isListPage) {
          buttons = "\n          <div id='buttons' style='text-align: center'>\n            <button id='asc' title='\u5F53\u524D\u4E3A\u964D\u5E8F\uFF0C\u70B9\u51FB\u540E\u6309\u5347\u5E8F\u6392\u5217'>\u5347\u5E8F</button>\n            <button id='desc' title='\u5F53\u524D\u4E3A\u5347\u5E8F\uFF0C\u70B9\u51FB\u8FDB\u884C\u964D\u5E8F\u6392\u5217' style='display:none;'>\u964D\u5E8F</button>&nbsp;\n            <input id='tinfoexprhours' title='\u7F13\u5B58\u8FC7\u671F\u65F6\u95F4\uFF08\u5C0F\u65F6\uFF09'>&nbsp;\n            <button title='\u6E05\u7A7A\u7F13\u5B58\uFF0C\u5E76\u91CD\u65B0\u641C\u7D22'>\u6E05\u9664\u7F13\u5B58</button>&nbsp;\n            <a>\u53BB\u63D0\u5EFA\u8BAE\u548CBUG</a>&nbsp;\n            <a>?</a>&nbsp;\n          </div>\n          <div id='buttons1' style='text-align: center;'>\n            <div id='timesmutipulecheck'></div>\n            <button>\u53CD\u9009\u65F6\u95F4\u6BB5</button>&nbsp;\n            <button id='autogettodaysteachers' title='\u81EA\u52A8\u83B7\u53D6\u4E0A\u8FF0\u9009\u62E9\u65F6\u6BB5\u7684\u5168\u90E8\u6559\u5E08\u5E76\u7F13\u5B58'>\u83B7\u53D6\u9009\u5B9A\u65F6\u6BB5\u8001\u5E08</button>&nbsp;\n          </div>";
        }

        $('body').append("<div id='filterdialog' title='Teacher Filter'>\n      <div id='tabs'>\n        <div>\n          <ul>\n            <li><a href=\"#tabs-1\">Search Teachers</a></li>\n            <li><a href=\"#tabs-2\">Sorted Teachers</a></li>\n          </ul>\n          <br />\n            ".concat(buttons, "\n        </div>\n        <div id=\"tabs-1\">\n          \u5F53\u524D\u53EF\u9009<span id='tcount' />\u4F4D,\u88AB\u6298\u53E0<span id='thidecount' />\u4F4D\u3002<br />\n          \u6709\u6548\u7ECF\u9A8C\u503C <span id='_tLabelCount' /><br /><div id='tlabelslider'></div>\n          \u6536\u85CF\u6570 <span id='_tfc' /><br /><div id='fcSlider'></div>\n          \u597D\u8BC4\u7387 <span id='_thumbupRate'/><br /><div id='thumbupRateslider'></div>\n          \u5E74\u9F84 <span id='_tAge' /><br /><div id='tAgeSlider'></div>\n        </div>\n        <div id=\"tabs-2\">\n          <table id=\"teachertab\"></table>\n          <div id=\"pager5\"></div>\n        </div>\n      </div>\n    </div>"));
        $('body').append("<div id='teachlistdialog' style='display:none;'></div>");
        $('body').append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。

        $('#tlabelslider').slider({
          range: true,
          min: minlabel - 1,
          max: maxlabel,
          values: [_config.l1 < minlabel - 1 ? minlabel - 1 : _config.l1, maxlabel],
          slide: function slide(event, ui) {
            $('#_tLabelCount').html(ui.values[0] + ' - ' + ui.values[1]);
          }
        }).on('slidestop', function (event, ui) {
          var l1 = $('#tlabelslider').slider('values', 0),
              l2 = $('#tlabelslider').slider('values', 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.l1 = l1;
          filterconfig.l2 = l2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $('#fcSlider').slider({
          range: true,
          min: minfc,
          max: maxfc,
          values: [_config.fc1 < minfc ? minfc : _config.fc1, maxfc],
          slide: function slide(event, ui) {
            $('#_tfc').html(ui.values[0] + ' - ' + ui.values[1]);
          }
        }).on('slidestop', function (event, ui) {
          var fc1 = $('#fcSlider').slider('values', 0),
              fc2 = $('#fcSlider').slider('values', 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.fc1 = fc1;
          filterconfig.fc2 = fc2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $('#thumbupRateslider').slider({
          range: true,
          min: minrate,
          max: maxrate,
          values: [_config.rate1 < minrate ? minrate : _config.rate1, maxrate],
          slide: function slide(_event, ui) {
            $('#_thumbupRate').html(ui.values[0] + '% - ' + ui.values[1] + '%');
          }
        }).on('slidestop', function (event, ui) {
          var rate1 = $('#thumbupRateslider').slider('values', 0),
              rate2 = $('#thumbupRateslider').slider('values', 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.rate1 = rate1;
          filterconfig.rate2 = rate2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $('#tAgeSlider').slider({
          range: true,
          min: Number(minage),
          // 兼容旧缓存中的存储类型，2019-10-1后可以移除类型转换
          max: Number(maxage),
          // 兼容旧缓存中的存储类型，2019-10-1后可以移除类型转换
          values: [_config.age1 < minage ? minage : _config.age1, _config.age2 > maxage ? maxage : _config.age2],
          slide: function slide(event, ui) {
            $('#_tAge').html(ui.values[0] + ' - ' + ui.values[1]);
          }
        }).on('slidestop', function (event, ui) {
          var age1 = $('#tAgeSlider').slider('values', 0),
              age2 = $('#tAgeSlider').slider('values', 1),
              uifilters = getUiFilters(),
              filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.age1 = age1;
          filterconfig.age2 = age2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $('#buttons>button,#buttons>input,#buttons>a') //升序
        .eq(0).button({
          icon: 'ui-icon-arrowthick-1-n',
          showLabel: false
        }).click(function () {
          $('#desc').show();
          $(this).hide();
          sortByIndicator(asc);
        }).end() //降序
        .eq(1).button({
          icon: 'ui-icon-arrowthick-1-s',
          showLabel: false
        }).click(function () {
          $('#asc').show();
          $(this).hide();
          sortByIndicator(desc);
        }).end() // 缓存过期时间（小时）
        .eq(2).spinner({
          min: 0,
          spin: function spin(event, ui) {
            GM_setValue('tinfoexprhours', ui.value);
          }
        }).css({
          width: '45px'
        }).val(GM_getValue('tinfoexprhours', configExprMilliseconds / 36e5)).end() //清空缓存
        .eq(3).button({
          icon: 'uiicon-trash',
          showLabel: false
        }).click(function () {
          $.each(GM_listValues(), function (i, item) {
            //if(item.startsWith('tinfo-')) {
            GM_deleteValue(item); //}
          });
          $('.go-search').click();
        }).end() //submit suggestion
        .eq(4).button({
          icon: 'ui-icon-comment',
          showLabel: false
        }).prop('href', 'https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title=').prop('target', '_blank').end() //系统帮助
        .eq(5).button({
          icon: 'ui-icon-help',
          showLabel: false
        }).prop('href', 'https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk').prop('target', '_blank').end();
        $('#buttons1>button') //反选时间段
        .eq(0).button({
          icon: 'ui-icon-seek-next',
          showLabel: true
        }).click(function () {
          $('#timesmutipulecheck>input').each(function (i, item) {
            $(item).prop('checked', !$(item).is(':checked')).change();
          });
        }).end() // 获取选定时段老师
        .eq(1).button({
          icon: 'ui-icon-seek-next',
          showLabel: true
        }).click(function () {
          var selectedTimeSlots = [];
          $('#timesmutipulecheck>input').each(function (i, item) {
            if ($(item).is(':checked')) {
              selectedTimeSlots.push($(item).val());
            }
          });
          sessionStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots));
          sessionStorage.setItem('selectedTimeSlotsTotal', selectedTimeSlots.length);
          isStopShowboxAndAutoGetNextTimeTeachers();
        }).end(); //初始化时间选择按钮

        $('div.condition-type:eq(0)>ul.condition-type-time>li').each(function (i, item) {
          addCheckbox($(item).attr('data-val'), $(item).text());
        });
        var timesstr = sessionStorage.getItem('selectedTimeSlots'),
            selectedTimeSlots = [];

        if (timesstr) {
          selectedTimeSlots = JSON.parse(timesstr);

          if (selectedTimeSlots.length > 0) {
            var i = selectedTimeSlots.length;

            while (i--) {
              $("#timesmutipulecheck>input[value='" + selectedTimeSlots[i] + "']").attr('checked', true);
            }
          } else {
            $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr('checked', true);
          }
        } else {
          $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr('checked', true);
        }

        $('#timesmutipulecheck').find('input').checkboxradio({
          icon: false
        });

        function getCatchedTeachers() {
          var teachers = [];
          $.each(GM_listValues(), function (i, item) {
            if (item.startsWith('tinfo-')) {
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
              //'expire': new Date().getTime(),
              rank: indexs[val.type]
            }); //GM_setValue("tinfo-"+t.tid,t);

            return t;
          });
          return teachers;
        }

        $('#tabs').tabs({
          active: '#tabs-2',
          activate: function activate(event, ui) {
            if (ui.newPanel.attr('id') != 'tabs-2') return;
            var teachers = getCatchedTeachers();
            $('#teachertab') //searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
            .jqGrid({
              data: teachers,
              datatype: 'local',
              height: 240,
              colNames: ['查', '类型', '排名', 'Name', '爱', '分', '标', '率%', '收藏数', '学', '教龄', '好', '差', '龄', '更新'],
              colModel: [//
              {
                name: 'effectivetime',
                index: 'effectivetime',
                width: 45,
                sorttype: 'float',
                align: 'right',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  var date = new Date(Number(value));

                  if (date instanceof Date && !isNaN(date.valueOf())) {
                    return date.toString('HHmmss');
                  }

                  return value;
                }
              }, //
              {
                name: 'type',
                index: 'type',
                width: 55,
                sorttype: 'string',
                align: 'left',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if (value) return value;else return 'na';
                }
              }, //
              {
                name: 'rank',
                index: 'rank',
                width: 40,
                sorttype: 'float',
                align: 'right',
                searchoptions: {
                  sopt: ['le']
                }
              }, //
              {
                name: 'name',
                index: 'name',
                width: 125,
                sorttype: 'string',
                formatter: function formatter(value, options, rData) {
                  return "<a href='http://www.51talk.com/TeacherNew/info/" + rData['tid'] + "' target='_blank' style='color:blue'>" + (!!value ? value : rData['tid']) + '</a>';
                }
              }, //
              {
                name: 'isfavorite',
                index: 'isfavorite',
                width: 39,
                sorttype: 'string',
                align: 'left',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if (value) return '收藏';else return '';
                }
              }, //
              {
                name: 'indicator',
                index: 'indicator',
                width: 50,
                sorttype: 'float',
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'label',
                index: 'label',
                width: 45,
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'thumbupRate',
                index: 'thumbupRate',
                width: 35,
                align: 'right',
                sorttype: 'float',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'favoritesCount',
                index: 'favoritesCount',
                width: 35,
                align: 'right',
                sorttype: 'float',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'slevel',
                index: 'slevel',
                width: 85,
                sorttype: 'string',
                align: 'left',
                searchoptions: {
                  sopt: ['cn', 'nc']
                }
              }, //
              {
                name: 'tage',
                index: 'tage',
                width: 25,
                sorttype: 'float',
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'thumbup',
                index: 'thumbup',
                width: 45,
                align: 'right',
                sorttype: 'float',
                searchoptions: {
                  sopt: ['ge']
                }
              }, //
              {
                name: 'thumbdown',
                index: 'thumbdown',
                width: 30,
                sorttype: 'float',
                align: 'right'
              }, //
              {
                name: 'age',
                index: 'age',
                width: 30,
                sorttype: 'float',
                align: 'right',
                searchoptions: {
                  sopt: ['le', 'ge', 'eq']
                }
              }, //
              {
                name: 'expire',
                index: 'expire',
                width: 35,
                sorttype: 'Date',
                align: 'right',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if (value) {
                    var d = new Date().getTime() - value;

                    if (d < 1e3 * 60) {
                      return '刚刚';
                    } else if (d < 1e3 * 60 * 60) {
                      return (d / 6e4).toFixed(0) + '分';
                    } else if (d < 1e3 * 60 * 60 * 24) {
                      return (d / 36e5).toFixed(0) + '时';
                    } else {
                      return (d / 864e5).toFixed(0) + '天';
                    }

                    return d;
                  } else return 'na';
                }
              }],
              multiselect: false,
              rowNum: 10,
              rowList: [5, 10, 20, 30],
              pager: '#pager5',
              sortname: 'effectivetime desc,indicator desc',
              viewrecords: true,
              multiSort: true,
              sortorder: 'desc',
              grouping: false,
              shrinkToFit: false,
              //autowidth: true,
              width: 732 //caption: "",,

            }).jqGrid('filterToolbar', {
              searchOperators: true
            });

            if (settings.isListPage) {
              $.each($('.item'), function (i, item) {
                var jqel = $(item),
                    tid = jqel.find('.teacher-details-link a').attr('href').replace('https://www.51talk.com/TeacherNew/info/', '').replace('http://www.51talk.com/TeacherNew/info/', ''),
                    t = teachers.find(function (currentValue, index, arr) {
                  return currentValue.tid == tid;
                });
                jqel.find('.teacher-name').html("".concat(jqel.find('.teacher-name').html(), "| ").concat(getRankHtml(t)));
              });
            }

            if (settings.isDetailPage) {
              var t = teachers.find(function (currentValue, index, arr) {
                return currentValue.tid == gettid();
              });
              $('#teacherRank').html(getRankHtml(t));
            }
          }
        });
        var uifilters = getUiFilters();
        executeFilters(uifilters);
        $('#_tAge').html(uifilters.age1 + ' - ' + uifilters.age2);
        $('#_tLabelCount').html(uifilters.l1 + ' - ' + uifilters.l2);
        $('#_tfc').html(uifilters.fc1 + ' - ' + uifilters.fc2 + '');
        $('#_thumbupRate').html(uifilters.rate1 + '% - ' + uifilters.rate2 + '%');
      } catch (ex) {
        console.log(ex + '');
      } finally {
        next();
      }
    });

    function getRankHtml(t) {
      if (t) {
        var colorif = '';

        if (t.rank <= conf.markRankRed) {
          colorif = "style = 'color:red'";
        }

        return "<label title='\u5728\u540C\u7C7B\u522B\u6559\u5E08\u4E2D\u7684\u6392\u540D' ".concat(colorif, "> ").concat(t.rank, "\u540D</label>");
      }
    } //弹出信息框


    submit(function (next) {
      $('.s-t-list').before($('.s-t-page').prop('outerHTML'));
      $('#tabs>div:first').append($('.s-t-page').prop('outerHTML'));
      sortByIndicator(desc);
      $('#tabs').tabs('option', 'active', 1);

      if (settings.isDetailPage) {
        $('#tabs').tabs('option', 'disabled', [0]);
      }

      $('#filterdialog').dialog({
        width: '750'
      });
      $('#filterdialog').parent().scrollFix();
      $('#filterdialog').dialog('open');
      next();
    });
  }

  if (settings.isCoursePage) {
    submit(function (next) {
      $('.course_lock').removeClass('course_lock').addClass('course_unlock');
      $('img.course_mask').removeClass('course_mask').attr('src', '');
      next();
    });
  }
})();