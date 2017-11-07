import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
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
export declare class OidcService {
    private _http;
    /**
     * Create config instance
     */
    config: OidcConfig;
    /**
     * Debug logging on or off
     * @type {boolean}
     * @private
     */
    private _debug;
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
    private static _store(key, value);
    /**
     * Storage function to remove key from the sessionStorage
     * @param {string} key
     * @private
     */
    private static _remove(key);
    /**
     * Storage function to read a key from the sessionStorage
     * @param {string} key
     * @returns {string}
     * @private
     */
    private static _read(key);
    /**
     * Return the current time in seconds since 1970
     * @returns {number}
     * @private
     */
    private static _epoch();
    /**
     * Generates a random 'state' string
     * @returns {string}
     * @private
     */
    private static _generateState();
    /**
     * Generates a random 'nonce' string
     * @returns {string}
     * @private
     */
    private static _generateNonce();
    /**
     * Convert Object to URL Query string
     * @param {Object} urlVars
     * @returns {string}
     * @private
     */
    private static _createURLParameters(urlVars);
    /**
     * Constructor
     * @param {Http} _http
     */
    constructor(_http: Http);
    /**
     * Get a CSRF Token from the Authorisation
     * @returns {Observable<CsrfToken>}
     */
    getCsrfToken(): Observable<CsrfToken>;
    /**
     * Get the CSRF Token from the Local Storage
     * @returns {string}
     */
    getStoredCsrfToken(): string;
    /**
     * Get a validated, not expired token from sessionStorage
     * @returns {Token}
     */
    getStoredToken(): Token | null;
    /**
     * Clean up the current session: Delete the stored local tokens, state, nonce, and CSRF token.
     */
    cleanSessionStorage(providerIDs?: string[]): void;
    /**
     * Check to see if a session is still actively used somewhere else (i.e. other platform).
     * @returns {Observable<Object>}
     */
    isSessionAlive(): Observable<{
        status: number;
    }>;
    /**
     * Return the Authorisation header for usage with rest calls
     * @returns {string}
     */
    getAuthHeader(): string;
    /**
     * Delete all tokens in sessionStorage for this session.
     */
    deleteStoredTokens(providerId?: string): void;
    /**
     * HTTP Redirect to the Authorisation. This redirects (with authorize params) to the Authorisation
     * The Authorisation checks if there is a valid session. If so, it returns with token hash.
     * If not authenticated, it will redirect to the login page.
     */
    authorizeRedirect(): void;
    /**
     * HTTP Redirect to the Authorisation. This redirects (with session upgrade params) to the Authorisation
     * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
     * then return a valid token, because the session was upgraded.
     */
    doSessionUpgradeRedirect(token: Token): void;
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
    checkSession(): Observable<boolean>;
    /**
     * Posts the received token to the Backend for decrypion and validation
     * @param {Token} hashParams
     * @returns {Observable<any>}
     * @private
     */
    private _validateToken(hashParams);
    /**
     * Posts the session upgrade token to the Authorisation
     * @param {Object} data
     * @returns {Observable<any>}
     * @private
     */
    private _postSessionUpgrade(data);
    /**
     * Saves the state string to sessionStorage
     * @param {State} state
     * @private
     */
    private _saveState(state);
    /**
     * Get the saved state string from sessionStorage
     * @returns {State}
     * @private
     */
    private _getState();
    /**
     * Deletes the state from sessionStorage
     * @private
     */
    private _deleteState(providerId?);
    /**
     * Saves the nonce to sessionStorage
     * @param {string} nonce
     * @private
     */
    private _saveNonce(nonce);
    /**
     * Get the saved nonce string from storage
     * @returns {string}
     * @private
     */
    private _getNonce();
    /**
     * Deletes the nonce from sessionStorage
     * @private
     */
    private _deleteNonce(providerId?);
    /**
     * Saves the session ID to sessionStorage
     * @param {string} sessionId
     * @private
     */
    private _saveSessionId(sessionId);
    /**
     * Get the saved session ID string from storage
     * @returns {string}
     * @private
     */
    private _getSessionId();
    /**
     * Deletes the session ID from sessionStorage
     * @private
     */
    private _deleteSessionId(providerId?);
    /**
     * Stores an array of Tokens to the session Storage
     * @param {Array<Token>} tokens
     * @private
     */
    private _storeTokens(tokens);
    /**
     * Deletes the stored CSRF Token from storage
     * @private
     */
    private _deleteStoredCsrfToken();
    /**
     * Get all token stored in session Storage in an Array
     * @returns {Array<Token>}
     * @private
     */
    private _getStoredTokens();
    /**
     * Compare the expiry time of a stored token with the current time.
     * If the token has expired, remove it from the array.
     * Return the cleaned Array.
     * @param {Token[]} storedTokens
     * @returns {Token[]}
     * @private
     */
    private _cleanExpiredTokens(storedTokens);
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
    private _storeToken(token);
    /**
     * Get Hash Fragment parameters from sessionStorage
     * @param {string} hash_fragment
     * @returns {Token}
     * @private
     */
    private _getHashFragmentParameters(hash_fragment);
    /**
     * Return an object with URL parameters
     * @param {string} url
     * @returns {URLParams}
     * @private
     */
    private _getURLParameters(url?);
    /**
     * Gather the URL params for Authorize redirect method
     * @returns {AuthorizeParams}
     * @private
     */
    private _getAuthorizeParams();
}
