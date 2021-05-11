import {
  url,
  settings,
  configExprMilliseconds,
  num,
  gettid,
  getorAddSession,
  sleep,
  asc,
  desc,
  sortByIndicator,
  getBatchNumber,
  getLeftPageCount,
  getAutoNextPagesCount,
  getinfokey,
  calcIndicator,
  calcThumbRate,
  submit
} from './common.es6';

import './jqueryextend'

let maxrate = 0,
  minrate = 99999,
  maxlabel = 0,
  minlabel = 9999999,
  maxfc = 0,
  minfc = 999999,
  maxage = 0,
  minage = 99999;


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
  jqel.find(".teacher-name").html(jqel.find(".teacher-name").html() +
    `<br /><label title='评论标签数量'>${tinfo.label}</label>|<label title='好评率'>${tinfo.thumbupRate}%</label>
      | <label title='收藏数量'>${tinfo.favoritesCount} </label> `);
  // jqel.find(".teacher-age").html(jqel.find(".teacher-age").html() + " | <label title='收藏数量'>" + tinfo.favoritesCount + "</label>");
  jqel.attr("indicator", tinfo.indicator);
}


function executeFilters(uifilters) {
  let tcount = 0,
    hidecount = 0;
  $.each($(".item"), function (i, item) {
    let node = $(item);
    let tinfojson = node.attr("teacherinfo");
    if (!tinfojson) {
      return true;
    }
    let tinfo = JSON.parse(tinfojson);
    var ret = true;
    if (!isNaN(tinfo.thumbupRate))
      ret = tinfo.thumbupRate >= uifilters.rate1 &&
      tinfo.thumbupRate <= uifilters.rate2;
    if (!isNaN(tinfo.label))
      ret = tinfo.label >= uifilters.l1 &&
      tinfo.label <= uifilters.l2 && ret;
    if (!isNaN(tinfo.age)) tinfo.age >= uifilters.age1 &&
      tinfo.age <= uifilters.age2 && ret;
    if (!isNaN(tinfo.favoritesCount)) tinfo.favoritesCount >= uifilters.fc1 &&
      tinfo.favoritesCount <= uifilters.fc2 && ret;
    if (ret) {
      if (node.is(":hidden")) {
        //如果node是隐藏的则显示node元素，否则隐藏
        node.show();
        node
          .animate({
              left: "+=50",
            },
            3500
          )
          .animate({
              left: "-=50",
            },
            3500
          );
      } else {
        //nothing todo
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
  let l1 = $("#tlabelslider").slider("values", 0);
  let l2 = $("#tlabelslider").slider("values", 1);
  let rate1 = $("#thumbupRateslider").slider("values", 0);
  let rate2 = $("#thumbupRateslider").slider("values", 1);
  let age1 = $("#tAgeSlider").slider("values", 0);
  let age2 = $("#tAgeSlider").slider("values", 1);
  let fc1 = $("#fcSlider").slider("values", 0);
  let fc2 = $("#fcSlider").slider("values", 1);

  return {
    l1,
    l2,
    rate1,
    rate2,
    age1,
    age2,
    fc1,
    fc2,
  };
}

function getTeacherInfoInList(jqel) {
  let age = 0;
  let label = (function () {
    let j_len = jqel.find(".label").text().match(num).clean("").length;
    let l = 0;
    for (let j = 0; j < j_len; j++) {
      l += Number(jqel.find(".label").text().match(num).clean("")[j]);
    }
    return l;
  })();
  let name = jqel.find(".teacher-name").text();
  let type = $(".s-t-top-list .li-active").text();
  let effectivetime = getBatchNumber();
  if (type == "收藏外教") {
    let isfavorite = true;
    return {
      age,
      label,
      name,
      effectivetime,
      isfavorite,
    };
  } else
    return {
      age,
      label,
      name,
      effectivetime,
      type,
    };
}


if (settings.isListPage) {
  $(".item-top-cont").prop("innerHTML", function (i, val) {
    return val.replaceAll("<!--", "").replaceAll("-->", "");
  });
  // 自动获取时,显示停止按钮
  submit(function (next) {
    let totalPages = Number($(".s-t-page>a:eq(-2)").text()),
      curPageId = window.parameters().pageID ? window.parameters().pageID : 1,
      remainPages = totalPages - curPageId;
    let autonextpagecount = GM_getValue("autonextpagecount", 1);
    if (autonextpagecount > 0 && $(".s-t-page>.next-page").length > 0) {
      let dialog = $(`<div id="dialog-confirm" title="是否停止自动搜索老师?">
<p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>
<b>正在根据您的选择自动获取教师信息</b><br><br>
剩余${sessionStorage.getItem("selectedTimeSlotsRemain")}/${sessionStorage.getItem("selectedTimeSlotsTotal")}个时段，<br><br>
当前时段约${totalPages * 28}个教师，获取第${curPageId}/${totalPages}页，进度${Math.floor((curPageId / totalPages) * 100)}%,<br>

</p>
</div>`);
      dialog.appendTo("body");
      dialog.dialog({
        resizable: false,
        height: "auto",
        width: 400,
        modal: false,
        buttons: {
          立即停止: function () {
            sessionStorage.setItem("selectedTimeSlots", "");
            GM_setValue("autonextpagecount", 0);
            $(this).dialog("close");
          },
          // [`取后${(remainPages*0.25).toFixed(0)}页`]: function() {
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
        },
      });
    }
    next();
  });

  //获取列表中数据
  $(".item").each(function (index, el) {
    submit(function (next) {
      Pace.track(function () {
        let jqel = $(el);
        let tid = jqel.find(".teacher-details-link a").attr("href")
          .replace("https://www.51talk.com/TeacherNew/info/", "").replace("http://www.51talk.com/TeacherNew/info/", "");
        let tinfokey = "tinfo-" + tid;
        let teacherlistinfo = getTeacherInfoInList(jqel);
        let tinfo = GM_getValue(tinfokey);
        if (tinfo) {
          let now = Date.now();
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
        }
        // ajax 请求一定要包含在一个函数中
        let start = Date.now();
        $.ajax({
          url: window.location.protocol + "//www.51talk.com/TeacherNew/teacherComment?tid=" + tid + "&type=bad&has_msg=1",
          type: "GET",
          dateType: "html",
          success: function (r) {
            let jqr = $(r);
            if (jqr.find(".teacher-name-tit").length > 0) {
              let tempitem = jqr.find(".teacher-name-tit")[0];
              tempitem.innerHTML = tempitem.innerHTML.replace("<!--", "").replace("-->", "");
            }
            if (jqr.find(".evaluate-content-left span").length >= 3) {
              let thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]);
              let thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]);
              let favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]);
              let isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
              var agesstr = jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("");
              let tage = Number(agesstr[1]);
              let age = Number(agesstr[0]);
              let slevel = jqr.find(".sui-students").text();
              jqr.remove();
              let tinfo = {
                slevel: slevel,
                tage: tage,
                age: age,
                thumbup: thumbup,
                thumbdown: thumbdown,
                thumbupRate: 100,
                favoritesCount: favoritesCount,
                isfavorite: isfavorite,
                expire: Date.now(),
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
          error: function (data) {
            console.log("xhr error when getting teacher " + JSON.stringify(jqel) + ",error msg:" + JSON.stringify(data));
          },
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
    let autonextpagecount = GM_getValue("autonextpagecount", 0);
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

function isStopShowboxAndAutoGetNextTimeTeachers() {
  let str = sessionStorage.getItem("selectedTimeSlots");
  if (!str) return false;
  let selectedTimeSlots = JSON.parse(str);
  let cur = selectedTimeSlots.shift();
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

function addCheckbox(val, lbl, group) {
  let container = $("#timesmutipulecheck");
  let inputs = container.find("input");
  let id = inputs.length + 1;
  $("<input />", {
    type: "checkbox",
    id: "cb" + id,
    value: val,
    name: group,
  }).appendTo(container);
  $("<label />", {
    for: "cb" + id,
    text: lbl ? lbl : val,
  }).appendTo(container);
}


export {
  addCheckbox,
  executeFilters,
  getTeacherInfoInList,
  getUiFilters,
  isStopShowboxAndAutoGetNextTimeTeachers,
  maxage,
  maxfc,
  maxlabel,
  maxrate,
  minage,
  minfc,
  minlabel,
  minrate,
  updateTeacherinfoToUI

}