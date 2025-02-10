// ==UserScript==
// @name         YouTube Playlist Time
// @namespace    http://www.fuzetsu.com/WLFT
// @version      1.2.13
// @description  Shows the total time it would take to watch all the videos in a YouTube playlist
// @match        https://www.youtube.com/*
// @require      https://cdn.jsdelivr.net/gh/fuzetsu/userscripts@ec863aa92cea78a20431f92e80ac0e93262136df/wait-for-elements/wait-for-elements.js
// @copyright    MIT
// @grant        none
// @deprecated   true
// ==/UserScript==

const SCRIPT_NAME = 'YouTube Playlist Time'
const HOLDER_SELECTOR = '.metadata-stats, .page-header-sidebar yt-content-metadata-view-model'
const TIMESTAMP_SELECTOR =
  'ytd-browse:not([hidden]) span.ytd-thumbnail-overlay-time-status-renderer'
const EL_ID = 'us-total-time'
const EL_ID2 = '.page-header-sidebar yt-content-metadata-view-model > div:last-of-type > span:last-of-type'
const EL_TYPE = 'yt-formatted-string'
const EL_CLASS = 'style-scope ytd-playlist-sidebar-primary-info-renderer'

const util = {
  log() {
    const args = [].slice.call(arguments)
    args.unshift('%c' + SCRIPT_NAME + ':', 'font-weight: bold;color: #233c7b;')
    console.log.apply(console, args)
  },
  q: (query, context) => (context || document).querySelector(query),
  qq: (query, context) => [].slice.call((context || document).querySelectorAll(query)),
  bindEvt: (target, events) =>
    events.forEach(function (evt) {
      target.addEventListener(evt[0], evt[1])
    }),
  unbindEvt: (target, events) =>
    events.forEach(function (evt) {
      target.removeEventListener(evt[0], evt[1])
    }),
  throttle(callback, limit) {
    let wait = false
    return function () {
      if (!wait) {
        callback.apply(this, arguments)
        wait = true
        setTimeout(function () {
          wait = false
        }, limit)
      }
    }
  }
}

// converts a timestring to seconds
const calcTimeString = str =>
  str
    .split(':')
    .reverse()
    .reduce(function (last, cur, idx) {
      cur = parseInt(cur, 10)
      switch (idx) {
        case 0: // seconds
          return last + cur
        case 1: // minutes
          return last + cur * 60
        case 2: // hours
          return last + cur * 60 * 60
        default:
          return 0
      }
    }, 0)

// pads an integer with zeroes
const padTime = time => ('0' + time).slice(-2)

// calculates the total amount of time necessary to watch all the videos in the playlist and outputs the result
const setTime = seconds => {
  const loc = getTimeLoc()
  const hours = Math.floor(seconds / 60 / 60)
  seconds = seconds % (60 * 60)
  const minutes = Math.floor(seconds / 60)
  seconds = seconds % 60
  loc.innerHTML = (
    ((hours || '') && hours + ' hours ') +
    ((minutes || '') && minutes + ' minutes ') +
    ((seconds || '') && seconds + ' seconds')
  ).trim()
}

const getTimeLoc = function () {
  let loc = util.q('#' + EL_ID)
  if (!loc) {
    loc = util.q(HOLDER_SELECTOR).appendChild(document.createElement(EL_TYPE))
    loc.removeAttribute('is-empty')
    loc.id = EL_ID
    loc.className = EL_CLASS
  }

  let loc2 = util.q(EL_ID2)
  if (loc2) {
    if (loc2.getAttribute('data-playlist-time') === null) {
      const separator = loc2.previousElementSibling.cloneNode(true);
      const playlistTime = loc2.cloneNode(true);
      loc2.parentElement.appendChild(separator);
      loc2.parentElement.appendChild(playlistTime).setAttribute('data-playlist-time', '');
      return playlistTime
    }
    return loc2
  }

  return loc
}

const timeLocExists = () => !!util.q('#' + EL_ID)

let lastLength = 0
const calcTotalTime = (force = false) => {
  const timestamps = util.qq(TIMESTAMP_SELECTOR)
  if (!force && timestamps.length === lastLength && timeLocExists()) return
  lastLength = timestamps.length
  const totalSeconds = timestamps
    .map(ts => ts.textContent.trim())
    .filter(ts => ts.includes(':'))
    .reduce((total, ts) => total + calcTimeString(ts), 0)
  setTime(totalSeconds)
}

const events = [['mousemove', util.throttle(calcTotalTime, 500)]]

util.log('Started, waiting for playlist')

let timeoutId
waitForUrl(/^https:\/\/www\.youtube\.com\/playlist\?list=.+/, () => {
  const playlistUrl = location.href
  clearTimeout(timeoutId)
  util.log('Reached playlist, waiting for display area to load')
  waitForElems({
    sel: HOLDER_SELECTOR,
    stop: true,
    onmatch() {
      util.log('display area loaded, calculating time.')
      timeoutId = setTimeout(() => {
        util.bindEvt(window, events)
        calcTotalTime(true)
        waitForUrl(
          url => url !== playlistUrl,
          () => {
            util.log('Leaving playlist, removing listeners')
            util.unbindEvt(window, events)
            const loc = getTimeLoc()
            if (loc) loc.remove()
          },
          true
        )
      }, 500)
    }
  })
})
