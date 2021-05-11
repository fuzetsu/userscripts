// ==UserScript==
// @name BestTeacher
// @version 2021.4.15001
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
// ==/UserScript==

import {
    conf,
    config
} from './bestteacher_gm_toolbar.es6'

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
} from './common.es6'

import './jqueryextend.es6'

import './pacesetup.es6'

import {
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
} from './listpage'
import './detailpage'

import './../../libs/jquery-ui-1.12.1/jquery-ui.css';
import './../../libs/jqGrid-4.15.5/dist/css/ui.jqgrid.css';

import './findingteacher.user.css';

(function () {
    'use strict'

    if (settings.isListPage || settings.isDetailPage) {
        //构建插件信息
        submit(function (next) {
            try {
                let config = GM_getValue('filterconfig', {
                    l1: 300,
                    l2: maxlabel,
                    rate1: 97,
                    rate2: maxrate,
                    age1: minage,
                    age2: maxage
                })
                let buttons = ''
                if (settings.isListPage) {
                    buttons = `
            <div id='buttons' style='text-align: center'>
            <button id='asc' title='当前为降序，点击后按升序排列'>升序</button>
            <button id='desc' title='当前为升序，点击进行降序排列' style='display:none;'>降序</button>&nbsp;
            <input id='tinfoexprhours' title='缓存过期时间（小时）'>&nbsp;
            <button title='清空缓存，并重新搜索'>清除缓存</button>&nbsp;
            <a>报告BUG</a>&nbsp;
            <a>帮助</a>&nbsp;
          </div>
          <div id='buttons1' style='text-align: center;'>
            <div id='timesmutipulecheck'></div>
            <button>反选时间段</button>&nbsp;
            <button id='autogettodaysteachers' title='自动获取上述选择时段的全部教师并缓存'>获取选定时段老师</button>&nbsp;
          </div>`
                }
                $('body').append(`<div id='filterdialog' title='Teacher Filter'>
      <div id='tabs'>
        <div>
          <ul>
            <li><a href="#tabs-1">Search Teachers</a></li>
            <li><a href="#tabs-2">Sorted Teachers</a></li>
          </ul>
          <br />
            ${buttons}
        </div>
        <div id="tabs-1">
          当前可选<span id='tcount' ></span>位,被折叠<span id='thidecount' ></span>位。<br />
          有效经验值 <span id='_tLabelCount' ></span><br /><div id='tlabelslider'></div>
          收藏数 <span id='_tfc' ></span><br /><div id='fcSlider'></div>
          好评率 <span id='_thumbupRate'></span><br /><div id='thumbupRateslider'></div>
          年龄 <span id='_tAge' ></span><br /><div id='tAgeSlider'></div>
        </div>
        <div id="tabs-2">
          <table id="teachertab"></table>
          <div id="pager5"></div>
        </div>
      </div>
    </div>`)
                $('body').append("<div id='teachlistdialog' style='display:none;'></div>")
                $('body').append("<div id='wwwww'>已加载选课辅助插件。</div>") //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。
                $('#tlabelslider')
                    .slider({
                        range: true,
                        min: minlabel - 1,
                        max: maxlabel,
                        values: [config.l1 < minlabel - 1 ? minlabel - 1 : config.l1, maxlabel],
                        slide: function (event, ui) {
                            $('#_tLabelCount').html(ui.values[0] + ' - ' + ui.values[1])
                        }
                    })
                    .on('slidestop', function (event, ui) {
                        let l1 = $('#tlabelslider').slider('values', 0)
                        let l2 = $('#tlabelslider').slider('values', 1)
                        let uifilters = getUiFilters()
                        let filterconfig = GM_getValue('filterconfig', uifilters)
                        filterconfig.l1 = l1
                        filterconfig.l2 = l2
                        GM_setValue('filterconfig', filterconfig)
                        executeFilters(uifilters)
                    })
                $('#fcSlider')
                    .slider({
                        range: true,
                        min: minfc,
                        max: maxfc,
                        values: [config.fc1 < minfc ? minfc : config.fc1, maxfc],
                        slide: function (event, ui) {
                            $('#_tfc').html(ui.values[0] + ' - ' + ui.values[1])
                        }
                    })
                    .on('slidestop', function (event, ui) {
                        let fc1 = $('#fcSlider').slider('values', 0)
                        let fc2 = $('#fcSlider').slider('values', 1)
                        let uifilters = getUiFilters()
                        let filterconfig = GM_getValue('filterconfig', uifilters)
                        filterconfig.fc1 = fc1
                        filterconfig.fc2 = fc2
                        GM_setValue('filterconfig', filterconfig)
                        executeFilters(uifilters)
                    })
                $('#thumbupRateslider')
                    .slider({
                        range: true,
                        min: minrate,
                        max: maxrate,
                        values: [config.rate1 < minrate ? minrate : config.rate1, maxrate],
                        slide: function (_event, ui) {
                            $('#_thumbupRate').html(ui.values[0] + '% - ' + ui.values[1] + '%')
                        }
                    })
                    .on('slidestop', function (event, ui) {
                        let rate1 = $('#thumbupRateslider').slider('values', 0)
                        let rate2 = $('#thumbupRateslider').slider('values', 1)
                        let uifilters = getUiFilters()
                        let filterconfig = GM_getValue('filterconfig', uifilters)
                        filterconfig.rate1 = rate1
                        filterconfig.rate2 = rate2
                        GM_setValue('filterconfig', filterconfig)
                        executeFilters(uifilters)
                    })

                $('#tAgeSlider')
                    .slider({
                        range: true,
                        min: minage,
                        max: maxage,
                        values: [
                            config.age1 < minage ? minage : config.age1,
                            config.age2 > maxage ? maxage : config.age2
                        ],
                        slide: function (event, ui) {
                            $('#_tAge').html(ui.values[0] + ' - ' + ui.values[1])
                        }
                    })
                    .on('slidestop', function (event, ui) {
                        let age1 = $('#tAgeSlider').slider('values', 0)
                        let age2 = $('#tAgeSlider').slider('values', 1)
                        let uifilters = getUiFilters()
                        let filterconfig = GM_getValue('filterconfig', uifilters)
                        filterconfig.age1 = age1
                        filterconfig.age2 = age2
                        console.log(`log2 ${age1}  ${age2}`)
                        GM_setValue('filterconfig', filterconfig)
                        executeFilters(uifilters)
                    })
                $('#buttons>button,#buttons>input,#buttons>a')
                    //升序
                    .eq(0)
                    .button({
                        icon: 'ui-icon-arrowthick-1-n',
                        showLabel: true
                    })
                    .click(function () {
                        $('#desc').show()
                        $(this).hide()
                        sortByIndicator(asc)
                    })
                    .end()
                    //降序
                    .eq(1)
                    .button({
                        icon: 'ui-icon-arrowthick-1-s',
                        showLabel: true
                    })
                    .click(function () {
                        $('#asc').show()
                        $(this).hide()
                        sortByIndicator(desc)
                    })
                    .end()
                    // 缓存过期时间（小时）
                    .eq(2)
                    .spinner({
                        min: 0,
                        spin: function (event, ui) {
                            GM_setValue('tinfoexprhours', ui.value)
                        }
                    })
                    .css({
                        width: '45px'
                    })
                    .val(GM_getValue('tinfoexprhours', configExprMilliseconds / 3600000))
                    .end()
                    //清空缓存
                    .eq(3)
                    .button({
                        icon: 'uiicon-trash',
                        showLabel: true
                    })
                    .click(function () {
                        var keys = GM_listValues()
                        $.each(keys, function (i, item) {
                            let title = `正在删除第${i}个教师缓存`
                            submit(function (next) {
                                try {
                                    $('title').html(title)
                                    GM_deleteValue(item)
                                } finally {
                                    next()
                                }
                            })
                        })
                        $('.go-search').click()
                    })
                    .end()
                    //submit suggestion
                    .eq(4)
                    .button({
                        icon: 'ui-icon-comment',
                        showLabel: true
                    })
                    .prop(
                        'href',
                        'https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title='
                    )
                    .prop('target', '_blank')
                    .end()
                    //系统帮助
                    .eq(5)
                    .button({
                        icon: 'ui-icon-help',
                        showLabel: true
                    })
                    .prop(
                        'href',
                        'https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk'
                    )
                    .prop('target', '_blank')
                    .end()
                $('#buttons1>button')
                    //反选时间段
                    .eq(0)
                    .button({
                        icon: 'ui-icon-seek-next',
                        showLabel: true
                    })
                    .click(function () {
                        $('#timesmutipulecheck>input').each(function (i, item) {
                            $(item).prop('checked', !$(item).is(':checked')).change()
                        })
                    })
                    .end()
                    // 获取选定时段老师
                    .eq(1)
                    .button({
                        icon: 'ui-icon-seek-next',
                        showLabel: true
                    })
                    .click(function () {
                        let selectedTimeSlots = []
                        $('#timesmutipulecheck>input').each(function (i, item) {
                            if ($(item).is(':checked')) {
                                selectedTimeSlots.push($(item).val())
                            }
                        })
                        sessionStorage.setItem('selectedTimeSlots', JSON.stringify(selectedTimeSlots))
                        sessionStorage.setItem('selectedTimeSlotsTotal', selectedTimeSlots.length)
                        isStopShowboxAndAutoGetNextTimeTeachers()
                    })
                    .end()
                //初始化时间选择按钮
                $('div.condition-type:eq(0)>ul.condition-type-time>li').each(function (i, item) {
                    addCheckbox($(item).attr('data-val'), $(item).text())
                })
                let timesstr = sessionStorage.getItem('selectedTimeSlots'),
                    selectedTimeSlots = []
                if (timesstr) {
                    selectedTimeSlots = JSON.parse(timesstr)
                    if (selectedTimeSlots.length > 0) {
                        let i = selectedTimeSlots.length
                        while (i--) {
                            $("#timesmutipulecheck>input[value='" + selectedTimeSlots[i] + "']").attr(
                                'checked',
                                true
                            )
                        }
                    } else {
                        $(
                            "#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']"
                        ).attr('checked', true)
                    }
                } else {
                    $("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr(
                        'checked',
                        true
                    )
                }
                $('#timesmutipulecheck').find('input').checkboxradio({
                    icon: false
                })

                function getCatchedTeachers() {
                    let teachers = []
                    $.each(GM_listValues(), function (i, item) {
                        if (item.startsWith('tinfo-')) {
                            let t = GM_getValue(item)
                            t.tid = item.slice(6, item.length)
                            teachers.push(t)
                        }
                    })
                    let indexs = {}
                    teachers = teachers
                        .sort(function (t1, t2) {
                            if (t1.indicator == t2.indicator)
                                return t1.favoritesCount > t2.favoritesCount ? -1 : 1
                            return t1.indicator > t2.indicator ? -1 : 1
                        })
                        .map((val, idx) => {
                            if (isNaN(indexs[val.type])) {
                                indexs[val.type] = 1
                            } else {
                                indexs[val.type] += 1
                            }
                            let t = $.extend(val, {
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
                            })
                            //GM_setValue("tinfo-"+t.tid,t);
                            return t
                        })
                    return teachers
                }
                $('#tabs').tabs({
                    active: '#tabs-2',
                    activate: function (event, ui) {
                        if (ui.newPanel.attr('id') != 'tabs-2') return
                        let teachers = getCatchedTeachers()
                        $('#teachertab')
                            //searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
                            .jqGrid({
                                data: teachers,
                                datatype: 'local',
                                height: 240,
                                colNames: [
                                    '查',
                                    '类型',
                                    '排名',
                                    'Name',
                                    '爱',
                                    '分',
                                    '标',
                                    '率%',
                                    '收藏数',
                                    '学',
                                    '教龄',
                                    '好',
                                    '差',
                                    '龄',
                                    '更新'
                                ],
                                colModel: [
                                    //
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
                                            let date = new Date(Number(value))
                                            if (date instanceof Date && !isNaN(date.valueOf())) {
                                                return date.toString('MMddHHmm')
                                            }
                                            return value
                                        }
                                    }, //
                                    {
                                        name: 'type',
                                        index: 'type',
                                        width: 55,
                                        sorttype: 'string',
                                        align: 'left',
                                        searchoptions: {
                                            sopt: ['cn'],
                                            defaultValue: $('.s-t-top-list .li-active').text() == '收藏外教' ?
                                                '' : $('.s-t-top-list .li-active').text()
                                        },
                                        formatter: function formatter(value, options, rData) {
                                            if (value) return value
                                            else return 'na'
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
                                            return (
                                                "<a href='http://www.51talk.com/TeacherNew/info/" +
                                                rData['tid'] +
                                                "' target='_blank' style='color:blue'>" +
                                                (!!value ? value : rData['tid']) +
                                                '</a>'
                                            )
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
                                            if (value) return '收藏'
                                            else return ''
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
                                                let d = Date.now() - value
                                                if (d < 1000 * 60) {
                                                    return '刚刚'
                                                } else if (d < 1000 * 60 * 60) {
                                                    return (d / 60000).toFixed(0) + '分'
                                                } else if (d < 1000 * 60 * 60 * 24) {
                                                    return (d / 3600000).toFixed(0) + '时'
                                                } else {
                                                    return (d / 86400000).toFixed(0) + '天'
                                                }
                                                return d
                                            } else return 'na'
                                        }
                                    }
                                ],
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
                                responsive: true,
                                del: true
                                //refresh: true,
                                //autowidth: true,
                                //width: 732
                                //caption: "",,
                            })
                            .jqGrid('filterToolbar', {
                                searchOperators: true
                            })[0]
                            .triggerToolbar()
                        if (settings.isListPage) {
                            $.each($('.item'), function (i, item) {
                                let jqel = $(item)
                                let tid = jqel
                                    .find('.teacher-details-link a')
                                    .attr('href')
                                    .replace('https://www.51talk.com/TeacherNew/info/', '')
                                    .replace('http://www.51talk.com/TeacherNew/info/', '')
                                let t = teachers.find((currentValue, index, arr) => {
                                    return currentValue.tid == tid
                                })
                                let lb = jqel.find('.teacher-name>label:eq(3)')
                                if (lb.length == 0)
                                    jqel
                                    .find('.teacher-name')
                                    .html(`${jqel.find('.teacher-name').html()}| ${getRankHtml(t)}`)
                                else lb.replaceWith(getRankHtml(t))
                            })
                        }
                        if (settings.isDetailPage) {
                            let t = teachers.find((currentValue, index, arr) => {
                                return currentValue.tid == gettid()
                            })
                            $('#teacherRank').html(getRankHtml(t))
                        }
                    }
                })
                let uifilters = getUiFilters()
                executeFilters(uifilters)
                $('#_tAge').html(uifilters.age1 + ' - ' + uifilters.age2)
                $('#_tLabelCount').html(uifilters.l1 + ' - ' + uifilters.l2)
                $('#_tfc').html(uifilters.fc1 + ' - ' + uifilters.fc2 + '')
                $('#_thumbupRate').html(uifilters.rate1 + '% - ' + uifilters.rate2 + '%')
            } catch (ex) {
                console.log(ex + '')
                throw ex
            } finally {
                next()
            }
        })

        function getRankHtml(t) {
            if (t) {
                let colorif = ''
                if (t.rank <= conf.markRankRed) {
                    colorif = "style = 'color:red'"
                }
                return `<label title='在同类别教师中的排名' ${colorif}> ${t.rank}名</label>`
            }
        }
        //弹出信息框
        submit(function (next) {
            $('.s-t-list').before($('.s-t-page').prop('outerHTML'))
            $('#tabs>div:first').append($('.s-t-page').prop('outerHTML'))
            sortByIndicator(desc)
            $('#tabs').tabs('option', 'active', 1)
            if (settings.isDetailPage) {
                $('#tabs').tabs('option', 'disabled', [0])
            }
            $('#filterdialog').dialog({
                width: '850'
            })
            $('#filterdialog').parent().scrollFix()
            $('#filterdialog').dialog('open')
            next()
        })
    }
    if (settings.isCoursePage) {
        submit(function (next) {
            $('.course_lock').removeClass('course_lock').addClass('course_unlock')
            $('img.course_mask').removeClass('course_mask').attr('src', '')
            next()
        })
    }
    x => x
})()