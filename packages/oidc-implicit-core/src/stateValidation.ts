import type { Token } from "./jwt/model/token.model";
import { LogUtil } from "./utils/logUtil";
import { getState } from "./utils/stateUtil";

export function validateTokenState(token: Token): void {
  LogUtil.debug("Access Token found in session storage temp, validating it");
  const stateObj = getState();

  // We received a token from SSO, so we need to validate the state
  if (!stateObj || token.state !== stateObj.state) {
    LogUtil.error("Authorisation Token not valid");
    LogUtil.debug("State NOT valid");
    throw Error("token_state_invalid");
  }

  LogUtil.debug(
    "State from URL validated against state in session storage state object",
    stateObj,
  );
}
