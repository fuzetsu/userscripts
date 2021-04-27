// ==UserScript==
// @name        Auto Close YouTube Ads
// @version     1.4.1
// @author      fuzetsu
// @description Close and/or Mute YouTube ads automatically!
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*.youtube.com/*
// @namespace   http://fuzetsu.acypa.com
// @exclude     *://*.youtube.com/subscribe_embed?*
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_deleteValue
// @grant       GM_registerMenuCommand
// @require     https://gitcdn.xyz/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require     https://gitcdn.xyz/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


// ==UserScript==
// @name         Auto Close YouTube Ads
// @namespace    http://fuzetsu.acypa.com
// @version      1.4.1
// @description  Close and/or Mute YouTube ads automatically!
// @author       fuzetsu
// @match        *://*.youtube.com/*
// @exclude      *://*.youtube.com/subscribe_embed?*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @require      https://gitcdn.xyz/repo/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require      https://gitcdn.xyz/repo/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// ==/UserScript==

/* globals GM_getValue GM_setValue GM_deleteValue GM_registerMenuCommand GM_config waitForElems waitForUrl */

/**
 * This section of the code holds the css selectors that point different parts of YouTube's
 * user interface. If the script ever breaks and you don't want to wait for me to fix it
 * chances are that it can be fixed by just updating these selectors here.
 */
var CSS = {
  // the button used to skip an ad
  skipButton: '.videoAdUiSkipButton,.ytp-ad-skip-button',
  // the area showing the countdown to the skip button showing
  preSkipButton: '.videoAdUiPreSkipButton,.ytp-ad-preview-container',
  // little x that closes banner ads
  closeBannerAd: '.close-padding.contains-svg,a.close-button,.ytp-ad-overlay-close-button',
  // button that toggle mute on the video
  muteButton: '.ytp-mute-button',
  // the slider bar handle that represents the current volume
  muteIndicator: '.ytp-volume-slider-handle',
  // container for ad on video
  adArea: '.videoAdUi,.ytp-ad-player-overlay',
  // container that shows ad length eg 3:23
  adLength: '.videoAdUiAttribution,.ytp-ad-duration-remaining',
  // container for header ad on the home page
  homeAdContainer: '#masthead-ad'
},
    util = {
  log: function log() {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return console.log("%c".concat(SCRIPT_NAME, ":"), 'font-weight: bold;color: purple;', ...args);
  },
  clearTicks: function clearTicks(ticks) {
    ticks.forEach(function (tick) {
      return !tick ? null : typeof tick === 'number' ? clearInterval(tick) : tick.stop();
    });
    ticks.length = 0;
  },
  keepTrying: function keepTrying(wait, action) {
    var tick = setInterval(function () {
      return action() && clearInterval(tick);
    }, wait);
    return tick;
  },
  storeGet: function storeGet(key) {
    if (typeof GM_getValue === 'undefined') {
      var value = localStorage.getItem(key);
      return value === 'true' ? true : value === 'false' ? false : value;
    }

    return GM_getValue(key);
  },
  storeSet: function storeSet(key, value) {
    return typeof GM_setValue === 'undefined' ? localStorage.setItem(key, value) : GM_setValue(key, value);
  },
  storeDel: function storeDel(key) {
    return typeof GM_deleteValue === 'undefined' ? localStorage.removeItem(key) : GM_deleteValue(key);
  },
  q: function q(query, context) {
    return (context || document).querySelector(query);
  },
  qq: function qq(query, context) {
    return Array.from((context || document).querySelectorAll(query));
  },
  get: function get(obj, str) {
    return util.getPath(obj, str.split('.').reverse());
  },
  getPath: function getPath(obj, path) {
    return obj == null ? null : path.length > 0 ? util.getPath(obj[path.pop()], path) : obj;
  }
},
    SCRIPT_NAME = 'Auto Close YouTube Ads',
    SHORT_AD_MSG_LENGTH = 12e3,
    TICKS = [],
    DONT_SKIP = false,
    config = GM_config([{
  key: 'muteAd',
  label: 'Mute ads?',
  type: 'bool',
  "default": true
}, {
  key: 'hideAd',
  label: 'Hide video ads?',
  type: 'bool',
  "default": false
}, {
  key: 'secWaitBanner',
  label: 'Banner ad close delay (seconds)',
  type: 'number',
  "default": 3,
  min: 0
}, {
  key: 'secWaitVideo',
  label: 'Video ad skip delay (seconds)',
  type: 'number',
  "default": 3,
  min: 0
}, {
  key: 'minAdLengthForSkip',
  label: 'Dont skip video shorter than this (seconds)',
  type: 'number',
  "default": 0,
  min: 0
}, {
  key: 'muteEvenIfNotSkipping',
  label: 'Mute video even if not skipping',
  type: 'bool',
  "default": true
}, {
  key: 'debug',
  label: 'Show extra debug information.',
  type: 'bool',
  "default": false
}, {
  key: 'version',
  type: 'hidden',
  "default": 1
}]),
    configVersion = 2,
    conf = config.load();

config.onsave = function (cfg) {
  return conf = cfg;
}; // config upgrade procedure


function upgradeConfig() {
  var lastVersion;

  while (conf.version < configVersion && lastVersion !== conf.version) {
    util.log('upgrading config version, current = ', conf.version, ', target = ', configVersion);
    lastVersion = conf.version;

    switch (conf.version) {
      case 1:
        {
          var oldConf = {
            muteAd: util.storeGet('MUTE_AD'),
            hideAd: util.storeGet('HIDE_AD'),
            secWait: util.storeGet('SEC_WAIT')
          };
          if (oldConf.muteAd != null) conf.muteAd = !!oldConf.muteAd;
          if (oldConf.hideAd != null) conf.hideAd = !!oldConf.hideAd;
          if (oldConf.secWait != null && !isNaN(oldConf.secWait)) conf.secWaitBanner = conf.secWaitVideo = parseInt(oldConf.secWait);
          conf.version = 2;
          config.save(conf);
          ['SEC_WAIT', 'HIDE_AD', 'MUTE_AD'].forEach(util.storeDel);
          break;
        }
    }
  }
}

upgradeConfig();

function createMessageElement() {
  var elem = document.createElement('div');
  elem.setAttribute('style', 'border: 1px solid white;border-right: none;background: rgb(0,0,0,0.75);color:white;position: absolute;right: 0;z-index: 1000;top: 10px;padding: 10px;padding-right: 20px;cursor: pointer;pointer-events: all;');
  return elem;
}

function showMessage(container, text, ms) {
  var message = createMessageElement();
  message.textContent = text;
  container.appendChild(message);
  util.log("showing message [".concat(ms, "ms]: ").concat(text));
  setTimeout(function () {
    return message.remove();
  }, ms);
}

function setupCancelDiv(ad) {
  var skipArea = util.q(CSS.preSkipButton, ad),
      skipText = skipArea && skipArea.textContent.trim().replace(/\s+/g, ' ');

  if (skipText && !['will begin', 'will play'].some(function (snip) {
    return skipText.includes(snip);
  })) {
    var cancelClass = 'acya-cancel-skip',
        cancelDiv = util.q('.' + cancelClass);
    if (cancelDiv) cancelDiv.remove();
    cancelDiv = createMessageElement();
    cancelDiv.className = cancelClass;
    cancelDiv.textContent = (conf.muteAd ? 'Un-mute & ' : '') + 'Cancel Auto Skip';

    cancelDiv.onclick = function () {
      util.log('cancel clicked');
      DONT_SKIP = true;
      cancelDiv.remove();
      var muteButton = getMuteButton(),
          muteIndicator = getMuteIndicator();
      if (conf.muteAd && muteButton && muteIndicator && isMuted(muteIndicator)) muteButton.click();
    };

    ad.appendChild(cancelDiv);
  } else {
    util.log("skip button area wasn't there for some reason.. couldn't place cancel button.");
  }
}

function parseTime(str) {
  var [minutes, seconds] = str.split(' ').pop().split(':').map(function (num) {
    return parseInt(num);
  });
  util.log(str, minutes, seconds);
  return minutes * 60 + seconds || 0;
}

var getMuteButton = function getMuteButton() {
  return util.q(CSS.muteButton);
},
    getMuteIndicator = function getMuteIndicator() {
  return util.q(CSS.muteIndicator);
},
    isMuted = function isMuted(m) {
  return m.style.left === '0px';
};

function getAdLength(ad) {
  if (!ad) return 0;
  var time = ad.querySelector(CSS.adLength);
  return time ? parseTime(time.textContent) : 0;
}

function waitForAds() {
  DONT_SKIP = false;
  TICKS.push(waitForElems({
    sel: CSS.skipButton,
    onmatch: function onmatch(btn) {
      util.log('found skip button');
      util.keepTrying(500, function () {
        if (!btn) return true; // if not visible

        if (btn.offsetParent === null) return;
        setTimeout(function () {
          if (DONT_SKIP) {
            util.log('not skipping...');
            DONT_SKIP = false;
            return;
          }

          util.log('clicking skip button');
          btn.click();
        }, conf.secWaitVideo * 1e3);
        return true;
      });
    }
  }), waitAndClick(CSS.closeBannerAd, conf.secWaitBanner * 1e3), waitForElems({
    sel: CSS.adArea,
    onmatch: function onmatch(ad) {
      // reset don't skip
      DONT_SKIP = false;

      var adLength = getAdLength(ad),
          isShort = adLength < conf.minAdLengthForSkip,
          debug = function debug() {
        return conf.debug ? "[DEBUG adLength = ".concat(adLength, ", minAdLengthForSkip = ").concat(conf.minAdLengthForSkip, "]") : '';
      };

      if (isShort && !conf.muteEvenIfNotSkipping) {
        DONT_SKIP = true;
        return showMessage(ad, "Shot AD detected, will not skip or mute. ".concat(debug()), SHORT_AD_MSG_LENGTH);
      }

      if (conf.hideAd) {
        ad.style.zIndex = 10;
        ad.style.background = 'black';
      } // show option to cancel automatic skip


      if (!isShort) setupCancelDiv(ad);
      if (!conf.muteAd) return;
      var muteButton = getMuteButton(),
          muteIndicator = getMuteIndicator();
      if (!muteIndicator) return util.log('unable to determine mute state, skipping mute');
      muteButton.click();
      util.log('Video ad detected, muting audio'); // wait for the ad to disappear before unmuting

      util.keepTrying(250, function () {
        if (!util.q(CSS.adArea)) {
          if (isMuted(muteIndicator)) {
            muteButton.click();
            util.log('Video ad ended, unmuting audio');
          } else {
            util.log('Video ad ended, audio already unmuted');
          }

          return true;
        }
      });

      if (isShort) {
        DONT_SKIP = true;
        return showMessage(ad, "Short AD detected, will not skip but will mute. ".concat(debug()), SHORT_AD_MSG_LENGTH);
      }
    }
  }));
}

var waitAndClick = function waitAndClick(sel, ms, cb) {
  return waitForElems({
    sel: sel,
    onmatch: function onmatch(btn) {
      util.log('Found ad, closing in', ms, 'ms');
      setTimeout(function () {
        btn.click();
        if (cb) cb(btn);
      }, ms);
    }
  });
};

util.log('Started');

if (window.self === window.top) {
  var videoUrl; // close home ad whenever encountered

  waitForElems({
    sel: CSS.homeAdContainer,
    onmatch: function onmatch(ad) {
      return ad.remove();
    }
  }); // wait for video page

  waitForUrl(/^https:\/\/www\.youtube\.com\/watch\?.*v=.+/, function () {
    if (videoUrl && location.href !== videoUrl) {
      util.log('Changed video, removing old wait');
      util.clearTicks(TICKS);
    }

    videoUrl = location.href;
    util.log('Entered video, waiting for ads');
    waitForAds();
    TICKS.push(waitForUrl(function (url) {
      return url !== videoUrl;
    }, function () {
      videoUrl = null;
      util.clearTicks(TICKS);
      util.log('Left video, stopped waiting for ads');
    }, true));
  });
} else {
  if (/^https:\/\/www\.youtube\.com\/embed\//.test(location.href)) {
    util.log('Found embedded video, waiting for ads');
    waitForAds();
  }
}

GM_registerMenuCommand('Auto Close Youtube Ads - Manage Settings', config.setup);
/******/ })()
;