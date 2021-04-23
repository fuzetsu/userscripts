import parseMeta from './../../libs/parseMeta';


const p = (...args) => (console.log(...args), args[0]);

p(parseMeta(''));