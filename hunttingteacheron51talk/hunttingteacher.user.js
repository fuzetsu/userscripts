// ==UserScript==
// @name         51talk选择最好最合适的老师-经验|好评率|年龄|收藏数
// @version      1.0.19
// @namespace    https://github.com/niubilityfrontend
// @description  辅助选老师-排序显示，经验值计算|好评率|显示年龄|列表显示所有教师
// @author       jimbo
// @license      OSL-3.0
// @supportURL   https://github.com/niubilityfrontend/hunttingteacheron51talk
// @match        *://www.51talk.com/ReserveNew/index*
// @match        *://www.51talk.com/TeacherNew/*
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
	Pace.Options = {
		ajax: false, // disabled
		document: false, // disabled
		eventLag: false, // disabled
		elements: {
			selectors: ['#filterdialog']
		}
	};
	$("head").append(
		'<link ' +
		'href="https://code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css" ' +
		'rel="stylesheet" type="text/css">'
	);
	$("head").append(
		'<link ' +
		'href="https://cdnjs.cloudflare.com/ajax/libs/free-jqgrid/4.15.5/css/ui.jqgrid.min.css" ' +
		'rel="stylesheet" type="text/css">'
	);

	$("head").append('<style type="text/css">' +
		'.search-teachers .s-t-list .item-time-list {margin-top:315px;}' +
		'.search-teachers .s-t-list .item {   height: 679px; }' +
		'.search-teachers .s-t-list .s-t-content { margin-right: 0px;}' +
		'.search-teachers { width: 100%; }' +
		'.search-teachers .s-t-list .item .item-top .teacher-name {line-height: 15px;}' +
		'.search-teachers .s-t-list .item { height: auto;  margin-right: 5px; margin-bottom: 5px; }' +
		'.pace {' +
		'  -webkit-pointer-events: none;' +
		'  pointer-events: none;' +
		'  -webkit-user-select: none;' +
		'  -moz-user-select: none;' +
		'  user-select: none;' +
		'}' +
		'.pace-inactive {' +
		'  display: none;' +
		'}' +
		'.ui-tabs .ui-tabs-panel{padding:.5em 0.2em;}' +
		'.ui-dialog .ui-dialog-content { padding: .5em 0.2em;}' +
		'.pace .pace-progress {' +
		'  background: #29d;' +
		'  position: fixed;' +
		'  z-index: 2000;' +
		'  top: 0;' +
		'  right: 100%;' +
		'  width: 100%;' +
		'  height: 2px;' +
		'}' +
		'.search-teachers .s-t-top .s-t-days .s-t-days-list li {' +
		' float: left;' +
		' width: 118px;' +
		' height: 34px;' +
		' line-height: 34px;' +
		' margin-right: 5px;' +
		' margin-bottom: 5px;' +
		'}' +
		'.search-teachers .s-t-top .s-t-top-details {' +
		' padding: 2px 0 2px 30px;' +
		'}' +
		'.search-teachers .s-t-top .s-t-top-right {' +
		' height: auto;' +
		'}' +
		'.search-teachers .s-t-top .s-t-top-left .condition-item {' +
		' margin-bottom: 2px;' +
		'}' +
		'.s-t-page {   padding-top: 2px;}' +
		'</style>');

	const config = GM_config([{
			key: 'pagecount',
			label: '自动获取页数',
			default: 10,
			type: 'dropdown',
			values: [0, 5, 10, 20, 50]
		},
		{
			key: 'batchtimezoneMinutes',
			label: '预定耗费时间（分钟）',
			default: 60,
			type: 'dropdown',
			values: [5, 10, 20, 30, 50, 60, 90, 120]
		},
		{
			key: 'version',
			type: 'hidden',
			default: 1
		}
	]);
	let conf = config.load();
	config.onsave = cfg => {
		conf = cfg;
		$('#auotonextpage').text('自动获取' + conf.pagecount + "页");
	};
	GM_registerMenuCommand('配置', config.setup);

	function sleep(delay) {
		var start = (new Date()).getTime();
		while ((new Date()).getTime() - start < delay) {
			continue;
		}
	}
	//删除数组中的空元素
	Array.prototype.clean = function(deleteValue = "") {
		for (var i = 0; i < this.length; i++) {
			if (this[i] == deleteValue) {
				this.splice(i, 1);
				i--;
			}
		}
		return this;
	};
	Number.prototype.toString = function() {
		return this.toFixed(2);
	};
	String.prototype.toFloat = function() {
		return parseFloat(this);
	};
	String.prototype.toInt = function() {
		return parseInt(this);
	};
	String.prototype.startsWith = function(str) {
		return this.slice(0, str.length) == str;
	};
	String.prototype.endsWith = function(str) {
		return this.slice(-str.length) == str;
	};
	String.prototype.contains = function(str) {
		return this.indexOf(str) > -1;
	};
	String.prototype.replaceAll = function(search, replacement) {
		var target = this;
		return target.replace(new RegExp(search, 'g'), replacement);
	};

	$(".item-top-cont").prop('innerHTML', function(i, val) {
		return val.replaceAll('<!--', '').replaceAll('-->', '');
	});

	var asc = function(a, b) {
		var av = $(a).attr('indicator');
		var bv = $(b).attr('indicator');
		if (!av || !bv) return 0;
		return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? 1 : -1;
	};

	var desc = function(a, b) {
		var av = $(a).attr('indicator');
		var bv = $(b).attr('indicator');
		if (!av || !bv) return 0;
		return $(a).attr('indicator').toFloat() > $(b).attr('indicator').toFloat() ? -1 : 1;
	};

	var sortByIndicator = function(sortBy) {
		var sortEle = $('.s-t-content.f-cb .item').sort(sortBy);
		$('.s-t-content.f-cb').empty().append(sortEle);
	};
	/**
	 * 提交运算函数到 document 的 fx 队列
	 */
	var submit = function(fun) {
		var queue = $.queue(document, "fx", fun);
		if (queue[0] == 'inprogress') {
			return;
		}
		$.dequeue(document);
	};

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
		if (tinfo.age > maxage) maxage = tinfo.age;
		if (tinfo.age < minage) minage = tinfo.age;
		jqel.attr("teacherinfo", JSON.stringify(tinfo));
		jqel.find(".teacher-name")
			.html(jqel.find(".teacher-name").text() + "<br />[" + tinfo.label + "|" + tinfo.thumbupRate + "%|" + tinfo.favoritesCount +
				"]");
		jqel.find(".teacher-age")
			.html(jqel.find(".teacher-age").text() + " | <label title='排序指标'>" + tinfo.indicator + "</label>");
		jqel //.attr('thumbup', tinfo.thumbup)
			//.attr('thumbdown', tinfo.thumbdown)
			//.attr('thumbupRate', tinfo.thumbupRate)
			//.attr('age', tinfo.age)
			//.attr('label', tinfo.label)
			.attr('indicator', tinfo.indicator);
	}

	function executeFilters(uifilters) {
		let tcount = 0,
			hidecount = 0;
		$.each($('.item'), function(i, item) {
			var node = $(item);
			var tinfojson = node.attr("teacherinfo");
			if (!tinfojson) {
				return true;
			}
			var tinfo = JSON.parse(tinfojson);
			if ((tinfo.thumbupRate >= uifilters.rate1 && tinfo.thumbupRate <= uifilters.rate2) &&
				tinfo.label >= uifilters.l1 && tinfo.label <= uifilters.l2 &&
				tinfo.age >= uifilters.age1 && tinfo.age <= uifilters.age2 &&
				tinfo.favoritesCount >= uifilters.fc1 && tinfo.favoritesCount <= uifilters.fc2) {
				if (node.is(':hidden')) { //如果node是隐藏的则显示node元素，否则隐藏
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

	let configExprMilliseconds = 3600000 * GM_getValue('tinfoexprhours', 24); //缓存7天小时
	let num = /[0-9]*/g;

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

	function gettid() {
		//https://www.51talk.com/TeacherNew/info/t26501111
		//https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=all&has_msg=1
		//https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=good&has_msg=1
		//https://www.51talk.com/TeacherNew/teacherComment?tid=t26501111&type=bad&has_msg=1
		return window.location.href.match(/(t\d+)/g);
	}

	function getinfokey() {
		return 'tinfo-' + gettid();
	}

	function processTeacherDetailPage(jqr) {
		jqr.find('.teacher-name-tit').prop('innerHTML', function(i, val) {
			return val.replaceAll('<!--', '').replaceAll('-->', '');
		});
		var tinfo = GM_getValue(getinfokey(), {});
		tinfo.label = (function() {
			let l = 0;
			$.each(jqr.find(".t-d-label").text().match(num).clean(""), function(i, val) {
				l += Number(val);
			});
			l = Math.ceil(l / 5);
			return l;
		})();
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

	}

	if (window.location.href.toLocaleLowerCase().contains("teachernew")) {
		processTeacherDetailPage($(document));
	}

	$(".item").each(function(index, el) {
		submit(function(next) {
			Pace.track(function() {
				let jqel = $(el);
				let tid = jqel.find(".teacher-details-link a").attr('href').replace(
					"https://www.51talk.com/TeacherNew/info/", "").replace('http://www.51talk.com/TeacherNew/info/', '');
				var tinfokey = 'tinfo-' + tid;
				var tinfo = GM_getValue(tinfokey);
				if (tinfo) {
					var now = new Date().getTime();
					if (!tinfo.expire) {
						tinfo.expire = new Date(1970, 1, 1).getTime();
					}
					tinfo.effectivetime = (now / 1000 / 60 / conf.batchtimezoneMinutes).toFixed(0);
					GM_setValue(tinfokey, tinfo);
					if (now - tinfo.expire < configExprMilliseconds) {
						updateTeacherinfoToUI(jqel, tinfo);
						next();
						return true;
					}
				}
				// ajax 请求一定要包含在一个函数中
				var start = (new Date()).getTime();

				$.ajax({
					url: window.location.protocol + '//www.51talk.com/TeacherNew/teacherComment?tid=' + tid +
						'&type=bad&has_msg=1',
					type: 'GET',
					dateType: 'html',
					success: function(r) {
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
							var age = Number(jqel.find(".teacher-age").text().match(num).clean("")[0]);
							var label = (function() {
								let j_len = jqel.find(".label").text().match(num).clean("").length;
								let l = 0;
								for (let j = 0; j < j_len; j++) {
									l += Number(jqel.find(".label").text().match(num).clean("")[j]);
								}
								l = Math.ceil(l / 5);
								return l;
							})();
							var isfavorite = jqr.find(".go-search.cancel-collection").length > 0;
							var name = jqel.find(".teacher-name").text();
							var type = $('.s-t-top-list .li-active').text();
							var tage = Number(jqr.find(".teacher-name-tit > .age.age-line").text().match(num).clean("")[0]);
							var slevel = jqr.find('.sui-students').text();
							var tinfo = {
								'slevel': slevel,
								'tage': tage,
								'thumbup': thumbup,
								'thumbdown': thumbdown,
								'thumbupRate': thumbupRate,
								'age': age,
								'label': label,
								'indicator': Math.ceil(label * thumbupRate / 100) + favoritesCount,
								'favoritesCount': favoritesCount,
								'name': name,

								'isfavorite': isfavorite,
								'expire': new Date().getTime(),
								'effectivetime': (new Date().getTime() / 1000 / 60 / conf.batchtimezoneMinutes).toFixed(0)
							};
							if (type != '收藏外教') {
								tinfo.type = type;
							} else {
								//tinfo.type=type
								tinfo.isfavorite = true;
							}
							GM_setValue(tinfokey, tinfo);
							updateTeacherinfoToUI(jqel, tinfo);
						} else {
							console.log('Teacher s detail info getting error:' + JSON.stringify(jqel) + ",error info:" + r);
						}
					},
					error: function(data) {
						console.log("xhr error when getting teacher " + JSON.stringify(jqel) + ",error msg:" + JSON.stringify(
							data));
					}
				}).always(function() {
					while ((new Date()).getTime() - start < 600) {
						continue;
					}
					next();
				});

			});
		});
	});

	submit(function(next) {
		var autonextpage = GM_getValue('autonextpage', 0);
		if (autonextpage > 0) {
			GM_setValue('autonextpage', autonextpage - 1);
			if ($('.s-t-page .next-page').length == 0) {
				GM_setValue('autonextpage', 0);
			} else {
				$('.s-t-page .next-page')[0].click();
				return false;
			}
		}
		try {
			var config = GM_getValue('filterconfig', {
				l1: 300,
				l2: maxlabel,
				rate1: 97,
				rate2: maxrate,
				age1: minage,
				age2: maxage
			});
			$('body').append("<div id='filterdialog' title='Teacher Filter'>" +
				"<div id='tabs'>" +
				"<ul>" +
				'<li><a href="#tabs-1">Search Teachers</a></li>' +
				'<li><a href="#tabs-2">Sorted Teachers</a></li>' +
				'</ul>' +
				"<br /><div id='buttons'>" +
				"<button id='asc' title='当前为降序，点击后按升序排列'>升序</button><button id='desc' title='当前为升序，点击进行降序排列'  style='display:none;'>降序</button>&nbsp;<input id='tinfoexprhours' title='缓存过期时间（小时）'>&nbsp;<button title='清空教师信息缓存，并重新搜索'>清除缓存</button>&nbsp;<a>去提建议和BUG</a>&nbsp;<a>?</a>&nbsp;<button id='auotonextpage'>自动获取" +
				conf.pagecount + "页</button>&nbsp;" +
				"</div>" +
				'<div id="tabs-1">' +
				"当前可选<span id='tcount' />位,被折叠<span id='thidecount' />位。 " +

				"<br />有效经验值 <span id='_tLabelCount' /><br /><div id='tlabelslider'></div>" +
				"收藏数 <span id='_tfc' /><br /><div id='fcSlider'></div>" +
				"好评率 <span id='_thumbupRate'/><br /><div id='thumbupRateslider'></div>" +
				"年龄 <span id='_tAge' /><br /><div id='tAgeSlider'></div>" +
				'</div>' // tab 1 end
				+
				'<div id="tabs-2">' +
				'<table id="teachertab"></table>' +
				'<div id="pager5"></div>' +
				'</div>' //tab 2 end
				+
				"</div>" //tabs end

				+
				"</div>");
			$('body').append("<div id='teachlistdialog' style='display:none;'></div>");
			$('body').append("<div id='wwwww'>已加载选课辅助插件。</div>"); //这是一个奇怪的BUG on jqueryui. 如果不多额外添加一个，则dialog无法弹出。
			$("#tlabelslider").slider({
				range: true,
				min: minlabel - 1,
				max: maxlabel,
				values: [config.l1 < minlabel - 1 ? minlabel - 1 : config.l1, maxlabel],
				slide: function(event, ui) {
					$('#_tLabelCount').html(ui.values[0] + " - " + ui.values[1]);
				},
			}).on('slidestop', function(event, ui) {
				var l1 = $("#tlabelslider").slider('values', 0);
				var l2 = $("#tlabelslider").slider('values', 1);
				var uifilters = getUiFilters();
				var filterconfig = GM_getValue('filterconfig', uifilters);
				filterconfig.l1 = l1;
				filterconfig.l2 = l2;
				GM_setValue('filterconfig', filterconfig);
				executeFilters(uifilters);
			});
			// { //配置信息兼容处理 0.1.25 增加收藏次数
			// 	var filterconfig = GM_getValue('filterconfig');
			// 	if (filterconfig && (!filterconfig.fc1 || !filterconfig.fc2)) {
			// 		filterconfig.fc1 = minfc;
			// 		filterconfig.fc2 = maxfc;
			// 		GM_setValue('filterconfig', filterconfig);
			// 	}
			// }
			$("#fcSlider").slider({
				range: true,
				min: minfc,
				max: maxfc,
				values: [config.fc1 < minfc ? minfc : config.fc1, maxfc],
				slide: function(event, ui) {
					$('#_tfc').html(ui.values[0] + " - " + ui.values[1]);
				},
			}).on('slidestop', function(event, ui) {
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
				slide: function(event, ui) {
					$('#_thumbupRate').html(ui.values[0] + "% - " + ui.values[1] + '%');
				},
			}).on('slidestop', function(event, ui) {
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
				slide: function(event, ui) {
					$('#_tAge').html(ui.values[0] + " - " + ui.values[1]);
				},
			}).on("slidestop", function(event, ui) {
				var age1 = $("#tAgeSlider").slider('values', 0);
				var age2 = $("#tAgeSlider").slider('values', 1);
				var uifilters = getUiFilters();
				var filterconfig = GM_getValue('filterconfig', uifilters);
				filterconfig.age1 = age1;
				filterconfig.age2 = age2;
				GM_setValue('filterconfig', filterconfig);
				executeFilters(uifilters);
			});

			$('#buttons button,#buttons input,#buttons a').eq(0).button({
					icon: 'ui-icon-arrowthick-1-n',
					showLabel: false
				}) //升序
				.click(function() {
					$('#desc').show();
					$(this).hide();
					sortByIndicator(asc);
				}).end().eq(1).button({
					icon: 'ui-icon-arrowthick-1-s',
					showLabel: false
				}) //降序
				.click(function() {
					$('#asc').show();
					$(this).hide();
					sortByIndicator(desc);
				}).end().eq(2).spinner({
					min: 0,
					spin: function(event, ui) {
						GM_setValue('tinfoexprhours', ui.value)
					}
				}) // 缓存过期时间（小时）
				.css({
					width: '20px'
				})
				.val(GM_getValue('tinfoexprhours', configExprMilliseconds / 3600000))
				.end().eq(3).button({
					icon: 'ui-icon-trash',
					showLabel: false
				}) //清空缓存
				.click(function() {
					$.each(GM_listValues(), function(i, item) {
						if (item.startsWith('tinfo-')) {
							GM_deleteValue(item);
						}
					});
					$('.go-search').click();
				}).end().eq(4).button({
					icon: 'ui-icon-comment',
					showLabel: false
				}) //submit suggestion
				.prop('href',
					'https://github.com/niubilityfrontend/userscripts/issues/new?assignees=&labels=&template=feature_request.md&title='
				)
				.prop('target', '_blank')
				.end().eq(5).button({
					icon: 'ui-icon-help',
					showLabel: false
				}) //系统帮助
				.prop('href',
					'https://raw.githubusercontent.com/niubilityfrontend/userscripts/master/hunttingteacheron51talk/README.md')
				.prop('target', '_blank')
				.end().eq(6).button({
					icon: 'ui-icon-seek-next',
					showLabel: true
				}) //submit suggestion
				.click(function() {
					GM_setValue('autonextpage', conf.pagecount);
					if ($('.s-t-page .next-page').length == 0) {
						GM_setValue('autonextpage', 0);
					} else {
						$('.s-t-page .next-page')[0].click();
					}
				});

			$("#tabs").tabs({
				active: '#tabs-2',
				activate: function(event, ui) {
					var teachers = [];
					$.each(GM_listValues(), function(i, item) {
						if (item.startsWith('tinfo-')) {
							var t = GM_getValue(item);
							t.tid = item.slice(6, item.length);
							teachers.push(t);
						}
					});
					teachers = teachers.sort(function(t1, t2) {
						if (t1.indicator == t2.indicator)
							return t1.favoritesCount > t2.favoritesCount;
						return t1.indicator > t2.indicator;
					});

					var jqtable = $("#teachertab");
					jqtable.jqGrid({
						data: teachers,
						datatype: "local",
						height: 240,
						//{ 'thumbup': thumbup, 'thumbdown': thumbdown, 'thumbupRate': thumbupRate, 'age': age, 'label': label, 'indicator': label * thumbupRate, 'favoritesCount': favoritesCount,'name':name }
						colNames: ['类', '爱', '名', '分', '标', '率%', '收藏数', '学', '教龄', '好', '差', '龄',
							'更新', '批号'
						],
						colModel: [
							//searchoptions:{sopt:['eq','ne','le','lt','gt','ge','bw','bn','cn','nc','ew','en']}
							{
								name: 'type',
								index: 'type',
								width: 49,
								sorttype: "string",
								align: 'left',
								searchoptions: {
									sopt: ['cn']
								},
								formatter: function(value, options, rData) {
									if (value)
										return value;
									else return 'na';
								}
							},
							{
								name: 'isfavorite',
								index: 'isfavorite',
								width: 49,
								sorttype: "string",
								align: 'left',
								searchoptions: {
									sopt: ['cn']
								},
								formatter: function(value, options, rData) {
									if (value)
										return '收藏';
									else return '';
								}
							},
							{
								name: 'name',
								index: 'name',
								width: 95,
								sorttype: "string",
								formatter: function(value, options, rData) {
									return "<a href='http://www.51talk.com/TeacherNew/info/" + rData['tid'] +
										"' target='_blank' style='color:blue'>" + (!rData[
											'name'] ? value : rData['name']) + "</a>";
								}
							},
							{
								name: 'indicator',
								index: 'indicator',
								width: 45,
								sorttype: "float",
								align: 'right',
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'label',
								index: 'label',
								width: 50,
								align: 'right',
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'thumbupRate',
								index: 'thumbupRate',
								width: 30,
								align: "right",
								sorttype: "float",
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'favoritesCount',
								index: 'favoritesCount',
								width: 35,
								align: "right",
								sorttype: "float",
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'slevel',
								index: 'slevel',
								width: 55,
								sorttype: "string",
								align: 'left',
								searchoptions: {
									sopt: ['cn', 'nc']
								},
							},
							{
								name: 'tage',
								index: 'tage',
								width: 25,
								sorttype: "float",
								align: 'right',
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'thumbup',
								index: 'thumbup',
								width: 40,
								align: "right",
								sorttype: "float",
								searchoptions: {
									sopt: ['ge']
								},
							},
							{
								name: 'thumbdown',
								index: 'thumbdown',
								width: 25,
								sorttype: "float",
								align: 'right'
							},
							{
								name: 'age',
								index: 'age',
								width: 25,
								sorttype: "float",
								align: 'right',
								searchoptions: {
									sopt: ['le', 'ge', 'eq', ]
								},
							},
							{
								name: 'expire',
								index: 'expire',
								width: 40,
								sorttype: "Date",
								align: 'right',
								searchoptions: {
									sopt: ['cn']
								},
								formatter: function(value, options, rData) {
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
							},
							{
								name: 'effectivetime',
								index: 'effectivetime',
								width: 40,
								sorttype: "Date",
								align: 'right',
								searchoptions: {
									sopt: ['cn']
								},
								formatter: function(value, options, rData) {
									return value;
								}
							},
						],
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
		}
		next();
	});
	submit(function(next) {
		$('.s-t-list').before($(".s-t-page").prop('outerHTML'));
		$('#tabs-1').before($(".s-t-page").prop('outerHTML'));
		sortByIndicator(desc);
		$("#tabs").tabs("option", "active", 1);
		if (window.location.href.toLocaleLowerCase().contains("teachernew")) {
			$("#tabs").tabs("option", "disabled", [0]);
		}
		$('#filterdialog').dialog({
			'width': '650'
		});
		$('#filterdialog').parent().scrollFix();
		$('#filterdialog').dialog("open");
		next();
	});
})();
