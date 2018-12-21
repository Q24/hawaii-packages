/**
 * SsoService
 * @author Kevin Riemens
 */

(function (window, $) {

  'use strict';

  function SsoService(config) {

    /**
     * Holds a list of config variables
     * @type {Object}
     */
    this.config = {
      providerID:               "hawaii-sso",
      client_id:                "hawaii",
      response_type:            "token id_token",
      redirect_uri:             "",
      authorization:            "",
      silent_refresh_uri:       "",
      post_logout_redirect_uri: "",
      scope:                    "openid",
      logoutButtonSelector:     "#hawaii-sso-logout",
      sendToDefaultRedirectUri: [],
      defaultRedirectUri:       "",
      ssoBaseUri:               "",
      debug:                    false
    };

    // Kick off the service
    this.init(config);
  }

  /**
   * Prototype definition of the service
   * @type {Object}
   */
  SsoService.prototype = {
    constructor: SsoService,

    /**
     * Initializes the service
     * @param config
     */
    init: function (config) {
      // Load config props
      for (var prop in config) {
        if (config.hasOwnProperty(prop)) {
          this.config[prop] = config[prop];
        }
      }
    },

    /**
     * AJAX: Get Csrf token from SSO
     */
    getCsrfToken: function () {
      var options = {
          type: 'POST'
        },
        self = this;

      self._log('Get CSRF token promise from SSO');
      return self._ajax('/sso/csrf', options);
    },

    /**
     * AJAX: Validate token at Hawaii Backend
     */
    _validateToken: function (urlParams) {
      var self = this,
        options = {
          data:  JSON.stringify({
            nonce:        self._getNonce(),
            id_token:     urlParams.id_token,
            access_token: urlParams.access_token
          }),
          type:  'POST',
          async: false
        };

      self._log('Validate token with Hawaii Backend');
      return self._ajax('/rest/sso/check-token', options);
    },

    /**
     * AJAX: Validate token at Hawaii Backend
     */
    isSessionAlive: function () {
      var self = this,
        sessionId = self._getSessionId();

      if (sessionId) {
        self._log('Get Session Alive info from SSO');
        return self._ajax('/account/rest/user-sessions/' + sessionId);
      } else {
        self._log('Get Session Alive info from SSO was NOT called, because sessionId value was ' + sessionId);
        return $.when(null);
      }
    },

    /**
     * AJAX: VPost
     */
    _postSessionUpgrade: function (data) {
      var self = this,
        options = {
          type:  'POST',
          async: false
        };

      self._log('Posting session upgrade token to backend');
      return self._ajax('/sso/upgrade-session?' + $.param(data), options);
    },

    /**
     * STORAGE: Save state with identifiers
     */
    _saveState: function (state, obj) {
      var self = this;
      self._log('Saved state ' + state + ' to session storage');
      sessionStorage.setItem(self.config.providerID + '-state', JSON.stringify(obj));
    },

    /**
     * STORAGE: Delete State
     */
    deleteState: function () {
      var self = this;
      sessionStorage.removeItem(self.config.providerID + '-state');
    },

    /**
     * STORAGE: returns the state object, if non was found, create and save it
     */
    _getState: function () {
      var self = this,
        obj = JSON.parse(sessionStorage.getItem(self.config.providerID + '-state'));
      self._log('Got state from session storage ', obj);
      return obj;
    },

    /**
     * STORAGE: Save nonce
     */
    _saveNonce: function (nonce) {
      var self = this;

      sessionStorage.setItem(self.config.providerID + "-nonce", nonce);
      self._log('Saved nonce ' + nonce + ' to session storage');
    },

    /**
     * STORAGE: Get nonce to return, clean it up, return nonce value
     */
    _getNonce: function () {
      var self = this,
        nonce = sessionStorage.getItem(self.config.providerID + "-nonce");

      self._log('Got nonce ' + nonce + ' and removed it from session storage');
      return nonce;
    },

    /**
     * STORAGE: Delete Nonce
     */
    _deleteNonce: function () {
      var self = this;
      sessionStorage.removeItem(self.config.providerID + "-nonce");
    },

    /**
     * STORAGE: Save Session ID
     */
    _saveSessionId: function (id) {
      var self = this;

      sessionStorage.setItem(self.config.providerID + '-session-id', id);
      self._log('Saved session id ' + id + ' to local storage');
    },

    /**
     * STORAGE: Get Session ID
     */
    _getSessionId: function () {
      var self = this,
        sessionId = sessionStorage.getItem(self.config.providerID + '-session-id');

      self._log('Got session-id ' + sessionId + ' from session storage');
      return sessionId;
    },

    /**
     * STORAGE: Delete Session ID
     */
    deleteSessionId: function () {
      var self = this;
      if (self.config && self.config.providerID) {
        sessionStorage.removeItem(self.config.providerID + '-session-id');
      }
    },

    /**
     * STORAGE: array of tokens is clean of expired ones
     */
    _cleanExpiredTokens: function (tokens) {
      var result,
        self = this,
        numberOfCleanedTokens;

      result = $.grep(tokens, function (item) {
        return item.expires && item.expires > (self._epoch() + 5);
      });

      numberOfCleanedTokens = tokens.length - result.length;

      if (numberOfCleanedTokens > 0) {
        self._storeTokens(result);
        self._log('Cleaned ' + numberOfCleanedTokens + ' expired tokens from storage');
      }

      self._log('cleanTokens returned:', result);
      return result;
    },

    /**
     * STORAGE: save an array of tokens
     */
    _storeTokens: function (tokens) {
      sessionStorage.setItem(this.config.providerID + '-token', JSON.stringify(tokens));
    },

    /**
     * STORAGE: Get array of stored token from sessionStorage
     */
    _getStoredTokens: function () {
      var self = this,
        tokens = JSON.parse(sessionStorage.getItem(self.config.providerID + '-token')) || [];

      self._log('Stored tokens returned:', tokens);
      return tokens;
    },

    deleteStoredTokens: function () {
      var self = this;

      self._log('Removing stored tokens for with prefix: ', [self.config.providerID + '-token']);
      sessionStorage.removeItem(self.config.providerID + '-token');
    },

    /**
     * STORAGE: Save a single token for a provider, and cleanup expired ons for that provider
     */
    _storeToken: function (token) {

      var self = this,
        tokens = self._getStoredTokens(),
        tokensCleaned;

      // Set the tokens expiry time. Current time in seconds + (token lifetime in seconds - x seconds)
      token.expires = self._epoch() + (parseInt(token.expires_in) - 30);

      // Put the new token to the beginning of the array, so it's the first one returned
      tokens.unshift(token);

      // Do a token cleanup.
      tokensCleaned = self._cleanExpiredTokens(tokens);

      // Save the new array
      self._storeTokens(tokensCleaned);
    },

    /**
     * STORAGE: Get id token hint token from sessionStorage
     */
    _getIdTokenHint: function () {
      var self = this;

      return sessionStorage.getItem(self.config.providerID + '-id-token-hint');
    },

    /**
     * STORAGE: save id token hint
     */
    _storeIdTokenHint: function (idTokenHint) {
      sessionStorage.setItem(this.config.providerID + '-id-token-hint', idTokenHint);
    },

    deleteIdTokenHint: function () {
      var self = this;

      self._log('Removing hint tokens for with prefix: ', [self.config.providerID + '-id-token-hint']);
      sessionStorage.removeItem(self.config.providerID + '-id-token-hint');
    },

    /**
     * STORAGE: Get a token for a provider
     */
    getStoredToken: function () {

      var self = this,
        tokens = self._getStoredTokens(),
        tokensCleaned = self._cleanExpiredTokens(tokens);

      // If there's no tokens return null
      if (tokensCleaned.length < 1) {
        return null;
      }

      // Return the first valid token
      else {
        self._log('Valid token returned from session storage', tokensCleaned[0]);
        return tokensCleaned[0];
      }
    },

    /**
     * UTIL: generate a random nonce
     */
    _generateNonce: function () {
      var self = this,
        text = "",
        possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < 25; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }

      self._log('Generated Nonce: ', [text]);
      return text;
    },

    /**
     * UTIL: Returns epoch, seconds since 1970. Used for calculation of expire times.
     */
    _epoch: function () {
      return Math.round(new Date().getTime() / 1000.0);
    },

    /**
     * UTIL: Returns a random string used for state
     */
    _generateState: function () {
      var text = '',
        possible = '0123456789';

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
    },

    /**
     * UTIL: Returns URL params as an object
     */
    getURLParameters: function (url) {

      var self = this,
        result = {},
        searchIndex = url.indexOf('?'),
        hashIndex = url.indexOf('#'),
        urlStringToParse,
        urlVariablesToParse;

      if (searchIndex === -1 && hashIndex === -1) return result;
      if (searchIndex !== -1) urlStringToParse = url.substring(searchIndex + 1);
      if (hashIndex !== -1) urlStringToParse = url.substring(hashIndex + 1);
      urlVariablesToParse = urlStringToParse.split('&');

      $.each(urlVariablesToParse, function () {
        var parameter = this.split('=');
        result[parameter[0]] = parameter[1];
      });

      self._log('URL params', result);

      return result;
    },

    /**
     * UTIL: Removes URL param
     */
    removeURLParameter: function (parameter) {
      var self = this,
        urlVars = self.getURLParameters(window.location.href);

      if (urlVars.hasOwnProperty(parameter)) {
        delete urlVars[parameter];
      }

      return urlVars;
    },

    /**
     * UTIL: Returns temporary Session storage params as an object
     */
    getHashFragmentParameters: function (hash_fragment) {

      var self = this,
        result = {},
        urlVariablesToParse;

      // Split it into an array
      if (hash_fragment) {

        urlVariablesToParse = hash_fragment.split('&');

        // Push it to the object
        $.each(urlVariablesToParse, function () {
          var parameter = this.split('=');
          result[parameter[0]] = parameter[1];
        });

        // Clean the sessionStorage temp value
        sessionStorage.removeItem('hash_fragment');

        self._log('Hash Fragment params from sessionStorage', result);

      }

      return result;
    },

    /**
     * UTIL: Removes the hashed token from the URL without refresh
     */
    cleanRedirectUri: function () {

      var self = this,
        newUrlVars = self.removeURLParameter('flush_state'),
        loc = window.location,
        returnURL = loc.protocol + '//' + loc.host;

      // Add pathname
      returnURL += loc.pathname;

      // If URL params, add params, flush_state filtered out
      returnURL += newUrlVars ? '?' + $.param(newUrlVars) : '';

      return returnURL;
    },

    /**
     * UTIL: dump the config and the tokens
     */
    _dump: function () {
      if (this.config.debug) {
        var txt = '',
          self = this,
          token = self.getStoredToken();
        txt += 'Token: ' + "\n" + JSON.stringify(token, undefined, 4) + '\n\n';
        txt += 'Config: ' + "\n" + JSON.stringify(self.config, undefined, 4) + "\n\n";
        return txt;
      }
    },

    /**
     * UTIL: Promise wrapper for ajax calls
     */
    _ajax: function (url, options) {

      var self = this;

      if (options !== undefined && typeof options !== 'object') {
        self._log('options should be of type object');
      }

      var defaultOptions = {
          url:         url,
          critical:    true,
          type:        'GET',
          async:       true,
          cache:       true,
          timeout:     120000,
          data:        {},
          contentType: "application/json; charset=utf-8",
          dataType:    "json"
        },
        ajaxOptions = $.extend({}, defaultOptions, options);

      self._log('Ajax call triggered with options: ', ajaxOptions);
      return $.ajax(ajaxOptions);
    },

    /**
     * UTIL: log function for SSO, which can be turned on/off in config
     */
    _log: function () {
      var log = {};
      if (this.config.debug) {
        var argumentsStyled = $.map(arguments, function (value) {
          return ($.type(value) === 'string') ? '=-=-=-= SSO: ' + value + ' =-=-=-=' : value;
        });
        log.history = log.history || []; // store logs to an array for reference
        log.history.push(argumentsStyled);
        if (window.console) {
          window.console.log(
            Array.prototype.slice.call(argumentsStyled)
          );
        }
      }
    },

    /**
     * TEMPLATE: render a logout form
     */
    _renderLogoutForm: function () {
      return $('<form id="js-logout-form" style="display: none;" method="post" action="/sso/logout">' +
        '<input type="hidden" id="csrf" name="_csrf">' +
        '<input type="hidden" id="state" name="state">' +
        '<input type="hidden" id="redirect" name="post_logout_redirect_uri">' +
        '<input type="hidden" id="id_token" name="id_token_hint">' +
        '<input type="submit" >' +
        '</form>');
    },

    /**
     * TEMPLATE: render a logout form
     */
    _getAuthorizeParams: function (promptNone) {
      var self = this,
        stateObj = self._getState() || {
          state:      self._generateState(),
          providerId: self.config.providerID
        },
        nonce = self._getNonce() || self._generateNonce(),
        urlVars = {
          state:         stateObj.state,
          nonce:         nonce,
          authorization: self.config.authorization,
          providerId:    self.config.providerID,
          client_id:     self.config.client_id,
          response_type: self.config.response_type,
          redirect_uri:  promptNone ? self.config.silent_refresh_uri : self.cleanRedirectUri(),
          scope:         self.config.scope,
          prompt:        promptNone ? 'none' : ''
        };

      // Save state & nonce
      self._saveState(stateObj.state, stateObj);
      self._saveNonce(nonce);

      return urlVars;
    },

    /**
     * Parse the token in the Hash
     * @private
     */
    _parseToken: function (hashFragmentParams) {
      var self = this,
        defer = $.Deferred(),
        stateObj = self._getState();

      // We recieved a token from SSO, so we need to validate the state
      if (hashFragmentParams && hashFragmentParams.state === stateObj.state) {

        self._log('State from URL validated against state in session storage', stateObj);

        // State validated, so now let's validate the token with Hawaii Backend
        self._validateToken(hashFragmentParams).then(function (response) {
          self._log('Token validated by backend', response);

          if (response.status === 200) {

            self._storeToken(hashFragmentParams);

            self._storeIdTokenHint(hashFragmentParams.id_token);

            if (response.data[0] !== undefined && response.data[0].user_session_id) {
              self._saveSessionId(response.data[0].user_session_id);
            }
            self.setHandlers();

            // We're logged in with token in URL
            self._log('You may proceed.');
            defer.resolve(true);
          }

          // Something's wrong with the token according to the backend
          else {
            self._log('Token NOT validated by backend, , rejecting _parseToken Promise', response);
            defer.reject(false);
          }
        });
      } else {
        self._log('State NOT valid, rejecting checkSession Promise');
        defer.reject(false);
      }

      return defer;
    },

    /**
     * REDIRECT: Authorize Session with SSO through http redirect
     */
    authorizeRedirect: function () {

      var self = this,
        urlVars = self._getAuthorizeParams();

      // Do auth call
      self._log('Do authorisation redirect to SSO with options:', urlVars);

      // Do the authorize redirect
      window.location.href = self.config.authorization + '?' + $.param(urlVars);
    },

    /**
     * DOM: Set default handlers
     */
    setHandlers: function () {
      var self = this;

      // Default Logout handler
      $(document).on('click', self.config.logoutButtonSelector, function () {
        self._log('Default Logout button clicked');
        self.doLogout();
      });

      self._log('Handlers set');
    },

    /**
     * METHOD: Do logout
     */
    doLogout: function () {
      var self = this,  // Set the service
        stateObj = self._getState() || {state: null}, // Get state object from session store
        tokenObj = self.getStoredToken(),
        $form;

      self._log('Logout function triggered');

      // Get the logout HTML
      $form = self._renderLogoutForm();

      // Get a CSRF token
      self.getCsrfToken().then(function (csrfObj) {

        self._log('CSRF Token recieved for Logout, rendering the logout form', csrfObj, tokenObj, stateObj);

        // If we have an ID Token, we can logout with sso
        if (tokenObj.id_token) {
          // Now that we have everything, let's fill the form value's and return the form
          $form
            .find('#csrf').val(csrfObj.csrf_token).end()
            .find('#id_token').val(tokenObj.id_token).end()
            .find('#redirect').val(self.config.post_logout_redirect_uri).end()
            .find('#state').val(stateObj.state).end();

          // Submit the form
          self._log('Submitting logout form:', csrfObj.csrf_token, tokenObj.id_token, self.config.post_logout_redirect_uri, stateObj.state);
          $form.appendTo('body').submit();
        }

        // Otherwise we already know we're gonna fail, so do sof logout
        else {
          window.location.href = self.config.post_logout_redirect_uri;
        }
      }, function () {
        self._log('CSRF Token call failed');
      });
    },

    /**
     * METHOD: Do session upgrade
     */
    doSessionUpgradeRedirect: function (sessionUpgradeObj, openNewTab) {
      var self = this,
        urlVars;

      self._log('Session upgrade function triggered', JSON.stringify(sessionUpgradeObj));

      // Gather the data for post Session upgrade call
      urlVars = {
        session_upgrade_token: sessionUpgradeObj.session_upgrade_token,
        redirect_uri:          self.config.redirect_uri + '?flush_state=true'
      };

      // Clean up session storage temp

      // Do the authorize redirect
      if (openNewTab) {
        window.open(self.config.ssoBaseUri + '/sso/upgrade-session?' + $.param(urlVars));
      } else {
        window.location.href = self.config.ssoBaseUri + '/sso/upgrade-session?' + $.param(urlVars);
      }
    },

    /**
     * METHOD: Check if we are logged in or not, and handle accordingly
     */
    checkSession: function () {

      var self = this,
        defer = $.Deferred(),
        urlParams = self.getURLParameters(window.location.href),
        hashFragmentParams = self.getHashFragmentParameters(sessionStorage.hash_fragment);

      self._log('Checking session started');

      // Check if the config is not the default, because thisw will mean the implicit flow was triggered, without a proper config, which will fail miserably
      // So we need to resolve the promise, and return out of the function immediatly, so no further code will be executed.
      if (self.config.client_id === 'hawaii') {
        console.error('No SSO config provided. So stop.');
        defer.resolve(false);
        return defer;
      }

      // Make sure the state is 'clean' when doing a session upgrade
      if (urlParams.flush_state) {
        self.deleteState();
        self.deleteSessionId();
        self.deleteStoredTokens();
        self.deleteIdTokenHint();

        self._log('Flush state present, so cleaning the storage');

      }

      // 1 --- Let's first check if we still have a valid token stored locally, if so use that token
      if (self.getStoredToken()) {
        self.setHandlers();
        self._log('You may proceed');
        defer.resolve(true);
      }

      // No valid token found in storage, so we need to get a new one.
      else {
        // 2 --- There's an access_token in the URL
        if (hashFragmentParams.access_token && hashFragmentParams.state) {

          // Store CSRF token of the new session to storage. We'll need it for logout and authenticate (new style)
          self.getCsrfToken().then(function (csrfObj) {
            sessionStorage.setItem('_csrf', csrfObj.csrf_token);

            self._log('Access Token found in session storage temp, validating it', hashFragmentParams);

            /**
             * Parse and validate the token
             */
            self._parseToken(hashFragmentParams).then(function (tokenIsValid) {
              defer.resolve(tokenIsValid);
            }, function () {
              defer.reject(false);
            });
          });
        }

        // 3 --- There's a session upgrade token in the URL
        else if (hashFragmentParams.session_upgrade_token) {
          self._log('Session Upgrade Token found in URL');
          self.doSessionUpgradeRedirect(hashFragmentParams);
        }


        // 4 --- No token in URL or Storage, so we need to get one from SSO
        else {
          self._log('No valid token in Storage or URL');
          self.authorizeRedirect();
        }
      }

      return defer;
    },

    /**
     * METHOD: Silenty refresh an access token via iFrame
     */
    silentRefreshAccessToken: function () {

      var self = this,
        defer = $.Deferred();

      // Check if the config is not the default, because thisw will mean the implicit flow was triggered, without a proper config, which will fail miserably
      // So we need to resolve the promise, and return out of the function immediatly, so no further code will be executed.
      if (self.config.client_id === 'hawaii') {
        console.error('No SSO config provided. So stop.');
        defer.reject(false);
        return defer;
      }

      var silentRefreshAccessTokenIframe = document.getElementById('silentRefreshAccessTokenIframe');

      /**
       * Only continue if there'a no previous call running.
       */
      if (silentRefreshAccessTokenIframe === null) {

        self._log('Silent refresh started');

        /**
         * Iframe element
         */
        var iframe = document.createElement('iframe');

        /**
         * Attach defer to iframe to make it retrievable
         */
        iframe.defer = defer;

        /**
         * Get the Params to construct the URL, set promptNone = true, to add the prompt=none query parameter
         */
        var authorizeParams = self._getAuthorizeParams(true);

        /**
         * Get the URL params to check for errors
         */
        var urlParams = self.getURLParameters(window.location.href);

        /**
         * Set the iFrame Id
         */
        iframe.id = 'silentRefreshAccessTokenIframe';

        /**
         * Hide the iFrame
         */
        iframe.style.display = 'none';

        /**
         * Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
         */

        if (!urlParams.error) {
          window.document.body.appendChild(iframe);
          self._log('Do silent refresh redirect to SSO with options:', authorizeParams);
          iframe.src = self.config.authorization + '?' + $.param(authorizeParams);
        } else {
          self._log('Error in silent refresh authorize redirect:', urlParams.error);
          defer.reject(false);
        }

        /**
         * Handle the result of the Authorize Redirect in the iFrame
         */
        iframe.onload = function () {

          self._log('silent refresh iFrame loaded', iframe);

          /**
           * Get the URL from the iFrame
           * @type {Token}
           */
          var hashFragmentParams = self.getHashFragmentParameters(iframe.contentWindow.location.href.split('#')[1]);

          /**
           * Check if we have a token
           */
          if (hashFragmentParams.access_token && hashFragmentParams.state) {

            self._log('Access Token found in silent refresh return URL, validating it');

            /**
             * Parse and validate the token
             */
            self._parseToken(hashFragmentParams).then(function (tokenIsValid) {
              defer.resolve(tokenIsValid);
            }, function () {
              defer.reject(false);
            });

          }

          /**
           * Return False if there was no token in the URL
           */
          else {
            self._log('No token found in silent refresh return URL');
            defer.reject(false);

          }

          /**
           * Clean up the iFrame
           */
          setTimeout(function () {
            iframe.parentElement.removeChild(iframe);
          }, 0);
        };
      }

      return (silentRefreshAccessTokenIframe && silentRefreshAccessTokenIframe.defer) ? silentRefreshAccessTokenIframe.defer : defer;
    },

    /**
     * METHOD: Silently logout via iFrame
     */
    silentLogoutByUrl: function (logoutUrl) {

      var self = this,
        defer = $.Deferred();

      // Check if the config is not the default, because thisw will mean the implicit flow was triggered, without a proper config, which will fail miserably
      // So we need to resolve the promise, and return out of the function immediatly, so no further code will be executed.
      if (self.config.client_id === 'hawaii') {
        console.error('No SSO config provided. So stop.');
        defer.reject(false);
        return defer;
      }

      /**
       * On
       */
      if (document.getElementById('silentLogoutByUrlIframe') === null) {

        self._log('Silent logout started');

        /**
         * Iframe element
         */
        var iframe = document.createElement('iframe');

        /**
         * Set the iFrame Id
         */
        iframe.id = 'silentLogoutByUrlIframe';

        /**
         * Hide the iFrame
         */
        iframe.style.display = 'none';

        /**
         * Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
         */
        window.document.body.appendChild(iframe);

        /**
         * Get a CSRF token and ID Token hint, and set the logout URL in the iFrame
         */
        this.getCsrfToken()
          .then(function (csrfToken) {
            iframe.src = logoutUrl + '?id_token_hint=' + self._getIdTokenHint() + '&csrf_token=' + csrfToken.csrf_token;
          });
        /**
         * Handle the result of the Authorize Redirect in the iFrame
         */
        iframe.onload = function () {

          self._log('silent logout iFrame loaded', iframe);

          var interval = setInterval(function () {
            /**
             * Get the URL from the iFrame
             */
            var currentIframeURL = iframe.contentWindow.location.href;

            /**
             * Check if we the page ended up on the post_logout_redirect_uri from the config. This mean the logout was successful.
             */
            if (currentIframeURL.indexOf(self.config.post_logout_redirect_uri) !== -1) {
              clearInterval(interval);
              defer.resolve(true);
            }
          }, 50);

          /**
           * Clear the interval, Clean up the iFrame, and reject te promise, if the timeout runs out.
           */
          setTimeout(function () {
            clearInterval(interval);
            iframe.parentElement.removeChild(iframe);
            defer.reject(false);
          }, 3000);

        };
      } else {
        defer.reject(false);
      }
      return defer;
    }

  };
  window.SsoService = SsoService;
})
(window, window.jQuery);
