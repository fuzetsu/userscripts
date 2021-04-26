module.exports = function (api) {
  //api.cache(true);

  return {
    minified: false,
  //  "only": ["**/*.mjs", "*/*.mjs", "**/*.es6", "*/*.es6"],  //此处如果不注释，则需要在调用出 排除 *.js, 否则 js文件babel-loader出错
    presets: [
      [
        '@babel/env',
        {
          targets: {
            edge: '17',
            firefox: '60',
            chrome: '67',
            safari: '11.1',
            esmodules: false
          },
          useBuiltIns: 'usage',
          corejs: '3',
          // caller.target will be the same as the target option from webpack
          targets: api.caller(caller => caller && caller.target === 'node') ?
            {
              node: 'current'
            } :
            {
              chrome: '58',
              ie: '11'
            }
        }
      ],
      '@babel/preset-react'
    ],
    plugins: [
      [
        '@babel/plugin-transform-arrow-functions',
        {
          spec: false
        }
      ],

      '@babel/plugin-proposal-do-expressions',
      '@babel/plugin-proposal-export-default-from',
      '@babel/plugin-proposal-export-namespace-from',
      '@babel/plugin-proposal-function-bind',
      '@babel/plugin-proposal-function-sent',
      '@babel/plugin-proposal-json-strings',
      '@babel/plugin-proposal-logical-assignment-operators',
      '@babel/plugin-proposal-nullish-coalescing-operator',
      '@babel/plugin-proposal-numeric-separator',
      '@babel/plugin-proposal-optional-chaining',
      [
        '@babel/plugin-proposal-pipeline-operator',
        {
          proposal: 'minimal'
        }
      ],
      '@babel/plugin-proposal-throw-expressions',
      '@babel/plugin-syntax-dynamic-import',
      '@babel/plugin-syntax-import-meta',
      '@babel/plugin-transform-member-expression-literals',
      '@babel/plugin-transform-property-literals',
      '@babel/plugin-proposal-class-properties',
      [
        '@babel/plugin-proposal-decorators',
        {
          legacy: true
        }
      ],
      'babel-plugin-transform-merge-sibling-variables',
      'babel-plugin-minify-numeric-literals',

      ['@babel/plugin-transform-shorthand-properties'],
      ['@babel/plugin-transform-parameters'],
      [
        '@babel/plugin-transform-block-scoping',
        {
          throwIfClosureRequired: true
        }
      ],
      [
        '@babel/plugin-transform-modules-commonjs',
        {
          allowTopLevelThis: true,
          noInterop: true,
          lazy: true
        }
      ]
    ]
  }
}