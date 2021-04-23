"use strict";

var _parseMeta = _interopRequireDefault(require("./../../libs/parseMeta.mjs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var fs = require('fs');

var glob = require('glob');

var fs = require('fs');

var p = function p() {
  var _console;

  return (_console = console).log.apply(_console, arguments), arguments.length <= 0 ? undefined : arguments[0];
};

var test = 'Your awesome js code.';
var filepath = './../auto-close-youtube-ads/auto-close-youtube-ads.user.js';
var s = fs.readFileSync(filepath, 'utf8');
p(_parseMeta["default"]);
var data = (0, _parseMeta["default"])(s);
p(data);