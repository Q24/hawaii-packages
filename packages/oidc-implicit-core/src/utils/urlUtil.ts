import { Token } from "../models/token.models";
import { URLParams } from "../models/url-param.models";

/**
 * Return an object with URL parameters
 * @param {string} url
 * @returns {URLParams}
 */
export function getURLParameters(
  url: string = window.location.href
): URLParams {
  const result: URLParams = {};
  const searchIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");
  let urlStringToParse;

  if (searchIndex === -1 && hashIndex === -1) {
    return result;
  }

  if (searchIndex !== -1) {
    urlStringToParse = url.substring(searchIndex + 1);
  }

  if (hashIndex !== -1) {
    urlStringToParse = url.substring(hashIndex + 1);
  }

  const urlVariablesToParse = urlStringToParse.split("&");

  for (const urlVar of urlVariablesToParse) {
    const parameter = urlVar.split("=");
    result[parameter[0]] = parameter[1];
  }

  return result;
}

/**
 * Convert Object to URL Query string
 * @param {Object} urlVars
 * @returns {string}
 */
export function createURLParameters(urlVars: {
  redirect_uri?: string;
}): string {
  if (urlVars.redirect_uri) {
    urlVars.redirect_uri = cleanHashFragment(urlVars.redirect_uri);
  }
  const params = [];
  for (const urlVar of Object.keys(urlVars)) {
    params.push(`${urlVar}=${urlVars[urlVar]}`);
  }
  return params.join("&");
}

/**
 *
 * Get Hash Fragment parameters from sessionStorage
 * @param {string} hash_fragment
 * @returns {Token}
 */
export function getHashFragmentParameters(hash_fragment: string): Token {
  const result = {};
  let urlVariablesToParse;

  if (hash_fragment) {
    urlVariablesToParse = hash_fragment.split("&");

    for (const urlVar of urlVariablesToParse) {
      const parameter = urlVar.split("=");
      result[parameter[0]] = parameter[1];
    }
  }

  return result;
}

/**
 * Strip the hash fragment from the URL.
 * The URL could contain an *access_token* when a user uses the *BACK* button in the browser.
 *
 * @returns The cleaned URL
 */
export function cleanHashFragment(url: string): string {
  return url.split("#")[0];
}
