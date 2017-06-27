import fs from 'fs'
import path from 'path'
import { ConcatSource } from 'webpack-sources'
import { generateDowngradeCode } from './utils.js'

const defaultCondition = {
}

export default class WeexDowngradePlugin {
  constructor (options) {
    this.options = options || {}
  }

  apply (compiler) {
    const code = generateDowngradeCode(this.options)

    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        // console.log(' => optimize-chunk-assets\n')
        chunks.forEach((chunk) => {
          if ('isInitial' in chunk && !chunk.isInitial()) return;

          chunk.files.forEach(file => {
            compilation.assets[file] = new ConcatSource(code, compilation.assets[file])
          })
        })
        callback()
      })

      compilation.plugin('additional-assets', callback => {
        // console.log(' => additional-assets\n')
        callback()
      })

      // compilation.plugin('additional-chunk-assets', chunks => {
      //   // console.log(console.log(chunks))
      //   chunks.forEach(chunk => {
      //     // console.log(Object.keys(chunk))
      //     console.log(chunk.modules)
      //   })
      // })
    })

    // compiler.plugin('emit', (compilation, callback) => {
    //   var assets = compilation.assets;
    //   console.log(Object.keys(assets))
    // })
  }
}
