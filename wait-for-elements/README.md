# [Wait for Elements](https://greasyfork.org/en/scripts/5679-wait-for-elements)

Not really a userscript, but a utility for creating them.

Include it in your userscript using the `@require` directive: 
```js
//@require https://greasyfork.org/scripts/5679-wait-for-elements/code/Wait%20For%20Elements.js?version=122976
```

It provides 2 useful functions:

```js
/**
 * @param sel         - css selector you are waiting for
 * @param action      - the callback that will be executed when element(s) 
 *                      matching the given selector are found, it is called
 *                      once for every element matching the selector
 * @param stopLooking - if true the function will stop looking for 
 *                      more elements after the first match
 */
function waitForElems(sel, action, stopLooking)

/**
 * @param       regex - should match the site you're waiting for
 * @param      action - the callback that will be executed when a matching url 
 *                      is visited
 * @param stopLooking - if true the function will stop waiting
 *                      for another url match after the first match
 */
function waitForUrl(regex, action, stopLooking)
```

The `regex` parameter of `waitForUrl` can be a function that
returns `true` or `false`, the function is called with the current url as
a parameter allowing you to define non regex based equality logic.