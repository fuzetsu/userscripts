// ==UserScript==
// @name         Hummingbird MAL Rating
// @namespace    http://fuzetsu.com/hummingbird-mal-rating
// @version      1.3.3
// @description  Shows MyAnimeList.net rating in hummingbird.me
// @author       fuzetsu
// @match        *://hummingbird.me/*
// @match        http://myanimelist.net/404.php?*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=141779
// ==/UserScript==

var url = window.location.href;
if (/^http:\/\/myanimelist\.net\/404\.php\?.*/.test(url)) {
  console.log('MAL embedded anime page, showing score...');
  document.body.innerHTML = '<style>.highlight {color: #16a085; font-weight: 400;} body {color: rgb(115, 115, 115);font-family: klavika, Helvetica, Arial, sans-serif;font-size: 16px;font-weight: normal;</style>';
  var query = {};
  url.slice(url.indexOf('?') + 1).split('&').forEach(function(q) {
    var p = q.split('=');
    query[p[0]] = unescape(p[1]);
  });
  displayMALScore(query.title, query.media, document.body);
}
else {
  if (window.top !== window.self) return;
  console.log('Hummingbird page, waiting for anime page to embed score');
  var frame;
  waitForUrl(/^http(s)?:\/\/hummingbird.me\/anime\/.*/, function() {
    if (frame) frame.remove();
    waitForElems('.hb-score', function(elem) {
      var title = document.querySelector('.series-title').childNodes[2].textContent.trim().replace(/\([^\)]*\)/g, ""),
        media = document.querySelector('.series-metadata > li:nth-child(1)').textContent.trim();
      frame = elem.appendChild(document.createElement('iframe'));
      frame.src = 'http://myanimelist.net/404.php?title=' + escape(title) + '&media=' + media;
      frame.setAttribute('style', 'max-width: 100%;border: none;height: 60px;');
    }, true);
  });
}

function requestMAL(url, cb) {
  var xhr = new XMLHttpRequest();
  if (url.indexOf('myanimelist') === -1) {
    url = 'http://myanimelist.net/' + url;
  }
  xhr.open('get', url);
  xhr.responseType = 'document';
  xhr.onload = function() {
    cb(xhr.response);
  };
  xhr.send();
}

function searchMAL(query, media, cb) {
  requestMAL('anime.php?q=' + escape(query), function(res) {
    var results = [];
    var resultRows = res.querySelectorAll('#content > div:nth-child(2) > table > tbody > tr');
    if (resultRows.length === 0) { // if the are no result rows then we got redirected, pass page and exit early
      cb({
        page: res,
        direct: true
      });
      return;
    }
    [].slice.call(resultRows, 1).forEach(function(anime) {
      var a = anime.querySelector('td:nth-child(2) > a:nth-child(2)'),
        m = anime.querySelector('td:nth-child(3)').textContent.trim();
      if (a) results.push({
        title: a.textContent.trim(),
        media: m,
        url: a.href
      });
    });
    cb(results);
  });
}

function displayMALScore(title, media, place) {
  searchMAL(title, media, function(results) {
    function showScore(page) {
      place.innerHTML += 'MAL ' + page.querySelectorAll('#content > table > tbody > tr > td.borderClass > h2')[2].nextSibling.textContent.replace(/[0-9]*\.[0-9]*/, '<span class="highlight">$&</span>');
    }
    console.log(title, media, results); // TESTING
    if (results.direct) {
      showScore(results.page);
    }
    else {
      var regSpecial = /[^A-z0-9]/g;
      title = title.replace(regSpecial, '');
      results.some(function(anime) {
        if (anime.title.replace(regSpecial, '').indexOf(title) !== -1 && anime.media === media) {
          requestMAL(anime.url, showScore);
          return true;
        }
      });
    }
  });
}
