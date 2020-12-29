# [Wait for Elements](https://greasyfork.org/en/scripts/5679-wait-for-elements)

Not really a userscript, but a utility for creating them.

Include it in your userscript using the `@require` directive:

```js
//@require https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
```

It provides 2 useful functions:

```js
/**
 * waitForElems
 * @param {{
 *  sel?: string;
 *  context?: HTMLElement;
 *  stop?: boolean;
 *  onmatch?: (element: HTMLElement) => void,
 *  onmutation?: (...args: Parameters<MutationCallback>) => void
 *  throttle?: number;
 *  config?: MutationObserverInit;
 * }} config (all args are optional, only provide what you want)
 */
function waitForElems(config) {}

/**
 * waitForUrl
 * @param {RegExp|(url: string) => boolean} match
 * @param {(url: string) => void} onmatch
 * @param {boolean} stopLooking (optional, false by default)
 */
function waitForUrl(regex, action, stopLooking) {}
```

The `regex` parameter of `waitForUrl` can be a function that
returns `true` or `false`, the function is called with the current url as
a parameter allowing you to define non regex based equality logic.
