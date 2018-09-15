// ==UserScript==
// @name         Auto Close YouTube Ads
// @namespace    http://fuzetsu.acypa.com
// @version      1.2.0-beta
// @description  Close and/or Mute YouTube ads automatically!
// @author       fuzetsu
// @match        *://*.youtube.com/*
// @exclude      *://*.youtube.com/subscribe_embed?*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_registerMenuCommand
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @require      https://cdn.rawgit.com/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// ==/UserScript==
(function() {
  var util = {
    log: function () {
      var args = [].slice.call(arguments);
      args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: purple;');
      console.log.apply(console, args);
    },
    clearTicks: function(ticks) {
      ticks.forEach(function(tick) {
        if(!tick) return;
        if(typeof tick === 'number') {
          clearInterval(tick);
        } else {
          tick.stop();
        }
      });
      ticks.length = 0;
    },
    keepTrying: function(wait, action) {
      var tick = setInterval(function() {
        if(action()) {
          clearInterval(tick);
        }
      }, wait);
      return tick;
    },
    storeGet: function(key) {
      if (typeof GM_getValue === "undefined") {
        var value = localStorage.getItem(key);
        if (value === "true" || value === "false") {
          return (value === "true") ? true : false;
        }
        return value;
      }
      return GM_getValue(key);
    },
    storeSet: function(key, value) {
      if (typeof GM_setValue === "undefined") {
        return localStorage.setItem(key, value);
      }
      return GM_setValue(key, value);
    },
    storeDel: function(key) {
      if (typeof GM_deleteValue === "undefined") {
        return localStorage.removeItem(key);
      }
      return GM_deleteValue(key);
    },
    q: function(query, context) {
      return (context || document).querySelector(query);
    },
    qq: function(query, context) {
      return [].slice.call((context || document).querySelectorAll(query));
    },
  };

  const SCRIPT_NAME = 'Auto Close YouTube Ads';
  const MUTE_BUTTON_SELECTOR = '.ytp-mute-button';
  const MUTE_INDICATOR_SELECTOR = '.ytp-volume-slider-handle';
  const AD_TIME_SELECTOR = '.videoAdUiAttribution';
  let TICKS = [];
  let DONT_SKIP = false;

  var config = GM_config([{
    key: 'muteAd',
    label: 'Mute ads?',
    type: 'bool',
    default: true,
  }, {
    key: 'hideAd',
    label: 'Hide video ads?',
    type: 'bool',
    default: false,
  }, {
    key: 'secWaitBanner',
    label: 'Banner ad close delay (seconds)',
    type: 'number',
    default: 3,
    min: 0,
  }, {
    key: 'secWaitVideo',
    label: 'Video ad skip delay (seconds)',
    type: 'number',
    default: 3,
    min: 0,
  }, {
    key: 'minAdLengthForSkip',
    label: 'Dont skip video shorter than this (seconds)',
    type: 'number',
    default: 0,
    min: 0,
  }, {
    key: 'muteEvenIfNotSkipping',
    label: 'Mute video even if not skipping',
    type: 'bool',
    default: true,
  }, {
    key: 'version',
    type: 'hidden',
    default: 1
  }]);

  const configVersion = 2;
  let conf = config.load();

  config.onsave = function(cfg) {
    conf = cfg;
  };

  // config upgrade procedure
  (() => {
    let lastVersion;
    while(conf.version < configVersion && lastVersion !== conf.version) {
      util.log('upgrading config version, current = ', conf.version, ', target = ', configVersion);
      lastVersion = conf.version;
      switch(conf.version) {
        case 1:
          let oldConf = {
            muteAd: util.storeGet('MUTE_AD'),
            hideAd: util.storeGet('HIDE_AD'),
            secWait: util.storeGet('SEC_WAIT'),
          };

          if(oldConf.muteAd !== undefined) conf.muteAd = !!oldConf.muteAd;
          if(oldConf.hideAd !== undefined) conf.hideAd = !!oldConf.hideAd;
          if(oldConf.secWait !== undefined && !isNaN(oldConf.secWait)) conf.secWaitBanner = conf.secWaitVideo = parseInt(oldConf.secWait);
          
          conf.version = 2;
          
          config.save(conf);
          ['SEC_WAIT', 'HIDE_AD', 'MUTE_AD'].forEach(util.storeDel);
          break;
      }
    }
  })();

  function setupCancelDiv(ad) {
    var skipArea = util.q('.videoAdUiPreSkipButton', ad);
    if(skipArea != null && skipArea.firstChild && (!skipArea.firstChild.textContent.includes('will begin') && !skipArea.firstChild.textContent.includes('will play'))) {
      var cancelClass = 'acya-cancel-skip';
      var cancelDiv = util.q('.' + cancelClass);
      if(cancelDiv) cancelDiv.remove();
      cancelDiv = document.createElement('div');
      cancelDiv.className = cancelClass;
      cancelDiv.innerHTML = (conf.muteAd ? 'Un-mute & ' : '') + 'Cancel Auto Skip';
      cancelDiv.setAttribute('style', 'border: 1px solid white;border-right: none;background: rgb(0,0,0,0.75);color:white;position: absolute;right: 0;z-index: 1000;top: 10px;padding: 10px;padding-right: 20px;cursor: pointer;pointer-events: all;');
      cancelDiv.onclick = function(e) {
        util.log('cancel clicked');
        DONT_SKIP = true;
        cancelDiv.remove();
        var muteButton = getMuteButton();
        var muteIndicator = getMuteIndicator();
        if(conf.muteAd && muteButton && muteIndicator && isMuted(muteIndicator)) muteButton.click();
      };
      ad.appendChild(cancelDiv);
    } else {
      util.log('skip button area wasn\'t there for some reason.. couldn\'t place cancel button.');
    }
  }
  
  function parseTime(str) {
    const [minutes, seconds] = str.split(' ').pop().split(':').map(num => parseInt(num));
    util.log(str, minutes, seconds);
    return (minutes * 60 + seconds) || 0;
  }

  function getMuteButton() {
    return util.q(MUTE_BUTTON_SELECTOR);
  }

  function getMuteIndicator() {
    return util.q(MUTE_INDICATOR_SELECTOR);
  }
  
  function getAdLength(ad) {
    if(!ad) return 0;
    const time = ad.querySelector(AD_TIME_SELECTOR);
    return time ? parseTime(time.textContent) : 0;
  }

  function isMuted(m) {
    return m.style.left === '0px';
  }

  function waitForAds() {
    DONT_SKIP = false;
    TICKS.push(
      waitForElems({
        sel: '.videoAdUiSkipButton',
        onmatch: function(btn) {
          util.log('found skip button');
          util.keepTrying(500, function() {
            if(!btn) return true;
            // if not visible
            if(btn.offsetParent === null) return;
            setTimeout(function() {
              if(DONT_SKIP) {
                util.log('not skipping...');
                DONT_SKIP = false;
                return;
              }
              util.log('clicking skip button');
              btn.click();
            }, conf.secWaitVideo * 1000);
            return true;
          });
        }
      }),
      waitAndClick('.close-padding.contains-svg,a.close-button', conf.secWaitBanner * 1000),
      waitForElems({
        sel: '.videoAdUi',
        onmatch: function(ad) {
          // reset don't skip
          DONT_SKIP = false;
          const adLength = getAdLength(ad);
          const isShort = adLength < conf.minAdLengthForSkip;
          if(isShort && !conf.muteEvenIfNotSkipping) {
            DONT_SKIP = true;
            return util.log('ad is short enough, dont skip or mute: ', adLength, 'seconds');
          }
          if(conf.hideAd) {
            ad.style.zIndex = 10;
            ad.style.background = 'black';
          }
          // show option to cancel automatic skip
          if(!isShort) setupCancelDiv(ad);
          if(!conf.muteAd) return;
          var muteButton = getMuteButton();
          var muteIndicator = getMuteIndicator();
          if(!muteIndicator) return util.log('unable to determine mute state, skipping mute');
          muteButton.click();
          util.log('Video ad detected, muting audio');
          // wait for the ad to disappear before unmuting
          util.keepTrying(250, function() {
            if(!util.q('.videoAdUi')) {
              if(isMuted(muteIndicator)) {
                muteButton.click();
                util.log('Video ad ended, unmuting audio');
              } else {
                util.log('Video ad ended, audio already unmuted');
              }
              return true;
            }
          });
          if(isShort) {
            DONT_SKIP = true;
            util.log('ad is short enough, dont skip (but mute): ', adLength, 'seconds');
          }
        }
      })
    );
  }

  function waitAndClick(sel, ms, cb) {
    return waitForElems({
      sel: sel,
      onmatch: function(btn) {
        util.log('Found ad, closing in', ms, 'ms');
        setTimeout(function() {
          btn.click();
          if(cb) {
            cb(btn);
          }
        }, ms);
      }
    });
  }

  util.log('Started');

  if(window.self === window.top) {
    var videoUrl;
    waitForUrl(/^https:\/\/www\.youtube\.com\/watch\?.*v=.+/, function() {
      if(videoUrl && location.href !== videoUrl) {
        util.log('Changed video, removing old wait');
        util.clearTicks(TICKS);
      }
      videoUrl = location.href;
      util.log('Entered video, waiting for ads');
      waitForAds();
      TICKS.push(
        waitForUrl(function(url) {
          return url !== videoUrl;
        }, function() {
          videoUrl = null;
          util.clearTicks(TICKS);
          util.log('Left video, stopped waiting for ads');
        }, true)
      );
    });
  } else {
    if(/https:\/\/www\.youtube\.com\/embed\//.test(location.href)) {
      util.log('Found embedded video, waiting for ads');
      waitForAds();
    }
  }

  GM_registerMenuCommand('Auto Close Youtube Ads - Manage Settings', config.setup);

})();
