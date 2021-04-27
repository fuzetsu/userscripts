// ==UserScript==
// @name        YouTube History Management
// @version     1.1.0
// @author      fuzetsu
// @description Select and remove YouTube history items quickly
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://www.youtube.com/*
// @namespace   http://fuzetsu.com/YHM
// @grant       none
// @require     https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=141779
// @deprecated  true
// ==/UserScript==

/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};


// ==UserScript==
// @name         YouTube History Management
// @namespace    http://fuzetsu.com/YHM
// @version      1.1.0
// @description  Select and remove YouTube history items quickly
// @author       fuzetsu
// @match        *://www.youtube.com/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=141779
// @noframes
// @deprecated   true
// ==/UserScript==
(function () {
  if (window.top !== window.self) return;
  var deleteQueue = [],
      items = [],
      itemIdx = 0,
      waitID = null,
      EDIT_MODE = false,
      SCRIPT_NAME = 'YouTube History Management',
      SELECT_COLOR = 'orange',
      TITLE_SELECTOR = '.yt-uix-tile-link',
      DESC_SELECTOR = '.yt-lockup-description',
      MENU_SELECTOR = '#browse-items-primary li > ul',
      FEED_SELECTOR = '.yt-lockup-video',
      Util = {
    log: function log() {
      var args = [].slice.call(arguments);
      args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color:navy');
      console.log.apply(console, args);
    },
    q: function q(query, context) {
      return (context || document).querySelector(query);
    },
    qq: function qq(query, context) {
      return [].slice.call((context || document).querySelectorAll(query));
    },
    _cbQueue: [],
    _handleQueue: function _handleQueue() {
      this._cbQueue.shift()();
    },
    queueCallback: function queueCallback(callback) {
      this._cbQueue.push(callback);

      setTimeout(this._handleQueue.bind(this), 0);
    }
  };

  function removeItem(item) {
    // find "remove from watch history" button within history item
    var btns = Util.qq('button', item);
    btns.some(function (btn) {
      // make sure we have the right button
      if (btn.title.trim() === 'Remove from Watch history') {
        Util.queueCallback(btn.click.bind(btn));
        toggleSelected(item, false, true);
        return true;
      }
    });
  }

  function toggleUntil(index, item) {
    while (item && !item.dataset.yhmSelected) {
      toggleSelected(item, true);
      item = items[--index];
    }
  }

  function toggleSelected(item, state, ignore) {
    var title = Util.q(TITLE_SELECTOR, item),
        desc = Util.q(DESC_SELECTOR, item);

    if (state || !item.dataset.yhmSelected) {
      if (!ignore) {
        deleteQueue.push(item);
      }

      item.style.backgroundColor = SELECT_COLOR;
      title && (title.style.backgroundColor = SELECT_COLOR);
      desc && (desc.style.backgroundColor = SELECT_COLOR);
      item.dataset.yhmSelected = 'yes';
    } else {
      if (!ignore) {
        deleteQueue.splice(deleteQueue.indexOf(item), 1);
      }

      item.style.backgroundColor = '';
      title && (title.style.backgroundColor = '');
      desc && (desc.style.backgroundColor = '');
      item.dataset.yhmSelected = '';
    }
  }

  function makeMenuButton(text, action) {
    var btn = document.createElement('button'),
        liContainer = document.createElement('li');
    btn.className = 'yt-uix-button yt-uix-button-size-default yt-uix-button-default';
    btn.innerHTML = '<span class="yt-uix-button-content">' + text + '</span>';
    btn.addEventListener('click', action, false);
    liContainer.appendChild(btn);
    Util.q(MENU_SELECTOR).appendChild(liContainer);
    return btn;
  }

  Util.log('Started');
  waitForUrl(/^http(s)?:\/\/www\.youtube\.com\/feed\/history/, function () {
    var historyUrl = location.href;
    Util.log('Entered history page, waiting for menu area to load');
    waitForElems(MENU_SELECTOR, function () {
      Util.log('Found menu area, creating and inserting buttons'); // Button that toggles between edit and standard modes

      var btnEditHistory = makeMenuButton('Edit History', function (evt) {
        if (this.textContent === 'Edit History') {
          EDIT_MODE = true;
          this.textContent = 'Stop Editing';
          btnDeleteSelected.parentNode.style.display = '';
        } else {
          EDIT_MODE = false;
          this.textContent = 'Edit History'; // reset history selection

          while (deleteQueue.length > 0) {
            toggleSelected(deleteQueue.pop(), false, true);
          }

          btnDeleteSelected.parentNode.style.display = 'none';
        }
      }),
          btnDeleteSelected = makeMenuButton('Delete Selected', function (evt) {
        var count = deleteQueue.length;
        if (count < 1) return alert('Nothing selected, select at least one history item and try again.');
        EDIT_MODE = false;

        while (deleteQueue.length > 0) {
          removeItem(deleteQueue.pop());
        }

        Util.queueCallback(function () {
          EDIT_MODE = true;
        });
        alert('Deleted ' + count + ' history items.');
      }); // Button that deletes all selected items, only visible while editing

      // hide the button pre-emptively
      btnDeleteSelected.parentNode.style.display = 'none'; // watch DOM for new history items

      waitID = waitForElems(FEED_SELECTOR, function (item) {
        var index = itemIdx;
        itemIdx += 1;
        items.push(item); // bind selecting event for history items

        item.addEventListener('click', function (evt) {
          if (EDIT_MODE) {
            evt.preventDefault();
            evt.stopPropagation();

            if (evt.shiftKey) {
              toggleUntil(index, item);
            } else {
              toggleSelected(item);
            }

            window.getSelection().removeAllRanges();
          }
        }, false);
      });
    }, true);
    waitForUrl(function (url) {
      return url !== historyUrl;
    }, function () {
      clearInterval(waitID);
      EDIT_MODE = false;
      deleteQueue = [];
      Util.log('Leaving history page, cleaning up listeners and references');
    }, true);
  });
})();
/******/ })()
;