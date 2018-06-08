"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var http_1 = require("@angular/common/http");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/internal/operators");
/**
 * Open ID Connect Implicit Flow Service for Angular
 */
var OidcService = /** @class */ (function () {
    /**
     * Constructor
     * @param {HttpClient} _http
     */
    function OidcService(_http) {
        this._http = _http;
        /**
         * Debug logging on or off
         * @type {boolean}
         * @private
         */
        this._debug = false;
        /**
         * Logging wrapper function
         */
        if (this._debug && (typeof console !== 'undefined')) {
            this._log = console.log.bind(console);
        }
        else {
            this._log = function () {
            };
        }
    }
    OidcService_1 = OidcService;
    /**
     * Storage function to store key,value pair to the sessionStorage
     * @param {string} key
     * @param {string} value
     * @private
     */
    OidcService._store = function (key, value) {
        sessionStorage.setItem(key, value);
    };
    /**
     * Storage function to remove key from the sessionStorage
     * @param {string} key
     * @private
     */
    OidcService._remove = function (key) {
        sessionStorage.removeItem(key);
    };
    /**
     * Storage function to read a key from the sessionStorage
     * @param {string} key
     * @returns {string}
     * @private
     */
    OidcService._read = function (key) {
        return sessionStorage.getItem(key);
    };
    /**
     * Return the current time in seconds since 1970
     * @returns {number}
     * @private
     */
    OidcService._epoch = function () {
        return Math.round(new Date().getTime() / 1000.0);
    };
    /**
     * Generates a random 'state' string
     * @returns {string}
     * @private
     */
    OidcService._generateState = function () {
        var text = '';
        var possible = '0123456789';
        for (var i = 0; i < 5; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            text += '-';
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            text += possible.charAt(Math.floor(Math.random() * possible.length));
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    /**
     * Generates a random 'nonce' string
     * @returns {string}
     * @private
     */
    OidcService._generateNonce = function () {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 25; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    /**
     * Convert Object to URL Query string
     * @param {Object} urlVars
     * @returns {string}
     * @private
     */
    OidcService._createURLParameters = function (urlVars) {
        var params = new http_1.HttpParams();
        // Set the new Query string params.
        for (var key in urlVars) {
            if (urlVars.hasOwnProperty(key)) {
                if (key === 'redirect_uri') {
                    urlVars[key] = OidcService_1._cleanHashFragment(urlVars[key]);
                }
                params = params.set(key, urlVars[key]);
            }
        }
        return params.toString();
    };
    /**
     * Strip the hash fragment if it contains an access token (could happen when people use the BACK button in the browser)
     */
    OidcService._cleanHashFragment = function (url) {
        return url.split('#')[0];
    };
    /**
     * Get a CSRF Token from the Authorisation
     * @returns {Observable<CsrfToken>}
     */
    OidcService.prototype.getCsrfToken = function () {
        this._log('Get CSRF token from Authorisation');
        return this._http
            .post(this.config.csrf_token_endpoint, '', {
            withCredentials: true
        });
    };
    /**
     * Get the CSRF Token from the Local Storage
     * @returns {string}
     */
    OidcService.prototype.getStoredCsrfToken = function () {
        this._log('CSRF Token from storage', OidcService_1._read('_csrf'));
        return OidcService_1._read('_csrf');
    };
    /**
     * Get a validated, not expired token from sessionStorage
     * @returns {Token}
     */
    OidcService.prototype.getStoredToken = function () {
        // Get the tokens from storage, and make sure they're still valid
        var tokens = this._getStoredTokens(), tokensCleaned = this._cleanExpiredTokens(tokens);
        // If there's no valid token return null
        if (tokensCleaned.length < 1) {
            this._log('No valid token found in storage');
            return null;
        }
        else {
            return tokensCleaned[0];
        }
    };
    /**
     * Clean up the current session: Delete the stored local tokens, state, nonce, id token hint and CSRF token.
     */
    OidcService.prototype.cleanSessionStorage = function (providerIDs) {
        var _this = this;
        if (providerIDs === void 0) { providerIDs = ["" + this.config.provider_id]; }
        providerIDs.forEach(function (providerId) {
            _this.deleteStoredTokens(providerId);
            _this._deleteState(providerId);
            _this._deleteNonce(providerId);
            _this._deleteSessionId(providerId);
            _this._deleteIdTokenHint(providerId);
        });
        this._deleteStoredCsrfToken();
    };
    /**
     * Check to see if a session is still actively used somewhere else (i.e. other platform).
     * @returns {Observable<Object>}
     */
    OidcService.prototype.isSessionAlive = function () {
        this._log('Get Session Alive info from SSO');
        return this._http
            .get(this.config.is_session_alive_endpoint + "/" + this._getSessionId());
    };
    /**
     * Return the Authorisation header for usage with rest calls
     * @returns {string}
     */
    OidcService.prototype.getAuthHeader = function () {
        var localToken = this.getStoredToken();
        return localToken ? this.config.token_type + " " + localToken.access_token : null;
    };
    /**
     * Delete all tokens in sessionStorage for this session.
     */
    OidcService.prototype.deleteStoredTokens = function (providerId) {
        if (providerId === void 0) { providerId = "" + this.config.provider_id; }
        this._log("Removed Tokens from session storage: " + providerId);
        OidcService_1._remove(providerId + "-token");
    };
    /**
     * Get the saved session ID string from storage
     * @returns {string}
     * @public
     */
    OidcService.prototype.getIdTokenHint = function () {
        return OidcService_1._read(this.config.provider_id + "-id-token-hint");
    };
    /**
     * HTTP Redirect to the Authorisation. This redirects (with authorize params) to the Authorisation
     * The Authorisation checks if there is a valid session. If so, it returns with token hash.
     * If not authenticated, it will redirect to the login page.
     */
    OidcService.prototype.authorizeRedirect = function () {
        // Clean up Storage before we begin
        this.cleanSessionStorage();
        var authorizeParams = this._getAuthorizeParams();
        var urlParams = this._getURLParameters();
        // All clear ->
        // Do the authorize redirect
        if (!urlParams['error']) {
            this._log('Do authorisation redirect to SSO with options:', authorizeParams);
            window.location.href = this.config.authorize_endpoint + "?" + OidcService_1._createURLParameters(authorizeParams);
        }
        else {
            this._log("Error in authorize redirect: " + urlParams['error']);
        }
    };
    /**
     * HTTP Redirect to the Authorisation. This redirects (with session upgrade params) to the Authorisation
     * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
     * then return a valid token, because the session was upgraded.
     */
    OidcService.prototype.doSessionUpgradeRedirect = function (token) {
        var urlVars = {
            session_upgrade_token: token.session_upgrade_token,
            redirect_uri: this.config.redirect_uri + '?flush_state=true'
        };
        this._log('Session upgrade function triggered with token: ', token.session_upgrade_token);
        // Do the authorize redirect
        window.location.href = this.config.authorisation + "/sso/upgrade-session?" + OidcService_1._createURLParameters(urlVars);
    };
    /**
     * CORE METHOD:
     * 1 - Check if State needs to be flushed (in case of session upgrade i.e.)
     * 2 - Check if there's a valid token in the storage
     * 3 - Check if there's an access_token in the URl
     * * a. Validate state
     * * b. Validate token from URL with Backend
     * * c. Store the token
     * * d. Get a new CSRF token from Authorisation with the newly created session, and save it for i.e. logout usage
     * 4 - Check if there's a session_upgrade_token in the URL, if so, call the session upgrade function
     * 5 - Nothing found anywhere, so redirect to authorisation
     *
     * 1,2,3:
     * @returns {Observable<boolean>}
     *
     * 4,5:
     * `HTTP GET` Redirects to Authorisation
     */
    OidcService.prototype.checkSession = function () {
        var _this = this;
        var urlParams = this._getURLParameters(window.location.href), hashFragmentParams = this._getHashFragmentParameters(OidcService_1._read('hash_fragment'));
        this._log('Check session with params:', urlParams);
        return new rxjs_1.Observable(function (observer) {
            _this._log('Flush state ?', urlParams.flush_state);
            // 1 Make sure the state is 'clean' when doing a session upgrade
            if (urlParams.flush_state) {
                _this.cleanSessionStorage();
                _this._log('Flush state present, so cleaning the storage');
            }
            // 2 --- Let's first check if we still have a valid token stored locally, if so use that token
            if (_this.getStoredToken()) {
                _this._log('Local token found, you may proceed');
                observer.next(true);
                observer.complete();
            }
            else {
                // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
                _this.getCsrfToken().subscribe(function (csrfToken) {
                    // Store the CSRF Token for future calls that need it. I.e. Logout
                    OidcService_1._store('_csrf', csrfToken.csrf_token);
                    // 3 --- There's an access_token in the URL
                    if (hashFragmentParams.access_token && hashFragmentParams.state) {
                        _this._parseToken(hashFragmentParams).subscribe(function (tokenIsValid) {
                            observer.next(tokenIsValid);
                        });
                    }
                    else if (hashFragmentParams.session_upgrade_token) {
                        _this._log('Session Upgrade Token found in URL');
                        _this.doSessionUpgradeRedirect(hashFragmentParams);
                    }
                    else {
                        _this._log('No valid token in Storage or URL, Authorize Redirect!');
                        _this.authorizeRedirect();
                        observer.next(false);
                        observer.complete();
                    }
                });
            }
        });
    };
    /**
     * Silently refresh an access token via iFrame
     * @returns {Observable<boolean>}
     */
    OidcService.prototype.silentRefreshAccessToken = function () {
        var _this = this;
        return new rxjs_1.Observable(function (observer) {
            _this._log('Silent refresh started');
            if (document.getElementById('silentRefreshAccessTokenIframe') === null) {
                /**
                 * IFrame element
                 * @type {HTMLIFrameElement}
                 */
                var iFrame_1 = document.createElement('iframe');
                /**
                 * Get the Params to construct the URL, set promptNone = true, to add the prompt=none query parameter
                 * @type {AuthorizeParams}
                 */
                var authorizeParams = _this._getAuthorizeParams(true);
                /**
                 * Get the URL params to check for errors
                 * @type {URLParams}
                 */
                var urlParams = _this._getURLParameters();
                /**
                 * Set the iFrame Id
                 * @type {string}
                 */
                iFrame_1.id = 'silentRefreshAccessTokenIframe';
                /**
                 * Hide the iFrame
                 * @type {string}
                 */
                iFrame_1.style.display = 'none';
                /**
                 * Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
                 * For older FireFox and IE versions first append the iFrame and then set its source attribute.
                 */
                if (!urlParams['error']) {
                    window.document.body.appendChild(iFrame_1);
                    _this._log('Do silent refresh redirect to SSO with options:', authorizeParams);
                    iFrame_1.src = _this.config.authorize_endpoint + "?" + OidcService_1._createURLParameters(authorizeParams);
                }
                else {
                    _this._log("Error in silent refresh authorize redirect: " + urlParams['error']);
                    observer.next(false);
                    observer.complete();
                }
                /**
                 * Handle the result of the Authorize Redirect in the iFrame
                 */
                iFrame_1.onload = function () {
                    _this._log('silent refresh iFrame loaded', iFrame_1);
                    /**
                     * Get the URL from the iFrame
                     * @type {Token}
                     */
                    var hashFragmentParams = _this._getHashFragmentParameters(iFrame_1.contentWindow.location.href.split('#')[1]);
                    /**
                     * Check if we have a token
                     */
                    if (hashFragmentParams.access_token && hashFragmentParams.state) {
                        _this._log('Access Token found in silent refresh return URL, validating it');
                        /**
                         * Parse and validate the token
                         */
                        _this._parseToken(hashFragmentParams).subscribe(function (tokenIsValid) {
                            observer.next(tokenIsValid);
                            observer.complete();
                        });
                    }
                    else {
                        _this._log('No token found in silent refresh return URL');
                        observer.next(false);
                        observer.complete();
                    }
                    /**
                     * Cleanup the iFrame
                     */
                    setTimeout(function () { return iFrame_1.parentElement.removeChild(iFrame_1); }, 0);
                };
            }
            else {
                observer.next(false);
                observer.complete();
            }
        });
    };
    /**
     * Silently logout via iFrame. The URL should do the POST to SSO.
     * This is merely a service tool to create the iFrame for you, and handle it's result.
     * This _DOES NOT_ logout in itself.
     *
     * Returns 'true' if logout was successful and ended up on the configured `post_logout_redirect_uri`
     * @returns {Observable<boolean>}
     */
    OidcService.prototype.silentLogoutByUrl = function (url) {
        var _this = this;
        if (url === void 0) { url = this.config.silent_logout_uri; }
        return new rxjs_1.Observable(function (observer) {
            _this._log('Silent logout by URL started');
            if (document.getElementById('silentLogoutIframe') === null) {
                /**
                 * IFrame element
                 * @type {HTMLIFrameElement}
                 */
                var iFrame_2 = document.createElement('iframe');
                /**
                 * Set the iFrame Id
                 * @type {string}
                 */
                iFrame_2.id = 'silentLogoutIframe';
                /**
                 * Hide the iFrame
                 * @type {string}
                 */
                iFrame_2.style.display = 'none';
                /**
                 * Append the iFrame, get a CsrfToken and set the source if the iFrame to the logout URL,
                 * and add the id token hint as a query param, because we don't want to create a full new session tab,
                 * to reduce unneeded load on SSO
                 * For older FireFox and IE versions first append the iFrame and then set its source attribute.
                 */
                window.document.body.appendChild(iFrame_2);
                // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
                _this.getCsrfToken()
                    .subscribe(function (csrfToken) {
                    _this._log("Do silent logout with URL " + url + "?id_token_hint=" + _this.getIdTokenHint() + "&csrf_token=" + csrfToken.csrf_token);
                    iFrame_2.src = url + "?id_token_hint=" + _this.getIdTokenHint() + "&csrf_token=" + csrfToken.csrf_token;
                }, function () {
                    _this._log('no CsrfToken');
                    observer.next(false);
                    observer.complete();
                });
                /**
                 * Handle the result of the Authorize Redirect in the iFrame
                 */
                iFrame_2.onload = function () {
                    _this._log('silent logout iFrame onload triggered', iFrame_2);
                    rxjs_1.timer(0, 50)
                        .pipe(operators_1.skipWhile(function () {
                        /**
                         * Get the URL from the iFrame
                         * @type {Token}
                         */
                        var currentIframeURL = iFrame_2.contentWindow.location.href;
                        /**
                         * Check if we the page ended up on the post_logout_redirect_uri from the config. This mean the logout was successful.
                         */
                        return (currentIframeURL.indexOf(_this.config.post_logout_redirect_uri) === 0);
                    }), 
                    /**
                     * Max 5000ms, after that, it will probably fail
                     */
                    operators_1.timeout(5000), 
                    /**
                     * Complete the timer after the predicate passes and returns a 'next' value
                     */
                    operators_1.take(1), 
                    /**
                     * Cleanup the iFrame
                     */
                    operators_1.finalize(function () { return setTimeout(function () { return iFrame_2.parentElement.removeChild(iFrame_2); }, 0); }))
                        .subscribe(function () {
                        _this._log('Silent logout successful', iFrame_2.contentWindow.location.href, _this.config.post_logout_redirect_uri);
                        observer.next(true);
                        observer.complete();
                    }, function () {
                        _this._log('Silent logout failed after 5000', iFrame_2.contentWindow.location.href, _this.config.post_logout_redirect_uri);
                        observer.next(false);
                        observer.complete();
                    });
                };
            }
            else {
                _this._log('Already a silent logout in progress. Try again later.');
                observer.next(false);
                observer.complete();
            }
        });
    };
    /**
     * Posts the received token to the Backend for decryption and validation
     * @param {Token} hashParams
     * @returns {Observable<any>}
     * @private
     */
    OidcService.prototype._validateToken = function (hashParams) {
        var data = {
            nonce: this._getNonce(),
            id_token: hashParams.id_token,
            access_token: hashParams.access_token
        };
        this._log('Validate token with Hawaii Backend');
        return this._http
            .post(this.config.validate_token_endpoint, data);
    };
    /**
     * Parse the token in the Hash
     * @param {Token} hashFragmentParams
     * @returns {Observable<boolean>}
     * @private
     */
    OidcService.prototype._parseToken = function (hashFragmentParams) {
        var _this = this;
        this._log('Access Token found in session storage temp, validating it');
        return new rxjs_1.Observable(function (observer) {
            var stateObj = _this._getState();
            // We received a token from SSO, so we need to validate the state
            if (hashFragmentParams.state === stateObj.state) {
                _this._log('State from URL validated against state in session storage state object', stateObj);
                // State validated, so now let's validate the token with Hawaii Backend
                _this._validateToken(hashFragmentParams).subscribe(function (response) {
                    _this._log('Token validated by backend', response);
                    // Store the token in the storage
                    _this._storeToken(hashFragmentParams);
                    // Store the session ID
                    _this._saveSessionId(response.user_session_id);
                    // We're logged in with token in URL
                    _this._log('Token from URL validated, you may proceed.');
                    observer.next(true);
                    observer.complete();
                }, 
                // Something's wrong with the token according to the backend
                function (response) {
                    _this._log('Token NOT validated by backend', response);
                    observer.next(false);
                    observer.complete();
                });
            }
            else {
                _this._log('State NOT valid');
                observer.next(false);
                observer.complete();
            }
        });
    };
    /**
     * Posts the session upgrade token to the Authorisation
     * @param {Object} data
     * @returns {Observable<any>}
     * @private
     */
    OidcService.prototype._postSessionUpgrade = function (data) {
        this._log('Posting session upgrade token to backend');
        return this._http
            .post(this.config.upgrade_session_endpoint, data);
    };
    /**
     * Saves the state string to sessionStorage
     * @param {State} state
     * @private
     */
    OidcService.prototype._saveState = function (state) {
        this._log('State saved');
        OidcService_1._store(this.config.provider_id + "-state", JSON.stringify(state));
    };
    /**
     * Get the saved state string from sessionStorage
     * @returns {State}
     * @private
     */
    OidcService.prototype._getState = function () {
        this._log('Got state from storage', OidcService_1._read(this.config.provider_id + "-state"));
        return JSON.parse(OidcService_1._read(this.config.provider_id + "-state"));
    };
    /**
     * Deletes the state from sessionStorage
     * @private
     */
    OidcService.prototype._deleteState = function (providerId) {
        if (providerId === void 0) { providerId = "" + this.config.provider_id; }
        this._log("Deleted state: " + providerId);
        OidcService_1._remove(providerId + "-state");
    };
    /**
     * Saves the nonce to sessionStorage
     * @param {string} nonce
     * @private
     */
    OidcService.prototype._saveNonce = function (nonce) {
        OidcService_1._store(this.config.provider_id + "-nonce", nonce);
    };
    /**
     * Get the saved nonce string from storage
     * @returns {string}
     * @private
     */
    OidcService.prototype._getNonce = function () {
        return OidcService_1._read(this.config.provider_id + "-nonce");
    };
    /**
     * Deletes the nonce from sessionStorage
     * @private
     */
    OidcService.prototype._deleteNonce = function (providerId) {
        if (providerId === void 0) { providerId = "" + this.config.provider_id; }
        OidcService_1._remove(providerId + "-nonce");
    };
    /**
     * Saves the session ID to sessionStorage
     * @param {string} sessionId
     * @private
     */
    OidcService.prototype._saveSessionId = function (sessionId) {
        OidcService_1._store(this.config.provider_id + "-session-id", sessionId);
    };
    /**
     * Get the saved session ID string from storage
     * @returns {string}
     * @private
     */
    OidcService.prototype._getSessionId = function () {
        return OidcService_1._read(this.config.provider_id + "-session-id");
    };
    /**
     * Deletes the session ID from sessionStorage
     * @private
     */
    OidcService.prototype._deleteSessionId = function (providerId) {
        if (providerId === void 0) { providerId = "" + this.config.provider_id; }
        OidcService_1._remove(providerId + "-session-id");
    };
    /**
     * Saves the ID token hint to sessionStorage
     * @param {string} sessionId
     * @private
     */
    OidcService.prototype._saveIdTokenHint = function (idTokenHint) {
        OidcService_1._store(this.config.provider_id + "-id-token-hint", idTokenHint);
    };
    /**
     * Deletes the ID token hint from sessionStorage
     * @private
     */
    OidcService.prototype._deleteIdTokenHint = function (providerId) {
        if (providerId === void 0) { providerId = "" + this.config.provider_id; }
        OidcService_1._remove(providerId + "-id-token-hint");
    };
    /**
     * Stores an array of Tokens to the session Storage
     * @param {Array<Token>} tokens
     * @private
     */
    OidcService.prototype._storeTokens = function (tokens) {
        this._log('Saved Tokens to session storage');
        OidcService_1._store(this.config.provider_id + "-token", JSON.stringify(tokens));
    };
    /**
     * Deletes the stored CSRF Token from storage
     * @private
     */
    OidcService.prototype._deleteStoredCsrfToken = function () {
        this._log("Removed CSRF Token from session storage");
        OidcService_1._remove("_csrf");
    };
    /**
     * Get all token stored in session Storage in an Array
     * @returns {Array<Token>}
     * @private
     */
    OidcService.prototype._getStoredTokens = function () {
        return JSON.parse(OidcService_1._read(this.config.provider_id + "-token")) || [];
    };
    /**
     * Compare the expiry time of a stored token with the current time.
     * If the token has expired, remove it from the array.
     * If something was removed from the Array, cleanup the session storage by re-saving the cleaned token array.
     * Return the cleaned Array.
     * @param {Token[]} storedTokens
     * @returns {Token[]}
     * @private
     */
    OidcService.prototype._cleanExpiredTokens = function (storedTokens) {
        var cleanTokens;
        var time = OidcService_1._epoch();
        cleanTokens = storedTokens.filter(function (element) {
            return (element.expires && element.expires > time + 5);
        });
        if (storedTokens.length > cleanTokens.length) {
            this._log('Updated token storage after clean.');
            this._storeTokens(cleanTokens);
        }
        return cleanTokens;
    };
    /**
     * * Get the current Stored tokens
     * * Seperately save the ID Token, as a hint for when the access token get's cleaned. This will help logout.
     * * Set the tokens expiry time. Current time in seconds + (token lifetime in seconds - x seconds)
     * * Put the new token to the beginning of the array, so it's the first one returnedy
     * * Clean expired tokens from the Array
     * * Save the new token array
     * * Return the cleaned set of Tokens
     *
     * @param {Token} token
     * @private
     */
    OidcService.prototype._storeToken = function (token) {
        var tokens = this._getStoredTokens();
        var tokensCleaned;
        this._saveIdTokenHint(token.id_token);
        token.expires = OidcService_1._epoch() + (parseInt(token.expires_in, 10) - 30);
        tokens.unshift(token);
        tokensCleaned = this._cleanExpiredTokens(tokens);
        this._storeTokens(tokensCleaned);
    };
    /**
     * Get Hash Fragment parameters from sessionStorage
     * @param {string} hash_fragment
     * @returns {Token}
     * @private
     */
    OidcService.prototype._getHashFragmentParameters = function (hash_fragment) {
        var result = {};
        var urlVariablesToParse;
        if (hash_fragment) {
            urlVariablesToParse = hash_fragment.split('&');
            for (var _i = 0, urlVariablesToParse_1 = urlVariablesToParse; _i < urlVariablesToParse_1.length; _i++) {
                var urlVar = urlVariablesToParse_1[_i];
                var parameter = urlVar.split('=');
                result[parameter[0]] = parameter[1];
            }
            OidcService_1._remove('hash_fragment');
            this._log('Hash Fragment params from sessionStorage', result);
        }
        return result;
    };
    /**
     * Return an object with URL parameters
     * @param {string} url
     * @returns {URLParams}
     * @private
     */
    OidcService.prototype._getURLParameters = function (url) {
        if (url === void 0) { url = window.location.href; }
        var result = {}, searchIndex = url.indexOf('?'), hashIndex = url.indexOf('#');
        var urlStringToParse, urlVariablesToParse;
        if (searchIndex === -1 && hashIndex === -1) {
            return result;
        }
        if (searchIndex !== -1) {
            urlStringToParse = url.substring(searchIndex + 1);
        }
        if (hashIndex !== -1) {
            urlStringToParse = url.substring(hashIndex + 1);
        }
        urlVariablesToParse = urlStringToParse.split('&');
        for (var _i = 0, urlVariablesToParse_2 = urlVariablesToParse; _i < urlVariablesToParse_2.length; _i++) {
            var urlVar = urlVariablesToParse_2[_i];
            var parameter = urlVar.split('=');
            result[parameter[0]] = parameter[1];
        }
        this._log('URL params', result);
        return result;
    };
    /**
     * Gather the URL params for Authorize redirect method
     * @returns {AuthorizeParams}
     * @private
     */
    OidcService.prototype._getAuthorizeParams = function (promptNone) {
        if (promptNone === void 0) { promptNone = false; }
        var stateObj = this._getState() || {
            state: OidcService_1._generateState(),
            providerId: this.config.provider_id
        }, nonce = this._getNonce() || OidcService_1._generateNonce(), urlVars = {
            state: stateObj.state,
            nonce: nonce,
            authorization: this.config.authorisation,
            providerId: this.config.provider_id,
            client_id: this.config.client_id,
            response_type: this.config.response_type,
            redirect_uri: promptNone ? this.config.silent_refresh_uri : this.config.redirect_uri,
            scope: this.config.scope,
            prompt: promptNone ? 'none' : ''
        };
        // Save the generated state & nonce
        this._saveState(stateObj);
        this._saveNonce(nonce);
        this._log('Gather the Authorize Params', urlVars);
        return urlVars;
    };
    OidcService = OidcService_1 = __decorate([
        core_1.Injectable()
    ], OidcService);
    return OidcService;
    var OidcService_1;
}());
exports.OidcService = OidcService;
