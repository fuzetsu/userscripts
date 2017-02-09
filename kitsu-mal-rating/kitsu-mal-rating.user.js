// ==UserScript==
// @name         Kitsu MAL Rating
// @namespace    http://fuzetsu.com/kitsu-mal-rating
// @version      2.0
// @description  Shows MyAnimeList.net rating on Kitsu.io
// @author       fuzetsu
// @match        *://kitsu.io/*
// @match        *://myanimelist.net/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=147465
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function() {
  'use strict';

  var SCRIPT_NAME = 'Kitsu MAL Rating';
  var API = 'https://kitsu.io/api/edge';
  var REGEX = /^https?:\/\/kitsu\.io\/(anime|manga)\/([^\/]+)\/?(?:\?.*)?$/;

  var Util = {
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
    }
  };

  var App = {
    getMalLink: function(type, slug, cb) {
      Util.log('Fetching mappings for Kitsu slug:', type + '/' + slug);
      GM_xmlhttpRequest({
        method: 'GET',
        url: API + '/' + type + '?filter[slug]=' + slug + '&fields[' + type + ']=id&include=mappings',
        headers: {
          'Accept': 'application/vnd.api+json'
        },
        onload: function(response) {
          try {
            var json = JSON.parse(response.responseText);
            Util.log('Kitsu ' + type + ' ID:', json.data[0].id);
            var malId;
            for (var i = 0; i < json.included.length; i++) {
              if (json.included[i].attributes.externalSite == ('myanimelist/' + type)) {
                malId = json.included[i].attributes.externalId;
              }
            }
            cb(malId);
          } catch (err) {
            Util.log('Failed to parse API results');
          }
        },
        onerror: function() {
          Util.log('Failed to get Kitsu mappings');
        }
      });
    },
    getMalPage: function(url, cb) {
      Util.log('Loading MAL page:', url);
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function(response) {
          Util.log('Loaded MAL page');
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = response.responseText;

          var sidebar = Util.q('#content > table > tbody > tr > td.borderClass', tempDiv);
          var rating = Util.q('span[itemprop="ratingValue"]', sidebar).innerText;
          var usersRated = Util.q('span[itemprop="ratingCount"]', sidebar).innerText;
          var usersFaved = Util.q('h2:not(.mt8):nth-of-type(4) + div + div + div + div + div', sidebar).innerText.replace('Favorites:', '').trim();

          cb(rating, usersRated, usersFaved);
        },
        onerror: function() {
          Util.log('Error loading MAL page');
        }
      });
    }
  };

  waitForUrl(REGEX, function() {
    var type = location.href.match(REGEX)[1];
    var slug = location.href.match(REGEX)[2];
    Util.log('Parsed URL type:', type);
    Util.log('Parsed URL slug:', slug);

    App.getMalLink(type, slug, function(malId) {
      if (!malId) {
        Util.log('MAL ID not found');
      } else {
        Util.log('Received MAL ID:', malId);
        var malLink = 'https://myanimelist.net/' + type + '/' + malId;
        App.getMalPage(malLink, function(rating, usersRated, usersFaved) {

          var malRatingBar = document.createElement('div');
          malRatingBar.classList.add('rating-bar');
          malRatingBar.classList.add('clearfix');

          var ratingElem = document.createElement('span');
          ratingElem.classList.add('community-percentage');
          //ratingElem.classList.add('percent-quarter-3');
          ratingElem.textContent = parseFloat(rating / 2).toFixed(2);
          malRatingBar.appendChild(ratingElem);

          var labelElem = document.createElement('span');
          labelElem.classList.add('average-rating-stars');
          malRatingBar.appendChild(labelElem);
          var labelText = document.createElement('h5');
          labelText.textContent = 'MAL';
          labelText.setAttribute('style', 'top: 5px;');
          labelElem.appendChild(labelText);

          var usersElem = document.createElement('span');
          usersElem.classList.add('ratings-count');
          usersElem.textContent = parseInt(usersRated).toLocaleString('en-US') + ' ratings - ' + usersFaved + ' favorites';
          malRatingBar.appendChild(usersElem);

          Util.log('MAL rating:', rating);
          Util.log('MAL users rated:', usersRated);
          Util.log('MAL users faved:', usersFaved);

          waitForElems({
            sel: '.rating-bar',
            stop: true,
            onmatch: function(ratingBar) {
              ratingBar.setAttribute('style', 'margin-bottom: 5px;');
              ratingBar.parentElement.appendChild(malRatingBar);
            }
          });
        });
      }
    });
  });
})();