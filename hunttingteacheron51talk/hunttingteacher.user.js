'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

// ==UserScript==
// @name         51talk选择最好最合适的老师-经验|好评率|年龄|收藏数
// @version      1.1.12
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
(function () {
	'use strict';

	//重载类型方法

	(function () {
		var _o;

		var getPaddedComp = function getPaddedComp(comp) {
			return parseInt(comp) < 10 ? '0' + comp : comp;
		},
		    o = (_o = {
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
			} }, _defineProperty(_o, 'h{1}', function h1(date) {
			return date.getHours();
		}), _defineProperty(_o, "m{2}", function m2(date) {
			return getPaddedComp(date.getMinutes());
		}), _defineProperty(_o, "m{1}", function m1(date) {
			return date.getMinutes();
		}), _defineProperty(_o, "s+", function s(date) {
			return getPaddedComp(date.getSeconds());
		}), _defineProperty(_o, "f+", function f(date) {
			return getPaddedComp(date.getMilliseconds());
		}), _defineProperty(_o, "b+", function b(date) {
			return date.getHours() >= 12 ? 'PM' : 'AM';
		}), _o);

		Date.prototype.toString = function (format) {
			var formattedDate = format;
			for (var k in o) {
				if (new RegExp("(" + k + ")").test(format)) {
					formattedDate = formattedDate.replace(RegExp.$1, o[k](this));
				}
			}
			return formattedDate;
		};

		//删除数组中的空元素
		Array.prototype.clean = function () {
			var deleteValue = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

			for (var i = 0; i < this.length; i++) {
				if (this[i] == deleteValue) {
					this.splice(i, 1);
					i--;
				}
			}
			return this;
		};
		Number.prototype.toString = function () {
			return this.toFixed(2);
		};
		String.prototype.toFloat = function () {
			return parseFloat(this);
		};
		String.prototype.toInt = function () {
			return parseInt(this);
		};
		String.prototype.startsWith = function (str) {
			return this.slice(0, str.length) == str;
		};
		String.prototype.endsWith = function (str) {
			return this.slice(-str.length) == str;
		};
		String.prototype.contains = function (str) {
			return this.indexOf(str) > -1;
		};
		String.prototype.replaceAll = function (search, replacement) {
			var target = this;
			return target.replace(new RegExp(search, 'g'), replacement);
		};
	})();

	var config = GM_config([{
		key: 'pagecount',
		label: '最大页数(自动获取时)',
		default: 20,
		type: 'dropdown',
		values: [0, 5, 10, 20, 50, 1000]
	}, {
		key: 'batchtimezoneMinutes',
		label: '预定耗费时间（分钟）',
		default: 60,
		type: 'dropdown',
		values: [5, 10, 20, 30, 50, 60, 90, 120, 300, 600, 1440, 10080]
	}, {
		key: 'version',
		type: 'hidden',
		default: 1
	}]);
	var conf = config.load();
	config.onsave = function (cfg) {
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
	var url = window.location.href.toLocaleLowerCase();
	var settings = {
		'url': url,
		'tid': url.match(/(t\d+)/g),
		'pagecount': conf.pagecount,
		'isDetailPage': url.contains("teachernew"),
		'isListPage': url.contains('reservenew'),
		'isCoursePage': url.contains('study_center')
	};

	function gettid() {
		return settings.tid;
	}

	/**
  * 提交运算函数到 document 的 fx 队列
  */
	var submit = function submit(fun) {
		var queue = $.queue(document, "fx", fun);
		if (queue[0] == 'inprogress') {
			return;
		}
		$.dequeue(document);
	};

	function getorAdd(key, func) {
		if (!(key in sessionStorage)) {
			var data = typeof func == 'function' ? func(key) : func;
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
		var start = new Date().getTime();
		while (new Date().getTime() - start < delay) {
			continue;
		}
	}

	var asc = function asc(a, b) {
		var av = $(a).attr('indicator');
		var bv = $(b).attr('indicator');
		if (!av || !bv) return 0;
		return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? 1 : -1;
	};

	var desc = function desc(a, b) {
		var av = $(a).attr('indicator');
		var bv = $(b).attr('indicator');
		if (!av || !bv) return 0;
		return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? -1 : 1;
	};

	var sortByIndicator = function sortByIndicator(sortBy) {
		var sortEle = $('.s-t-content.f-cb .item').sort(sortBy);
		$('.s-t-content.f-cb').empty().append(sortEle);
	};

	function getBatchNumber() {
		var batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
		return getorAdd(batchnumber, function (key) {
			return new Date().getTime();
		});
	}

	function getLeftPageCount() {
		var pages = Number($('.s-t-page>.next-page:first').prev().text());
		var curr = Number($('.s-t-page>.active:first').text());
		if (pages) return pages - curr;else return 0;
	}

	function getAutoNextPagesCount() {
		var pages = getLeftPageCount();
		if (settings.pagecount > pages) return pages;else return settings.pagecount;
	}

	$("head").append('<link href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" rel="stylesheet" type="text/css">\n\t\t<link href="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/css/ui.jqgrid.min.css" rel="stylesheet" type="text/css">');

	$("head").append('<style type="text/css">\n\t\t.search-teachers .s-t-list .item-time-list {margin-top:315px;}\n\t\t.search-teachers .s-t-list .item {   height: 679px; }\n\t\t.search-teachers .s-t-list .s-t-content { margin-right: 0px;}\n\t\t.search-teachers { width: 100%; }\n\t\t.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}\n\t\t.search-teachers .s-t-list .item { height: auto;  margin-right: 5px; margin-bottom: 5px; }\n\t\t.pace {\n\t\t  -webkit-pointer-events: none;\n\t\t  pointer-events: none;\n\t\t  -webkit-user-select: none;\n\t\t  -moz-user-select: none;\n\t\t  user-select: none;\n\t\t}\n\t\t.pace-inactive {\n\t\t  display: none;\n\t\t}\n\t\t.ui-tabs .ui-tabs-panel{padding:.5em 0.2em;}\n\t\t.ui-dialog .ui-dialog-content { padding: .5em 0.2em;}\n\t\t.pace .pace-progress {\n\t\t  background: #29d;\n\t\t  position: fixed;\n\t\t  z-index: 2000;\n\t\t  top: 0;\n\t\t  right: 100%;\n\t\t  width: 100%;\n\t\t  height: 2px;\n\t\t}\n\t\t.search-teachers .s-t-top .s-t-days .s-t-days-list li {\n\t\t float: left;\n\t\t width: 118px;\n\t\t height: 34px;\n\t\t line-height: 34px;\n\t\t margin-right: 5px;\n\t\t margin-bottom: 5px;\n\t\t}\n\t\t.search-teachers .s-t-top .s-t-top-details {\n\t\t padding: 2px 0 2px 30px;\n\t\t}\n\t\t.search-teachers .s-t-top .s-t-top-right {\n\t\t height: auto;\n\t\t}\n\t\t.search-teachers .s-t-top .s-t-top-left .condition-item {\n\t\t margin-bottom: 2px;\n\t\t}\n\t\t.s-t-page {   padding-top: 2px;}\n\t\t</style>');
	var maxrate = 0,
	    minrate = 99999,
	    maxlabel = 0,
	    minlabel = 9999999,
	    maxfc = 0,
	    minfc = 999999,
	    maxage = 0,
	    minage = 99999;
	var configExprMilliseconds = 3600000 * GM_getValue('tinfoexprhours', 168); //缓存7天小时
	var num = /[0-9]*/g;

	function updateTeacherinfoToUI(jqel, tinfo) {
		if (tinfo.label > maxlabel) maxlabel = tinfo.label;
		if (tinfo.label < minlabel) minlabel = tinfo.label;
		if (tinfo.favoritesCount > maxfc) maxfc = tinfo.favoritesCount;
		if (tinfo.favoritesCount < minfc) minfc = tinfo.favoritesCount;
		if (tinfo.thumbupRate > maxrate) maxrate = tinfo.thumbupRate;
		if (tinfo.thumbupRate < minrate) minrate = tinfo.thumbupRate;
		if (tinfo.age > maxage) maxage = tinfo.age;
		if (tinfo.age < minage) minage = tinfo.age;
		jqel.attr("teacherinfo", JSON.stringify(tinfo));
		jqel.find(".teacher-name").html(jqel.find(".teacher-name").text() + "<br />[" + tinfo.label + "|" + tinfo.thumbupRate + "%|" + tinfo.favoritesCount + "]");
		jqel.find(".teacher-age").html(jqel.find(".teacher-age").text() + " | <label title='排序指标'>" + tinfo.indicator + "</label>");
		jqel //.attr('thumbup', tinfo.thumbup)
		//.attr('thumbdown', tinfo.thumbdown)
		//.attr('thumbupRate', tinfo.thumbupRate)
		//.attr('age', tinfo.age)
		//.attr('label', tinfo.label)
		.attr('indicator', tinfo.indicator);
	}

	function executeFilters(uifilters) {
		var tcount = 0,
		    hidecount = 0;
		$.each($('.item'), function (i, item) {
			var node = $(item);
			var tinfojson = node.attr("teacherinfo");
			if (!tinfojson) {
				return true;
			}
			var tinfo = JSON.parse(tinfojson);
			if (tinfo.thumbupRate >= uifilters.rate1 && tinfo.thumbupRate <= uifilters.rate2 && tinfo.label >= uifilters.l1 && tinfo.label <= uifilters.l2 && tinfo.age >= uifilters.age1 && tinfo.age <= uifilters.age2 && tinfo.favoritesCount >= uifilters.fc1 && tinfo.favoritesCount <= uifilters.fc2) {
				if (node.is(':hidden')) {
					//如果node是隐藏的则显示node元素，否则隐藏
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
		var l1 = $("#tlabelslider").slider('values', 0);
		var l2 = $("#tlabelslider").slider('values', 1);
		var rate1 = $("#thumbupRateslider").slider('values', 0);
		var rate2 = $("#thumbupRateslider").slider('values', 1);
		var age1 = $("#tAgeSlider").slider('values', 0);
		var age2 = $("#tAgeSlider").slider('values', 1);
		var fc1 = $("#fcSlider").slider('values', 0);
		var fc2 = $("#fcSlider").slider('values', 1);
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
	};

	if (settings.isListPage) {
		var getTeacherInfoInList = function getTeacherInfoInList(jqel) {
			var age = Number(jqel.find(".teacher-age").text().match(num).clean("")[0]);
			var label = function () {
				var j_len = jqel.find(".label").text().match(num).clean("").length;
				var l = 0;
				for (var j = 0; j < j_len; j++) {
					l += Number(jqel.find(".label").text().match(num).clean("")[j]);
				}
				l = Math.ceil(l / 5);
				return l;
			}();
			var name = jqel.find(".teacher-name").text();
			var type = $('.s-t-top-list .li-active').text();
			var effectivetime = getBatchNumber();
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
		};

		//获取列表中数据

		$(".item-top-cont").prop('innerHTML', function (i, val) {
			return val.replaceAll('<!--', '').replaceAll('-->', '');
		});
		$(".s-t-days-list>li").click(function () {
			var batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
			sessionStorage.setItem(batchnumber, new Date().getTime());
		});
		$(".condition-type-time>li").click(function () {
			var batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
			sessionStorage.setItem(batchnumber, new Date().getTime());
		});
		$(".s-t-top-list>li>a").click(function () {
			var batchnumber = $("input[name='Date']").val() + $("input[name='selectTime']").val();
			sessionStorage.setItem(batchnumber, new Date().getTime());
		});

		// 自动获取时,显示停止按钮
		submit(function (next) {
			var autonextpage = GM_getValue('autonextpage', 1);
			if (autonextpage > 0 && $('.s-t-page>.next-page').length > 0) {
				var _buttons;

				var dialog = $('<div id="dialog-confirm" title="\u662F\u5426\u505C\u6B62\u81EA\u52A8\u641C\u7D22\u8001\u5E08?">\n\t\t\t<p><span class="ui-icon ui-icon-alert" style="float:left; margin:12px 12px 20px 0;"></span>\n\t\t\t\u70B9\u51FB\u7ACB\u5373\u505C\u6B62\uFF0C \u5C06\u505C\u6B62\u83B7\u53D6\u540E\u7EED\u6559\u5E08\n\t\t\t<!--\u5373\u5C06\u505C\u6B62\u81EA\u52A8\u83B7\u53D6\u540E\u8FB9<b>' + (autonextpage - 1) + '</b>\u9875\u7684\u6570\u636E\uFF0C\u7EA6' + (autonextpage - 1) * 28 + '\u4E2A\u6559\u5E08?--></p>\n\t\t\t</div>');
				dialog.appendTo('body');
				dialog.dialog({
					resizable: false,
					height: "auto",
					width: 400,
					modal: false,
					buttons: (_buttons = {
						"立即停止": function _() {
							sessionStorage.setItem('times', '');
							GM_setValue('autonextpage', 0);
							$(this).dialog("close");
						}
					}, _defineProperty(_buttons, '\u53D6\u540E' + (autonextpage * 0.25).toFixed(0) + '\u9875', function undefined() {
						sessionStorage.setItem('times', '');
						GM_setValue('autonextpage', (autonextpage * 0.25).toFixed(0));
						$(this).dialog("close");
					}), _defineProperty(_buttons, '\u53D6\u540E' + (autonextpage * 0.5).toFixed(0) + '\u9875', function undefined() {
						sessionStorage.setItem('times', '');
						GM_setValue('autonextpage', (autonextpage * 0.5).toFixed(0));
						$(this).dialog("close");
					}), _defineProperty(_buttons, '\u53D6\u540E' + (autonextpage * 0.75).toFixed(0) + '\u9875', function undefined() {
						sessionStorage.setItem('times', '');
						GM_setValue('autonextpage', (autonextpage * 0.75).toFixed(0));
						$(this).dialog("close");
					}), _buttons)
				});
			}
			next();
		});

		$(".item").each(function (index, el) {
			submit(function (next) {
				Pace.track(function () {
					var jqel = $(el);
					var tid = jqel.find(".teacher-details-link a").attr('href').replace("https://www.51talk.com/TeacherNew/info/", "").replace('http://www.51talk.com/TeacherNew/info/', '');

					var tinfokey = 'tinfo-' + tid;
					var teacherlistinfo = getTeacherInfoInList(jqel);
					var tinfo = GM_getValue(tinfokey);
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
					}
					// ajax 请求一定要包含在一个函数中
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
							if (jqr.find(".evaluate-content-left span").length >= 3) {
								var thumbup = Number(jqr.find(".evaluate-content-left span:eq(1)").text().match(num).clean("")[0]);
								var thumbdown = Number(jqr.find(".evaluate-content-left span:eq(2)").text().match(num).clean("")[0]);
								var thumbupRate = ((thumbup + 0.00001) / (thumbdown + thumbup)).toFixed(2) * 100;
								var favoritesCount = Number(jqr.find(".clear-search").text().match(num).clean("")[0]);
								var isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
								var tage = Number(jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("")[0]);
								var slevel = jqr.find('.sui-students').text();
								jqr.remove();

								var tinfo = {
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
						error: function error(data) {
							console.log("xhr error when getting teacher " + JSON.stringify(jqel) + ",error msg:" + JSON.stringify(data));
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
			var autonextpage = GM_getValue('autonextpage', 0);
			if (autonextpage > 0) {
				GM_setValue('autonextpage', autonextpage - 1);
				if ($('.s-t-page>.next-page').length == 0) {
					GM_setValue('autonextpage', 0);
					if (isStopAndAutoGetNextTimeTeachers()) return;
				} else {
					$('.s-t-page .next-page')[0].click();
					return false;
				}
			} else {
				if (isStopAndAutoGetNextTimeTeachers()) return;
			}
			next();
		});
	}

	function isStopAndAutoGetNextTimeTeachers() {
		var str = sessionStorage.getItem('times');
		if (!str) return false;
		var times = JSON.parse(str);
		console.log(times);
		var cur = times.shift();
		if (cur) {
			GM_setValue('autonextpage', 500);
			sessionStorage.setItem('times', JSON.stringify(times));
			$('form[name="searchform"]>input[name="selectTime"]').val(cur);
			$('form[name="searchform"]>input[name="pageID"]').val(1);
			$('.go-search').click();
			return true;
		}
		return false;
	}
	if (settings.isDetailPage) {
		var processTeacherDetailPage = function processTeacherDetailPage(jqr) {
			jqr.find('.teacher-name-tit').prop('innerHTML', function (i, val) {
				return val.replaceAll('<!--', '').replaceAll('-->', '');
			});
			var tinfo = GM_getValue(getinfokey(), {});
			tinfo.label = function () {
				var l = 0;
				$.each(jqr.find(".t-d-label").text().match(num).clean(""), function (i, val) {
					l += Number(val);
				});
				l = Math.ceil(l / 5);
				return l;
			}();
			if (window.location.href.toLocaleLowerCase().contains("teachercomment")) {
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

			jqr.find(".teacher-name-tit").prop('innerHTML', function (i, val) {
				return val + ' \n\t\t\t<span class="age age-line">\u6307\u6807' + tinfo.indicator + '</span>\n\t\t\t<span class="age age-line">\u7387' + tinfo.thumbupRate + '%</span>\n\t\t\t<span class="age age-line">\u8D5E' + tinfo.thumbup + '</span>\n\t\t\t<span class="age age-line">\u8E29' + tinfo.thumbdown + '</span>\t\t\t\n\t\t\t<span class="age age-line">\u6807\u7B7E\u6570' + tinfo.label + '</span>\n\t\t\t';
			});
		};

		submit(function (next) {
			processTeacherDetailPage($(document));
			next();
		});
	}

	function addCheckbox(val, lbl, group) {
		var container = $('#timesmutipulecheck');
		var inputs = container.find('input');
		var id = inputs.length + 1;

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
	if (settings.isListPage || settings.isDetailPage) {
		//构建插件信息
		submit(function (next) {
			try {
				var getCatchedTeachers = function getCatchedTeachers() {
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
						val.rank = indexs[val.type];
						return val;
					});
					return teachers;
				};

				var config = GM_getValue('filterconfig', {
					l1: 300,
					l2: maxlabel,
					rate1: 97,
					rate2: maxrate,
					age1: minage,
					age2: maxage
				});
				$('body').append('<div id=\'filterdialog\' title=\'Teacher Filter\'>\n\t\t\t\t\t<div id=\'tabs\'>\n\t\t\t\t\t\t<div>\t\n\t\t\t\t\t\t\t<ul>\n\t\t\t\t\t\t\t\t<li><a href="#tabs-1">Search Teachers</a></li>\n\t\t\t\t\t\t\t\t<li><a href="#tabs-2">Sorted Teachers</a></li>\n\t\t\t\t\t\t\t</ul>\n\t\t\t\t\t\t\t<br />\n\t\t\t\t\t\t\t<div id=\'buttons\' style=\'text-align: center;\'>\n\t\t\t\t\t\t\t\t<button id=\'asc\' title=\'\u5F53\u524D\u4E3A\u964D\u5E8F\uFF0C\u70B9\u51FB\u540E\u6309\u5347\u5E8F\u6392\u5217\'>\u5347\u5E8F</button>\n\t\t\t\t\t\t\t\t<button id=\'desc\' title=\'\u5F53\u524D\u4E3A\u5347\u5E8F\uFF0C\u70B9\u51FB\u8FDB\u884C\u964D\u5E8F\u6392\u5217\'  style=\'display:none;\'>\u964D\u5E8F</button>&nbsp;\n\t\t\t\t\t\t\t\t<input id=\'tinfoexprhours\' title=\'\u7F13\u5B58\u8FC7\u671F\u65F6\u95F4\uFF08\u5C0F\u65F6\uFF09\'>&nbsp;\n\t\t\t\t\t\t\t\t<button title=\'\u6E05\u7A7A\u6559\u5E08\u4FE1\u606F\u7F13\u5B58\uFF0C\u5E76\u91CD\u65B0\u641C\u7D22\'>\u6E05\u9664\u7F13\u5B58</button>&nbsp;\n\t\t\t\t\t\t\t\t<a>\u53BB\u63D0\u5EFA\u8BAE\u548CBUG</a>&nbsp;\n\t\t\t\t\t\t\t\t<a>?</a>&nbsp;\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t\t<div  id=\'buttons1\' style=\'text-align: left;\'>\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t<fieldset>\n\t\t\t\t\t\t\t\t\t<legend>\u9009\u62E9\u65F6\u95F4\u6BB5</legend>\n\t\t\t\t\t\t\t\t\t<div id=\'timesmutipulecheck\'></div>\n\t\t\t\t\t\t\t\t\t<!--<button id=\'autogetnextpage\'>\u81EA\u52A8\u83B7\u53D6\u6B64\u65F6\u6BB5' + getAutoNextPagesCount() + '\u9875</button>&nbsp;-->\n\t\t\t\t\t\t\t\t\t<button id=\'autogettodaysteachers\'>\u83B7\u53D6\u9009\u5B9A\u65F6\u6BB5\u8001\u5E08</button>&nbsp;\n\t\t\t\t\t\t\t\t</fieldset>\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t</div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div id="tabs-1">\n\t\t\t\t\t\t\t\u5F53\u524D\u53EF\u9009<span id=\'tcount\' />\u4F4D,\u88AB\u6298\u53E0<span id=\'thidecount\' />\u4F4D\u3002<br />\n\t\t\t\t\t\t\t\u6709\u6548\u7ECF\u9A8C\u503C <span id=\'_tLabelCount\' /><br /><div id=\'tlabelslider\'></div>\n\t\t\t\t\t\t\t\u6536\u85CF\u6570 <span id=\'_tfc\' /><br /><div id=\'fcSlider\'></div>\n\t\t\t\t\t\t\t\u597D\u8BC4\u7387 <span id=\'_thumbupRate\'/><br /><div id=\'thumbupRateslider\'></div>\n\t\t\t\t\t\t\t\u5E74\u9F84 <span id=\'_tAge\' /><br /><div id=\'tAgeSlider\'></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t\t<div id="tabs-2">\n\t\t\t\t\t\t\t<table id="teachertab"></table>\n\t\t\t\t\t\t\t<div id="pager5"></div>\n\t\t\t\t\t\t</div>\n\t\t\t\t\t</div>\n\t\t\t\t</div>');
				$('body').append("<div id='teachlistdialog' style='display:none;'></div>");
				$('body').append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。
				$("#tlabelslider").slider({
					range: true,
					min: minlabel - 1,
					max: maxlabel,
					values: [config.l1 < minlabel - 1 ? minlabel - 1 : config.l1, maxlabel],
					slide: function slide(event, ui) {
						$('#_tLabelCount').html(ui.values[0] + " - " + ui.values[1]);
					}
				}).on('slidestop', function (event, ui) {
					var l1 = $("#tlabelslider").slider('values', 0);
					var l2 = $("#tlabelslider").slider('values', 1);
					var uifilters = getUiFilters();
					var filterconfig = GM_getValue('filterconfig', uifilters);
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
					slide: function slide(event, ui) {
						$('#_tfc').html(ui.values[0] + " - " + ui.values[1]);
					}
				}).on('slidestop', function (event, ui) {
					var fc1 = $("#fcSlider").slider('values', 0);
					var fc2 = $("#fcSlider").slider('values', 1);
					var uifilters = getUiFilters();
					var filterconfig = GM_getValue('filterconfig', uifilters);
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
					slide: function slide(event, ui) {
						$('#_thumbupRate').html(ui.values[0] + "% - " + ui.values[1] + '%');
					}
				}).on('slidestop', function (event, ui) {
					var rate1 = $("#thumbupRateslider").slider('values', 0);
					var rate2 = $("#thumbupRateslider").slider('values', 1);
					var uifilters = getUiFilters();
					var filterconfig = GM_getValue('filterconfig', uifilters);
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
					slide: function slide(event, ui) {
						$('#_tAge').html(ui.values[0] + " - " + ui.values[1]);
					}
				}).on("slidestop", function (event, ui) {
					var age1 = $("#tAgeSlider").slider('values', 0);
					var age2 = $("#tAgeSlider").slider('values', 1);
					var uifilters = getUiFilters();
					var filterconfig = GM_getValue('filterconfig', uifilters);
					filterconfig.age1 = age1;
					filterconfig.age2 = age2;
					GM_setValue('filterconfig', filterconfig);
					executeFilters(uifilters);
				});

				$('#buttons>button,#buttons>input,#buttons>a').eq(0).button({
					icon: 'ui-icon-arrowthick-1-n',
					showLabel: false
				}) //升序
				.click(function () {
					$('#desc').show();
					$(this).hide();
					sortByIndicator(asc);
				}).end().eq(1).button({
					icon: 'ui-icon-arrowthick-1-s',
					showLabel: false
				}) //降序
				.click(function () {
					$('#asc').show();
					$(this).hide();
					sortByIndicator(desc);
				}).end().eq(2).spinner({
					min: 0,
					spin: function spin(event, ui) {
						GM_setValue('tinfoexprhours', ui.value);
					}
				}) // 缓存过期时间（小时）
				.css({
					width: '40px'
				}).val(GM_getValue('tinfoexprhours', configExprMilliseconds / 3600000)).end().eq(3).button({
					icon: 'ui-icon-trash',
					showLabel: false
				}) //清空缓存
				.click(function () {
					$.each(GM_listValues(), function (i, item) {
						if (item.startsWith('tinfo-')) {
							GM_deleteValue(item);
						}
					});
					$('.go-search').click();
				}).end().eq(4).button({
					icon: 'ui-icon-comment',
					showLabel: false
				}) //submit suggestion
				.prop('href', 'https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title=').prop('target', '_blank').end().eq(5).button({
					icon: 'ui-icon-help',
					showLabel: false
				}) //系统帮助
				.prop('href', 'https://github.com/niubilityfrontend/userscripts/tree/master/hunttingteacheron51talk').prop('target', '_blank').end();

				$('#buttons1 button').eq(0).button({
					icon: 'ui-icon-seek-next',
					showLabel: true
				}) //submit suggestion
				.click(function () {
					var times = [];
					$('#timesmutipulecheck>input').each(function (i, item) {
						if ($(item).is(":checked")) {
							times.push($(item).val());
						}
					});
					sessionStorage.setItem('times', JSON.stringify(times));
					isStopAndAutoGetNextTimeTeachers();
					//console.log(times);
				}).end();

				$('div.condition-type:eq(0)>ul.condition-type-time>li').each(function (i, item) {
					addCheckbox($(item).attr('data-val'), $(item).text());
				});
				$('#timesmutipulecheck').find("input").checkboxradio({
					icon: false
				});
				var timesstr = sessionStorage.getItem("times"),
				    times = [];
				if (timesstr) {
					times = JSON.parse(timesstr);
					var i = times.length;
					while (i--) {
						$("#timesmutipulecheck>input[value='" + times[i] + "']").attr('checked', true);
					}
				} else {
					$("#timesmutipulecheck>input[value='" + $("input[name='selectTime']").val() + "']").attr('checked', true);
				}

				$('#timesmutipulecheck').find("input").checkboxradio({
					refresh: true
				});

				$("#tabs").tabs({
					active: '#tabs-2',
					activate: function activate(event, ui) {
						if (ui.newPanel.attr('id') != 'tabs-2') return;
						var teachers = getCatchedTeachers();
						var jqtable = $("#teachertab");
						jqtable.jqGrid({
							data: teachers,
							datatype: "local",
							height: 240,
							colNames: ['查', '类型', '排名', 'Name', '爱', '分', '标', '率%', '收藏数', '学', '教龄', '好', '差', '龄', '更新'],
							colModel: [
							//searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
							{
								name: 'effectivetime',
								index: 'effectivetime',
								width: 50,
								sorttype: "float",
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
									if (value) return value;else return 'na';
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
								width: 95,
								sorttype: "string",
								formatter: function formatter(value, options, rData) {
									return "<a href='http://www.51talk.com/TeacherNew/info/" + rData['tid'] + "' target='_blank' style='color:blue'>" + (!rData['name'] ? value : rData['name']) + "</a>";
								}
							}, {
								name: 'isfavorite',
								index: 'isfavorite',
								width: 49,
								sorttype: "string",
								align: 'left',
								searchoptions: {
									sopt: ['cn']
								},
								formatter: function formatter(value, options, rData) {
									if (value) return '收藏';else return '';
								}
							}, {
								name: 'indicator',
								index: 'indicator',
								width: 45,
								sorttype: "float",
								align: 'right',
								searchoptions: {
									sopt: ['ge']
								}
							}, {
								name: 'label',
								index: 'label',
								width: 50,
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
								width: 65,
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
									if (value) {
										var d = new Date().getTime() - value;
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
							sortorder: "desc",
							grouping: false,
							//autowidth: true,
							caption: ""
						}).jqGrid('filterToolbar', {
							searchOperators: true
						});
					}
				});
				var uifilters = getUiFilters();
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
		submit(function (next) {
			$('.s-t-list').before($(".s-t-page").prop('outerHTML'));
			$('#tabs>div:first').append($(".s-t-page").prop('outerHTML'));
			sortByIndicator(desc);
			$("#tabs").tabs("option", "active", 1);

			if (settings.isDetailPage) {
				$("#tabs").tabs("option", "disabled", [0]);
			}

			$('#filterdialog').dialog({
				'width': '700'
			});
			$('#filterdialog').parent().scrollFix();
			$('#filterdialog').dialog("open");
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
