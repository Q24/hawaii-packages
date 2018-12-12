import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Observable, Observer, timer} from 'rxjs';
import {finalize, skipWhile, take, timeout} from 'rxjs/operators';
import {AuthorizeParams, CsrfToken, OidcConfig, State, Token, URLParams, ValidSession} from './models';
import {GeneratorUtils, StorageUtils, UrlUtils} from './utils';
import {LogService} from './services';

/**
 * Open ID Connect Implicit Flow Service for Angular
 */
@Injectable()
export class OidcService {

  /**
   * Create config instance
   */
  public config: OidcConfig;

  /**
   * Constructor
   * @param {HttpClient} _http
   * @param _log
   */
  constructor(private _http: HttpClient,
              private _log: LogService) {
    if (!this.config || !this.config.debug) {
      this._log.debug = function () {
      };
    }
  }

  /**
   * Get a CSRF Token from the Authorisation
   * @returns {Observable<CsrfToken>}
   */
  public getCsrfToken(): Observable<CsrfToken> {
    this._log.debug('Get CSRF token from Authorisation');

    return this._http
      .post<CsrfToken>(this.config.csrf_token_endpoint, '', {
        withCredentials: true
      });
  }

  /**
   * Get the CSRF Token from the Storage
   * @returns {string}
   */
  public getStoredCsrfToken(): string {
    this._log.debug('CSRF Token from storage', StorageUtils.read('_csrf'));
    return StorageUtils.read('_csrf');
  }

  /**
   * Get a validated, not expired token from sessionStorage
   * @returns {Token}
   */
  public getStoredToken(): Token | null {

    // Get the tokens from storage, and make sure they're still valid
    const tokens = this._getStoredTokens(),
      tokensCleaned = this._cleanExpiredTokens(tokens);

    // If there's no valid token return null
    if (tokensCleaned.length < 1) {
      this._log.debug('No valid token found in storage');
      return null;
    }
    // Return the first valid token
    else {
      return tokensCleaned[0];
    }
  }

  /**
   * Clean up the current session: Delete the stored local tokens, state, nonce, id token hint and CSRF token.
   */
  public cleanSessionStorage(providerIDs: string[] = [`${this.config.provider_id}`]): void {
    providerIDs.forEach((providerId: string) => {
      this.deleteStoredTokens(providerId);
      this._deleteState(providerId);
      this._deleteNonce(providerId);
      this._deleteSessionId(providerId);
      this._deleteIdTokenHint(providerId);
    });

    this._deleteStoredCsrfToken();
  }

  /**
   * Check to see if a session is still actively used somewhere else (i.e. other platform).
   * @returns {Observable<Object>}
   */
  public isSessionAlive(): Observable<{ status: number }> {
    this._log.debug('Get Session Alive info from SSO');

    return this._http
      .get<{ status: number }>(`${this.config.is_session_alive_endpoint}/${this._getSessionId()}`);
  }

  /**
   * Return the Authorisation header for usage with rest calls
   * @returns {string}
   */
  public getAuthHeader(): string {
    const localToken = this.getStoredToken();
    return localToken ? `${this.config.token_type} ${localToken.access_token}` : null;
  }

  /**
   * Delete all tokens in sessionStorage for this session.
   */
  public deleteStoredTokens(providerId: string = `${this.config.provider_id}`): void {
    this._log.debug(`Removed Tokens from session storage: ${providerId}`);
    StorageUtils.remove(`${providerId}-token`);
  }

  /**
   * Get the saved session ID string from storage
   * @returns {string}
   * @public
   */
  public getIdTokenHint(): string {
    return StorageUtils.read(`${this.config.provider_id}-id-token-hint`);
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with authorize params) to the Authorisation
   * The Authorisation checks if there is a valid session. If so, it returns with token hash.
   * If not authenticated, it will redirect to the login page.
   */
  public authorizeRedirect(): void {

    // Clean up Storage before we begin
    this.cleanSessionStorage();

    const authorizeParams = this._getAuthorizeParams();
    const urlParams = UrlUtils.getURLParameters();

    // All clear ->
    // Do the authorize redirect
    if (!urlParams['error']) {
      this._log.debug('Do authorisation redirect to SSO with options:', authorizeParams);
      window.location.href = `${this.config.authorize_endpoint}?${UrlUtils.createURLParameters(authorizeParams)}`;
    }
    // Error in authorize redirect
    else {
      this._log.error('Redirecting to Authorisation failed');
      this._log.debug(`Error in authorize redirect: ${urlParams['error']}`);
    }
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with session upgrade params) to the Authorisation
   * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
   * then return a valid token, because the session was upgraded.
   */
  public doSessionUpgradeRedirect(token: Token): void {
    const urlVars = {
      session_upgrade_token: token.session_upgrade_token,
      redirect_uri: this.config.redirect_uri + '?flush_state=true'
    };

    this._log.debug('Session upgrade function triggered with token: ', token.session_upgrade_token);

    // Do the authorize redirect
    window.location.href = `${this.config.authorisation}/sso/upgrade-session?${UrlUtils.createURLParameters(urlVars)}`;
  }

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
  public checkSession(): Observable<boolean> {

    const urlParams = UrlUtils.getURLParameters(window.location.href),
      hashFragmentParams = UrlUtils.getHashFragmentParameters(StorageUtils.read('hash_fragment'));

    // Clean the hashfragment from storage
    if (hashFragmentParams) {
      StorageUtils.remove('hash_fragment');
    }

    this._log.debug('Check session with params:', urlParams);

    return new Observable<boolean>((observer: Observer<boolean>) => {


      this._log.debug('Flush state ?', urlParams.flush_state);

      // 1 Make sure the state is 'clean' when doing a session upgrade
      if (urlParams.flush_state) {
        this.cleanSessionStorage();
        this._log.debug('Flush state present, so cleaning the storage');
      }

      // 2 --- Let's first check if we still have a valid token stored locally, if so use that token
      if (this.getStoredToken()) {
        this._log.debug('Local token found, you may proceed');
        observer.next(true);
        observer.complete();
      }
      // No valid token found in storage, so we need to get a new one.
      else {

        // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
        this.getCsrfToken().subscribe(
          (csrfToken: CsrfToken) => {

            // Store the CSRF Token for future calls that need it. I.e. Logout
            StorageUtils.store('_csrf', csrfToken.csrf_token);

            // 3 --- There's an access_token in the URL
            if (hashFragmentParams.access_token && hashFragmentParams.state) {
              this._parseToken(hashFragmentParams).subscribe((tokenIsValid: boolean) => {
                observer.next(tokenIsValid);
              });
            }

            // 4 --- There's a session upgrade token in the URL
            else if (hashFragmentParams.session_upgrade_token) {

              this._log.debug('Session Upgrade Token found in URL');
              this.doSessionUpgradeRedirect(hashFragmentParams);
            }

            // 5 --- No token in URL or Storage, so we need to get one from SSO
            else {
              this._log.debug('No valid token in Storage or URL, Authorize Redirect!');
              this.authorizeRedirect();
              observer.next(false);
              observer.complete();
            }
          },
          (error: HttpErrorResponse) => observer.error(error));
      }
    });
  }

  /**
   * Silently refresh an access token via iFrame
   * @returns {Observable<boolean>}
   */
  public silentRefreshAccessToken(): Observable<boolean> {

    return new Observable<boolean>((observer: Observer<boolean>) => {

      this._log.debug('Silent refresh started');

      if (document.getElementById('silentRefreshAccessTokenIframe') === null) {
        /**
         * IFrame element
         * @type {HTMLIFrameElement}
         */
        const iFrame = document.createElement('iframe');

        /**
         * Get the Params to construct the URL, set promptNone = true, to add the prompt=none query parameter
         * @type {AuthorizeParams}
         */
        const authorizeParams = this._getAuthorizeParams(true);

        /**
         * Get the URL params to check for errors
         * @type {URLParams}
         */
        const urlParams = UrlUtils.getURLParameters();

        /**
         * Set the iFrame Id
         * @type {string}
         */
        iFrame.id = 'silentRefreshAccessTokenIframe';

        /**
         * Hide the iFrame
         * @type {string}
         */
        iFrame.style.display = 'none';

        /**
         * Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
         * For older FireFox and IE versions first append the iFrame and then set its source attribute.
         */

        if (!urlParams['error']) {
          window.document.body.appendChild(iFrame);
          this._log.debug('Do silent refresh redirect to SSO with options:', authorizeParams);
          iFrame.src = `${this.config.authorize_endpoint}?${UrlUtils.createURLParameters(authorizeParams)}`;
        }

        else {
          this._log.debug(`Error in silent refresh authorize redirect: ${urlParams['error']}`);
          observer.next(false);
          observer.complete();
        }


        /**
         * Handle the result of the Authorize Redirect in the iFrame
         */
        iFrame.onload = () => {

          this._log.debug('silent refresh iFrame loaded', iFrame);

          /**
           * Get the URL from the iFrame
           * @type {Token}
           */
          const hashFragmentParams = UrlUtils.getHashFragmentParameters(iFrame.contentWindow.location.href.split('#')[1]);

          /**
           * Clean the hashfragment from storage
           */
          if (hashFragmentParams) {
            this._log.debug('Hash Fragment params from sessionStorage', hashFragmentParams);
            StorageUtils.remove('hash_fragment');
          }

          /**
           * Check if we have a token
           */
          if (hashFragmentParams.access_token && hashFragmentParams.state) {

            this._log.debug('Access Token found in silent refresh return URL, validating it');

            /**
             * Parse and validate the token
             */
            this._parseToken(hashFragmentParams).subscribe((tokenIsValid: boolean) => {
              observer.next(tokenIsValid);
              observer.complete();
            });
          }

          /**
           * Return False if there was no token in the URL
           */
          else {
            this._log.debug('No token found in silent refresh return URL');
            observer.next(false);
            observer.complete();
          }

          /**
           * Cleanup the iFrame
           */
          setTimeout(() => iFrame.parentElement.removeChild(iFrame), 0);
        };
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  /**
   * Silently logout via iFrame. The URL should do the POST to SSO.
   * This is merely a service tool to create the iFrame for you, and handle it's result.
   * This _DOES NOT_ logout in itself.
   *
   * Returns 'true' if logout was successful and ended up on the configured `post_logout_redirect_uri`
   * @returns {Observable<boolean>}
   */
  public silentLogoutByUrl(url = this.config.silent_logout_uri): Observable<boolean> {

    return new Observable<boolean>((observer: Observer<boolean>) => {

      this._log.debug('Silent logout by URL started');

      if (document.getElementById('silentLogoutIframe') === null) {
        /**
         * IFrame element
         * @type {HTMLIFrameElement}
         */
        const iFrame = document.createElement('iframe');

        /**
         * Set the iFrame Id
         * @type {string}
         */
        iFrame.id = 'silentLogoutIframe';

        /**
         * Hide the iFrame
         * @type {string}
         */
        iFrame.style.display = 'none';

        /**
         * Append the iFrame, get a CsrfToken and set the source if the iFrame to the logout URL,
         * and add the id token hint as a query param, because we don't want to create a full new session tab,
         * to reduce unneeded load on SSO
         * For older FireFox and IE versions first append the iFrame and then set its source attribute.
         */
        window.document.body.appendChild(iFrame);

        // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
        this.getCsrfToken()
          .subscribe(
            (csrfToken: CsrfToken) => {
              this._log.debug(`Do silent logout with URL ${url}?id_token_hint=${this.getIdTokenHint()}&csrf_token=${csrfToken.csrf_token}`);
              iFrame.src = `${url}?id_token_hint=${this.getIdTokenHint()}&csrf_token=${csrfToken.csrf_token}`;
            },
            () => {
              this._log.debug('no CsrfToken');
              observer.next(false);
              observer.complete();
            });


        /**
         * Handle the result of the Authorize Redirect in the iFrame
         */
        iFrame.onload = () => {

          this._log.debug('silent logout iFrame onload triggered', iFrame);


          timer(0, 50)
            .pipe(
              skipWhile(() => {
                /**
                 * Get the URL from the iFrame
                 * @type {Token}
                 */
                const currentIframeURL = iFrame.contentWindow.location.href;

                /**
                 * Check if we the page ended up on the post_logout_redirect_uri from the config. This mean the logout was successful.
                 */
                return (currentIframeURL.indexOf(this.config.post_logout_redirect_uri) === 0);
              }),
              /**
               * Max 5000ms, after that, it will probably fail
               */
              timeout(5000),
              /**
               * Complete the timer after the predicate passes and returns a 'next' value
               */
              take(1),
              /**
               * Cleanup the iFrame
               */
              finalize(() => setTimeout(() => iFrame.parentElement.removeChild(iFrame), 0))
            )
            .subscribe(
              () => {
                this._log.debug('Silent logout successful', iFrame.contentWindow.location.href, this.config.post_logout_redirect_uri);
                observer.next(true);
                observer.complete();
              },
              () => {
                this._log.debug('Silent logout failed after 5000', iFrame.contentWindow.location.href, this.config.post_logout_redirect_uri);
                observer.next(false);
                observer.complete();
              });
        };
      } else {
        this._log.debug('Already a silent logout in progress. Try again later.');
        observer.next(false);
        observer.complete();
      }
    });
  }

  /**
   * Posts the received token to the Backend for decryption and validation
   * @param {Token} hashParams
   * @returns {Observable<any>}
   * @private
   */

  private _validateToken(hashParams: Token): Observable<ValidSession> {
    const data = {
      nonce: this._getNonce(),
      id_token: hashParams.id_token,
      access_token: hashParams.access_token
    };

    this._log.debug('Validate token with Hawaii Backend');

    return this._http
      .post<any>(this.config.validate_token_endpoint, data);
  }

  /**
   * Parse the token in the Hash
   * @param {Token} hashFragmentParams
   * @returns {Observable<boolean>}
   * @private
   */
  private _parseToken(hashFragmentParams: Token): Observable<boolean> {
    this._log.debug('Access Token found in session storage temp, validating it');

    return new Observable<boolean>((observer: Observer<boolean>) => {

      const stateObj = this._getState();

      // We received a token from SSO, so we need to validate the state
      if (hashFragmentParams.state === stateObj.state) {
        this._log.debug('State from URL validated against state in session storage state object', stateObj);

        // State validated, so now let's validate the token with Hawaii Backend
        this._validateToken(hashFragmentParams).subscribe((response: ValidSession) => {
            this._log.debug('Token validated by backend', response);

            // Store the token in the storage
            this._storeToken(hashFragmentParams);

            // Store the session ID
            this._saveSessionId(response.user_session_id);

            // We're logged in with token in URL
            this._log.debug('Token from URL validated, you may proceed.');
            observer.next(true);
            observer.complete();


          },
          // Something's wrong with the token according to the backend
          (response: HttpErrorResponse) => {
            this._log.error('Authorisation Token not valid');
            this._log.debug('Token NOT validated by backend', response);
            observer.next(false);
            observer.complete();
          });
      } else {
        this._log.error('Authorisation Token not valid');
        this._log.debug('State NOT valid');
        observer.next(false);
        observer.complete();
      }
    });
  }

  /**
   * Posts the session upgrade token to the Authorisation
   * @param {Object} data
   * @returns {Observable<any>}
   * @private
   */
  private _postSessionUpgrade(data: Object): Observable<any> {
    this._log.debug('Posting session upgrade token to backend');

    return this._http
      .post<any>(this.config.upgrade_session_endpoint, data);
  }

  /**
   * Saves the state string to sessionStorage
   * @param {State} state
   * @private
   */
  private _saveState(state: State): void {
    this._log.debug('State saved');
    StorageUtils.store(`${this.config.provider_id}-state`, JSON.stringify(state));
  }

  /**
   * Get the saved state string from sessionStorage
   * @returns {State}
   * @private
   */
  private _getState(): State {
    this._log.debug('Got state from storage', StorageUtils.read(`${this.config.provider_id}-state`));
    return JSON.parse(StorageUtils.read(`${this.config.provider_id}-state`));
  }

  /**
   * Deletes the state from sessionStorage
   * @private
   */
  private _deleteState(providerId: string = `${this.config.provider_id}`): void {
    this._log.debug(`Deleted state: ${providerId}`);
    StorageUtils.remove(`${providerId}-state`);
  }

  /**
   * Saves the nonce to sessionStorage
   * @param {string} nonce
   * @private
   */
  private _saveNonce(nonce: string): void {
    StorageUtils.store(`${this.config.provider_id}-nonce`, nonce);
  }

  /**
   * Get the saved nonce string from storage
   * @returns {string}
   * @private
   */
  private _getNonce(): string {
    return StorageUtils.read(`${this.config.provider_id}-nonce`);
  }

  /**
   * Deletes the nonce from sessionStorage
   * @private
   */
  private _deleteNonce(providerId: string = `${this.config.provider_id}`): void {
    StorageUtils.remove(`${providerId}-nonce`);
  }

  /**
   * Saves the session ID to sessionStorage
   * @param {string} sessionId
   * @private
   */
  private _saveSessionId(sessionId: string): void {
    StorageUtils.store(`${this.config.provider_id}-session-id`, sessionId);
  }

  /**
   * Get the saved session ID string from storage
   * @returns {string}
   * @private
   */
  private _getSessionId(): string {
    return StorageUtils.read(`${this.config.provider_id}-session-id`);
  }

  /**
   * Deletes the session ID from sessionStorage
   * @private
   */
  private _deleteSessionId(providerId: string = `${this.config.provider_id}`): void {
    StorageUtils.remove(`${providerId}-session-id`);
  }


  /**
   * Saves the ID token hint to sessionStorage
   * @private
   * @param idTokenHint
   */
  private _saveIdTokenHint(idTokenHint: string): void {
    StorageUtils.store(`${this.config.provider_id}-id-token-hint`, idTokenHint);
  }

  /**
   * Deletes the ID token hint from sessionStorage
   * @private
   */
  private _deleteIdTokenHint(providerId: string = `${this.config.provider_id}`): void {
    StorageUtils.remove(`${providerId}-id-token-hint`);
  }


  /**
   * Stores an array of Tokens to the session Storage
   * @param {Array<Token>} tokens
   * @private
   */
  private _storeTokens(tokens: Array<Token>): void {
    this._log.debug('Saved Tokens to session storage');
    StorageUtils.store(`${this.config.provider_id}-token`, JSON.stringify(tokens));
  }

  /**
   * Deletes the stored CSRF Token from storage
   * @private
   */
  private _deleteStoredCsrfToken(): void {
    this._log.debug(`Removed CSRF Token from session storage`);
    StorageUtils.remove(`_csrf`);
  }

  /**
   * Get all token stored in session Storage in an Array
   * @returns {Array<Token>}
   * @private
   */
  private _getStoredTokens(): Array<Token> {
    return JSON.parse(StorageUtils.read(`${this.config.provider_id}-token`)) || [];
  }

  /**
   * Compare the expiry time of a stored token with the current time.
   * If the token has expired, remove it from the array.
   * If something was removed from the Array, cleanup the session storage by re-saving the cleaned token array.
   * Return the cleaned Array.
   * @param {Token[]} storedTokens
   * @returns {Token[]}
   * @private
   */
  private _cleanExpiredTokens(storedTokens: Token[]): Token[] {

    let cleanTokens: Token[];
    const time = GeneratorUtils.epoch();

    cleanTokens = storedTokens.filter((element: Token) => {
      return (element.expires && element.expires > time + 5);
    });

    if (storedTokens.length > cleanTokens.length) {
      this._log.debug('Updated token storage after clean.');
      this._storeTokens(cleanTokens);
    }

    return cleanTokens;
  }

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
  private _storeToken(token: Token): void {

    const tokens = this._getStoredTokens();
    let tokensCleaned;
    this._saveIdTokenHint(token.id_token);
    token.expires = GeneratorUtils.epoch() + (parseInt(token.expires_in, 10) - 30);
    tokens.unshift(token);
    tokensCleaned = this._cleanExpiredTokens(tokens);
    this._storeTokens(tokensCleaned);
  }

  /**
   * Gather the URL params for Authorize redirect method
   * @returns {AuthorizeParams}
   * @private
   */
  private _getAuthorizeParams(promptNone: boolean = false): AuthorizeParams {

    const stateObj = this._getState() || {
        state: GeneratorUtils.generateState(),
        providerId: this.config.provider_id
      },
      nonce = this._getNonce() || GeneratorUtils.generateNonce(),
      urlVars: AuthorizeParams = {
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

    this._log.debug('Gather the Authorize Params', urlVars);
    return urlVars;
  }
}

