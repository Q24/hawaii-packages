# OIDC Module

## Changelog

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
