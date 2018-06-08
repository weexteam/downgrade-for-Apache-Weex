import fs from 'fs'
import path from 'path'
import { ConcatSource } from 'webpack-sources'
import { generateDowngradeCode } from './utils.js'

export default class WeexDowngradePlugin {
  constructor (options) {
    this.options = Array.isArray(options)
      ? options.filter(option => option && (option.condition || option.force))
      : [Object.assign({ chunk: true }, options)]
    this.codes = {}
  }

  generateDowngradeCode(i) {
    const { codes } = this
    if (typeof codes[i] === 'undefined') {
      codes[i] = generateDowngradeCode(this.options[i])
    }
    return codes[i]
  }

  getCode(chunkname) {
    const { options } = this
    const { length } = options
    for (let i = 0; i < length; i++) {
      const { chunk } = options[i]
      if (chunk === true || chunk === chunkname || (Array.isArray(chunk) && chunk.indexOf(chunkname) > -1)) {
        return this.generateDowngradeCode(i)
      }
    }
    return ''
  }

  apply (compiler) {
    compiler.plugin('compilation', compilation => {
      compilation.plugin('optimize-chunk-assets', (chunks, callback) => {
        // console.log(' => optimize-chunk-assets\n')
        chunks.forEach((chunk) => {
          if ('isInitial' in chunk && !chunk.isInitial()) return;

          const code = this.getCode(chunk.name)
          if (code) {
            const { assets } = compilation;
            chunk.files.forEach(file => {
              assets[file] = new ConcatSource(code, assets[file])
            })
          }
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
