import buble from 'rollup-plugin-buble'
import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

export default {
  entry: 'src/plugin.js',
  format: 'cjs',
  dest: 'plugin/index.js',
  external: ['fs', 'path', 'webpack', 'webpack-sources'],
  plugins: [
    nodeResolve({ jsnext: true, main: true }),
    commonjs(),
    buble({ transforms: { forOf: false } })
  ]
};
