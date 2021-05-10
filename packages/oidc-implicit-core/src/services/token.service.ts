import { StorageUtil } from "../utils/storageUtil";
import { LogUtil } from "../utils/logUtil";
import {
  CsrfToken,
  Token,
  TokenValidationOptions,
} from "../models/token.models";
import { GeneratorUtil } from "../utils/generatorUtil";
import { OidcConfigService } from "./config.service";
import { parseJwt } from "../utils/jwtUtil";
import { transformScopesStringToArray } from "../utils/scopeUtil";

/**
 * Deletes all the tokens from the storage.
 * If tokenFilter is passed in, only a subset will be deleted.
 *
 * @param tokenFilter if specified, the custom token validator
 * is called for every token in the store. If a tokenFilter callback
 * returns true, the token will remain in the store. Otherwise, it
 * will be deleted (Just like Array.prototype.filter())
 */
export function deleteStoredTokens(
  tokenFilter?: (token: Readonly<Token>) => boolean,
): void {
  if (tokenFilter) {
    deleteTokensFiltered(tokenFilter);
  } else {
    LogUtil.debug(`Removed Tokens from session storage`);
    StorageUtil.remove("-token");
  }
}

function deleteTokensFiltered(
  tokenFilter?: (token: Readonly<Token>) => boolean,
): void {
  const allTokens = getStoredTokens();
  const tokensToStore = allTokens.filter(tokenFilter);
  storeTokens(tokensToStore);
}

function createTokenKey() {
  return `${OidcConfigService.config.client_id}-token`;
}

/**
 * Get all token stored in session Storage in an Array
 */
function getStoredTokens(): Token[] {
  const storedTokens = StorageUtil.read(createTokenKey());
  if (!storedTokens) {
    return [];
  }
  return JSON.parse(storedTokens);
}

/**
 * Stores an array of Tokens to the session Storage
 */
function storeTokens(tokens: Token[]): void {
  LogUtil.debug("Saved Tokens to session storage");
  StorageUtil.store(createTokenKey(), JSON.stringify(tokens));
}

/**
 * Compare the expiry time of a stored token with the current time.
 * If the token has expired, remove it from the array.
 * If something was removed from the Array, cleanup the session storage by re-saving the cleaned token array.
 *
 * @returns the cleaned array.
 */
function cleanExpiredTokens(storedTokens: Token[]): Token[] {
  const time = GeneratorUtil.epoch();
  const cleanTokens = storedTokens.filter((element: Token) => {
    return element.expires && element.expires > time + 5;
  });

  if (storedTokens.length > cleanTokens.length) {
    LogUtil.debug("Updated token storage after clean.");
    storeTokens(cleanTokens);
  }

  return cleanTokens;
}

/**
 * @param requiredScopes the scopes which must be present in the token.
 * @returns A function to check if a token has the specified scopes.
 */
export function tokenHasRequiredScopes(
  requiredScopes: string[],
): (token: Token) => boolean {
  return function checkScopes(token: Token): boolean {
    if (!token.access_token) {
      return false;
    }
    const accessToken = parseJwt(token.access_token);
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
 * @param tokens the tokens to be filtered
 * @param tokenValidationOptions possible extra validation on a token
 * @param returnValidTokens if the filter should return the invalid or valid tokens.
 * @returns the filtered tokens.
 */
function filterTokens(
  tokens: Token[],
  tokenValidationOptions?: TokenValidationOptions,
): Token[] {
  const scopes =
    tokenValidationOptions?.scopes ??
    transformScopesStringToArray(OidcConfigService.config.scope);
  const checkScopes = tokenHasRequiredScopes(scopes);
  const relevantTokens = tokens.filter(checkScopes);
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
export function getStoredToken(
  tokenValidationOptions?: TokenValidationOptions,
): Token | null {
  // Get the tokens from storage, and make sure they're still valid
  const tokens = getStoredTokens();
  const tokensUnexpired = cleanExpiredTokens(tokens);
  const tokensFiltered = filterTokens(tokensUnexpired, tokenValidationOptions);

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
export function storeToken(token: Token): void {
  const tokens = getStoredTokens();

  if (token.id_token) {
    saveIdTokenHint(token.id_token);
  }

  token.expires = token.expires_in
    ? GeneratorUtil.epoch() + (parseInt(token.expires_in, 10) - 30)
    : undefined;
  tokens.unshift(token);
  const tokensCleaned = cleanExpiredTokens(tokens);
  storeTokens(tokensCleaned);
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
export function saveIdTokenHint(idTokenHint: string): void {
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
