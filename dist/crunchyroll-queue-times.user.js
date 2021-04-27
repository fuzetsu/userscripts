// ==UserScript==
// @name        Crunchyroll Queue Real Times
// @version     1.0.4
// @description Display countdown until next episode in the Crunchyroll Queue page
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       http://www.crunchyroll.com/home/queue
// @namespace   http://www.fuzetsu.com/CRRT
// @copyright   2014+, fuzetsu
// @deprecated  true
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


// ==UserScript==
// @name        Crunchyroll Queue Real Times
// @namespace   http://www.fuzetsu.com/CRRT
// @version     1.0.4
// @description Display countdown until next episode in the Crunchyroll Queue page
// @match       http://www.crunchyroll.com/home/queue
// @copyright   2014+, fuzetsu
// @deprecated  true
// ==/UserScript==
var PREMIUM = 'rgb(255, 251, 223)',
    REGULAR = 'rgb(232, 244, 248)',
    COMING_SOON_IMG = 'http://static.ak.crunchyroll.com/i/coming_soon_beta_wide.jpg',
    SECOND = 1e3,
    MINUTE = SECOND * 60,
    HOUR = MINUTE * 60,
    DAY = HOUR * 24,
    CURYEAR = new Date().getFullYear(),
    qq = function qq(q, c) {
  return [].slice.call((c || document).querySelectorAll(q));
},
    storeGet = function storeGet(key) {
  if (typeof GM_getValue === "undefined") {
    var value = localStorage.getItem(key);

    if (value === "true" || value === "false") {
      return value === "true" ? true : false;
    }

    return value;
  }

  return GM_getValue(key);
},
    storeSet = function storeSet(key, value) {
  if (typeof GM_setValue === "undefined") {
    return localStorage.setItem(key, value);
  }

  return GM_setValue(key, value);
},
    storeDel = function storeDel(key) {
  if (typeof GM_deleteValue === "undefined") {
    return localStorage.removeItem(key);
  }

  return GM_deleteValue(key);
},
    findEpByTitle = function findEpByTitle(shows, title) {
  var found;
  shows.some(function (show) {
    if (show.name.indexOf(title) === 0) {
      found = show;
      return true;
    }
  });
  return found;
},
    getTimes = function getTimes(total) {
  var days = Math.floor(total / DAY);
  total -= days * DAY;
  var hours = Math.floor(total / HOUR);
  total -= hours * HOUR;
  var minutes = Math.floor(total / MINUTE);
  total -= minutes * MINUTE;
  var seconds = Math.floor(total / SECOND);
  total -= seconds * SECOND;
  return {
    days: days,
    hours: hours,
    minutes: minutes,
    seconds: seconds,
    isDone: function isDone() {
      return days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0;
    },
    toTimeStr: function toTimeStr() {
      return (this.days > 0 ? this.days + ' days ' : '') + (this.hours > 0 ? this.hours + ' hours ' : '') + (this.minutes > 0 ? this.minutes + ' minutes ' : '') + this.seconds + ' seconds';
    }
  };
},
    insertCountDown = function insertCountDown(loc, ep) {
  var countDown = document.createElement('span'),
      last = Date.now(),
      totalTime = ep.date.valueOf() - last,
      tick = setInterval(function () {
    var times = getTimes(totalTime);

    if (times.isDone()) {
      countDown.innerHTML = '<strong>A new episode has been released! Refresh the page to see it.</strong>';
      return clearInterval(tick);
    }

    countDown.textContent = times.toTimeStr();
    totalTime -= Date.now() - last;
    last = Date.now();
  }, 1e3);
  loc.innerHTML = '';
  loc.appendChild(countDown);
},
    extractDataFromScript = function extractDataFromScript(text) {
  var obj = JSON.parse(text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)),
      dateStr = text.slice(text.lastIndexOf('}') + 4, text.lastIndexOf('"'));
  obj.date = new Date(dateStr.slice(0, -1) + " " + (dateStr.slice(-1) === 'a' ? 'am' : 'pm') + ' ' + CURYEAR);
  return obj;
},
    getLaunchCalendar = function getLaunchCalendar(cb) {
  var xhr = new XMLHttpRequest();
  xhr.open('get', '/launchcalendar', true);
  xhr.responseType = 'document';
  xhr.onload = cb;
  xhr.send();
},
    main = function main(userColor) {
  console.log(userColor);
  getLaunchCalendar(function (evt) {
    var xhr = evt.target,
        animeData = [];
    qq('td > div > script', xhr.response).forEach(function (script) {
      if (script.previousSibling.previousSibling.style.backgroundColor !== userColor) return;
      animeData.push(extractDataFromScript(script.textContent.trim()));
    }); // find first date that is before now

    var now = Date.now();
    animeData = animeData.filter(function (anime) {
      return anime.date.valueOf() >= now;
    }); // add retrieved data to page

    qq('.queue-wrapper').forEach(function (queueItem) {
      if (qq('.episode-img img', queueItem)[0].src !== COMING_SOON_IMG) {
        return;
      }

      var title = qq('.series-title', queueItem)[0].textContent,
          episode = findEpByTitle(animeData, title);

      if (episode) {
        insertCountDown(qq('.short-desc', queueItem)[0], episode);
      }
    });
  });
},
    user_premium = storeGet('CQRT_user_premium');

if (user_premium === undefined) {
  user_premium = true;
} // register menu command


typeof GM_registerMenuCommand === 'function' && GM_registerMenuCommand('CR Queue countdown: show schedule for ' + (user_premium ? 'PREMIUM' : 'REGULAR') + ' users', function () {
  storeSet('CQRT_user_premium', !user_premium);
  window.location.reload();
}); // kick it off

main(user_premium && PREMIUM || REGULAR);
/******/ })()
;