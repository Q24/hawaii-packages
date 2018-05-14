export default {
  input: 'dist/index.js',
  output: {
    file: 'dist/bundles/oidc.umd.js',
    sourceMap: false,
    format: 'umd',
    name: 'ng.oidc',
    globals: {
      '@angular/core': 'ng.core',
      '@angular/common/http': 'ng.common.http',
      'rxjs': 'rxjs'
    }
  },
  external: [
    '@angular/core',
    '@angular/common/http',
    'rxjs'
  ]
}
