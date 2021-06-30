import { OpenIDProviderMetadata } from "../models/open-id-provider-metadata.models";
import { OidcConfigService } from "../services/config.service";

/**
 * OpenID Providers supporting Discovery MUST make a JSON document available at
 * the path formed by concatenating the string /.well-known/openid-configuration
 * to the Issuer. The syntax and semantics of .well-known are defined in RFC
 * 5785 [RFC5785] and apply to the Issuer value when it contains no path
 * component. openid-configuration MUST point to a JSON document compliant with
 * this specification and MUST be returned using the application/json content
 * type.
 */
export function getOpenIdConfiguration(): Promise<OpenIDProviderMetadata> {
  const openIdConfigurationUrl = `${OidcConfigService.config.issuer}/.well-known/openid-configuration`;

  return new Promise<OpenIDProviderMetadata>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("GET", openIdConfigurationUrl, true);

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
