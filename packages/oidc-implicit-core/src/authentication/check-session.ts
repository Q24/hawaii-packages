import { AuthResultFilter } from "../auth-result-filter/model/auth-result-filter.model";
import { OidcConfigService } from "../configuration/config.service";
import { getCsrfResult } from "../csrf/csrf";
import { assertProviderMetadata } from "../discovery/assert-provider-metadata";
import { AuthResult } from "../jwt/model/auth-result.model";
import { AuthValidationOptions } from "../jwt/model/auth-validation-options.model";
import { cleanSessionStorage } from "../utils/clean-storage";
import { LogUtil } from "../utils/logUtil";
import { transformScopesStringToArray } from "../utils/scopeUtil";
import { StorageUtil } from "../utils/storageUtil";
import {
  createURLParameters,
  getURLParameters,
  hashFragmentToAuthResult,
} from "../utils/urlUtil";
import { silentRefresh } from "./silent-refresh";
import { getStoredAuthResult } from "./utils/auth-result";
import { getAuthorizeParams } from "./utils/authorize-params";
import { validateAndStoreAuthResult } from "./utils/validate-store-auth-result";

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
 * @param authResultFilters If not set, takes the scope from the config.
 * @returns A valid token
 *
 * It will reject (as well as redirect) in case the check did not pass.
 */
export async function checkSession(
  authValidationOptions?: AuthValidationOptions,
): Promise<AuthResult> {
  const allowBackgroundRefresh = !!authValidationOptions?.extraAuthFilters;
  const urlParams = getURLParameters(window.location.href);

  // With Clean Hash fragment implemented in Head
  const hashToken = getHashAuthResult();

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
  const storedAuthResult = getStoredAuthResult(authValidationOptions?.extraAuthFilters);
  if (storedAuthResult) {
    LogUtil.debug("Local token found, you may proceed");
    return storedAuthResult;
  }

  if (allowBackgroundRefresh) {
    // 2 --- If these is no token, check if we can get a token from silent refresh.
    const tokenFromSilentRefresh = await silentRefresh(authValidationOptions);
    if (tokenFromSilentRefresh) {
      LogUtil.debug("Token from silent refresh is valid.");
      return tokenFromSilentRefresh;
    }
  } else {
    LogUtil.debug("Background refresh not allowed");
  }

  // No valid token found in storage, so we need to get a new one.
  // Store CSRF token of the new session to storage. We'll need it for logout and authenticate
  if (OidcConfigService.config.csrf_token_endpoint) {
    const csrfToken = await getCsrfResult();
    // Store the CSRF Token for future calls that need it. I.e. Logout
    StorageUtil.store("_csrf", csrfToken.csrf_token);
  }

  if (
    hashToken &&
    (hashToken.access_token || hashToken.id_token) &&
    hashToken.state
  ) {
    LogUtil.debug(
      "An access token or id token has been found in the URL",
      "access token",
      hashToken.access_token,
      "id token",
      hashToken.id_token,
    );
    // 3 --- There's an access_token in the URL
    const hashFragmentAuthResult = await validateAndStoreAuthResult(hashToken);
    if (hashFragmentAuthResult) {
      return hashFragmentAuthResult;
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

/**
 * HTTP Redirect to the Authorisation.
 *
 * This redirects (with session upgrade params) to the Authorisation.
 * The Authorisation then upgrades the session, and will then redirect back. The next authorizeRedirect() call will
 * then return a valid token, because the session was upgraded.
 */
function doSessionUpgradeRedirect(authResult: AuthResult): void {
  const urlVars = {
    session_upgrade_token: authResult.session_upgrade_token,
    redirect_uri: `${OidcConfigService.config.redirect_uri}?flush_state=true`,
  };

  LogUtil.debug(
    "Session upgrade function triggered with token: ",
    authResult.session_upgrade_token,
  );

  // Do the authorize redirect
  const urlParams = createURLParameters(urlVars);
  assertProviderMetadata(OidcConfigService.config.providerMetadata);
  window.location.href = `${OidcConfigService.config.providerMetadata.issuer}/upgrade-session?${urlParams}`;
}

function getHashAuthResult(): AuthResult | null {
  let hashFragment = StorageUtil.read("hash_fragment");

  // If we don't have an access token in the browser storage,
  // but do have one in the url bar hash (https://example.com/#<fragment>)
  if (!hashFragment && window.location.hash.indexOf("id_token") !== -1) {
    hashFragment = window.location.hash.substring(1);
    clearHashFragmentFromUrl();
  }

  const authResult = hashFragment
    ? hashFragmentToAuthResult(hashFragment)
    : null;

  // Clean the hash fragment from storage
  if (authResult) {
    StorageUtil.remove("hash_fragment");
  }
  return authResult;
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
    assertProviderMetadata(OidcConfigService.config.providerMetadata);
    window.location.href = `${
      OidcConfigService.config.providerMetadata.authorization_endpoint
    }?${createURLParameters(authorizeParams)}`;
  } else {
    // Error in authorize redirect
    LogUtil.error("Redirecting to Authorisation failed");
    LogUtil.debug(`Error in authorize redirect: ${urlParams["error"]}`);
  }
}
