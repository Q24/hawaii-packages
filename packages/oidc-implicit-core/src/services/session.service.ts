import { StorageUtil } from "../utils/storageUtil";
import { LogUtil } from "../utils/logUtil";
import { CsrfToken, Token } from "../models/token.models";
import { ValidSession } from "src/models/session.models";
import { AuthorizeParams } from "src/models/url-param.models";
import { GeneratorUtil } from "src/utils/generatorUtil";
import {
  deleteIdTokenHint,
  deleteStoredCsrfToken,
  deleteStoredTokens,
  getCsrfToken,
  getIdTokenHint,
  getStoredToken,
  storeToken,
} from "./token.service";
import { deleteState, getState, saveState } from "src/utils/stateUtil";
import { deleteNonce, getNonce, saveNonce } from "src/utils/nonceUtil";
import {
  deleteSessionId,
  getSessionId,
  saveSessionId,
} from "src/utils/sessionUtil";
import { oidcConfig } from "./config.service";
import {
  createURLParameters,
  getHashFragmentParameters,
  getURLParameters,
} from "src/utils/urlUtil";

/**
 * Cleans up the current session: Delete the stored local tokens, state, nonce, id token hint and CSRF token.
 */
export function cleanSessionStorage(): void {
  deleteStoredTokens();
  deleteIdTokenHint();
  deleteState();
  deleteNonce();
  deleteSessionId();
  deleteStoredCsrfToken();
}

/**
 * Check to see if a session is still actively used somewhere else (i.e. other platform).
 */
export function isSessionAlive(): Promise<{ status: number }> {
  LogUtil.debug("Get Session Alive info from SSO");

  return new Promise<{ status: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "GET",
      `${oidcConfig.is_session_alive_endpoint}/${getSessionId()}`,
      true
    );

    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 204) {
          resolve({ status: xhr.status });
        } else {
          reject(xhr.statusText);
        }
      }
    };
    xhr.send();
  });
}

/**
 * Parse the token in the Hash
 *
 */
export function parseToken(hashFragmentParams: Token): Promise<boolean> {
  LogUtil.debug("Access Token found in session storage temp, validating it");

  return new Promise<boolean>((resolve) => {
    const stateObj = getState();

    // We received a token from SSO, so we need to validate the state
    if (stateObj && hashFragmentParams.state === stateObj.state) {
      LogUtil.debug(
        "State from URL validated against state in session storage state object",
        stateObj
      );

      // State validated, so now let's validate the token with Hawaii Backend
      validateToken(hashFragmentParams).then(
        (response: ValidSession) => {
          const validSession: ValidSession = response;
          LogUtil.debug("Token validated by backend", validSession);

          // Store the token in the storage
          storeToken(hashFragmentParams);

          // Store the session ID
          saveSessionId(validSession.user_session_id);

          // We're logged in with token in URL
          LogUtil.debug("Token from URL validated, you may proceed.");
          resolve(true);
        },
        // Something's wrong with the token according to the backend
        (error) => {
          LogUtil.error("Authorisation Token not valid");
          LogUtil.debug("Token NOT validated by backend", error);
          resolve(false);
        }
      );
    } else {
      LogUtil.error("Authorisation Token not valid");
      LogUtil.debug("State NOT valid");
      resolve(false);
    }
  });
}

/**
 * Silently refresh an access token via iFrame
 *
 */
export function silentRefreshAccessToken(): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    LogUtil.debug("Silent refresh started");

    if (document.getElementById("silentRefreshAccessTokenIframe") !== null) {
      resolve(false);
      return;
    }

    /**
     * IFrame element
     * @type {HTMLIFrameElement}
     */
    const iFrame = document.createElement("iframe");

    /**
     * Get the Params to construct the URL, set promptNone = true, to add the prompt=none query parameter
     * @type {AuthorizeParams}
     */
    const authorizeParams = getAuthorizeParams(true);

    /**
     * Get the URL params to check for errors
     * @type {URLParams}
     */
    const urlParams = getURLParameters();

    /**
     * Set the iFrame Id
     * @type {string}
     */
    iFrame.id = "silentRefreshAccessTokenIframe";

    /**
     * Hide the iFrame
     * @type {string}
     */
    iFrame.style.display = "none";

    /**
     * Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
     * For older FireFox and IE versions first append the iFrame and then set its source attribute.
     */

    if (!urlParams["error"]) {
      window.document.body.appendChild(iFrame);
      LogUtil.debug(
        "Do silent refresh redirect to SSO with options:",
        authorizeParams
      );
      iFrame.src = `${oidcConfig.authorize_endpoint}?${createURLParameters(
        authorizeParams
      )}`;
    } else {
      LogUtil.debug(
        `Error in silent refresh authorize redirect: ${urlParams["error"]}`
      );
      resolve(false);
    }

    /**
     * Handle the result of the Authorize Redirect in the iFrame
     */
    iFrame.onload = () => {
      LogUtil.debug("silent refresh iFrame loaded", iFrame);

      /**
       * Get the URL from the iFrame
       * @type {Token}
       */
      const hashFragmentParams = getHashFragmentParameters(
        iFrame.contentWindow.location.href.split("#")[1]
      );

      /**
       * Clean the hashfragment from storage
       */
      if (hashFragmentParams) {
        LogUtil.debug(
          "Hash Fragment params from sessionStorage",
          hashFragmentParams
        );
        StorageUtil.remove("hash_fragment");
      }

      /**
       * Check if we have a token
       */
      if (hashFragmentParams.access_token && hashFragmentParams.state) {
        LogUtil.debug(
          "Access Token found in silent refresh return URL, validating it"
        );

        /**
         * Parse and validate the token
         */
        parseToken(hashFragmentParams).then((tokenIsValid: boolean) =>
          resolve(tokenIsValid)
        );
      } else {
        /**
         * Return False if there was no token in the URL
         */
        LogUtil.debug("No token found in silent refresh return URL");
        resolve(false);
      }

      /**
       * Cleanup the iFrame
       */
      setTimeout(() => iFrame.parentElement.removeChild(iFrame), 0);
    };
  });
}

/**
 * Silently logout via iFrame. The URL should do the POST to SSO.
 * This is merely a service tool to create the iFrame for you, and handle it's result.
 * This _DOES NOT_ logout in itself.
 *
 * Returns 'true' if logout was successful and ended up on the configured `post_logout_redirect_uri`
 * @returns {Promise<boolean>}
 */
export function silentLogoutByUrl(
  url = oidcConfig.silent_logout_uri
): Promise<boolean> {
  return new Promise<boolean>((resolve) => {
    LogUtil.debug("Silent logout by URL started");

    const silentLogoutIframe: HTMLElement | null = document.getElementById(
      "silentLogoutIframe"
    );

    if (silentLogoutIframe) {
      LogUtil.debug("Already a silent logout in progress. Try again later.");
      resolve(false);
      return;
    }

    // Create an iFrame
    const iFrame = getLogoutIFrame();

    // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
    getCsrfToken().then(
      (response: CsrfToken) => {
        const csrfToken: CsrfToken = response;

        LogUtil.debug(
          `Do silent logout with URL ${url}?id_token_hint=${getIdTokenHint()}&csrf_token=${
            csrfToken.csrf_token
          }`
        );
        iFrame.src = `${url}?id_token_hint=${getIdTokenHint()}&csrf_token=${
          csrfToken.csrf_token
        }`;
      },
      () => {
        LogUtil.debug("no CsrfToken");
        resolve(false);
      }
    );

    /**
     * Handle the result of the Authorize Redirect in the iFrame
     */
    iFrame.onload = () => {
      LogUtil.debug("silent logout iFrame onload triggered", iFrame);

      let timeout = 5000;
      const interval = 50;

      const intervalTimer = setInterval(() => {
        timeout = timeout - interval;

        if (timeout <= 0) {
          LogUtil.debug(
            "Silent logout failed after 5000",
            iFrame.contentWindow.location.href,
            oidcConfig.post_logout_redirect_uri
          );

          clearInterval(intervalTimer);
          destroyLogoutIFrame(iFrame);
          resolve(false);
        }

        const currentIframeURL = iFrame.contentWindow.location.href;
        if (
          currentIframeURL.indexOf(oidcConfig.post_logout_redirect_uri) === 0
        ) {
          LogUtil.debug(
            "Silent logout successful",
            iFrame.contentWindow.location.href,
            oidcConfig.post_logout_redirect_uri
          );

          clearInterval(intervalTimer);
          destroyLogoutIFrame(iFrame);
          resolve(true);
        }
      }, interval);
    };
  });
}

/**
 * Create a logout frame and append it to the DOM
 * @returns {HTMLIFrameElement}
 */
function getLogoutIFrame(): HTMLIFrameElement {
  /**
   * IFrame element
   * @type {HTMLIFrameElement}
   */
  const iFrame: HTMLIFrameElement = document.createElement("iframe");
  /**
   * Set the iFrame  Id
   * @type {string}
   */
  iFrame.id = "silentLogoutIframe";
  /**
   * Hide the iFrame
   * @type {string}
   */
  iFrame.style.display = "none";

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
function destroyLogoutIFrame(iFrame: HTMLIFrameElement): void {
  iFrame.parentElement.removeChild(iFrame);
}

/**
 * Gather the URL params for Authorize redirect method
 */
function getAuthorizeParams(promptNone = false): AuthorizeParams {
  const stateObj = getState() || {
    state: GeneratorUtil.generateState(),
    providerId: oidcConfig.provider_id,
  };

  const urlVars: AuthorizeParams = {
    nonce: getNonce() || GeneratorUtil.generateNonce(),
    state: stateObj.state,
    authorization: oidcConfig.authorisation,
    providerId: oidcConfig.provider_id,
    client_id: oidcConfig.client_id,
    response_type: oidcConfig.response_type,
    redirect_uri:
      promptNone && oidcConfig.silent_refresh_uri
        ? oidcConfig.silent_refresh_uri
        : oidcConfig.redirect_uri,
    scope: oidcConfig.scope,
    prompt: promptNone ? "none" : "",
  };

  // Save the generated state & nonce
  saveState(stateObj);
  saveNonce(urlVars.nonce);

  LogUtil.debug("Gather the Authorize Params", urlVars);
  return urlVars;
}

/**
 * Posts the received token to the Backend for decryption and validation
 */
function validateToken(hashParams: Token): Promise<ValidSession> {
  const data = {
    nonce: getNonce(),
    id_token: hashParams.id_token,
    access_token: hashParams.access_token,
  };

  LogUtil.debug("Validate token with TokenValidation Endpoint");

  return new Promise<ValidSession>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", oidcConfig.validate_token_endpoint, true);

    xhr.withCredentials = true;
    xhr.setRequestHeader("Content-Type", "application/json");

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
  });
}

/**
 * Get the Authorisation header for usage with rest calls
 */
export function getAuthHeader(token: Token): string {
  return `${token.token_type} ${token.access_token}`;
}

/**
 * Check if the token expires in the next (x) seconds,
 * if so, set trigger a silent refresh of the Access Token in the OIDC Service.
 * @returns {Promise<boolean>}
 */
export function checkIfTokenExpiresAndRefreshWhenNeeded(
  almostExpiredThreshold = 300,
  token: Token
): Promise<boolean> {
  return new Promise((resolve) => {
    if (
      token.expires &&
      token.expires - Math.round(new Date().getTime() / 1000.0) <
        almostExpiredThreshold
    ) {
      silentRefreshAccessToken().then(() => {
        resolve(true);
      });
    } else {
      resolve(false);
    }
  });
}

/**
 * HTTP Redirect to the Authorisation.
 *
 * This redirects (with authorize params) to the Authorisation.
 * The Authorisation checks if there is a valid session. If so, it returns with token hash.
 * If not authenticated, it will redirect to the login page.
 */
function authorizeRedirect(): void {
  // Clean up Storage before we begin
  cleanSessionStorage();

  const authorizeParams = getAuthorizeParams();
  const urlParams = getURLParameters();

  // All clear ->
  // Do the authorize redirect
  if (!urlParams["error"]) {
    LogUtil.debug(
      "Do authorisation redirect to SSO with options:",
      authorizeParams
    );
    window.location.href = `${
      oidcConfig.authorize_endpoint
    }?${createURLParameters(authorizeParams)}`;
  } else {
    // Error in authorize redirect
    LogUtil.error("Redirecting to Authorisation failed");
    LogUtil.debug(`Error in authorize redirect: ${urlParams["error"]}`);
  }
}

/**
 * HTTP Redirect to the Authorisation.
 *
 * This redirects (with session upgrade params) to the Authorisation.
 * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
 * then return a valid token, because the session was upgraded.
 */
function doSessionUpgradeRedirect(token: Token): void {
  const urlVars = {
    session_upgrade_token: token.session_upgrade_token,
    redirect_uri: `${oidcConfig.redirect_uri}?flush_state=true`,
  };

  LogUtil.debug(
    "Session upgrade function triggered with token: ",
    token.session_upgrade_token
  );

  // Do the authorize redirect
  const urlParams = createURLParameters(urlVars);
  window.location.href = `${oidcConfig.authorisation}/sso/upgrade-session?${urlParams}`;
}

/**
 * CORE METHOD:
 *
 * 1 - Check if State needs to be flushed (in case of session upgrade i.e.)
 *
 * 2 - Check if there's a valid token in the storage
 *
 * 3 - Check if there's an access_token in the URl
 *    * a. Validate state
 *    * b. Validate token from URL with Backend
 *    * c. Store the token
 *    * d. Get a new CSRF token from Authorisation with the newly created session, and save it for i.e. logout usage
 *
 * 4 - Check if there's a session_upgrade_token in the URL, if so, call the session upgrade function
 *
 * 5 - Nothing found anywhere, so redirect to authorisation
 *
 * 1,2,3:
 * @returns {Promise<boolean>}
 *
 * 4,5:
 * `HTTP GET` Redirects to Authorisation
 */
export function checkSession(): Promise<boolean> {
  const urlParams = getURLParameters(window.location.href);

  // With Clean Hash fragment implemented in Head
  let hashFragment = StorageUtil.read("hash_fragment");

  // If we don't have an access token in the browser storage,
  // but do have one in the url bar hash (https://example.com/#<fragment>)
  if (!hashFragment && window.location.hash.indexOf("access_token") !== -1) {
    hashFragment = window.location.hash.substring(1);
    clearHashFragmentFromUrl();
  }

  const hashFragmentParams = getHashFragmentParameters(hashFragment);

  // Clean the hash fragment from storage
  if (hashFragmentParams) {
    StorageUtil.remove("hash_fragment");
  }

  LogUtil.debug("Check session with params:", urlParams);
  return new Promise<boolean>((resolve, reject) => {
    // 1 Make sure the state is 'clean' when doing a session upgrade
    if (urlParams.flush_state) {
      cleanSessionStorage();
      LogUtil.debug("Flush state present, so cleaning the storage");

      // Remove flush_state param from query params, so we only do it once
      oidcConfig.redirect_uri = oidcConfig.redirect_uri.split("?")[0];
    }

    // 2 --- Let's first check if we still have a valid token stored local, if so use that token
    if (getStoredToken()) {
      LogUtil.debug("Local token found, you may proceed");
      resolve(true);
      return;
    }

    // No valid token found in storage, so we need to get a new one.
    // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
    getCsrfToken().then(
      (csrfToken: CsrfToken) => {
        // Store the CSRF Token for future calls that need it. I.e. Logout
        StorageUtil.store("_csrf", csrfToken.csrf_token);

        if (hashFragmentParams.access_token && hashFragmentParams.state) {
          // 3 --- There's an access_token in the URL
          parseToken(hashFragmentParams).then((tokenIsValid: boolean) =>
            resolve(tokenIsValid)
          );
        } else if (hashFragmentParams.session_upgrade_token) {
          // 4 --- There's a session upgrade token in the URL
          LogUtil.debug("Session Upgrade Token found in URL");
          doSessionUpgradeRedirect(hashFragmentParams);
        } else {
          // 5 --- No token in URL or Storage, so we need to get one from SSO
          LogUtil.debug(
            "No valid token in Storage or URL, Authorize Redirect!"
          );
          authorizeRedirect();
          resolve(false);
        }
      },
      (error) => reject(error)
    );
  });
}

/**
 * clears the hash fragment of a url.
 */
function clearHashFragmentFromUrl() {
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search
  );
}
