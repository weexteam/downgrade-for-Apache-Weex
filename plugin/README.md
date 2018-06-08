# Weex Downgrade Plugin

## Usage

```js
// webpack.config.js
var DowngradePlugin = require('webpack-plugin-downgrade')

var options = { /* downgrade options */ }

module.exports = {
  entry: '...',
  output: '...',
  plugins: [
    new DowngradePlugin(options)
  ]
}
```

## Options

+ `force`: Force downgrade.
+ `condition`: Downgrade if the env satisfies the specific condition.

### force

```js
new DowngradePlugin({ force: true })
```

If the `force` is set to `true`, it will ignore the condition params.

### condition

The format of the `condition` option is same as the argument of [Downgrade.condition()](../README.md).

```js
new DowngradePlugin({
  condition: {

    // Any condition is matched will be downgraded.
    ios: {
      osVersion: '>1.0',
      appVersion: '>1.0.0',
      weexVersion: '>1',
      deviceModel: ['iPhone5,1']
    },

    android: {
      osVersion: '>1.0',

      // Check condition with multiple app.
      // The `MY_APP_A` and `MY_APP_B` is WXEnvironment's appName param.
      appVersion: {
        MY_APP_A: '>1.0.0',
        MY_APP_B: '>3.0.0'
      },

      weexVersion: '>1',
      deviceModel: ['G-2PW2100']
    }
  }
})
```

### Different options for different chunks

The constructor can also accept an array which is a list of options. Here's an example:

```javascript
new DowngradePlugin([{
  // single chunk name
  chunk: 'page1',
  // options
  condition: { }
}, {
  // array of chunk names
  chunk: ['page2', 'page3'],
  // options
  force: true
}])
```

