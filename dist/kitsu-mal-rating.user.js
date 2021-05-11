// ==UserScript==
// @name        Kitsu MAL Rating
// @version     2.3
// @author      synthtech / fuzetsu
// @description Shows MyAnimeList.net rating on Kitsu.io
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://kitsu.io/*
// @namespace   http://fuzetsu.com/kitsu-mal-rating
// @require     https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant       GM_xmlhttpRequest
// ==/UserScript==

/******/ (() => { // webpackBootstrap
var __webpack_exports__ = {};
// ==UserScript==
// @name         Kitsu MAL Rating
// @namespace    http://fuzetsu.com/kitsu-mal-rating
// @version      2.3
// @description  Shows MyAnimeList.net rating on Kitsu.io
// @author       synthtech / fuzetsu
// @match        *://kitsu.io/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant        GM_xmlhttpRequest
// ==/UserScript==
(function () {
  'use strict';

  var SCRIPT_NAME = 'Kitsu MAL Rating',
      API = 'https://kitsu.io/api/edge',
      REGEX = /^https?:\/\/kitsu\.io\/(anime|manga)\/([^\/]+)\/?(?:\?.*)?$/,
      Util = {
    log: function log() {
      var args = [].slice.call(arguments);
      args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
      console.log.apply(console, args);
    },
    q: function q(query, context) {
      return (context || document).querySelector(query);
    },
    qq: function qq(query, context) {
      return [].slice.call((context || document).querySelectorAll(query));
    }
  },
      App = {
    cache: {},
    getMalLink: function getMalLink(type, slug, cb) {
      var id = type + '/' + slug,
          self = this;

      if (self.cache.hasOwnProperty(id)) {
        Util.log('Loading cached MAL ID:', self.cache[id]);
        cb(self.cache[id]);
      } else {
        Util.log('Fetching mappings for Kitsu slug:', id);
        GM_xmlhttpRequest({
          method: 'GET',
          url: API + '/' + type + '?filter[slug]=' + slug + '&fields[' + type + ']=id&include=mappings',
          headers: {
            'Accept': 'application/vnd.api+json'
          },
          onload: function onload(response) {
            try {
              var json = JSON.parse(response.responseText),
                  malId;

              if (json.included) {
                for (var i = 0; i < json.included.length; i++) {
                  if (json.included[i].attributes.externalSite == 'myanimelist/' + type) {
                    malId = json.included[i].attributes.externalId;
                  }
                }
              }

              self.cache[id] = malId;
              cb(malId);
            } catch (err) {
              Util.log('Failed to parse API results');
            }
          },
          onerror: function onerror() {
            Util.log('Failed to get Kitsu mappings');
          }
        });
      }
    },
    getMalPage: function getMalPage(url, cb) {
      Util.log('Loading MAL page:', url);
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function onload(response) {
          try {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = response.responseText;
            var sidebar = Util.q('#content > table > tbody > tr > td.borderClass', tempDiv),
                rating = Util.q('span[itemprop="ratingValue"]', sidebar),
                headerNum;
            if (Util.q('h2.mt8', sidebar)) headerNum = 4;else headerNum = 3;

            if (rating) {
              rating = rating.innerText;
            } else {
              var score = Util.q('h2:nth-of-type(' + headerNum + ') + div', sidebar).innerText.replace(/[\n\r]/g, '');

              if (score.match(/Score:\s+N\/A/)) {
                rating = null;
              } else {
                rating = score.match(/[0-9]{1,2}\.[0-9]{2}/)[0];
              }
            }

            cb(rating);
          } catch (err) {
            Util.log('Failed to parse MAL page');
          }
        },
        onerror: function onerror() {
          Util.log('Error loading MAL page');
        }
      });
    }
  };
  waitForUrl(REGEX, function () {
    var type = location.href.match(REGEX)[1],
        slug = location.href.match(REGEX)[2],
        preMalBarCheck = Util.q('#mal-rating-bar');
    App.getMalLink(type, slug, function (malId) {
      if (!malId) {
        Util.log('MAL ID not found');
        if (preMalBarCheck) preMalBarCheck.remove();
      } else {
        var malLink = 'https://myanimelist.net/' + type + '/' + malId;
        App.getMalPage(malLink, function (rating) {
          if (!rating || rating == 'N/A') {
            rating = null;
          } else {
            rating = parseFloat(rating * 10).toFixed(2);
          }

          var malBarCheck = Util.q('#mal-rating-bar');

          if (malBarCheck) {
            var updateRating = malBarCheck.firstChild;
            updateRating.className = 'media-community-rating';

            if (rating) {
              var percentColor = 'percent-quarter-';

              if (rating <= 25) {
                percentColor += 1;
              } else if (rating <= 50) {
                percentColor += 2;
              } else if (rating <= 75) {
                percentColor += 3;
              } else if (rating <= 100) {
                percentColor += 4;
              }

              updateRating.classList.add(percentColor);
            }

            updateRating.firstChild.href = malLink;
            rating ? updateRating.firstChild.textContent = rating + '% MAL Approval' : updateRating.firstChild.textContent = 'Unknown MAL Approval';
          } else {
            var newRatingBar = document.createElement('section');
            newRatingBar.id = 'mal-rating-bar';
            newRatingBar.className = 'media-rating';
            var ratingElem = document.createElement('span');
            ratingElem.className = 'media-community-rating';

            if (rating) {
              var percentColor = 'percent-quarter-';

              if (rating <= 25) {
                percentColor += 1;
              } else if (rating <= 50) {
                percentColor += 2;
              } else if (rating <= 75) {
                percentColor += 3;
              } else if (rating <= 100) {
                percentColor += 4;
              }

              ratingElem.classList.add(percentColor);
            }

            var ratingLink = document.createElement('a');
            ratingLink.id = 'mal-rating-link';
            ratingLink.href = malLink;
            ratingLink.target = '_blank';
            ratingLink.rel = 'noopener noreferrer';
            ratingLink.style.color = 'inherit';
            ratingLink.style.fontFamily = 'inherit';
            rating ? ratingLink.textContent = rating + '% MAL Approval' : ratingLink.textContent = 'Unknown MAL Approval';
            ratingElem.appendChild(ratingLink);
            newRatingBar.appendChild(ratingElem);
            waitForElems({
              sel: '.media-rating:not(#mal-rating-bar)',
              stop: true,
              onmatch: function onmatch(node) {
                node.parentNode.insertBefore(newRatingBar, node.nextSibling);
              }
            });
          }
        });
      }
    });
  });
})();
/******/ })()
;