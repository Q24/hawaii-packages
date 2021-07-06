import { OidcConfigService } from "../../configuration/config.service";
import { ImplicitRequestParameters } from "../model/implicit-request-parameters.model";
import { GeneratorUtil } from "../../utils/generatorUtil";
import { LogUtil } from "../../utils/logUtil";
import { getNonce, saveNonce } from "../../utils/nonceUtil";
import { getState, saveState } from "../../utils/stateUtil";

/**
 * Gather the URL params for Authorize redirect method
 *
 * @param scopes the scopes to authorise for.
 * @param promptNone If true, the user will not be asked to
 * authorise this app. If no authentication is required,
 * the user will not be asked with any configuration.
 * @returns the parameters to use for an authorise request
 */
export function getAuthorizeParams(
  scopes: string[],
  promptNone = false,
): ImplicitRequestParameters {
  const storedState = getState() || GeneratorUtil.generateState();
  const urlVars: ImplicitRequestParameters = {
    nonce: getNonce() || GeneratorUtil.generateNonce(),
    state: storedState,
    client_id: OidcConfigService.config.client_id,
    response_type: OidcConfigService.config.response_type,
    redirect_uri:
      promptNone && OidcConfigService.config.silent_refresh_uri
        ? OidcConfigService.config.silent_refresh_uri
        : OidcConfigService.config.redirect_uri,
    scope: scopes.join(" "),
  };

  if (promptNone) {
    urlVars.prompt = "none";
  }

  // Save the generated state & nonce
  saveState(storedState);
  saveNonce(urlVars.nonce);

  LogUtil.debug("Gather the Authorize Params", urlVars);
  return urlVars;
}
