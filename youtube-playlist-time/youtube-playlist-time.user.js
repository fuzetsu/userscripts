// ==UserScript==
// @name         YouTube Playlist Time
// @namespace    http://www.fuzetsu.com/WLFT
// @version      1.2.9
// @description  Shows the total time it would take to watch all the videos in a YouTube playlist
// @match        https://www.youtube.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?4
// @copyright    2014+, fuzetsu
// @grant        none
// ==/UserScript==

var SCRIPT_NAME = 'YouTube Playlist Time';
var HOLDER_SELECTOR = '.pl-header-content > ul';
var TIMESTAMP_SELECTOR = '.timestamp';
var TIME_CLASS = 'us-total-time';

var util = {
  log: function() {
    var args = [].slice.call(arguments);
    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
    console.log.apply(console, args);
  },
  q: function(query, context) {
    return (context || document).querySelector(query);
  },
  qq: function(query, context) {
    return [].slice.call((context || document).querySelectorAll(query));
  },
  bindEvt: function(target, events) {
    events.forEach(function(evt) {
      target.addEventListener(evt[0], evt[1]);
    });
  },
  unbindEvt: function(target, events) {
    events.forEach(function(evt) {
      target.removeEventListener(evt[0], evt[1]);
    });
  },
  throttle: function(callback, limit) {
    var wait = false;
    return function() {
      if (!wait) {
        callback.apply(this, arguments);
        wait = true;
        setTimeout(function() {
          wait = false;
        }, limit);
      }
    };
  }
};

// converts a timestring to seconds
var calcTimeString = function(str) {
  return str.split(':').reverse().reduce(function(last, cur, idx) {
    cur = parseInt(cur, 10);
    switch (idx) {
      case 0: // seconds
        return last + cur;
      case 1: // minutes
        return last + cur * 60;
      case 2: // hours
        return last + cur * 60 * 60;
      default:
        return 0;
    }
  }, 0);
};

// pads an integer with zeroes
var padTime = function(time) {
  return ("0" + time).slice(-2);
};

// calculates the total amount of time necessary to watch all the videos in the playlist and outputs the result
var setTime = function(seconds) {
  var loc = getTimeLoc();
  var hours = Math.floor(seconds / 60 / 60);
  seconds = seconds % (60 * 60);
  var minutes = Math.floor(seconds / 60);
  seconds = seconds % 60;
  loc.innerHTML = (((hours || '') && hours + ' hours ') + ((minutes || '') && minutes + ' minutes ') + ((seconds || '') && seconds + ' seconds')).trim();
};

var getTimeLoc = function() {
  var loc = util.q('.' + TIME_CLASS);
  if (!loc) {
    loc = util.q(HOLDER_SELECTOR).appendChild(document.createElement('li'));
    loc.className = TIME_CLASS;
  }
  return loc;
};

var timeLocExists = function() {
  return !!util.q('.' + TIME_CLASS);
};

var lastLength = 0;
var calcTotalTime = function(force) {
  var timestamps = util.qq(TIMESTAMP_SELECTOR);
  if (!force && timestamps.length === lastLength && timeLocExists()) return;
  lastLength = timestamps.length;
  var totalSeconds = timestamps.reduce(function(total, ts) {
    return total + calcTimeString(ts.textContent.trim());
  }, 0);
  setTime(totalSeconds);
};

var events = [
  ['mousemove', util.throttle(calcTotalTime.bind(null, false), 500)]
];

util.log('Started, waiting for playlist');

waitForUrl(/^https:\/\/www\.youtube\.com\/playlist\?list=.+/, function() {
  var playlistUrl = location.href;
  var urlWaitId;
  var seconds = 0;
  util.log('Reached playlist, waiting for display area to load');
  waitForElems(HOLDER_SELECTOR, function(holder) {
    util.log('display area loaded, calculating time.');
    util.bindEvt(window, events);
    calcTotalTime(true);
    urlWaitId = waitForUrl(function(url) {
      return url !== playlistUrl;
    }, function() {
      util.log('Leaving playlist, removing listeners');
      util.unbindEvt(window, events);
    }, true);
  }, true);
});
