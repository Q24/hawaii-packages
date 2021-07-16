import { ImplicitAuthorizationRequest } from "../model/implicit-request-parameters.model";
import { GeneratorUtil } from "../../utils/generatorUtil";
import { LogUtil } from "../../utils/logUtil";
import { getNonce, saveNonce } from "../../utils/nonceUtil";
import { getState, saveState } from "../../utils/stateUtil";
import { config } from "../../configuration/config.service";

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
): ImplicitAuthorizationRequest {
  const storedState = getState() || GeneratorUtil.generateState();
  const authorizeParams: ImplicitAuthorizationRequest = {
    nonce: getNonce() || GeneratorUtil.generateNonce(),
    state: storedState,
    client_id: config.client_id,
    response_type: config.response_type,
    redirect_uri:
      promptNone && config.silent_refresh_uri
        ? config.silent_refresh_uri
        : config.redirect_uri,
    scope: scopes.join(" "),
  };

  if (config.login_hint) {
    authorizeParams.login_hint = config.login_hint;
  }

  if (promptNone) {
    authorizeParams.prompt = "none";
  }

  // Save the generated state & nonce
  saveState(storedState);
  saveNonce(authorizeParams.nonce);

  LogUtil.debug("Gather the Authorize Params", authorizeParams);
  return authorizeParams;
}
