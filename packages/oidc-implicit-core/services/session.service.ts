import { StorageUtil } from '../utils/storageUtil';
import { TokenService } from './token.service';
import { StateUtil } from '../utils/stateUtil';
import { NonceUtil } from '../utils/nonceUtil';
import { LogUtil } from '../utils/logUtil';
import { UrlUtil } from '../utils/urlUtil';
import { CsrfToken, Token } from '../models/token.models';
import { SessionUtil } from '../utils/sessionUtil';
import ConfigService from './config.service';

export class SessionService {

  /**
   * Clean up the current session: Delete the stored local tokens, state, nonce, id token hint and CSRF token.
   * @returns {void}
   * @param providerIDs
   */
  static cleanSessionStorage(providerIDs: string[] = [`${ConfigService.config.provider_id}`]): void {
    providerIDs.forEach((providerId: string) => {
      TokenService.deleteStoredTokens(providerId);
      TokenService.deleteIdTokenHint(providerId);
      StateUtil.deleteState(providerId);
      NonceUtil.deleteNonce(providerId);
      SessionUtil.deleteSessionId(providerId);
    });

    TokenService.deleteStoredCsrfToken();
  }

  /**
   * Check to see if a session is still actively used somewhere else (i.e. other platform).
   * @returns {Promise<Object>}
   */
  static isSessionAlive(): Promise<{ status: number }> {

    LogUtil.debug('Get Session Alive info from SSO');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('GET', `${ConfigService.config.is_session_alive_endpoint}/${SessionUtil.getSessionId()}`, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 204) {
            resolve({status: xhr.status});
          } else {
            reject(xhr.statusText);
          }
        }
      };

      xhr.send(null);
    }) as Promise<{ status: number }>;
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with authorize params) to the Authorisation
   * The Authorisation checks if there is a valid session. If so, it returns with token hash.
   * If not authenticated, it will redirect to the login page.
   */
  static authorizeRedirect(): void {
    // Clean up Storage before we begin
    SessionService.cleanSessionStorage();

    const authorizeParams = SessionUtil.getAuthorizeParams();
    const urlParams = UrlUtil.getURLParameters();

    // All clear ->
    // Do the authorize redirect
    if (!urlParams['error']) {
      LogUtil.debug('Do authorisation redirect to SSO with options:', authorizeParams);
      window.location.href = `${ConfigService.config.authorize_endpoint}?${UrlUtil.createURLParameters(authorizeParams)}`;
    } else {
      // Error in authorize redirect
      LogUtil.error('Redirecting to Authorisation failed');
      LogUtil.debug(`Error in authorize redirect: ${urlParams['error']}`);
    }
  }

  /**
   * HTTP Redirect to the Authorisation. This redirects (with session upgrade params) to the Authorisation
   * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
   * then return a valid token, because the session was upgraded.
   */
  static doSessionUpgradeRedirect(token: Token): void {
    const urlVars = {
      session_upgrade_token: token.session_upgrade_token,
      redirect_uri: `${ConfigService.config.redirect_uri}?flush_state=true`,
    };

    LogUtil.debug('Session upgrade function triggered with token: ', token.session_upgrade_token);

    // Do the authorize redirect
    const urlParams = UrlUtil.createURLParameters(urlVars);
    window.location.href = `${ConfigService.config.authorisation}/sso/upgrade-session?${urlParams}`;
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
   * @returns {Promise<boolean>}
   *
   * 4,5:
   * `HTTP GET` Redirects to Authorisation
   */
  static checkSession(): Promise<boolean> {
    const urlParams = UrlUtil.getURLParameters(window.location.href);

    // With Clean Hashfragment implemented in Head
    let hashFragment = StorageUtil.read('hash_fragment');

    // Without Clean Hashfragment implemented in Head
    if (!hashFragment && window.location.hash.indexOf('access_token') !== -1) {
      hashFragment = window.location.hash.substring(1);
      // Modern browsers do this
      if ('pushState' in history) {
        history.pushState('', document.title, window.location.pathname + window.location.search);
      } else {
        // Gracefull Degredation
        // Prevent scrolling by storing the page's current scroll offset
        const scrollV = document.body.scrollTop;
        const scrollH = document.body.scrollLeft;

        window.location.hash = '';

        // Restore the scroll offset, should be flicker free
        document.body.scrollTop = scrollV;
        document.body.scrollLeft = scrollH;
      }
    }

    const hashFragmentParams = UrlUtil.getHashFragmentParameters(hashFragment);

    // Clean the hashfragment from storage
    if (hashFragmentParams) {
      StorageUtil.remove('hash_fragment');
    }

    LogUtil.debug('Check session with params:', urlParams);
    return new Promise((resolve, reject) => {
      LogUtil.debug('Flush state ?', urlParams.flush_state);

      // 1 Make sure the state is 'clean' when doing a session upgrade
      if (urlParams.flush_state) {
        SessionService.cleanSessionStorage();
        LogUtil.debug('Flush state present, so cleaning the storage');
      }

      // 2 --- Let's first check if we still have a valid token stored local, if so use that token
      if (TokenService.getStoredToken()) {
        LogUtil.debug('Local token found, you may proceed');
        resolve(true);
        return;
      }

      // No valid token found in storage, so we need to get a new one.
      // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
      TokenService.getCsrfToken().then(
        (csrfToken: CsrfToken) => {

          // Store the CSRF Token for future calls that need it. I.e. Logout
          StorageUtil.store('_csrf', csrfToken.csrf_token);

          // 3 --- There's an access_token in the URL
          if (hashFragmentParams.access_token && hashFragmentParams.state) {
            SessionUtil.parseToken(hashFragmentParams).then((tokenIsValid: boolean) => resolve(tokenIsValid));
          }

          // 4 --- There's a session upgrade token in the URL
          else if (hashFragmentParams.session_upgrade_token) {
            LogUtil.debug('Session Upgrade Token found in URL');
            SessionService.doSessionUpgradeRedirect(hashFragmentParams);
          }

          // 5 --- No token in URL or Storage, so we need to get one from SSO
          else {
            LogUtil.debug('No valid token in Storage or URL, Authorize Redirect!');
            SessionService.authorizeRedirect();
            resolve(false);
          }
        },
        error => reject(error),
      );
    }) as Promise<boolean>;
  }
}
