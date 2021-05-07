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

// @require https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/jquery-ui.min.js 
// @require https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/i18n/grid.locale-cn.js
// @require https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/dist/jquery.jqgrid.min.js
// @require https://greasyfork.org/scripts/388372-scrollfix/code/scrollfix.js?version=726657
// ==/UserScript==

import {$,submit} from './jqueryextend.es6'

import config from './bestteacher_gm_toolbar.es6'
import './common'
import './jqueryextend.es6'
import Pace from './pacesetup.es6'

(function () {
    "use strict";

    function getorAddSession(key, func) {
        if (!(key in sessionStorage)) {
            let data = typeof func == "function" ? func(key) : func;
            sessionStorage.setItem(key, data);
            return data;
        }
        return sessionStorage.getItem(key);
    }

    function sleep(delay) {
        let start = Date.now();
        while (Date.now() - start < delay) {
            continue;
        }
    }
    let asc = function (a, b) {
        let av = $(a).attr("indicator");
        let bv = $(b).attr("indicator");
        if (!av || !bv) return 0;
        return $(a).attr("indicator").toFloat() > $(b).attr("indicator").toFloat() ? 1 : -1;
    };
    let desc = function (a, b) {
        let av = $(a).attr("indicator");
        let bv = $(b).attr("indicator");
        if (!av || !bv) return 0;
        return $(a).attr("indicator").toFloat() > $(b).attr("indicator").toFloat() ? -1 : 1;
    };
    let sortByIndicator = function (sortBy) {
        let sortEle = $(".s-t-content.f-cb .item").sort(sortBy);
        $(".s-t-content.f-cb").empty().append(sortEle);
    };

    function getBatchNumber() {
        if (conf.newBatcherKeyHours <= 0) return Date.now();
        return parseInt(Date.now() / conf.newBatcherKeyHours / 3600000) * conf.newBatcherKeyHours * 3600000;
    }

    function getLeftPageCount() {
        let pages = Number($(".s-t-page>.next-page:first").prev().text());
        let curr = Number($(".s-t-page>.active:first").text());
        if (pages) return pages - curr;
        else return 0;
    }

    function getAutoNextPagesCount() {
        let pages = getLeftPageCount();
        if (settings.pagecount > pages) return pages;
        else return settings.pagecount;
    }
    //     $("head").append(`
    //     <link href="https://raw.githubusercontent.com/free-jqgrid/jqGrid/v4.15.5/css/ui.jqgrid.min.css" rel="stylesheet" type="text/css">
    //     <link href="https://ajax.aspnetcdn.com/ajax/jquery.ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">
    //   `);
    $("head").append(`<style type="text/css">
.search-teachers .s-t-list .item-time-list {margin-top:315px;}
.search-teachers .s-t-list .item { height: 679px; }
.search-teachers .s-t-list .s-t-content { margin-right: 0px;}
.search-teachers { width: 100%; }
.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}
.search-teachers .s-t-list .item { height: auto; margin-right: 5px; margin-bottom: 5px; }

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
.s-t-page { padding-top: 2px;}

/*!
 * jqGrid 4.15.5-pre - free jqGrid: https://github.com/free-jqgrid/jqGrid 
 * Date: 2018-08-12
 */.ui-jqgrid{position:relative;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box;-ms-touch-action:none;touch-action:manipulation}.ui-jqgrid div{line-height:normal}.ui-jqgrid table{border-collapse:separate;border-spacing:0;border-width:0;border-style:none}.ui-jqgrid table td{padding:0}.ui-jqgrid>.ui-jqgrid-view{position:relative;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;left:0;top:0;padding:0;font-size:11px}.ui-jqgrid>.ui-jqgrid-view *,.ui-jqgrid>.ui-jqgrid-view :after,.ui-jqgrid>.ui-jqgrid-view :before{-webkit-box-sizing:inherit;-moz-box-sizing:inherit;box-sizing:inherit}.ui-jqdialog .ui-jqdialog-titlebar,.ui-jqgrid .ui-jqgrid-errorbar,.ui-jqgrid .ui-jqgrid-titlebar{padding:.3em .3em .3em .3em;position:relative;font-size:12px;border-left:0 none;border-right:0 none;border-top:0 none}.ui-jqgrid-errorbar{max-height:100px;margin-bottom:0;overflow:auto}.ui-jqgrid .ui-jqgrid-caption,.ui-jqgrid .ui-jqgrid-errorbar-ltr{text-align:left}.ui-jqgrid .ui-jqgrid-caption-rtl,.ui-jqgrid .ui-jqgrid-errorbar-rtl{text-align:right}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close{vertical-align:middle;text-align:center;text-decoration:none;position:absolute;top:50%;width:1.4em;line-height:1.5em;font-size:12px;margin:-.7em 0 0 0;padding:.2em;border:1px solid transparent;height:1.4em;cursor:pointer;-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;-ms-touch-action:manipulation;touch-action:manipulation;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.ui-jqgrid-jquery-ui .ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close{margin:-8px 0 0 0}.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-titlebar-close{right:.1em}.ui-jqgrid .ui-jqgrid-caption-rtl .ui-jqgrid-titlebar-close{left:.1em}.ui-jqdialog .ui-jqdialog-titlebar-ltr .ui-jqdialog-titlebar-close{right:.3em}.ui-jqdialog .ui-jqdialog-titlebar-rtl .ui-jqdialog-titlebar-close{left:.3em}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close{-ms-border-radius:.5em;border-radius:.5em}.ui-jqdialog .ui-jqdialog-titlebar-ltr .ui-jqdialog-title,.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-title,.ui-jqgrid .ui-jqgrid-errorbar-ltr .ui-jqgrid-error{position:relative;left:.1em}.ui-jqdialog .ui-jqdialog-titlebar-rtl .ui-jqdialog-title,.ui-jqgrid .ui-jqgrid-caption-rtl .ui-jqgrid-title,.ui-jqgrid .ui-jqgrid-errorbar-rtl .ui-jqgrid-error{position:relative;right:.1em}.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span{margin-top:0;margin-left:0}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close span,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span{display:block}.ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close span.ui-icon,.ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close span.ui-icon{position:relative;top:-2px}.ui-jqdialog-titlebar-ltr .ui-jqdialog-titlebar-close span.ui-icon,.ui-jqgrid .ui-jqgrid-caption .ui-jqgrid-titlebar-close span.ui-icon{right:3.5px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.ui-icon{margin-top:-1px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.fa,.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{font-size:14px;margin-top:-2px}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>.svg-inline--fa{font-size:14px;display:block;margin-top:-.125em;margin-left:-.125em}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.fa{margin-left:-1px}.ui-jqdialog-titlebar-close>.svg-inline--fa{display:block;margin-left:.0625em;margin-top:-.0625em}.ui-jqgrid .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{margin-left:-2px}.ui-jqdialog-titlebar .ui-jqdialog-titlebar-close>span{margin-top:-1px}.ui-jqdialog-titlebar .ui-jqdialog-titlebar-close>span.glyphicon{margin-top:-.05em;margin-left:-.05em}.ui-jqdialog .ui-resizable-handle>.ui-icon{right:-1px;bottom:-1px}.ui-jqdialog .ui-resizable-handle>.fa{font-size:12px;right:-2px;position:relative}.ui-jqdialog .ui-resizable-handle>.svg-inline--fa{font-size:12px;right:-1px;position:relative}.ui-jqdialog .ui-resizable-handle>.glyphicon{font-size:12px;right:-1px;bottom:-2.8px}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-hdiv{position:relative;margin:0;padding:0;overflow:hidden;border-left:0 none;border-top:0 none;border-right:0 none;height:auto}.ui-jqgrid .ui-jqgrid-hbox{float:left;padding-right:20px}.ui-jqgrid .ui-jqgrid-htable{table-layout:fixed;margin:0}.ui-jqgrid .ui-jqgrid-htable th{height:auto;padding:0 2px 0 2px}.ui-jqgrid-htable>thead>.jqg-first-row-header>th{padding-top:0;padding-bottom:0;border-bottom:0 none;border-top:0 none}.ui-jqgrid .ui-jqgrid-htable th.jqgh_cbox{padding:0}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels th div{overflow:hidden;position:relative;height:auto;margin:2px 2px}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels>th.jqgh_cbox{vertical-align:middle}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels .jqgh_cbox>div{text-align:center;vertical-align:baseline;margin:0}.ui-jqgrid .ui-jqgrid-labels th.ui-th-column,.ui-jqgrid .ui-jqgrid-legacy-subgrid .ui-th-subgrid,.ui-jqgrid-labels .ui-th-column-header{overflow:hidden;white-space:nowrap;text-align:center}.ui-jqgrid-labels .ui-th-column-header{vertical-align:middle;height:auto;vertical-align:middle;border-top:0 none}.ui-jqgrid .ui-jqgrid-labels th.ui-th-column{position:relative;vertical-align:middle;border-top:0 none;border-bottom:0 none}.ui-jqgrid .ui-jqgrid-htable th.ui-th-ltr,.ui-th-ltr{border-left:0 none}.ui-jqgrid .ui-jqgrid-htable th.ui-th-rtl,.ui-th-rtl{border-right:0 none}.ui-first-th-ltr{border-right:1px solid}.ui-first-th-rtl{border-left:1px solid}.ui-jqgrid .ui-th-div-ie{white-space:nowrap;zoom:1;height:17px}.ui-jqgrid .ui-th-column>.jqgh_cbox{margin:3px 0}.ui-jqgrid .ui-th-column .cbox{margin:.1em;cursor:pointer;text-align:center;vertical-align:middle}.ui-jqgrid.ui-jqgrid-bootstrap .ui-th-column .cbox{height:18px;width:18px}.ui-jqgrid .ui-th-column .ui-th-div-ie>.cbox{margin-left:-1px;margin-right:-1px}.ui-jqgrid .ui-jqgrid-labels>.ui-th-column>.ui-jqgrid-resize{top:0;height:100%;width:.3em;position:absolute;cursor:col-resize;-webkit-touch-callout:none;-ms-user-select:none;-moz-user-select:-moz-none;-webkit-user-select:none;user-select:none;display:inline;overflow:hidden}.ui-jqgrid .ui-jqgrid-htable .ui-jqgrid-labels th div.ui-jqgrid-rotate{-webkit-transform:translateX(-50%) translateY(0) rotate(-90deg);-moz-transform:translateX(-50%) translateY(0) (-90deg);-o-transform:translateX(-50%) translateY(0) rotate(-90deg);-ms-transform:translateX(-50%) translateY(0) rotate(-90deg);transform:translateX(-50%) translateY(0) rotate(-90deg);transform-origin:center center;margin:0;left:50%}.ui-jqgrid .ui-grid-ico-sort{overflow:hidden;position:absolute;display:inline}.ui-grid-ico-sort{cursor:pointer}.ui-state-disabled.ui-grid-ico-sort{cursor:pointer!important}.ui-jqgrid .s-ico{position:relative;width:.87em;height:1.125em;display:inline-block;vertical-align:middle;margin:0 .1em}.ui-jqgrid .s-ico>.ui-grid-ico-sort{display:block;position:relative}.ui-jqgrid .s-ico>.ui-grid-ico-sort.ui-icon{width:12px;margin-top:0}.ui-jqgrid .s-ico>.ui-icon-asc.ui-icon{top:-6px}.ui-jqgrid .s-ico>.ui-icon-desc.ui-icon{top:-16px}.ui-jqgrid .s-ico>.ui-icon-triangle-1-s{background-position:-65px -16px}.ui-jqgrid .s-ico>.ui-icon.ui-sort-ltr{margin-left:-3px}.ui-jqgrid .s-ico>.ui-icon.ui-sort-rtl{margin-right:0}.ui-jqgrid-sortable>.ui-jqgrid-sort-order{position:relative;left:-.1em;top:0;font-size:75%;vertical-align:super}.ui-jqgrid .ui-th-column>div{cursor:default}.ui-jqgrid .ui-th-column>div.ui-jqgrid-sortable{cursor:pointer}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar{border-top-width:1px;border-top-style:solid}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar .ui-th-column{border-top-width:1px;border-top-style:solid}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar input{margin:1px 0 0 0}.ui-jqgrid .ui-jqgrid-hdiv .ui-search-toolbar select{margin:1px 0 0 0}.ui-jqgrid .ui-jqgrid-bdiv{min-height:1px;position:relative;margin:0;padding:0;overflow:auto;text-align:left}.ui-jqgrid .ui-jqgrid-btable{table-layout:fixed;margin:0;outline-style:none;height:1px}.ui-jqgrid tr.jqgroup,.ui-jqgrid tr.jqgrow{outline-style:none}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td,.ui-jqgrid tr.ui-subgrid>td,.ui-jqgrid tr.ui-subtblcell>td{overflow:hidden;white-space:pre;vertical-align:middle;text-align:center;height:22px;border-top:0 none;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqfoot>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgroup>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgrow>td,.ui-jqgrid-jquery-ui.ui-jqgrid tr.ui-subgrid>td{border-bottom-color:inherit}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td{padding:0 2px 0 2px}.ui-jqgrid tr.ui-subgrid>td{padding:0}.ui-jqgrid tr.jqgfirstrow>td{padding:0 2px 0 2px;border-top:0 none;border-left:0 none;height:0;border-right-width:1px;border-right-style:solid;border-bottom:0 none}.ui-jqgrid-jquery-ui.ui-jqgrid tr.jqgfirstrow>td{border-right-color:inherit}.ui-jqgrid tr.jqgfirstrow>td.td_cbox{padding:0}.ui-jqgrid tr.jqfoot>td,.ui-jqgrid tr.jqgroup>td,.ui-jqgrid tr.jqgrow>td{font-weight:400}.ui-jqgrid tr.jqfoot>td{font-weight:700}.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-ltr>td{text-align:left;border-left-width:0;border-left-style:none;border-right-width:1px;border-right-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-ltr>td{border-color:inherit}.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-rtl>td{text-align:right;border-right-width:0;border-right-style:none;border-left-width:1px;border-left-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-bdiv tr.ui-row-rtl>td{border-color:inherit}.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{padding:0 2px 0 2px;margin:0;border-width:0;border-style:none}.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-jqgrid-btable td.jqgrid-rownum{border-bottom-color:inherit}.ui-jqgrid .jqgrow>td.td_cbox{padding:0;text-align:center;vertical-align:middle}.ui-jqgrid .jqgrow>td.ui-sgcollapsed{text-align:center;vertical-align:middle}.ui-jqgrid tr.jqgrow>td.td_cbox{padding:0}.ui-jqgrid .jqgrow>td>.cbox{height:14px;width:14px;cursor:pointer;text-align:center;vertical-align:middle}.ui-jqgrid>.ui-jqgrid-resize-mark,body>.ui-jqgrid-resize-mark{width:0;left:0;cursor:col-resize;-webkit-touch-callout:none;-ms-user-select:none;-moz-user-select:-moz-none;-webkit-user-select:none;user-select:none;position:absolute;top:0;overflow:hidden;display:none;border-left-width:1px;border-right-width:1px;z-index:99999}span.ui-jqgrid-cell-wrapper{margin:0!important;padding:0!important}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-sdiv{position:relative;margin:0;padding:0;overflow:hidden;border-left:0 none;border-top:0 none;border-right:0 none}.ui-jqgrid .ui-jqgrid-ftable{table-layout:fixed;margin-bottom:0}.ui-jqgrid tr.footrow td{font-weight:700;overflow:hidden;white-space:nowrap;height:21px;padding:0 2px 0 2px;border-top-width:1px;border-top-style:solid;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow td{border-top-color:inherit;border-bottom-color:inherit}.ui-jqgrid tr.footrow-ltr td{text-align:left;border-left-width:0;border-left-style:none;border-right-width:1px;border-right-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow-ltr td{border-color:inherit}.ui-jqgrid tr.footrow-rtl td{text-align:right;border-left-width:1px;border-left-style:solid;border-right-width:0;border-right-style:none}.ui-jqgrid-jquery-ui.ui-jqgrid tr.footrow-rtl td{border-color:inherit}.ui-jqgrid>.ui-jqgrid-pager{border:0 none;margin:0;padding:0;position:relative;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box;height:auto;min-height:22px;overflow:hidden;font-size:11px}.ui-jqgrid>.ui-jqgrid-pager *,.ui-jqgrid>.ui-jqgrid-pager :after,.ui-jqgrid>.ui-jqgrid-pager :before{-webkit-box-sizing:inherit;-moz-box-sizing:inherit;box-sizing:inherit}.ui-jqgrid .ui-jqgrid-pager .ui-pager-control,.ui-jqgrid .ui-jqgrid-toppager .ui-pager-control{position:relative;border-left:0;border-bottom:0;border-top:0}.ui-pager-control .ui-jqgrid-pg-left{text-align:left}.ui-pager-control .ui-jqgrid-pg-center{text-align:center;white-space:pre}.ui-pager-control .ui-jqgrid-pg-right{text-align:right}.ui-jqgrid .ui-pg-table{position:relative;padding:0;width:auto;margin:0}.jqgrow .ui-jqgrid-actions{background:inherit;border-style:none}.ui-jqgrid .ui-pg-button:not(.ui-state-hover),.ui-jqgrid-jquery-ui .jqgrow .ui-jqgrid-actions .ui-pg-div:not(.ui-state-hover){border:1px solid transparent}.ui-pager-control .ui-pg-table{border-color:inherit}.jqgrow .ui-jqgrid-actions .ui-pg-div.ui-state-hover,.jqgrow .ui-jqgrid-actions .ui-pg-div:focus,.jqgrow .ui-jqgrid-actions .ui-pg-div:hover,.ui-jqgrid .ui-pg-button.ui-state-hover,.ui-jqgrid .ui-pg-button:focus,.ui-jqgrid .ui-pg-button:hover{border-style:solid;border-color:inherit}.ui-jqgrid .ui-pg-table td{font-weight:400;vertical-align:middle;padding:1px}.ui-jqgrid .ui-pager-control .ui-pg-button{display:inline-block;height:auto}.ui-jqgrid .ui-pg-button span{display:block;margin:1px;float:left}.ui-jqgrid .ui-pg-table .ui-pg-input,.ui-jqgrid .ui-pg-table .ui-pg-selbox{height:auto;width:auto;margin:0;line-height:inherit}select.form-control.ui-pg-selbox:not([size]):not([multiple]){height:auto}.ui-jqgrid .ui-pg-table .ui-pg-selbox{display:block;padding:1px}.ui-jqgrid .ui-separator{height:12px;border-left:1px solid #ccc;border-right:1px solid #ccc;margin:-1px;float:right}.ui-jqgrid .ui-paging-info{font-weight:400;height:auto;margin:0 .2em 0 .2em;display:inline}.ui-jqgrid .ui-jqgrid-pager .ui-pg-div{padding:1px 0;float:left;position:relative}.ui-jqgrid .ui-jqgrid-pager .ui-pg-button{cursor:pointer}.ui-jqgrid .ui-jqgrid-pager .ui-pg-div span.ui-icon{float:left;margin:0 2px}.ui-jqgrid td input,.ui-jqgrid td select,.ui-jqgrid td textarea{margin:0}.ui-jqgrid td textarea{width:auto;height:auto}.ui-jqgrid>.ui-jqgrid-view>.ui-jqgrid-toppager{border-left:0 none;border-right:0 none;border-top:0 none;margin:0;padding:0;position:relative;height:auto;min-height:22px;overflow:hidden}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-div{padding:1px 0;float:left;position:relative}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-button{cursor:pointer}.ui-jqgrid .ui-jqgrid-toppager .ui-pg-div span.ui-icon{float:left;margin:0 2px}.ui-jqgrid .ui-pg-table .ui-pg-button{margin:2px;vertical-align:middle}.ui-jqgrid .navtable .ui-pg-div span.ui-pg-button-text{padding-left:.2em;padding-right:.2em}.ui-pg-button.ui-state-hover>.ui-pg-div>.ui-pg-button-text,.ui-pg-button:hover>.ui-pg-div>.ui-pg-button-text{font-weight:400}.ui-jqgrid .ui-pg-div{text-align:center;vertical-align:middle;display:inline-block}.ui-jqgrid .navtable .ui-pg-div>span.ui-pg-button-icon-over-text{margin-left:auto;margin-right:auto;float:none}.subgrid-data>.tablediv>.ui-jqgrid{-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}.subgrid-data>.tablediv>.ui-jqgrid>.ui-jqgrid-view{-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}.ui-jqgrid .ui-jqgrid-btable .jqgrow>.ui-sgcollapsed{text-align:center;vertical-align:middle}.ui-jqgrid .ui-jqgrid-btable .ui-sgcollapsed span{display:inline-block}.ui-jqgrid .ui-subgrid{margin:0;padding:0;width:100%}.sgbutton{cursor:pointer}.ui-jqgrid .ui-subgrid table{table-layout:fixed}.ui-jqgrid .ui-subgrid tr.ui-subtblcell td{height:18px;border-top:0 none;border-bottom-width:1px;border-bottom-style:solid}.ui-jqgrid-jquery-ui.ui-jqgrid .ui-subgrid tr.ui-subtblcell td{border-bottom-color:inherit}.ui-jqgrid .ui-th-subgrid{height:20px}.ui-jqgrid .ui-row-ltr.ui-subgrid>.subgrid-cell>span{float:right}.ui-jqgrid .ui-row-rtl.ui-subgrid>.subgrid-cell>span{float:left}.ui-jqgrid>.loading{position:absolute;top:45%;left:45%;width:auto;z-index:101;padding:6px;margin:5px;text-align:center;font-weight:700;display:none;border-width:2px;font-size:11px}.ui-jqgrid .jqgrid-overlay{display:none;z-index:100}* .jqgrid-overlay iframe{position:absolute;top:0;left:0;z-index:-1}.ui-jqgrid>.ui-jqgrid-view>.ui-userdata{border-left:0 none;border-right:0 none;height:21px;overflow:hidden}.ui-jqgrid .ui-jqdialog{font-size:11px}.ui-jqdialog{display:none;width:300px;position:absolute;font-size:11px;overflow:visible}.ui-jqdialog.ui-jqgrid-jquery-ui{padding:.2em}.ui-jqgrid-bootstrap.modal{right:auto;left:auto}.ui-jqgrid-bootstrap.modal>.modal-dialog{max-width:none}.ui-jqdialog .ui-jqdialog-content,.ui-jqdialog-content{border:0;padding:.3em .2em;background:0 0;height:auto}.ui-jqdialog .ui-jqconfirm{padding:.4em 1em;border-width:3px;position:absolute;bottom:10px;right:10px;overflow:visible;display:none;height:80px;width:220px;text-align:center}.ui-jqdialog>.ui-resizable-se,.ui-jqgrid>.ui-resizable-se{bottom:-3px;right:-3px}.ui-jqdialog-content .FormGrid{margin:0}.ui-jqdialog-content .EditTable{width:100%;margin-bottom:0}.ui-jqdialog-content .DelTable{width:100%;margin-bottom:0}.EditTable td input,.EditTable td select,.EditTable td textarea{margin:0}.EditTable td textarea{width:auto;height:auto}.ui-jqdialog-content td.EditButton{border-top:0 none;border-left:0 none;border-right:0 none;padding:5px 0}.ui-jqdialog-content td.EditButton-ltr{text-align:right}.ui-jqdialog-content td.EditButton-rtl{text-align:left}.ui-jqdialog-content td.navButton{text-align:left;border-left:0 none;border-top:0 none;border-right:0 none;padding:5px 0}.ui-jqdialog-content td.navButton-ltr{text-align:left}.ui-jqdialog-content td.navButton-ltr>.fm-button{float:left}.ui-jqdialog-content td.navButton-rtl{text-align:right}.ui-jqdialog-content td.navButton-rtl>.fm-button{float:right}.ui-jqdialog-content .FormElement{width:100%;box-sizing:border-box}.ui-jqdialog-content input.FormElement,.ui-jqdialog-content select.FormElement{padding:.3em}.ui-jqdialog-content .data-line{padding-top:.1em;border:0 none}.ui-jqdialog-content .CaptionTD{vertical-align:middle;border:0 none;padding:2px;white-space:nowrap}.ui-jqdialog-content .DataTD{padding:2px;border-width:0;border-style:none;vertical-align:top}.ui-jqgrid-jquery-ui.ui-jqdialog .form-view-data>span{border-width:1px;border-style:solid;border-color:inherit;border-radius:3px;display:block;padding:.2em}.ui-jqgrid-jquery-ui.ui-jqdialog .form-view-label>label{font-weight:700}.ui-jqgrid-bootstrap.ui-jqdialog .ui-jqdialog-content .form-view-data>span{height:100%;width:auto}.ui-jqdialog .fm-button{display:inline-block;padding:.4em .5em;text-decoration:none;cursor:pointer;position:relative;text-align:center;zoom:1}.ui-jqdialog.ui-jqgrid-bootstrap .navButton .fm-button{padding:.375em .75em;margin-left:.125em}.ui-jqdialog .fm-button>span{display:inline-block;vertical-align:middle}.ui-jqdialog .fm-button .fm-button-text{padding:0 .2em}.ui-jqdialog .EditButton-ltr .fm-button-icon-left .fm-button-icon{margin-right:.2em}.ui-jqdialog .EditButton-ltr .fm-button-icon-right .fm-button-icon{margin-left:.2em}.ui-jqdialog .EditButton-rtl .fm-button-icon-right .fm-button-icon{margin-right:.2em}.ui-jqdialog .EditButton-rtl .fm-button-icon-left .fm-button-icon{margin-left:.2em}.delmsg{padding:.5em}.ui-jqgrid .selected-row,.ui-jqgrid .selected-row td{font-style:normal;border-left:0 none}.ui-jqgrid .jqgrow .ui-jqgrid-actions{display:inline-block;vertical-align:middle;margin:0}.jqgrow .ui-jqgrid-actions .ui-pg-div{cursor:pointer;float:left;margin:0 1px}.ui-jqgrid .tree-wrap{display:inline-block;vertical-align:middle;white-space:nowrap;overflow:hidden}.ui-jqgrid .treeclick{cursor:pointer;display:inline-block;vertical-align:middle;width:18px;overflow:hidden}.ui-jqgrid .ui-jqgrid-bdiv .jqgroup .tree-wrap{text-align:center;padding-left:.1em}.ui-jqgrid .ui-jqgrid-bdiv .jqgroup .tree-wrap.glyphicon{margin-top:-.18em}* iframe.jqm{position:absolute;top:0;left:0;z-index:-1}.ui-jqgrid-dnd tr td{border-right-width:1px;border-right-color:inherit;border-right-style:solid;height:20px}.ui-jqgrid .ui-jqgrid-caption-rtl{text-align:right}.ui-jqgrid .ui-jqgrid-hbox-rtl{float:right;padding-left:20px}.ui-jqgrid .ui-jqgrid-resize-ltr{right:0;margin:0}.ui-jqgrid .ui-jqgrid-resize-rtl{left:0;margin:0}.ui-jqgrid .ui-sort-rtl{left:0}.ui-jqgrid .cell-wrapper,.ui-jqgrid .cell-wrapperleaf{display:inline-block;vertical-align:middle}.ui-jqgrid .ui-ellipsis{-moz-text-overflow:ellipsis;text-overflow:ellipsis}.ui-search-menu{position:absolute;padding:.2em}.ui-search-menu.ui-menu .ui-jqgrid-menu-item{list-style-image:none;padding-right:0;padding-left:0}.ui-search-menu.ui-menu .ui-jqgrid-menu-item a{text-decoration:none;display:block}.ui-search-toolbar>.ui-th-column>div{position:relative;height:auto;overflow:hidden}.ui-search-toolbar .ui-search-table{padding:0;border:0 none;height:20px;width:100%}.table-hover .ui-search-table tbody tr:hover{background-color:inherit}.ui-jqgrid .ui-jqgrid-htable .ui-search-toolbar th{padding:0 .1em}.ui-search-toolbar .ui-search-table .ui-search-oper{width:20px;text-align:center}.ui-search-toolbar .ui-th-column .ui-search-table .ui-search-input{padding:0 .1em}.ui-search-input input[type=text]{width:100%}a.clearsearchclass,a.g-menu-item,a.soptclass{text-decoration:none;cursor:pointer}.ui-search-menu .ui-jqgrid-menu-item .g-menu-item{padding:.2em}.ui-menu-jqueryui .ui-jqgrid-menu-item .g-menu-item:not(.ui-state-hover){border:1px solid transparent}.ui-menu-jqueryui .ui-jqgrid-menu-item .g-menu-item:hover{font-weight:400}.ui-search-oper{padding:0}.ui-search-clear{text-align:center;padding:0}.ui-search-clear .clearsearchclass,.ui-search-oper .soptclass{padding:.1em;line-height:1em}.ui-jqgrid-jquery-ui .ui-search-clear .clearsearchclass:not(.ui-state-hover),.ui-jqgrid-jquery-ui .ui-search-oper .soptclass:not(.ui-state-hover){border:1px solid transparent}.ui-search-clear .clearsearchclass span{position:relative}.ui-search-input{text-align:center}.ui-jqgrid .ui-search-table .ui-search-input>input[type=text],.ui-jqgrid .ui-search-table .ui-search-input>select{display:block;-moz-box-sizing:border-box;-webkit-box-sizing:border-box;box-sizing:border-box}.ui-jqgrid>.ui-jqgrid-view button,.ui-jqgrid>.ui-jqgrid-view input,.ui-jqgrid>.ui-jqgrid-view select,.ui-jqgrid>.ui-jqgrid-view textarea{font-size:inherit;text-align:inherit}.ui-jqgrid .s-ico>.ui-grid-ico-sort.glyphicon{font-size:10px}.ui-jqgrid .s-ico>.ui-icon-asc.glyphicon{margin-top:-.23em}.ui-jqgrid .s-ico>.ui-icon-desc.glyphicon{margin-top:-.34em}.ui-jqgrid .s-ico>.ui-grid-ico-sort.fa{width:.63em}.ui-jqgrid .s-ico>.ui-icon-asc.fa{line-height:.81em;top:.07em}.ui-jqgrid .s-ico>.ui-icon-desc.fa{line-height:.81em;top:-.81em}.ui-jqgrid .s-ico>.ui-icon-asc.fa.ui-sort-ltr,.ui-jqgrid .s-ico>.ui-icon-desc.fa.ui-sort-ltr{left:0}.ui-jqgrid .s-ico>.ui-icon-asc.fa.ui-sort-rtl,.ui-jqgrid .s-ico>.ui-icon-desc.fa.ui-sort-rtl{right:0}.ui-jqgrid .s-ico>.ui-state-disabled.fa{padding:0}.ui-jqgrid .s-ico>.svg-inline--fa.fa-sort-down{margin-top:-1.05em}.jqgrow .ui-pg-div>span.fa{font-weight:400;font-size:12px;vertical-align:baseline;background:0 0;border:0 none}.ui-subgrid>.subgrid-cell span.fa{font-weight:400;font-size:12px;text-indent:0;background:0 0;border:0 none;margin-bottom:4px}.jqgrow>.ui-sgcollapsed span.fa{font-weight:400;font-size:12px;text-indent:0;background:0 0;border:0 none;margin:0}.ui-jqgrid .ui-resizable-se.fa{-webkit-filter:alpha(opacity=40);-moz-filter:alpha(opacity=40);-o-filter:alpha(opacity=40);-ms-opacity:.4;opacity:.4;background:0 0;border-style:none;right:-3px;font-weight:400}.ui-jqgrid-ltr .ui-resizable-se.fa{right:-3px;bottom:0}.ui-jqgrid-rtl .ui-resizable-se.fa{left:0;bottom:1px}.jqContextMenu .ui-menu .ui-jqgrid-menu-item a.ui-state-hover{font-weight:400;margin:-1px}.jqContextMenu .ui-menu .ui-jqgrid-menu-item.ui-state-hover{font-weight:400;margin:-1px}.jqContextMenu .ui-menu-icons>.ui-jqgrid-menu-item{font-size:11px}.ui-jqgrid-showHideColumnMenu .ui-jqgrid-menu-item:hover{font-weight:400}.ui-jqgrid-disablePointerEvents{pointer-events:none}.ui-jqgrid.ui-jqgrid-bootstrap{border:1px solid #ddd;-ms-border-radius:6px;border-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-jqgrid-toppager{border-bottom-left-radius:0;border-bottom-right-radius:0}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-userdata{background-color:#f0f0f0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-hdiv,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-legacy-subgrid>thead{background-color:#e5e5e5}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view>.ui-jqgrid-sdiv td{background-color:#f9f9f9}.ui-jqdialog.ui-jqgrid-bootstrap>.modal-dialog{margin-top:0}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar .ui-jqdialog-title,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-errorbar .ui-jqgrid-error,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-titlebar .ui-jqgrid-title{font-size:16px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager .btn,.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view .btn{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager .fa,.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-view .fa{font-size:14px}.ui-jqdialog.ui-jqgrid-bootstrap{font-size:14px}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content .CaptionTD{padding:.5em}.ui-jqgrid.ui-jqgrid-bootstrap .frozen-bdiv.ui-jqgrid-bdiv .ui-jqgrid-btable{background-color:#fff}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqfoot>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgroup>td,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow>td{padding:.2em .3em}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td{padding:0 .3em}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgfirstrow>td.td_cbox,.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow>td.td_cbox{padding:0}.ui-jqgrid.ui-jqgrid-bootstrap .jqgrow>td>.cbox{height:18px;width:18px;display:inline-block;vertical-align:middle;text-align:center}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-btable td.jqgrid-rownum{padding:.2em .3em}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar,.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-caption{background-color:#cacaca;-ms-border-top-left-radius:6px;border-top-left-radius:6px;-ms-border-top-right-radius:6px;border-top-right-radius:6px}.modal-backdrop.jqgrid-overlay{-ms-opacity:.35;opacity:.35;-webkit-filter:Alpha(Opacity=35);-moz-filter:Alpha(Opacity=35);-o-filter:Alpha(Opacity=35);filter:Alpha(Opacity=35)}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content{border:0;padding:.3em .2em;background:#fff;height:auto}.ui-jqdialog.ui-jqgrid-bootstrap .modal-dialog{width:auto}.ui-jqdialog.ui-widget{overflow:hidden}.ui-jqdialog .ui-resizable-handle{cursor:se-resize;position:absolute;-ms-touch-action:none;touch-action:none}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content{overflow:hidden}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content>.ui-resizable-handle.fa{bottom:1px;right:1px;height:12px;width:12px}.ui-jqdialog.ui-jqgrid-bootstrap .modal-content>.ui-resizable-handle.glyphicon{right:-.4em}.ui-jqgrid.ui-jqgrid-bootstrap .disabled{opacity:.35;filter:Alpha(Opacity=35)}.ui-jqgrid-bootstrap.ui-jqgrid-resize-mark{border:1px solid #aaa;background-color:#ccc;color:#222;font-weight:700}.ui-jqgrid .jqgfirstrow{border-bottom:0 none;border-top:0 none;height:0}.ui-jqgrid.ui-jqgrid-bootstrap .jqgfirstrow td{border-bottom:0 none;border-top:0 none}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pg-table .ui-pg-button.ui-state-disabled:hover{margin:0}.ui-jqgrid.ui-jqgrid-bootstrap .navtable .ui-pg-button.ui-state-disabled:hover{margin:0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pg-table .ui-pg-button{margin:.2em 0;padding:.2em 0;border-radius:.4em}.ui-search-input .form-control:not([size]):not([multiple]){height:auto;min-height:18px}.ui-search-input input[type=text]{padding:0}.ui-search-input input[type=text].form-control{padding:0 .3em}.ui-search-input select.form-control{padding:0}.ui-search-input input[type=checkbox].form-control{width:auto;margin-left:auto;margin-right:auto;border-radius:0;background:0 transparent}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn{padding:0;margin:0;box-shadow:none}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn:not(:first-child){margin-left:.125em}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-actions .ui-pg-div.btn.ui-inline-save{margin-left:0}.ui-jqgrid.ui-jqgrid-bootstrap tr.jqgrow .sgbutton-div .sgbutton.btn{padding:0;cursor:pointer;border:1px solid transparent;margin:-.3em -.3em}.ui-jqgrid.ui-jqgrid-bootstrap .sgbutton-div .sgbutton.btn:focus,.ui-jqgrid.ui-jqgrid-bootstrap .sgbutton-div .sgbutton.btn:hover{border:1px solid #333}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-content{border-top-left-radius:0;border-top-right-radius:0}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pager-control .ui-pg-input{display:inline-block;font-size:12px;padding:.3em}.ui-jqgrid.ui-jqgrid-bootstrap>.ui-jqgrid-pager{font-size:12px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-bootstrap-corner-top{border-top-left-radius:6px;border-top-right-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-bootstrap-corner-bottom{border-bottom-left-radius:6px;border-bottom-right-radius:6px}.ui-jqgrid.ui-jqgrid-bootstrap .ui-pager-control .ui-pg-selbox{font-size:12px;padding:0}.ui-jqdialog.ui-jqgrid-bootstrap .FormData .CaptionTD{font-size:14px}.FormData .DataTD{vertical-align:middle}.FormData .DataTD input[type=checkbox]{width:auto;vertical-align:middle}.ui-jqdialog.ui-jqgrid-bootstrap .FormData .DataTD input.form-control[type=checkbox]{width:2.193em;height:2.193em}.DelTable .delmsg{padding:.2em}.queryresult{margin-bottom:.5em;padding:.25em}.group.modal-content tr td{padding:.2em .1em}.searchFilter .form-control{padding:.1em}.searchFilter .form-control:not([size]):not([multiple]){height:2em}.searchFilter .btn{margin-left:.125em;padding:.2em .375em}.ui-jqgrid .searchFilter table.group td{padding:1px}.ui-jqgrid .searchFilter table{border-spacing:2px}.ui-jqdialog.ui-jqgrid-bootstrap .modal-header .close{margin-top:-.7em}.ui-jqdialog .glyphicon,.ui-jqgrid .glyphicon{font-size:12px;top:auto}.ui-jqdialog.ui-jqgrid-bootstrap .glyphicon,.ui-jqgrid.ui-jqgrid-bootstrap .glyphicon{font-size:14px;top:auto;height:1em;width:1.28em}.ui-jqgrid .ui-pg-button span.glyphicon{display:inline-block;text-align:center;vertical-align:middle}.ui-jqgrid-actions .glyphicon{padding:.1em}.ui-jqgrid.ui-jqgrid-bootstrap .ui-jqgrid-titlebar>.ui-jqgrid-titlebar-close>span.glyphicon{margin-top:-.125em;margin-left:-.275em}.ui-jqdialog.ui-jqgrid-bootstrap .ui-jqdialog-titlebar>.ui-jqdialog-titlebar-close>span.glyphicon{margin-top:-.1em;margin-left:-.28em}.tree-wrap>.treeclick{line-height:1}.tree-wrap>.treeclick.glyphicon{margin-top:-.2em;font-size:12px}.subgrid-data .ui-jqgrid-bootstrap .ui-jqgrid-bdiv .ui-jqgrid-btable,.subgrid-data .ui-jqgrid-bootstrap .ui-jqgrid-hdiv .ui-jqgrid-htable{background-color:transparent}.subgrid-data .ui-jqgrid-legacy-subgrid{margin:0}
/*# sourceMappingURL=ui.jqgrid.min.css.map */

/*! jQuery UI - v1.12.1 - 2016-09-14
* http://jqueryui.com
* Includes: core.css, accordion.css, autocomplete.css, menu.css, button.css, controlgroup.css, checkboxradio.css, datepicker.css, dialog.css, draggable.css, resizable.css, progressbar.css, selectable.css, selectmenu.css, slider.css, sortable.css, spinner.css, tabs.css, tooltip.css, theme.css
* To view and modify this theme, visit http://jqueryui.com/themeroller/?ffDefault=Arial%2CHelvetica%2Csans-serif&fsDefault=1em&fwDefault=normal&cornerRadius=3px&bgColorHeader=e9e9e9&bgTextureHeader=flat&borderColorHeader=dddddd&fcHeader=333333&iconColorHeader=444444&bgColorContent=ffffff&bgTextureContent=flat&borderColorContent=dddddd&fcContent=333333&iconColorContent=444444&bgColorDefault=f6f6f6&bgTextureDefault=flat&borderColorDefault=c5c5c5&fcDefault=454545&iconColorDefault=777777&bgColorHover=ededed&bgTextureHover=flat&borderColorHover=cccccc&fcHover=2b2b2b&iconColorHover=555555&bgColorActive=007fff&bgTextureActive=flat&borderColorActive=003eff&fcActive=ffffff&iconColorActive=ffffff&bgColorHighlight=fffa90&bgTextureHighlight=flat&borderColorHighlight=dad55e&fcHighlight=777620&iconColorHighlight=777620&bgColorError=fddfdf&bgTextureError=flat&borderColorError=f1a899&fcError=5f3f3f&iconColorError=cc0000&bgColorOverlay=aaaaaa&bgTextureOverlay=flat&bgImgOpacityOverlay=0&opacityOverlay=30&bgColorShadow=666666&bgTextureShadow=flat&bgImgOpacityShadow=0&opacityShadow=30&thicknessShadow=5px&offsetTopShadow=0px&offsetLeftShadow=0px&cornerRadiusShadow=8px
* Copyright jQuery Foundation and other contributors; Licensed MIT */

/* Layout helpers
----------------------------------*/
.ui-helper-hidden {
	display: none;
}
.ui-helper-hidden-accessible {
	border: 0;
	clip: rect(0 0 0 0);
	height: 1px;
	margin: -1px;
	overflow: hidden;
	padding: 0;
	position: absolute;
	width: 1px;
}
.ui-helper-reset {
	margin: 0;
	padding: 0;
	border: 0;
	outline: 0;
	line-height: 1.3;
	text-decoration: none;
	font-size: 100%;
	list-style: none;
}
.ui-helper-clearfix:before,
.ui-helper-clearfix:after {
	content: "";
	display: table;
	border-collapse: collapse;
}
.ui-helper-clearfix:after {
	clear: both;
}
.ui-helper-zfix {
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	position: absolute;
	opacity: 0;
	filter:Alpha(Opacity=0); /* support: IE8 */
}

.ui-front {
	z-index: 100;
}


/* Interaction Cues
----------------------------------*/
.ui-state-disabled {
	cursor: default !important;
	pointer-events: none;
}


/* Icons
----------------------------------*/
.ui-icon {
	display: inline-block;
	vertical-align: middle;
	margin-top: -.25em;
	position: relative;
	text-indent: -99999px;
	overflow: hidden;
	background-repeat: no-repeat;
}

.ui-widget-icon-block {
	left: 50%;
	margin-left: -8px;
	display: block;
}

/* Misc visuals
----------------------------------*/

/* Overlays */
.ui-widget-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}
.ui-accordion .ui-accordion-header {
	display: block;
	cursor: pointer;
	position: relative;
	margin: 2px 0 0 0;
	padding: .5em .5em .5em .7em;
	font-size: 100%;
}
.ui-accordion .ui-accordion-content {
	padding: 1em 2.2em;
	border-top: 0;
	overflow: auto;
}
.ui-autocomplete {
	position: absolute;
	top: 0;
	left: 0;
	cursor: default;
}
.ui-menu {
	list-style: none;
	padding: 0;
	margin: 0;
	display: block;
	outline: 0;
}
.ui-menu .ui-menu {
	position: absolute;
}
.ui-menu .ui-menu-item {
	margin: 0;
	cursor: pointer;
	/* support: IE10, see #8844 */
	list-style-image: url("data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7");
}
.ui-menu .ui-menu-item-wrapper {
	position: relative;
	padding: 3px 1em 3px .4em;
}
.ui-menu .ui-menu-divider {
	margin: 5px 0;
	height: 0;
	font-size: 0;
	line-height: 0;
	border-width: 1px 0 0 0;
}
.ui-menu .ui-state-focus,
.ui-menu .ui-state-active {
	margin: -1px;
}

/* icon support */
.ui-menu-icons {
	position: relative;
}
.ui-menu-icons .ui-menu-item-wrapper {
	padding-left: 2em;
}

/* left-aligned */
.ui-menu .ui-icon {
	position: absolute;
	top: 0;
	bottom: 0;
	left: .2em;
	margin: auto 0;
}

/* right-aligned */
.ui-menu .ui-menu-icon {
	left: auto;
	right: 0;
}
.ui-button {
	padding: .4em 1em;
	display: inline-block;
	position: relative;
	line-height: normal;
	margin-right: .1em;
	cursor: pointer;
	vertical-align: middle;
	text-align: center;
	-webkit-user-select: none;
	-moz-user-select: none;
	-ms-user-select: none;
	user-select: none;

	/* Support: IE <= 11 */
	overflow: visible;
}

.ui-button,
.ui-button:link,
.ui-button:visited,
.ui-button:hover,
.ui-button:active {
	text-decoration: none;
}

/* to make room for the icon, a width needs to be set here */
.ui-button-icon-only {
	width: 2em;
	box-sizing: border-box;
	text-indent: -9999px;
	white-space: nowrap;
}

/* no icon support for input elements */
input.ui-button.ui-button-icon-only {
	text-indent: 0;
}

/* button icon element(s) */
.ui-button-icon-only .ui-icon {
	position: absolute;
	top: 50%;
	left: 50%;
	margin-top: -8px;
	margin-left: -8px;
}

.ui-button.ui-icon-notext .ui-icon {
	padding: 0;
	width: 2.1em;
	height: 2.1em;
	text-indent: -9999px;
	white-space: nowrap;

}

input.ui-button.ui-icon-notext .ui-icon {
	width: auto;
	height: auto;
	text-indent: 0;
	white-space: normal;
	padding: .4em 1em;
}

/* workarounds */
/* Support: Firefox 5 - 40 */
input.ui-button::-moz-focus-inner,
button.ui-button::-moz-focus-inner {
	border: 0;
	padding: 0;
}
.ui-controlgroup {
	vertical-align: middle;
	display: inline-block;
}
.ui-controlgroup > .ui-controlgroup-item {
	float: left;
	margin-left: 0;
	margin-right: 0;
}
.ui-controlgroup > .ui-controlgroup-item:focus,
.ui-controlgroup > .ui-controlgroup-item.ui-visual-focus {
	z-index: 9999;
}
.ui-controlgroup-vertical > .ui-controlgroup-item {
	display: block;
	float: none;
	width: 100%;
	margin-top: 0;
	margin-bottom: 0;
	text-align: left;
}
.ui-controlgroup-vertical .ui-controlgroup-item {
	box-sizing: border-box;
}
.ui-controlgroup .ui-controlgroup-label {
	padding: .4em 1em;
}
.ui-controlgroup .ui-controlgroup-label span {
	font-size: 80%;
}
.ui-controlgroup-horizontal .ui-controlgroup-label + .ui-controlgroup-item {
	border-left: none;
}
.ui-controlgroup-vertical .ui-controlgroup-label + .ui-controlgroup-item {
	border-top: none;
}
.ui-controlgroup-horizontal .ui-controlgroup-label.ui-widget-content {
	border-right: none;
}
.ui-controlgroup-vertical .ui-controlgroup-label.ui-widget-content {
	border-bottom: none;
}

/* Spinner specific style fixes */
.ui-controlgroup-vertical .ui-spinner-input {

	/* Support: IE8 only, Android < 4.4 only */
	width: 75%;
	width: calc( 100% - 2.4em );
}
.ui-controlgroup-vertical .ui-spinner .ui-spinner-up {
	border-top-style: solid;
}

.ui-checkboxradio-label .ui-icon-background {
	box-shadow: inset 1px 1px 1px #ccc;
	border-radius: .12em;
	border: none;
}
.ui-checkboxradio-radio-label .ui-icon-background {
	width: 16px;
	height: 16px;
	border-radius: 1em;
	overflow: visible;
	border: none;
}
.ui-checkboxradio-radio-label.ui-checkboxradio-checked .ui-icon,
.ui-checkboxradio-radio-label.ui-checkboxradio-checked:hover .ui-icon {
	background-image: none;
	width: 8px;
	height: 8px;
	border-width: 4px;
	border-style: solid;
}
.ui-checkboxradio-disabled {
	pointer-events: none;
}
.ui-datepicker {
	width: 17em;
	padding: .2em .2em 0;
	display: none;
}
.ui-datepicker .ui-datepicker-header {
	position: relative;
	padding: .2em 0;
}
.ui-datepicker .ui-datepicker-prev,
.ui-datepicker .ui-datepicker-next {
	position: absolute;
	top: 2px;
	width: 1.8em;
	height: 1.8em;
}
.ui-datepicker .ui-datepicker-prev-hover,
.ui-datepicker .ui-datepicker-next-hover {
	top: 1px;
}
.ui-datepicker .ui-datepicker-prev {
	left: 2px;
}
.ui-datepicker .ui-datepicker-next {
	right: 2px;
}
.ui-datepicker .ui-datepicker-prev-hover {
	left: 1px;
}
.ui-datepicker .ui-datepicker-next-hover {
	right: 1px;
}
.ui-datepicker .ui-datepicker-prev span,
.ui-datepicker .ui-datepicker-next span {
	display: block;
	position: absolute;
	left: 50%;
	margin-left: -8px;
	top: 50%;
	margin-top: -8px;
}
.ui-datepicker .ui-datepicker-title {
	margin: 0 2.3em;
	line-height: 1.8em;
	text-align: center;
}
.ui-datepicker .ui-datepicker-title select {
	font-size: 1em;
	margin: 1px 0;
}
.ui-datepicker select.ui-datepicker-month,
.ui-datepicker select.ui-datepicker-year {
	width: 45%;
}
.ui-datepicker table {
	width: 100%;
	font-size: .9em;
	border-collapse: collapse;
	margin: 0 0 .4em;
}
.ui-datepicker th {
	padding: .7em .3em;
	text-align: center;
	font-weight: bold;
	border: 0;
}
.ui-datepicker td {
	border: 0;
	padding: 1px;
}
.ui-datepicker td span,
.ui-datepicker td a {
	display: block;
	padding: .2em;
	text-align: right;
	text-decoration: none;
}
.ui-datepicker .ui-datepicker-buttonpane {
	background-image: none;
	margin: .7em 0 0 0;
	padding: 0 .2em;
	border-left: 0;
	border-right: 0;
	border-bottom: 0;
}
.ui-datepicker .ui-datepicker-buttonpane button {
	float: right;
	margin: .5em .2em .4em;
	cursor: pointer;
	padding: .2em .6em .3em .6em;
	width: auto;
	overflow: visible;
}
.ui-datepicker .ui-datepicker-buttonpane button.ui-datepicker-current {
	float: left;
}

/* with multiple calendars */
.ui-datepicker.ui-datepicker-multi {
	width: auto;
}
.ui-datepicker-multi .ui-datepicker-group {
	float: left;
}
.ui-datepicker-multi .ui-datepicker-group table {
	width: 95%;
	margin: 0 auto .4em;
}
.ui-datepicker-multi-2 .ui-datepicker-group {
	width: 50%;
}
.ui-datepicker-multi-3 .ui-datepicker-group {
	width: 33.3%;
}
.ui-datepicker-multi-4 .ui-datepicker-group {
	width: 25%;
}
.ui-datepicker-multi .ui-datepicker-group-last .ui-datepicker-header,
.ui-datepicker-multi .ui-datepicker-group-middle .ui-datepicker-header {
	border-left-width: 0;
}
.ui-datepicker-multi .ui-datepicker-buttonpane {
	clear: left;
}
.ui-datepicker-row-break {
	clear: both;
	width: 100%;
	font-size: 0;
}

/* RTL support */
.ui-datepicker-rtl {
	direction: rtl;
}
.ui-datepicker-rtl .ui-datepicker-prev {
	right: 2px;
	left: auto;
}
.ui-datepicker-rtl .ui-datepicker-next {
	left: 2px;
	right: auto;
}
.ui-datepicker-rtl .ui-datepicker-prev:hover {
	right: 1px;
	left: auto;
}
.ui-datepicker-rtl .ui-datepicker-next:hover {
	left: 1px;
	right: auto;
}
.ui-datepicker-rtl .ui-datepicker-buttonpane {
	clear: right;
}
.ui-datepicker-rtl .ui-datepicker-buttonpane button {
	float: left;
}
.ui-datepicker-rtl .ui-datepicker-buttonpane button.ui-datepicker-current,
.ui-datepicker-rtl .ui-datepicker-group {
	float: right;
}
.ui-datepicker-rtl .ui-datepicker-group-last .ui-datepicker-header,
.ui-datepicker-rtl .ui-datepicker-group-middle .ui-datepicker-header {
	border-right-width: 0;
	border-left-width: 1px;
}

/* Icons */
.ui-datepicker .ui-icon {
	display: block;
	text-indent: -99999px;
	overflow: hidden;
	background-repeat: no-repeat;
	left: .5em;
	top: .3em;
}
.ui-dialog {
	position: absolute;
	top: 0;
	left: 0;
	padding: .2em;
	outline: 0;
}
.ui-dialog .ui-dialog-titlebar {
	padding: .4em 1em;
	position: relative;
}
.ui-dialog .ui-dialog-title {
	float: left;
	margin: .1em 0;
	white-space: nowrap;
	width: 90%;
	overflow: hidden;
	text-overflow: ellipsis;
}
.ui-dialog .ui-dialog-titlebar-close {
	position: absolute;
	right: .3em;
	top: 50%;
	width: 20px;
	margin: -10px 0 0 0;
	padding: 1px;
	height: 20px;
}
.ui-dialog .ui-dialog-content {
	position: relative;
	border: 0;
	padding: .5em 1em;
	background: none;
	overflow: auto;
}
.ui-dialog .ui-dialog-buttonpane {
	text-align: left;
	border-width: 1px 0 0 0;
	background-image: none;
	margin-top: .5em;
	padding: .3em 1em .5em .4em;
}
.ui-dialog .ui-dialog-buttonpane .ui-dialog-buttonset {
	float: right;
}
.ui-dialog .ui-dialog-buttonpane button {
	margin: .5em .4em .5em 0;
	cursor: pointer;
}
.ui-dialog .ui-resizable-n {
	height: 2px;
	top: 0;
}
.ui-dialog .ui-resizable-e {
	width: 2px;
	right: 0;
}
.ui-dialog .ui-resizable-s {
	height: 2px;
	bottom: 0;
}
.ui-dialog .ui-resizable-w {
	width: 2px;
	left: 0;
}
.ui-dialog .ui-resizable-se,
.ui-dialog .ui-resizable-sw,
.ui-dialog .ui-resizable-ne,
.ui-dialog .ui-resizable-nw {
	width: 7px;
	height: 7px;
}
.ui-dialog .ui-resizable-se {
	right: 0;
	bottom: 0;
}
.ui-dialog .ui-resizable-sw {
	left: 0;
	bottom: 0;
}
.ui-dialog .ui-resizable-ne {
	right: 0;
	top: 0;
}
.ui-dialog .ui-resizable-nw {
	left: 0;
	top: 0;
}
.ui-draggable .ui-dialog-titlebar {
	cursor: move;
}
.ui-draggable-handle {
	-ms-touch-action: none;
	touch-action: none;
}
.ui-resizable {
	position: relative;
}
.ui-resizable-handle {
	position: absolute;
	font-size: 0.1px;
	display: block;
	-ms-touch-action: none;
	touch-action: none;
}
.ui-resizable-disabled .ui-resizable-handle,
.ui-resizable-autohide .ui-resizable-handle {
	display: none;
}
.ui-resizable-n {
	cursor: n-resize;
	height: 7px;
	width: 100%;
	top: -5px;
	left: 0;
}
.ui-resizable-s {
	cursor: s-resize;
	height: 7px;
	width: 100%;
	bottom: -5px;
	left: 0;
}
.ui-resizable-e {
	cursor: e-resize;
	width: 7px;
	right: -5px;
	top: 0;
	height: 100%;
}
.ui-resizable-w {
	cursor: w-resize;
	width: 7px;
	left: -5px;
	top: 0;
	height: 100%;
}
.ui-resizable-se {
	cursor: se-resize;
	width: 12px;
	height: 12px;
	right: 1px;
	bottom: 1px;
}
.ui-resizable-sw {
	cursor: sw-resize;
	width: 9px;
	height: 9px;
	left: -5px;
	bottom: -5px;
}
.ui-resizable-nw {
	cursor: nw-resize;
	width: 9px;
	height: 9px;
	left: -5px;
	top: -5px;
}
.ui-resizable-ne {
	cursor: ne-resize;
	width: 9px;
	height: 9px;
	right: -5px;
	top: -5px;
}
.ui-progressbar {
	height: 2em;
	text-align: left;
	overflow: hidden;
}
.ui-progressbar .ui-progressbar-value {
	margin: -1px;
	height: 100%;
}
.ui-progressbar .ui-progressbar-overlay {
	background: url("data:image/gif;base64,R0lGODlhKAAoAIABAAAAAP///yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAQABACwAAAAAKAAoAAACkYwNqXrdC52DS06a7MFZI+4FHBCKoDeWKXqymPqGqxvJrXZbMx7Ttc+w9XgU2FB3lOyQRWET2IFGiU9m1frDVpxZZc6bfHwv4c1YXP6k1Vdy292Fb6UkuvFtXpvWSzA+HycXJHUXiGYIiMg2R6W459gnWGfHNdjIqDWVqemH2ekpObkpOlppWUqZiqr6edqqWQAAIfkECQEAAQAsAAAAACgAKAAAApSMgZnGfaqcg1E2uuzDmmHUBR8Qil95hiPKqWn3aqtLsS18y7G1SzNeowWBENtQd+T1JktP05nzPTdJZlR6vUxNWWjV+vUWhWNkWFwxl9VpZRedYcflIOLafaa28XdsH/ynlcc1uPVDZxQIR0K25+cICCmoqCe5mGhZOfeYSUh5yJcJyrkZWWpaR8doJ2o4NYq62lAAACH5BAkBAAEALAAAAAAoACgAAAKVDI4Yy22ZnINRNqosw0Bv7i1gyHUkFj7oSaWlu3ovC8GxNso5fluz3qLVhBVeT/Lz7ZTHyxL5dDalQWPVOsQWtRnuwXaFTj9jVVh8pma9JjZ4zYSj5ZOyma7uuolffh+IR5aW97cHuBUXKGKXlKjn+DiHWMcYJah4N0lYCMlJOXipGRr5qdgoSTrqWSq6WFl2ypoaUAAAIfkECQEAAQAsAAAAACgAKAAAApaEb6HLgd/iO7FNWtcFWe+ufODGjRfoiJ2akShbueb0wtI50zm02pbvwfWEMWBQ1zKGlLIhskiEPm9R6vRXxV4ZzWT2yHOGpWMyorblKlNp8HmHEb/lCXjcW7bmtXP8Xt229OVWR1fod2eWqNfHuMjXCPkIGNileOiImVmCOEmoSfn3yXlJWmoHGhqp6ilYuWYpmTqKUgAAIfkECQEAAQAsAAAAACgAKAAAApiEH6kb58biQ3FNWtMFWW3eNVcojuFGfqnZqSebuS06w5V80/X02pKe8zFwP6EFWOT1lDFk8rGERh1TTNOocQ61Hm4Xm2VexUHpzjymViHrFbiELsefVrn6XKfnt2Q9G/+Xdie499XHd2g4h7ioOGhXGJboGAnXSBnoBwKYyfioubZJ2Hn0RuRZaflZOil56Zp6iioKSXpUAAAh+QQJAQABACwAAAAAKAAoAAACkoQRqRvnxuI7kU1a1UU5bd5tnSeOZXhmn5lWK3qNTWvRdQxP8qvaC+/yaYQzXO7BMvaUEmJRd3TsiMAgswmNYrSgZdYrTX6tSHGZO73ezuAw2uxuQ+BbeZfMxsexY35+/Qe4J1inV0g4x3WHuMhIl2jXOKT2Q+VU5fgoSUI52VfZyfkJGkha6jmY+aaYdirq+lQAACH5BAkBAAEALAAAAAAoACgAAAKWBIKpYe0L3YNKToqswUlvznigd4wiR4KhZrKt9Upqip61i9E3vMvxRdHlbEFiEXfk9YARYxOZZD6VQ2pUunBmtRXo1Lf8hMVVcNl8JafV38aM2/Fu5V16Bn63r6xt97j09+MXSFi4BniGFae3hzbH9+hYBzkpuUh5aZmHuanZOZgIuvbGiNeomCnaxxap2upaCZsq+1kAACH5BAkBAAEALAAAAAAoACgAAAKXjI8By5zf4kOxTVrXNVlv1X0d8IGZGKLnNpYtm8Lr9cqVeuOSvfOW79D9aDHizNhDJidFZhNydEahOaDH6nomtJjp1tutKoNWkvA6JqfRVLHU/QUfau9l2x7G54d1fl995xcIGAdXqMfBNadoYrhH+Mg2KBlpVpbluCiXmMnZ2Sh4GBqJ+ckIOqqJ6LmKSllZmsoq6wpQAAAh+QQJAQABACwAAAAAKAAoAAAClYx/oLvoxuJDkU1a1YUZbJ59nSd2ZXhWqbRa2/gF8Gu2DY3iqs7yrq+xBYEkYvFSM8aSSObE+ZgRl1BHFZNr7pRCavZ5BW2142hY3AN/zWtsmf12p9XxxFl2lpLn1rseztfXZjdIWIf2s5dItwjYKBgo9yg5pHgzJXTEeGlZuenpyPmpGQoKOWkYmSpaSnqKileI2FAAACH5BAkBAAEALAAAAAAoACgAAAKVjB+gu+jG4kORTVrVhRlsnn2dJ3ZleFaptFrb+CXmO9OozeL5VfP99HvAWhpiUdcwkpBH3825AwYdU8xTqlLGhtCosArKMpvfa1mMRae9VvWZfeB2XfPkeLmm18lUcBj+p5dnN8jXZ3YIGEhYuOUn45aoCDkp16hl5IjYJvjWKcnoGQpqyPlpOhr3aElaqrq56Bq7VAAAOw==");
	height: 100%;
	filter: alpha(opacity=25); /* support: IE8 */
	opacity: 0.25;
}
.ui-progressbar-indeterminate .ui-progressbar-value {
	background-image: none;
}
.ui-selectable {
	-ms-touch-action: none;
	touch-action: none;
}
.ui-selectable-helper {
	position: absolute;
	z-index: 100;
	border: 1px dotted black;
}
.ui-selectmenu-menu {
	padding: 0;
	margin: 0;
	position: absolute;
	top: 0;
	left: 0;
	display: none;
}
.ui-selectmenu-menu .ui-menu {
	overflow: auto;
	overflow-x: hidden;
	padding-bottom: 1px;
}
.ui-selectmenu-menu .ui-menu .ui-selectmenu-optgroup {
	font-size: 1em;
	font-weight: bold;
	line-height: 1.5;
	padding: 2px 0.4em;
	margin: 0.5em 0 0 0;
	height: auto;
	border: 0;
}
.ui-selectmenu-open {
	display: block;
}
.ui-selectmenu-text {
	display: block;
	margin-right: 20px;
	overflow: hidden;
	text-overflow: ellipsis;
}
.ui-selectmenu-button.ui-button {
	text-align: left;
	white-space: nowrap;
	width: 14em;
}
.ui-selectmenu-icon.ui-icon {
	float: right;
	margin-top: 0;
}
.ui-slider {
	position: relative;
	text-align: left;
}
.ui-slider .ui-slider-handle {
	position: absolute;
	z-index: 2;
	width: 1.2em;
	height: 1.2em;
	cursor: default;
	-ms-touch-action: none;
	touch-action: none;
}
.ui-slider .ui-slider-range {
	position: absolute;
	z-index: 1;
	font-size: .7em;
	display: block;
	border: 0;
	background-position: 0 0;
}

/* support: IE8 - See #6727 */
.ui-slider.ui-state-disabled .ui-slider-handle,
.ui-slider.ui-state-disabled .ui-slider-range {
	filter: inherit;
}

.ui-slider-horizontal {
	height: .8em;
}
.ui-slider-horizontal .ui-slider-handle {
	top: -.3em;
	margin-left: -.6em;
}
.ui-slider-horizontal .ui-slider-range {
	top: 0;
	height: 100%;
}
.ui-slider-horizontal .ui-slider-range-min {
	left: 0;
}
.ui-slider-horizontal .ui-slider-range-max {
	right: 0;
}

.ui-slider-vertical {
	width: .8em;
	height: 100px;
}
.ui-slider-vertical .ui-slider-handle {
	left: -.3em;
	margin-left: 0;
	margin-bottom: -.6em;
}
.ui-slider-vertical .ui-slider-range {
	left: 0;
	width: 100%;
}
.ui-slider-vertical .ui-slider-range-min {
	bottom: 0;
}
.ui-slider-vertical .ui-slider-range-max {
	top: 0;
}
.ui-sortable-handle {
	-ms-touch-action: none;
	touch-action: none;
}
.ui-spinner {
	position: relative;
	display: inline-block;
	overflow: hidden;
	padding: 0;
	vertical-align: middle;
}
.ui-spinner-input {
	border: none;
	background: none;
	color: inherit;
	padding: .222em 0;
	margin: .2em 0;
	vertical-align: middle;
	margin-left: .4em;
	margin-right: 2em;
}
.ui-spinner-button {
	width: 1.6em;
	height: 50%;
	font-size: .5em;
	padding: 0;
	margin: 0;
	text-align: center;
	position: absolute;
	cursor: default;
	display: block;
	overflow: hidden;
	right: 0;
}
/* more specificity required here to override default borders */
.ui-spinner a.ui-spinner-button {
	border-top-style: none;
	border-bottom-style: none;
	border-right-style: none;
}
.ui-spinner-up {
	top: 0;
}
.ui-spinner-down {
	bottom: 0;
}
.ui-tabs {
	position: relative;/* position: relative prevents IE scroll bug (element with position: relative inside container with overflow: auto appear as "fixed") */
	padding: .2em;
}
.ui-tabs .ui-tabs-nav {
	margin: 0;
	padding: .2em .2em 0;
}
.ui-tabs .ui-tabs-nav li {
	list-style: none;
	float: left;
	position: relative;
	top: 0;
	margin: 1px .2em 0 0;
	border-bottom-width: 0;
	padding: 0;
	white-space: nowrap;
}
.ui-tabs .ui-tabs-nav .ui-tabs-anchor {
	float: left;
	padding: .5em 1em;
	text-decoration: none;
}
.ui-tabs .ui-tabs-nav li.ui-tabs-active {
	margin-bottom: -1px;
	padding-bottom: 1px;
}
.ui-tabs .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor,
.ui-tabs .ui-tabs-nav li.ui-state-disabled .ui-tabs-anchor,
.ui-tabs .ui-tabs-nav li.ui-tabs-loading .ui-tabs-anchor {
	cursor: text;
}
.ui-tabs-collapsible .ui-tabs-nav li.ui-tabs-active .ui-tabs-anchor {
	cursor: pointer;
}
.ui-tabs .ui-tabs-panel {
	display: block;
	border-width: 0;
	padding: 1em 1.4em;
	background: none;
}
.ui-tooltip {
	padding: 8px;
	position: absolute;
	z-index: 9999;
	max-width: 300px;
}
body .ui-tooltip {
	border-width: 2px;
}
/* Component containers
----------------------------------*/
.ui-widget {
	font-family: Arial,Helvetica,sans-serif;
	font-size: 1em;
}
.ui-widget .ui-widget {
	font-size: 1em;
}
.ui-widget input,
.ui-widget select,
.ui-widget textarea,
.ui-widget button {
	font-family: Arial,Helvetica,sans-serif;
	font-size: 1em;
}
.ui-widget.ui-widget-content {
	border: 1px solid #c5c5c5;
}
.ui-widget-content {
	border: 1px solid #dddddd;
	background: #ffffff;
	color: #333333;
}
.ui-widget-content a {
	color: #333333;
}
.ui-widget-header {
	border: 1px solid #dddddd;
	background: #e9e9e9;
	color: #333333;
	font-weight: bold;
}
.ui-widget-header a {
	color: #333333;
}

/* Interaction states
----------------------------------*/
.ui-state-default,
.ui-widget-content .ui-state-default,
.ui-widget-header .ui-state-default,
.ui-button,

/* We use html here because we need a greater specificity to make sure disabled
works properly when clicked or hovered */
html .ui-button.ui-state-disabled:hover,
html .ui-button.ui-state-disabled:active {
	border: 1px solid #c5c5c5;
	background: #f6f6f6;
	font-weight: normal;
	color: #454545;
}
.ui-state-default a,
.ui-state-default a:link,
.ui-state-default a:visited,
a.ui-button,
a:link.ui-button,
a:visited.ui-button,
.ui-button {
	color: #454545;
	text-decoration: none;
}
.ui-state-hover,
.ui-widget-content .ui-state-hover,
.ui-widget-header .ui-state-hover,
.ui-state-focus,
.ui-widget-content .ui-state-focus,
.ui-widget-header .ui-state-focus,
.ui-button:hover,
.ui-button:focus {
	border: 1px solid #cccccc;
	background: #ededed;
	font-weight: normal;
	color: #2b2b2b;
}
.ui-state-hover a,
.ui-state-hover a:hover,
.ui-state-hover a:link,
.ui-state-hover a:visited,
.ui-state-focus a,
.ui-state-focus a:hover,
.ui-state-focus a:link,
.ui-state-focus a:visited,
a.ui-button:hover,
a.ui-button:focus {
	color: #2b2b2b;
	text-decoration: none;
}

.ui-visual-focus {
	box-shadow: 0 0 3px 1px rgb(94, 158, 214);
}
.ui-state-active,
.ui-widget-content .ui-state-active,
.ui-widget-header .ui-state-active,
a.ui-button:active,
.ui-button:active,
.ui-button.ui-state-active:hover {
	border: 1px solid #003eff;
	background: #007fff;
	font-weight: normal;
	color: #ffffff;
}
.ui-icon-background,
.ui-state-active .ui-icon-background {
	border: #003eff;
	background-color: #ffffff;
}
.ui-state-active a,
.ui-state-active a:link,
.ui-state-active a:visited {
	color: #ffffff;
	text-decoration: none;
}

/* Interaction Cues
----------------------------------*/
.ui-state-highlight,
.ui-widget-content .ui-state-highlight,
.ui-widget-header .ui-state-highlight {
	border: 1px solid #dad55e;
	background: #fffa90;
	color: #777620;
}
.ui-state-checked {
	border: 1px solid #dad55e;
	background: #fffa90;
}
.ui-state-highlight a,
.ui-widget-content .ui-state-highlight a,
.ui-widget-header .ui-state-highlight a {
	color: #777620;
}
.ui-state-error,
.ui-widget-content .ui-state-error,
.ui-widget-header .ui-state-error {
	border: 1px solid #f1a899;
	background: #fddfdf;
	color: #5f3f3f;
}
.ui-state-error a,
.ui-widget-content .ui-state-error a,
.ui-widget-header .ui-state-error a {
	color: #5f3f3f;
}
.ui-state-error-text,
.ui-widget-content .ui-state-error-text,
.ui-widget-header .ui-state-error-text {
	color: #5f3f3f;
}
.ui-priority-primary,
.ui-widget-content .ui-priority-primary,
.ui-widget-header .ui-priority-primary {
	font-weight: bold;
}
.ui-priority-secondary,
.ui-widget-content .ui-priority-secondary,
.ui-widget-header .ui-priority-secondary {
	opacity: .7;
	filter:Alpha(Opacity=70); /* support: IE8 */
	font-weight: normal;
}
.ui-state-disabled,
.ui-widget-content .ui-state-disabled,
.ui-widget-header .ui-state-disabled {
	opacity: .35;
	filter:Alpha(Opacity=35); /* support: IE8 */
	background-image: none;
}
.ui-state-disabled .ui-icon {
	filter:Alpha(Opacity=35); /* support: IE8 - See #6059 */
}

/* Icons
----------------------------------*/

/* states and images */
.ui-icon {
	width: 16px;
	height: 16px;
}
.ui-icon,
.ui-widget-content .ui-icon {
	background-image: url("images/ui-icons_444444_256x240.png");
}
.ui-widget-header .ui-icon {
	background-image: url("images/ui-icons_444444_256x240.png");
}
.ui-state-hover .ui-icon,
.ui-state-focus .ui-icon,
.ui-button:hover .ui-icon,
.ui-button:focus .ui-icon {
	background-image: url("images/ui-icons_555555_256x240.png");
}
.ui-state-active .ui-icon,
.ui-button:active .ui-icon {
	background-image: url("images/ui-icons_ffffff_256x240.png");
}
.ui-state-highlight .ui-icon,
.ui-button .ui-state-highlight.ui-icon {
	background-image: url("images/ui-icons_777620_256x240.png");
}
.ui-state-error .ui-icon,
.ui-state-error-text .ui-icon {
	background-image: url("images/ui-icons_cc0000_256x240.png");
}
.ui-button .ui-icon {
	background-image: url("images/ui-icons_777777_256x240.png");
}

/* positioning */
.ui-icon-blank { background-position: 16px 16px; }
.ui-icon-caret-1-n { background-position: 0 0; }
.ui-icon-caret-1-ne { background-position: -16px 0; }
.ui-icon-caret-1-e { background-position: -32px 0; }
.ui-icon-caret-1-se { background-position: -48px 0; }
.ui-icon-caret-1-s { background-position: -65px 0; }
.ui-icon-caret-1-sw { background-position: -80px 0; }
.ui-icon-caret-1-w { background-position: -96px 0; }
.ui-icon-caret-1-nw { background-position: -112px 0; }
.ui-icon-caret-2-n-s { background-position: -128px 0; }
.ui-icon-caret-2-e-w { background-position: -144px 0; }
.ui-icon-triangle-1-n { background-position: 0 -16px; }
.ui-icon-triangle-1-ne { background-position: -16px -16px; }
.ui-icon-triangle-1-e { background-position: -32px -16px; }
.ui-icon-triangle-1-se { background-position: -48px -16px; }
.ui-icon-triangle-1-s { background-position: -65px -16px; }
.ui-icon-triangle-1-sw { background-position: -80px -16px; }
.ui-icon-triangle-1-w { background-position: -96px -16px; }
.ui-icon-triangle-1-nw { background-position: -112px -16px; }
.ui-icon-triangle-2-n-s { background-position: -128px -16px; }
.ui-icon-triangle-2-e-w { background-position: -144px -16px; }
.ui-icon-arrow-1-n { background-position: 0 -32px; }
.ui-icon-arrow-1-ne { background-position: -16px -32px; }
.ui-icon-arrow-1-e { background-position: -32px -32px; }
.ui-icon-arrow-1-se { background-position: -48px -32px; }
.ui-icon-arrow-1-s { background-position: -65px -32px; }
.ui-icon-arrow-1-sw { background-position: -80px -32px; }
.ui-icon-arrow-1-w { background-position: -96px -32px; }
.ui-icon-arrow-1-nw { background-position: -112px -32px; }
.ui-icon-arrow-2-n-s { background-position: -128px -32px; }
.ui-icon-arrow-2-ne-sw { background-position: -144px -32px; }
.ui-icon-arrow-2-e-w { background-position: -160px -32px; }
.ui-icon-arrow-2-se-nw { background-position: -176px -32px; }
.ui-icon-arrowstop-1-n { background-position: -192px -32px; }
.ui-icon-arrowstop-1-e { background-position: -208px -32px; }
.ui-icon-arrowstop-1-s { background-position: -224px -32px; }
.ui-icon-arrowstop-1-w { background-position: -240px -32px; }
.ui-icon-arrowthick-1-n { background-position: 1px -48px; }
.ui-icon-arrowthick-1-ne { background-position: -16px -48px; }
.ui-icon-arrowthick-1-e { background-position: -32px -48px; }
.ui-icon-arrowthick-1-se { background-position: -48px -48px; }
.ui-icon-arrowthick-1-s { background-position: -64px -48px; }
.ui-icon-arrowthick-1-sw { background-position: -80px -48px; }
.ui-icon-arrowthick-1-w { background-position: -96px -48px; }
.ui-icon-arrowthick-1-nw { background-position: -112px -48px; }
.ui-icon-arrowthick-2-n-s { background-position: -128px -48px; }
.ui-icon-arrowthick-2-ne-sw { background-position: -144px -48px; }
.ui-icon-arrowthick-2-e-w { background-position: -160px -48px; }
.ui-icon-arrowthick-2-se-nw { background-position: -176px -48px; }
.ui-icon-arrowthickstop-1-n { background-position: -192px -48px; }
.ui-icon-arrowthickstop-1-e { background-position: -208px -48px; }
.ui-icon-arrowthickstop-1-s { background-position: -224px -48px; }
.ui-icon-arrowthickstop-1-w { background-position: -240px -48px; }
.ui-icon-arrowreturnthick-1-w { background-position: 0 -64px; }
.ui-icon-arrowreturnthick-1-n { background-position: -16px -64px; }
.ui-icon-arrowreturnthick-1-e { background-position: -32px -64px; }
.ui-icon-arrowreturnthick-1-s { background-position: -48px -64px; }
.ui-icon-arrowreturn-1-w { background-position: -64px -64px; }
.ui-icon-arrowreturn-1-n { background-position: -80px -64px; }
.ui-icon-arrowreturn-1-e { background-position: -96px -64px; }
.ui-icon-arrowreturn-1-s { background-position: -112px -64px; }
.ui-icon-arrowrefresh-1-w { background-position: -128px -64px; }
.ui-icon-arrowrefresh-1-n { background-position: -144px -64px; }
.ui-icon-arrowrefresh-1-e { background-position: -160px -64px; }
.ui-icon-arrowrefresh-1-s { background-position: -176px -64px; }
.ui-icon-arrow-4 { background-position: 0 -80px; }
.ui-icon-arrow-4-diag { background-position: -16px -80px; }
.ui-icon-extlink { background-position: -32px -80px; }
.ui-icon-newwin { background-position: -48px -80px; }
.ui-icon-refresh { background-position: -64px -80px; }
.ui-icon-shuffle { background-position: -80px -80px; }
.ui-icon-transfer-e-w { background-position: -96px -80px; }
.ui-icon-transferthick-e-w { background-position: -112px -80px; }
.ui-icon-folder-collapsed { background-position: 0 -96px; }
.ui-icon-folder-open { background-position: -16px -96px; }
.ui-icon-document { background-position: -32px -96px; }
.ui-icon-document-b { background-position: -48px -96px; }
.ui-icon-note { background-position: -64px -96px; }
.ui-icon-mail-closed { background-position: -80px -96px; }
.ui-icon-mail-open { background-position: -96px -96px; }
.ui-icon-suitcase { background-position: -112px -96px; }
.ui-icon-comment { background-position: -128px -96px; }
.ui-icon-person { background-position: -144px -96px; }
.ui-icon-print { background-position: -160px -96px; }
.ui-icon-trash { background-position: -176px -96px; }
.ui-icon-locked { background-position: -192px -96px; }
.ui-icon-unlocked { background-position: -208px -96px; }
.ui-icon-bookmark { background-position: -224px -96px; }
.ui-icon-tag { background-position: -240px -96px; }
.ui-icon-home { background-position: 0 -112px; }
.ui-icon-flag { background-position: -16px -112px; }
.ui-icon-calendar { background-position: -32px -112px; }
.ui-icon-cart { background-position: -48px -112px; }
.ui-icon-pencil { background-position: -64px -112px; }
.ui-icon-clock { background-position: -80px -112px; }
.ui-icon-disk { background-position: -96px -112px; }
.ui-icon-calculator { background-position: -112px -112px; }
.ui-icon-zoomin { background-position: -128px -112px; }
.ui-icon-zoomout { background-position: -144px -112px; }
.ui-icon-search { background-position: -160px -112px; }
.ui-icon-wrench { background-position: -176px -112px; }
.ui-icon-gear { background-position: -192px -112px; }
.ui-icon-heart { background-position: -208px -112px; }
.ui-icon-star { background-position: -224px -112px; }
.ui-icon-link { background-position: -240px -112px; }
.ui-icon-cancel { background-position: 0 -128px; }
.ui-icon-plus { background-position: -16px -128px; }
.ui-icon-plusthick { background-position: -32px -128px; }
.ui-icon-minus { background-position: -48px -128px; }
.ui-icon-minusthick { background-position: -64px -128px; }
.ui-icon-close { background-position: -80px -128px; }
.ui-icon-closethick { background-position: -96px -128px; }
.ui-icon-key { background-position: -112px -128px; }
.ui-icon-lightbulb { background-position: -128px -128px; }
.ui-icon-scissors { background-position: -144px -128px; }
.ui-icon-clipboard { background-position: -160px -128px; }
.ui-icon-copy { background-position: -176px -128px; }
.ui-icon-contact { background-position: -192px -128px; }
.ui-icon-image { background-position: -208px -128px; }
.ui-icon-video { background-position: -224px -128px; }
.ui-icon-script { background-position: -240px -128px; }
.ui-icon-alert { background-position: 0 -144px; }
.ui-icon-info { background-position: -16px -144px; }
.ui-icon-notice { background-position: -32px -144px; }
.ui-icon-help { background-position: -48px -144px; }
.ui-icon-check { background-position: -64px -144px; }
.ui-icon-bullet { background-position: -80px -144px; }
.ui-icon-radio-on { background-position: -96px -144px; }
.ui-icon-radio-off { background-position: -112px -144px; }
.ui-icon-pin-w { background-position: -128px -144px; }
.ui-icon-pin-s { background-position: -144px -144px; }
.ui-icon-play { background-position: 0 -160px; }
.ui-icon-pause { background-position: -16px -160px; }
.ui-icon-seek-next { background-position: -32px -160px; }
.ui-icon-seek-prev { background-position: -48px -160px; }
.ui-icon-seek-end { background-position: -64px -160px; }
.ui-icon-seek-start { background-position: -80px -160px; }
/* ui-icon-seek-first is deprecated, use ui-icon-seek-start instead */
.ui-icon-seek-first { background-position: -80px -160px; }
.ui-icon-stop { background-position: -96px -160px; }
.ui-icon-eject { background-position: -112px -160px; }
.ui-icon-volume-off { background-position: -128px -160px; }
.ui-icon-volume-on { background-position: -144px -160px; }
.ui-icon-power { background-position: 0 -176px; }
.ui-icon-signal-diag { background-position: -16px -176px; }
.ui-icon-signal { background-position: -32px -176px; }
.ui-icon-battery-0 { background-position: -48px -176px; }
.ui-icon-battery-1 { background-position: -64px -176px; }
.ui-icon-battery-2 { background-position: -80px -176px; }
.ui-icon-battery-3 { background-position: -96px -176px; }
.ui-icon-circle-plus { background-position: 0 -192px; }
.ui-icon-circle-minus { background-position: -16px -192px; }
.ui-icon-circle-close { background-position: -32px -192px; }
.ui-icon-circle-triangle-e { background-position: -48px -192px; }
.ui-icon-circle-triangle-s { background-position: -64px -192px; }
.ui-icon-circle-triangle-w { background-position: -80px -192px; }
.ui-icon-circle-triangle-n { background-position: -96px -192px; }
.ui-icon-circle-arrow-e { background-position: -112px -192px; }
.ui-icon-circle-arrow-s { background-position: -128px -192px; }
.ui-icon-circle-arrow-w { background-position: -144px -192px; }
.ui-icon-circle-arrow-n { background-position: -160px -192px; }
.ui-icon-circle-zoomin { background-position: -176px -192px; }
.ui-icon-circle-zoomout { background-position: -192px -192px; }
.ui-icon-circle-check { background-position: -208px -192px; }
.ui-icon-circlesmall-plus { background-position: 0 -208px; }
.ui-icon-circlesmall-minus { background-position: -16px -208px; }
.ui-icon-circlesmall-close { background-position: -32px -208px; }
.ui-icon-squaresmall-plus { background-position: -48px -208px; }
.ui-icon-squaresmall-minus { background-position: -64px -208px; }
.ui-icon-squaresmall-close { background-position: -80px -208px; }
.ui-icon-grip-dotted-vertical { background-position: 0 -224px; }
.ui-icon-grip-dotted-horizontal { background-position: -16px -224px; }
.ui-icon-grip-solid-vertical { background-position: -32px -224px; }
.ui-icon-grip-solid-horizontal { background-position: -48px -224px; }
.ui-icon-gripsmall-diagonal-se { background-position: -64px -224px; }
.ui-icon-grip-diagonal-se { background-position: -80px -224px; }


/* Misc visuals
----------------------------------*/

/* Corner radius */
.ui-corner-all,
.ui-corner-top,
.ui-corner-left,
.ui-corner-tl {
	border-top-left-radius: 3px;
}
.ui-corner-all,
.ui-corner-top,
.ui-corner-right,
.ui-corner-tr {
	border-top-right-radius: 3px;
}
.ui-corner-all,
.ui-corner-bottom,
.ui-corner-left,
.ui-corner-bl {
	border-bottom-left-radius: 3px;
}
.ui-corner-all,
.ui-corner-bottom,
.ui-corner-right,
.ui-corner-br {
	border-bottom-right-radius: 3px;
}

/* Overlays */
.ui-widget-overlay {
	background: #aaaaaa;
	opacity: .3;
	filter: Alpha(Opacity=30); /* support: IE8 */
}
.ui-widget-shadow {
	-webkit-box-shadow: 0px 0px 5px #666666;
	box-shadow: 0px 0px 5px #666666;
}

</style>`);
    let maxrate = 0,
        minrate = 99999,
        maxlabel = 0,
        minlabel = 9999999,
        maxfc = 0,
        minfc = 999999,
        maxage = 0,
        minage = 99999;
    let configExprMilliseconds = 3600000 * GM_getValue("tinfoexprhours", 168); //缓存7天小时
    let num = /[0-9]*/g;

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

    function getinfokey() {
        return "tinfo-" + gettid();
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

    function calcIndicator(tinfo) {
        return Math.ceil((tinfo.label * tinfo.thumbupRate) / 100) + tinfo.favoritesCount;
    }

    function calcThumbRate(tinfo) {
        let all = tinfo.thumbdown + tinfo.thumbup;
        if (all < 1) all = 1;
        return ((tinfo.thumbup + 0.00001) / all).toFixed(2) * 100;
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
    if (settings.isListPage || settings.isDetailPage) {
        //构建插件信息
        submit(function (next) {
            try {
                let config = GM_getValue("filterconfig", {
                    l1: 300,
                    l2: maxlabel,
                    rate1: 97,
                    rate2: maxrate,
                    age1: minage,
                    age2: maxage,
                });
                let buttons = "";
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
          </div>`;
                }
                $("body").append(`<div id='filterdialog' title='Teacher Filter'>
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
    </div>`);
                $("body").append("<div id='teachlistdialog' style='display:none;'></div>");
                $("body").append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。
                $("#tlabelslider")
                    .slider({
                        range: true,
                        min: minlabel - 1,
                        max: maxlabel,
                        values: [config.l1 < minlabel - 1 ? minlabel - 1 : config.l1, maxlabel],
                        slide: function (event, ui) {
                            $("#_tLabelCount").html(ui.values[0] + " - " + ui.values[1]);
                        },
                    })
                    .on("slidestop", function (event, ui) {
                        let l1 = $("#tlabelslider").slider("values", 0);
                        let l2 = $("#tlabelslider").slider("values", 1);
                        let uifilters = getUiFilters();
                        let filterconfig = GM_getValue("filterconfig", uifilters);
                        filterconfig.l1 = l1;
                        filterconfig.l2 = l2;
                        GM_setValue("filterconfig", filterconfig);
                        executeFilters(uifilters);
                    });
                $("#fcSlider")
                    .slider({
                        range: true,
                        min: minfc,
                        max: maxfc,
                        values: [config.fc1 < minfc ? minfc : config.fc1, maxfc],
                        slide: function (event, ui) {
                            $("#_tfc").html(ui.values[0] + " - " + ui.values[1]);
                        },
                    })
                    .on("slidestop", function (event, ui) {
                        let fc1 = $("#fcSlider").slider("values", 0);
                        let fc2 = $("#fcSlider").slider("values", 1);
                        let uifilters = getUiFilters();
                        let filterconfig = GM_getValue("filterconfig", uifilters);
                        filterconfig.fc1 = fc1;
                        filterconfig.fc2 = fc2;
                        GM_setValue("filterconfig", filterconfig);
                        executeFilters(uifilters);
                    });
                $("#thumbupRateslider")
                    .slider({
                        range: true,
                        min: minrate,
                        max: maxrate,
                        values: [config.rate1 < minrate ? minrate : config.rate1, maxrate],
                        slide: function (_event, ui) {
                            $("#_thumbupRate").html(ui.values[0] + "% - " + ui.values[1] + "%");
                        },
                    })
                    .on("slidestop", function (event, ui) {
                        let rate1 = $("#thumbupRateslider").slider("values", 0);
                        let rate2 = $("#thumbupRateslider").slider("values", 1);
                        let uifilters = getUiFilters();
                        let filterconfig = GM_getValue("filterconfig", uifilters);
                        filterconfig.rate1 = rate1;
                        filterconfig.rate2 = rate2;
                        GM_setValue("filterconfig", filterconfig);
                        executeFilters(uifilters);
                    });

                $("#tAgeSlider")
                    .slider({
                        range: true,
                        min: minage,
                        max: maxage,
                        values: [config.age1 < minage ? minage : config.age1, config.age2 > maxage ? maxage : config.age2],
                        slide: function (event, ui) {
                            $("#_tAge").html(ui.values[0] + " - " + ui.values[1]);
                        },
                    })
                    .on("slidestop", function (event, ui) {
                        let age1 = $("#tAgeSlider").slider("values", 0);
                        let age2 = $("#tAgeSlider").slider("values", 1);
                        let uifilters = getUiFilters();
                        let filterconfig = GM_getValue("filterconfig", uifilters);
                        filterconfig.age1 = age1;
                        filterconfig.age2 = age2;
                        console.log(`log2 ${age1}  ${age2}`);
                        GM_setValue("filterconfig", filterconfig);
                        executeFilters(uifilters);
                    });
                $("#buttons>button,#buttons>input,#buttons>a")
                    //升序
                    .eq(0)
                    .button({
                        icon: "ui-icon-arrowthick-1-n",
                        showLabel: true,
                    })
                    .click(function () {
                        $("#desc").show();
                        $(this).hide();
                        sortByIndicator(asc);
                    })
                    .end()
                    //降序
                    .eq(1)
                    .button({
                        icon: "ui-icon-arrowthick-1-s",
                        showLabel: true,
                    })
                    .click(function () {
                        $("#asc").show();
                        $(this).hide();
                        sortByIndicator(desc);
                    })
                    .end()
                    // 缓存过期时间（小时）
                    .eq(2)
                    .spinner({
                        min: 0,
                        spin: function (event, ui) {
                            GM_setValue("tinfoexprhours", ui.value);
                        },
                    })
                    .css({
                        width: "45px",
                    })
                    .val(GM_getValue("tinfoexprhours", configExprMilliseconds / 3600000))
                    .end()
                    //清空缓存
                    .eq(3)
                    .button({
                        icon: "uiicon-trash",
                        showLabel: true,
                    })
                    .click(function () {
                        var keys = GM_listValues();
                        $.each(keys, function (i, item) {
                            let title = `正在删除第${i}个教师缓存`;
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
                    })
                    .end()
                    //submit suggestion
                    .eq(4)
                    .button({
                        icon: "ui-icon-comment",
                        showLabel: true,
                    })
                    .prop("href", "https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title=")
                    .prop("target", "_blank")
                    .end()
                    //系统帮助
                    .eq(5)
                    .button({
                        icon: "ui-icon-help",
                        showLabel: true,
                    })
                    .prop("href", "https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk")
                    .prop("target", "_blank")
                    .end();
                $("#buttons1>button")
                    //反选时间段
                    .eq(0)
                    .button({
                        icon: "ui-icon-seek-next",
                        showLabel: true,
                    })
                    .click(function () {
                        $("#timesmutipulecheck>input").each(function (i, item) {
                            $(item).prop("checked", !$(item).is(":checked")).change();
                        });
                    })
                    .end()
                    // 获取选定时段老师
                    .eq(1)
                    .button({
                        icon: "ui-icon-seek-next",
                        showLabel: true,
                    })
                    .click(function () {
                        let selectedTimeSlots = [];
                        $("#timesmutipulecheck>input").each(function (i, item) {
                            if ($(item).is(":checked")) {
                                selectedTimeSlots.push($(item).val());
                            }
                        });
                        sessionStorage.setItem("selectedTimeSlots", JSON.stringify(selectedTimeSlots));
                        sessionStorage.setItem("selectedTimeSlotsTotal", selectedTimeSlots.length);
                        isStopShowboxAndAutoGetNextTimeTeachers();
                    })
                    .end();
                //初始化时间选择按钮
                $("div.condition-type:eq(0)>ul.condition-type-time>li").each(function (i, item) {
                    addCheckbox($(item).attr("data-val"), $(item).text());
                });
                let timesstr = sessionStorage.getItem("selectedTimeSlots"),
                    selectedTimeSlots = [];
                if (timesstr) {
                    selectedTimeSlots = JSON.parse(timesstr);
                    if (selectedTimeSlots.length > 0) {
                        let i = selectedTimeSlots.length;
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
                    icon: false,
                });

                function getCatchedTeachers() {
                    let teachers = [];
                    $.each(GM_listValues(), function (i, item) {
                        if (item.startsWith("tinfo-")) {
                            let t = GM_getValue(item);
                            t.tid = item.slice(6, item.length);
                            teachers.push(t);
                        }
                    });
                    let indexs = {};
                    teachers = teachers
                        .sort(function (t1, t2) {
                            if (t1.indicator == t2.indicator) return t1.favoritesCount > t2.favoritesCount ? -1 : 1;
                            return t1.indicator > t2.indicator ? -1 : 1;
                        })
                        .map((val, idx) => {
                            if (isNaN(indexs[val.type])) {
                                indexs[val.type] = 1;
                            } else {
                                indexs[val.type] += 1;
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
                                rank: indexs[val.type],
                            });
                            //GM_setValue("tinfo-"+t.tid,t);
                            return t;
                        });
                    return teachers;
                }
                $("#tabs").tabs({
                    active: "#tabs-2",
                    activate: function (event, ui) {
                        if (ui.newPanel.attr("id") != "tabs-2") return;
                        let teachers = getCatchedTeachers();
                        $("#teachertab")
                            //searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
                            .jqGrid({
                                data: teachers,
                                datatype: "local",
                                height: 240,
                                colNames: ["查", "类型", "排名", "Name", "爱", "分", "标", "率%", "收藏数", "学", "教龄", "好", "差", "龄", "更新"],
                                colModel: [
                                    //
                                    {
                                        name: "effectivetime",
                                        index: "effectivetime",
                                        width: 45,
                                        sorttype: "float",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["cn"],
                                        },
                                        formatter: function formatter(value, options, rData) {
                                            let date = new Date(Number(value));
                                            if (date instanceof Date && !isNaN(date.valueOf())) {
                                                return date.toString("MMddHHmm");
                                            }
                                            return value;
                                        },
                                    }, //
                                    {
                                        name: "type",
                                        index: "type",
                                        width: 55,
                                        sorttype: "string",
                                        align: "left",
                                        searchoptions: {
                                            sopt: ["cn"],
                                            defaultValue: $(".s-t-top-list .li-active").text() == "收藏外教" ? "" : $(".s-t-top-list .li-active").text(),
                                        },
                                        formatter: function formatter(value, options, rData) {
                                            if (value) return value;
                                            else return "na";
                                        },
                                    }, //
                                    {
                                        name: "rank",
                                        index: "rank",
                                        width: 40,
                                        sorttype: "float",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["le"],
                                        },
                                    }, //
                                    {
                                        name: "name",
                                        index: "name",
                                        width: 125,
                                        sorttype: "string",
                                        formatter: function formatter(value, options, rData) {
                                            return "<a href='http://www.51talk.com/TeacherNew/info/" + rData["tid"] + "' target='_blank' style='color:blue'>" + (!!value ? value : rData["tid"]) + "</a>";
                                        },
                                    }, //
                                    {
                                        name: "isfavorite",
                                        index: "isfavorite",
                                        width: 39,
                                        sorttype: "string",
                                        align: "left",
                                        searchoptions: {
                                            sopt: ["cn"],
                                        },
                                        formatter: function formatter(value, options, rData) {
                                            if (value) return "收藏";
                                            else return "";
                                        },
                                    }, //
                                    {
                                        name: "indicator",
                                        index: "indicator",
                                        width: 50,
                                        sorttype: "float",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "label",
                                        index: "label",
                                        width: 45,
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "thumbupRate",
                                        index: "thumbupRate",
                                        width: 35,
                                        align: "right",
                                        sorttype: "float",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "favoritesCount",
                                        index: "favoritesCount",
                                        width: 35,
                                        align: "right",
                                        sorttype: "float",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "slevel",
                                        index: "slevel",
                                        width: 85,
                                        sorttype: "string",
                                        align: "left",
                                        searchoptions: {
                                            sopt: ["cn", "nc"],
                                        },
                                    }, //
                                    {
                                        name: "tage",
                                        index: "tage",
                                        width: 25,
                                        sorttype: "float",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "thumbup",
                                        index: "thumbup",
                                        width: 45,
                                        align: "right",
                                        sorttype: "float",
                                        searchoptions: {
                                            sopt: ["ge"],
                                        },
                                    }, //
                                    {
                                        name: "thumbdown",
                                        index: "thumbdown",
                                        width: 30,
                                        sorttype: "float",
                                        align: "right",
                                    }, //
                                    {
                                        name: "age",
                                        index: "age",
                                        width: 30,
                                        sorttype: "float",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["le", "ge", "eq"],
                                        },
                                    }, //
                                    {
                                        name: "expire",
                                        index: "expire",
                                        width: 35,
                                        sorttype: "Date",
                                        align: "right",
                                        searchoptions: {
                                            sopt: ["cn"],
                                        },
                                        formatter: function formatter(value, options, rData) {
                                            if (value) {
                                                let d = Date.now() - value;
                                                if (d < 1000 * 60) {
                                                    return "刚刚";
                                                } else if (d < 1000 * 60 * 60) {
                                                    return (d / 60000).toFixed(0) + "分";
                                                } else if (d < 1000 * 60 * 60 * 24) {
                                                    return (d / 3600000).toFixed(0) + "时";
                                                } else {
                                                    return (d / 86400000).toFixed(0) + "天";
                                                }
                                                return d;
                                            } else return "na";
                                        },
                                    },
                                ],
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
                                del: true,
                                //refresh: true,
                                //autowidth: true,
                                //width: 732
                                //caption: "",,
                            })
                            .jqGrid("filterToolbar", {
                                searchOperators: true,
                            })[0]
                            .triggerToolbar();
                        if (settings.isListPage) {
                            $.each($(".item"), function (i, item) {
                                let jqel = $(item);
                                let tid = jqel.find(".teacher-details-link a").attr("href").replace("https://www.51talk.com/TeacherNew/info/", "").replace("http://www.51talk.com/TeacherNew/info/", "");
                                let t = teachers.find((currentValue, index, arr) => {
                                    return currentValue.tid == tid;
                                });
                                let lb = jqel.find(".teacher-name>label:eq(3)");
                                if (lb.length == 0) jqel.find(".teacher-name").html(`${jqel.find(".teacher-name").html()}| ${getRankHtml(t)}`);
                                else lb.replaceWith(getRankHtml(t));
                            });
                        }
                        if (settings.isDetailPage) {
                            let t = teachers.find((currentValue, index, arr) => {
                                return currentValue.tid == gettid();
                            });
                            $("#teacherRank").html(getRankHtml(t));
                        }
                    },
                });
                let uifilters = getUiFilters();
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
                let colorif = "";
                if (t.rank <= conf.markRankRed) {
                    colorif = "style = 'color:red'";
                }
                return `<label title='在同类别教师中的排名' ${colorif}> ${t.rank}名</label>`;
            }
        }
        //弹出信息框
        submit(function (next) {
            $(".s-t-list").before($(".s-t-page").prop("outerHTML"));
            $("#tabs>div:first").append($(".s-t-page").prop("outerHTML"));
            sortByIndicator(desc);
            $("#tabs").tabs("option", "active", 1);
            if (settings.isDetailPage) {
                $("#tabs").tabs("option", "disabled", [0]);
            }
            $("#filterdialog").dialog({
                width: "850",
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
    (x) => x;
})();