# Hawaii Packages (@hawaii-framework)

## Making, updating versioning and releasing packages

### prerequisites:
* Make sure you have an account at [npmjs.com](https://www.npmjs.com)
* Have yourself added to the [@hawaii-framework](https://www.npmjs.com/org/hawaii-framework/) team
* Install Lerna globally: `npm install -g lerna`
* More info on Lerna [here](https://github.com/lerna/lerna#commands) 

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
`npx git-cz`  

### Publishing
* All package versions are kept in sync by Lerna automatically.
* Describe changes to a package in the _CHANGELOG.md_ of **_that_** package
* Update changelogs, and commit your work.
* `cd /opt/hawaii/workspace/hawaii-packages`
* `lerrna publish`
* Choose the update type (patch, minor, major, etc)<br>_`patch` is for bugfixes, `minor` is for feature. Use a `major` update **only** in case of breaking changes._

`lerna publish` will determine which packages need to be published, increment the version keys in `lerna.json` and each of the `package.json` files, update depedencies with a `^`, create a new git commit, tag the new version and publish all non-private packages to npm.  

### Other Commands

* `cd /opt/hawaii/workspace/hawaii-packages`
* `lerna bootstrap` - Build all packages
* `lerna updated` - See which packages have been updated since the latest release
* `lerna add ${package}` - Add dependency to all packages
* `lerna clean` - Remove all _node_modules_ from the packages
* `lerna ls` - List all packages
* `lerna run -- [..args]` - Runs `npm run my-script` in all packages that have it
* `lerna exec -- [..args]` -- Runs  a command in each of the packages, i.e. `npm i`

### FAQ
1. **`lerna publish` will build, but not publish the packages?** 
<br>You probably don't have yourself added as a npm user to one or more packages. The steps to add yourself as a user are described in the _Create your package_ section.<br><br>
1. More soon...