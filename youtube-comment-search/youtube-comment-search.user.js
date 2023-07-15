// ==UserScript==
// @name        YouTube Comment Search
// @namespace   yt-comment-search
// @match       https://www.youtube.com/*
// @grant       none
// @version     1.1
// @author      fuz
// @description Search textbox with live filtering for YouTube comments
// @require     https://cdn.jsdelivr.net/gh/fuzetsu/userscripts@ec863aa92cea78a20431f92e80ac0e93262136df/wait-for-elements/wait-for-elements.js
// ==/UserScript==

/**
 * Constants
 */
const COMMENT_SEL = '#sections > div:nth-child(3) > ytd-comment-thread-renderer'
const COMMENTS_AREA_SEL = '#comments'
const APP_ID = 'yt-comment-search'
const RESULT_COUNT_ID = 'yt-comment-search__result-count'
const FILTER_BATCH_SIZE = 15

/**
 * Utils
 */
const $ = query => document.querySelector(query)
const $$ = query => Array.from(document.querySelectorAll(query))
const debounce = (ms, fn) => {
  let id
  return (...args) => {
    clearTimeout(id)
    id = setTimeout(fn, ms, ...args)
  }
}

/**
 * App
 */
const findComments = () => $$(COMMENT_SEL)
const updateResultCount = text => {
  const resultCount = $('#' + RESULT_COUNT_ID)
  if (resultCount) resultCount.textContent = text
}

let filtering
const filter = (term, comments = findComments()) => {
  term = term.trim().toLowerCase()
  updateResultCount('')
  let foundCount = 0
  const batchUpdateDisplay = (index = 0) => {
    const batch = comments.slice(index, FILTER_BATCH_SIZE + index)
    if (batch.length <= 0) return
    batch.forEach(comment => {
      const shouldShow = !term || comment.textContent.toLowerCase().includes(term)
      if (shouldShow) foundCount += 1
      comment.style.display = shouldShow ? '' : 'none'
    })
    if (term) updateResultCount(`matches ${foundCount} out of ${comments.length}`)
    filtering = requestAnimationFrame(() => batchUpdateDisplay(index + FILTER_BATCH_SIZE))
  }
  batchUpdateDisplay()
}

let watching
const watch = term => {
  let items = []
  stop(false)
  watching = setInterval(() => {
    const newItems = findComments()
    if (newItems.length !== items.length) filter(term, newItems)
    items = newItems
  }, 100)
}

const stop = (reset = true) => {
  clearInterval(watching)
  cancelAnimationFrame(filtering)
  if (reset) filter('')
}

const mountSearch = () => {
  const commentsArea = $(COMMENTS_AREA_SEL)
  if (!commentsArea) return

  $('#' + APP_ID)?.remove()

  const app = document.createElement('div')
  app.id = APP_ID
  app.style.cssText = `
    position: relative;
    margin-top: 8px;
  `

  const searchBox = document.createElement('input')
  searchBox.placeholder = 'Search comments'
  searchBox.style.cssText = `
    display: block;
    box-sizing: border-box;
    font-size: large;
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid #ddd;
  `

  const handleChange = debounce(200, term => (term.length > 1 ? watch(term) : stop()))
  searchBox.addEventListener('input', e => handleChange(e.target.value.trim()))

  const resultCount = document.createElement('span')
  resultCount.id = RESULT_COUNT_ID
  resultCount.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    align-items: center;
    font-size: large;
    color: rgba(0,0,0,0.5);
  `

  app.append(searchBox, resultCount)
  commentsArea.parentElement.insertBefore(app, commentsArea)
}

waitForUrl(
  () => true,
  url => {
    stop()
    if (/^https:\/\/www\.youtube\.com\/watch\?.*v=.+/.test(url)) {
      waitForElems({ sel: COMMENTS_AREA_SEL, stop: true, onmatch: mountSearch })
    }
  }
)
