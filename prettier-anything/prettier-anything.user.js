// ==UserScript==
// @name         Prettier Anything
// @namespace    prettier-anything
// @author       fuzetsu
// @version      0.0.2
// @description  Apply prettier formatting to any text input
// @match        *://*/*
// @grant        GM_setClipboard
// ==/UserScript==
/* global prettier prettierPlugins GM_setClipboard */

const p = (...args) => (console.log(...args), args[0])

const deps = [
  'https://unpkg.com/prettier/standalone.js',
  'https://unpkg.com/prettier/parser-babylon.js'
]

let loaded = false
const load = () => {
  if (loaded) return Promise.resolve(true)
  loaded = true
  return Promise.all(
    deps.map(
      dep =>
        new Promise(res => {
          const script = document.createElement('script')
          script.async = true
          script.src = dep
          script.onload = () => res()
          document.body.appendChild(script)
        })
    )
  )
}

window.addEventListener('keydown', e => {
  if (e.altKey && e.shiftKey && e.key === 'I') {
    const code = document.getSelection().toString()
    const clip = e.ctrlKey
    p('key combo HIT, selection = ', code, '; clip = ', clip)
    if (!code) return p('no selection, so nothing to do')
    e.preventDefault()
    p('--- PRETTIER START ---')
    p('Loading Prettier')
    const loadStart = Date.now()
    load().then(() => {
      p('Loaded, delta = ', Date.now() - loadStart)
      const formatted = prettier.format(code, {
        parser: 'babel',
        plugins: prettierPlugins,
        printWidth: 100,
        semi: false,
        singleQuote: true
      })
      if (clip) {
        GM_setClipboard(formatted)
        document.getSelection().empty()
      } else {
        document.execCommand('insertText', false, formatted)
      }
      p('BEFORE:\n', code)
      p('AFTER:\n', formatted)
      p('--- PRETTIER END ---')
    })
    return false
  }
})
