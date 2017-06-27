import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'
import uglify from 'rollup-plugin-uglify'

export default {
  moduleName: 'WeexDowngrade',
  entry: 'src/index.js',
  format: 'umd',
  dest: 'plugin/downgrade.js',
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    buble({ transforms: { forOf: false } }),
    uglify()
  ]
};
