import {Token, URLParams} from '../models';
import {OidcService} from '../oidc.service';
import {HttpParams} from '@angular/common/http';
import {StorageUtils} from './index';

export class UrlUtils {
  /**
   * Return an object with URL parameters
   * @param {string} url
   * @returns {URLParams}
   */
  static getURLParameters(url: string = window.location.href): URLParams {

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

    // TODO: Debug - this._log('URL params', result);

    return result;
  }

  /**
   * Convert Object to URL Query string
   * @param {Object} urlVars
   * @returns {string}
   */
  static createURLParameters(urlVars: Object): string {
    let params = new HttpParams();

    // Set the new Query string params.
    for (const key in urlVars) {
      if (urlVars.hasOwnProperty(key)) {

        if (key === 'redirect_uri') {
          urlVars[key] = UrlUtils._cleanHashFragment(urlVars[key]);
        }

        params = params.set(key, urlVars[key]);
      }
    }

    return params.toString();
  }

  /**
   * Get Hash Fragment parameters from sessionStorage
   * @param {string} hash_fragment
   * @returns {Token}
   * @private
   */
  static getHashFragmentParameters(hash_fragment: string): Token {

    const result = {};
    let urlVariablesToParse;

    if (hash_fragment) {
      urlVariablesToParse = hash_fragment.split('&');

      for (const urlVar of urlVariablesToParse) {
        const parameter = urlVar.split('=');
        result[parameter[0]] = parameter[1];
      }

      // TODO: Debug - this._log('Hash Fragment params from sessionStorage', result);
    }

    return result;
  }

  /**
   * Strip the hash fragment if it contains an access token (could happen when people use the BACK button in the browser)
   */
  private static _cleanHashFragment(url: string): string {
    return url.split('#')[0];
  }
}
