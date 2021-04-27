const path = require('path');
const glob = require('glob')

const WebpackUserscript = require('webpack-userscript')
const isDev = false; // process.env.NODE_ENV === 'development' 
const fs = require('fs');


let entry =
  glob.sync(path.resolve('./src/*/*.@(js|es6|mjs|cjs|ts)')).reduce((entries, entry) => {
    const entryName = path.parse(entry).name
    entries[entryName] = entry
    return entries
  }, {});

let parseMeta = script =>
  script
  .slice(script.indexOf('==UserScript=='), script.indexOf('==/UserScript=='))
  .split('\n')
  .map(line => line.match(/^\s*[\/]{2,}\s*@(\S+)\s+(.+)/i))
  .filter(match => !!match)
  .reduce((result, [, key, value]) => {
    if (Object.keys(result).includes(key)) {
      if (Array.isArray(result[key])) {
        result[key].push(value);
      } else {
        result[key] = [result[key], value];
      }
    } else {
      result[key] = value;
    }
    return result;
  }, {});


module.exports = {
  mode: isDev ? 'development' : 'production',
  optimization: {
    minimize: false,
  },
  entry,

  //watch: true,
  // stats: "errors-only",
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '[name].js',
    clean: true,
    chunkFilename: '[name].js',

  },
  module: {
    rules: [{
      test: /\.mjs|\.es6|\.js$/, //不能对js文件进行babel,有文件有问题
      include: [path.resolve('./libs'), path.resolve('./src')],
      exclude: /node_modules/, //不需要对第三方模块进行转换，耗费性能
      loader: "babel-loader", //bable-loader打通了webpack和bable  bable-core
      options: {}
    }]
  },
  resolve: {
    // modules: [path.resolve(__dirname, 'libs'), 'node_modules'],
    extensions: ['.es6', '.mjs', '.cjs', '.js', '.json', '.wasm'],
    alias: {
      '@libs': path.resolve('./libs') // 直接引用src源码
    }
  },
  target: 'web',
  plugins: [
    new WebpackUserscript({
      headers: function (data) {
        let origionpath = entry[data.chunkName];
        if (!fs.existsSync(origionpath)) {
          console.log(data);
          console.log(`--${data.chunkName}  --  ${entry[data.chunkName]}  
          
          END-------------------------
          `);
          return {};
        } else {
          return parseMeta(fs.readFileSync(origionpath, 'utf8'));
        }
      },
      pretty: true,
      metajs: false
    })
  ]
};