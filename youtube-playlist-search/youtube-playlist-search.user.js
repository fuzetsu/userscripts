// ==UserScript==
// @name         YouTube Playlist Search
// @namespace    http://www.fuzetsu.com/YPS
// @version      1.0.0
// @description  Allows you to quickly search through youtube playlists
// @match        https://www.youtube.com/*
// @require      https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
// @copyright    2014+, fuzetsu
// @grant        none
// ==/UserScript==

const SCRIPT_NAME = 'YouTube Playlist Search';
const ITEM_SELECTOR = '#contents > ytd-playlist-video-renderer,ytd-grid-video-renderer';
const TEXT_SELECTOR = '#meta';
const OFFSET_AREA_SELECTOR = '#masthead-container';

const util = {
  log: (...args) => console.log(...[`%c${SCRIPT_NAME}`, 'font-weight: bold;color: hotpink;', ...args]),
  q: (query, context) => (context || document).querySelector(query),
  qq: (query, context) => Array.from((context || document).querySelectorAll(query)),
  debounce: (cb, ms) => {
    let id;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => cb(...args), ms);
    };
  }
};

const yps = {
  _items: [],
  render: () => {
    const commonStyles = [
      'position: fixed',
      `top: ${util.q(OFFSET_AREA_SELECTOR).clientHeight}px`,
      'z-index: 9000',
      'padding: 5px 8px',
      'border: 1px solid #999',
      'font-size: medium',
      'color: var(--yt-primary-text-color)',
      'margin: 0',
      'box-sizing: border-box',
      'background: var(--yt-main-app-background-tmp)'
    ];
    const txtSearch = document.createElement('input');
    txtSearch.type = 'text';
    txtSearch.placeholder = 'filter - start with ^ for inverse search';
    txtSearch.setAttribute('style', [
      ...commonStyles,
      'right: 0',
      'width: 300px'
    ].join(';'));
    txtSearch.onkeyup = util.debounce(e => resultCount.render(...yps.search(e.target.value)), 200);
    const resultCount = document.createElement('span');
    resultCount.render = (x, y, invert) => resultCount.textContent = `Showing ${x} of ${y} ${invert ? '(NOT)' : ''}`;
    resultCount.setAttribute('style', [
      ...commonStyles,
      'right: 300px'
    ].join(';'));
    [txtSearch, resultCount].forEach(elem => document.body.appendChild(elem));
    return { txtSearch, resultCount };
  },
  search: (query = '') => {
    const invert = query.startsWith('^');
    if(invert) query = query.slice(1);
    query = query.toLowerCase().trim().split(' ').map(q => q.trim()).filter(q => !!q);
    const count = yps._items
      .map(item => item.elem.style.display = query[invert ? 'some' : 'every'](q => item.name.includes(q)) ? (invert ? 'none' : '') : (invert ? '' : 'none'))
      .filter(x => x === '').length;
    return [count, yps._items.length, invert];
  },
  start: () => {
    util.log('Starting... waiting for playlist');
    waitForUrl(/^https:\/\/www\.youtube\.com\/(playlist\?list=|user\/[^\/]+\/videos|feed\/subscriptions).*/, () => {
      let urlWaitId, itemWait;
      const playlistUrl = location.href;
      const { txtSearch, resultCount } = yps.render();
      const refresh = util.debounce(() => resultCount.render(...yps.search(txtSearch.value)), 50);
      util.log('Reached playlist, adding search box');
      itemWait = waitForElems(ITEM_SELECTOR, item => {
        yps._items.push({
          elem: item,
          name: util.q(TEXT_SELECTOR, item).textContent.toLowerCase()
        });
        refresh();
      });
      urlWaitId = waitForUrl(url => url !== playlistUrl, () => {
        util.log('leaving playlist, cleaning up');
        itemWait.stop();
        [txtSearch, resultCount].forEach(elem => elem.remove());
        yps._items = [];
      }, true);
    });
  }
};

yps.start();
