const path = require('path');
const glob = require('glob')

const WebpackUserscript = require('webpack-userscript')
const dev = true; // process.env.NODE_ENV === 'development'
const parseMeta = require('./src/../libs/parseMeta');
const fs = require('fs');


let entry =
  glob.sync(path.resolve('./src/*/*.@(js|es6)')).reduce((entries, entry) => {
    const entryName = path.parse(entry).name
    entries[entryName] = entry
    return entries
  }, {});
module.exports = {
  mode: 'development',
  entry,
 //watch: true,
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/dist/',
    filename: '[name].user.js',
    clean: true,
    chunkFilename: '[name].js'
  },


  plugins: [
    new WebpackUserscript({
      headers: function (data) {
       console.log(data);
        console.log(`${entry[data.chunkName]} --${data.chunkFilename} `)
        var d =
          parseMeta(fs.readFileSync(entry[data.basename], 'utf8'));
        console.log(d)
        return d;
      },
      pretty: true,
      metajs: false
    })
  ]
};