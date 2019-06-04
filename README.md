# Hawaii Packages (@hawaii-framework)

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Making, updating versioning and releasing packages

### prerequisites:
* Make sure you have an account at [npmjs.com](https://www.npmjs.com)
* Have yourself added to the [@hawaii-framework](https://www.npmjs.com/org/hawaii-framework/) team

### Create your package
* Go to `./packages/` and add a directory for you package, keeping naming conventions in mind. 
<br>
_Be descriptive please!
I.e.: `ngx-package-name` for Angular (2+) packages, `angularjs-package-name` for AngularJs (1), and `js-package-name` for Vanilla JS packages and so on_

* `npm init` and follow instructions
```
_"license": "Apache-2.0",_
_"repository": {"type": "git","url": "git+https://github.com/Q24/hawaii-packages.git" }_
```
* Make sure you make a **scoped name** (in the **@hawaii-framework** scope) in the `package.json` 
```
I.e: `"name": "@hawaii-framework/ngx-package-name",`
```
* Add linting, hinting, ignore and editor config files, the whole shebang.
* Add a *README.me*, and add some basic information about your package, and start a *CHANGELOG.md* file.
* `cd` to your new package root
* `npm set init.author.name "YOUR NAME"`
* `npm set ini.author.email "YOUR EMAIL"` (**Note** => _this **will** be public_)
* `npm set init.author.url "https://www.qnh.nl"`
* `npm adduser` and login with your npmjs.com account credentials
* **Make sure version nr of `package.json` is the same as version nr. `lerna.json`.**
* `npm publish ----access public`

### Commiting

This package uses [commitizen](https://github.com/commitizen/cz-cli). 
Don't install it globally, just just `npx`.
So, when you're ready to commit your work, run:
`git add .`
`npx git-cz`  

### Publishing
// TODO
 
 ### Publish Alpha/Beta/Nightly/Whatever
 You'll want to use the `--npm-tag`. This way, you can publically install your dev version, but it won't 'release' it to people using the plugin.
 
 How this works? https://docs.npmjs.com/cli/dist-tag
 Please use their conventions.
 
 So, do this:
 * `npm publish --npm-tag=beta`
