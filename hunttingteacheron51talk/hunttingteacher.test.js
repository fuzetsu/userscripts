"use strict";

var a = 10;
var b = function b(m) {
  if (m < 2) return 1;
  return m * b(m - 1);
};
console.log(b());
//# sourceMappingURL=hunttingteacher.test.js.map