/**
 * @param sel - the selector you want to wait for
 * @param action - the callback that will be executed when element/s matching the given selector are found, it is passed the array of found elements
 * @param stopLooking - if true the function will stop looking for more elements after the first match
 */
function waitForElems(sel, action, stopLooking) {
  var tick;
  var id = 'fke' + Math.floor(Math.random() * 12345);
  var type = window.MutationObserver ? 'M' : 'S';
  var lastMutation = Date.now();
  var lastCall = Date.now();
  var queuedCall;

  function throttle(func) {
    var now = Date.now();
    clearTimeout(queuedCall);
    // less than 100ms since last mutation
    if (now - lastMutation < 100) {
      // 500ms or more since last query
      if (now - lastCall >= 500) {
        func();
      }
      else {
        queuedCall = setTimeout(func, 100);
      }
    }
    else {
      func();
    }
    lastMutation = now;
  }

  function findElem(sel) {
    lastCall = Date.now();
    var found = [].filter.call(document.querySelectorAll(sel), function(elem) {
      return elem.dataset[id] !== 'y';
    });
    if (found.length > 0) {
      if (stopLooking) {
        type === 'M' ? tick.disconnect() : clearInterval(tick);
      }
      found.forEach(function(elem) {
        elem.dataset[id] = 'y';
        action(elem);
      });
    }
  }
  if (type === 'M') {
    tick = new MutationObserver(throttle.bind(null, findElem.bind(null, sel)));
    tick.observe(document.body, {
      subtree: true,
      childList: true
    });
  }
  else {
    tick = setInterval(findElem.bind(null, sel), 300);
  }
  findElem(sel);
  return {
    type: type,
    stop: function() {
      if (type === 'M') {
        tick.disconnect();
      }
      else {
        clearInterval(tick);
      }
    }
  };
}
/**
 * @param regex - should match the site you're waiting for
 * @param action - the callback that will be executed when a matching url is visited
 * @param stopLooking - if true the function will stop waiting for another url match after the first match
 */
function waitForUrl(regex, action, stopLooking) {
  function checkUrl(urlTest) {
    var url = window.location.href;
    if (url !== lastUrl && urlTest(url)) {
      if (stopLooking) {
        clearInterval(tick);
      }
      lastUrl = url;
      action();
    }
    lastUrl = url;
  }
  var urlTest = (typeof regex === 'function' ? regex : regex.test.bind(regex)),
    tick = setInterval(checkUrl.bind(null, urlTest), 300),
    lastUrl;
  checkUrl(urlTest);
  return tick;
}
