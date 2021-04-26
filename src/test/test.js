import parseMeta from './../../libs/parseMeta.mjs';
  


const p = (...args) => (console.log(...args), args[0]);

var test = 'Your awesome js code.';

var filepath = './../auto-close-youtube-ads/auto-close-youtube-ads.user.js';

var s = `
    // ==UserScript==
// @name        userscripts
// @version     0.0.1
// @description tampermonkey scripts
// @homepage    https://github.com/niubilityfrontend/userscripts#readme
// @supportURL  https://github.com/niubilityfrontend/userscripts/issues
// @match       *://*/*
// ==/UserScript==
</CDATASection>`;

p(parseMeta);

var data = parseMeta(s);

p(data);