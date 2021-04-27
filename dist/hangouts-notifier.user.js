// ==UserScript==
// @name        Hangouts Notifier
// @version     0.0.9
// @author      fuzetsu
// @description Show desktop notifications for the Hangouts web app
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       https://hangouts.google.com/webchat/*
// @namespace   fuzetsu.com/HangoutsNotifier
// @grant       none
// @deprecated  true
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// ==UserScript==
// @name         Hangouts Notifier
// @namespace    fuzetsu.com/HangoutsNotifier
// @version      0.0.9
// @description  Show desktop notifications for the Hangouts web app
// @author       fuzetsu
// @match        https://hangouts.google.com/webchat/*
// @grant        none
// @deprecated   true
// ==/UserScript==

/* jshint -W097 */


var util = {
  log: function log() {
    var args = [].slice.call(arguments);
    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: purple;');
    console.log.apply(console, args);
  },
  q: function q(query, context) {
    return (context || document).querySelector(query);
  },
  qq: function qq(query, context) {
    return [].slice.call((context || document).querySelectorAll(query));
  }
},
    SCRIPT_NAME = 'Hangouts Notifier',
    LAST_MESSAGE = '.tk.Sn',
    MESSAGE_TEXT = '.Mu:last-child',
    USER_IMAGE = 'img.Yf',
    NEW_MSG = '.Ik.uB',
    CHECK_INTERVAL = 1 * 1e3,
    NOTIFY_HIDE_DELAY = 6 * 1e3,
    NOTIFY_EXPIRE = 1 * 60 * 1e3,
    hn = {
  checkPermissions: function checkPermissions() {
    return Notification.requestPermission(function (permission) {
      util.log('permission', permission);
    });
  },
  notification: function notification(title, opt) {
    var n = new Notification(title, opt),
        id = setTimeout(function () {
      n.close();
    }, NOTIFY_EXPIRE);

    n.onclick = function () {
      clearTimeout(id);
      n.close();
      window.focus();
    };

    n.onshow = function () {
      clearTimeout(id);
      setTimeout(function () {
        n.close();
      }, NOTIFY_HIDE_DELAY);
    };
  },
  notify: function notify(user, msg, img) {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notifications...');
      return;
    }

    var title = user,
        opt = {
      body: msg,
      icon: img || 'https://cdn4.iconfinder.com/data/icons/miu-shadow-social/48/hangouts-128.png'
    };

    if (Notification.permission === 'granted') {
      hn.notification(title, opt);
    } else if (Notification.permission !== 'denied') {
      return Notification.requestPermission(function (permission) {
        if (permission === 'granted') {
          hn.notification(title, opt);
        }
      });
    }
  },
  getLastMessage: function getLastMessage() {
    var message = util.qq(LAST_MESSAGE).pop();
    if (!message) return;
    var user = util.q(USER_IMAGE, message);
    message = util.q(MESSAGE_TEXT, message);
    if (!message) return;
    return {
      user: user.alt,
      id: message.id,
      text: message.textContent,
      img: user.src.replace(/\/s32[^\/]*\//, '/s128/')
    };
  },
  start: function start() {
    util.log('Starting...', location.href);
    var lastId = null,
        res = hn.getLastMessage();

    if (!res) {
      util.log('failed to get last message, this probably  isn\'t a hangouts chat window...');

      if (document.URL.indexOf('prop=gmail#epreld') >= 0) {
        util.log('So it may be a hangouts chat window, after all...');
        res = {
          id: -1
        };
      } else {
        return false;
      }
    } // if window is focused set last message as read


    if (document.hasFocus() || !util.q(NEW_MSG)) {
      lastId = res.id;
    }

    setInterval(function () {
      res = hn.getLastMessage();

      if (res && res.id !== lastId) {
        lastId = res.id;

        if (!document.hasFocus() && util.q(NEW_MSG)) {
          hn.notify(res.user, res.text, res.img);
        }
      }
    }, CHECK_INTERVAL);
    return true;
  }
};
hn.checkPermissions();

if (!hn.start()) {
  util.log('trying again in 5 seconds, just in case');
  setTimeout(hn.start, 5e3);
}
/******/ })()
;