import resolve from 'rollup-plugin-node-resolve';
import copy from "rollup-copy-plugin";

export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundles/oidc-implicit-core.umd.js',
    sourceMap: true,
    format: 'umd',
    name: 'oidc-implicit-core',
  },
  plugins: [
    resolve({
      // use "module" field for ES6 module if possible
      module: true // Default: true
    }),
    copy({
      "clean-hash-fragment.js": "dist/clean-hash-fragment.js",
    })
  ]
}
