# Weex Downgrade Plugin

## Usage

```js
// webpack.config.js
var DowngradePlugin = require('webpack-plugin-downgrade')

module.exports = {
  entry: '...',
  output: '...',
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
    })
  ]
}
```
