// ==UserScript==
// @name Crunchyroll - Set Default Video Quality
// @version 1.0.0
// @namespace fuzetsu/csdvq
// @match https://static.crunchyroll.com/vilos/player.html
// @match https://www.crunchyroll.com/*
// @grant GM_registerMenuCommand
// @grant GM_getValue
// @grant GM_setValue
// @require https://raw.githubusercontent.com/fuzetsu/userscripts/b38eabf72c20fa3cf7da84ecd2cefe0d4a2116be/wait-for-elements/wait-for-elements.js
// @require https://raw.githubusercontent.com/kufii/My-UserScripts/master/libs/gm_config.js
// ==/UserScript==

const selector = '.qualityMenuItemSelector'

const qq = (q, c) => Array.from((c||document).querySelectorAll(q))

const config = GM_config([
  {
    key: 'quality',
    label: 'Quality',
    type: 'dropdown',
    values: ['auto', 360, 480, 720, 1080],
    default: 'auto',
  }
])

let cfg = config.load()

config.onsave = newCfg => {
  cfg = newCfg
  setQuality(cfg.quality)
}

const p = (...args) => (console.log(...args), args[0])

const isVideoPage = location.href.includes('https://static.crunchyroll.com/vilos/player.html')

const selectQuality = quality => quality !== 'auto'
  ? qq(selector).slice(2).find(item => quality >= parseInt(item.textContent)).click()
  : qq(selector)[2].click()

if(isVideoPage) {
  waitForElems({
    stop: true,
    sel: selector + '.selected',
    onmatch: elem => {
      if(elem.textContent.toLowerCase().includes(cfg.quality)) return console.log('configured default already selected')
      selectQuality(cfg.quality)
    }
  })  
}

GM_registerMenuCommand('Crunchyroll Player - Set Default Quality', config.setup)
