// ==UserScript==
// @name        userscripts
// @version     0.0.1
// @description tampermonkey scripts
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*
// ==/UserScript==

/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/hangouts-notifier/hangouts-notifier.user.js":
/*!*********************************************************!*\
  !*** ./src/hangouts-notifier/hangouts-notifier.user.js ***!
  \*********************************************************/
/***/ (() => {

eval("// ==UserScript==\r\n// @name         Hangouts Notifier\r\n// @namespace    fuzetsu.com/HangoutsNotifier\r\n// @version      0.0.9\r\n// @description  Show desktop notifications for the Hangouts web app\r\n// @author       fuzetsu\r\n// @match        https://hangouts.google.com/webchat/*\r\n// @grant        none\r\n// @deprecated   true\r\n// ==/UserScript==\r\n/* jshint -W097 */\r\n\r\n\r\nvar util = {\r\n    log: function () {\r\n        var args = [].slice.call(arguments);\r\n        args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: purple;');\r\n        console.log.apply(console, args);\r\n    },\r\n    q: function (query, context) {\r\n        return (context || document).querySelector(query);\r\n    },\r\n    qq: function (query, context) {\r\n        return [].slice.call((context || document).querySelectorAll(query));\r\n    }\r\n};\r\n\r\nvar SCRIPT_NAME = 'Hangouts Notifier';\r\nvar LAST_MESSAGE = '.tk.Sn';\r\nvar MESSAGE_TEXT = '.Mu:last-child';\r\nvar USER_IMAGE = 'img.Yf';\r\nvar NEW_MSG = '.Ik.uB';\r\nvar CHECK_INTERVAL = 1 * 1000;\r\nvar NOTIFY_HIDE_DELAY = 6 * 1000;\r\nvar NOTIFY_EXPIRE = 1 * 60 * 1000;\r\n\r\nvar hn = {\r\n    checkPermissions: function () {\r\n        return Notification.requestPermission(function (permission) {\r\n            util.log('permission', permission);\r\n        });\r\n    },\r\n    notification: function (title, opt) {\r\n        var n = new Notification(title, opt);\r\n        var id = setTimeout(function () {\r\n            n.close();\r\n        }, NOTIFY_EXPIRE);\r\n        n.onclick = function () {\r\n            clearTimeout(id);\r\n            n.close();\r\n            window.focus();\r\n        };\r\n        n.onshow = function () {\r\n            clearTimeout(id);\r\n            setTimeout(function () {\r\n                n.close();\r\n            }, NOTIFY_HIDE_DELAY);\r\n        };\r\n    },\r\n    notify: function (user, msg, img) {\r\n        if (!('Notification' in window)) {\r\n            alert('This browser does not support desktop notifications...');\r\n            return;\r\n        }\r\n        var title = user;\r\n        var opt = {\r\n            body: msg,\r\n            icon: img || 'https://cdn4.iconfinder.com/data/icons/miu-shadow-social/48/hangouts-128.png'\r\n        };\r\n        if (Notification.permission === 'granted') {\r\n            hn.notification(title, opt);\r\n        } else if (Notification.permission !== 'denied') {\r\n            return Notification.requestPermission(function (permission) {\r\n                if (permission === 'granted') {\r\n                    hn.notification(title, opt);\r\n                }\r\n            });\r\n        }\r\n    },\r\n    getLastMessage: function () {\r\n        var message = util.qq(LAST_MESSAGE).pop();\r\n        if (!message) return;\r\n        var user = util.q(USER_IMAGE, message);\r\n        message = util.q(MESSAGE_TEXT, message);\r\n        if (!message) return;\r\n        return {\r\n            user: user.alt,\r\n            id: message.id,\r\n            text: message.textContent,\r\n            img: user.src.replace(/\\/s32[^\\/]*\\//, '/s128/')\r\n        };\r\n    },\r\n    start: function () {\r\n        util.log('Starting...', location.href);\r\n        var lastId = null;\r\n        var res = hn.getLastMessage();\r\n        if (!res) {\r\n            util.log('failed to get last message, this probably  isn\\'t a hangouts chat window...');\r\n            if (document.URL.indexOf('prop=gmail#epreld') >= 0) {\r\n                util.log('So it may be a hangouts chat window, after all...');\r\n                res = {\r\n                    id: -1\r\n                };\r\n            } else {\r\n                return false;\r\n            }\r\n        }\r\n        // if window is focused set last message as read\r\n        if (document.hasFocus() || !util.q(NEW_MSG)) {\r\n            lastId = res.id;\r\n        }\r\n        setInterval(function () {\r\n            res = hn.getLastMessage();\r\n            if (res && res.id !== lastId) {\r\n                lastId = res.id;\r\n                if (!document.hasFocus() && util.q(NEW_MSG)) {\r\n                    hn.notify(res.user, res.text, res.img);\r\n                }\r\n            }\r\n        }, CHECK_INTERVAL);\r\n        return true;\r\n    }\r\n};\r\n\r\nhn.checkPermissions();\r\nif (!hn.start()) {\r\n    util.log('trying again in 5 seconds, just in case');\r\n    setTimeout(hn.start, 5000);\r\n}\n\n//# sourceURL=webpack://userscripts/./src/hangouts-notifier/hangouts-notifier.user.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/hangouts-notifier/hangouts-notifier.user.js"]();
/******/ 	
/******/ })()
;