import { getAllAuthResultFilters } from "../auth-result-filter/all-filters";
import { config } from "../configuration/config.service";
import { assertProviderMetadata } from "../discovery/assert-provider-metadata";
import { AuthResult } from "../jwt/model/auth-result.model";
import { AuthValidationOptions } from "../jwt/model/auth-validation-options.model";
import { state } from "../state/state";
import { LogUtil } from "../utils/logUtil";
import { transformScopesStringToArray } from "../utils/scopeUtil";
import { StorageUtil } from "../utils/storageUtil";
import {
  createURLParameters,
  getURLParameters,
  hashFragmentToAuthResult,
} from "../utils/urlUtil";
import { getAuthorizeParams } from "./utils/authorize-params";
import { destroyIframe } from "./utils/iframe";
import { validateAndStoreAuthResult } from "./utils/validate-store-auth-result";

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
  [iFrameId: string]: Promise<AuthResult>;
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
export function silentRefresh(
  authValidationOptions?: AuthValidationOptions,
): Promise<AuthResult> {
  const scopes: string[] =
    authValidationOptions?.scopes ??
    transformScopesStringToArray(config.scope);
  LogUtil.debug("Silent refresh started");

  const iFrameId = `silentRefreshAccessTokenIframe-${scopes
    .slice()
    .sort()
    .join("-")}`;

  // If there is a concurrent request to this function, return a singleton promise.
  if (silentRefreshStore[iFrameId]) {
    return silentRefreshStore[iFrameId];
  }
  const tokenPromise = new Promise<AuthResult>((resolve, reject) => {
    assertProviderMetadata(state.providerMetadata);
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
        state.providerMetadata.authorization_endpoint
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
      const hashAuthResult = hashFragmentToAuthResult(
        iFrame.contentWindow!.location.href.split("#")[1],
      );

      // Clean the hashfragment from storage
      if (hashAuthResult) {
        LogUtil.debug(
          "Hash Fragment params from sessionStorage",
          hashAuthResult,
        );
        StorageUtil.remove("hash_fragment");
      }

      if (hashAuthResult.access_token && hashAuthResult.state) {
        LogUtil.debug(
          "Access Token found in silent refresh return URL, validating it",
        );

        validateAndStoreAuthResult(hashAuthResult).then((authResult) => {
          const passesAuthResultFilters =
            getAllAuthResultFilters(
              authValidationOptions?.extraAuthFilters,
            )?.every((filter) => filter(authResult)) ?? true;
          LogUtil.debug(
            "Passes Auth Result Filters:",
            passesAuthResultFilters,
            authResult,
          );
          if (passesAuthResultFilters) {
            resolve(hashAuthResult);
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
