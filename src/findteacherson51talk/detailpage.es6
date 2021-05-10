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

if (settings.isDetailPage) {
    function processTeacherDetailPage(jqr) {
        jqr.find(".teacher-name-tit").prop("innerHTML", function (i, val) {
            return val.replaceAll("<!--", "").replaceAll("-->", "");
        });
        let tinfo = GM_getValue(getinfokey(), {});
        tinfo.label = (function () {
            let l = 0;
            $.each(jqr.find(".t-d-label").text().match(num).clean(""), function (i, val) {
                l += Number(val);
            });
            return l;
        })();

        //if never set expire then
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

        tinfo.name = jqr.find(".t-name").text().trim();
        //无法获取type
        //tinfo.type = $('.s-t-top-list .li-active').text().trim();

        var agesstr = jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("");
        tinfo.tage = Number(agesstr[1]);
        tinfo.age = Number(agesstr[0]);

        tinfo.effectivetime = getBatchNumber();
        tinfo.indicator = calcIndicator(tinfo);
        GM_setValue(getinfokey(), tinfo);
        jqr.find(".teacher-name-tit").prop("innerHTML", function (i, val) {
            return `${val}
  <span class="age age-line"><label title='指标'>${tinfo.indicator}</label></span>
  <span class="age age-line"><label title='好评率'>${tinfo.thumbupRate}%</label></span>
  <span class="age age-line"><label title='被赞数量'>${tinfo.thumbup}</label></span>
  <span class="age age-line"><label title='被踩数量'>${tinfo.thumbdown}</label></span>
  <span class="age age-line"><label title='评论标签数量'>${tinfo.label}</label></span>
    <span class="age age-line"><label title='在同类别教师中的排名'><span id="teacherRank"></span></label></span>
  `;
        });
    }
    submit(function (next) {
        processTeacherDetailPage($(document));
        next();
    });
}