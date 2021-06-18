import { StorageUtil } from "../utils/storageUtil";
import { LogUtil } from "../utils/logUtil";
import {
  CsrfToken,
  Token,
  TokenValidationOptions,
} from "../models/token.models";
import { ValidSession } from "../models/session.models";
import { AuthorizeParams } from "../models/url-param.models";
import { GeneratorUtil } from "../utils/generatorUtil";
import {
  deleteIdTokenHint,
  deleteStoredCsrfToken,
  deleteStoredTokens,
  getCsrfToken,
  getIdTokenHint,
  getStoredToken,
  saveIdTokenHint,
  storeToken,
  tokenHasRequiredScopes,
} from "./token.service";
import { deleteState, getState, saveState } from "../utils/stateUtil";
import { deleteNonce, getNonce, saveNonce } from "../utils/nonceUtil";
import {
  deleteSessionId,
  getSessionId,
  saveSessionId,
} from "../utils/sessionUtil";
import {
  createURLParameters,
  getHashFragmentParameters,
  getURLParameters,
} from "../utils/urlUtil";
import { OidcConfigService } from "./config.service";
import { transformScopesStringToArray } from "../utils/scopeUtil";

/**
 * Cleans up the current session: deletes the stored local tokens, state, nonce, id token hint and CSRF token.
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
 * Checks if a session is alive. This may be on another platform.
 * This is normally used in conjunction with a silent logout. It
 * doesn't extend the lifetime of the current session. If a
 * session is found, a logout should NOT be triggered.
 *
 * @returns The status code of the HTTP response
 */
export function isSessionAlive(): Promise<{ status: number }> {
  LogUtil.debug("Get Session Alive info from SSO");

  return new Promise<{ status: number }>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open(
      "GET",
      `${OidcConfigService.config.is_session_alive_endpoint}/${getSessionId()}`,
      true,
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
 * Checks if the token has a valid state. If not, throw an error.
 *
 * @param hashToken the token to be validated
 */
export function validateTokenState(hashToken: Token): void {
  LogUtil.debug("Validating Token state");
  const stateObj = getState();

  // We received a token from SSO, so we need to validate the state
  if (!stateObj || hashToken.state !== stateObj.state) {
    LogUtil.error("Authorisation Token not valid");
    LogUtil.debug("State NOT valid");
    throw Error("token_state_invalid");
  }

  LogUtil.debug(
    "State from URL validated against state in session storage state object",
    stateObj,
  );
}

/**
 * Parse the token in the Hash
 *
 * Validates if the hash token has the appropriate state which
 * was previously supplied to the server. If this state matches,
 * the client will continue by confirming the validity of the
 * token with the backend. If the token is valid, it is saved
 * locally in the token store and returned.
 */
export async function parseToken(hashToken: Token): Promise<Token> {
  validateTokenState(hashToken);

  // State validated, so now let's validate the token with Backend
  try {
    const validSession = await validateToken(hashToken);
    LogUtil.debug("Token validated by backend", validSession);

    // Store the token in the storage
    storeToken(hashToken);

    // Store the session ID
    saveSessionId(validSession.user_session_id);

    // We're logged in with token in URL
    LogUtil.debug("Token from URL validated, you may proceed.");
    return hashToken;
  } catch (error) {
    // Something's wrong with the token according to the backend
    LogUtil.error("Authorisation Token not valid");
    LogUtil.debug("Token NOT validated by backend", error);
    throw Error("token_invalid_backend");
  }
}

/**
 * Stores Promises for the silentRefreshAccessToken
 * temporarily.
 *
 * If the silentRefreshAccessToken method is called
 * concurrently with the same scopes, only 1 iframe
 * instance will be created. The rest of these concurrent
 * calls will return the saved Promise.
 */
const silentRefreshStore: {
  [iFrameId: string]: Promise<Token>;
} = {};

/**
 * Silently refresh an access token via iFrame.
 *
 * Concurrent requests to this function will resolve to a
 * singleton Promise.
 *
 * Creates an invisible iframe that navigates to the
 * `authorize_endpoint` to get a new token there. Extracts
 * the token from the iframe URL and returns it.
 *
 * If this function fails for any reason, the Promise will reject.
 *
 * @param tokenValidationOptions The options that a token is tested for
 * @returns A valid token
 */
export function silentRefreshAccessToken(
  tokenValidationOptions?: TokenValidationOptions,
): Promise<Token> {
  const scopes: string[] =
    tokenValidationOptions?.scopes ??
    transformScopesStringToArray(OidcConfigService.config.scope);
  LogUtil.debug("Silent refresh started");

  const iFrameId = `silentRefreshAccessTokenIframe-${scopes
    .slice()
    .sort()
    .join("-")}`;

  // If there is a concurrent request to this function, return a singleton promise.
  if (silentRefreshStore[iFrameId]) {
    return silentRefreshStore[iFrameId];
  }
  const tokenPromise = new Promise<Token>((resolve, reject) => {
    const iFrame = document.createElement("iframe");
    iFrame.id = iFrameId;
    iFrame.style.display = "none";

    const promptNone = true;
    const authorizeParams = getAuthorizeParams(scopes, promptNone);

    // Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
    // For older FireFox and IE versions first append the iFrame and then set its source attribute.
    const urlParams = getURLParameters();
    if (!urlParams["error"]) {
      window.document.body.appendChild(iFrame);
      LogUtil.debug(
        "Do silent refresh redirect to SSO with options:",
        authorizeParams,
      );
      iFrame.src = `${
        OidcConfigService.config.authorize_endpoint
      }?${createURLParameters(authorizeParams)}`;
    } else {
      LogUtil.debug(
        `Error in silent refresh authorize redirect: ${urlParams["error"]}`,
      );
      reject("invalid_token");
    }

    // Handle the result of the Authorize Redirect in the iFrame
    iFrame.onload = () => {
      LogUtil.debug("silent refresh iFrame loaded", iFrame);

      // Get the URL from the iFrame
      const hashToken = getHashFragmentParameters(
        iFrame.contentWindow!.location.href.split("#")[1],
      );

      // Clean the hashfragment from storage
      if (hashToken) {
        LogUtil.debug("Hash Fragment params from sessionStorage", hashToken);
        StorageUtil.remove("hash_fragment");
      }

      if (hashToken.access_token && hashToken.state) {
        LogUtil.debug(
          "Access Token found in silent refresh return URL, validating it",
        );

        parseToken(hashToken).then((token) => {
          const hasRequiredScopes = tokenHasRequiredScopes(scopes)(token);
          LogUtil.debug("has required scopes:", hasRequiredScopes);
          const isValidByExtraMeans =
            tokenValidationOptions?.customTokenValidator?.(token) ?? true;
          LogUtil.debug("Extra Validation means:", isValidByExtraMeans, token);
          if (hasRequiredScopes && isValidByExtraMeans) {
            resolve(hashToken);
          } else {
            reject("invalid_token");
          }
        });
      } else {
        LogUtil.debug("No token found in silent refresh return URL");
        reject("no_token_found");
      }

      // Cleanup the iFrame
      setTimeout(() => destroyIframe(iFrame), 0);
    };
  }).finally(() => {
    if (silentRefreshStore[iFrameId]) {
      delete silentRefreshStore[iFrameId];
    }
  });
  // Put the promise that will resolve in the future in the
  // silent refresh promises store so that concurrent requests
  // can take advantage of this.
  silentRefreshStore[iFrameId] = tokenPromise;
  return tokenPromise;
}

/**
 * Stores Promises for the silentGetIdTokenHint
 * temporarily.
 *
 * If the silentGetIdTokenHint method is called
 * concurrently with the same scopes, only 1 iframe
 * instance will be created. The rest of these concurrent
 * calls will return the saved Promise.
 */
const silentRefreshIdTokenStore: {
  [iFrameId: string]: Promise<string>;
} = {};

/**
 * Silently get an id token via iFrame.
 *
 * Concurrent requests to this function will resolve to a
 * singleton Promise.
 *
 * Creates an invisible iframe that navigates to the
 * `authorize_endpoint` to get a new token there. Extracts
 * the id token from the iframe URL and returns it.
 *
 * If this function fails for any reason, the Promise will reject.
 *
 * @param scopes The scopes that the id token has.
 * @returns A valid token
 */
export function silentGetIdTokenHint(scopes: string[]): Promise<string> {
  const _scopes: string[] =
    scopes ?? transformScopesStringToArray(OidcConfigService.config.scope);
  LogUtil.debug("Silent refresh started");

  const iFrameId = `silentRefreshAccessTokenIframe-${_scopes
    .slice()
    .sort()
    .join("-")}`;

  // If there is a concurrent request to this function, return a singleton promise.
  if (silentRefreshIdTokenStore[iFrameId]) {
    return silentRefreshIdTokenStore[iFrameId];
  }
  const idTokenPromise = new Promise<string>((resolve, reject) => {
    const iFrame = document.createElement("iframe");
    iFrame.id = iFrameId;
    iFrame.style.display = "none";

    const promptNone = true;
    const authorizeParams = getAuthorizeParams(_scopes, promptNone);

    // Append the iFrame, and set the source if the iFrame to the Authorize redirect, as long as there's no error
    // For older FireFox and IE versions first append the iFrame and then set its source attribute.
    const urlParams = getURLParameters();
    if (!urlParams["error"]) {
      window.document.body.appendChild(iFrame);
      LogUtil.debug(
        "Do silent refresh redirect to SSO with options:",
        authorizeParams,
      );
      iFrame.src = `${
        OidcConfigService.config.authorize_endpoint
      }?${createURLParameters(authorizeParams)}`;
    } else {
      LogUtil.debug(
        `Error in silent refresh authorize redirect: ${urlParams["error"]}`,
      );
      reject("invalid_token");
    }

    // Handle the result of the Authorize Redirect in the iFrame
    iFrame.onload = () => {
      LogUtil.debug("silent refresh iFrame loaded", iFrame);

      // Get the URL from the iFrame
      const hashToken = getHashFragmentParameters(
        iFrame.contentWindow!.location.href.split("#")[1],
      );

      // Clean the hashfragment from storage
      if (hashToken) {
        LogUtil.debug("Hash Fragment params from sessionStorage", hashToken);
        StorageUtil.remove("hash_fragment");
      }

      if (hashToken.state) {
        LogUtil.debug(
          "State found in silent refresh return URL, validating it",
        );

        try {
          validateTokenState(hashToken);
        } catch (error) {
          reject(error);
          return;
        }

        if (!hashToken.id_token) {
          reject("no id token in token");
          return;
        }

        saveIdTokenHint(hashToken.id_token);
        resolve(hashToken.id_token);
      } else {
        LogUtil.debug("No token found in silent refresh return URL");
        reject("no_token_found");
      }

      // Cleanup the iFrame
      setTimeout(() => destroyIframe(iFrame), 0);
    };
  }).finally(() => {
    if (silentRefreshIdTokenStore[iFrameId]) {
      delete silentRefreshIdTokenStore[iFrameId];
    }
  });
  // Put the promise that will resolve in the future in the
  // silent refresh promises store so that concurrent requests
  // can take advantage of this.
  silentRefreshIdTokenStore[iFrameId] = idTokenPromise;
  return idTokenPromise;
}

const silentLogoutStore: {
  [iFrameId: string]: Promise<void>;
} = {};

/**
 * Allows you to initiate a logout of the session in the background via an
 * iframe.
 *
 * This logout will not redirect the top-level window to the logged-out page.
 * It is important that the result of the returning Promise is used to take
 * an action (e.g. do a redirect to the logout page).
 *
 * The logout was successful if the iframe ended up on the configured
 * `post_logout_redirect_uri`.
 *
 * @param url A URL pointing to a *page*.
 * This *page* should make a POST request to the logout endpoint of the SSO server
 * in an automated fashion, which will cause the user to be logged out.
 * The `id_token_hint` and `csrf_token` will be supplied to the *page* via this
 * function. Defaults to `silent_logout_uri` from the config.
 * @returns The promise resolves if the logout was successful, otherwise it will reject.
 */
export function silentLogoutByUrl(
  url = OidcConfigService.config.silent_logout_uri,
): Promise<void> {
  LogUtil.debug("Silent logout by URL started");
  const iframeId = `silentLogoutIframe`;

  // Checks if there is a concurrent silent logout call going on.
  if (silentLogoutStore[iframeId]) {
    return silentLogoutStore[iframeId];
  }

  const silentLogoutPromise = new Promise<void>((resolve, reject) => {
    // Create an iFrame
    const iFrame = getLogoutIFrame();

    // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
    getCsrfToken().then(
      (response: CsrfToken) => {
        const csrfToken: CsrfToken = response;

        LogUtil.debug(
          `Do silent logout with URL ${url}?id_token_hint=${getIdTokenHint()}&csrf_token=${
            csrfToken.csrf_token
          }`,
        );
        iFrame.src = `${url}?id_token_hint=${getIdTokenHint()}&csrf_token=${
          csrfToken.csrf_token
        }`;
      },
      () => {
        LogUtil.debug("no CsrfToken");
        reject("no_csrf_token");
      },
    );

    // Handle the result of the Authorize Redirect in the iFrame
    iFrame.onload = () => {
      LogUtil.debug("silent logout iFrame onload triggered", iFrame);

      let timeout = 5000;
      const interval = 50;

      const intervalTimer = setInterval(() => {
        timeout = timeout - interval;

        if (timeout <= 0) {
          LogUtil.debug(
            "Silent logout failed after 5000",
            iFrame.contentWindow!.location.href,
            OidcConfigService.config.post_logout_redirect_uri,
          );

          clearInterval(intervalTimer);
          destroyIframe(iFrame);
          reject("timeout");
          return;
        }

        const currentIframeURL = iFrame.contentWindow!.location.href;
        if (
          currentIframeURL.indexOf(
            OidcConfigService.config.post_logout_redirect_uri,
          ) === 0
        ) {
          LogUtil.debug(
            "Silent logout successful",
            iFrame.contentWindow!.location.href,
            OidcConfigService.config.post_logout_redirect_uri,
          );

          clearInterval(intervalTimer);
          destroyIframe(iFrame);
          resolve();
        }
      }, interval);
    };
  }).finally(() => {
    if (silentLogoutStore[iframeId]) {
      delete silentLogoutStore[iframeId];
    }
  });
  // Sets the silent logout promise so concurrent calls to this function will
  // use the same promise.
  silentLogoutStore[iframeId] = silentLogoutPromise;

  return silentLogoutPromise;
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
 * destroy an iframe in a IE11 friendly-manner.
 * @param iFrame the iframe to destroy
 */
function destroyIframe(iFrame: HTMLIFrameElement): void {
  // We use parent.removeChild instead of element.remove to support IE.
  iFrame.parentElement!.removeChild(iFrame);
}

/**
 * Gather the URL params for Authorize redirect method
 *
 * @param scopes the scopes to authorise for.
 * @param promptNone If true, the user will not be asked to
 * authorise this app. If no authentication is required,
 * the user will not be asked with any configuration.
 * @returns the parameters to use for an authorise request
 */
function getAuthorizeParams(
  scopes: string[],
  promptNone = false,
): AuthorizeParams {
  const stateObj = getState() || {
    state: GeneratorUtil.generateState(),
    providerId: OidcConfigService.config.provider_id,
  };

  const urlVars: AuthorizeParams = {
    nonce: getNonce() || GeneratorUtil.generateNonce(),
    state: stateObj.state,
    authorization: OidcConfigService.config.authorisation,
    providerId: OidcConfigService.config.provider_id,
    client_id: OidcConfigService.config.client_id,
    response_type: OidcConfigService.config.response_type,
    redirect_uri:
      promptNone && OidcConfigService.config.silent_refresh_uri
        ? OidcConfigService.config.silent_refresh_uri
        : OidcConfigService.config.redirect_uri,
    scope: scopes.join(" "),
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

    xhr.open("POST", OidcConfigService.config.validate_token_endpoint, true);

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
 * Get the Authorisation header for usage with rest calls.
 *
 * Uses the token type present in the token.
 */
export function getAuthHeader(token: Token): string {
  return `${token.token_type} ${token.access_token}`;
}

/**
 * Check if the token expires in the next *x* seconds.
 *
 * If this is the case,
 * a silent refresh will be triggered and the Promise will resolve to `true`.
 *
 * If the token does not expire within *x* seconds, the Promise will resolve
 * to `false` instead.
 *
 * @param token the token to check
 * @param tokenValidationOptions extra validations for the token
 * @returns A promise. May throw and error if the token
 * we got from the refresh is not valid.
 */
export async function checkIfTokenExpiresAndRefreshWhenNeeded(
  token: Token,
  tokenValidationOptions?: TokenValidationOptions & {
    almostExpiredThreshold?: number;
  },
): Promise<void> {
  if (
    token.expires &&
    token.expires - Math.round(new Date().getTime() / 1000.0) <
      (tokenValidationOptions?.almostExpiredThreshold ?? 300)
  ) {
    const silentRefreshToken = await silentRefreshAccessToken(
      tokenValidationOptions,
    );
    if (silentRefreshToken) {
      return;
    }
    throw Error("invalid_token");
  }
  return;
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

  const scopes = transformScopesStringToArray(OidcConfigService.config.scope);
  const authorizeParams = getAuthorizeParams(scopes);
  const urlParams = getURLParameters();

  // All clear ->
  // Do the authorize redirect
  if (!urlParams["error"]) {
    LogUtil.debug(
      "Do authorisation redirect to SSO with options:",
      authorizeParams,
    );
    window.location.href = `${
      OidcConfigService.config.authorize_endpoint
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
    redirect_uri: `${OidcConfigService.config.redirect_uri}?flush_state=true`,
  };

  LogUtil.debug(
    "Session upgrade function triggered with token: ",
    token.session_upgrade_token,
  );

  // Do the authorize redirect
  const urlParams = createURLParameters(urlVars);
  window.location.href = `${OidcConfigService.config.authorisation}/sso/upgrade-session?${urlParams}`;
}

/**
 * Checks if there is a session available.
 * If this is not available, redirect to the authorisation page.
 *
 * Before starting with checks, we flush state if needed (in case of session upgrade i.e.)
 * 1. If there is a valid session storage token, we are done.
 * 2. Else, if we may refresh in the background, try to do that.
 * 3. Else, if there is an *access_token* in the URL;
 *   - a. Validate that the state from the response is equal to the state previously generated on the client.
 *   - b. Validate token from URL with Backend
 *   - c. Store the token
 *   - d. Get a new CSRF token from Authorisation with the newly created session, and save it for i.e. logout usage
 * 4. Check if there's a session_upgrade_token in the URL, if so, call the session upgrade function
 * 5. Nothing found anywhere, so redirect to authorisation
 *
 * @param tokenValidationOptions If not set, takes the tokens from the config.
 * @returns A valid token
 *
 * It will reject (as well as redirect) in case the check did not pass.
 */
export async function checkSession(
  tokenValidationOptions?: TokenValidationOptions,
): Promise<Token> {
  const allowBackgroundRefresh = !!tokenValidationOptions;
  const urlParams = getURLParameters(window.location.href);

  // With Clean Hash fragment implemented in Head
  const hashToken = getHashToken();

  LogUtil.debug("Check session with params:", urlParams);
  // Make sure the state is 'clean' when doing a session upgrade
  if (urlParams.flush_state) {
    cleanSessionStorage();
    LogUtil.debug("Flush state present, so cleaning the storage");

    // Remove flush_state param from query params, so we only do it once
    OidcConfigService.config.redirect_uri = OidcConfigService.config.redirect_uri.split(
      "?",
    )[0];
  }

  // 1 --- Let's first check if we still have a valid token stored local, if so use that token
  const storedToken = getStoredToken(tokenValidationOptions);
  if (storedToken) {
    LogUtil.debug("Local token found, you may proceed");
    return storedToken;
  }

  if (allowBackgroundRefresh) {
    // 2 --- If these is no token, check if we can get a token from silent refresh.
    const tokenFromSilentRefresh = await silentRefreshAccessToken(
      tokenValidationOptions,
    );
    if (tokenFromSilentRefresh) {
      LogUtil.debug("Token from silent refresh is valid.");
      return tokenFromSilentRefresh;
    }
  }

  // No valid token found in storage, so we need to get a new one.
  // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
  const csrfToken = await getCsrfToken();
  // Store the CSRF Token for future calls that need it. I.e. Logout
  StorageUtil.store("_csrf", csrfToken.csrf_token);

  if (hashToken && hashToken.access_token && hashToken.state) {
    // 3 --- There's an access_token in the URL
    const hashFragmentToken = await parseToken(hashToken);
    if (hashFragmentToken) {
      return hashFragmentToken;
    }
    throw Error("hash_token_invalid");
  }

  if (hashToken?.session_upgrade_token) {
    // 4 --- There's a session upgrade token in the URL
    LogUtil.debug("Session Upgrade Token found in URL");
    doSessionUpgradeRedirect(hashToken);
    throw Error("will_session_upgrade_redirect");
  } else {
    // 5 --- No token in URL or Storage, so we need to get one from SSO
    LogUtil.debug("No valid token in Storage or URL, Authorize Redirect!");
    authorizeRedirect();
    throw Error("will_authorize_redirect");
  }
}

function getHashToken(): Token | null {
  let hashFragment = StorageUtil.read("hash_fragment");

  // If we don't have an access token in the browser storage,
  // but do have one in the url bar hash (https://example.com/#<fragment>)
  if (!hashFragment && window.location.hash.indexOf("access_token") !== -1) {
    hashFragment = window.location.hash.substring(1);
    clearHashFragmentFromUrl();
  }

  const hashToken = hashFragment
    ? getHashFragmentParameters(hashFragment)
    : null;

  // Clean the hash fragment from storage
  if (hashToken) {
    StorageUtil.remove("hash_fragment");
  }
  return hashToken;
}

/**
 * clears the hash fragment of a url.
 */
function clearHashFragmentFromUrl() {
  history.pushState(
    "",
    document.title,
    window.location.pathname + window.location.search,
  );
}
