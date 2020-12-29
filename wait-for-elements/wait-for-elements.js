/**
 * waitForElems
 * @param {{
 *  sel: string;
 *  onmatch: (element: HTMLElement) => void,
 *  context?: HTMLElement;
 *  stop?: boolean;
 *  throttle?: number;
 * }} config
 */
function waitForElems({ sel, onmatch, context = document.body, stop = false, throttle = 300 }) {
  const matched = new WeakSet()
  let lastCheck = 0
  let checkId

  const check = () => {
    // throttle calls
    clearTimeout(checkId)
    const delta = Date.now() - lastCheck
    if (delta < throttle) {
      checkId = setTimeout(check, throttle - delta)
      return
    }
    lastCheck = Date.now()

    // look for matches
    Array.from(context.querySelectorAll(sel), elem => {
      if (matched.has(elem)) return
      matched.add(elem)
      onmatch(elem)
      if (stop) disconnect()
    })
  }

  // observe DOM for changes
  const observer = new MutationObserver(check)
  const connect = () => observer.observe(context, { subtree: true, childList: true })
  const disconnect = () => {
    clearTimeout(checkId)
    observer.disconnect()
  }

  // start waiting
  connect()

  // run initial check in case element is already on the page
  check()

  return { start: connect, stop: disconnect }
}

/**
 * waitForUrl
 * @param {RegExp | ((url: string) => boolean)} match
 * @param {(url: string) => void} onmatch
 * @param {boolean} stopLooking
 */
function waitForUrl(match, onmatch, stopLooking = false) {
  // url check supports custom fn or regex
  const isMatch = typeof match === 'function' ? match : url => match.test(url)

  // when popstate fires run check
  let lastUrl
  const check = () => {
    const url = location.href
    if (url !== lastUrl && isMatch(url)) {
      lastUrl = url
      onmatch(url)
      if (stopLooking) stop()
    }
  }
  let checkId
  const start = () => (checkId = setInterval(check, 300))
  const stop = () => clearInterval(checkId)

  // start listening
  start()

  // perform initial check since current url might be a match
  check()

  return { start, stop }
}
