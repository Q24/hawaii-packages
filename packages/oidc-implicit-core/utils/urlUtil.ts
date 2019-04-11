import { Token } from '../models/token.models';
import { URLParams } from '../models/url-param.models';

export class UrlUtil {
  /**
   * Return an object with URL parameters
   * @param {string} url
   * @returns {URLParams}
   */
  static getURLParameters(url: string = window.location.href): URLParams {

    const result = {};
    const searchIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    let urlStringToParse;
    let urlVariablesToParse;

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

    return result;
  }

  /**
   * Convert Object to URL Query string
   * @param {Object} urlVars
   * @returns {string}
   */
  static createURLParameters(urlVars: Object): string {
    const params = new URLSearchParams();

    // Set the new Query string params.
    for (const key in urlVars) {
      if (urlVars.hasOwnProperty(key)) {

        if (key === 'redirect_uri') {
          urlVars[key] = UrlUtil.cleanHashFragment(urlVars[key]);
        }

        params.set(key, urlVars[key]);
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
    }

    return result;
  }

  /**
   * Strip the hash fragment if it contains an access token (could happen when people use the BACK button in the browser)
   */
  private static cleanHashFragment(url: string): string {
    return url.split('#')[0];
  }
}