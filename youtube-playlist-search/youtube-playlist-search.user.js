// ==UserScript==
// @name         YouTube Playlist Search
// @namespace    http://www.fuzetsu.com/YPS
// @version      0.0.7
// @description  Allows you to quickly search through youtube playlists
// @match        https://www.youtube.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @copyright    2014+, fuzetsu
// @grant        none
// ==/UserScript==

var SCRIPT_NAME = 'YouTube Playlist Search';
var ITEM_SELECTOR = '.pl-video';
var TEXT_SELECTOR = '.pl-video-title';

var util = {
  log: function() {
    var args = [].slice.call(arguments);
    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: hotpink;');
    console.log.apply(console, args);
  },
  q: function(query, context) {
    return (context || document).querySelector(query);
  },
  qq: function(query, context) {
    return [].slice.call((context || document).querySelectorAll(query));
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

var yps = {
  _items: [],
  makeSearchBox: function() {
    var txtSearch = document.createElement('input');
    txtSearch.type = 'text';
    txtSearch.setAttribute('style', [
      'position: fixed',
      'right: 0',
      'top:' + (util.q('#yt-masthead-container').clientHeight + 40) + 'px',
      'width: 250px',
      'z-index: 1000'
    ].join(';'));
    txtSearch.onkeyup = yps.search;
    document.body.appendChild(txtSearch);
    return txtSearch;
  },
  search: function(e) {
    yps.filterVideos(e.target.value);
  },
  filterVideos: function(query) {
    query = query.toLowerCase().split(' ').map(function(q) {
      return q.trim();
    });
    yps._items.forEach(function(item) {
      if (query.every(function(q) {
          return item.name.indexOf(q) > -1;
        })) {
        item.elem.style.display = '';
      }
      else {
        item.elem.style.display = 'none';
      }
    });
  },
  start: function() {
    util.log('Starting... waiting for playlist');
    waitForUrl(/^https:\/\/www\.youtube\.com\/playlist\?list=.+/, function() {
      var playlistUrl = location.href;
      var urlWaitId, itemWait;
      var txtSearch = yps.makeSearchBox();
      util.log('Reached playlist, adding search box');
      itemWait = waitForElems(ITEM_SELECTOR, function(item) {
        yps._items.push({
          elem: item,
          name: util.q(TEXT_SELECTOR, item).textContent.toLowerCase()
        });
      });
      urlWaitId = waitForUrl(function(url) {
        return url !== playlistUrl;
      }, function() {
        util.log('leaving playlist, cleaning up');
        itemWait.stop();
        txtSearch.remove();
        yps._items = [];
      }, true);
    });
  }
};

yps.start();
