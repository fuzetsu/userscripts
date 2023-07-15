// ==UserScript==
// @name Crunchyroll Video Utilities
// @version 1.0.5
// @namespace fuzetsu/csdvqn
// @description seek video with hotkeys and set default quality
// @match https://static.crunchyroll.com/*/player.html
// @match https://www.crunchyroll.com/*
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @require https://gitcdn.xyz/cdn/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require https://gitcdn.xyz/cdn/kufii/My-UserScripts/fa4555701cf5a22eae44f06d9848df6966788fa8/libs/gm_config.js
// @deprecated  true
// ==/UserScript==
/* globals unsafeWindow, GM_config, GM_registerMenuCommand, waitForElems */
const sep = '~~@~~'
const domain = 'https://www.crunchyroll.com'
const CSS = {
  quality: '.qualityMenuItemSelector',
  settings: '.settingsMenuButton,#settingsControl',
  playerBox: '#showmedia_video_player'
}

// use publicly exposed Player.js object to control video player
const vilosPlayer = () => unsafeWindow.VILOS_PLAYERJS

const qq = (q, c) => Array.from((c || document).querySelectorAll(q))
const q = (q, c) => (c || document).querySelector(q)

const config = GM_config([
  {
    key: 'quality',
    label: 'Quality',
    type: 'dropdown',
    values: ['auto', 360, 480, 720, 1080],
    default: 'auto'
  }
])

let cfg = config.load()

config.onsave = newCfg => {
  cfg = newCfg
  player.setQuality(cfg.quality)
}

const p = (...args) => (console.log(...args), args[0])

let isFullscreen = false

const player = {
  setQuality: quality => {
    const btn =
      quality !== 'auto'
        ? qq(CSS.quality)
            .slice(2)
            .find(item => quality >= parseInt(item.textContent))
        : qq(CSS.quality)[2]
    if (btn) {
      // this causes the menu to open
      btn.click()
      // so close it after a short delay
      setTimeout(player.toggleSettings, 200, false)
    }
  },
  fillTab: () => {
    const playerBox = q(CSS.playerBox)
    if (!playerBox) return p('playerbox not found')
    isFullscreen = !isFullscreen
    if (!isFullscreen) return playerBox.removeAttribute('style')
    Object.assign(playerBox.style, {
      position: 'fixed',
      zIndex: 1000,
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: '100%',
      height: '100%'
    })
  },
  nextEp: (back = false) =>
    q('.collection-carousel-media-link-current')
      .parentElement[back ? 'previousElementSibling' : 'nextElementSibling'].querySelector('a')
      .click(),
  prevEp: () => player.nextEp(true),
  skip: sec => vilosPlayer().getCurrentTime(curTime => vilosPlayer().setCurrentTime(curTime + sec)),
  volumeUp: (val = 10) => vilosPlayer().getVolume(curVol => vilosPlayer().setVolume(curVol + val)),
  volumeDown: (val = -10) => player.volumeUp(val),
  toggleSettings: makeVisible => {
    const btn = q(CSS.settings)
    if (typeof makeVisible === 'boolean') {
      const isVisible = p(!!btn.offSetParent, '=== isVisible')
      if (makeVisible === isVisible) return
    }
    btn.click()
  }
}

const seekKeys = {
  l: 85,
  b: -85,
  '}': 30,
  '{': -30,
  ']': 15,
  '[': -15
}

const handleKey = key =>
  key === 'n'
    ? player.nextEp()
    : key === 'p'
    ? player.prevEp()
    : key === 'j'
    ? player.volumeDown()
    : key === 'k'
    ? player.volumeUp()
    : key === 'w'
    ? player.fillTab()
    : key in seekKeys
    ? player.skip(seekKeys[key])
    : null

const isPlayerFrame = location.href.includes('static.crunchyroll.com')

/**
 * Keyboard events from within the player frame dont bubble up to main page where the player.js
 * object and the video links live, so use postMessage to send the keypresses there
 **/
const pass = ['INPUT', 'TEXTAREA', 'SELECT']
window.addEventListener(
  'keydown',
  isPlayerFrame
    ? e => window.parent.postMessage(sep + e.key, domain)
    : e => pass.includes(document.activeElement.nodeName) || handleKey(e.key)
)

if (isPlayerFrame) {
  // can only set quality from the player frame since the button is in its dom
  waitForElems({
    stop: true,
    sel: CSS.quality + '.selected',
    onmatch: elem => {
      if (elem.textContent.toLowerCase().includes(cfg.quality))
        return p('configured default already selected')
      player.setQuality(cfg.quality)
    }
  })
} else {
  // handle forwarded keyboard from player frame
  window.addEventListener(
    'message',
    ({ data }) => data.startsWith(sep) && handleKey(data.slice(sep.length))
  )
}

GM_registerMenuCommand('Crunchyroll Video Utilities - Config', config.setup)
