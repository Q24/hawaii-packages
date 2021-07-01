import type { JsonWebKeySet } from "../jwt/model/jwk.model";
import { OidcConfigService } from "../services/config.service";
import { LogUtil } from "../utils/logUtil";
import { getOpenIdProviderMetadata } from "./getOpenIdConfiguration";

function fetchJwks(): Promise<JsonWebKeySet> {
  return new Promise<JsonWebKeySet>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", OidcConfigService.config.providerMetadata.jwks_uri, true);

    xhr.withCredentials = true;

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 204) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(xhr.statusText);
        }
      }
    };
    xhr.send();
  });
}

/**
 * Gets the remote JsonWebKeySet; Sets the local JsonWebKeySet
 *
 * @returns the JsonWebKeySet
 */
export async function getRemoteJwks(): Promise<JsonWebKeySet> {
  const providerMetadata = await getOpenIdProviderMetadata();
  if (!providerMetadata.jwks_uri) {
    LogUtil.error(
      "No JWKS URI found in OpenID Provider Metadata",
      providerMetadata,
    );
    throw Error("no_jwks_uri");
  }
  const jwks = await fetchJwks();
  OidcConfigService.config.jwks = jwks;

  return jwks;
}

/**
 * tries to get the local jwks; if not found, get the remote jwks.
 *
 * @returns the jwks
 */
export async function getJwks(): Promise<JsonWebKeySet> {
  if (OidcConfigService.config.jwks) {
    return OidcConfigService.config.jwks;
  }
  return getRemoteJwks();
}
