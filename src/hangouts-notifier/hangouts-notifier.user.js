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
'use strict';

var util = {
    log: function () {
        var args = [].slice.call(arguments);
        args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: purple;');
        console.log.apply(console, args);
    },
    q: function (query, context) {
        return (context || document).querySelector(query);
    },
    qq: function (query, context) {
        return [].slice.call((context || document).querySelectorAll(query));
    }
};

var SCRIPT_NAME = 'Hangouts Notifier';
var LAST_MESSAGE = '.tk.Sn';
var MESSAGE_TEXT = '.Mu:last-child';
var USER_IMAGE = 'img.Yf';
var NEW_MSG = '.Ik.uB';
var CHECK_INTERVAL = 1 * 1000;
var NOTIFY_HIDE_DELAY = 6 * 1000;
var NOTIFY_EXPIRE = 1 * 60 * 1000;

var hn = {
    checkPermissions: function () {
        return Notification.requestPermission(function (permission) {
            util.log('permission', permission);
        });
    },
    notification: function (title, opt) {
        var n = new Notification(title, opt);
        var id = setTimeout(function () {
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
    notify: function (user, msg, img) {
        if (!('Notification' in window)) {
            alert('This browser does not support desktop notifications...');
            return;
        }
        var title = user;
        var opt = {
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
    getLastMessage: function () {
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
    start: function () {
        util.log('Starting...', location.href);
        var lastId = null;
        var res = hn.getLastMessage();
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
        }
        // if window is focused set last message as read
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
    setTimeout(hn.start, 5000);
}