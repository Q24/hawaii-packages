import { Token } from "../jwt/model/token.model";
import { URLParams } from "../models/url-param.models";

/**
 * Return an object with URL parameters
 * @param url
 * @returns The URL parameters
 */
export function getURLParameters(
  url: string = window.location.href,
): URLParams {
  const result: URLParams = {};
  const searchIndex = url.indexOf("?");
  const hashIndex = url.indexOf("#");

  if (searchIndex === -1 && hashIndex === -1) {
    return result;
  }

  const urlStringToParse = getUrlStringToParse(url, searchIndex, hashIndex);

  const urlVariablesToParse = urlStringToParse.split("&");

  for (const urlVar of urlVariablesToParse) {
    const parameter = urlVar.split("=");
    result[parameter[0]] = parameter[1];
  }

  return result;
}

function getUrlStringToParse(
  url: string,
  searchIndex: number,
  hashIndex: number,
): string {
  if (hashIndex !== -1) {
    return url.substring(hashIndex + 1);
  }
  return url.substring(searchIndex + 1);
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
 * Based on a URL containing a hash fragment, gets a new URL without this fragment.
 *
 * Useful if the URL contains a hash fragment which should be stripped. URL could contain
 * an *access_token* when a user uses the *BACK* button in the browser.
 *
 * @param url the URL containing the hash fragment
 * @returns the URL without the hash fragment
 */
export function cleanHashFragment(url: string): string {
  return url.split("#")[0];
}
