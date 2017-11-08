export default {
  input:      'dist/index.js',
  sourceMap:  false,
  output: {
    file:       'dist/bundles/oidc.umd.js',
    format:     'umd'
  },
  external: [
    '@angular/core',
    '@angular/common/http',
    '@angular/http',
    'rxjs/Observable',
    'rxjs/add/operator/map'
  ],
  name: 'ng.oidc',
  globals:    {
    '@angular/core':   'ng.core',
    '@angular/common/http': 'ng.common.http',
    '@angular/http': 'http',
    'rxjs/Observable': 'Rx'
  }
}
