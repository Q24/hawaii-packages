# Changelog

### [Unreleased]

* Fixed TypeScript error in `clean-hash-fragment`
* Fixed typos
* Some TypeScript edits
* Ignore `yarn-error.log`
* silent_refresh_uri is now an optional parameter in the OidcConfig interface

### 0.4.7

* Removed unnecessary import 

### 0.4.6

* Re-save cleaned tokens array to session storage, if a token was cleaned.

### 0.4.5

* Prevent multiple iFrames with silent refresh at once

### 0.4.4

* Fixed .npmignore

### 0.4.3

* Fixed *any* in log function

### 0.4.0
* iFrame cleaning in silent Token Refresh fix

### 0.3.0

* npm updates for up-to-date dev env
* Silent token refresh Method added
* Refactored token parsing and validation to seperate function
* added prompt parameter to config and redirect params.

### 0.2.2

* Removed `npm i`, because it runs a loop
* Removed JSON.stringify when storing id token, while it's already a string, and adds unwanted `"`

### 0.2.1

* Made `getIdTokenHint` a public method.
* Added `npm i` command to the `prebuild` npm script.

### 0.2.0

* Added additional functionality for storing the ID token seperatly. This is for use with i.e. logout, which takes an id_token_hint parameter. So Id token's might still be valid, as access token was expired. Id token will only be cleaned when the `cleanSessionStorage` method is called. Further more it will be overwritten with each `_storeToken` call.

### 0.1.8

* Typed all functions in `oidc.service.ts`

### 0.1.7

* Strip hash fragment from 'redirect_uri' in urlParams creation. This way there can't be an access token in the redirected URL, which causes problems.

### 0.1.6

* Added option login with QR code Config interface to extend OidcConfig interface

### 0.1.5

* Fixed Nonce generator. Use a already generated once, because it could be created outside of this service instance.

### 0.1.4

* Fixed HTTPParams

### 0.1.3

* Old mapping function remove, because new HTTP CLient does that now.
* Removed deprecated URLSearchParams in favor of HttpParams

### 0.1.2

* automatically build on `npm publish`

### 0.1.1

* `.npmignore`d a little bit much...

### 0.1.0

* Created it as a proper ngModule
* Added build process for creating ngModule like output with Rollup etc.
* Removed src files from 
* Refactored to src / dist setup
* Excluded config files from npm publish
* Filled out more information in package.json

### 0.0.14

* Made it into a proper TypeScript package

### 0.0.13

* Updated Peer Dependencies to work with 'minimal' version

### 0.0.12

* isSessionAlive doesn't require an AuthHeader anymore. This is a better fit for spec, and effictively reverts tje previous release to 0.0.10.

### 0.0.11

* isSessionAlive now requires an AuthHeader.

### 0.0.10

* Update user_session_id session storage saving

### 0.0.9

* Update isSessionAlive endpoint to use the new style.

### 0.0.8

* Fixed the Session Id handling and token validation call. New Hawaii calls don't have 200 with status anymore. So refactored to 'normal' rest call status codes.

### 0.0.7

* Changes in Typing for isSessionAlive response

### 0.0.6

* Turn off debug by default

### 0.0.5

* Initialized installable package
* Repo setup

### 0.0.4

* Updated the REAMDE.md with changelog notes

### 0.0.3

* Authorize redirect checks for an error parameter in the url and stops it if it&rsquo;s found.

### 0.0.2

* Service is now fully documented according to JSDoc specs
* Typescript grammar fixes

### 0.0.1

* First port from Javascript to Typescript
