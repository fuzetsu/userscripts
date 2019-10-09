// ==UserScript==
// @name         Prettier Anything
// @namespace    prettier-anything
// @author       fuzetsu
// @version      0.0.4
// @description  Apply prettier formatting to any text input
// @match        *://*/*
// @grant        GM_setClipboard
// @grant        GM_xmlhttpRequest
// ==/UserScript==
/* global prettier prettierPlugins GM_setClipboard, GM_xmlhttpRequest */

'use strict'

const deps = [
  'https://unpkg.com/prettier/standalone.js',
  'https://unpkg.com/prettier/parser-babylon.js'
]

const loadDep = url =>
  new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url,
      onload: res => resolve(res.responseText),
      onerror: () => reject(new Error(`Failed to load ${url}`))
    })
  })

const config = {
  parser: 'babel',
  printWidth: 100,
  semi: false,
  singleQuote: true
}

const p = (...args) => (console.log(...args), args[0])

let loaded = false
const load = () => {
  if (loaded) return
  loaded = true
  return Promise.all(deps.map(loadDep)).then(scripts => scripts.map(eval)) // eslint-disable-line no-eval
}

const getSelection = () => {
  const elem = document.activeElement
  if (['INPUT', 'TEXTAREA'].includes(elem.nodeName)) {
    const { selectionStart: start, selectionEnd: end } = elem
    return elem.value.slice(start, end)
  } else if (elem.contentEditable) {
    if (!document.getSelection().toString()) return
    document.execCommand('copy')
    return navigator.clipboard.readText()
  } else {
    return document.getSelection().toString()
  }
}

const insertText = text => {
  const elem = document.activeElement
  if (['INPUT', 'TEXTAREA'].includes(elem.nodeName) && typeof InstallTrigger !== 'undefined') {
    console.log('blahhh')
    const { selectionStart: start, selectionEnd: end } = elem
    elem.value = elem.value.slice(0, start) + text + elem.value.slice(end)
  } else {
    document.execCommand('insertText', false, text)
  }
}

window.addEventListener('keydown', e => {
  console.log(e)
  if (e.altKey && e.shiftKey && e.key.toUpperCase() === 'I') {
    ;(async () => {
      const code = await getSelection()
      const clip = e.ctrlKey
      p('key combo HIT, selection = ', code, '; clip = ', clip)
      if (!code) return p('no selection, so nothing to do')
      e.preventDefault()
      p('--- PRETTIER START ---')
      p('Loading Prettier')
      const loadStart = Date.now()

      await load()
      p('Loaded, delta = ', Date.now() - loadStart)
      const formatted = prettier.format(code, {
        ...config,
        plugins: prettierPlugins
      })
      if (clip) {
        GM_setClipboard(formatted)
        document.getSelection().empty()
      } else {
        insertText(formatted)
      }
      p('BEFORE:\n', code)
      p('AFTER:\n', formatted)
      p('--- PRETTIER END ---')
    })()
    return false
  }
})
