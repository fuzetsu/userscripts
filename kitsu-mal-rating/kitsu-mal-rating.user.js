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
      }
    });
  });
})();