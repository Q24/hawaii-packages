import { StorageUtil } from "../utils/storageUtil";
import { LogUtil } from "../utils/logUtil";
import {
  CsrfToken,
  AuthResult,
  TokenValidationOptions,
} from "../jwt/model/token.model";
import { GeneratorUtil } from "../utils/generatorUtil";
import { OidcConfigService } from "./config.service";
import { parseJwt } from "../jwt/parseJwt";
import { transformScopesStringToArray } from "../utils/scopeUtil";

/**
 * Deletes all the tokens from the storage.
 * If tokenFilter is passed in, only a subset will be deleted.
 *
 * @param authResultFilter if specified, the custom token validator
 * is called for every token in the store. If a tokenFilter callback
 * returns true, the token will remain in the store. Otherwise, it
 * will be deleted (Just like Array.prototype.filter())
 */
export function deleteStoredTokens(
  authResultFilter?: (authResult: Readonly<AuthResult>) => boolean,
): void {
  if (authResultFilter) {
    deleteAuthResultsFiltered(authResultFilter);
  } else {
    LogUtil.debug(`Removed Tokens from session storage`);
    StorageUtil.remove("-token");
  }
}

function deleteAuthResultsFiltered(
  authResultFilter?: (authResult: Readonly<AuthResult>) => boolean,
): void {
  const allAuthResults = getStoredAuthResults();
  const authResultsToStore = allAuthResults.filter(authResultFilter);
  storeAuthResults(authResultsToStore);
}

function createAuthResultKey() {
  return `${OidcConfigService.config.client_id}-authResult`;
}

/**
 * Get all auth results stored in session Storage in an Array
 */
function getStoredAuthResults(): AuthResult[] {
  const storedAuthResults = StorageUtil.read(createAuthResultKey());
  if (!storedAuthResults) {
    return [];
  }
  return JSON.parse(storedAuthResults);
}

/**
 * Stores an array of auth results to the session Storage
 */
function storeAuthResults(authResults: AuthResult[]): void {
  LogUtil.debug("Saved Auth Results to session storage");
  StorageUtil.store(createAuthResultKey(), JSON.stringify(authResults));
}

/**
 * Compare the expiry time of a stored auth result with the current time.
 * If the auth results has expired, remove it from the array.
 * If something was removed from the Array, cleanup the session storage by re-saving the cleaned auth results array.
 *
 * @returns the cleaned array.
 */
function cleanExpiredAuthResults(storedAuthResults: AuthResult[]): AuthResult[] {
  const time = GeneratorUtil.epoch();
  const cleanAuthResults = storedAuthResults.filter((element: AuthResult) => {
    return element.expires && element.expires > time + 5;
  });

  if (storedAuthResults.length > cleanAuthResults.length) {
    LogUtil.debug("Updated auth results storage after clean.");
    storeAuthResults(cleanAuthResults);
  }

  return cleanAuthResults;
}

/**
 * @param requiredScopes the scopes which must be present in the auth results.
 * @returns A function to check if an auth result has the specified scopes.
 */
export function tokenHasRequiredScopes(
  requiredScopes: string[],
): (authResult: AuthResult) => boolean {
  return function checkScopes(authResult: AuthResult): boolean {
    if (!authResult.access_token) {
      return false;
    }
    const { payload: accessToken } = parseJwt(authResult.access_token);
    // All scopes must specified in the scopes and context must be represented in the token
    if (
      !requiredScopes.every((requiredScope) =>
        accessToken.scope.some(
          (accessTokenScope) => accessTokenScope === requiredScope,
        ),
      )
    ) {
      return false;
    }

    return true;
  };
}

/**
 *
 * @param authResults the tokens to be filtered
 * @param tokenValidationOptions possible extra validation on a token
 * @param returnValidTokens if the filter should return the invalid or valid tokens.
 * @returns the filtered tokens.
 */
function filterAuthResults(
  authResults: AuthResult[],
  tokenValidationOptions?: TokenValidationOptions,
): AuthResult[] {
  const scopes =
    tokenValidationOptions?.scopes ??
    transformScopesStringToArray(OidcConfigService.config.scope);
  const checkScopes = tokenHasRequiredScopes(scopes);
  const relevantTokens = authResults.filter(checkScopes);
  if (tokenValidationOptions?.customTokenValidator) {
    return relevantTokens.filter(tokenValidationOptions.customTokenValidator);
  }
  return relevantTokens;
}

/**
 * Gets a valid, non-expired token from session storage given a set of validators.
 *
 * @param tokenValidationOptions the required scopes and other validators
 * @returns A valid Token or `null` if no token has been found.
 */
export function getStoredAuthResult(
  tokenValidationOptions?: TokenValidationOptions,
): AuthResult | null {
  // Get the tokens from storage, and make sure they're still valid
  const tokens = getStoredAuthResults();
  const tokensUnexpired = cleanExpiredAuthResults(tokens);
  const tokensFiltered = filterAuthResults(tokensUnexpired, tokenValidationOptions);

  // If there's no valid token return null
  if (tokensFiltered.length < 1) {
    LogUtil.debug("No valid token found in storage");
    return null;
  }
  // Return the first valid token
  return tokensFiltered[0];
}

/**
 * * Get the current Stored tokens
 * * Separately save the ID Token, as a hint for when the access token gets cleaned. This will help logout.
 * * Set the tokens expiry time. Current time in seconds + (token lifetime in seconds - x seconds)
 * * Put the new token to the beginning of the array, so it's the first one returned
 * * Clean expired tokens from the Array
 * * Save the new token array
 * * Return the cleaned set of Tokens
 */
export function storeToken(authResult: AuthResult): void {
  const tokens = getStoredAuthResults();

  if (authResult.id_token) {
    storeIdToken(authResult.id_token);
  }

  authResult.expires = authResult.expires_in
    ? GeneratorUtil.epoch() + (parseInt(authResult.expires_in, 10) - 30)
    : undefined;
  tokens.unshift(authResult);
  const tokensCleaned = cleanExpiredAuthResults(tokens);
  storeAuthResults(tokensCleaned);
}

function createIdTokenHintKey(): string {
  return `${OidcConfigService.config.client_id}-id-token-hint`;
}

/**
 * Get the saved id_token_hint string for the current instance from storage
 * Used when you need to check the if your logged in or not without using access-tokens as a reference
 *
 * Pass the `{regex: true}` option, to search for any ID Token Hint by regex
 * During logout, the regex option should be enabled if we are not sure that the *client_id* will remain stable.
 */
export function getIdTokenHint(options = { regex: false }): string | null {
  if (options.regex) {
    const regex = new RegExp(/-id-token-hint/);
    const storageArray = Object.keys(StorageUtil.storage).filter((key) =>
      regex.test(key),
    );
    return storageArray.length > 0 ? StorageUtil.read(storageArray[0]) : null;
  }
  return StorageUtil.read(createIdTokenHintKey());
}

/**
 * Saves the ID token hint to sessionStorage
 */
export function storeIdToken(idTokenHint: string): void {
  StorageUtil.store(createIdTokenHintKey(), idTokenHint);
}

/**
 * Deletes the ID token hint from sessionStorage
 */
export function deleteIdTokenHint(): void {
  StorageUtil.remove("-id-token-hint");
}

/**
 * Deletes the stored CSRF Token from storage
 */
export function deleteStoredCsrfToken(): void {
  LogUtil.debug(`Removed CSRF Token from session storage`);
  StorageUtil.remove("_csrf");
}

/**
 * Gets the stored CSRF Token from storage
 */
export function getStoredCsrfToken(): string | null {
  LogUtil.debug(`Get CSRF Token from session storage`);
  return StorageUtil.read("_csrf");
}

/**
 * Get a CSRF Token from the authorisation server
 */
export function getCsrfToken(): Promise<CsrfToken> {
  LogUtil.debug("Get CSRF token from Authorisation");

  return new Promise<CsrfToken>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", OidcConfigService.config.csrf_token_endpoint, true);
    xhr.withCredentials = true;
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText) as CsrfToken);
        } else {
          reject(xhr.statusText);
        }
      }
    };
    xhr.send();
  });
}
