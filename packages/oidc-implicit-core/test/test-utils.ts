import { OidcService } from "../src/index";
import { constants } from "./constants";

export function initConfig() {
  OidcService.OidcConfigService.config = {
    client_id: constants.client_id,
    response_type: "id_token token",
    redirect_uri: "localhost",
    restricted_redirect_uris: [],
    post_logout_redirect_uri: "post_logout_redirect_uri",
    scope: "email openid",
    token_type: "token_type",
    csrf_token_endpoint: "csrf_token_endpoint",
    validate_token_endpoint: "validate_token_endpoint",
    is_session_alive_endpoint: "is_session_alive_endpoint",
    upgrade_session_endpoint: "upgrade_session_endpoint",
    login_endpoint: "login_endpoint",
    twofactor_endpoint: "twofactor_endpoint",
    twofactor_msisdn_endpoint: "twofactor_msisdn_endpoint",
    twofactor_msisdn_reset: "twofactor_msisdn_reset",
    logout_endpoint: "logout_endpoint",
    issuer: "",
  };
}
