import { StorageUtil } from '../utils/storageUtil';
import { LogUtil } from '../utils/logUtil';
import { CsrfToken, Token } from '../models/token.models';
import { GeneratorUtil } from '../utils/generatorUtil';
import ConfigService from '../services/config.service';

export class TokenService {

  /**
   * Delete all tokens in sessionStorage for this session.
   * @param {providerId} string
   * @returns { void }
   */
  static deleteStoredTokens(providerId = `${ConfigService.config.provider_id}`): void {
    LogUtil.debug(`Removed Tokens from session storage: ${providerId}`);
    StorageUtil.remove(`${providerId}-token`);
  }

  /**
   * Get the saved session ID string from storage
   * Used when you need to check the if your logged in or not without using access-tokens as a referance
   * @returns {string | null}
   */
  static getIdTokenHint(): string | null {
    return StorageUtil.read(`${ConfigService.config.provider_id}-id-token-hint`);
  }

  /**
   * Get all token stored in session Storage in an Array
   * @returns {Token[]}
   * @private
   */
  static getStoredTokens(): Token[] {
    const storedTokens = StorageUtil.read(`${ConfigService.config.provider_id}-token`);
    return JSON.parse(storedTokens) || [];
  }

  /**
   * Stores an array of Tokens to the session Storage
   * @param {Token[]} tokens
   * @private
   */
  static storeTokens(tokens: Token[]): void {
    LogUtil.debug('Saved Tokens to session storage');
    StorageUtil.store(`${ConfigService.config.provider_id}-token`, JSON.stringify(tokens));
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
  static cleanExpiredTokens(storedTokens: Token[]): Token[] {
    let cleanTokens: Token[];
    const time = GeneratorUtil.epoch();

    if (storedTokens.length > 0) {
      cleanTokens = storedTokens.filter((element: Token) => {
        return element.expires && element.expires > time + 5;
      });

      if (storedTokens.length > cleanTokens.length) {
        LogUtil.debug('Updated token storage after clean.');
        TokenService.storeTokens(cleanTokens);
      }
    }

    return cleanTokens || [];
  }

  /**
   * Get a validated, not expired token from sessionStorage
   * @returns {Token}
   */
  static getStoredToken(): Token | null {
    // Get the tokens from storage, and make sure they're still valid
    const tokens = TokenService.getStoredTokens();
    const tokensCleaned = TokenService.cleanExpiredTokens(tokens);

    // If there's no valid token return null
    if (tokensCleaned.length < 1) {

      LogUtil.debug('No valid token found in storage');
      return null;
    }
    // Return the first valid token
    return tokensCleaned[0];
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
  static storeToken(token: Token): void {
    const tokens = TokenService.getStoredTokens();

    let tokensCleaned;

    if (token.id_token) {
      TokenService.saveIdTokenHint(token.id_token);
    }

    token.expires = token.expires_in ? GeneratorUtil.epoch() + (parseInt(token.expires_in, 10) - 30) : undefined;
    tokens.unshift(token);
    tokensCleaned = TokenService.cleanExpiredTokens(tokens);
    TokenService.storeTokens(tokensCleaned);
  }

  /**
   * Saves the ID token hint to sessionStorage
   * @private
   * @param idTokenHint
   */
  static saveIdTokenHint(idTokenHint: string): void {
    StorageUtil.store(`${ConfigService.config.provider_id}-id-token-hint`, idTokenHint);
  }

  /**
   * Deletes the ID token hint from sessionStorage
   * @private
   */
  static deleteIdTokenHint(providerId = `${ConfigService.config.provider_id}`): void {
    StorageUtil.remove(`${providerId}-id-token-hint`);
  }

  /**
   * Deletes the stored CSRF Token from storage
   * @private
   */
  static deleteStoredCsrfToken(): void {
    LogUtil.debug(`Removed CSRF Token from session storage`);
    StorageUtil.remove(`_csrf`);
  }

  /**
   * Get a CSRF Token from the Authorisation
   */
  static getCsrfToken(): Promise<CsrfToken> {
    LogUtil.debug('Get CSRF token from Authorisation');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.open('POST', ConfigService.config.csrf_token_endpoint, true);
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
      xhr.send(null);
    }) as Promise<CsrfToken>;
  }
}
