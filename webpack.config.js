const { resolve, relative } = require('path');
const { readFileSync } = require('fs');
const glob = require('glob');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// options is optional
const icons = glob
  .sync(resolve(__dirname, 'assets', 'icons', '**/*.svg'), {})
  .map((file) => {
    let fileContents = readFileSync(file, 'utf8');
    const pathName = relative(__dirname + '/assets', file);

    // prepare for symbols
    svgContents = fileContents;
    symbolContents = fileContents
      .replace(/<svg/, `<symbol id="${pathName}"`)
      .replace(/svg>/, 'symbol>');

    return { pathName, svgContents, symbolContents };
  });

module.exports = {
  mode: 'production',
  entry: {
    sprite: resolve(__dirname, './src/sprite.js'),
    lazyEmbeds: resolve(__dirname, './src/lazy-embeds.js')
  },
  output: {
    path: __dirname + '/dist'
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/sprite-js.ejs'),
      filename: 'sprite-js.html',
      templateParameters: { icons },
      inject: 'body',
      chunks: ['sprite']
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/sprite.ejs'),
      filename: 'sprite.html',
      templateParameters: { icons },
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/lazy-images.ejs'),
      filename: 'lazy-images.html',
      templateParameters: { icons },
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/lazy-embeds.ejs'),
      filename: 'lazy-embeds.html',
      templateParameters: { icons },
      inject: 'body',
      chunks: ['lazyEmbeds']
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/embeds.ejs'),
      templateParameters: { icons },
      filename: 'embeds.html',
      inject: false
    }),
    new HtmlWebpackPlugin({
      template: resolve(__dirname, './src/index.ejs'),
      filename: 'index.html',
      inject: false
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: 'assets' }]
    }),
    new CleanWebpackPlugin()
  ],

  module: {
    rules: [
      {
        test: /\.svg$/,
        use: [
          {
            loader: 'svg-sprite-loader',
            options: {
              symbolId: (filePath) => {
                return relative(__dirname + '/assets', filePath);
              }
            }
          },
          'svgo-loader'
        ]
      }
    ]
  }
};
