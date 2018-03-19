# hawaii

## Making and releasing packages

### prerequisites:
* Make sure you have an account at [npmjs.com](https://www.npmjs.com)
* Have yourself added to the [@hawaii-framework](https://www.npmjs.com/org/hawaii-framework/) team

### Create your package
* Go to `./packages/` and add a directory for you package, keeping naming conventions in mind. 

_Be descriptive please!
I.e.: `ngx-package-name` for Angular (2+) packages, `angularjs-package-name` for AngularJs (1), and `js-package-name` for Vanilla JS packages and so on_


* `npm init` and follow instructions

_"license": "Apache-2.0",_

_"repository": {"type": "git","url": "git+https://github.com/Q24/hawaii-packages.git" }_

* Make sure you make a **scoped name** (in the **@hawaii-framework** scope) in the `package.json` 

_I.e: `"name": "@hawaii-framework/ngx-package-name",`_

* Add linting, hinting, ignore and editor config files

* Add a README.me, and add some basic information about your package, and start a changelog. Your can do this in the README.md, or when it gets to big, make a CHANGELOG.md file.

### Publishing Your package

========================

_These steps when your publishing packages for the first time:_
* `npm set init.author.name "YOUR NAME"`
* `npm set ini.author.email "YOUR EMAIL"` (Note: this will be public)
* `npm set init.author.url "https://www.qnh.nl"`
* `npm adduser` and login with your npmjs.com account credentials

========================

* `cd` to your package root
* Update version information in *ALL* packages  
* `npm publish ----access public`

### Versioning & changelogs
* All package versions are kept in sync.
* Describe changes to a package in the Changelog of the package
* Describe affected packages in this version in the main Changelog.

To update all packages at once easily, us the Version Bump Prompt package:

#### Install

#### Usage
* 0.0.XXX -> `bump --patch --grep package.json packages/js-oidc-implicit/package.json packages/ngx-oidc-implicit/package.json`
* 0.XXX.0 -> `bump --minor --grep package.json packages/js-oidc-implicit/package.json packages/ngx-oidc-implicit/package.json`
* XXX.0.0 -> `bump --major --grep package.json packages/js-oidc-implicit/package.json packages/ngx-oidc-implicit/package.json`


## Changelog

### 0.3.0 - affected packages
* ngx-oidc-implicit (changed)
* js-oidc-implicit (added)