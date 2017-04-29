// ==UserScript==
// @name         Kitsu MAL Rating
// @namespace    http://fuzetsu.com/kitsu-mal-rating
// @version      2.1
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
          var headerNum;

          if (Util.q('h2.mt8', sidebar)) headerNum = 4;
          else headerNum = 3;

          if (rating && usersRated) {
            rating = rating.innerText;
            usersRated = usersRated.innerText;
          } else {
            var score = Util.q('h2:nth-of-type(' + headerNum + ') + div', sidebar).innerText.replace(/[\n\r]/g, '');
            if (score.match(/Score:\s+N\/A/)[0]) {
              rating = null;
            } else {
              rating = score.match(/[0-9]{1,2}\.[0-9]{2}/)[0];
            }
            usersRated = score.match(/\(scored by ([0-9]+) users\)/)[1];
          }
          var usersFaved = Util.q('h2:nth-of-type(' + headerNum + ') + div + div + div + div + div', sidebar).innerText.replace('Favorites:', '').trim();

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
    var preMalBarCheck = Util.q('#mal-rating-bar');

    App.getMalLink(type, slug, function(malId) {
      if (!malId) {
        Util.log('MAL ID not found');
        if (preMalBarCheck) preMalBarCheck.remove();
      } else {
        //Util.log('Received MAL ID:', malId);
        var malLink = 'https://myanimelist.net/' + type + '/' + malId;

        App.getMalPage(malLink, function(rating, usersRated, usersFaved) {

          if (!rating || rating == 'N/A') { rating = null; }
          else { rating = parseFloat(rating * 10).toFixed(2); }
          usersRated = parseInt(usersRated.replace(',', '')).toLocaleString('en-US');
          usersFaved = parseInt(usersFaved.replace(',', '')).toLocaleString('en-US');

          //Util.log('MAL rating:', rating);
          //Util.log('MAL users rated:', usersRated);
          //Util.log('MAL users faved:', usersFaved);

          var malBarCheck = Util.q('#mal-rating-bar');

          if (malBarCheck) {
            var updateRating = Util.q('.community-percentage', malBarCheck);
            if (!rating) { updateRating.textContent = 'N/A'; }
            else {
              var percentColor = 'percent-quarter-';
              if (rating <= 25) { percentColor += 1; }
              else if (rating <= 50) { percentColor += 2; }
              else if (rating <= 75) { percentColor += 3; }
              else if (rating <= 100) { percentColor += 4; }
              updateRating.classList.add(percentColor);
              updateRating.textContent = rating + '%';
            }

            var updateLink = Util.q('a', malBarCheck);
            updateLink.href = malLink;

            var updateUsers = Util.q('.ratings-count', malBarCheck);
            updateUsers.textContent = usersRated + ' ratings - ' + usersFaved + ' favorites';

            waitForElems({
              sel: '.col-sm-8 > section:first-child',
              stop: true,
              onmatch: function(node) {
                var check = Util.q('.rating-bar:not(#mal-rating-bar)', node);
                if (check) check.setAttribute('style', 'margin-bottom: 5px;');
              }
            });
          } else {
            var newRatingBar = document.createElement('div');
            newRatingBar.id = 'mal-rating-bar';
            newRatingBar.classList.add('rating-bar');
            newRatingBar.classList.add('clearfix');

            var ratingElem = document.createElement('span');
            ratingElem.classList.add('community-percentage');
            if (!rating) { ratingElem.textContent = 'N/A'; }
            else {
              var percentColor = 'percent-quarter-';
              if (rating <= 25) { percentColor += 1; }
              else if (rating <= 50) { percentColor += 2; }
              else if (rating <= 75) { percentColor += 3; }
              else if (rating <= 100) { percentColor += 4; }
              ratingElem.classList.add(percentColor);
              ratingElem.textContent = rating + '%';
            }
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
              sel: '.col-sm-8 > section:first-child',
              stop: true,
              onmatch: function(node) {
                var check = Util.q('.rating-bar:not(#mal-rating-bar)', node);
                if (check) check.setAttribute('style', 'margin-bottom: 5px;');
                node.appendChild(newRatingBar);
              }
            });
          }
        });
      }
    });
  });
})();
