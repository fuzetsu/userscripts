// ==UserScript==
// @name         51talk选择最好最合适的老师-经验-好评率-年龄-收藏数
// @version      2019.12.24001
// @namespace    https://github.com/niubilityfrontend
// @description  辅助选老师-排序显示，经验值计算|好评率|显示年龄|列表显示所有教师
// @author       jimbo
// @license      OSL-3.0
// @supportURL   https://github.com/niubilityfrontend/hunttingteacheron51talk
// @match        *://www.51talk.com/ReserveNew/index*
// @match        *://www.51talk.com/TeacherNew/*
// @match		 *://www.51talk.com/user/*
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
(function() {
  'use strict';
  //重载类型方法
  (function() {
    let PropertiesCaseInsensitive = {
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
  })();
  const config = GM_config([{
    key: 'pagecount',
    label: '最大页数 (自动获取时)',
    default: 20,
    type: 'dropdown',
    values: [0, 5, 10, 20, 50, 1000]
  }, {
    key: 'batchtimezoneMinutes',
    label: '预定时间（分钟）',
    default: 60,
    type: 'dropdown',
    values: [5, 10, 20, 30, 50, 60, 90, 120, 300, 600, 1440, 10080]
  }, {
    key: 'version',
    type: 'hidden',
    default: 1
  }]);
  let conf = config.load();
  config.onsave = cfg => {
    conf = cfg;
    $('#autogetnextpage').text('自动获取' + getAutoNextPagesCount() + "页");
  };
  GM_registerMenuCommand('设置', config.setup);
  //*://www.51talk.com/ReserveNew/index*
  //https://www.51talk.com/TeacherNew/info/t26501111
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=all&has_msg=1
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=good&has_msg=1
  //https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=bad&has_msg=1
  //https://www.51talk.com/user/study_center_zx
  //https://www.51talk.com/user/study_center_zy
  //https://www.51talk.com/user/study_center_xx
  let url = window.location.href.toLocaleLowerCase();
  let settings = {
    'url': url,
    'tid': url.match(/(t\d+)/g),
    'pagecount': conf.pagecount,
    'isDetailPage': url.includes("teachernew"),
    'isListPage': url.includes('reservenew'),
    'isCoursePage': url.includes('study_center')
  };

  function gettid() {
    return settings.tid;
  }
  /**
   * 提交运算函数到 document 的 fx 队列
   */
  let submit = function(fun) {
    let queue = $.queue(document, "fx", fun);
    if(queue[0] == 'inprogress') {
      return;
    }
    $.dequeue(document);
  };

  function getorAdd(key, func) {
    if(!(key in sessionStorage)) {
      let data = (typeof(func) == 'function') ? func(key) : func;
      sessionStorage.setItem(key, data);
      return data;
    }
    return sessionStorage.getItem(key);
  }
  Pace.Options = {
    ajax: false, // disabled
    document: false, // disabled
    eventLag: false, // disabled
    elements: {
      selectors: ['#filterdialog']
    }
  };

  function sleep(delay) {
    let start = (new Date()).getTime();
    while((new Date()).getTime() - start < delay) {
      continue;
    }
  }
  let asc = function(a, b) {
    let av = $(a).attr('indicator');
    let bv = $(b).attr('indicator');
    if(!av || !bv) return 0;
    return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? 1 : -1;
  };
  let desc = function(a, b) {
    let av = $(a).attr('indicator');
    let bv = $(b).attr('indicator');
    if(!av || !bv) return 0;
    return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? -1 : 1;
  };
  let sortByIndicator = function(sortBy) {
    let sortEle = $('.s-t-content.f-cb .item').sort(sortBy);
    $('.s-t-content.f-cb').empty().append(sortEle);
  };

  function getBatchNumber() {
    let batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
    return getorAdd(batchnumber, function(key) {
      return new Date().getTime();
    });
  }

  function getLeftPageCount() {
    let pages = Number($('.s-t-page>.next-page:first').prev().text());
    let curr = Number($('.s-t-page>.active:first').text());
    if(pages) return pages - curr;
    else return 0;
  }

  function getAutoNextPagesCount() {
    let pages = getLeftPageCount();
    if(settings.pagecount > pages) return pages;
    else return settings.pagecount;
  }
  $("head").append(`<link href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">
		<link href="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/css/ui.jqgrid.min.css" rel="stylesheet" type="text/css">`);
  $("head").append(`<style type="text/css">
.search-teachers .s-t-list .item-time-list {margin-top:315px;}
.search-teachers .s-t-list .item {   height: 679px; }
.search-teachers .s-t-list .s-t-content { margin-right: 0px;}
.search-teachers { width: 100%; }
.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}
.search-teachers .s-t-list .item { height: auto;  margin-right: 5px; margin-bottom: 5px; }
.pace {
  -webkit-pointer-events: none;
  pointer-events: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
.pace-inactive {
  display: none;
}
.ui-tabs .ui-tabs-panel{padding:.5em 0.2em;}
.ui-dialog .ui-dialog-content { padding: .5em 0.2em;}
.pace .pace-progress {
  background: #29d;
  position: fixed;
  z-index: 2000;
  top: 0;
  right: 100%;
  width: 100%;
  height: 2px;
}
.search-teachers .s-t-top .s-t-days .s-t-days-list li {
 float: left;
 width: 118px;
 height: 34px;
 line-height: 34px;
 margin-right: 5px;
 margin-bottom: 5px;
}
.search-teachers .s-t-top .s-t-top-details {
 padding: 2px 0 2px 30px;
}
.search-teachers .s-t-top .s-t-top-right {
 height: auto;
}
.search-teachers .s-t-top .s-t-top-left .condition-item {
 margin-bottom: 2px;
}
.s-t-page {   padding-top: 2px;}
</style>`);
  let maxrate = 0,
    minrate = 99999,
    maxlabel = 0,
    minlabel = 9999999,
    maxfc = 0,
    minfc = 999999,
    maxage = 0,
    minage = 99999;
  let configExprMilliseconds = 3600000 * GM_getValue('tinfoexprhours', 168); //缓存7天小时
  let num = /[0-9]*/g;

  function updateTeacherinfoToUI(jqel, tinfo) {
    if(tinfo.label > maxlabel) maxlabel = tinfo.label;
    if(tinfo.label < minlabel) minlabel = tinfo.label;
    if(tinfo.favoritesCount > maxfc) maxfc = tinfo.favoritesCount;
    if(tinfo.favoritesCount < minfc) minfc = tinfo.favoritesCount;
    if(tinfo.thumbupRate > maxrate) maxrate = tinfo.thumbupRate;
    if(tinfo.thumbupRate < minrate) minrate = tinfo.thumbupRate;
    if(tinfo.age > maxage) maxage = tinfo.age;
    if(tinfo.age < minage) minage = tinfo.age;
    jqel.attr("teacherinfo", JSON.stringify(tinfo));
    jqel.find(".teacher-name").html(jqel.find(".teacher-name").text() + "<br />[" + tinfo.label + "|" + tinfo.thumbupRate + "%|" + tinfo.favoritesCount + "]");
    jqel.find(".teacher-age").html(jqel.find(".teacher-age").text() + " | <label title='排序指标'>" + tinfo.indicator + "</label>");
    jqel.attr('indicator', tinfo.indicator);
  }

  function executeFilters(uifilters) {
    let tcount = 0,
      hidecount = 0;
    $.each($('.item'), function(i, item) {
      let node = $(item);
      let tinfojson = node.attr("teacherinfo");
      if(!tinfojson) {
        return true;
      }
      let tinfo = JSON.parse(tinfojson);
      if((tinfo.thumbupRate >= uifilters.rate1 && tinfo.thumbupRate <= uifilters.rate2) && tinfo.label >= uifilters.l1 && tinfo.label <= uifilters.l2 && tinfo.age >= uifilters.age1 && tinfo.age <= uifilters.age2 && tinfo.favoritesCount >= uifilters.fc1 && tinfo.favoritesCount <= uifilters.fc2) {
        if(node.is(':hidden')) { //如果node是隐藏的则显示node元素，否则隐藏
          node.show();
          node.animate({
            left: "+=50"
          }, 3500).animate({
            left: "-=50"
          }, 3500);
        } else {
          //nothing todo
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
    let l1 = $("#tlabelslider").slider('values', 0);
    let l2 = $("#tlabelslider").slider('values', 1);
    let rate1 = $("#thumbupRateslider").slider('values', 0);
    let rate2 = $("#thumbupRateslider").slider('values', 1);
    let age1 = $("#tAgeSlider").slider('values', 0);
    let age2 = $("#tAgeSlider").slider('values', 1);
    let fc1 = $("#fcSlider").slider('values', 0);
    let fc2 = $("#fcSlider").slider('values', 1);
    return {
      l1,
      l2,
      rate1,
      rate2,
      age1,
      age2,
      fc1,
      fc2
    };
  }

  function getinfokey() {
    return 'tinfo-' + gettid();
  };
  if(settings.isListPage) {
    $(".item-top-cont").prop('innerHTML', function(i, val) {
      return val.replaceAll('<!--', '').replaceAll('-->', '');
    });
    $(".s-t-days-list>li").click(function() {
      let batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
      sessionStorage.setItem(batchnumber, new Date().getTime());
    });
    $(".condition-type-time>li").click(function() {
      let batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
      sessionStorage.setItem(batchnumber, new Date().getTime());
    });
    $(".s-t-top-list>li>a").click(function() {
      let batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
      sessionStorage.setItem(batchnumber, new Date().getTime());
    });
    // 自动获取时,显示停止按钮
    submit(function(next) {
      let totalPages = Number($('.s-t-page>a:eq(-2)').text()),
        curPageId = window.parameters().pageID ? window.parameters().pageID : 1,
        remainPages = totalPages - curPageId;
      let autonextpagecount = GM_getValue('autonextpagecount', 1);
      if(autonextpagecount > 0 && $('.s-t-page>.next-page').length > 0) {
        let dialog = $(`<div id="dialog-confirm" title="是否停止自动搜索老师?">
<p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
<b>正在根据您的选择自动获取教师信息</b><br><br>
正在获取当前时段第${curPageId}页，剩余${remainPages}页总计${totalPages}页,约${ remainPages * 28}个教师<br>
总计选择${sessionStorage.getItem("selectedTimeSlotsTotal")}个时段，未获取${sessionStorage.getItem("selectedTimeSlotsRemain")}个时段，
</p>
</div>`);
        dialog.appendTo('body');
        dialog.dialog({
          resizable: false,
          height: "auto",
          width: 400,
          modal: false,
          buttons: {
            "立即停止": function() {
              sessionStorage.setItem('selectedTimeSlots', '');
              GM_setValue('autonextpagecount', 0);
              $(this).dialog("close");
            },
            // [`取后${(remainPages*0.25).toFixed(0)}页`]: function() {
            //   sessionStorage.setItem('selectedTimeSlots', '');
            //   GM_setValue('autonextpagecount', (remainPages * 0.25).toFixed(0));
            //   $(this).dialog("close");
            // },
            // [`取后${(remainPages*0.5).toFixed(0)}页`]: function() {
            //   sessionStorage.setItem('selectedTimeSlots', '');
            //   GM_setValue('autonextpagecount', (remainPages * 0.5).toFixed(0));
            //   $(this).dialog("close");
            // },
            // [`取后${(remainPages*0.75).toFixed(0)}页`]: function() {
            //   sessionStorage.setItem('selectedTimeSlots', '');
            //   GM_setValue('autonextpagecount', (remainPages * 0.75).toFixed(0));
            //   $(this).dialog("close");
            // },
          }
        });
      }
      next();
    });

    function getTeacherInfoInList(jqel) {
      let age = Number(jqel.find(".teacher-age").text().match(num).clean("")[0]);
      let label = (function() {
        let j_len = jqel.find(".label").text().match(num).clean("").length;
        let l = 0;
        for(let j = 0; j < j_len; j++) {
          l += Number(jqel.find(".label").text().match(num).clean("")[j]);
        }
        l = Math.ceil(l / 5);
        return l;
      })();
      let name = jqel.find(".teacher-name").text();
      let type = $('.s-t-top-list .li-active').text();
      let effectivetime = getBatchNumber();
      if(type == '收藏外教') {
        let isfavorite = true;
        return {
          age,
          label,
          name,
          effectivetime,
          isfavorite
        };
      } else return {
        age,
        label,
        name,
        effectivetime,
        type
      };
    }
    //获取列表中数据
    $(".item").each(function(index, el) {
      submit(function(next) {
        Pace.track(function() {
          let jqel = $(el);
          let tid = jqel.find(".teacher-details-link a").attr('href').replace("https://www.51talk.com/TeacherNew/info/", "").replace('http://www.51talk.com/TeacherNew/info/', '');
          let tinfokey = 'tinfo-' + tid;
          let teacherlistinfo = getTeacherInfoInList(jqel);
          let tinfo = GM_getValue(tinfokey);
          if(tinfo) {
            let now = new Date().getTime();
            if(!tinfo.expire) {
              tinfo.expire = new Date(1970, 1, 1).getTime();
            }
            tinfo = $.extend(tinfo, teacherlistinfo);
            GM_setValue(tinfokey, tinfo);
            if(now - tinfo.expire < configExprMilliseconds) {
              updateTeacherinfoToUI(jqel, tinfo);
              next();
              return true;
            }
          }
          // ajax 请求一定要包含在一个函数中
          let start = (new Date()).getTime();
          $.ajax({
            url: window.location.protocol + '//www.51talk.com/TeacherNew/teacherComment?tid=' + tid + '&type=bad&has_msg=1',
            type: 'GET',
            dateType: 'html',
            success: function(r) {
              let jqr = $(r);
              if(jqr.find('.teacher-name-tit').length > 0) {
                let tempitem = jqr.find('.teacher-name-tit')[0];
                tempitem.innerHTML = tempitem.innerHTML.replace('<!--', '').replace('-->', '');
              }
              if(jqr.find(".evaluate-content-left span").length >= 3) {
                let thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]);
                let thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]);
                let thumbupRate = ((thumbup + 0.00001) / (thumbdown + thumbup)).toFixed(2) * 100;
                let favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]);
                let isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
                let tage = Number(jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("")[0]);
                let slevel = jqr.find('.sui-students').text();
                jqr.remove();
                let tinfo = {
                  'slevel': slevel,
                  'tage': tage,
                  'thumbup': thumbup,
                  'thumbdown': thumbdown,
                  'thumbupRate': thumbupRate,
                  'indicator': Math.ceil(teacherlistinfo.label * thumbupRate / 100) + favoritesCount,
                  'favoritesCount': favoritesCount,
                  'isfavorite': isfavorite,
                  'expire': new Date().getTime()
                };
                tinfo = $.extend(tinfo, teacherlistinfo);
                GM_setValue(tinfokey, tinfo);
                updateTeacherinfoToUI(jqel, tinfo);
              } else {
                console.log('Teacher s detail info getting error:' + JSON.stringify(jqel) + ",error info:" + r);
              }
            },
            error: function(data) {
              console.log("xhr error when getting teacher " + JSON.stringify(jqel) + ",error msg:" + JSON.stringify(data));
            }
          }).always(function() {
            while((new Date()).getTime() - start < 600) {
              continue;
            }
            next();
          });
        });
      });
    });
    submit(function(next) {
      //翻页
      let autonextpagecount = GM_getValue('autonextpagecount', 0);
      if(autonextpagecount > 0) {
        GM_setValue('autonextpagecount', autonextpagecount - 1);
        if($('.s-t-page>.next-page').length == 0) {
          GM_setValue('autonextpagecount', 0);
          if(isStopShowboxAndAutoGetNextTimeTeachers()) return;
        } else {
          $('.s-t-page .next-page')[0].click();
          return false;
        }
      } else {
        if(isStopShowboxAndAutoGetNextTimeTeachers()) return;
      }
      next();
    });
  }

  function isStopShowboxAndAutoGetNextTimeTeachers() {
    let str = sessionStorage.getItem('selectedTimeSlots');
    if(!str) return false;
    let selectedTimeSlots = JSON.parse(str);
    let cur = selectedTimeSlots.shift();
    if(cur) {
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
  if(settings.isDetailPage) {
    function processTeacherDetailPage(jqr) {
      jqr.find('.teacher-name-tit').prop('innerHTML', function(i, val) {
        return val.replaceAll('<!--', '').replaceAll('-->', '');
      });
      let tinfo = GM_getValue(getinfokey(), {});
      tinfo.label = (function() {
        let l = 0;
        $.each(jqr.find(".t-d-label").text().match(num).clean(""), function(i, val) {
          l += Number(val);
        });
        l = Math.ceil(l / 5);
        return l;
      })();
      if(window.location.href.toLocaleLowerCase().includes("teachercomment")) {
        tinfo.thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]);
        tinfo.thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]);
        tinfo.thumbupRate = ((tinfo.thumbup + 0.00001) / (tinfo.thumbdown + tinfo.thumbup)).toFixed(2) * 100;
        tinfo.indicator = Math.ceil(tinfo.label * tinfo.thumbupRate / 100) + tinfo.favoritesCount;
        tinfo.slevel = jqr.find('.sui-students').text();
        tinfo.expire = new Date().getTime();
      }
      tinfo.favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]);
      tinfo.isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
      tinfo.age = Number(jqr.find(".age.age-line:eq(0)").text().match(num).clean("")[0]);
      tinfo.name = jqr.find(".t-name").text().trim();
      //无法获取type
      //tinfo.type = $('.s-t-top-list .li-active').text().trim();
      tinfo.tage = Number(jqr.find(".teacher-name-tit > .age.age-line:eq(1)").text().match(num).clean("")[0]);
      GM_setValue(getinfokey(), tinfo);
      jqr.find(".teacher-name-tit").prop('innerHTML', function(i, val) {
        return `${val}
			<span class="age age-line">指标${tinfo.indicator}</span>
			<span class="age age-line">率${tinfo.thumbupRate}%</span>
			<span class="age age-line">赞${tinfo.thumbup}</span>
			<span class="age age-line">踩${tinfo.thumbdown}</span>
			<span class="age age-line">标签数${tinfo.label}</span>
			`;
      });
    }
    submit(function(next) {
      processTeacherDetailPage($(document));
      next();
    });
  }

  function addCheckbox(val, lbl, group) {
    let container = $('#timesmutipulecheck');
    let inputs = container.find('input');
    let id = inputs.length + 1;
    $('<input />', {
      type: 'checkbox',
      id: 'cb' + id,
      value: val,
      name: group
    }).appendTo(container);
    $('<label />', {
      'for': 'cb' + id,
      text: lbl ? lbl : val
    }).appendTo(container);
  }
  if(settings.isListPage || settings.isDetailPage) {
    //构建插件信息
    submit(function(next) {
      try {
        let config = GM_getValue('filterconfig', {
          l1: 300,
          l2: maxlabel,
          rate1: 97,
          rate2: maxrate,
          age1: minage,
          age2: maxage
        });
        $('body').append(`<div id='filterdialog' title='Teacher Filter'>
					<div id='tabs'>
						<div>
							<ul>
								<li><a href="#tabs-1">Search Teachers</a></li>
								<li><a href="#tabs-2">Sorted Teachers</a></li>
							</ul>
							<br />
							<div id='buttons' style='text-align: center'>
								<button id='asc' title='当前为降序，点击后按升序排列'>升序</button>
								<button id='desc' title='当前为升序，点击进行降序排列'  style='display:none;'>降序</button>&nbsp;
								<input id='tinfoexprhours' title='缓存过期时间（小时）'>&nbsp;
								<button title='清空教师信息缓存，并重新搜索'>清除缓存</button>&nbsp;
								<a>去提建议和BUG</a>&nbsp;
								<a>?</a>&nbsp;
							</div>
							<div id='buttons1' style='text-align: center;'>
								<div id='timesmutipulecheck'></div>
                <button>反选时间段</button>&nbsp;
								<button id='autogettodaysteachers'>获取选定时段老师</button>&nbsp;
							</div>
						</div>
						<div id="tabs-1">
							当前可选<span id='tcount' />位,被折叠<span id='thidecount' />位。<br />
							有效经验值 <span id='_tLabelCount' /><br /><div id='tlabelslider'></div>
							收藏数 <span id='_tfc' /><br /><div id='fcSlider'></div>
							好评率 <span id='_thumbupRate'/><br /><div id='thumbupRateslider'></div>
							年龄 <span id='_tAge' /><br /><div id='tAgeSlider'></div>
						</div>
						<div id="tabs-2">
							<table id="teachertab"></table>
							<div id="pager5"></div>
						</div>
					</div>
				</div>`);
        $('body').append("<div id='teachlistdialog' style='display:none;'></div>");
        $('body').append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。
        $("#tlabelslider").slider({
          range: true,
          min: minlabel - 1,
          max: maxlabel,
          values: [
            config.l1 < minlabel - 1 ? minlabel - 1 : config.l1,
            maxlabel
          ],
          slide: function(event, ui) {
            $('#_tLabelCount').html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on('slidestop', function(event, ui) {
          let l1 = $("#tlabelslider").slider('values', 0);
          let l2 = $("#tlabelslider").slider('values', 1);
          let uifilters = getUiFilters();
          let filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.l1 = l1;
          filterconfig.l2 = l2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $("#fcSlider").slider({
          range: true,
          min: minfc,
          max: maxfc,
          values: [config.fc1 < minfc ? minfc : config.fc1, maxfc],
          slide: function(event, ui) {
            $('#_tfc').html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on('slidestop', function(event, ui) {
          let fc1 = $("#fcSlider").slider('values', 0);
          let fc2 = $("#fcSlider").slider('values', 1);
          let uifilters = getUiFilters();
          let filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.fc1 = fc1;
          filterconfig.fc2 = fc2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $("#thumbupRateslider").slider({
          range: true,
          min: minrate,
          max: maxrate,
          values: [config.rate1 < minrate ? minrate : config.rate1, maxrate],
          slide: function(event, ui) {
            $('#_thumbupRate').html(ui.values[0] + "% - " + ui.values[1] + '%');
          }
        }).on('slidestop', function(event, ui) {
          let rate1 = $("#thumbupRateslider").slider('values', 0);
          let rate2 = $("#thumbupRateslider").slider('values', 1);
          let uifilters = getUiFilters();
          let filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.rate1 = rate1;
          filterconfig.rate2 = rate2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $("#tAgeSlider").slider({
          range: true,
          min: Number(minage), // 兼容旧缓存中的存储类型，2019-10-1后可以移除类型转换
          max: Number(maxage), // 兼容旧缓存中的存储类型，2019-10-1后可以移除类型转换
          values: [config.age1 < minage ? minage : config.age1, config.age2 > maxage ? maxage : config.age2],
          slide: function(event, ui) {
            $('#_tAge').html(ui.values[0] + " - " + ui.values[1]);
          }
        }).on("slidestop", function(event, ui) {
          let age1 = $("#tAgeSlider").slider('values', 0);
          let age2 = $("#tAgeSlider").slider('values', 1);
          let uifilters = getUiFilters();
          let filterconfig = GM_getValue('filterconfig', uifilters);
          filterconfig.age1 = age1;
          filterconfig.age2 = age2;
          GM_setValue('filterconfig', filterconfig);
          executeFilters(uifilters);
        });
        $('#buttons>button,#buttons>input,#buttons>a')
          //升序
          .eq(0).button({ icon: 'ui-icon-arrowthick-1-n', showLabel: false }).click(function() {
            $('#desc').show();
            $(this).hide();
            sortByIndicator(asc);
          }).end()
          //降序
          .eq(1).button({ icon: 'ui-icon-arrowthick-1-s', showLabel: false }).click(function() {
            $('#asc').show();
            $(this).hide();
            sortByIndicator(desc);
          }).end()
          // 缓存过期时间（小时）
          .eq(2).spinner({ min: 0, spin: function(event, ui) { GM_setValue('tinfoexprhours', ui.value) } }).css({ width: '45px' }).val(GM_getValue('tinfoexprhours', configExprMilliseconds / 3600000)).end()
          //清空缓存
          .eq(3).button({ icon: 'uiicon-trash', showLabel: false }).click(function() {
            $.each(GM_listValues(), function(i, item) {
              if(item.startsWith('tinfo-')) {
                GM_deleteValue(item);
              }
            });
            $('.go-search').click();
          }).end()
          //submit suggestion
          .eq(4).button({ icon: 'ui-icon-comment', showLabel: false }).prop('href', 'https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title=').prop('target', '_blank').end()
          //系统帮助
          .eq(5).button({ icon: 'ui-icon-help', showLabel: false }).prop('href', 'https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk').prop('target', '_blank').end();
        $('#buttons1>button')
          //反选时间段
          .eq(0).button({ icon: 'ui-icon-seek-next', showLabel: true }).click(function() {
            $('#timesmutipulecheck>input').each(function(i, item) {
              $(item).prop("checked", !$(item).is(":checked")).change();
            });
          }).end()
          // 获取选定时段老师
          .eq(1).button({ icon: 'ui-icon-seek-next', showLabel: true }).click(function() {
            let selectedTimeSlots = [];
            $('#timesmutipulecheck>input').each(function(i, item) {
              if($(item).is(":checked")) {
                selectedTimeSlots.push($(item).val());
              }
            });
            sessionStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots));
            sessionStorage.setItem('selectedTimeSlotsTotal', selectedTimeSlots.length);
            isStopShowboxAndAutoGetNextTimeTeachers();
          }).end();
        //初始化时间选择按钮
        $('div.condition-type:eq(0)>ul.condition-type-time>li').each(function(i, item) {
          addCheckbox($(item).attr('data-val'), $(item).text());
        });
        let timesstr = sessionStorage.getItem("selectedTimeSlots"),
          selectedTimeSlots = [];
        if(timesstr) {
          selectedTimeSlots = JSON.parse(timesstr);
          if(selectedTimeSlots.length > 0) {
            let i = selectedTimeSlots.length;
            while(i--) {
              $("#timesmutipulecheck>input[value='" + selectedTimeSlots[i] + "']").attr('checked', true);
            }
          } else {
            $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr('checked', true);
          }
        } else {
          $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr('checked', true);
        }
        $('#timesmutipulecheck').find("input").checkboxradio({
          icon: false
        });

        function getCatchedTeachers() {
          let teachers = [];
          $.each(GM_listValues(), function(i, item) {
            if(item.startsWith('tinfo-')) {
              let t = GM_getValue(item);
              t.tid = item.slice(6, item.length);
              teachers.push(t);
            }
          });
          let indexs = {};
          teachers = teachers.sort(function(t1, t2) {
            if(t1.indicator == t2.indicator) return t1.favoritesCount > t2.favoritesCount ? -1 : 1;
            return t1.indicator > t2.indicator ? -1 : 1;
          }).map((val, idx) => {
            if(isNaN(indexs[val.type])) {
              indexs[val.type] = 1;
            } else {
              indexs[val.type] += 1;
            }
            return $.extend(val, {
              //  'slevel': slevel,
              'tage': Number(val.tage),
              'thumbup': Number(val.thumbup),
              'thumbdown': Number(val.thumbdown),
              'thumbupRate': Number(val.thumbupRate),
              'indicator': Number(val.indicator),
              //'favoritesCount': val.favoritesCount,
              //'isfavorite': val.isfavorite,
              //'expire': new Date().getTime(),
              'rank': indexs[val.type]
            });
          });
          return teachers;
        }
        $("#tabs").tabs({
          active: '#tabs-2',
          activate: function(event, ui) {
            if(ui.newPanel.attr('id') != 'tabs-2') return;
            let teachers = getCatchedTeachers();
            let jqtable = $("#teachertab");
            //searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
            jqtable.jqGrid({
              data: teachers,
              datatype: "local",
              height: 240,
              colNames: ['查', '类型', '排名', 'Name', '爱', '分', '标', '率%', '收藏数', '学', '教龄', '好', '差', '龄', '更新'],
              colModel: [{
                name: 'effectivetime',
                index: 'effectivetime',
                width: 45,
                sorttype: "float",
                align: 'right',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  let date = new Date(Number(value));
                  if(date instanceof Date && !isNaN(date.valueOf())) {
                    return date.toString('HHmmss');
                  }
                  return value;
                }
              }, {
                name: 'type',
                index: 'type',
                width: 55,
                sorttype: "string",
                align: 'left',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if(value) return value;
                  else return 'na';
                }
              }, {
                name: 'rank',
                index: 'rank',
                width: 40,
                sorttype: "float",
                align: 'right',
                searchoptions: {
                  sopt: ['le']
                }
              }, {
                name: 'name',
                index: 'name',
                width: 125,
                sorttype: "string",
                formatter: function formatter(value, options, rData) {
                  return "<a href='http://www.51talk.com/TeacherNew/info/" + rData['tid'] + "' target='_blank' style='color:blue'>" + (!!value ? value : rData['tid']) + "</a>";
                }
              }, {
                name: 'isfavorite',
                index: 'isfavorite',
                width: 39,
                sorttype: "string",
                align: 'left',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if(value) return '收藏';
                  else return '';
                }
              }, {
                name: 'indicator',
                index: 'indicator',
                width: 50,
                sorttype: "float",
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'label',
                index: 'label',
                width: 45,
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'thumbupRate',
                index: 'thumbupRate',
                width: 35,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'favoritesCount',
                index: 'favoritesCount',
                width: 35,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'slevel',
                index: 'slevel',
                width: 85,
                sorttype: "string",
                align: 'left',
                searchoptions: {
                  //defaultValue: '中级',
                  sopt: ['cn', 'nc']
                }
              }, {
                name: 'tage',
                index: 'tage',
                width: 25,
                sorttype: "float",
                align: 'right',
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'thumbup',
                index: 'thumbup',
                width: 45,
                align: "right",
                sorttype: "float",
                searchoptions: {
                  sopt: ['ge']
                }
              }, {
                name: 'thumbdown',
                index: 'thumbdown',
                width: 30,
                sorttype: "float",
                align: 'right'
              }, {
                name: 'age',
                index: 'age',
                width: 30,
                sorttype: "float",
                align: 'right',
                searchoptions: {
                  sopt: ['le', 'ge', 'eq']
                }
              }, {
                name: 'expire',
                index: 'expire',
                width: 35,
                sorttype: "Date",
                align: 'right',
                searchoptions: {
                  sopt: ['cn']
                },
                formatter: function formatter(value, options, rData) {
                  if(value) {
                    let d = new Date().getTime() - value;
                    if(d < 1000 * 60) {
                      return "刚刚";
                    } else if(d < 1000 * 60 * 60) {
                      return (d / 60000).toFixed(0) + "分";
                    } else if(d < 1000 * 60 * 60 * 24) {
                      return (d / 3600000).toFixed(0) + "时";
                    } else {
                      return (d / 86400000).toFixed(0) + "天";
                    }
                    return d;
                  } else return 'na';
                }
              }],
              multiselect: false,
              rowNum: 10,
              rowList: [
                5, 10, 20, 30
              ],
              pager: '#pager5',
              sortname: 'effectivetime desc,indicator desc',
              viewrecords: true,
              multiSort: true,
              sortorder: "desc",
              grouping: false,
              shrinkToFit: false,
              //autowidth: true,
              width: 732,
              //caption: "",,
            }).jqGrid('filterToolbar', {
              searchOperators: true
            });
          }
        });
        let uifilters = getUiFilters();
        executeFilters(uifilters);
        $('#_tAge').html(uifilters.age1 + " - " + uifilters.age2);
        $('#_tLabelCount').html(uifilters.l1 + " - " + uifilters.l2);
        $('#_thumbupRate').html(uifilters.rate1 + "% - " + uifilters.rate2 + '%');
        $('#_tfc').html(uifilters.fc1 + " - " + uifilters.fc2 + '');
      } catch (ex) {
        console.log(ex + "");
      } finally {
        next();
      }
    });
    //弹出信息框
    submit(function(next) {
      $('.s-t-list').before($(".s-t-page").prop('outerHTML'));
      $('#tabs>div:first').append($(".s-t-page").prop('outerHTML'));
      sortByIndicator(desc);
      $("#tabs").tabs("option", "active", 1);
      if(settings.isDetailPage) {
        $("#tabs").tabs("option", "disabled", [0]);
      }
      $('#filterdialog').dialog({
        'width': '750'
      });
      $('#filterdialog').parent().scrollFix();
      $('#filterdialog').dialog("open");
      next();
    });
  }
  if(settings.isCoursePage) {
    submit(function(next) {
      $('.course_lock').removeClass('course_lock').addClass('course_unlock');
      $('img.course_mask').removeClass('course_mask').attr('src', '');
      next();
    });
  }
})();
