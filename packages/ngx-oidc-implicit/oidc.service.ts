import {Injectable} from '@angular/core';
import {Http, URLSearchParams} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import 'rxjs/add/operator/map';

/**
 * Config Object for OIDC Service
 */
export interface OidcConfig {
  /**
   * Set the ID of the Authorisation
   */
  provider_id: string;
  /**
   * Set the ID of your client
   */
  client_id: string;
  /**
   * What type of token(s) you wish to receive
   * In case op Open Id Connect this is usually `token id_token`
   */
  response_type: string;
  /**
   * The URL you want to be redirected to after redirect from Authorisation
   */
  redirect_uri: string;
  /**
   * Array of URL's that are not allowed as `redirect_uri`
   */
  restricted_redirect_uris: string[];
  /**
   * The base URL of the Authorisation
   */
  authorisation: string;
  /**
   * The URL you want to be redirected to after logging out
   */
  post_logout_redirect_uri: string;
  /**
   * Define the scopes you want acces to. Each scope is seperated by space.
   * When using Open Id Connect, scope `openid` is mandatory
   */
  scope: string;
  /**
   * Define the type of token your want to receive from Authorisation.
   * In case of implicit flow this is usually 'Bearer'
   */
  token_type: string;
  /**
   * Authorisation endpoint
   */
  authorize_endpoint: string;
  /**
   * CSRF token endpoint
   */
  csrf_token_endpoint: string;
  /**
   * Validate received token endpoint
   */
  validate_token_endpoint: string;
  /**
   * Endpoint for checking if a session is still used somewhere
   */
  is_session_alive_endpoint: string;
  /**
   * Session Upgrade endpoint
   */
  upgrade_session_endpoint: string;
  /**
   * `POST` to this endpoint in the login form
   */
  login_endpoint: string;
  /**
   * `POST` to this endpoint in the logout form
   */
  logout_endpoint: string;
  /**
   * List of provider ids to be cleaned from storage
   */
  post_logout_provider_ids_to_be_cleaned?: string[];
}

/**
 * CSRF Token
 */
export interface CsrfToken {
  /**
   * CSRF Token Header name
   */
  header_name: string;
  /**
   * CRSF Token key to be used
   */
  parameter_key: string;
  /**
   * The CSRF Token itself
   */
  csrf_token: string;
}

/**
 * Token received in URL from Authorisation
 */
export interface Token {
  /**
   * Token for use with REST calls
   */
  access_token?: string;
  /**
   * Type of token received, usually `Bearer`
   */
  token_type?: string;
  /**
   * State string
   */
  state?: string;
  /**
   * Token expiry in seconds
   */
  expires_in?: string;
  /**
   * Open ID Tokene
   */
  id_token?: string;
  /**
   * Expiry time of token
   */
  expires?: number;
  /**
   * Session Upgrade token received from Authorisation
   */
  session_upgrade_token?: string;
}

/**
 * Flush state param
 */
export interface URLParams {
  /**
   * Flush state param
   */
  flush_state?: boolean;
}

/**
 * State
 */
export interface State {
  /**
   * State string
   */
  state: string;
}

/**
 * Authorize redirect URL Parameters
 */
export interface AuthorizeParams {
  /**
   * State string
   */
  state: string;
  /**
   * Nonce string
   */
  nonce: string;
  /**
   * Authorisation endpoint
   */
  authorization: string;
  /**
   * The ID of the Authorisation
   */
  providerId: string;
  /**
   * The ID of your client
   */
  client_id: string;
  /**
   * What type of token(s) you wish to receive
   * In case op Open Id Connect this is usually `token id_token`
   */
  response_type: string;
  /**
   * The URL you want to be redirected to after redirect from Authorisation
   */
  redirect_uri: string;
  /**
   * Define the type of token your want to receive from Authorisation.
   * In case of implicit flow this is usually 'Bearer'
   */
  scope: string;
}

/**
 * Open ID Connect Implimicit Flow Service for Angular
 */
@Injectable()
export class OidcService {

  /**
   * Create config instance
   */
  public config: OidcConfig;

  /**
   * Debug logging on or off
   * @type {boolean}
   * @private
   */
  private _debug = false;

  /**
   * Variable for holding Log function
   */
  private _log;

  /**
   * Storage function to store key,value pair to the sessionStorage
   * @param {string} key
   * @param {string} value
   * @private
   */
  private static _store(key: string, value: string) {
    sessionStorage.setItem(key, value);
  }

  /**
   * Storage function to remove key from the sessionStorage
   * @param {string} key
   * @private
   */
  private static _remove(key: string) {
    sessionStorage.removeItem(key);
  }

  /**
   * Storage function to read a key from the sessionStorage
   * @param {string} key
   * @returns {string}
   * @private
   */
  private static _read(key: string): string {
    return sessionStorage.getItem(key);
  }

  /**
   * Return the current time in seconds since 1970
   * @returns {number}
   * @private
   */
  private static _epoch(): number {
    return Math.round(new Date().getTime() / 1000.0);
  }

  /**
   * Generates a random 'state' string
   * @returns {string}
   * @private
   */
  private static _generateState(): string {
    return 'xxxxxxxx-xxxx-14xx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      // tslint:disable-next-line:no-bitwise
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Generates a random 'nonce' string
   * @returns {string}
   * @private
   */
  private static _generateNonce(): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 25; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  /**
   * Convert Object to URL Query string
   * @param {Object} urlVars
   * @returns {string}
   * @private
   */
  private static _createURLParameters(urlVars: Object): string {
    const params = new URLSearchParams();

    // Set the new Query string params.
    for (const key in urlVars) {
      if (urlVars.hasOwnProperty(key)) {
        params.set(key, urlVars[key]);
      }
    }

    return params.toString();
  }


  /**
   * Constructor
   * @param {Http} _http
   */
  constructor(private _http: Http) {

    /**
     * Logging wrapper function
     */
    if (this._debug && (typeof console !== 'undefined')) {
      this._log = console.log.bind(console);
    } else {
      this._log = function () {
      };
    }
  }

  /**
   * Get a CSRF Token from the Authorisation
   * @returns {Observable<CsrfToken>}
   */
  public getCsrfToken(): Observable<CsrfToken> {
    this._log('Get CSRF token from Authorisation');

    return this._http
      .post(this.config.csrf_token_endpoint, '', {
        withCredentials: true
      })
      .map(res => res.json());
  }

  /**
   * Get the CSRF Token from the Local Storage
   * @returns {string}
   */
  public getStoredCsrfToken(): string {
    this._log('CSRF Token from storage', OidcService._read('_csrf'));
    return OidcService._read('_csrf');
  }

  /**
   * Get a validated, not expired token from sessionStorage
   * @returns {Token}
   */
  public getStoredToken(): Token | null {

    // Get the tokens from storage, and make sure they're still valid
    const tokens = this._getStoredTokens(),
      tokensCleaned = this._cleanExpiredTokens(tokens);

    this._log('-- tokens', JSON.stringify({tokens}));

    // If there's no valid token return null
    if (tokensCleaned.length < 1) {
      return null;
    }
    // Return the first valid token
    else {
      this._log('Valid token returned from session storage', tokensCleaned[0]);
      return tokensCleaned[0];
    }
  }

  /**
   * Clean up the current session: Delete the stored local tokens, state, nonce, and CSRF token.
   */
  public cleanSessionStorage(providerIDs: string[] = [`${this.config.provider_id}`]) {
    providerIDs.forEach((providerId: string) => {
      this.deleteStoredTokens(providerId);
      this._deleteState(providerId);
      this._deleteNonce(providerId);
      this._deleteSessionId(providerId);
    });

    this._deleteStoredCsrfToken();
  }

  /**
   * Check to see if a session is still actively used somewhere else (i.e. other platform).
   * @returns {Observable<Object>}
   */
  public isSessionAlive(): Observable<{ status: number }> {
    this._log('Get Session Alive info from SSO');

    return this._http
      .get(`${this.config.is_session_alive_endpoint}/${this._getSessionId()}`);
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
  public deleteStoredTokens(providerId: string = `${this.config.provider_id}`) {
    this._log(`Removed Tokens from session storage: ${providerId}`);
    OidcService._remove(`${providerId}-token`);
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with authorize params) to the Authorisation
   * The Authorisation checks if there is a valid session. If so, it returns with token hash.
   * If not authenticated, it will redirect to the login page.
   */
  public authorizeRedirect() {

    // Clean up Storage before we begin
    this.cleanSessionStorage();

    const authorizeParams = this._getAuthorizeParams();
    const urlParams = this._getURLParameters();

    // All clear ->
    // Do the authorize redirect
    if (!urlParams['error']) {
      this._log('Do authorisation redirect to SSO with options:', authorizeParams);
      window.location.href = `${this.config.authorize_endpoint}?${OidcService._createURLParameters(authorizeParams)}`;
    }
    // Error in authorize redirect
    else {
      this._log(`Error in authorize redirect: ${urlParams['error']}`);
    }
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with session upgrade params) to the Authorisation
   * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
   * then return a valid token, because the session was upgraded.
   */
  public doSessionUpgradeRedirect(token: Token) {
    const urlVars = {
      session_upgrade_token: token.session_upgrade_token,
      redirect_uri: this.config.redirect_uri + '?flush_state=true'
    };

    this._log('Session upgrade function triggered with token: ', token.session_upgrade_token);

    // Do the authorize redirect
    window.location.href = `${this.config.authorisation}/sso/upgrade-session?${OidcService._createURLParameters(urlVars)}`;
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

    const urlParams = this._getURLParameters(window.location.href),
      hashFragmentParams = this._getHashFragmentParameters(OidcService._read('hash_fragment'));

    this._log('Check session with params:', urlParams);

    return new Observable<boolean>(observer => {


      this._log('Flush state ?', urlParams.flush_state);

      // 1 Make sure the state is 'clean' when doing a session upgrade
      if (urlParams.flush_state) {
        this.cleanSessionStorage();
        this._log('Flush state present, so cleaning the storage');
      }

      // 2 --- Let's first check if we still have a valid token stored locally, if so use that token
      if (this.getStoredToken()) {
        this._log('Local token found, you may proceed');
        observer.next(true);
        observer.complete();
      }
      // No valid token found in storage, so we need to get a new one.
      else {

        // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
        this.getCsrfToken().subscribe(token => {

          // Store the CSRF Token for future calls that need it. I.e. Logout
          OidcService._store('_csrf', token.csrf_token);

          // 3 --- There's an access_token in the URL
          if (hashFragmentParams.access_token && hashFragmentParams.state) {

            this._log('Access Token found in session storage temp, validating it');

            const stateObj = this._getState();

            // We received a token from SSO, so we need to validate the state
            if (hashFragmentParams.state === stateObj.state) {
              this._log('State from URL validated against state in session storage state object', stateObj);

              // State validated, so now let's validate the token with Hawaii Backend
              this._validateToken(hashFragmentParams).map(res => res.json()).subscribe(
                response => {
                  this._log('Token validated by backend', response);

                  // Store the token in the storage
                  this._storeToken(hashFragmentParams);

                  if (response.user_session_id) {
                    this._saveSessionId(response.user_session_id);
                  }

                  // We're logged in with token in URL
                  this._log('Token from URL validated, you may proceed.');
                  observer.next(true);
                  observer.complete();


                },
                // Something's wrong with the token according to the backend
                response => {
                  this._log('Token NOT validated by backend', response);
                  observer.next(false);
                  observer.complete();
                });
            } else {
              this._log('State NOT valid');
              observer.next(false);
              observer.complete();
            }
          }

          // 4 --- There's a session upgrade token in the URL
          else if (hashFragmentParams.session_upgrade_token) {

            this._log('Session Upgrade Token found in URL');
            this.doSessionUpgradeRedirect(hashFragmentParams);
          }

          // 5 --- No token in URL or Storage, so we need to get one from SSO
          else {
            this._log('No valid token in Storage or URL, Authorize Redirect!');
            this.authorizeRedirect();
            observer.next(false);
            observer.complete();
          }

        });
      }
    });
  }

  /**
   * Posts the received token to the Backend for decrypion and validation
   * @param {Token} hashParams
   * @returns {Observable<any>}
   * @private
   */
  private _validateToken(hashParams: Token): Observable<any> {

    const data = {
      nonce: this._getNonce(),
      id_token: hashParams.id_token,
      access_token: hashParams.access_token
    };

    this._log('Validate token with Hawaii Backend');

    return this._http
      .post(this.config.validate_token_endpoint, data);
  }

  /**
   * Posts the session upgrade token to the Authorisation
   * @param {Object} data
   * @returns {Observable<any>}
   * @private
   */
  private _postSessionUpgrade(data: Object): Observable<any> {
    this._log('Posting session upgrade token to backend');

    return this._http
      .post(this.config.upgrade_session_endpoint, data);
  }

  /**
   * Saves the state string to sessionStorage
   * @param {State} state
   * @private
   */
  private _saveState(state: State) {
    this._log('State saved');
    OidcService._store(`${this.config.provider_id}-state`, JSON.stringify(state));
  }

  /**
   * Get the saved state string from sessionStorage
   * @returns {State}
   * @private
   */
  private _getState(): State {
    this._log('Got state from storage', OidcService._read(`${this.config.provider_id}-state`));
    return JSON.parse(OidcService._read(`${this.config.provider_id}-state`));
  }

  /**
   * Deletes the state from sessionStorage
   * @private
   */
  private _deleteState(providerId: string = `${this.config.provider_id}`) {
    this._log(`Deleted state: ${providerId}`);
    OidcService._remove(`${providerId}-state`);
  }

  /**
   * Saves the nonce to sessionStorage
   * @param {string} nonce
   * @private
   */
  private _saveNonce(nonce: string) {
    OidcService._store(`${this.config.provider_id}-nonce`, nonce);
  }

  /**
   * Get the saved nonce string from storage
   * @returns {string}
   * @private
   */
  private _getNonce(): string {
    return OidcService._read(`${this.config.provider_id}-nonce`);
  }

  /**
   * Deletes the nonce from sessionStorage
   * @private
   */
  private _deleteNonce(providerId: string = `${this.config.provider_id}`) {
    OidcService._remove(`${providerId}-nonce`);
  }

  /**
   * Saves the session ID to sessionStorage
   * @param {string} sessionId
   * @private
   */
  private _saveSessionId(sessionId: string) {
    OidcService._store(`${this.config.provider_id}-session-id`, JSON.stringify(sessionId));
  }

  /**
   * Get the saved session ID string from storage
   * @returns {string}
   * @private
   */
  private _getSessionId(): string {
    return OidcService._read(`${this.config.provider_id}-session-id`);
  }

  /**
   * Deletes the session ID from sessionStorage
   * @private
   */
  private _deleteSessionId(providerId: string = `${this.config.provider_id}`) {
    OidcService._remove(`${providerId}-session-id`);
  }

  /**
   * Stores an array of Tokens to the session Storage
   * @param {Array<Token>} tokens
   * @private
   */
  private _storeTokens(tokens: Array<Token>) {
    this._log('Saved Tokens to session storage');
    OidcService._store(`${this.config.provider_id}-token`, JSON.stringify(tokens));
  }

  /**
   * Deletes the stored CSRF Token from storage
   * @private
   */
  private _deleteStoredCsrfToken() {
    this._log(`Removed CSRF Token from session storage`);
    OidcService._remove(`_csrf`);
  }

  /**
   * Get all token stored in session Storage in an Array
   * @returns {Array<Token>}
   * @private
   */
  private _getStoredTokens(): Array<Token> {
    this._log(`Got Tokens from session storage with name '${this.config.provider_id}-token'`);
    return JSON.parse(OidcService._read(`${this.config.provider_id}-token`)) || [];
  }

  /**
   * Compare the expiry time of a stored token with the current time.
   * If the token has expired, remove it from the array.
   * Return the cleaned Array.
   * @param {Token[]} storedTokens
   * @returns {Token[]}
   * @private
   */
  private _cleanExpiredTokens(storedTokens: Token[]): Token[] {

    let cleanTokens: Token[];
    const time = OidcService._epoch();

    cleanTokens = storedTokens.filter((element: Token) => {
      this._log('Stored token', element.expires, time + 5);
      return (element.expires && element.expires > time + 5);
    });

    this._log('Clean tokens returned:', cleanTokens);

    return cleanTokens;
  }

  /**
   * * Get the current Stored tokens
   * * Set the tokens expiry time. Current time in seconds + (token lifetime in seconds - x seconds)
   * * Put the new token to the beginning of the array, so it's the first one returnedy
   * * Clean expired tokens from the Array
   * * Save the new token array
   * * Return the cleaned set of Tokens
   *
   * @param {Token} token
   * @private
   */
  private _storeToken(token: Token) {

    const tokens = this._getStoredTokens();
    let tokensCleaned;
    token.expires = OidcService._epoch() + (parseInt(token.expires_in, 10) - 30);
    tokens.unshift(token);
    tokensCleaned = this._cleanExpiredTokens(tokens);
    this._storeTokens(tokensCleaned);
  }


  /**
   * Get Hash Fragment parameters from sessionStorage
   * @param {string} hash_fragment
   * @returns {Token}
   * @private
   */
  private _getHashFragmentParameters(hash_fragment: string): Token {

    const result = {};
    let urlVariablesToParse;

    if (hash_fragment) {
      urlVariablesToParse = hash_fragment.split('&');

      for (const urlVar of urlVariablesToParse) {
        const parameter = urlVar.split('=');
        result[parameter[0]] = parameter[1];
      }

      OidcService._remove('hash_fragment');

      this._log('Hash Fragment params from sessionStorage', result);
    }

    return result;
  }

  /**
   * Return an object with URL parameters
   * @param {string} url
   * @returns {URLParams}
   * @private
   */
  private _getURLParameters(url: string = window.location.href): URLParams {

    const result = {},
      searchIndex = url.indexOf('?'),
      hashIndex = url.indexOf('#');

    let urlStringToParse,
      urlVariablesToParse;

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


    for (const urlVar of urlVariablesToParse) {
      const parameter = urlVar.split('=');
      result[parameter[0]] = parameter[1];
    }

    this._log('URL params', result);

    return result;
  }

  /**
   * Gather the URL params for Authorize redirect method
   * @returns {AuthorizeParams}
   * @private
   */
  private _getAuthorizeParams(): AuthorizeParams {

    const stateObj = this._getState() || {
        state: OidcService._generateState(),
        providerId: this.config.provider_id
      },
      nonce = OidcService._generateNonce(),
      urlVars = {
        state: stateObj.state,
        nonce: nonce,
        authorization: this.config.authorisation,
        providerId: this.config.provider_id,
        client_id: this.config.client_id,
        response_type: this.config.response_type,
        redirect_uri: this.config.redirect_uri,
        scope: this.config.scope
      };

    // Save the generated state & nonce
    this._saveState(stateObj);
    this._saveNonce(nonce);

    this._log('Gather the Authorize Params', urlVars);
    return urlVars;
  }
}

