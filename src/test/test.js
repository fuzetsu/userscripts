import parseMeta from './../../libs/parseMeta.mjs';
  


const p = (...args) => (console.log(...args), args[0]);

var test = 'Your awesome js code.';

var filepath = './../auto-close-youtube-ads/auto-close-youtube-ads.user.js';

var s = ''

p(parseMeta);

var data = parseMeta(s);

p(data);