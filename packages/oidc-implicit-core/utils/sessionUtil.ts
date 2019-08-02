import { CsrfToken, Token } from '../models/token.models';
import { ValidSession } from '../models/session.models';
import { NonceUtil } from './nonceUtil';
import { LogUtil } from './logUtil';
import { UrlUtil } from './urlUtil';
import { StateUtil } from './stateUtil';
import { TokenService } from '../services/token.service';
import { StorageUtil } from './storageUtil';
import { AuthorizeParams } from '../models/url-param.models';
import { GeneratorUtil } from './generatorUtil';
import configService from '../services/config.service';

export class SessionUtil {

  /**
   * Get the saved session ID string from storage
   * @returns {string}
   * @private
   */
  static getSessionId(): string | null {
    return StorageUtil.read(`${configService.config.client_id}-session-id`);
  }

  /**
   * Saves the session ID to sessionStorage
   * @param {string} sessionId
   * @private
   */
  static saveSessionId(sessionId: string): void {
    StorageUtil.store(`${configService.config.client_id}-session-id`, sessionId);
  }

  /**
   * Deletes the session ID from sessionStorage
   * @private
   */
  static deleteSessionId(): void {
    StorageUtil.remove('-session-id');
  }

  /**
   * Get the Authorisation header for usage with rest calls
   * @returns {string}
   */
  static getAuthHeader(token: Token): string {
    return `${token.token_type} ${token.access_token}`;
  }

  /**
   * Posts the received token to the Backend for decryption and validation
   * @param {Token} hashParams
   * @returns {Promise<ValidSession>}
   * @private
   */

  static validateToken(hashParams: Token): Promise<ValidSession> {
    const data = {
      nonce: NonceUtil.getNonce(),
      id_token: hashParams.id_token,
      access_token: hashParams.access_token,
    };

    LogUtil.debug('Validate token with TokenValidation Endpoint');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', configService.config.validate_token_endpoint, true);

      xhr.withCredentials = true;
      xhr.setRequestHeader('Content-Type', 'application/json');

      xhr.onreadystatechange = function () {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            reject(xhr.statusText);
          }
        }
      };
      xhr.send(JSON.stringify(data));
    }) as Promise<ValidSession>;
  }

  /**
   * Check if the token expires in the next (x) seconds,
   * if so, set trigger a silent refresh of the Access Token in the OIDC Service.
   * @returns {Promise<boolean>}
   */
  static checkIfTokenExpiresAndRefreshWhenNeeded(almostExpiredTreshhold = 300, token: Token): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      if (token.expires && token.expires - Math.round(new Date().getTime() / 1000.0) < almostExpiredTreshhold) {
        SessionUtil.silentRefreshAccessToken()
          .then(() => {
            resolve(true);
          });
      } else {
        resolve(false);
      }
    }) as Promise<boolean>;
  }

  /**
   * Parse the token in the Hash
   * @param {Token} hashFragmentParams
   * @returns {Promise<boolean>}
   * @private
   */
  static parseToken(hashFragmentParams: Token): Promise<boolean> {
    LogUtil.debug('Access Token found in session storage temp, validating it');

    return new Promise((resolve) => {
      const stateObj = StateUtil.getState();

      // We received a token from SSO, so we need to validate the state
      if (stateObj && hashFragmentParams.state === stateObj.state) {
        LogUtil.debug('State from URL validated against state in session storage state object', stateObj);

        // State validated, so now let's validate the token with Hawaii Backend
        SessionUtil.validateToken(hashFragmentParams)
          .then(
            (response: ValidSession) => {
              const validSession: ValidSession = response;
              LogUtil.debug('Token validated by backend', validSession);

              // Store the token in the storage
              TokenService.storeToken(hashFragmentParams);

              // Store the session ID
              SessionUtil.saveSessionId(validSession.user_session_id);

              // We're logged in with token in URL
              LogUtil.debug('Token from URL validated, you may proceed.');
              resolve(true);
            },
            // Something's wrong with the token according to the backend
            (error) => {
              LogUtil.error('Authorisation Token not valid');
              LogUtil.debug('Token NOT validated by backend', error);
              resolve(false);
            },
          );
      } else {
        LogUtil.error('Authorisation Token not valid');
        LogUtil.debug('State NOT valid');
        resolve(false);
      }
    }) as Promise<boolean>;
  }

  /**
   * Silently refresh an access token via iFrame
   * @returns {Promise<boolean>}
   */
  static silentRefreshAccessToken(): Promise<boolean> {
    return new Promise((resolve) => {
      LogUtil.debug('Silent refresh started');

      if (document.getElementById('silentRefreshAccessTokenIframe') !== null) {
        resolve(false);
        return;
      }

      /**
       * IFrame element
       * @type {HTMLIFrameElement}
       */
      const iFrame = document.createElement('iframe');

      /**
       * Get the Params to construct the URL, set promptNone = true, to add the prompt=none query parameter
       * @type {AuthorizeParams}
       */
      const authorizeParams = SessionUtil.getAuthorizeParams(true);

      /**
       * Get the URL params to check for errors
       * @type {URLParams}
       */
      const urlParams = UrlUtil.getURLParameters();

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
        LogUtil.debug('Do silent refresh redirect to SSO with options:', authorizeParams);
        iFrame.src = `${configService.config.authorize_endpoint}?${UrlUtil.createURLParameters(authorizeParams)}`;
      } else {
        LogUtil.debug(`Error in silent refresh authorize redirect: ${urlParams['error']}`);
        resolve(false);
      }

      /**
       * Handle the result of the Authorize Redirect in the iFrame
       */
      iFrame.onload = () => {
        LogUtil.debug('silent refresh iFrame loaded', iFrame);

        /**
         * Get the URL from the iFrame
         * @type {Token}
         */
        const hashFragmentParams = UrlUtil.getHashFragmentParameters(
          iFrame.contentWindow.location.href.split('#')[1],
        );

        /**
         * Clean the hashfragment from storage
         */
        if (hashFragmentParams) {
          LogUtil.debug('Hash Fragment params from sessionStorage', hashFragmentParams);
          StorageUtil.remove('hash_fragment');
        }

        /**
         * Check if we have a token
         */
        if (hashFragmentParams.access_token && hashFragmentParams.state) {
          LogUtil.debug('Access Token found in silent refresh return URL, validating it');

          /**
           * Parse and validate the token
           */
          SessionUtil.parseToken(hashFragmentParams)
            .then((tokenIsValid: boolean) => resolve(tokenIsValid));
        } else {
          /**
           * Return False if there was no token in the URL
           */
          LogUtil.debug('No token found in silent refresh return URL');
          resolve(false);
        }

        /**
         * Cleanup the iFrame
         */
        setTimeout(() => iFrame.parentElement.removeChild(iFrame), 0);
      };
    }) as Promise<boolean>;
  }

  /**
   * Silently logout via iFrame. The URL should do the POST to SSO.
   * This is merely a service tool to create the iFrame for you, and handle it's result.
   * This _DOES NOT_ logout in itself.
   *
   * Returns 'true' if logout was successful and ended up on the configured `post_logout_redirect_uri`
   * @returns {Promise<boolean>}
   */
  static silentLogoutByUrl(url = configService.config.silent_logout_uri): Promise<boolean> {
    return new Promise((resolve) => {
      LogUtil.debug('Silent logout by URL started');

      const silentLogoutIframe: HTMLElement | null = document.getElementById('silentLogoutIframe');

      if (silentLogoutIframe) {
        LogUtil.debug('Already a silent logout in progress. Try again later.');
        resolve(false);
        return;
      }

      // Create an iFrame
      const iFrame = SessionUtil.getLogoutIFrame();

      // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
      TokenService.getCsrfToken().then(
        (response: CsrfToken) => {
          const csrfToken: CsrfToken = response;

          LogUtil.debug(
            `Do silent logout with URL ${url}?id_token_hint=${TokenService.getIdTokenHint()}&csrf_token=${csrfToken.csrf_token}`,
          );
          iFrame.src = `${url}?id_token_hint=${TokenService.getIdTokenHint()}&csrf_token=${csrfToken.csrf_token}`;
        },
        () => {
          LogUtil.debug('no CsrfToken');
          resolve(false);
        },
      );

      /**
       * Handle the result of the Authorize Redirect in the iFrame
       */
      iFrame.onload = () => {
        LogUtil.debug('silent logout iFrame onload triggered', iFrame);

        let timeout = 5000;
        const interval = 50;

        const intervalTimer = setInterval(
          () => {
            timeout = timeout - interval;

            if (timeout <= 0) {
              LogUtil.debug(
                'Silent logout failed after 5000',
                iFrame.contentWindow.location.href,
                configService.config.post_logout_redirect_uri,
              );

              clearInterval(intervalTimer);
              SessionUtil.destroyLogoutIFrame(iFrame);
              resolve(false);
            }

            const currentIframeURL = iFrame.contentWindow.location.href;
            if (currentIframeURL.indexOf(configService.config.post_logout_redirect_uri) === 0) {
              LogUtil.debug(
                'Silent logout successful',
                iFrame.contentWindow.location.href,
                configService.config.post_logout_redirect_uri,
              );

              clearInterval(intervalTimer);
              SessionUtil.destroyLogoutIFrame(iFrame);
              resolve(true);
            }
          },
          interval);
      };
    }) as Promise<boolean>;
  }

  /**
   * Create a logout frame and append it to the DOM
   * @returns {HTMLIFrameElement}
   */
  static getLogoutIFrame(): HTMLIFrameElement {
    /**
     * IFrame element
     * @type {HTMLIFrameElement}
     */
    const iFrame: HTMLIFrameElement = document.createElement('iframe');
    /**
     * Set the iFrame  Id
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

    return iFrame;
  }

  /**
   *
   * @param iFrame
   */
  static destroyLogoutIFrame(iFrame: HTMLIFrameElement): void {
    iFrame.parentElement.removeChild(iFrame);
  }

  /**
   * Gather the URL params for Authorize redirect method
   * @returns {AuthorizeParams}
   * @private
   */
  static getAuthorizeParams(promptNone = false): AuthorizeParams {

    const stateObj = StateUtil.getState() || {
      state: GeneratorUtil.generateState(),
      providerId: configService.config.provider_id,
    };

    const urlVars: AuthorizeParams = {
      nonce: NonceUtil.getNonce() || GeneratorUtil.generateNonce(),
      state: stateObj.state,
      authorization: configService.config.authorisation,
      providerId: configService.config.provider_id,
      client_id: configService.config.client_id,
      response_type: configService.config.response_type,
      redirect_uri:
        promptNone && configService.config.silent_refresh_uri ? configService.config.silent_refresh_uri : configService.config.redirect_uri,
      scope: configService.config.scope,
      prompt: promptNone ? 'none' : '',
    };

    // Save the generated state & nonce
    StateUtil.saveState(stateObj);
    NonceUtil.saveNonce(urlVars.nonce);

    LogUtil.debug('Gather the Authorize Params', urlVars);
    return urlVars;
  }

}
