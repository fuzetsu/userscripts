// ==UserScript==
// @name         Hummingbird Compatibility Hover
// @namespace    http://fuzetsu.com/hch
// @version      1.0.3
// @description  Shows hummingbird user compatibility rating at the bottom right of the screen when a user link is hovered over
// @author       fuzetsu
// @match        *://hummingbird.me/*
// @match        *://forums.hummingbird.me/*
// @grant        none
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?1
// ==/UserScript==

var SCRIPT_NAME = 'Hummingbird Compatibility Hover';
var COMPAT_ID = 'hb-compat-area';
var LOAD_GIF = 'https://i.imgur.com/gX1lY9z.gif';
var DELAY_SEC = 0.75;
var CACHED = {};

var Util = {
  log: function () {
    var args = [].slice.call(arguments);
    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;');
    console.log.apply(console, args);
  },
  q: function(query, context) {
    return (context || document).querySelector(query);
  },
  qq: function(query, context) {
    return [].slice.call((context || document).querySelectorAll(query));
  },
  getJSON: function(url, load, error) {
    var xhr = new XMLHttpRequest();
    xhr.open('get', url);
    xhr.responseType = 'json';
    xhr.onload = function() {
      load(xhr.response);
    };
    xhr.onerror = error;
    xhr.send();
  },
  _style: document.head.appendChild(document.createElement('style')),
  addStyle: function(styles) {
    var sel, css, obj;
    var out = '';
    for(sel in styles) {
      obj = styles[sel];
      out += sel + '{';
      for(css in obj) {
        out += css + ':' + obj[css] + ';';
      }
      out += '}';
    }
    this._style.textContent += out;
  }
};

var hb = {
  getUserName: function(url) {
    return url.match(/\/users\/([a-z0-9_]+)/i)[1];
  }
};

var App = {
  userLinkRegex: /^https?:\/\/(forums\.)?hummingbird\.me\/users\/[^\/]+\/?(\?.*)?$/,

  styleUI: function() {
    var style = {
      '.hb-visible': {
        'visibility': 'visible',
        'opacity': 1,
        'transition': 'opacity .5s linear'
      },
      '.hb-hidden': {
        'visibility': 'hidden',
        'opacity': 0,
        'transition': 'visibility 0s .5s, opacity .5s linear'
      },
      '.hb-compat-percent': {
        'font-size': '32px',
        'font-weight': 'bold',
        'margin': '5px 10px 10px 10px'
      },
      '.hb-compat-header': {
        'font-size': '24px',
        'margin': '20px 10px 10px 10px'
      }
    };
    var id = '#' + COMPAT_ID;
    style[id] = {
      'font-family': '"Helvetica Neue", Helvetica, Arial, "Lucida Grande", sans-serif',
      'position': 'fixed',
      'background': 'white',
      'text-align': 'center',
      'box-shadow': '0px 0px 15px 0px rgba(0,0,0,0.75)',
      'border-top-left-radius': '5px',
      'max-width': '90%',
      'bottom': '0',
      'right': '0',
      'z-index': '10000',
      'line-height': '32px'
    };
    style[id + ' img'] = {
      'margin': '20px 50px 20px 50px'
    };
    Util.addStyle(style);
  },

  getCompatArea: function() {
    var compatArea = Util.q('#' + COMPAT_ID);

    if(!compatArea) {
      compatArea = document.createElement('div');
      compatArea.id = COMPAT_ID;
      compatArea.style.display = 'none';
      document.body.appendChild(compatArea);
    }

    return compatArea;
  },

  getCompatHTML: function(compat) {
    return '<h3 class="hb-compat-header">Compatibility is ' + compat.phrase + '</h3><div class="hb-compat-percent" style="color: ' + compat.color + '">' + compat.percent + '</div>';
  },

  showCompat: function(me, them) {
    if(me === them) return;
    if(Util.q('.signup-cta')) return; // not signed in

    var self = this;
    var area = this.getCompatArea();

    var cache = CACHED[me + '+' + them];
    if(cache) {
      area.innerHTML = self.getCompatHTML(cache);
    } else {
      area.innerHTML = '<img src="' + LOAD_GIF + '" />';
      Util.getJSON('https://hbird-cmp-node.herokuapp.com/compatibility/anime?user1=' + me + '&user2=' + them, function(compat) {
        CACHED[me + '+' + them] = compat;
        area.innerHTML = self.getCompatHTML(compat);
      });
    }
    area.style.display = '';
    setTimeout(function() {
      area.className = 'hb-visible';
    }, 0);
  },

  hideCompat: function() {
    var area = this.getCompatArea();
    area.className = 'hb-hidden';
    setTimeout(function() {
      area.style.display = 'none';
    }, 500);
  },

  _timeout: null,
  startHover: function(e) {
    App._timeout = setTimeout(function() {
      App._timeout = null;
      App.showCompat(hb.getUserName(Util.q('.dropdown-menu > li > a, #current-user > a').href), hb.getUserName(e.target.href));
    }, DELAY_SEC * 1000);
  },
  stopHover: function(e) {
    clearInterval(App._timeout);
    App.hideCompat();
  },

  start: function() {
    var self = this;
    Util.log('starting...');
    self.styleUI();
    waitForElems('a', function(link) {
      if(self.userLinkRegex.test(link.href)) {
        link.addEventListener('mouseenter', self.startHover);
        link.addEventListener('mouseleave', self.stopHover);
        link.addEventListener('click', self.stopHover);
      }
    });
  }

};

App.start();
