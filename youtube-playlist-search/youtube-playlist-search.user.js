// ==UserScript==
// @name         YouTube Playlist Search
// @namespace    http://www.fuzetsu.com/YPS
// @version      1.1.3
// @description  Allows you to quickly search through youtube playlists
// @match        https://www.youtube.com/*
// @require      https://cdn.rawgit.com/fuzetsu/userscripts/477063e939b9658b64d2f91878da20a7f831d98b/wait-for-elements/wait-for-elements.js
// @copyright    2014+, fuzetsu
// @grant        none
// @deprecated   true
// ==/UserScript==

const SCRIPT_NAME = 'YouTube Playlist Search'
const ITEM_SELECTOR = '#contents > ytd-playlist-video-renderer,ytd-grid-video-renderer'
const ITEM_PROGRESS_SELECTOR = ITEM_SELECTOR + ' #progress'
const TEXT_SELECTOR = '#meta'
const OFFSET_AREA_SELECTOR = '#masthead-container'

const util = {
  log: (...args) => console.log(`%c${SCRIPT_NAME}`, 'font-weight: bold;color: hotpink;', ...args),
  q: (query, context) => (context || document).querySelector(query),
  qq: (query, context) => Array.from((context || document).querySelectorAll(query)),
  debounce:
    (cb, ms, id) =>
    (...args) => {
      clearTimeout(id)
      id = setTimeout(() => cb(...args), ms)
    },
  makeElem: (tag, attrs) => {
    const elem = document.createElement(tag)
    Object.entries(attrs).forEach(([attr, val]) =>
      !['style'].includes(attr) && attr in elem ? (elem[attr] = val) : elem.setAttribute(attr, val)
    )
    return elem
  }
}

const yps = {
  _items: [],
  hideWatched: false,
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
    ]
    const txtSearch = util.makeElem('input', {
      type: 'text',
      placeholder: 'filter - start with ^ for inverse search',
      style: [...commonStyles, 'right: 0', 'width: 300px'].join(';'),
      onkeyup: util.debounce(e => resultCount.render(...yps.search(e.target.value)), 200)
    })
    const resultCount = util.makeElem('span', {
      style: [...commonStyles, 'right: 300px'].join(';'),
      textContent: '-'
    })
    resultCount.render = (x, y, invert) =>
      (resultCount.childNodes[0].textContent = `Showing ${x} of ${y} ${
        invert ? '(NOT)' : ''
      } | Hide Watched `)
    const toggleWatched = util.makeElem('input', {
      type: 'checkbox',
      value: yps.hideWatched,
      onchange: () => (
        (yps.hideWatched = toggleWatched.checked),
        resultCount.render(...yps.search(txtSearch.value))
      )
    })
    resultCount.appendChild(toggleWatched)
    ;[txtSearch, resultCount].forEach(elem => document.body.appendChild(elem))
    return { txtSearch, resultCount }
  },
  search: (query = '') => {
    const invert = query.startsWith('^')
    if (invert) query = query.slice(1)
    query = query
      .toLowerCase()
      .trim()
      .split(' ')
      .map(q => q.trim())
      .filter(q => !!q)
    const count = yps._items
      .map(item => {
        const hideBecauseWatched = yps.hideWatched && item.watched
        let hide =
          hideBecauseWatched || !query[invert ? 'some' : 'every'](q => item.name.includes(q))
        if (invert && !hideBecauseWatched) hide = !hide
        item.elem.style.display = hide ? 'none' : ''
        return hide
      })
      .filter(hide => !hide).length
    return [count, yps._items.length, invert]
  },
  start: () => {
    util.log('Starting... waiting for playlist')
    waitForUrl(
      /^https:\/\/www\.youtube\.com\/(playlist\?list=|(user|channel)\/[^\/]+\/videos|feed\/subscriptions).*/,
      () => {
        util.log('Reached playlist, adding search box')
        const playlistUrl = location.href
        const { txtSearch, resultCount } = yps.render()
        const refresh = util.debounce(() => resultCount.render(...yps.search(txtSearch.value)), 50)
        const itemWait = waitForElems({
          sel: ITEM_SELECTOR,
          onmatch: elem => {
            yps._items.push({
              elem,
              name: util.q(TEXT_SELECTOR, elem).textContent.toLowerCase(),
              watched: false
            })
            refresh()
          }
        })
        const progressWait = waitForElems({
          sel: ITEM_PROGRESS_SELECTOR,
          onmatch: prog => {
            const watched = parseInt(prog.style.width) > 50
            if (!watched) return
            const itemElem = prog.closest(ITEM_SELECTOR)
            const found = yps._items.find(item => item.elem === itemElem)
            if (!found)
              return console.log('error, unable to find item parent', prog, itemElem, found)
            found.watched = watched
            if (yps.hideWatched && watched) refresh()
          }
        })
        const urlWaitId = waitForUrl(
          url => url !== playlistUrl,
          () => {
            util.log('leaving playlist, cleaning up')
            ;[progressWait, itemWait, urlWaitId].forEach(
              wait => (wait.stop && wait.stop()) || clearInterval(wait)
            )
            ;[txtSearch, resultCount].forEach(elem => elem.remove())
            yps._items = []
          },
          true
        )
      }
    )
  }
}

yps.start()
