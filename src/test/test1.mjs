import parseMeta from './../../libs/parseMeta.mjs';


const p = (...args) => (console.log(...args), args[0]);

p(parseMeta(''));