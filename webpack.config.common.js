const path = require('path');
const merge = require('webpack-merge');
const webpack = require('webpack');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");


const {
  PATHS,
  PARAMS
} = require('./helpers.js');
const devMode = process.env.NODE_ENV === 'development';

let entry = {
  'polyfills': path.join(PATHS.src, 'polyfills.browser.ts'),
  'main': path.join(PATHS.projectPath, 'main.ts'),
  'extform': path.join(PATHS.apps, 'extform/main.ts'),
  'style': path.join(PATHS.assets, 'sass', 'app.sass')
};

PARAMS.themes.forEach(theme => {
  entry['themes/' + theme + '/theme'] = path.join(PATHS.themes, theme, 'theme.scss')
});

module.exports = {
  context: PATHS.root,
  target: 'web',
  entry,
  resolve: {
    extensions: ['.ts', '.js', '.json'],
    modules: [PATHS.src, PATHS.node_modules],
  },
  mode: process.env.NODE_ENV,
  stats: 'errors-only',
  module: {
    rules: [{
        test: /\.ts$/,
        loader: '@ngtools/webpack',
        exclude: [/\.(spec|e2e)\.ts$/, /node_modules/],
      },
      {
        test: /\.ts$/,
        loader: 'null-loader',
        include: [/\.(spec|e2e)\.ts$/],
      },
      {
        test: /\.json$/,
        use: 'json-loader'
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
        }],
      },
      {
        test: /\.(eot|woff|woff2|ttf|png|jpg|gif|svg|ico)(\?v=\d+\.\d+\.\d+)?$/,
        loader: 'file-loader',
        options: {
          context: PATHS.assets,
          name: '[path][name].[ext]'
        },
      },
      {
        test: /\.css$/,
        use: [
          MiniCssExtractPlugin.loader,
          "css-loader"
        ],
        exclude: [path.join(PATHS.projectPath), path.join(PATHS.src, 'common'), path.join(PATHS.src, 'common-bill')],
      },
      {
        test: /\.css$/,
        include: [path.join(PATHS.projectPath), path.join(PATHS.src, 'common'), path.join(PATHS.src, 'common-bill')],
        use: [{
          loader: "raw-loader" // creates style nodes from JS strings
        }],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
        exclude: [path.join(PATHS.projectPath), path.join(PATHS.src, 'common'), path.join(PATHS.src, 'common-bill')],
      },
      {
        test: /\.(scss|sass)$/,
        use: [{
            loader: "raw-loader" // creates style nodes from JS strings
          },
          {
            loader: "sass-loader", // compiles Sass to CSS
            options: {
              sourceMap: true
            }
          }
        ],
        include: [path.join(PATHS.projectPath), path.join(PATHS.src, 'common'), path.join(PATHS.src, 'common-bill')],
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all"
        }
      }
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
    }),
    //new webpack.IgnorePlugin(/vertx/),
    new ProgressPlugin(),
  
  ]
};