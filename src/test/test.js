 var fs = require('fs');
 var glob = require('glob');
 var parseMeta = require('./../../libs/parseMeta.js');

 var fs = require('fs');

 
 const p = (...args) => (console.log(...args), args[0]);

 var test = 'Your awesome js code.';

 var filepath = './../auto-close-youtube-ads/auto-close-youtube-ads.user.js';


 var s = fs.readFileSync(filepath, 'utf8');

p(parseMeta)


 var data = parseMeta(s)



 p(data)