// ==UserScript==
// @name         Kitsu MAL Rating
// @namespace    http://fuzetsu.com/kitsu-mal-rating
// @version      2.0
// @description  Shows MyAnimeList.net rating on Kitsu.io
// @author       synthtech / fuzetsu
// @match        *://kitsu.io/*
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
    cache: {},
    getMalLink: function(type, slug, cb) {
      var id = type + '/' + slug;
      var self = this;
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
          onload: function(response) {
            try {
              var json = JSON.parse(response.responseText);
              //Util.log('Kitsu ' + type + ' ID:', json.data[0].id);
              var malId;
              for (var i = 0; i < json.included.length; i++) {
                if (json.included[i].attributes.externalSite == ('myanimelist/' + type)) {
                  malId = json.included[i].attributes.externalId;
                }
              }
              self.cache[id] = malId;
              cb(malId);
            } catch (err) {
              Util.log('Failed to parse API results');
            }
          },
          onerror: function() {
            Util.log('Failed to get Kitsu mappings');
          }
        });
      }
    },
    getMalPage: function(url, cb) {
      Util.log('Loading MAL page:', url);
      GM_xmlhttpRequest({
        method: 'GET',
        url: url,
        onload: function(response) {
          //Util.log('Loaded MAL page');
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = response.responseText;

          var sidebar = Util.q('#content > table > tbody > tr > td.borderClass', tempDiv);
          var rating = Util.q('span[itemprop="ratingValue"]', sidebar);
          var usersRated = Util.q('span[itemprop="ratingCount"]', sidebar);
          var usersFaved;

          var isOnList = Util.q('h2.mt8', sidebar);
          if (isOnList) {
            usersFaved = Util.q('h2:nth-of-type(4) + div + div + div + div + div', sidebar);

            if (rating && usersRated) {
              rating = rating.innerText;
              usersRated = usersRated.innerText;
            } else {
              var score = Util.q('h2:nth-of-type(4) + div', sidebar).innerText;
              rating = score.replace(/[0-9]{1,2}\.[0-9]{2}/, '$&');
              usersRated = score.replace(/\(scored by ([0-9]+) users\)/, '$1');
            }
          } else {
            usersFaved = Util.q('h2:nth-of-type(3) + div + div + div + div + div', sidebar);

            if (rating && usersRated) {
              rating = rating.innerText;
              usersRated = usersRated.innerText;
            } else {
              var score2 = Util.q('h2:nth-of-type(3) + div', sidebar).innerText;
              rating = score2.replace(/[0-9]{1,2}\.[0-9]{2}/, '$&');
              usersRated = score2.replace(/\(scored by ([0-9]+) users\)/, '$1');
            }
          }

          usersFaved = usersFaved.innerText.replace('Favorites:', '').trim();

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
    //Util.log('Parsed URL type:', type);
    //Util.log('Parsed URL slug:', slug);
    var barCheck = Util.q('#mal-rating-bar');

    App.getMalLink(type, slug, function(malId) {
      if (!malId) {
        Util.log('MAL ID not found');
        if (barCheck) barCheck.remove();
      } else {
        //Util.log('Received MAL ID:', malId);
        var malLink = 'https://myanimelist.net/' + type + '/' + malId;

        App.getMalPage(malLink, function(rating, usersRated, usersFaved) {

          rating = parseFloat(rating / 2).toFixed(2);
          usersRated = parseInt(usersRated.replace(',', '')).toLocaleString('en-US');
          usersFaved = parseInt(usersFaved.replace(',', '')).toLocaleString('en-US');

          //Util.log('MAL rating:', rating);
          //Util.log('MAL users rated:', usersRated);
          //Util.log('MAL users faved:', usersFaved);

          if (barCheck) {
            var updateRating = Util.q('.community-percentage', barCheck);
            updateRating.textContent = rating;

            var updateLink = Util.q('a', barCheck);
            updateLink.href = malLink;

            var updateUsers = Util.q('.ratings-count', barCheck);
            updateUsers.textContent = usersRated + ' ratings - ' + usersFaved + ' favorites';
          } else {
            var newRatingBar = document.createElement('div');
            newRatingBar.id = 'mal-rating-bar';
            newRatingBar.classList.add('rating-bar');
            newRatingBar.classList.add('clearfix');

            var ratingElem = document.createElement('span');
            ratingElem.classList.add('community-percentage');
            //ratingElem.classList.add('percent-quarter-3');
            ratingElem.textContent = rating;
            newRatingBar.appendChild(ratingElem);

            var labelElem = document.createElement('span');
            labelElem.classList.add('average-rating-stars');
            labelElem.setAttribute('style', 'top: 5px;');
            newRatingBar.appendChild(labelElem);
            var labelLink = document.createElement('a');
            labelLink.href = malLink;
            labelLink.setAttribute('target', '_blank');
            labelElem.appendChild(labelLink);
            var labelText = document.createElement('h5');
            labelText.textContent = 'MAL';
            labelLink.appendChild(labelText);

            var usersElem = document.createElement('span');
            usersElem.classList.add('ratings-count');
            usersElem.textContent = usersRated + ' ratings - ' + usersFaved + ' favorites';
            newRatingBar.appendChild(usersElem);

            waitForElems({
              sel: 'div > .rating-bar:first-child',
              stop: true,
              onmatch: function(ratingBar) {
                ratingBar.setAttribute('style', 'margin-bottom: 5px;');
                ratingBar.parentElement.appendChild(newRatingBar);
              }
            });
          }
        });
      }
    });
  });
})();
