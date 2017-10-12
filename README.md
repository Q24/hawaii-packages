# hawaii

## Making and releasing packages

### prerequisites:
* Make sure you have an account at [npmjs.com](https://www.npmjs.com)
* Have yourself added to the [@hawaii-framework](https://www.npmjs.com/org/hawaii-framework/) team

### Create your package
* Go to `./packages/` and add a directory for you package, keeping naming conventions in mind. 

_Be descriptive please!
I.e.: `ngx-package-name` for Angular (2+) packages, `angularjs-package-name` for AngularJs (1), and js-package-name for Vanilla JS packages and so on_


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
* Update version information in the packages' `package.json`  
* `npm publish ----access public`

## Changelog

### 0.0.3

* Added some basic README.md stuff

### 0.0.2

* Renamed main package from hawaii-srcs to @hawaii

### 0.0.1

* Repo init