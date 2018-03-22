# Hawaii Packages (@hawaii-framework)

## Making, updating versioning and releasing packages

### prerequisites:
* Make sure you have an account at [npmjs.com](https://www.npmjs.com)
* Have yourself added to the [@hawaii-framework](https://www.npmjs.com/org/hawaii-framework/) team
* Install version-bump-prompt globally: `npm install -g version-bump-prompt`

### Create your package
* Go to `./packages/` and add a directory for you package, keeping naming conventions in mind. 

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
* Add linting, hinting, ignore and editor config files
* Add a *README.me*, and add some basic information about your package, and start a changelog. Your can do this in the *README.md*, or when it gets to big, make a *CHANGELOG.md* file.

### Versioning and changelogs
* All package versions are kept in sync. So if you update the version of one, update them all.
* Describe changes to a package in the Changelog of the package

To update all packages at once easily, use the Version Bump Prompt package:
* `cd /opt/hawaii/workspace/hawaii-packages`
* `npm run bumpVersions`

This will update all the versions of the packages, tag them, and push the version update to git.

### Publishing your NEW and shiny package

* `cd /opt/hawaii/workspace/hawaii-packages`
* Update version information in *ALL* packages  
* `npm run publishAll` (this will give an error on your new package)
* `cd` to your new package root
* `npm set init.author.name "YOUR NAME"`
* `npm set ini.author.email "YOUR EMAIL"` (Note: this will be public)
* `npm set init.author.url "https://www.qnh.nl"`
* `npm adduser` and login with your npmjs.com account credentials
* `npm publish ----access public`

### Updating all packages
Changed something in a package you want to publish?
* `cd /opt/hawaii/workspace/hawaii-packages
* `npm run buildAll`
* `update changelogs, and commit your work`
* `npm run bumpVersions`
* `npm run publishAll`

