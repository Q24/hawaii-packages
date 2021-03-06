# Changelog

## *DEPRECATED SINCE June 4th 2019. Use @hawaii-framework/oidc-implicit-core instead.*

### 1.4.2
* Fixed property check with defer by making it stricter

### 1.4.1

* Refactored defer return in silentRefreshAccessToken method so it can return a previous instance if neccessary

### 1.4.0

* Implement scoped cleanSession

### 1.3.1

* Add openNewTab parameter to doSessionUpgradeRedirect, by default do not open in new tab (PROJ-613)

### 1.3.0

* Implemented silentLogoutByUrl method

### 1.2.2

* Return out of silentRefreshAccessToken, when default config was loaded.

### 1.2.1

* Return out of checkSession, when default config was loaded.

### 1.2.0
* _getIdTokenHint, _storeIdTokenHint and deleteIdTokenHint added

### 0.4.11

* doSessionUpgradeRedirect now uses redirect_uri, instead of defaultRedirectUri

### 0.4.10

* Proper release&hellip;

### 0.4.9

* Updated changelog

### 0.4.8

* -

### 0.4.7

* Ignore `yarn-error.log` 

### 0.4.6

* Re-save cleaned tokens array to session storage, if a token was cleaned.

### 0.4.5

* Prevent multiple iFrames with silent refresh at once

### 0.4.2

* Fixed Gulp build process

### 0.4.1

* Fixed unnecessary cleanup, preventing tokenRefresh to store multiple tokens

### 0.4.0
* Silent token refresh Method added
* Refactored token parsing and validation to seperate function
* added prompt parameter to config and redirect params.
* Added clean hash fragment as a part of the package
* Put generateState in line with ngx version

### 0.3.2
* Changed `main` property in `package.json`

### 0.3.1
* Ignore SRC folder in `npm publish`

### 0.3.0
* added as a package
