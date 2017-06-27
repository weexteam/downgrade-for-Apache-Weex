// webpack.config.js
var path = require('path')
var webpack = require('webpack')
var DowngradePlugin = require('../plugin')

module.exports = {
  entry: path.join(__dirname, 'entry.js'),
  output: {
    filename: 'output.js',
    path: path.join(__dirname)
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }, {
        test: /\.vue(\?[^?]+)?$/,
        loaders: ['weex-loader']
      }
    ]
  },
  plugins: [
    new DowngradePlugin({
      condition: {
        ios: {
          osVersion: '>1.0',
          appVersion: '>1.0.0',
          weexVersion: '>1',
          deviceModel: ['iPhone5,1']
        },
        android: {
          osVersion: '>1.0',
          appVersion: '>1.0.0',
          weexVersion: '>1',
          deviceModel: ['G-2PW2100']
        }
      }
    }),
    new webpack.BannerPlugin({
      banner: '// { "framework": "Vue" }\n',
      raw: true
    })
  ]
}
